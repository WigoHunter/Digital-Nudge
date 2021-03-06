import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";
import { Config } from "../imports/db/configs";
import "../imports/api/publish";
import "../imports/api/auth";
import "../imports/api/methods";
import "../imports/api/email";
import "../imports/api/scheduledJob";
import keys from "../keys";
import seedConfig from "../nudge-config";

// Tests
// import { scheduleJobs } from "../imports/api/scheduledJob";
// import { sendEmail } from "../imports/api/email";
// import { t_suggestion } from "../imports/api/tests";
// import { draw } from "../imports/api/utils";
// import { getRelevantEventsFromEventbrite } from "../imports/api/eventbrite";

// LUIS processing
// import { getAllCalendarData } from "../imports/api/luis/data.js";
// import luis from "../imports/api/luis";
// import { getCategory } from "../imports/api/utils";

Meteor.startup(() => {
  // Seed Configuration
  process.env.MAIL_URL = keys.sendGrid.server;
  Meteor.http = HTTP;
  const config = Config.findOne();

  if (!config) {
    console.log("Seeding configuration...");
    Config.insert(seedConfig);
  }

  // Expose fetch to server
  // if (typeof fetch !== "function") {
  // 	global.fetch = require("node-fetch-polyfill");
  // }

  // Start schedules
  SyncedCron.start();

  // Get all Calendar events for the past n days (all different categories).
  // getAllCalendarData(2 * 365);

  // Process and Upload to LUIS server
  // luis();

  // Test schedule jobs
  // scheduleJobs();

  // Test drawing the chart
  // const svg = draw(Meteor.users.findOne());
  // console.log(svg);

  // Test suggestion
  // Meteor.users
  //   .find()
  //   .fetch()
  //   .forEach(user => {
  //     t_suggestion(user, config || seedConfig, false);
  //   });

  // Test LUIS
  // getCategory("Lunch with Jack").then(res => console.log(res));

  // Test Meetup/Eventbrite
  // Meteor.users
  //   .find()
  //   .fetch()
  //   .forEach(async user => {
  //     try {
  //       const events = await getRelevantEventsFromEventbrite(
  //         user.nudgeProfile.preferences
  //       );

  //       console.log(events);
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   });
});
