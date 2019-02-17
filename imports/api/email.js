import { Meteor } from "meteor/meteor";
import { Email } from "meteor/email";

export const sendEmail = (events, user=Meteor.user()) => {
	// Check if the user has gmail first. In case google.email runs into error.
	if (user && user.services.google) {
		console.log(`sending email to ${user.services.google.email}...`);

		try {
			Email.send({
				to: user.services.google.email,
				from: "kevin@example.com",
				subject: "Hello From Digital Nudge",
				text: events.length > 0 ? "Fantastic job! You made plans today." : "You are slacking off. No plans made today."
			});
		} catch(e) {
			console.log(e);
		}
	}
};

Meteor.methods({
	sendEmail(to, from, subject, text) {
		Email.send({ to, from, subject, text });
	}
});
  
