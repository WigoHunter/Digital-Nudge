import React from "react";
import { Meteor } from "meteor/meteor";

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

    this.state = {
      hover: 0,
      scienceFiction: false,
      explandingMind: false,
      workout: false,
      jogging: false,
      basketball: false,
      homework: false,
      review: false,
      emptyMind: false,
      movie: false,
      boardGames: false,
      videoGames: false,
      bar: false,
      spendTimeGF: false,
      mealWithFriend: false,
      ...(props.preferences || {})
    };
  }

  handleSubmit = () => {
    // eslint-disable-next-line no-unused-vars
    const { hover, ...rest } = this.state;

    Meteor.call("updatePreferences", this.props.userId, rest, () => {
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

  render() {
    return (
      <div className="categoryContainer content">
        <h3>Welcome to Digital Nudge</h3>
        <p className="sub" style={{ color: "#fff", margin: "5px 0 30px" }}>
          Help us help you! Tell us what excites you and we will help you
          schedule events you love!
        </p>
        <div className="categoryRow">
          <div
            className="categoryCard"
            onMouseEnter={() => {
              this.setState({ hover: 1 });
            }}
            onMouseLeave={() => {
              this.setState({ hover: 0 });
            }}
          >
            {this.state.hover === 1 ? (
              <div className="subCategoryContainer">
                <label>
                  <input
                    name="explandingMind"
                    type="checkbox"
                    checked={this.state.explandingMind}
                    onClick={this.handleInputChange}
                  />{" "}
                  Read to expand your mind
                </label>
                <label>
                  <input
                    name="scienceFiction"
                    type="checkbox"
                    checked={this.state.scienceFiction}
                    onClick={this.handleInputChange}
                  />{" "}
                  Read a science fiction
                </label>
              </div>
            ) : (
              <h2>Reading</h2>
            )}
          </div>
          <div
            className="categoryCard"
            onMouseEnter={() => {
              this.setState({ hover: 2 });
            }}
            onMouseLeave={() => {
              this.setState({ hover: 0 });
            }}
          >
            {this.state.hover === 2 ? (
              <div className="subCategoryContainer">
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
                    name="jogging"
                    type="checkbox"
                    checked={this.state.jogging}
                    onClick={this.handleInputChange}
                  />{" "}
                  Jogging
                </label>
                <label>
                  <input
                    name="basketball"
                    type="checkbox"
                    checked={this.state.basketball}
                    onClick={this.handleInputChange}
                  />{" "}
                  Basketball
                </label>
              </div>
            ) : (
              <h2>Exercising</h2>
            )}
          </div>
          <div
            className="categoryCard"
            onMouseEnter={() => {
              this.setState({ hover: 3 });
            }}
            onMouseLeave={() => {
              this.setState({ hover: 0 });
            }}
          >
            {this.state.hover === 3 ? (
              <div className="subCategoryContainer">
                <label>
                  <input
                    name="homework"
                    type="checkbox"
                    checked={this.state.homework}
                    onClick={this.handleInputChange}
                  />{" "}
                  Work on homework
                </label>
                <label>
                  <input
                    name="review"
                    type="checkbox"
                    checked={this.state.review}
                    onClick={this.handleInputChange}
                  />{" "}
                  Review course material
                </label>
              </div>
            ) : (
              <h2>Academic</h2>
            )}
          </div>
        </div>
        <div className="categoryRow">
          <div
            className="categoryCard"
            onMouseEnter={() => {
              this.setState({ hover: 4 });
            }}
            onMouseLeave={() => {
              this.setState({ hover: 0 });
            }}
          >
            {this.state.hover === 4 ? (
              <div className="subCategoryContainer">
                <label>
                  <input
                    name="emptyMind"
                    type="checkbox"
                    checked={this.state.emptyMind}
                    onClick={this.handleInputChange}
                  />{" "}
                  Empty your mind
                </label>
              </div>
            ) : (
              <h2>Meditation</h2>
            )}
          </div>
          <div
            className="categoryCard"
            onMouseEnter={() => {
              this.setState({ hover: 5 });
            }}
            onMouseLeave={() => {
              this.setState({ hover: 0 });
            }}
          >
            {this.state.hover === 5 ? (
              <div className="subCategoryContainer">
                <label>
                  <input
                    name="movie"
                    type="checkbox"
                    checked={this.state.movie}
                    onClick={this.handleInputChange}
                  />{" "}
                  Watch a movie
                </label>
                <label>
                  <input
                    name="videoGames"
                    type="checkbox"
                    checked={this.state.videoGames}
                    onClick={this.handleInputChange}
                  />{" "}
                  Play video games
                </label>
                <label>
                  <input
                    name="boardGames"
                    type="checkbox"
                    checked={this.state.boardGames}
                    onClick={this.handleInputChange}
                  />{" "}
                  Play board games
                </label>
              </div>
            ) : (
              <h2>Hobbies</h2>
            )}
          </div>
          <div
            className="categoryCard"
            onMouseEnter={() => {
              this.setState({ hover: 6 });
            }}
            onMouseLeave={() => {
              this.setState({ hover: 0 });
            }}
          >
            {this.state.hover === 6 ? (
              <div className="subCategoryContainer">
                <label>
                  <input
                    name="spendTimeGF"
                    type="checkbox"
                    checked={this.state.spendTimeGF}
                    onClick={this.handleInputChange}
                  />{" "}
                  Spend time with girlfriend
                </label>
                <label>
                  <input
                    name="mealWithFriend"
                    type="checkbox"
                    checked={this.state.mealWithFriend}
                    onClick={this.handleInputChange}
                  />{" "}
                  Grab a meal with friends
                </label>
                <label>
                  <input
                    name="bar"
                    type="checkbox"
                    checked={this.state.bar}
                    onClick={this.handleInputChange}
                  />{" "}
                  Hang out at a Bar
                </label>
              </div>
            ) : (
              <h2>Social</h2>
            )}
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
