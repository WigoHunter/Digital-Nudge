import { Meteor } from "meteor/meteor";
import { sendEmail } from "./email";

const eventsToday = events => {
	if (events && events.items) {
		events = events.items.map(e => e.summary);
		sendEmail(events);
	
		return events;
	}
	
	return [];
};

/* eslint-disable */
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
/* eslint-enable */

Meteor.methods({
	"getCalendar"() {
		return checkCalendar();
	},
});