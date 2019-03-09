import { Meteor } from "meteor/meteor";
import { sendEmail } from "./email";
import { analyze, isEarlier, isLater, isLonger } from "./utils";
import config from "../../nudge-config.json";

export const eventsToday = (events, user=Meteor.user()) => {
	if (events && events.items) {
		events = events.items.map(e => e.summary);
		sendEmail(events, user);
	
		return events;
	}
	
	return [];
};

export const checkCalendar = () => new Promise((resolve, reject) => {
	GoogleApi.get("/calendar/v3/calendars/primary/events", {
		params: {
			timeMin: new Date().toISOString(),
			timeMax: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
		}
	}, (err, res) => {
		if (err) {
			reject(err);
		}

		resolve(eventsToday(res));
	});
});

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
		};

		events = events.filter(e => (e.status !== "cancelled" && e.start && e.start.dateTime && e.end && e.end.dateTime));
		events = events.map(e => ({
			created: e.created,
			end: e.end,
			start: e.start,
			summary: e.summary		// can be dropped later.
		}));

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
	"getCalendar"() {
		return checkCalendar();
	},

	"loadData"() {
		return loadUserPastData(this.userId);
	},

	"updateProfile"(id, profile) {
		Meteor.users.update({ _id: id }, {
			$set: {
				"nudgeProfile": profile
			}
		});
	}
});