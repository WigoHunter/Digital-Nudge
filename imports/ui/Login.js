import React from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";

// Redux
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import authActions from "./actions/auth";

import { loadUserPastData } from "../api/calendar";

class Login extends React.Component {
  static propTypes = {
    authActions: PropTypes.object
  };

  login = () => {
    Meteor.loginWithGoogle(
      {
        requestPermissions: [
          "email",
          "profile",
          "https://www.googleapis.com/auth/calendar.readonly"
        ],
        requestOfflineToken: true,
        forceApprovalPrompt: true
      },
      err => {
        if (err) {
          alert("Login failed... check console logs");
          console.log({ err });
          return;
        }

        const user = Meteor.user();
        if (user.nudgeProfile == null) {
          this.props.authActions.loadingData();

          loadUserPastData()
            .then(() => {
              setTimeout(() => {
                this.props.authActions.doneLoadingData();
              }, 600);
            })
            .catch(err => {
              alert("Oops. Server cannot retrieve data. (See logs)");
              console.log(err);
            });
        }
      }
    );
  };

  render() {
    return (
      <>
        <div className="login">
          <div className="overlay">
            <h3 className="title">
              Welcome to <span>Digital Nudge</span> as a Service!
            </h3>
            <p>
              Make use of your Google Calendar data. For{" "}
              <span>Productivity</span>.
            </p>
            <button onClick={() => this.login()}>Login to Subscribe</button>
          </div>
        </div>

        <div className="info">
          <h3>How This Works</h3>
          <div>
            <span>1</span>
            <p>Sign-up by clicking {"Login to Subscribe"} above.</p>
          </div>
          <div>
            <span>2</span>
            <p>
              Give us permission to <span>read</span> your calendar data.
            </p>
          </div>
          <div>
            <span>3</span>
            <p>Tell us what you would like to work on.</p>
          </div>
          <div>
            <span>4</span>
            <p>
              <span>
                Start receiving personalized nudges to boost your productivity.
              </span>
            </p>
          </div>
        </div>

        <div className="people">
          <h3>People behind this project</h3>
          <div className="members">
            <div className="member">
              <div
                style={{
                  background:
                    "url(https://scontent-lga3-1.xx.fbcdn.net/v/t1.0-9/65115788_336047317335172_9082315466789093376_n.jpg?_nc_cat=103&_nc_oc=AQmEZVesAeeWQBdeG8ULdJCEna7cK8wjQXcZCv52FJpjVm3unl_-vrS87DPp1HA1gPI&_nc_ht=scontent-lga3-1.xx&oh=d6df12b99c5f7c5e347dcb84ac25019f&oe=5E084F9A)",
                  backgroundSize: "cover"
                }}
              ></div>
              <h4>Bowen Zhang</h4>
              <p>Master Student</p>
            </div>
            <div className="member">
              <div
                style={{
                  background:
                    "url(https://scontent-lga3-1.xx.fbcdn.net/v/t1.0-9/17155307_10211067554639097_6739106460818295766_n.jpg?_nc_cat=101&_nc_oc=AQmRjCW7YeioDyp5MKEUlnjqVFLCNRSVanLgkThuf3CTPpWMUvbHcN7d2atqZh5qlEM&_nc_ht=scontent-lga3-1.xx&oh=0e5e09ba3b0fc6e7e9d9025ad6c1fa43&oe=5DFB3F6C)",
                  backgroundSize: "cover"
                }}
              ></div>
              <h4>Kevin Hsu</h4>
              <p>Master Student</p>
            </div>
            <div className="member">
              <div
                style={{
                  background: "url(https://smalldata.io/img/team/Michael.png)",
                  backgroundSize: "cover"
                }}
              ></div>
              <h4>Michael Sobolev</h4>
              <p>Advisor</p>
            </div>
            <div className="member">
              <div
                style={{
                  background: "url(https://smalldata.io/img/team/fabian.png)",
                  backgroundSize: "cover"
                }}
              ></div>
              <h4>Fabian Okeke</h4>
              <p>Advisor</p>
            </div>
          </div>
        </div>

        <div className="footer">
          <p>Made for Specialization Project at Cornell Tech</p>
        </div>
      </>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    authActions: bindActionCreators(authActions, dispatch)
  };
};

export default connect(
  null,
  mapDispatchToProps
)(Login);
