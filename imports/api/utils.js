const findUsageType = (profile, config) => {
	const userUsageTypes = config.userUsageTypes;
	const usages = Object.keys(userUsageTypes).sort((a, b) => userUsageTypes[b] - userUsageTypes[a]);
	for (let usage of usages) {
		if (profile.counts >= userUsageTypes[usage]) {
			return usage;
		}
	}

	return "none";
};

const findType = (profile, config) => ({
	late: profile.latest == null ? false : new Date(profile.latest.end.dateTime).getHours() >= config.userTypes.late,
	early: profile.earliest == null ? false : new Date(profile.earliest.start.dateTime).getHours() < config.userTypes.early
});

export const analyze = (profile, config) => ({
	...profile,
	userUsageType: findUsageType(profile, config),
	userType: findType(profile, config)
});


export const isEarlier = (prev, cur) => {
	const prevHour = prev.getHours();
	const prevMinutes = prev.getMinutes();
	const curHour = cur.getHours();
	const curMinutes = cur.getMinutes();

	return (curHour < prevHour || (curHour == prevHour && curMinutes < prevMinutes));
};

export const isLater = (prev, cur) => {
	const prevHour = prev.getHours();
	const prevMinutes = prev.getMinutes();
	const curHour = cur.getHours();
	const curMinutes = cur.getMinutes();

	return (curHour > prevHour || (curHour == prevHour && curMinutes > prevMinutes));
};

export const isLonger = (prev, cur) => {
	return (new Date(cur.end.dateTime).getTime() - new Date(cur.start.dateTime).getTime()) >
		(new Date(prev.end.dateTime).getTime() - new Date(prev.start.dateTime).getTime());
};

export const getNextTime = (time, justCheckDate=false) => {
	if (justCheckDate && time.getTime() < new Date().getTime()) {
		time.setDate(time.getDate() + 1);
		return time;
	}

	let nextScheduledTime = new Date();
	nextScheduledTime.setHours(time.getUTCHours());
	nextScheduledTime.setMinutes(time.getMinutes());
	if (nextScheduledTime.getTime() < new Date().getTime()) {
		nextScheduledTime.setDate(nextScheduledTime.getDate() + 1);
	}

	return nextScheduledTime;
};

// return moment object
export const fromLocalToUTC = (time, timezone) => {
	return moment.tz(time, "HH:mm", timezone).utc();
};

// return moment object
export const fromUTCToLocal = (time, timezone) => {
	return moment(time, "HH:mm").tz(timezone);
};

export const mostActive = counts => {
	const dates = counts || [];

	switch(dates.indexOf(Math.max(...dates))) {
	case 0:
		return "Sunday";
	case 1:
		return "Monday";
	case 2:
		return "Tuesday";
	case 3:
		return "Wednesday";
	case 4:
		return "Thursday";
	case 5:
		return "Friday";
	case 6:
		return "Saturday";
	default:
		return null;
	}
};

export const trimEvents = events => events
	.filter(e => (e.status !== "cancelled" && e.start && e.start.dateTime && e.end && e.end.dateTime))
	.map(e => ({
		created: e.created,
		end: e.end,
		start: e.start,
		summary: e.summary
	}));

export const reverse = (busy, min, max) => {
	let res = [];
	let start = min;

	busy.forEach(time => {
		res.push({
			start,
			end: time.start
		});

		start = time.end;
	});

	res.push({
		start,
		end: max
	});

	return res;
};

export const calcEventsSpan = (events) => {
	let span = 0;
	for (let i=0; i<events.length; i++){
		let startTime = moment(events[i].start.dateTime);
		let endTime = moment(events[i].end.dateTime);
		let duration = moment.duration(endTime.diff(startTime));
		span += duration.hours();
	}
	return span;
};
