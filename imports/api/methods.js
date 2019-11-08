import { Meteor } from "meteor/meteor";
import { Config } from "../db/configs";
import { Logs } from "../db/logger";
import { logEvent } from "./logger";
import { sendOnboardingEmail } from "./email";

Meteor.methods({
  updateGoal(id, goal) {
    Meteor.users.update(
      { _id: id },
      {
        $set: {
          "nudgeProfile.goal": goal
        }
      }
    );
  },

  updateSendTime(id, sendTime) {
    logEvent("update_send_time", id, { sendTime });
    Meteor.users.update(
      { _id: id },
      {
        $set: {
          "nudgeProfile.sendTime": sendTime
        }
      }
    );
  },

  updatePreferences(id, preferences) {
    logEvent("update_preference", id, preferences);

    const user = Meteor.users.findOne({ _id: id });
    const isOnboardedBefore = user.onboarded || false;

    if (!isOnboardedBefore) {
      Meteor.users.update(
        { _id: id },
        {
          $set: {
            "nudgeProfile.preferences": preferences,
            onboarded: true
          }
        },
        () => {
          sendOnboardingEmail(user);
        }
      );
    } else {
      Meteor.users.update(
        { _id: id },
        {
          $set: {
            "nudgeProfile.preferences": preferences
          }
        }
      );
    }

    return isOnboardedBefore;
  },

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

  insertSuggestion(id, suggestion) {
    const user = Meteor.users.findOne({ _id: id });

    const suggestions =
      user != null && user.nudgeProfile != null
        ? user.nudgeProfile.suggestionHistory || []
        : [];

    Meteor.users.update(
      { _id: id },
      {
        $set: {
          "nudgeProfile.suggestionHistory": [suggestion, ...suggestions]
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
  },

  logWithEventTypeAndPayload(type, id, payload) {
    Logs.insert({
      user: id,
      time: new Date(),
      type,
      data: payload
    });
  },

  logWithEventTypeAndFields(type, id, payload) {
    Logs.insert({
      user: id,
      time: new Date(),
      type,
      ...payload
    });
  },

  getLogs(query = {}) {
    const logs = Logs.find(query)
      .fetch()
      .map(log => {
        const { _id, user, time, type, ...rest } = log;

        return {
          _id,
          user,
          time,
          type,
          data: JSON.stringify(rest)
        };
      });

    return logs;
  }
});
