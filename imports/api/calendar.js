import { Meteor } from "meteor/meteor";
import jstz from "jstz";
import { sendEmail } from "./email";
import { calcEventsSpan, analyze, isEarlier, isLater, isLonger, trimEvents, reverse, fromLocalToUTC /*, getNextTime */} from "./utils";
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
		const span = calcEventsSpan(events);
		const newUser = user.newUser;
		const profile = user.nudgeProfile;
		const lastSuggestion = profile.lastSuggestion;
		const timezone = profile.timezone || null;
		const min = fromLocalToUTC(`${config.suggestion.start}:00`, timezone).format();
		const max = fromLocalToUTC(`${config.suggestion.end}:00`, timezone).format();
		let busy = null;
		let suggestion = {
			time: null,
			title: config.defaults.title,
			span: span,
		};

		if (newUser) {
			console.log(`----- New User ${user.services.google.name} detected -----`);
			trackPastWeekEventSpan(user);
		} else {
			console.log(`----- Old User ${user.services.google.name} detected -----`);
			let spanForPastWeek = user.spanForPastWeek;
			spanForPastWeek.shift();
			spanForPastWeek.push(span);
			console.log(`----- ${user.services.google.name} \'s spanning hours for last week events -----`);
			console.log(spanForPastWeek);
			Meteor.call("updateSpanForLastWeek", user._id, spanForPastWeek);
		}

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
				suggestion.title = event.summary || config.defaults.title;
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
			timezone: jstz.determine().name(),
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

const trackPastWeekEventSpan = (user) =>  {
	GoogleApi.get("/calendar/v3/calendars/primary/events", {
		user,
		params: {
			timeMax: new Date().toISOString(),
			timeMin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
		}
	}, (err, res) => {
		if (err) {
			return new Array(7).fill(0);
		}

		let events = res.items;
		events = trimEvents(events);

		let timestamps = []
		for (let i = 0; i < events.length; i++){
			timestamps.push({
				startTime : moment(events[i].start.dateTime),
				duration : moment.duration(moment(events[i].end.dateTime).diff(
					moment(events[i].start.dateTime)))
			})
		}

		timestamps.sort((a,b) => {
			if (a.startTime.isBefore(b.startTime)){
				return 1;
			}
			return -1;
		});

		let currTime = moment();
		let ydaTime = moment(currTime);
		ydaTime.subtract(1, 'days');
		let idx = 0;
		let spanForPastWeek = new Array(7).fill(0);

		for (let i = 0; i < 7; i++){
			let hrsCnt = 0;
			while (idx < timestamps.length) {
				tmp = timestamps[idx].startTime;
				if (tmp.isBefore(currTime) && ydaTime.isBefore(tmp)){
					hrsCnt += timestamps[idx].duration.hours();
					idx += 1;
				} else {
					break;
				}
			}

			spanForPastWeek[6-i] = hrsCnt;
			currTime.subtract(1, 'days');
			ydaTime.subtract(1, 'days');
		}
		
		console.log(`----- ${user.services.google.name} \'s spanning hours for last week events -----`);
		console.log(spanForPastWeek);
		Meteor.call("updateSpanForLastWeek", user._id, spanForPastWeek);
		Meteor.call("setUserToOld", user._id);
	});
}

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

	"updateSpanForLastWeek"(id, spanForPastWeek) {
		Meteor.users.update({ _id: id }, {
			$set: {
				"spanForPastWeek": spanForPastWeek
			}
		});
	},

	"setUserToOld"(id) {
		Meteor.users.update({ _id: id }, {
			$set: {
				"newUser": false
			}
		});
	},
});
