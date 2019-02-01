import { Meteor } from "meteor/meteor";

Meteor.methods({
	"getCalendar"(token) {
		// get calendar on the server side
		return token;
	}
});