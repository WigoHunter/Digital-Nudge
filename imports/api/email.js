import { Meteor } from "meteor/meteor";
import { Email } from "meteor/email";

export const sendEmail = (suggestion, user=Meteor.user()) => {
	// Check if the user has gmail first. In case google.email runs into error.
	if (user && user.services.google) {
		console.log(`sending email to ${user.services.google.email}...`);

		try {
			Email.send({
				to: user.services.google.email,
				from: "kevin@nudges.ml",
				subject: "Hello From Digital Nudge",
				text: "You are slacking off!",
				html: "You are slacking off!",
				headers: {
				  "X-SMTPAPI": JSON.stringify({
						"to": [
					  user.services.google.email
						],
						"sub": {
					  "[gcdate1]": [
								"20190324T200000Z/20190324T210000Z"
					  ],
					  "[gcdate2]": [
								"20190324T210000Z/20190324T220000Z"
					  ],
					  "-gcbtnname1-": [
								"20:00 to 21:00"
					  ],
					  "-gcbtnname2-": [
								"21:00 to 22:00"
					  ],
						},
						"filters": {
					  "templates": {
								"settings": {
									"enable": 1,
									"template_id": "44a48ed5-95e8-4d63-adbf-69af89bacaa9"
								}
					  }
						}
				  })
				}
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
  
