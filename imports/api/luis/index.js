import config from "../../../keys";
import intents from "../../../public/intents";

// Push to LUIS server
// import addIntents from "./addIntents";
// import addExamples from "./addExamples";

const { key, id, version } = config.luis;

// eslint-disable-next-line no-unused-vars
const addIntentsConfig = {
	LUIS_subscriptionKey: key,
	LUIS_appId: id,
	LUIS_versionId: version,
	intentList: Object.keys(intents),
	uri: `https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/${id}/versions/${version}/intents`
};

// eslint-disable-next-line no-unused-vars
const addExamplesConfig = {
	LUIS_subscriptionKey: key,
	LUIS_appId: id,
	LUIS_versionId: version,
	size: 100,
	data: intents,
	uri: `https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/${id}/versions/${version}/examples`
};

export default (() => {
	// addIntents(addIntentsConfig);
	// addExamples(addExamplesConfig);

	/*
	I20190428-15:44:43.812(-4)? STUDY: 330
	I20190428-15:44:43.813(-4)? CAREER: 74
	I20190428-15:44:43.813(-4)? DATE: 5
	I20190428-15:44:43.813(-4)? HANGOUT: 188
	I20190428-15:44:43.813(-4)? MEETING: 61
	I20190428-15:44:43.813(-4)? CLASS: 188
	*/
});
