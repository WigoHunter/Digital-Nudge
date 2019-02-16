import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";
import "../imports/api/auth";
import "../imports/api/calendar";
import "../imports/api/email";
import keys from "../keys";

Meteor.startup(() => {
	// eslint-disable-next-line no-undef
	process.env.MAIL_URL = keys.sendGrid.server;
	Meteor.http = HTTP;
});
