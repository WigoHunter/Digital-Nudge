import { promisesInSequence } from "../utils";
import keys from "../../../keys";
import meetup1 from "../../../public/meetup-1.json";
import meetup2 from "../../../public/meetup-2.json";
import meetup3 from "../../../public/meetup-3.json";
import meetup4 from "../../../public/meetup-4.json";
import meetup5 from "../../../public/meetup-5.json";

const fs = require("fs");
const index = 5;
var results = {};

export const compileMeetupData = () => {
	let data = {
		...meetup1,
		...meetup2,
		...meetup3,
		...meetup4,
		...meetup5
	};

	Object.keys(data).forEach(key => {
		if (key.startsWith("?")) {
			delete data[key];
		}
	});

	return data;
};

const getMeetup = () => {
	const meetup = require("meetup-api")({
		key: keys.meetup
	});

	// meetup.getOpenEvents({ category: "31" }, function(err, resp) {
	// 	console.log(err);
	// 	console.log(resp);
	// });

	meetup.getCategories({}, async (err, res) => {
		if (err) {
			console.log(err);
			return;
		}

		let promises = [];
		res.results.forEach(category => {
			// Testing purpose - not running over the rate limit
			if (category.id > 10 * index || category.id <= 10 * (index - 1)){
				return;
			}

			promises.push(new Promise((resolve, reject) => {
				console.log(`Getting data of category #${category.id}`);

				meetup.getOpenEvents({ category: category.id, page: 200 }, (err, res) => {
					if (err || !res.results) {
						console.log(`${category.shortname}: error`);
						console.log(err);
						reject(err);
					}
					
					results[category.shortname] = res.results.map(result => result.name);
					resolve(res);
				});
			}));
		});

		promisesInSequence(promises)
			.then(() => {
				// output this to json format. Do this every hour, to gather data of a total of 42 categories
				fs.writeFile(
					`${process.env.PWD}/public/meetup-${index}.json`,
					JSON.stringify(results),
					"utf8",
					err => {
						if (err) {
							throw(err);
						}

						console.log("*** data transformed to JSON!");
					});
			})
			.catch(e => {
				console.log("---- error ----");
				console.log(e);
				console.log("---- results ----");
				console.log(results);
			});
	});
};

export default getMeetup;