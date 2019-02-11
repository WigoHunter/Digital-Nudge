import { Meteor } from "meteor/meteor";
import { Email } from "meteor/email";

Meteor.methods({
	sendEmail(to, from, subject, text) {
		Email.send({ to, from, subject, text });
	}
});
  
