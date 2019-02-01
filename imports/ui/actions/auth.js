import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";

export function login() {
	return {
		type: "USER_LOGIN",
		data: {
			user: Meteor.user(),
		}
	};
}

export function loadUser() {
	return dispatch => {
		Tracker.autorun(() => {
			dispatch({
				type: "USER_LOGIN",
				data: {
					user: Meteor.user(),
				}
			});
		});
	};
}