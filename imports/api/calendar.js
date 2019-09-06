import { Meteor } from "meteor/meteor";
import jstz from "jstz";
import { sendEmail } from "./email";
import {
  getCategory,
  getTopic,
  getRawTime,
  isDifferentDay,
  getClockTime,
  calcEventsSpan,
  analyze,
  isEarlier,
  isLater,
  isLonger,
  trimEvents,
  reverse,
  fromLocalToUTC,
  callWithPromise
} from "./utils";
import { Config } from "../db/configs";

export const loadBuzytime = (user, min, max) =>
  new Promise((resolve, reject) => {
    GoogleApi.post(
      "/calendar/v3/freeBusy",
      {
        user,
        data: {
          timeMax: `${max}`,
          timeMin: `${min}`,
          items: [{ id: "primary" }]
        }
      },
      (err, res) => {
        if (err || !res.calendars || !res.calendars.primary) {
          reject(err);
        }

        resolve(res.calendars.primary.busy);
      }
    );
  });

// Server environment - UTC time
export const processEvents = async (
  events,
  user = Meteor.user(),
  config = Config.findOne(),
  send = true
) => {
  if (events && events.items && config) {
    // Initialize variables
    events = trimEvents(events.items);
    const span = calcEventsSpan(events);
    const newUser = user.newUser;
    const profile = user.nudgeProfile;
    const lastSuggestion = user.lastSuggestion;
    const timezone = profile.timezone || null;
    const min = fromLocalToUTC(
      `${config.suggestion.start}:00`,
      timezone
    ).format();
    const max = fromLocalToUTC(
      `${config.suggestion.end}:00`,
      timezone
    ).format();
    let busy = null;
    let suggestion = {
      time: null,
      title: config.defaults.title,
      span
    };

    // Process hours in the past day
    if (newUser) {
      console.log(`----- New User ${user.services.google.name} detected -----`);
      let spanForPastWeek = await trackPastWeekEventSpan(user);
      await callWithPromise("updateSpanForLastWeek", user._id, spanForPastWeek);
      await callWithPromise("setUserToOld", user._id);
    } else {
      console.log(`----- Old User ${user.services.google.name} detected -----`);
      let spanForPastWeek = user.spanForPastWeek || new Array(7).fill(0);
      spanForPastWeek.shift();
      spanForPastWeek.push(span);
      console.log(
        `----- ${user.services.google.name}'s hours for last week events -----`
      );
      console.log(spanForPastWeek);
      // Meteor.call("updateSpanForLastWeek", user._id, spanForPastWeek);
      await callWithPromise("updateSpanForLastWeek", user._id, spanForPastWeek);
    }

    // Load busy time async
    try {
      busy = await loadBuzytime(user, min, max);
    } catch (e) {
      console.log(`Error occurred: ${e}`);
    }

    // Get largest free time
    let time = reverse(busy, min, max).reduce((prev, next) => {
      return new Date(prev.end).getTime() - new Date(prev.start).getTime() >
        new Date(next.end).getTime() - new Date(next.start).getTime()
        ? prev
        : next;
    });

    const interval =
      new Date(time.end).getTime() - new Date(time.start).getTime();

    // Null if it's less than 1 hour
    time = interval < 1000 * 60 * 60 ? null : time;

    // Cut if it's larger than _max_ hour
    const maxTime =
      (config && config.suggestion ? config.suggestion.max : 3) *
      1000 *
      60 *
      60;
    if (interval > maxTime) {
      time.end = new Date(new Date(time.start).getTime() + maxTime);
    }

    suggestion.time = time;

    // Get yesterday's planned event, for next suggestion.
    if (lastSuggestion != null) {
      const start = new Date(lastSuggestion.start || "");
      const end = new Date(lastSuggestion.end || "");
      const event = events.find(
        e =>
          new Date(e.start.dateTime).getHours() == start.getHours() &&
          new Date(e.start.dateTime).getMinutes() == start.getMinutes() &&
          new Date(e.end.dateTime).getHours() == end.getHours() &&
          new Date(e.end.dateTime).getMinutes() == end.getMinutes()
      );

      if (event) {
        suggestion.title = event.summary;
      }
    }

    if (send) {
      const target = await callWithPromise("getFullUser", user._id);
      sendEmail(suggestion, target);
    }

    console.log(
      `----- Suggestion built up for ${user.services.google.name} -----`
    );
    console.log(suggestion);
    console.log(
      `----- End of Suggestion built up for ${user.services.google.name} -----`
    );
    Meteor.call("updateLastSuggestion", user._id, suggestion.time);
    return suggestion;
  }

  return null;
};

// Browser environment - local time applies to the Date Time.
export const loadUserPastData = (id = Meteor.user()._id) =>
  new Promise(async (resolve, reject) => {
    const config = await callWithPromise("getConfig");

    GoogleApi.get(
      "/calendar/v3/calendars/primary/events",
      {
        params: {
          timeMax: new Date().toISOString(),
          timeMin: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
        }
      },
      async (err, res) => {
        if (err) {
          reject(err);
        }

        let events = res.items;
        let profile = {
          counts: 0,
          countsOnDays: [0, 0, 0, 0, 0, 0, 0], // index 0 represents Sunday
          earliest: null,
          latest: null,
          longest: null,
          stat: {
            avgStartTimeOfAll: null,
            avgStartTimeOfDailyEarliest: null,
            daysWithEvents: 0,
            midStartTimeOfAll: null,
            midStartTimeOfDailyEarliest: null,
            numberOfEventsAfter5pm: 0,
            numberOfEventsBefore5pm: 0
          },
          timezone: jstz.determine().name()
        };
        let prev = null;
        let startTimes = [];
        let startTimesOfDailyEarliest = [];
        let categories = {};
        let topics = {};
        let categoriesPromises = [];
        let topicsPromises = [];

        events = trimEvents(events);
        events.forEach(e => {
          try {
            const curStart = new Date(e.start.dateTime);
            const curEnd = new Date(e.end.dateTime);
            profile.countsOnDays[curStart.getDay()]++;
            profile.counts++;
            startTimes.push(getRawTime(curStart));

            // WHY? and how to solve this bottleneck?
            if (categoriesPromises.length < 3) {
              categoriesPromises.push(getCategory(e.summary));
            }

            if (topicsPromises.length < 3) {
              topicsPromises.push(getTopic(e.summary));
            }

            if (
              profile.earliest == null ||
              isEarlier(new Date(profile.earliest.start.dateTime), curStart)
            ) {
              profile.earliest = e;
            }

            if (
              profile.latest == null ||
              isLater(new Date(profile.latest.end.dateTime), curEnd)
            ) {
              profile.latest = e;
            }

            if (profile.longest == null || isLonger(profile.longest, e)) {
              profile.longest = e;
            }

            if (
              prev == null ||
              isDifferentDay(new Date(prev.start.dateTime), curStart)
            ) {
              startTimesOfDailyEarliest.push(getRawTime(curStart));
              profile.stat.daysWithEvents += 1;
            }

            prev = e;
          } catch (error) {
            console.log(error);
            return;
          }
        });

        // Get all NLP results (categories)
        const categoryResponse = await Promise.all(categoriesPromises);
        categoryResponse.forEach(category => {
          if (!categories.hasOwnProperty(category)) {
            categories[category] = 0;
          }

          categories[category]++;
        });

        // Get all NLP results (topics)
        const topicResponses = await Promise.all(topicsPromises);
        topicResponses.forEach(topic => {
          if (!topics.hasOwnProperty(topic)) {
            topics[topic] = 0;
          }

          topics[topic]++;
        });

        // stat.* are all Date objects, in which only hour and minute are meaningful
        if (profile.counts) {
          startTimes.sort((a, b) => a - b);
          startTimesOfDailyEarliest.sort((a, b) => a - b);
          profile.stat.avgStartTimeOfAll = getClockTime(
            startTimes.reduce((total, num) => {
              return total + num;
            }) / startTimes.length
          );
          profile.stat.avgStartTimeOfDailyEarliest = getClockTime(
            startTimesOfDailyEarliest.reduce((total, num) => {
              return total + num;
            }) / startTimesOfDailyEarliest.length
          );
          profile.stat.midStartTimeOfAll = getClockTime(
            startTimes[Math.floor(startTimes.length / 2)]
          );
          profile.stat.midStartTimeOfDailyEarliest = getClockTime(
            startTimesOfDailyEarliest[
              Math.floor(startTimesOfDailyEarliest.length / 2)
            ]
          );
          profile.stat.numberOfEventsBefore5pm = startTimes.filter(t => {
            return t < 17;
          }).length;
          profile.stat.numberOfEventsAfter5pm =
            profile.counts - profile.stat.numberOfEventsBefore5pm;
        }

        profile = {
          ...analyze(profile, config),
          topics,
          categories
        };

        Meteor.call("updateProfile", id, profile, (err, res) => {
          console.log(res);
          if (err) {
            reject(err);
          }

          resolve(res);
        });
      }
    );
  });

export const trackPastWeekEventSpan = user =>
  new Promise((resolve, reject) => {
    GoogleApi.get(
      "/calendar/v3/calendars/primary/events",
      {
        user,
        params: {
          timeMax: new Date().toISOString(),
          timeMin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      },
      (err, res) => {
        if (err) {
          resolve(new Array(7).fill(0));
        }

        let events = res.items || [];
        events = trimEvents(events);
        let timestamps = [];
        for (let i = 0; i < events.length; i++) {
          timestamps.push({
            startTime: moment(events[i].start.dateTime),
            duration: moment.duration(
              moment(events[i].end.dateTime).diff(
                moment(events[i].start.dateTime)
              )
            )
          });
        }

        timestamps.sort((a, b) => {
          if (a.startTime.isBefore(b.startTime)) {
            return 1;
          }
          return -1;
        });

        let currTime = moment();
        let ydaTime = moment(currTime);
        ydaTime.subtract(1, "days");
        let idx = 0;
        let spanForPastWeek = new Array(7).fill(0);

        for (let i = 0; i < 7; i++) {
          let minutesCount = 0;
          while (idx < timestamps.length) {
            tmp = timestamps[idx].startTime;

            if (tmp.isBefore(currTime) && ydaTime.isBefore(tmp)) {
              console.log("count!");
              minutesCount += timestamps[idx].duration.asMinutes();
              idx += 1;
            } else {
              break;
            }
          }

          spanForPastWeek[6 - i] = minutesCount / 60;
          currTime.subtract(1, "days");
          ydaTime.subtract(1, "days");
        }

        console.log(
          `----- ${user.services.google.name}'s hours for last week events -----`
        );
        console.log(spanForPastWeek);
        if (spanForPastWeek) {
          resolve(spanForPastWeek);
        }

        reject(0);
        // Meteor.call("updateSpanForLastWeek", user._id, spanForPastWeek);
        // Meteor.call("setUserToOld", user._id);
      }
    );
  });

Meteor.methods({
  getConfig() {
    return Config.findOne();
  },
  getFullUser(id) {
    return Meteor.users.findOne({ _id: id });
  },
  updateConfig(config) {
    Config.update(
      {},
      {
        $set: {
          ...config
        }
      }
    );
  },
  updateProfile(id, profile) {
    console.log(profile);
    Meteor.users.update(
      { _id: id },
      {
        $set: {
          nudgeProfile: profile
        }
      }
    );
  },

  updateLastSuggestion(id, time) {
    Meteor.users.update(
      { _id: id },
      {
        $set: {
          lastSuggestion: time
        }
      }
    );
  },

  updateSpanForLastWeek(id, spanForPastWeek) {
    Meteor.users.update(
      { _id: id },
      {
        $set: {
          spanForPastWeek: spanForPastWeek
        }
      }
    );
  },

  setUserToOld(id) {
    Meteor.users.update(
      { _id: id },
      {
        $set: {
          newUser: false
        }
      }
    );
  }
});
