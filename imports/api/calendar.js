import { Meteor } from "meteor/meteor";
import { sendEmail } from "./email";

const isEarlier = (prev, cur) => {
	const prevHour = prev.getHours();
	const prevMinutes = prev.getMinutes();
	const curHour = cur.getHours();
	const curMinutes = cur.getMinutes();

	return (curHour < prevHour || (curHour == prevHour && curMinutes < prevMinutes));
};

const isLater = (prev, cur) => {
	const prevHour = prev.getHours();
	const prevMinutes = prev.getMinutes();
	const curHour = cur.getHours();
	const curMinutes = cur.getMinutes();

	return (curHour > prevHour || (curHour == prevHour && curMinutes > prevMinutes));
};

const isLonger = (prev, cur) => {
	return (new Date(cur.end.dateTime).getTime() - new Date(cur.start.dateTime).getTime()) >
		(new Date(prev.end.dateTime).getTime() - new Date(prev.start.dateTime).getTime());
};

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

export const loadUserPastData = id => new Promise((resolve, reject) => {
	GoogleApi.get("/calendar/v3/calendars/primary/events", {
		params: {
			timeMax: new Date().toISOString(),
			timeMin: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
		}
	}, (err, res) => {
		if (err) {
			reject(err);
		}

		const events = res.items;
		let profile = {
			counts: 0,
			countsOnDays: [0, 0, 0, 0, 0, 0, 0],	// index 0 represents Sunday
			earliest: null,
			latest: null,
			longest: null,
		};

		events.forEach(e => {
			if (e.status === "cancelled" || !e.start || !e.start.dateTime || !e.end || !e.end.dateTime) {
				return;
			}

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

		Meteor.users.update({ _id: id }, {
			$set: {
				"nudgeProfile": profile
			}
		}, (err, res) => {
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
	}
});