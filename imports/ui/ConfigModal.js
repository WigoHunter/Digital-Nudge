import React, { useCallback } from "react";
import { Meteor } from "meteor/meteor";
import Modal from "react-modal";
import { useDropzone } from "react-dropzone";
import PropTypes from "prop-types";
import JSONTree from "react-json-tree";

export const AUTHORIZED = [
  "mattandkevin1060@gmail.com",
  "fnokeke@gmail.com",
  "sobolevmic2@gmail.com",
  "bwzhangtopone@gmail.com"
];

const Dropzone = ({ getConfig, email }) => {
  const onDrop = useCallback(files => {
    if (!AUTHORIZED.includes(email)) {
      alert("You are not authorized to change configuration!");
      return;
    }

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
      <p>Upload config file here...</p>
    </div>
  );
};

Dropzone.propTypes = {
  getConfig: PropTypes.func,
  email: PropTypes.string
};

class ConfigModal extends React.Component {
  static propTypes = {
    email: PropTypes.string
  };

  constructor() {
    super();

    this.state = {
      open: false,
      config: null
    };
  }

  open = () => {
    this.setState({ open: true });
  };

  close = () => {
    this.setState({ open: false, config: null });
  };

  getConfig = config => {
    this.setState({
      config
    });

    console.log(this.state.config);
  };

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
  };

  render() {
    return (
      <>
        <div className="config-button" onClick={this.open}>
          set config
        </div>
        <Modal isOpen={this.state.open} ariaHideApp={false} className="modal">
          <p className="x" onClick={this.close}>
            x
          </p>
          <Dropzone getConfig={this.getConfig} email={this.props.email} />
          {this.state.config && (
            <>
              <JSONTree data={this.state.config} />
              <button className="confirm" onClick={() => this.submitConfig()}>
                Confirm the change
              </button>
            </>
          )}
        </Modal>
      </>
    );
  }
}

export default ConfigModal;
