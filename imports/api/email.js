import { Meteor } from "meteor/meteor";
import keys from "../../keys";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(keys["sendGrid"]["key"]);

export const sendEmail = (suggestion, user=Meteor.user()) => {
	// Check if the user has gmail first. In case google.email runs into error.
	if (user && user.services.google) {
		console.log(`sending email to ${user.services.google.email}...`);
		let date = "";
		const withSuggestion = suggestion.time != null;
		
		if (suggestion.time) {
			date = `${new Date(suggestion.time.start).toISOString().split(".")[0]}Z/${new Date(suggestion.time.end).toISOString().split(".")[0]}Z`.replace(/[-:]/g, "");
		}

		try {
			const msg = {
				to: user.services.google.email,
				from: "kevin@nudges.ml",
				subject: "Daily Digest From Digital Nudge",
				templateId: "d-5934901c3a1d48048bdd247ef0166839",
				dynamic_template_data: {
					"subject": "Hello From Digital Nudge",
					"gctext": withSuggestion ? "Let's make some plans today!" : "Awesome job! Good luck working hard today!",
					"with-suggestion": withSuggestion,
					"suggestion": {
						// "time": "20190324T220000Z/20190324T230000Z",
						"time": date,
						"title": suggestion.title,
						"span": suggestion.span,
					}
				},
			};

			sgMail.send(msg);
		} catch(e) {
			console.log(e);
		}
	}
};