import { Meteor } from "meteor/meteor";
import config from "../../nudge-config.json";
import { getNextTime } from "./utils";
import { eventsToday } from "./calendar";

export const schedule = config.ignore.length ? `at 12:00 pm except on ${config.ignore.join()}` : "at 12:00 pm";

SyncedCron.add({
	name: "daily scheduling",
	schedule: parser => parser.text("at 14:55"),
	job: () => {
		const users = Meteor.users.find().fetch();

		users.forEach(user => {
			const earliest = new Date(user.nudgeProfile.earliest.start.dateTime);
			const nextScheduledTime = getNextTime(earliest);
			let localTime = new Date(nextScheduledTime.getTime() - earliest.getTimezoneOffset() * 60 * 1000);

			// Lower bound
			if (localTime.getHours() < config.bounds.lower) {
				nextScheduledTime.setHours(config.bounds.lower + Math.floor(earliest.getTimezoneOffset() / 60));
				nextScheduledTime.setMinutes(0);
			}

			// Upper bound
			if (localTime.getHours() >= config.bounds.upper) {
				nextScheduledTime.setHours(config.bounds.upper + Math.floor(earliest.getTimezoneOffset() / 60));
				nextScheduledTime.setMinutes(0);
			}

			localTime = new Date(nextScheduledTime.getTime() - earliest.getTimezoneOffset() * 60 * 1000);
			
			// Ignore on the configured days - turn off for testing
			/*
			if (config.ignore.includes(localTime.getDay())) {
				console.log(`Ignoring user ${user.services.google.name}'s service on ${localTime.getDay()}`);
				return;
			}
			*/

			// Logs
			console.log("----- schedule ------");
			console.log(`scheduling user ${user.services.google.name}'s email at:`);
			console.log(`UTC time: ${nextScheduledTime.toISOString()}`);
			console.log(`local time: ${localTime}`);

			SyncedCron.add({
				name: `checking user ${user._id}'s calendar at ${nextScheduledTime.toISOString()}...`,
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