import { Meteor } from "meteor/meteor";
import { Config } from "../db/configs";

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
