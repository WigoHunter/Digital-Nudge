import { Meteor } from "meteor/meteor";
import { Email } from "meteor/email";

export const sendEmail = events => {
	console.log("sending email...");

	// Check if the user has gmail first. In case google.email runs into error.
	if (Meteor.user() && Meteor.user().services.google) {
		Email.send({
			to: Meteor.user().services.google.email,
			from: "kevin@example.com",
			subject: "Hello From Digital Nudge",
			text: events.length > 0 ? "Fantastic job! You made plans today." : "You are slacking off. No plans made today."
		});
	}
};

Meteor.methods({
	sendEmail(to, from, subject, text) {
		Email.send({ to, from, subject, text });
	}
});
  
