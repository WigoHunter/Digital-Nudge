import config from "../../../keys";
// import intents from "../../../public/intents";

// Push to LUIS server
// import addIntents from "./addIntents";
// import addExamples from "./addExamples";
import { compileMeetupData } from "./meetup";

// const { key, id, version } = config.luis;
const { key, id, version } = config.luisNudgeTopics;
const data = compileMeetupData();

// eslint-disable-next-line no-unused-vars
let addIntentsConfig = {
  LUIS_subscriptionKey: key,
  LUIS_appId: id,
  LUIS_versionId: version,
  intentList: Object.keys(data),
  uri: `https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/${id}/versions/${version}/intents`
};

// eslint-disable-next-line no-unused-vars
let addExamplesConfig = {
  LUIS_subscriptionKey: key,
  LUIS_appId: id,
  LUIS_versionId: version,
  size: 100,
  data: data,
  uri: `https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/${id}/versions/${version}/examples`
};

export default () => {
  // addIntents(addIntentsConfig);
  // addExamples(addExamplesConfig);
  // getMeetup();
  // console.log(Object.keys(compileMeetupData()));
  // Upload with Meetup data
};
