import jstz from "jstz";
import {
  getRawTime,
  isDifferentDay,
  getClockTime,
  analyze,
  isEarlier,
  isLater,
  isLonger,
  trimEvents,
  callWithPromise
} from "../utils";

const checkUpperBoundOrLowerbound = (time, config) => {
  const sendTime = new Date(time);
  const hour = sendTime.getHours();

  const upperBound = config.bounds.upper - "0";
  const lowerBound = config.bounds.lower - "0";

  // Lower bound
  if (hour < lowerBound) {
    console.log(
      `Lower bound reached! ${hour} is earlier than ${lowerBound}:00`
    );
    sendTime.setHours(lowerBound);
    sendTime.setMinutes(0);
  }

  // Upper bound
  else if (hour >= upperBound) {
    console.log(`Upper bound reached! ${hour} is later than ${upperBound}:00`);
    sendTime.setHours(upperBound);
    sendTime.setMinutes(0);
  }

  return sendTime;
};

// Browser environment - local time applies to the Date Time.
const loadUserPastData = (id = Meteor.user()._id) =>
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
        // let categoriesPromises = [];
        // let topicsPromises = [];
        let sendTime = null;

        events = trimEvents(events);
        events.forEach(e => {
          try {
            const curStart = new Date(e.start.dateTime);
            const curEnd = new Date(e.end.dateTime);
            profile.countsOnDays[curStart.getDay()]++;
            profile.counts++;
            startTimes.push(getRawTime(curStart));

            // WHY? and how to solve this bottleneck?
            // if (categoriesPromises.length < 3) {
            //   categoriesPromises.push(getCategory(e.summary));
            // }

            // if (topicsPromises.length < 3) {
            //   topicsPromises.push(getTopic(e.summary));
            // }

            if (
              profile.earliest == null ||
              isEarlier(new Date(profile.earliest.start.dateTime), curStart)
            ) {
              profile.earliest = e;
              sendTime = profile.earliest.start.dateTime;
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
        // const categoryResponse = await Promise.all(categoriesPromises);
        // categoryResponse.forEach(category => {
        //   if (!categories.hasOwnProperty(category)) {
        //     categories[category] = 0;
        //   }

        //   categories[category]++;
        // });

        // Get all NLP results (topics)
        // const topicResponses = await Promise.all(topicsPromises);
        // topicResponses.forEach(topic => {
        //   if (!topics.hasOwnProperty(topic)) {
        //     topics[topic] = 0;
        //   }

        //   topics[topic]++;
        // });

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

        if (config.bounds != null) {
          sendTime = checkUpperBoundOrLowerbound(sendTime, config);
        }

        profile = {
          ...analyze(profile, config),
          topics,
          categories,
          sendTime
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

export default loadUserPastData;
