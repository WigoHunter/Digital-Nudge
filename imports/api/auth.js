import { ServiceConfiguration } from "meteor/service-configuration";
import { Accounts } from "meteor/accounts-base";
import keys from "../../keys";

ServiceConfiguration.configurations.upsert(
  { service: "google" },
  {
    $set: {
      loginStyle: "popup",
      clientId: keys.google.id,
      secret: keys.google.secret
    }
  }
);

Accounts.onCreateUser((_, user) => {
  // can use user.nudge as an object to control nudging behavior (i.e. nudge on what days? At what time?)
  user.newUser = true;
  user.lastSuggestion = null;
  return user;
});
