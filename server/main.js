import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";
import "../imports/api/publish";
import "../imports/api/auth";
import "../imports/api/calendar";
import "../imports/api/email";
import "../imports/api/scheduledJob";
import keys from "../keys";

Meteor.startup(() => {
	process.env.MAIL_URL = keys.sendGrid.server;
	Meteor.http = HTTP;
	console.log(moment(new Date().getTime() + new Date().getTimezoneOffset()).startOf("day").toDate());
	SyncedCron.start();
});
