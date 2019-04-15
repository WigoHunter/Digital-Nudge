import { processEvents } from "./calendar";

export const t_suggestion = (user, config, send=false) => {
	GoogleApi.get("/calendar/v3/calendars/primary/events", {
		user,
		params: {
			timeMin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
			timeMax: new Date().toISOString()
		}
	}, (err, res) => {
		if (err || !config.outgoing.includes("email")) {
			return;
		}

		processEvents(res, user, config, send);
	});
};
