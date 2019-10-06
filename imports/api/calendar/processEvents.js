import { sendEmail } from "../email";
import {
  calcEventsSpan,
  trimEvents,
  reverse,
  fromLocalToUTC,
  callWithPromise,
  mapPrefToSuggestionTitle,
  fitOneEvent
} from "../utils";

const _ = require("lodash");

const loadBuzytime = (user, min, max) =>
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
const processEvents = async (
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

    // Process hours in the past day
    if (newUser) {
      let spanForPastWeek = await trackPastWeekEventSpan(user);
      await callWithPromise("updateSpanForLastWeek", user._id, spanForPastWeek);
      await callWithPromise("setUserToOld", user._id);
    } else {
      let spanForPastWeek = user.spanForPastWeek || new Array(7).fill(0);
      spanForPastWeek.shift();
      spanForPastWeek.push(span);
      await callWithPromise("updateSpanForLastWeek", user._id, spanForPastWeek);
    }

    // Load busy time async
    try {
      busy = await loadBuzytime(user, min, max);
    } catch (e) {
      console.log(`Error occurred: ${e}`);
    }

    let freeTime = reverse(busy, min, max);

    const { eventPreferences } = config;
    const { preferences } = profile;
    const candidates = Object.keys(preferences || {}).reduce((result, cur) => {
      const res = Object.keys(preferences[cur]).reduce(
        (res, key) => ({ ...res, ...(preferences[cur][key] || {}) }),
        {}
      );

      return {
        ...result,
        [cur]: Object.keys(res).filter(candidate => res[candidate] === true)
      };
    }, {});

    const suggestions = Object.keys(candidates).reduce((result, category) => {
      const es = candidates[category];

      if (!Array.isArray(es) && es.length < 1) {
        return result;
      }

      const optimization = fitOneEvent(
        freeTime,
        eventPreferences[category] || {},
        es
      );

      freeTime = optimization.freeTime;
      return optimization.suggestion != null
        ? [...result, optimization.suggestion]
        : result;
    }, []);

    // Get largest free time
    let time = freeTime.reduce((prev, next) => {
      return new Date(prev.end).getTime() - new Date(prev.start).getTime() >
        new Date(next.end).getTime() - new Date(next.start).getTime()
        ? prev
        : next;
    });

    let suggestion = {
      title: config.defaults.title,
      span,
      time
    };

    suggestion.title = mapPrefToSuggestionTitle(
      _.sample(candidates.productivity)
    );

    if (send) {
      const target = await callWithPromise("getFullUser", user._id);
      sendEmail(suggestions, target);
    }

    console.log(
      `----- Suggestion built up for ${user.services.google.name} -----`
    );
    console.log(suggestions);
    console.log(
      `----- End of Suggestion built up for ${user.services.google.name} -----`
    );
    Meteor.call("updateLastSuggestion", user._id, suggestions[0].time);
    Meteor.call("insertSuggestion", user._id, suggestions);
    return suggestion;
  }

  return null;
};

const trackPastWeekEventSpan = user =>
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

export default processEvents;
