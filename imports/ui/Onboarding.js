import React, { useState, useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { genTitle } from "../api/utils";
import { Config } from "../db/configs";
import { withTracker } from "meteor/react-meteor-data";

const _ = require("lodash");

type Props = {
  setPreferences: () => void,
  userId: string,
  preferences?: {
    [string]: boolean
  },
  loading: boolean,
  config: {
    eventPreferences: {
      [string]: any
    },
    [string]: any
  }
};

const genPreferenceState = (preferenceConfig, preferences) => {
  if (preferenceConfig == null || preferences == null) {
    return {};
  }

  return Object.keys(preferenceConfig).reduce((result, category) => {
    const subs = preferenceConfig[category];
    const res = Object.keys(subs).reduce(
      (primaryCategoryObject, subCategory) => {
        const events = preferenceConfig[category][subCategory];
        const thisSubCategoryObject = Object.keys(events).reduce(
          (all, eventName) => {
            return {
              ...all,
              [eventName]: _.get(
                preferences,
                `${category}.${subCategory}.${eventName}`,
                false
              )
            };
          },
          {}
        );

        return {
          ...primaryCategoryObject,
          [subCategory]: thisSubCategoryObject
        };
      },
      {}
    );

    return {
      ...result,
      [category]: res
    };
  }, {});
};

function Onboarding(props: Props) {
  const { preferences, loading, config } = props;
  const [state, setPreferenceState] = useState({});
  const [opens, setOpens] = useState([false, false, false]);

  useEffect(() => {
    if (
      !loading &&
      config != null &&
      config.eventPreferences != null &&
      preferences != null
    ) {
      setPreferenceState(
        genPreferenceState(config.eventPreferences, preferences)
      );
    }
  }, [loading]);

  const handleSubmit = () => {
    Meteor.call("updatePreferences", props.userId, state, () => {
      setTimeout(() => {
        props.setPreferences(false);
      }, 300);
    });
  };

  const handleInputChange = (event, path) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;

    setPreferenceState(_.set({ ...state }, path, value));
  };

  const handleClick = index => {
    setOpens(_.set({ ...opens }, index, !opens[index]));
  };

  let dropdowns = [null, null, null];

  if (!loading && config.eventPreferences) {
    Object.keys(config.eventPreferences).map((category, index) => {
      const subCategory = config.eventPreferences[category];

      if (subCategory) {
        dropdowns[index] = (
          <div className="categoryDropdown" key={"categoryDropdown" + index}>
            {Object.keys(subCategory).map((title, idx) => {
              const subTitles = Object.keys(subCategory[title]);

              return (
                <div className="subCategory" key={"subCategory" + idx}>
                  <b>{title}</b>
                  <hr className="subCategorySplit"></hr>
                  {subTitles.map(sub => {
                    const path = `${category}.${title}.${sub}`;

                    return (
                      <label key={sub}>
                        <input
                          name={sub}
                          type="checkbox"
                          checked={_.get(state, path, false)}
                          onClick={e => handleInputChange(e, path)}
                        />{" "}
                        {genTitle(sub)}
                      </label>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      }
    });
  }

  return (
    <div className="categoryContainer content">
      <h3>Welcome to Digital Nudge</h3>
      <p className="sub" style={{ color: "#fff", margin: "5px 0 30px" }}>
        Help us help you! Tell us what excites you and we will help you schedule
        events you love!
      </p>
      <div className="categoryRow">
        <div>
          <div className="categoryCard" id="productivityCard">
            <a
              href="#"
              id="productivityClick"
              className="categoryClick"
              onClick={() => handleClick(0)}
            >
              Productivity
            </a>
          </div>
          {opens[0] ? dropdowns[0] : null}
        </div>
        <div>
          <div className="categoryCard" id="wellnessCard">
            <a
              href="#"
              id="wellnessClick"
              className="categoryClick"
              onClick={() => handleClick(1)}
            >
              Wellness
            </a>
          </div>
          {opens[1] ? dropdowns[1] : null}
        </div>

        <div>
          <div className="categoryCard" id="leisureCard">
            <a
              href="#"
              id="leisureClick"
              className="categoryClick"
              onClick={() => handleClick(2)}
            >
              Leisure
            </a>
          </div>
          {opens[2] ? dropdowns[2] : null}
        </div>
      </div>
      <div className="onboardingBtn" onClick={() => handleSubmit()}>
        {Object.keys(props.preferences || {}).length > 0 ? "Close" : "Confirm"}
      </div>
    </div>
  );
}

export default withTracker(() => {
  const sub = Meteor.subscribe("config.eventPreferences");
  const loading = !sub.ready();
  const config = Config.findOne();

  return {
    loading,
    config
  };
})(Onboarding);
