import { Meteor } from "meteor/meteor";

// Params: calendars = list of calendar ids of each calendar the user has.
const hasEventToday = events => {
	// TODO: Should check the calendars if there are events today.
	return events.items.map(e => e.summary) || [];
};

Meteor.methods({
	/* eslint-disable */
	"getCalendar"() {
		// get calendar on the server side
		return new Promise((resolve, reject) => {
			GoogleApi.get("/calendar/v3/calendars/primary/events", {
				params: {
					timeMin: new Date().toISOString(),
					timeMax: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
				}
			}, (err, res) => {
				if (err) {
					reject(err);
				}

				resolve(hasEventToday(res));
			});
		});
	},
	/* eslint-enable */
});