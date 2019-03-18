import { Meteor } from "meteor/meteor";
import { Email } from "meteor/email";

export const sendEmail = (events, user=Meteor.user()) => {
	// Check if the user has gmail first. In case google.email runs into error.
	if (user && user.services.google) {
		console.log(`sending email to ${user.services.google.email}...`);

		// const xsmtpapi = {
		// 	"filter": {
		// 		"templates": {
		// 			"enable": 1,
		// 			"template_id": "d-d91b559f3cbc4ba8a73e5726e97f35c5",
		// 		}
		// 	},
		// 	"sub": {
		// 		"{subject}": "Hello From Digital Nudge",
		// 		"{name}": user.services.google.name,
		// 		"{link}": "nudges.ml",
		// 		"{text}": events.length > 0 ? "Fantastic job! You made plans today." : "You are slacking off. No plans made today."
		// 	}
		// };

		try {
			Email.send({
				to: user.services.google.email,
				from: "kevin@nudges.ml",
				subject: "Hello From Digital Nudge",
				// sub: {
				// 	"{subject}": "Hello From Digital Nudge",
				// 	"{name}": user.services.google.name,
				// 	"{link}": "nudges.ml",
				// 	"{text}": events.length > 0 ? "Fantastic job! You made plans today." : "You are slacking off. No plans made today."
				// },
				// headers: {
				// 	"X-SMTPAPI": JSON.stringify(xsmtpapi),
				// 	"Content-Type": "text/html"
				// }
				text: events.length > 0 ? "Fantastic job! You made plans today." : "You are slacking off. No plans made today.",
				// templateId: "d-d91b559f3cbc4ba8a73e5726e97f35c5",
				// dynamic_template_data: {
				// 	subject: "Hello From Digital Nudge",
				// 	name: user.services.google.name,
				// 	link: "nudges.ml",
				// 	text: events.length > 0 ? "Fantastic job! You made plans today." : "You are slacking off. No plans made today."
				// }
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
  
