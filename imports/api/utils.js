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

export const getNextTime = earliest => {
	let nextScheduledTime = new Date();
	nextScheduledTime.setHours(earliest.getUTCHours());
	nextScheduledTime.setMinutes(earliest.getMinutes());
	if (nextScheduledTime.getTime() < new Date().getTime()) {
		nextScheduledTime.setDate(nextScheduledTime.getDate() + 1);
	}

	return nextScheduledTime;
};

export const fromLocalToUTC = (hour, offset) => {
	const h = hour + Math.floor(offset / 60);
	return {
		addOne: h >= 24,
		h: h % 24
	};
};

export const fromUTCToLocal = (hour, offset) => {
	console.log(hour);
	console.log(offset);
	const h = hour - Math.floor(offset / 60);
	return {
		minusOne: h < 0,
		h: h < 0 ? h + 24 : h
	};
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