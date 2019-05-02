import { promisesInSequence } from "../utils";

const request = require("requestretry");
const delayMS = 1000;
const maxRetry = 5;

export const retry = (err, response) => {
	let shouldRetry = err || (response.statusCode === 429);
	if (shouldRetry) {
		console.log("retry adding intent...");
	}

	return shouldRetry;
};

const callAddIntent = async options => {
	try {
		const response = await request(options);
		return {
			response
		};
	} catch (err) {
		console.log(err);
	}
};

const addIntents = async config => {
	let promises = [];

	config.intentList.forEach(intent => {
		config.intentName = intent;

		try {
			const jsonBody = {
				"name": config.intentName
			};

			const addIntentPromise = callAddIntent({
				url: config.uri,
				fullResponse: false,
				method: "POST",
				headers: {
					"Ocp-Apim-Subscription-Key": config.LUIS_subscriptionKey
				},
				json: true,
				body: jsonBody,
				maxAttempts: maxRetry,
				retryDelay: delayMS,
				retryStrategy: retry,
			});

			promises.push(addIntentPromise);
		} catch (err) {
			console.log(err);
		}
	}, this);

	promisesInSequence(promises)
		.then(res => {
			console.log("*** Done uploading intents ***");
			res.forEach(response => {
				console.log(response);
			});
		});

	// res.forEach(response => {
	// 	console.log(response);
	// });
};

export default addIntents;