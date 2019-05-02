import { promisesInSequence } from "../utils";
import { retry } from "./addIntents";

const request = require("requestretry");
const delayMS = 500;
const maxRetry = 5;

const addExamples = async config => {
	let allExamples = [];

	for (const key in config.data) {
		const allWords = config.data[key];
		allExamples = allExamples.concat(allWords.map(text => ({ text, intentName: key })));
	}

	try {
		const pages = getPagesForBatch(allExamples, config.size);
		let promises = [];
		console.log(pages.length);
		
		pages.forEach(page => {
			const pagePromise = sendBatchToAPI({
				url: config.uri,
				fullResponse: false,
				method: "POST",
				headers: {
					"Ocp-Apim-Subscription-Key": config.LUIS_subscriptionKey
				},
				json: true,
				body: page,
				maxAttempts: maxRetry,
				retryDelay: delayMS,
				retryStrategy: retry
			});

			promises.push(pagePromise);
		});

		promisesInSequence(promises)
			.then(res => {
				res.forEach(response => {
					console.log(response);
				});
			});
	} catch (err) {
		console.log(err);
	}
};

const getPagesForBatch = (batch, maxItems) => {
	try {
		let pages = [];
		let currentPage = 0;
		let pageCount = (batch.length % maxItems == 0) ? Math.round(batch.length / maxItems) : Math.round((batch.length / maxItems) + 1);
	
		for (let i = 0; i < pageCount; i++) {
			const start = currentPage * maxItems;
			const end = start + maxItems;
			const pagedBatch = batch.slice(start, end);

			let j = 0;
			pagedBatch.forEach(item => {
				item.ExampleId = j++;
			});

			pages.push(pagedBatch);
			currentPage++;
		}

		return pages;
	} catch (err) {
		console.log(err);
	}
};

const sendBatchToAPI = async options => {
	try {
		return await request(options);
	} catch (err) {
		console.log(err);
	}
};

export default addExamples;