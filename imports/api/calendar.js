import { Meteor } from "meteor/meteor";
import { sendEmail } from "./email";

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

export const loadUserPastData = () => new Promise((resolve, reject) => {
	GoogleApi.get("/calendar/v3/calendars/primary/events", {
		params: {
			timeMax: new Date().toISOString(),
			timeMin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
		}
	}, (err, res) => {
		if (err) {
			reject(err);
		}

		resolve(res);
	});
});

Meteor.methods({
	"getCalendar"() {
		return checkCalendar();
	},

	"loadData"() {
		return loadUserPastData();
	}
});