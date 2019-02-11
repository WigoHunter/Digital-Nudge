import React from "react";
import { Meteor } from "meteor/meteor";
import { render } from "react-dom";

// Redux import
import { Provider } from "react-redux";
import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import appReducer from "../imports/ui/reducers";
import { loadUser } from "../imports/ui/actions/auth";

import App from "../imports/ui/App";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(appReducer, composeEnhancers(applyMiddleware(thunk)));

Meteor.startup(() => {

	// Client: Asynchronously send an email.
	Meteor.call(
	'sendEmail',
	'Bowen <bwzhangtopone@gmail.com>',
	'bob@example.com',
	'Hello from Meteor!',
	'This is a test of Email.send.'
	);

	store.dispatch(loadUser());

	render(
		<Provider store={store}>
			<App />
		</Provider>,
		window.document.getElementById("react-root")
	);
});
