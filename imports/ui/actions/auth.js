import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";

export function login() {
  return {
    type: "USER_LOGIN",
    data: {
      user: Meteor.user()
    }
  };
}

export function loadingData() {
  return {
    type: "LOADING_DATA",
    data: {}
  };
}

export function doneLoadingData() {
  return {
    type: "DONE_LOADING_DATA",
    data: {}
  };
}

export function loadUser() {
  return dispatch => {
    Tracker.autorun(() => {
      dispatch({
        type: "USER_LOGIN",
        data: {
          user: Meteor.user(),
          subscription: Meteor.subscribe("userData")
        }
      });
    });
  };
}
