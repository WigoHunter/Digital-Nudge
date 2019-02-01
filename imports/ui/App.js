import React, { Component } from "react";
import Login from "./Login";

// Styles
import "../less/App.less";

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