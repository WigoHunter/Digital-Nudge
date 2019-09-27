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
      historicalNovel: false,
      workout: false,
      jogging: false,
      homework: false,
      preview: false,
      emptyMind: false,
      nightclub: false,
      karaoke: false,
      bar: false,
      shopGirl: false,
      dinnerFriend: false,
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
      <div className="categoryContainer">
        <h1 style={{ color: "white" }}>Welcome to Digital Nudges</h1>
        <h4 style={{ color: "white" }}>
          We want to know more about you, pick up anything you are interested
          with
        </h4>
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
                    name="scienceFiction"
                    id="scienceFiction"
                    type="checkbox"
                    checked={this.state.scienceFiction}
                    onClick={this.handleInputChange}
                  />{" "}
                  Science Fiction
                </label>
                <label>
                  <input
                    name="historicalNovel"
                    type="checkbox"
                    checked={this.state.historicalNovel}
                    onClick={this.handleInputChange}
                  />{" "}
                  Historical Novel
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
                  Work out
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
                  Do homework
                </label>
                <label>
                  <input
                    name="preview"
                    type="checkbox"
                    checked={this.state.preview}
                    onClick={this.handleInputChange}
                  />{" "}
                  Preview material
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
                    name="nightclub"
                    type="checkbox"
                    checked={this.state.nightclub}
                    onClick={this.handleInputChange}
                  />{" "}
                  Nightclub
                </label>
                <label>
                  <input
                    name="karaoke"
                    type="checkbox"
                    checked={this.state.karaoke}
                    onClick={this.handleInputChange}
                  />{" "}
                  Karaoke
                </label>
                <label>
                  <input
                    name="bar"
                    type="checkbox"
                    checked={this.state.bar}
                    onClick={this.handleInputChange}
                  />{" "}
                  Bar
                </label>
              </div>
            ) : (
              <h2>Time for Hobbies</h2>
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
                    name="shopGirl"
                    type="checkbox"
                    checked={this.state.shopGirl}
                    onClick={this.handleInputChange}
                  />{" "}
                  Shopping with girlfriend
                </label>
                <label>
                  <input
                    name="dinnerFriend"
                    type="checkbox"
                    checked={this.state.dinnerFriend}
                    onClick={this.handleInputChange}
                  />{" "}
                  Have dinner with friends
                </label>
              </div>
            ) : (
              <h2>Social</h2>
            )}
          </div>
        </div>
        <div className="onboardingBtn" onClick={() => this.handleSubmit()}>
          Next Step
        </div>
      </div>
    );
  }
}

export default Onboarding;
