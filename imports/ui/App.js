import React, { Component } from "react";
import Login from "./Login";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Dashboard from "./Dashboard";
import Redirection from "./Redirection";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

// Styles
import "../less/App.less";

class App extends Component {
  static propTypes = {
    user: PropTypes.object
  };

  componentDidMount() {
    console.log("last deployed: 2019/09/27");
  }

  render() {
    const { user } = this.props;

    return (
      <Router>
        <Switch>
          <Route path="/click/:payload">
            <Redirection />
          </Route>
          <Route path="/">
            <div className="app">
              {user._id ? <Dashboard user={user} /> : <Login />}
            </div>
          </Route>
        </Switch>
      </Router>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.auth.user
  };
};

export default connect(mapStateToProps)(App);
