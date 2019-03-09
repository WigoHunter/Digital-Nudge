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
	late: new Date(profile.latest.end.dateTime).getHours() >= config.userTypes.late,
	early: new Date(profile.earliest.start.dateTime).getHours() < config.userTypes.early
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