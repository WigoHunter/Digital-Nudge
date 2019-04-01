import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";
import "../imports/api/publish";
import "../imports/api/auth";
import "../imports/api/calendar";
import "../imports/api/email";
import "../imports/api/scheduledJob";
import keys from "../keys";

// Test
import { t_suggestion } from "../imports/api/tests";

Meteor.startup(() => {
	process.env.MAIL_URL = keys.sendGrid.server;
	Meteor.http = HTTP;
	SyncedCron.start();

	// Test
	// Meteor.users.find().fetch().forEach(user => {
	// 	t_suggestion(user);
	// });
});
