import React from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import Report from "./Report";
import ConfigModal, { AUTHORIZED } from "./ConfigModal";
import Onboarding from "./Onboarding";
import { withTracker } from "meteor/react-meteor-data";
import { Config } from "../db/configs";

// Redux
import { connect } from "react-redux";

class Dashboard extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    loading: PropTypes.bool,
    configLoading: PropTypes.bool,
    config: PropTypes.object
  };

  state = {
    setPreferences: false
  };

  _setPreferences = status => {
    this.setState({
      setPreferences: status
    });
  };

  render() {
    const { user, loading, configLoading, config } = this.props;
    const { setPreferences } = this.state;

    const profile = user.nudgeProfile;

    if (loading) {
      return <p>loading...</p>;
    }

    return (
      <div
        className="dashboard"
        style={{
          background: `url(${
            configLoading
              ? "http://smalldata.io/img/homepage.jpg"
              : `${config.background} cover` ||
                "http://smalldata.io/img/homepage.jpg"
          })`,
          backgroundSize: "cover"
        }}
      >
        <div className="overlay">
          {!setPreferences && profile && profile.preferences ? (
            <div className="content">
              {user.services &&
                AUTHORIZED.includes(user.services.google.email) && (
                  <ConfigModal email={user.services.google.email} />
                )}
              <h3>
                Welcome to Digital Nudge,{" "}
                {user.services &&
                  user.services.google &&
                  user.services.google.name}
                !
              </h3>
              <p className="sub on-overlay">
                You will start receiving personalized daily emails to suggest
                Calendar events!
              </p>
              <Report
                profile={user.nudgeProfile}
                setPreferences={this._setPreferences}
              />
              <button className="logout" onClick={() => Meteor.logout()}>
                Logout
              </button>
            </div>
          ) : (
            user && (
              <Onboarding
                setPreferences={this._setPreferences}
                preferences={profile ? profile.preferences : {}}
                userId={user._id}
              />
            )
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    loading: state.auth.loading
  };
};

const DashboardComponent = withTracker(() => {
  const sub = Meteor.subscribe("config.background");
  const loading = !sub.ready();
  const config = Config.findOne();

  return {
    configLoading: loading,
    config
  };
})(Dashboard);

export default connect(mapStateToProps)(DashboardComponent);
