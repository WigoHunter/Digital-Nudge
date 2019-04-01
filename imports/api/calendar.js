import { Meteor } from "meteor/meteor";
import { sendEmail } from "./email";
import { analyze, isEarlier, isLater, isLonger, trimEvents } from "./utils";
import config from "../../nudge-config.json";

// Server environment - UTC time
export const eventsToday = (events, user=Meteor.user(), send=true) => {
	if (events && events.items) {
		events = trimEvents(events.items);
		let suggestion = [];

		events.forEach(e => {
			console.log(e);
		});

		if (send) {
			sendEmail(suggestion, user);
		}
	
		return events;
	}
	
	return [];
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
			timezone: TimezonePicker.detectedZone()
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
	}
});