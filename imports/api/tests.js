import config from "../../nudge-config";
import { eventsToday } from "./calendar";

export const t_suggestion = user => {
	GoogleApi.get("/calendar/v3/calendars/primary/events", {
		user,
		params: {
			timeMin: new Date().toISOString(),
			timeMax: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
		}
	}, (err, res) => {
		if (err || !config.outgoing.includes("email")) {
			return;
		}

		eventsToday(res, user, false);
	});
};