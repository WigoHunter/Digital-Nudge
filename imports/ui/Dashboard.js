import React from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import Report from "./Report";
import ConfigModal, { AUTHORIZED } from "./ConfigModal";

// Redux
import { connect } from "react-redux";

class Dashboard extends React.Component {
	static propTypes = {
		user: PropTypes.object,
		loading: PropTypes.bool
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
							{(user.services && AUTHORIZED.includes(user.services.google.email))
								&& <ConfigModal email={user.services.google.email} />
							}
							<h3>Welcome to Digital Nudge, {(user.services && user.services.google) && user.services.google.name}!</h3>
							<p className="sub">You will start receiving personalized daily emails to suggest Calendar events!</p>
							<Report profile={user.nudgeProfile} />
							<button className="logout" onClick={() => Meteor.logout()}>
								Logout
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