import React, { Component } from "react";
import Login from "./Login";

// Styles
import "../less/App.less";

// Redux should be here
// If logged in, then render <UserInteraction />, otherwise <Login />

class App extends Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		return (
			<div className="app">
				<Login />
			</div>
		);
	}
}

export default App;