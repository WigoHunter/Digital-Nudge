import { Meteor } from "meteor/meteor";
import { callWithPromise } from "./utils";

export const logEvent = (type, id, data, callback = () => {}) => {
  Meteor.call("logWithEventTypeAndFields", type, id, data, callback);
};

export const logEventWithPromise = async (type, id, data) => {
  await callWithPromise("logWithEventTypeAndFields", type, id, data);
};
