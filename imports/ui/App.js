import React, { Component } from "react";
import Login from "./Login";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Dashboard from "./Dashboard";

// Styles
import "../less/App.less";

class App extends Component {
  static propTypes = {
    user: PropTypes.object
  };

  componentDidMount() {
    console.log("last deployed: 2019/04/20");
  }

  render() {
    const { user } = this.props;

    return (
      <div className="app">
        {user._id ? <Dashboard user={user} /> : <Login />}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.auth.user
  };
};

export default connect(mapStateToProps)(App);
