import {
  Dialog,
  HTMLTable,
  Classes,
  Button,
  Tabs,
  Tab,
  Slider
} from "@blueprintjs/core";
import React from "react";
import "./App.css";

class PodDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = { dialogContent: "info" };
  }

  render() {
    return (
      <Dialog
        icon="info-sign"
        onClose={this.props.onClose}
        title="Pod Information"
        isOpen={this.props.isOpen}
      >
        <Tabs large="true" vertical="true">
          <Tab
            id="info"
            panel={<PodInfo {...this.props} onEdit={this.handleEditReplicas} />}
            title="Info"
          />
          <Tab
            id="replicas"
            panel={
              <PodReplicas
                onConfirmEdit={this.props.onConfirmEdit}
                onClose={this.props.onClose}
                data={this.props.data}
              />
            }
            title="replicas"
          />
        </Tabs>
      </Dialog>
    );
  }

  handleEditReplicas = () => {
    this.setState({ dialogContent: "editReplicas" });
  };
}

const PodInfo = props => {
  return (
    <>
      <div className={Classes.DIALOG_BODY}>
        <HTMLTable condensed="true">
          <tbody>
            <tr>
              <th>Pod Name</th>
              <td>{props.data.pod.metadata.name}</td>
            </tr>
            <tr>
              <th>Application name</th>
              <td>{props.data.pod.metadata.labels.app}</td>
            </tr>
            <tr>
              <th>Namespace</th>
              <td>{props.data.pod.metadata.namespace}</td>
            </tr>
            <tr>
              <th>UID</th>
              <td>{props.data.pod.metadata.uid}</td>
            </tr>
            <tr>
              <th>Node name</th>
              <td>{props.data.pod.spec.nodeName}</td>
            </tr>
            <tr>
              <th>Restart policy</th>
              <td>{props.data.pod.spec.restartPolicy}</td>
            </tr>
            <tr>
              <th>Status</th>
              <td>{props.data.pod.status.phase}</td>
            </tr>
            <tr>
              <th>Host IP</th>
              <td>{props.data.pod.status.hostIP}</td>
            </tr>
            <tr>
              <th>Pod IP</th>
              <td>{props.data.pod.status.podIP}</td>
            </tr>
            <tr>
              <th>Start time</th>
              <td>{props.data.pod.status.startTime}</td>
            </tr>
          </tbody>
        </HTMLTable>

        <HTMLTable>
          <thead>
            <tr>
              <th>Docker container name</th>
              <th>Image</th>
            </tr>
          </thead>
          <tbody>
            {props.data.pod.spec.containers.map(c => (
              <tr>
                <td>{c.name}</td>
                <td>{c.image}</td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button icon="trash" intent="danger" onClick={props.onDelete}>
            delete pod
          </Button>
          <Button icon="cross" intent="primary" onClick={props.onClose}>
            close
          </Button>
        </div>
      </div>
    </>
  );
};

class PodReplicas extends React.Component {
  constructor(props) {
    super(props);
    this.state = { nbReplicas: props.data.deployment.spec.replicas };
  }

  onSliderChange = number => {
    this.setState({ nbReplicas: number });
  };

  render() {
    return (
      <>
        <div className={Classes.DIALOG_BODY}>
          <Slider
            initialValue={this.state.nbReplicas}
            min={0}
            max={20}
            stepSize={1}
            labelStepSize={20}
            value={this.state.nbReplicas}
            onChange={this.onSliderChange}
          />
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button
              icon="edit"
              intent="success"
              onClick={() => this.props.onConfirmEdit(this.state.nbReplicas)}
            >
              confirmer
            </Button>
            <Button icon="cross" intent="primary" onClick={this.props.onClose}>
              close
            </Button>
          </div>
        </div>
      </>
    );
  }
}

export default PodDialog;
