import { Meteor } from "meteor/meteor";
import { getNextTime, fromLocalToUTC, callWithPromise } from "./utils";
import { processEvents } from "./calendar";

const withProfile = (profile, config) => {
  const timezone = profile.timezone || null;
  const earliest = new Date(profile.earliest.start.dateTime);
  let nextScheduledTime = getNextTime(earliest);

  let utcHour = nextScheduledTime.getHours();
  const upperBound =
    fromLocalToUTC(`${config.bounds.upper}:00`, timezone).format("HH") - 0;
  const lowerBound =
    fromLocalToUTC(`${config.bounds.lower}:00`, timezone).format("HH") - 0;

  // Lower bound
  if (utcHour < lowerBound) {
    console.log(
      `Lower bound reached! ${utcHour} is earlier than ${lowerBound}:00`
    );
    nextScheduledTime.setHours(lowerBound);
    nextScheduledTime.setMinutes(0);
    nextScheduledTime = getNextTime(nextScheduledTime, true);
  }

  // Upper bound
  else if (utcHour >= upperBound) {
    console.log(
      `Upper bound reached! ${utcHour} is later than ${upperBound}:00`
    );
    nextScheduledTime.setHours(upperBound);
    nextScheduledTime.setMinutes(0);
    nextScheduledTime = getNextTime(nextScheduledTime, true);
  }

  return nextScheduledTime;
};

const withDefault = (profile, config) => {
  const timezone = profile.timezone || "America/New_York";
  const time =
    fromLocalToUTC(`${config.defaults.send}:00`, timezone).format("HH") - 0;
  let nextScheduledTime = new Date();
  nextScheduledTime.setHours(time);
  nextScheduledTime.setMinutes(0);
  nextScheduledTime = getNextTime(nextScheduledTime, true);

  return nextScheduledTime;
};

export const scheduleJobs = async () => {
  // Load config
  const config = await callWithPromise("getConfig");
  const users = Meteor.users.find().fetch();

  users.forEach(user => {
    const profile = user.nudgeProfile;
    console.log("");
    console.log(
      `----- Started Scheduling ${user.services.google.name}'s Service------`
    );
    const nextScheduledTime =
      !profile || !profile.earliest
        ? withDefault(profile, config)
        : withProfile(profile, config);

    // TODO: Ignore on the configured days - turn off for testing

    // Logs
    console.log(`scheduling user ${user.services.google.name}'s email at:`);
    console.log(`${nextScheduledTime} (of UTC timezone)`);

    SyncedCron.add({
      name: `checking user ${
        user._id
      }'s calendar at ${nextScheduledTime.toISOString()}...`,
      schedule: parser =>
        parser
          .recur()
          .on(nextScheduledTime)
          .fullDate(),
      job: () => {
        console.log(
          `----- Checking ${user.services.google.name}'s Calendar -----`
        );

        GoogleApi.get(
          "/calendar/v3/calendars/primary/events",
          {
            user,
            params: {
              timeMin: new Date(
                Date.now() - 1 * 24 * 60 * 60 * 1000
              ).toISOString(),
              timeMax: new Date().toISOString()
            }
          },
          (err, res) => {
            if (err || !config.outgoing.includes("email")) {
              return;
            }

            processEvents(res, user, config);
          }
        );
      }
    });

    console.log(
      `----- Finished Scheduling ${user.services.google.name}'s Service------`
    );
    console.log("");
  });
};

SyncedCron.add({
  name: "daily scheduling",
  schedule: parser => parser.text("at 04:00"),
  job: () => scheduleJobs()
});
