import { Meteor } from "meteor/meteor";
import keys from "../../keys";
import sgMail from "@sendgrid/mail";
import { fromUTCToLocal, callWithPromise } from "./utils";

sgMail.setApiKey(keys["sendGrid"]["key"]);

export const sendEmail = async (suggestions, user = Meteor.user()) => {
  // Check if the user has gmail first. In case google.email runs into error.
  if (user && user.services.google) {
    // Load config
    const config = await callWithPromise("getConfig");

    console.log(`sending email to ${user.services.google.email}...`);

    let withSuggestion = false;
    let data = [];
    if (suggestions.length !== 0) {
      withSuggestion = true;
      data = suggestions.map(suggestion => {
        const start = new Date(suggestion.time.start);
        const end = new Date(suggestion.time.end);
        // const timezone = user.nudgeProfile.timezone || "";
        const timezone = "America/New_York";
        const localStart = fromUTCToLocal(
          `${start.getHours()}:${start.getMinutes()}`,
          timezone
        );
        const localEnd = fromUTCToLocal(
          `${end.getHours()}:${end.getMinutes()}`,
          timezone
        );
        const time = `${start.toISOString().split(".")[0]}Z/${
          end.toISOString().split(".")[0]
        }Z`.replace(/[-:]/g, "");

        return {
          time: time,
          hours: `${localStart.format("HH:mm")} - ${localEnd.format("HH:mm")}`,
          title: suggestion.title
        };
      });
    }

    try {
      const msg = {
        to: user.services.google.email,
        from: "kevin@nudges.ml",
        subject: "Daily Digest From Digital Nudge",
        templateId: "d-5934901c3a1d48048bdd247ef0166839",
        dynamic_template_data: {
          subject: "Hello From Digital Nudge",
          gctext: withSuggestion
            ? "Let's make some plans today!"
            : "Awesome job! Good luck working hard today!",
          "with-suggestion": withSuggestion,
          suggestion_text: config.suggestionText,
          suggestions: data
        }
      };

      sgMail.send(msg);
    } catch (e) {
      console.log(e);
    }
  }
};
