import React, { useCallback } from "react";
import { Meteor } from "meteor/meteor";
import Modal from "react-modal";
import { useDropzone } from "react-dropzone";
import PropTypes from "prop-types";
import JSONTree from "react-json-tree";
import { ExportToCsv } from "export-to-csv";
import { callWithPromise } from "../api/utils";
import { Logs } from "../db/logger";
import { withTracker } from "meteor/react-meteor-data";

const _ = require("lodash");

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
    email: PropTypes.string,
    loading: PropTypes.bool,
    logs: PropTypes.array
  };

  constructor() {
    super();

    this.state = {
      open: true,
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

  download = async () => {
    const logs = await callWithPromise("getLogs");

    const options = {
      filename: "nudges.ml - event logs",
      fieldSeparator: ",",
      // eslint-disable-next-line quotes
      quoteStrings: '"',
      decimalSeparator: ".",
      showLabels: true,
      showTitle: false,
      title: `logs @${new Date().toDateString()}`,
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true
    };

    const csvExporter = new ExportToCsv(options);
    csvExporter.generateCsv(logs);
  };

  render() {
    const { logs, loading } = this.props;
    const logCounts = loading
      ? {}
      : logs.reduce(
          (result, log) => ({
            ...result,
            [log.type]: _.get(result, log.type, 0) + 1
          }),
          {}
        );

    return (
      <>
        <div className="config-button" onClick={this.open}>
          Admin
        </div>
        <Modal isOpen={this.state.open} ariaHideApp={false} className="modal">
          <p className="x" onClick={this.close}>
            x
          </p>
          <h5>Usage Logging</h5>
          <div className="logs">
            {Object.keys(logCounts).map(type => (
              <div className="log" key={type}>
                <h6>{logCounts[type]}</h6>
                <p>{type}</p>
              </div>
            ))}
          </div>
          <button onClick={() => this.download()} className="download">
            Download Logs
          </button>

          <h5>Platform Config</h5>
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

export default withTracker(() => {
  const sub = Meteor.subscribe("logs.type");
  const loading = !sub.ready();
  const logs = Logs.find().fetch();

  return {
    loading,
    logs
  };
})(ConfigModal);
