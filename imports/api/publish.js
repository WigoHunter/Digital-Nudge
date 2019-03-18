import { Meteor } from "meteor/meteor";

if (Meteor.isServer) {
	Meteor.publish("userData", function() {
		return Meteor.users.find({ _id: this.userId }, {
			fields : {
				_id: 1,
				emails: 1,
				services: 1,
				nudge: 1,
				nudgeProfile: 1
			}
		});
	});
}