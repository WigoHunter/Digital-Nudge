import { Meteor } from "meteor/meteor";
import { eventsToday } from "./calendar";

SyncedCron.add({
	name: "Check users calendar events at 7am.",
	schedule: parser => parser.text("at 07:00 am"),
	job: () => {
		const users = Meteor.users.find().fetch();
		users.forEach(user => {
			GoogleApi.get("/calendar/v3/calendars/primary/events", {
				user,
				params: {
					timeMin: new Date().toISOString(),
					timeMax: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
				}
			}, (err, res) => {
				if (err) {
					return;
				}

				eventsToday(res, user);
			});
		});
	}
});