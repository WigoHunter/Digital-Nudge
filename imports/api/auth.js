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
	return user;
});