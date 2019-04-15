import React, { useCallback } from "react";
import { Meteor } from "meteor/meteor";
import Modal from "react-modal";
import { useDropzone } from "react-dropzone";
import PropTypes from "prop-types";
import JSONTree from "react-json-tree";

const Dropzone = ({ getConfig }) => {
	const onDrop = useCallback(files => {
		const reader = new FileReader();
		reader.onload = e => {
			const config = JSON.parse(e.target.result);
			getConfig(config);
		};

		reader.readAsText(files[0]);
	}, []);

	const { getRootProps, getInputProps } = useDropzone({ onDrop });

	return (
		<div {...getRootProps()} style={{ marginBottom: "20px" }}>
			<input {...getInputProps()} />
			<p >Upload config file here...</p>
		</div>
	);
};

Dropzone.propTypes = {
	getConfig: PropTypes.func
};

class ConfigModal extends React.Component {
	constructor() {
		super();

		this.state = {
			open: false,
			config: null
		};
	}

	open = () => {
		this.setState({ open: true });
	}

	close = () => {
		this.setState({ open: false, config: null });
	}

	getConfig = config => {
		this.setState({
			config,
		});

		console.log(this.state.config);
	}

	submitConfig = () => {
		Meteor.call("updateConfig", this.state.config, (err, res) => {
			if (err) {
				alert("error! check logs for details...");
				console.log(err);
			}

			console.log("success!", res);
			this.setState({
				config: null
			});
		});
	}

	render() {
		return (
			<>
				<div className="config-button" onClick={this.open}>set config</div>
				<Modal
					isOpen={this.state.open}
					ariaHideApp={false}
					className="modal"
				>
					<p className="x" onClick={this.close}>x</p>
					<Dropzone getConfig={this.getConfig} />
					{
						this.state.config &&
							<>
								<JSONTree data={this.state.config} />
								<button className="confirm" onClick={() => this.submitConfig()}>Confirm the change</button>
							</>
					}
				</Modal>
			</>
		);
	}
}

export default ConfigModal;