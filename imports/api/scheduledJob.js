import { Meteor } from "meteor/meteor";
import config from "../../nudge-config.json";
import { getNextTime } from "./utils";
import { eventsToday } from "./calendar";

export const schedule = config.ignore.length ? `at 12:00 pm except on ${config.ignore.join()}` : "at 12:00 pm";

SyncedCron.add({
	name: "daily scheduling",
	schedule: parser => parser.text("at 00:00 am"),
	job: () => {
		const users = Meteor.users.find().fetch();

		users.forEach(user => {
			const earliest = new Date(user.nudgeProfile.earliest.start.dateTime);
			const nextScheduledTime = getNextTime(earliest);
			
			// Ignore the days - turned off for testing
			/*
			const inLocalTime = new Date(nextScheduledTime.getTime() - earliest.getTimezoneOffset * 60 * 1000);
			if (config.ignore.includes(inLocalTime.getDay())) {
				return;
			}
			*/

			SyncedCron.add({
				name: `checking user ${user._id}'s calendar...`,
				schedule: parser => parser.recur().on(nextScheduledTime).fullDate(),
				job: () => {
					console.log(`checking ${user.services.google.name}'s calendar`);
					
					GoogleApi.get("/calendar/v3/calendars/primary/events", {
						user,
						params: {
							timeMin: new Date().toISOString(),
							timeMax: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
						}
					}, (err, res) => {
						if (err || !config.outgoing.includes("email")) {
							return;
						}
		
						eventsToday(res, user);
					});
				}
			});
		});
	}
});


// SyncedCron.add({
// 	name: "Check users calendar events at 7am.",
// 	schedule: parser => parser.text(schedule),
// 	job: () => {
// 		const users = Meteor.users.find().fetch();

// 		users.forEach(user => {
// 			// Checking calendars in addition to "primary", from nudge-config
// 			// nudge.incoming.forEach(calendar => {
// 			// })

// 			GoogleApi.get("/calendar/v3/calendars/primary/events", {
// 				user,
// 				params: {
// 					timeMin: new Date().toISOString(),
// 					timeMax: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
// 				}
// 			}, (err, res) => {
// 				if (err || !nudge.outgoing.includes("email")) {
// 					return;
// 				}

// 				eventsToday(res, user);
// 			});
// 		});
// 	}
// });