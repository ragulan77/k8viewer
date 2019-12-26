import { Dialog, HTMLTable, Classes, Button } from "@blueprintjs/core";
import React from "react";

const PodDialog = props => {
  return (
    <Dialog
      icon="info-sign"
      onClose={props.onClose}
      title="Pod Information"
      isOpen={props.isOpen}
    >
      <div className={Classes.DIALOG_BODY}>
        <HTMLTable condensed="true">
          <tbody>
            <tr>
              <th>Pod Name</th>
              <td>{props.pod.metadata.name}</td>
            </tr>
            <tr>
              <th>Application name</th>
              <td>{props.pod.metadata.labels.app}</td>
            </tr>
            <tr>
              <th>Namespace</th>
              <td>{props.pod.metadata.namespace}</td>
            </tr>
            <tr>
              <th>UID</th>
              <td>{props.pod.metadata.uid}</td>
            </tr>
            <tr>
              <th>Node name</th>
              <td>{props.pod.spec.nodeName}</td>
            </tr>
            <tr>
              <th>Restart policy</th>
              <td>{props.pod.spec.restartPolicy}</td>
            </tr>
            <tr>
              <th>Status</th>
              <td>{props.pod.status.phase}</td>
            </tr>
            <tr>
              <th>Host IP</th>
              <td>{props.pod.status.hostIP}</td>
            </tr>
            <tr>
              <th>Pod IP</th>
              <td>{props.pod.status.podIP}</td>
            </tr>
            <tr>
              <th>Start time</th>
              <td>{props.pod.status.startTime}</td>
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
            {props.pod.spec.containers.map(c => (
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
          <Button icon="trash" intent="danger">
            delete pod
          </Button>
          <Button icon="edit" intent="success">
            edit replicas
          </Button>
          <Button icon="cross" intent="primary" onClick={props.onClose}>
            close
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default PodDialog;