import { Meteor } from "meteor/meteor";
import { eventsToday } from "./calendar";
import nudge from "../../nudge-config.json";

const schedule = nudge.ignore.length ? `at 12:00 pm except on ${nudge.ignore.join()}` : "at 12:00 pm";

SyncedCron.add({
	name: "Check users calendar events at 7am.",
	schedule: parser => parser.text(schedule),
	job: () => {
		const users = Meteor.users.find().fetch();

		users.forEach(user => {
			// Checking calendars in addition to "primary", from nudge-config
			// nudge.incoming.forEach(calendar => {
			// })

			GoogleApi.get("/calendar/v3/calendars/primary/events", {
				user,
				params: {
					timeMin: new Date().toISOString(),
					timeMax: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
				}
			}, (err, res) => {
				if (err || !nudge.outgoing.includes("email")) {
					return;
				}

				eventsToday(res, user);
			});
		});
	}
});