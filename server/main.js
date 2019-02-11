import { Meteor } from "meteor/meteor";
import "../imports/api/auth";
import "../imports/api/calendar";
import "../imports/api/email"

Meteor.startup(() => {

    process.env.MAIL_URL="smtps://apikey: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@smtp.sendgrid.net:465/";

})
