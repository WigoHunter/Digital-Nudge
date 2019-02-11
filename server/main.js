import { Meteor } from "meteor/meteor";
import "../imports/api/auth";
import "../imports/api/calendar";
import "../imports/api/email";
import keys from "../keys";

Meteor.startup(() => {
	// eslint-disable-next-line no-undef
	process.env.MAIL_URL = keys.sendGrid.server;
});
