import React from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";

// Redux
import { connect } from "react-redux";

class Dashboard extends React.Component {
	static propTypes = {
		user: PropTypes.object,
		loading: PropTypes.bool
	}

	getCalendar = () => {
		Meteor.call("getCalendar", (err, data) => {
			if (err) {
				console.log(err);
				alert("Oops. Something's wrong");
				return;
			}

			console.log(data);
		});
	}

	render() {
		const { user, loading } = this.props;

		return (
			<div className="dashboard">
				{
					loading
						?
						<p>loading...</p>
						:
						<>
							<h3>Welcome to Digital Nudge, <span onClick={() => Meteor.logout()}>{(user.services && user.services.google) && user.services.google.name}</span>!</h3>
							<button onClick={() => this.getCalendar()}>
								Get Calendar Info
							</button>
						</>
				}
			</div>
		);
	}
}

const mapStateToProps = state => {
	return {
		loading: state.auth.loading
	};
};

export default connect(mapStateToProps)(Dashboard);