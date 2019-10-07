/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { mostActive, formatTime } from "../api/utils";
import { withTracker } from "meteor/react-meteor-data";
import { Config } from "../db/configs";

const formatMinutes = minutes =>
  `${minutes / 60 > 0 ? `${Math.floor(minutes / 60)} hour(s) ` : ""}${
    minutes % 60 > 0 ? `${minutes % 60} minute(s)` : ""
  }`;

const Report = ({ profile, loading, config, setPreferences }) => {
  if (loading) {
    return null;
  }

  if (!profile || !profile.earliest || !profile.latest || !profile.longest) {
    // Can put user form here...
    return null;
  }

  // const [goal, setGoal] = useState(profile.goal || "");
  const [sendTime, setSendTime] = useState(
    formatTime(new Date(profile.sendTime) || new Date())
  );
  const profileSendTime = new Date(profile.sendTime);
  const formattedProfileSendTime = formatTime(profileSendTime);
  const earliest = new Date(profile.earliest.start.dateTime);
  const latest = new Date(profile.latest.end.dateTime);
  const longest = Math.round(
    (new Date(profile.longest.end.dateTime).getTime() -
      new Date(profile.longest.start.dateTime).getTime()) /
      60000
  );

  const user = Meteor.user();
  const { adjustableSendTime } = config;
  const history = profile.suggestionHistory || user.suggestionHistory || [];

  // const _updateGoal = e => {
  //   e.preventDefault();
  //   Meteor.call("updateGoal", user._id, goal);
  // };

  const _updateSendTime = e => {
    e.preventDefault();
    const [hour, minute] = sendTime.split(":");

    if (hour > 24 || hour < 0 || minute > 60 || minute < 0) {
      alert("not a valid time!");
      return;
    }

    profileSendTime.setHours(hour);
    profileSendTime.setMinutes(minute);
    Meteor.call("updateSendTime", user._id, profileSendTime);
  };

  return (
    <div className="full-report">
      <div className="left">
        <div className="report report-box">
          <h4>Analysis Report</h4>
          <p>{`Thank you for using Digital Nudge platform. We have analyzed your calendar usage in the past 4 weeks. You had ${
            profile.counts
          } events planned and was most active on ${mostActive(
            profile.countsOnDays
          )}.`}</p>
          {adjustableSendTime ? (
            <div className="time-picker">
              <h4>Productivity Nudges</h4>
              <p className="sub">
                Based on our analysis, we are planning to send you daily emails
                for event suggestions at {formatTime(new Date(profileSendTime))}
                . But feel free to tell us explicitly when you would like to
                receive these emails!
              </p>
              <form
                onSubmit={_updateSendTime}
                disabled={formattedProfileSendTime === sendTime}
              >
                <input
                  type="text"
                  value={sendTime}
                  onChange={e => setSendTime(e.target.value)}
                />
                <input
                  type="submit"
                  value="Submit"
                  disabled={formattedProfileSendTime === sendTime}
                />
              </form>
            </div>
          ) : (
            <ul>
              <li>
                {`Earliest event: ${`${
                  earliest.getHours() < 10 ? "0" : ""
                }${earliest.getHours()}`}:${`${
                  earliest.getMinutes() < 10 ? "0" : ""
                }${earliest.getMinutes()}`}`}
                <span>{profile.earliest.summary}</span>
              </li>
              <li>
                {`Latest event: ${`${
                  latest.getHours() < 10 ? "0" : ""
                }${latest.getHours()}`}:${`${
                  latest.getMinutes() < 10 ? "0" : ""
                }${latest.getMinutes()}`}`}
                <span>{profile.latest.summary}</span>
              </li>
              <li>
                {`Longest event: ${formatMinutes(longest)}`}
                <span>{profile.longest.summary}</span>
              </li>
            </ul>
          )}

          {/* <h3>Catogories</h3>
        <div className="tags">
          <div>
            {`${profile.userUsageType} Usage`}
            <span>
              (more than {config.userUsageTypes[profile.userUsageType]} events
              planned)
            </span>
          </div>
          {profile.userType.late && (
            <div>
              Works Late
              <span>
                (has events later than {`${config.userTypes.late}:00`})
              </span>
            </div>
          )}
          {profile.userType.early && (
            <div>
              Starts Days Early
              <span>
                (has events as early as {`${config.userTypes.early}:00`})
              </span>
            </div>
          )}
        </div> */}
        </div>

        <div className="action report-box">
          <h4>Tell Us Your Goal</h4>
          <p className="sub">
            In the daily email, we look for your free time on the day, predict
            and suggest the best time you work on this goal in the day!
          </p>
          <button onClick={() => setPreferences(true)} className="outline">
            Set Goals
          </button>
          {/* <form onSubmit={_updateGoal} disabled={profile.goal === goal}>
            <input
              type="text"
              value={goal}
              onChange={e => setGoal(e.target.value)}
            />
            <input
              type="submit"
              value="Submit"
              disabled={profile.goal === goal}
            />
          </form> */}
        </div>
      </div>

      <div className="right report-box">
        <h4>Suggestion History</h4>
        <ul
          className="history"
          style={{ maxHeight: "400px", overflowY: "scroll" }}
        >
          {history.map((suggestions, index) => {
            if (suggestions.length < 1) {
              return;
            }

            const {
              time: { start }
            } = suggestions[0];

            const startTime = new Date(start);

            return (
              <li key={`${suggestions[0].time.start}-${index}`}>
                <p className="sug-send">
                  {startTime.getMonth() + 1}/{startTime.getDate()}
                </p>
                {suggestions
                  .sort((a, b) => a.time.start - b.time.start)
                  .map((suggestion, index) => (
                    <span key={`${suggestion.time.end}-${index * 100}`}>
                      <p className="sug-title">{suggestion.title}</p>
                      <p className="sug-time">
                        {formatTime(new Date(suggestion.time.start))} -{" "}
                        {formatTime(new Date(suggestion.time.end))}
                      </p>
                    </span>
                  ))}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default withTracker(() => {
  const sub = Meteor.subscribe("config.adjustableSendTime");
  const subHistory = Meteor.subscribe("history");
  const loading = !sub.ready() || !subHistory.ready();
  const config = Config.findOne();

  return {
    loading,
    config
  };
})(Report);
