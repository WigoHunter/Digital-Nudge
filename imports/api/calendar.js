import { Meteor } from "meteor/meteor";
import { Email } from "meteor/email";

const sendEmail = (events) => {
	console.log("sending email...");

	// Check if the user has gmail first. In case google.email runs into error.
	if (Meteor.user().services.google) {
		Email.send({
			to: Meteor.user().services.google.email,
			from: "kevin@example.com",
			subject: "Hello From Digital Nudge",
			text: events.length > 0 ? "Fantastic job! You made plans today." : "You are slacking off. No plans made today."
		});
	}
};

const hasEventToday = events => {
	events = events.items.map(e => e.summary) || [];
	sendEmail(events);

	// return the events to frontend.
	return events;
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