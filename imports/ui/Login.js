import React from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";

// Redux
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import authActions from "./actions/auth";

class Login extends React.Component {
	static propTypes = {
		authActions: PropTypes.object,
		user: PropTypes.object
	}

	login = () => {
		Meteor.loginWithGoogle({ requestPermissions: ["email", "profile", "https://www.googleapis.com/auth/calendar.readonly"] }, err => {
			if (err) {
				alert("Login failed... check console logs");
				console.log({ err });
				return;
			}

			this.props.authActions.login();
		});
	}

	getCalendar = () => {
		Meteor.call("getCalendar", (err, data) => {
			if (err) {
				alert("Oops. Something's wrong");
				return;
			}

			console.log(data);
		});
	}

	render() {
		return (
			<div>
				{this.props.user._id
					?
					<button onClick={() => this.getCalendar()}>
						Get Calendar Info
					</button> 
					:
					<button onClick={() => this.login()}>
						Login
					</button>
				}
			</div>
		);
	}
}

const mapStateToProps = state => {
	return {
		user: state.auth.user
	};
};

const mapDispatchToProps = dispatch => {
	return {
		authActions: bindActionCreators(authActions, dispatch)
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);