import { Meteor } from "meteor/meteor";
import { Config } from "../db/configs";

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
    Meteor.users.update(
      { _id: id },
      {
        $set: {
          "nudgeProfile.sendTime": sendTime
        }
      }
    );
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
          "nudgeProfile.suggestionHistory": [...suggestions, suggestion]
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
