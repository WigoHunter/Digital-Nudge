import { Meteor } from "meteor/meteor";
import keys from "../../keys";
import sgMail from "@sendgrid/mail";
import { fromUTCToLocal, average, callWithPromise } from "./utils";
import draw from "./draw";

sgMail.setApiKey(keys["sendGrid"]["key"]);

export const sendEmail = async (suggestion, user = Meteor.user()) => {
  // Check if the user has gmail first. In case google.email runs into error.
  if (user && user.services.google) {
    // Load config
    const config = await callWithPromise("getConfig");

    console.log(`sending email to ${user.services.google.email}...`);
    let date = "";
    const withSuggestion = suggestion.time != null;
    const spans = user.spanForPastWeek || [];
    const avg = average(spans);
    const chart = draw(spans);
    const start = new Date(suggestion.time.start);
    const end = new Date(suggestion.time.end);
    const timezone = user.nudgeProfile.timezone || "";
    const localStart = fromUTCToLocal(
      `${start.getHours()}:${start.getMinutes()}`,
      timezone
    );
    const localEnd = fromUTCToLocal(
      `${end.getHours()}:${end.getMinutes()}`,
      timezone
    );

    if (suggestion.time) {
      date = `${start.toISOString().split(".")[0]}Z/${
        end.toISOString().split(".")[0]
      }Z`.replace(/[-:]/g, "");
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
          chart: "" + chart,
          hours: `${localStart.format("HH:mm")} - ${localEnd.format("HH:mm")}`,
          analysis:
            suggestion.span >= avg
              ? `Keep up the good work! You planned for ${suggestion.span.toFixed(
                  2
                )} hours yesterday, which is ${
                  avg == 0 ? "N" : (suggestion.span / avg).toFixed(2)
                } times more than average!`
              : `Let's GO! It seems like you planned less than your average performance in last week (${suggestion.span.toFixed(
                  2
                )} hours v.s. ${avg.toFixed(2)} hours on average last week!)`,
          suggestion: {
            time: date,
            title: suggestion.title,
            span: suggestion.span
          }
        }
      };

      sgMail.send(msg);
    } catch (e) {
      console.log(e);
    }
  }
};
