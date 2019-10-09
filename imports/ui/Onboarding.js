import React from "react";
import { Meteor } from "meteor/meteor";
import { flattenPreference, genTitle } from "../api/utils";
import { Config } from "../db/configs";
import { withTracker } from "meteor/react-meteor-data";

type Props = {
  setPreferences: () => void,
  userId: string,
  preferences?: {
    [string]: boolean
  }
};

class Onboarding extends React.Component<Props> {
  constructor(props) {
    super(props);

    const preferences = flattenPreference(props.preferences) || {};

    this.state = {
      productivityClick: false,
      wellnessClick: false,
      leisureClick: false,
      workOnSideProject: false,
      workOnHomework: false,
      reviewCourseMaterial: false,
      workout: false,
      playBasketball: false,
      goJogging: false,
      meditationToClearMind: false,
      readToExpandMind: false,
      readAFictionBook: false,
      playVideoGames: false,
      spendTimeWithLovedOnes: false,
      hangOutAtABar: false,
      haveAMealWithFriends: false,
      playBoardGames: false,
      goToAMovieWithFriends: false,
      ...preferences
    };
  }

  handleSubmit = () => {
    const preferences = {
      productivity: {
        self: {
          workOnSideProject: this.state.workOnSideProject
        },
        work: {
          workOnHomework: this.state.workOnHomework,
          reviewCourseMaterial: this.state.reviewCourseMaterial
        }
      },

      wellness: {
        physical: {
          workout: this.state.workout,
          playBasketball: this.state.playBasketball,
          goJogging: this.state.goJogging
        },
        mental: {
          meditationToClearMind: this.state.meditationToClearMind,
          readToExpandMind: this.state.readToExpandMind
        }
      },

      leisure: {
        personal: {
          readAFictionBook: this.state.readAFictionBook,
          playVideoGames: this.state.playVideoGames,
          spendTimeWithLovedOnes: this.state.spendTimeWithLovedOnes
        },
        social: {
          hangOutAtABar: this.state.hangOutAtABar,
          haveAMealWithFriends: this.state.haveAMealWithFriends,
          playBoardGames: this.state.playBoardGames,
          goToAMovieWithFriends: this.state.goToAMovieWithFriends
        }
      }
    };

    Meteor.call("updatePreferences", this.props.userId, preferences, () => {
      setTimeout(() => {
        this.props.setPreferences(false);
      }, 300);
    });
  };

  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  };

  handleClick = event => {
    const value = !this.state[event.target.id];
    this.setState({
      [event.target.id]: value
    });
  };

  render() {
    let dropdowns = [null, null, null];

    if (!this.props.loading && this.props.config.eventPreferences) {
      Object.keys(this.props.config.eventPreferences).map((category, index) => {
        const subCategory = this.props.config.eventPreferences[category];
        if (subCategory) {
          dropdowns[index] = (
            <div className="categoryDropdown" key={"categoryDropdown" + index}>
              {Object.keys(subCategory).map((title, idx) => {
                const subTitles = Object.keys(subCategory[title]);

                return (
                  <div className="subCategory" key={"subCategory" + idx}>
                    <b>{title}</b>
                    <hr className="subCategorySplit"></hr>
                    {subTitles.map(sub => (
                      <label key={sub}>
                        <input
                          name={sub}
                          type="checkbox"
                          checked={this.state[sub]}
                          onClick={this.handleInputChange}
                        />{" "}
                        {genTitle(sub)}
                      </label>
                    ))}
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
          Help us help you! Tell us what excites you and we will help you
          schedule events you love!
        </p>
        <div className="categoryRow">
          <div>
            <div className="categoryCard" id="productivityCard">
              <a
                href="#"
                id="productivityClick"
                className="categoryClick"
                onClick={this.handleClick}
              >
                Productivity
              </a>
            </div>
            {this.state.productivityClick ? dropdowns[0] : null}
          </div>
          <div>
            <div className="categoryCard" id="wellnessCard">
              <a
                href="#"
                id="wellnessClick"
                className="categoryClick"
                onClick={this.handleClick}
              >
                Wellness
              </a>
            </div>
            {this.state.wellnessClick ? dropdowns[1] : null}
          </div>

          <div>
            <div className="categoryCard" id="leisureCard">
              <a
                href="#"
                id="leisureClick"
                className="categoryClick"
                onClick={this.handleClick}
              >
                Leisure
              </a>
            </div>
            {this.state.leisureClick ? dropdowns[2] : null}
          </div>
        </div>
        <div className="onboardingBtn" onClick={() => this.handleSubmit()}>
          {Object.keys(this.props.preferences || {}).length > 0
            ? "Close"
            : "Confirm"}
        </div>
      </div>
    );
  }
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
