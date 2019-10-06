import React from "react";
import { Meteor } from "meteor/meteor";
import { mapOldToNew, mapNewToOld } from "../api/utils";

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

    const preferences = mapNewToOld(props.preferences) || {};

    // Kevin's Todo: read this default state from config file. Use these field names to generate activity titles (i.e. "meditationToClearMind" => "meditation to clear mind").
    // updatePreferences hard reset to this structure anyways.
    // And then retire the mapNewToOld function.

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

  handleClick = (event) => {
    const value = !this.state[event.target.id];
    this.setState({
      [event.target.id]: value
    });
  }

  render() {
    return (
      <div className="categoryContainer content">
        <h3>Welcome to Digital Nudge</h3>
        <p className="sub" style={{ color: "#fff", margin: "5px 0 30px" }}>
          Help us help you! Tell us what excites you and we will help you
          schedule events you love!
        </p>
        <div className="categoryRow">
          <div>
            <div className="categoryCard" onClick={this.handleClick} id='productivityClick'>
              <h2>Productivity</h2>
            </div>
            {this.state.productivityClick ?
              <div className="categoryDropdown">
                <div className="subCategory">
                  <b>Self</b>
                  <hr className="subCategorySplit"></hr>
                  <label>
                    <input
                      name="workOnSideProject"
                      type="checkbox"
                      checked={this.state.workOnSideProject}
                      onClick={this.handleInputChange}
                    />{" "}
                    Work on side project
                </label>
                </div>
                <div className="subCategory">
                  <b>Work/Academic</b>
                  <hr className="subCategorySplit"></hr>
                  <label>
                    <input
                      name="workOnHomework"
                      type="checkbox"
                      checked={this.state.workOnHomework}
                      onClick={this.handleInputChange}
                    />{" "}
                    Work on homework
                </label>
                  <label>
                    <input
                      name="reviewCourseMaterial"
                      type="checkbox"
                      checked={this.state.reviewCourseMaterial}
                      onClick={this.handleInputChange}
                    />{" "}
                    Review course material
                </label>
                </div>
              </div> : null
            }
          </div>
          <div>
            <div className="categoryCard" onClick={this.handleClick} id='wellnessClick'>
              <h2>Wellness</h2>
            </div>
            {this.state.wellnessClick ?
              <div className="categoryDropdown">
                <div className="subCategory">
                  <b>Physical</b>
                  <hr className="subCategorySplit"></hr>
                  <label>
                    <input
                      name="workout"
                      type="checkbox"
                      checked={this.state.workout}
                      onClick={this.handleInputChange}
                    />{" "}
                    Workout
                </label>
                  <label>
                    <input
                      name="playBasketball"
                      type="checkbox"
                      checked={this.state.playBasketball}
                      onClick={this.handleInputChange}
                    />{" "}
                    Play basketball
                </label>
                  <label>
                    <input
                      name="goJogging"
                      type="checkbox"
                      checked={this.state.goJogging}
                      onClick={this.handleInputChange}
                    />{" "}
                    Go jogging
                </label>
                </div>
                <div className="subCategory">
                  <b>Mental</b>
                  <hr className="subCategorySplit"></hr>
                  <label>
                    <input
                      name="meditationToClearMind"
                      type="checkbox"
                      checked={this.state.meditationToClearMind}
                      onClick={this.handleInputChange}
                    />{" "}
                    Meditate to clear mind
                </label>
                  <label>
                    <input
                      name="readToExpandMind"
                      type="checkbox"
                      checked={this.state.readToExpandMind}
                      onClick={this.handleInputChange}
                    />{" "}
                    Read to expand mind
                </label>
                </div>
              </div>
              : null
            }
          </div>

          <div>
            <div className="categoryCard" onClick={this.handleClick} id='leisureClick'>
              <h2>Leisure</h2>
            </div>
            {this.state.leisureClick ?
              <div className="categoryDropdown">
                <div className="subCategory">
                  <b>Personal</b>
                  <hr className="subCategorySplit"></hr>
                  <label>
                    <input
                      name="readAFictionBook"
                      type="checkbox"
                      checked={this.state.readAFictionBook}
                      onClick={this.handleInputChange}
                    />{" "}
                    Read a fiction book
                </label>
                  <label>
                    <input
                      name="playVideoGames"
                      type="checkbox"
                      checked={this.state.playVideoGames}
                      onClick={this.handleInputChange}
                    />{" "}
                    Play video games
                </label>
                  <label>
                    <input
                      name="spendTimeWithLovedOnes"
                      type="checkbox"
                      checked={this.state.spendTimeWithLovedOnes}
                      onClick={this.handleInputChange}
                    />{" "}
                    Spend time with loved ones
                </label>
                </div>
                <div className="subCategory">
                  <b>Social</b>
                  <hr className="subCategorySplit"></hr>
                  <label>
                    <input
                      name="hangOutAtABar"
                      type="checkbox"
                      checked={this.state.hangOutAtABar}
                      onClick={this.handleInputChange}
                    />{" "}
                    Hang out at a bar
                </label>
                  <label>
                    <input
                      name="haveAMealWithFriends"
                      type="checkbox"
                      checked={this.state.haveAMealWithFriends}
                      onClick={this.handleInputChange}
                    />{" "}
                    Have a meal with friends
                </label>
                  <label>
                    <input
                      name="playBoardGames"
                      type="checkbox"
                      checked={this.state.playBoardGames}
                      onClick={this.handleInputChange}
                    />{" "}
                    Play board games
                </label>
                  <label>
                    <input
                      name="goToAMovieWithFriends"
                      type="checkbox"
                      checked={this.state.goToAMovieWithFriends}
                      onClick={this.handleInputChange}
                    />{" "}
                    Go to a movie with friends
                </label>
                </div>
              </div>
              : null
            }
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

export default Onboarding;
