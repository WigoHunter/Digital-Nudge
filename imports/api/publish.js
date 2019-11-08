import { Meteor } from "meteor/meteor";
import { Config } from "../db/configs";
import { Logs } from "../db/logger";

if (Meteor.isServer) {
  Meteor.publish("userData", function() {
    return Meteor.users.find(
      { _id: this.userId },
      {
        fields: {
          _id: 1,
          emails: 1,
          services: 1,
          nudgeProfile: 1
        }
      }
    );
  });

  Meteor.publish("onboarded", function() {
    return Meteor.users.find(
      { _id: this.userId },
      {
        fields: {
          onboarded: 1
        }
      }
    );
  });

  Meteor.publish("history", function() {
    return Meteor.users.find(
      { _id: this.userId },
      {
        fields: {
          suggestionHistory: 1
        }
      }
    );
  });

  Meteor.publish("config.eventPreferences", function() {
    return Config.find(
      {},
      {
        fields: {
          eventPreferences: 1
        }
      }
    );
  });

  Meteor.publish("config.background", function() {
    return Config.find(
      {},
      {
        fields: {
          background: 1
        }
      }
    );
  });

  Meteor.publish("config.adjustableSendTime", function() {
    return Config.find(
      {},
      {
        fields: {
          adjustableSendTime: 1
        }
      }
    );
  });

  Meteor.publish("logs.type", function() {
    return Logs.find(
      {},
      {
        fields: {
          type: 1
        }
      }
    );
  });

  Meteor.publish("config.usertype", function() {
    return Config.find(
      {},
      {
        fields: {
          userUsageTypes: 1,
          userTypes: 1
        }
      }
    );
  });
}
