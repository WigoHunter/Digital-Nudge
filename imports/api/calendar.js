import { Meteor } from "meteor/meteor";

// Params: calendars = list of calendar ids of each calendar the user has.
const hasEventToday = calendars => {
	// TODO: Should check the calendars if there are events today.
	return calendars;
};

Meteor.methods({
	/* eslint-disable */
	"getCalendar"() {
		// get calendar on the server side
		return new Promise((resolve, reject) => {
			GoogleApi.get("/calendar/v3/users/me/calendarList", { user: Meteor.user() }, (err, res) => {
				if (err) {
					reject(err);
				}
	
				const calendars = res;
				resolve(hasEventToday(calendars));
			});
		});
	},
	/* eslint-enable */
});