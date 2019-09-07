import { Meteor } from "meteor/meteor";
import { Config } from "../db/configs";

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
