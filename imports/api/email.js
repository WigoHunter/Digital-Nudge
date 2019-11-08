import { Meteor } from "meteor/meteor";
import keys from "../../keys";
import sgMail from "@sendgrid/mail";
import { fromUTCToLocal, callWithPromise } from "./utils";
import { logEvent } from "./logger";

sgMail.setApiKey(keys["sendGrid"]["key"]);

export const sendEmail = async (suggestions, user = Meteor.user()) => {
  // Check if the user has gmail first. In case google.email runs into error.
  if (user && user.services.google) {
    // Load config
    const config = await callWithPromise("getConfig");

    console.log(`sending email to ${user.services.google.email}...`);

    let withSuggestion = false;
    let data = [];
    const ourSuggestions = suggestions.filter(suggestion =>
      suggestion.hasOwnProperty("keyword")
    );
    const externalSuggestions = suggestions
      .filter(suggestion => suggestion.hasOwnProperty("url"))
      .map(suggestion => {
        const start = new Date(suggestion.time.start);
        const end = new Date(suggestion.time.end);
        const time = `${start.toISOString().split(".")[0]}Z/${
          end.toISOString().split(".")[0]
        }Z`.replace(/[-:]/g, "");

        const payload = JSON.stringify({
          link: encodeURIComponent(suggestion.url),
          id: user._id,
          suggestion
        });

        return {
          time,
          title: suggestion.title,
          link: `http://nudges.ml/click/${payload}`
        };
      });

    if (ourSuggestions.length !== 0) {
      withSuggestion = true;
      data = ourSuggestions.map(suggestion => {
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

        const payload = JSON.stringify({
          link: encodeURIComponent(
            `https://www.google.com/calendar/render?action=TEMPLATE&text=${suggestion.title}&dates=${time}&details=add+details&location=add+locasionf=true&output=xml`
          ),
          id: user._id,
          suggestion
        });

        return {
          time,
          hours: `${localStart.format("HH:mm")} - ${localEnd.format("HH:mm")}`,
          title: suggestion.title,
          link: `http://nudges.ml/click/${payload}`
        };
      });
    }

    try {
      const keywords = ourSuggestions.map(sug => sug.keyword);
      const emailTitle =
        keywords.length > 0
          ? `[Digital Nudge] Boost Your Day with ${keywords.join(", ")}`
          : "Hello from Digital Nudge!";

      const msg = {
        to: user.services.google.email,
        from: "kevin@nudges.ml",
        subject: emailTitle,
        templateId: "d-5934901c3a1d48048bdd247ef0166839",
        dynamic_template_data: {
          subject: emailTitle,
          gctext: withSuggestion
            ? "Let's make some plans today!"
            : "Awesome job! Good luck working hard today!",
          "with-suggestion": withSuggestion,
          suggestion_text: config.suggestionText,
          suggestions: data,
          externalSuggestions
        }
      };

      logEvent("send_email", user._id, msg);
      sgMail.send(msg);
    } catch (e) {
      console.log(e);
    }
  }
};

export const sendOnboardingEmail = (user = Meteor.user()) => {
  console.log(`generating onboarding email to ${user.services.google.email}`);
  const content = `
    <p>We'll start sending you daily emails that are <b>customized</b> and <b>personalized</b> to help you better utilize your Google Calendar for <b>productivity</b>, <b>wellness</b> and <b>leisure</b> events. Please also remember to whitelist our emails so they don't end up in the spams!</p>
    <p>We look forward to seeing a more productive version of you!</p>
   `;

  const msg = {
    to: user.services.google.email,
    from: "kevin@nudges.ml",
    subject: "Hello! Thank you for joining Digital Nudges",
    templateId: "d-5934901c3a1d48048bdd247ef0166839",
    dynamic_template_data: {
      subject: "Hello! Thank you for joining to Digital Nudges",
      gctext:
        "Thank you for completing the onboarding process of Digital Nudges",
      "with-suggestion": false,
      suggestion_text: "",
      suggestions: [],
      externalSuggestions: [],
      onboarding: true,
      onboardingHTML: content
    }
  };

  try {
    logEvent("send_email", user._id, msg);
    sgMail.send(msg);
  } catch (e) {
    console.log(e);
  }
};
