import { Meteor } from "meteor/meteor";
import { luisEndpoints } from "../../keys";

const _ = require("lodash");

const findUsageType = (profile, config) => {
  const userUsageTypes = config.userUsageTypes;
  const usages = Object.keys(userUsageTypes).sort(
    (a, b) => userUsageTypes[b] - userUsageTypes[a]
  );
  for (let usage of usages) {
    if (profile.counts >= userUsageTypes[usage]) {
      return usage;
    }
  }

  return "none";
};

const findType = (profile, config) => ({
  late:
    profile.latest == null
      ? false
      : new Date(profile.latest.end.dateTime).getHours() >=
        config.userTypes.late,
  early:
    profile.earliest == null
      ? false
      : new Date(profile.earliest.start.dateTime).getHours() <
        config.userTypes.early
});

export const analyze = (profile, config) => ({
  ...profile,
  userUsageType: findUsageType(profile, config),
  userType: findType(profile, config)
});

export const isDifferentDay = (prev, cur) => {
  return !(
    prev.getFullYear() == cur.getFullYear() &&
    prev.getMonth() == cur.getMonth() &&
    prev.getDate() == cur.getDate()
  );
};

export const getClockTime = rawTime => {
  let hour = Math.floor(rawTime);
  let minute = 60 * (rawTime - hour);
  let t = new Date(2000, 0, 1);
  t.setHours(hour);
  t.setMinutes(minute);
  return t;
};

export const getRawTime = cur => {
  const curHour = cur.getHours();
  const curMinutes = cur.getMinutes();
  return curHour + curMinutes / 60;
};

export const isEarlier = (prev, cur) => {
  const prevHour = prev.getHours();
  const prevMinutes = prev.getMinutes();
  const curHour = cur.getHours();
  const curMinutes = cur.getMinutes();

  return (
    curHour < prevHour || (curHour == prevHour && curMinutes < prevMinutes)
  );
};

export const isLater = (prev, cur) => {
  const prevHour = prev.getHours();
  const prevMinutes = prev.getMinutes();
  const curHour = cur.getHours();
  const curMinutes = cur.getMinutes();

  return (
    curHour > prevHour || (curHour == prevHour && curMinutes > prevMinutes)
  );
};

export const isLonger = (prev, cur) => {
  return (
    new Date(cur.end.dateTime).getTime() -
      new Date(cur.start.dateTime).getTime() >
    new Date(prev.end.dateTime).getTime() -
      new Date(prev.start.dateTime).getTime()
  );
};

export const getNextTime = (time, justCheckDate = false) => {
  if (justCheckDate && time.getTime() < new Date().getTime()) {
    time.setDate(time.getDate() + 1);
    return time;
  }

  let nextScheduledTime = new Date();
  nextScheduledTime.setHours(time.getUTCHours());
  nextScheduledTime.setMinutes(time.getMinutes());
  if (nextScheduledTime.getTime() < new Date().getTime()) {
    nextScheduledTime.setDate(nextScheduledTime.getDate() + 1);
  }

  return nextScheduledTime;
};

// return moment object
export const fromLocalToUTC = (time, timezone = "America/New_York") => {
  return moment.tz(time, "HH:mm", timezone).utc();
};

// return moment object
export const fromUTCToLocal = (time, timezone) => {
  return moment(time, "HH:mm").tz(timezone);
};

export const mostActive = counts => {
  const dates = counts || [];

  switch (dates.indexOf(Math.max(...dates))) {
    case 0:
      return "Sunday";
    case 1:
      return "Monday";
    case 2:
      return "Tuesday";
    case 3:
      return "Wednesday";
    case 4:
      return "Thursday";
    case 5:
      return "Friday";
    case 6:
      return "Saturday";
    default:
      return null;
  }
};

export const trimEvents = events =>
  events
    .filter(
      e =>
        e.status !== "cancelled" &&
        e.start &&
        e.start.dateTime &&
        e.end &&
        e.end.dateTime
    )
    .map(e => ({
      created: e.created,
      end: e.end,
      start: e.start,
      summary: e.summary
    }));

export const reverse = (busy, min, max) => {
  let res = [];
  let start = min;

  busy.forEach(time => {
    res.push({
      start,
      end: time.start
    });

    start = time.end;
  });

  res.push({
    start,
    end: max
  });

  return res;
};

export const calcEventsSpan = events => {
  let span = 0;
  for (let i = 0; i < events.length; i++) {
    let startTime = moment(events[i].start.dateTime);
    let endTime = moment(events[i].end.dateTime);
    let duration = moment.duration(endTime.diff(startTime));
    span += duration.asMinutes();
  }
  return span / 60;
};

export const callWithPromise = (method, ...params) =>
  new Promise((resolve, reject) => {
    Meteor.call(method, ...params, (err, res) => {
      if (err) {
        reject(err);
      }

      resolve(res);
    });
  });

export const promisesInSequence = promises => {
  let results = [];
  return promises
    .reduce((prev, next) => {
      return prev.then(() => {
        return next.then(res => {
          results.push(res);
        });
      });
    }, Promise.resolve())
    .then(() => {
      return results;
    });
};

export const getCategory = event =>
  new Promise((resolve, reject) => {
    fetch(`${luisEndpoints.category}${event}`)
      .then(res => res.json())
      .then(res => {
        resolve(
          res.topScoringIntent && res.topScoringIntent.score > 0.3
            ? res.topScoringIntent.intent
            : "None"
        );
      })
      .catch(() => {
        reject("");
      });
  });

export const getTopic = event =>
  new Promise((resolve, reject) => {
    fetch(`${luisEndpoints.topic}${event}`)
      .then(res => res.json())
      .then(res => {
        resolve(
          res.topScoringIntent && res.topScoringIntent.score > 0.3
            ? res.topScoringIntent.intent
            : "None"
        );
      })
      .catch(() => {
        reject("");
      });
  });

export const average = list =>
  list.reduce((prev, curr) => prev + curr, 0) / list.length;

export const formatTime = time =>
  `${time.getHours() > 9 ? "" : "0"}${time.getHours()}:${
    time.getMinutes() > 9 ? "" : "0"
  }${time.getMinutes()}`;

const fit = (freeTime, eStart, eEnd) => {
  return freeTime.some(time => {
    const start = moment(time.start);
    const end = moment(time.end);

    return start.isSameOrBefore(eStart) && eEnd.isSameOrBefore(end);
  });
};

const updateFreeTime = (freeTime, start, end) => {
  return freeTime.reduce((result, time) => {
    if (fit(freeTime, moment(start), moment(end))) {
      return [
        ...result,
        new Date(time.start).getTime() != start.getTime() && {
          start: time.start,
          end: start.toISOString()
        },
        new Date(time.end) != end.getTime() && {
          start: end.toISOString(),
          end: time.end
        }
      ].filter(Boolean);
    }

    return [...result, time];
  }, []);
};

export const genTitle = name => {
  return [...name]
    .reduce((result, cur) => {
      if (cur >= "A" && cur <= "Z") {
        return [...result, " ", cur.toLowerCase()];
      }

      return [...result, cur];
    })
    .join("");
};

export const fitOneEvent = (freeTime, configPreference, candidates) => {
  let suggestion = null;
  let newFreeTime = null;
  const preferences = Object.keys(configPreference).reduce(
    (res, key) => ({ ...res, ...(configPreference[key] || {}) }),
    {}
  );

  _.shuffle(candidates).forEach(event => {
    if (!preferences.hasOwnProperty(event) || suggestion != null) {
      return;
    }

    const preference = preferences[event];

    preference.timeRange.forEach(time => {
      if (suggestion != null) return;

      const [startStr, endStr] = time.split("-");
      const start = new Date(fromLocalToUTC(startStr).format());
      const end = new Date(start);
      end.setMinutes(start.getMinutes() + preference.duration);
      const upperBound = fromLocalToUTC(endStr);

      while (moment(end).isSameOrBefore(upperBound)) {
        if (suggestion != null) return;

        if (fit(freeTime, moment(start), moment(end))) {
          suggestion = {
            time: {
              start,
              end
            },
            title: genTitle(event)
          };

          newFreeTime = updateFreeTime(freeTime, start, end);
          return;
        }

        start.setMinutes(start.getMinutes() + 30);
        end.setMinutes(end.getMinutes() + 30);
      }
    });
  });

  return {
    freeTime: newFreeTime != null ? newFreeTime : freeTime,
    suggestion
  };
};

export const mapPrefToSuggestionTitle = pref => {
  switch (pref) {
    case "scienceFiction":
      return "Read a science fiction book";
    case "explandingMind":
      return "Read to expand your mind";
    case "workout":
      return "Go workout at a gym";
    case "jogging":
      return "Go jogging";
    case "basketball":
      return "Play some basketball";
    case "homework":
      return "Work on homework";
    case "review":
      return "Review some course materials";
    case "emptyMind":
      return "Meditate and empty my mind";
    case "movie":
      return "Watch a movie!";
    case "boardGames":
      return "Play some board games";
    case "videoGames":
      return "Play some video games";
    case "bar":
      return "Go hang out with friends at bar";
    case "spendTimeGF":
      return "Spend some time with significant others";
    case "mealWithFriend":
      return "Go grab a meal with friends!";
    default:
      return "";
  }
};

// For Preference Migration Helper
type OldPreferenceType = {|
  scienceFiction: boolean,
  expandingMind: boolean,
  workout: boolean,
  jogging: boolean,
  basketball: boolean,
  homework: boolean,
  review: boolean,
  emptyMind: boolean,
  movie: boolean,
  boardGames: boolean,
  videoGames: boolean,
  bar: boolean,
  spendTimeGF: boolean,
  mealWithFriend: boolean
|};

type NewPreferenceType = {|
  productivity: {
    self: {
      workOnSideProject: boolean
    },
    work: {
      workOnHomework: boolean,
      reviewCourseMaterial: boolean
    }
  },

  wellness: {
    physical: {
      workout: boolean,
      playBasketball: boolean,
      goJogging: boolean
    },
    mental: {
      meditationToClearMind: boolean,
      readToExpandMind: boolean
    }
  },

  leisure: {
    personal: {
      readAFictionBook: boolean,
      playVideoGames: boolean,
      spendTimeWithLovedOnes: boolean
    },
    social: {
      hangOutAtABar: boolean,
      haveAMealWithFriends: boolean,
      playBoardGames: boolean,
      goToAMovieWithFriends: boolean
    }
  }
|};

export const mapNewToOld = (
  preference: NewPreferenceType
): OldPreferenceType => {
  if (preference == null || Object.keys(preference).length == 0) {
    return {};
  }

  const {
    productivity: {
      work: { workOnHomework, reviewCourseMaterial }
    },

    wellness: {
      physical: { workout, playBasketball, goJogging },
      mental: { meditationToClearMind, readToExpandMind }
    },

    leisure: {
      personal: { readAFictionBook, playVideoGames, spendTimeWithLovedOnes },
      social: {
        hangOutAtABar,
        haveAMealWithFriends,
        playBoardGames,
        goToAMovieWithFriends
      }
    }
  } = preference;

  return {
    scienceFiction: readAFictionBook,
    expandingMind: readToExpandMind,
    workout: workout,
    jogging: goJogging,
    basketball: playBasketball,
    homework: workOnHomework,
    review: reviewCourseMaterial,
    emptyMind: meditationToClearMind,
    movie: goToAMovieWithFriends,
    boardGames: playBoardGames,
    videoGames: playVideoGames,
    bar: hangOutAtABar,
    spendTimeGF: spendTimeWithLovedOnes,
    mealWithFriend: haveAMealWithFriends
  };
};

export const mapOldToNew = (
  preference: OldPreferenceType,
  defaultValue = false
): NewPreferenceType => {
  if (preference == null || Object.keys(preference).length == 0) {
    return {};
  }

  const {
    scienceFiction,
    expandingMind,
    workout,
    jogging,
    basketball,
    homework,
    review,
    emptyMind,
    movie,
    boardGames,
    videoGames,
    bar,
    spendTimeGF,
    mealWithFriend
  } = preference;

  return {
    productivity: {
      self: {
        workOnSideProject: defaultValue
      },
      work: {
        workOnHomework: homework,
        reviewCourseMaterial: review
      }
    },

    wellness: {
      physical: {
        workout: workout,
        playBasketball: basketball,
        goJogging: jogging
      },
      mental: {
        meditationToClearMind: emptyMind,
        readToExpandMind: expandingMind
      }
    },

    leisure: {
      personal: {
        readAFictionBook: scienceFiction,
        playVideoGames: videoGames,
        spendTimeWithLovedOnes: spendTimeGF
      },
      social: {
        hangOutAtABar: bar,
        haveAMealWithFriends: mealWithFriend,
        playBoardGames: boardGames,
        goToAMovieWithFriends: movie
      }
    }
  };
};
