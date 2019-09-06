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
        <div className="info"></div>
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
