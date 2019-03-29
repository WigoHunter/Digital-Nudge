/* eslint-disable react/prop-types */
import React from "react";
import { mostActive } from "../api/utils";
import config from "../../nudge-config";

const formatMinutes = minutes => `${minutes / 60 > 0 ? `${Math.floor(minutes / 60)} hour(s) ` : ""}${minutes % 60 > 0 ? `${minutes % 60} minute(s)` : ""}`;

const Report = ({ profile }) => {
	if (!profile || !profile.earliest || !profile.latest || !profile.longest) {
		// Can put user form here...
		return null;
	}

	const earliest = new Date(profile.earliest.start.dateTime);
	const latest = new Date(profile.latest.end.dateTime);
	const longest = Math.round((new Date(profile.longest.end.dateTime).getTime() - new Date(profile.longest.start.dateTime).getTime()) / 60000);

	return (
		<div className="report">
			<p>{`Thank you for using Digital Nudge platform. We have analyzed your calendar usage in the past 4 weeks. You had ${profile.counts} events planned and was most active on ${mostActive(profile.countsOnDays)}.`}</p>
			<ul>
				<li>{`Earliest event: ${`${earliest.getHours() < 10 ? "0" : ""}${earliest.getHours()}`}:${`${earliest.getMinutes() < 10 ? "0" : ""}${earliest.getMinutes()}`}`}<span>{profile.earliest.summary}</span></li>
				<li>{`Latest event: ${`${latest.getHours() < 10 ? "0" : ""}${latest.getHours()}`}:${`${latest.getMinutes() < 10 ? "0" : ""}${latest.getMinutes()}`}`}<span>{profile.latest.summary}</span></li>
				<li>{`Longest event: ${formatMinutes(longest)}`}<span>{profile.longest.summary}</span></li>
			</ul>
			<h3>Catogories</h3>
			<div className="tags">
				<div>{`${profile.userUsageType} Usage`}<span>(more than {config.userUsageTypes[profile.userUsageType]} events planned)</span></div>
				{profile.userType.late && <div>Works Late<span>(has events later than {`${config.userTypes.late}:00`})</span></div>}
				{profile.userType.early && <div>Starts Days Early<span>(has events as early as {`${config.userTypes.early}:00`})</span></div>}
			</div>
		</div>
	);
};

export default Report;