import { Meteor } from "meteor/meteor";
import { sendEmail } from "./email";
import { analyze, isEarlier, isLater, isLonger, trimEvents, reverse, fromLocalToUTC /*, getNextTime */} from "./utils";
import config from "../../nudge-config.json";

export const loadBuzytime = (user, min, max) => new Promise((resolve, reject) => {
	GoogleApi.post("/calendar/v3/freeBusy", {
		user,
		data: {
			timeMax: `${max}`,
			timeMin: `${min}`,
			items: [{ id: "primary" }]
		}
	}, (err, res) => {
		if (err || !res.calendars || !res.calendars.primary) {
			reject(err);
		}

		resolve(res.calendars.primary.busy);
	});
});

// Server environment - UTC time
export const processEvents = async (events, user=Meteor.user(), send=true) => {
	if (events && events.items) {
		// Initialize variables
		events = trimEvents(events.items);
		const profile = user.nudgeProfile;
		const lastSuggestion = profile.lastSuggestion;
		const timezone = profile.timezone || null;
		const min = fromLocalToUTC(`${config.suggestion.start}:00`, timezone).format();
		const max = fromLocalToUTC(`${config.suggestion.end}:00`, timezone).format();
		let busy = null;
		let suggestion = {
			time: null,
			title: null,
		};

		// events.forEach(e => console.log(e));

		// Load busy time async
		try {
			busy = await loadBuzytime(user, min, max);
		} catch (e) {
			console.log(`Error occurred: ${e}`);
		}

		// Get largest free time
		const time = reverse(busy, min, max).reduce((prev, next) => {
			return (new Date(prev.end).getTime() - new Date(prev.start).getTime()) > (new Date(next.end).getTime() - new Date(next.start).getTime())
				? prev
				: next;
		});

		// Null if it's less than 1 hour
		suggestion.time = (new Date(time.end).getTime() - new Date(time.start).getTime()) < 1000 * 60 * 60 ? null : time;

		// Get yesterday's planned event, for next suggestion.
		if (lastSuggestion != null) {
			const start = new Date(lastSuggestion.start || "");
			const end = new Date(lastSuggestion.end || "");
			const event = events.find(e => 
				new Date(e.start.dateTime).getHours() == start.getHours()
					&& new Date(e.start.dateTime).getMinutes() == start.getMinutes()
					&& new Date(e.end.dateTime).getHours() == end.getHours()
					&& new Date(e.end.dateTime).getMinutes() == end.getMinutes()
			);

			if (event) {
				suggestion.title = event.summary || "";
			}
		}

		if (send) {
			sendEmail(suggestion, user);
		}
	
		console.log(`----- Suggestion built up for ${user.services.google.name} -----`);
		console.log(suggestion);
		console.log(`----- End of Suggestion built up for ${user.services.google.name} -----`);
		Meteor.call("updateLastSuggestion", user._id, suggestion.time);
		return suggestion;
	}
	
	return null;
};

// Browser environment - local time applies to the Date Time.
export const loadUserPastData = (id = Meteor.user()._id) => new Promise((resolve, reject) => {
	GoogleApi.get("/calendar/v3/calendars/primary/events", {
		params: {
			timeMax: new Date().toISOString(),
			timeMin: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
		}
	}, (err, res) => {
		if (err) {
			reject(err);
		}

		let events = res.items;
		let profile = {
			counts: 0,
			countsOnDays: [0, 0, 0, 0, 0, 0, 0],	// index 0 represents Sunday
			earliest: null,
			latest: null,
			longest: null,
			timezone: TimezonePicker.detectedZone(),
			lastSuggestion: null
		};

		events = trimEvents(events);
		events.forEach(e => {
			try {
				const curStart = new Date(e.start.dateTime);
				const curEnd = new Date(e.end.dateTime);
				profile.countsOnDays[curStart.getDay()]++;
				profile.counts++;

				if (profile.earliest == null || isEarlier(new Date(profile.earliest.start.dateTime), curStart)) {
					profile.earliest = e;
				}

				if (profile.latest == null || isLater(new Date(profile.latest.end.dateTime), curEnd)) {
					profile.latest = e;
				}

				if (profile.longest == null || isLonger(profile.longest, e)) {
					profile.longest = e;
				}
			} catch(error) {
				console.log(error);
				return;
			}
		});

		profile = analyze(profile, config);

		Meteor.call("updateProfile", id, profile, (err, res) => {
			if (err) {
				reject(err);
			}

			resolve(res);
		});
	});
});

Meteor.methods({
	"updateProfile"(id, profile) {
		Meteor.users.update({ _id: id }, {
			$set: {
				"nudgeProfile": profile
			}
		});
	},

	"updateLastSuggestion"(id, time) {
		Meteor.users.update({ _id: id }, {
			$set: {
				"nudgeProfile.lastSuggestion": time
			}
		});
	},
});