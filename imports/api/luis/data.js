import { Meteor } from "meteor/meteor";

const fs = require("fs");
const STUDY = "STUDY";
const CAREER = "CAREER";
const CLASS = "CLASS";
const MEETING = "MEETING";
const HANGOUT = "HANGOUT";
const DATE = "DATE";
const mapSummaryToCategory = {
	"plan": STUDY,
	"Job Related": CAREER,
	"Study": STUDY,
	"許凱鈞": HANGOUT,
	"Career-related": CAREER,
	"Due": STUDY,
	"Kevin's Class Schedule": CLASS,
	"Meetings": MEETING,
	"Workshops": CAREER,
	"Class Schedule": CLASS,
	"Lunch/Dinner": HANGOUT,
	"Date <3": DATE,
	"Self Learn": STUDY,
	"聚會": HANGOUT
};

export const getAllCalendarData = days => {
	const user = Meteor.users.findOne({ "services.google.email": "mattandkevin1060@gmail.com" });

	GoogleApi.get("/calendar/v3/users/me/calendarList", {
		user
	}, (err, res) => {
		if (err) {
			console.log(err);
			return;
		}

		const items = res.items.map(item => ({ id: item.id, summary: item.summary, category: mapSummaryToCategory[item.summary] }));
		let calendars = {};
		let mapIntentToWords = {};

		items.forEach(item => {
			if (item.category == undefined) {
				return;
			}

			if (!calendars.hasOwnProperty(item.category)) {
				calendars[item.category] = [];
			}

			calendars[item.category].push(item.id);
		});

		let promises = [];
		for (const key in calendars) {
			calendars[key].forEach(id => {
				promises.push(new Promise((resolve, reject) => {
					GoogleApi.get(`/calendar/v3/calendars/${id}/events`, {
						user,
						params: {
							timeMax: new Date().toISOString(),
							timeMin: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
						}
					}, (err, res) => {
						if (err) {
							console.log(err);
							reject(null);
						}
	
						if (!mapIntentToWords.hasOwnProperty(key)) {
							mapIntentToWords[key] = [];
						}
						
						mapIntentToWords[key] = mapIntentToWords[key].concat(res.items.map(i => i.summary).filter(e => e != undefined));
						resolve(null);
					});
				}));
			});
		}

		Promise.all(promises)
			.then(() => {
				console.log("FINAL OUTPUT");
				console.log(mapIntentToWords);
				
				for (const key in mapIntentToWords) {
					console.log(`${key}: ${mapIntentToWords[key].length} events`);
				}

				console.log("tranforming into JSON...");

				fs.writeFile(
					`${process.env.PWD}/public/intents.json`,
					JSON.stringify(mapIntentToWords),
					"utf8",
					err => {
						if (err) {
							throw(err);
						}

						console.log("*** data transformed to JSON!");
					});
			})
			.catch(e => {
				console.log(e);
			});
	});
};