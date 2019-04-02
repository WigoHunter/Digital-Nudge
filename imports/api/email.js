import { Meteor } from "meteor/meteor";
import { Email } from "meteor/email";
import keys from "../../keys";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(keys["sendGrid"]["key"]);

export const sendEmail = (suggestion, user=Meteor.user()) => {
	// Check if the user has gmail first. In case google.email runs into error.
	if (user && user.services.google) {
		console.log(`sending email to ${user.services.google.email}...`);

		try {
			const msg = {
				to: user.services.google.email,
				from: "kevin@nudges.ml",
				subject: "Hello From Digital Nudge",
				templateId: "d-5934901c3a1d48048bdd247ef0166839",
				dynamic_template_data: {
					subject: "Hello From Digital Nudge",
					gctext: "You are slacking off!!",
					gcdate: "20190324T220000Z/20190324T230000Z",
					gcbtnname: "Work on project",
				},
			};
			sgMail.send(msg);
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
