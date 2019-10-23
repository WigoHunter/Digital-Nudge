import keys from "../../keys";

const _ = require("lodash");
const eventbrite = require("eventbrite");

const getUserPreferences = preferences => {
  return Object.keys(preferences)
    .map(name => {
      const p = preferences[name];
      const flatten = Object.values(p).reduce(
        (result, v) => ({
          ...result,
          ...v
        }),
        {}
      );

      return Object.keys(flatten).filter(key => flatten[key] === true) && name;
    })
    .filter(Boolean);
};

const mapUserPreferenceToEventbriteCategories = preferences => {
  return _.uniq(
    getUserPreferences(preferences).reduce((result, name) => {
      const categories =
        name === "productivity"
          ? [101, 102]
          : name === "wellness"
          ? [107]
          : name === "leisure"
          ? [110, 104]
          : [];
      return [...result, ...categories];
    }, [])
  );
};

export const getRelevantEventsFromEventbrite = async (preferences = {}) => {
  if (preferences == null || Object.keys(preferences).length == 0) {
    return [];
  }

  const sdk = eventbrite.default({
    token: keys.eventbrite
  });

  const categories = mapUserPreferenceToEventbriteCategories(preferences);

  if (categories.length == 0) {
    return [];
  }

  return new Promise((resolve, reject) => {
    sdk
      .request(
        `/events/search/?categories=${categories.join(
          ","
        )}&start_date.keyword=today&price=free&location.address=New+York+City`
      )
      .then(res => {
        const events = res.events.map(e => {
          const { name, summary, url, start, end, logo } = e;

          return {
            title: name.text,
            summary,
            url,
            time: { start: start.utc, end: end.utc },
            img: logo.url
          };
        });

        resolve(events);
      })
      .catch(e => {
        reject(e);
      });
  });
};
