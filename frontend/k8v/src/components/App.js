import React from "react";
import socketIOClient from "socket.io-client";

import "./App.css";

import { Graph } from "react-d3-graph";

import {
  Alignment,
  Button,
  Classes,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
  Intent
} from "@blueprintjs/core";

import PodDialog from "./podDialog";
import { MyToaster } from "./toaster";

const Backendk8v = require("../services/backendk8v");
const backendk8v = new Backendk8v({});

class App extends React.Component {
  constructor() {
    super();
    const myConfig = {
      nodeHighlightBehavior: true,
      width: 1900,
      height: 800,
      node: {
        color: "lightgreen",
        size: 800,
        fontSize: 18,
        highlightStrokeColor: "blue",
        labelProperty: "name"
      },
      link: {
        highlightColor: "lightblue"
      }
    };

    var graphData = {
      nodes: [],
      links: []
    };

    this.state = {
      graphData: graphData,
      selectedPod: null,
      isPodInfoDialogOpen: false,
      myConfig: myConfig
    };

    this.nodeColors = [
      "003399",
      "34A853",
      "3B5998",
      "4285F4",
      "55ACEE",
      "66757F",
      "7B0099",
      "7CBB00",
      "8B9DC3",
      "EA4335",
      "FBBC05"
    ];

    this.svgByPod = new Map();
  }

  componentDidMount() {
    // graph payload
    this.initializeGraphData().then(result => {
      var { nodes, links } = result;
      this.setState({ graphData: { nodes: nodes, links: links } });
    });

    const socket = socketIOClient("http://localhost:5000");
    socket.on("FromAPI", data => {
      if (data.type === "ADDED") {
        this.addNodeFromEvent(data);
      } else if (data.type === "DELETED") {
        this.deleteNodeFromEvent(data);
      }
    });
  }

  addNodeFromEvent() {}

  deleteNodeFromEvent(eventData) {
    const podToDeleteName = eventData.object.metadata.name;
    var nodes = [...this.state.graphData.nodes];
    var links = [...this.state.graphData.links];

    const podToDeleteIndex = nodes.findIndex(node => {
      if (node.kind === "pod") {
        return backendk8v.getPodName(node.payload.pod) === podToDeleteName;
      }
    });

    //we found a pod to delete in our Graph
    if (podToDeleteIndex !== -1) {
      //we need to find the link to delete too
      const linkToDeleteIndex = links.findIndex(link => {
        return (
          link.target === backendk8v.getUID(nodes[podToDeleteIndex].payload.pod)
        );
      });

      nodes.splice(podToDeleteIndex, 1);
      links.splice(linkToDeleteIndex, 1);
      this.setState({ graphData: { nodes, links } });
    }
  }

  render() {
    if (this.state.graphData.nodes.length > 0) {
      return (
        <>
          <Navbar className="bp3-dark">
            <NavbarGroup align={Alignment.LEFT}>
              <NavbarHeading>Blueprint</NavbarHeading>
              <NavbarDivider />
              <Button className={Classes.MINIMAL} icon="home" text="Home" />
              <Button
                className={Classes.MINIMAL}
                icon="document"
                text="Files"
              />
            </NavbarGroup>
          </Navbar>
          <Graph
            id="graph-id" // id is mandatory, if no id is defined rd3g will throw an error
            data={this.state.graphData}
            config={this.state.myConfig}
            onDoubleClickNode={this.onDoubleClickNode}
            onRightClickNode={this.onRightClickNode}
            onClickGraph={this.onClickGraph}
          />
          {this.state.selectedPod && (
            <PodDialog
              data={this.state.selectedPod}
              isOpen={this.state.isPodInfoDialogOpen}
              onClose={this.handlePodInfoDialogClose}
              onConfirmEdit={this.handlePodReplicasEdit}
            />
          )}
        </>
      );
    }

    return <p>waiting</p>;
  }

  handlePodReplicasEdit = nbReplicas => {
    //TODO
    const deploymentName = this.state.selectedPod.deployment.metadata.name;

    backendk8v
      .updateDeploymentReplicas(this.state.selectedPod.deployment, nbReplicas)
      .then(res => {
        console.log("handlePodReplicasEdit - deployName :" + deploymentName);
        MyToaster.show({
          message: "Replicas updated for the deployment " + deploymentName,
          icon: "tick",
          intent: Intent.SUCCESS
        });
        this.handlePodInfoDialogClose();
      })
      .catch(error => {
        MyToaster.show({
          message:
            "Something wrong happened during the Replicas update for the deployment " +
            deploymentName,
          icon: "warning-sign",
          intent: Intent.DANGER
        });
      });
  };

  handlePodInfoDialogClose = () => {
    this.setState({ isPodInfoDialogOpen: false });
  };

  // graph event callbacks
  onClickGraph() {
    window.alert(`Clicked the graph background`);
  }

  onClickNode(nodeId) {
    window.alert(`Clicked node ${nodeId}`);
    backendk8v.getNodes();
  }

  onDoubleClickNode = nodeId => {
    const currentNode = this.getNodeFromArrayById(nodeId);
    this.setState({
      selectedPod: currentNode.payload,
      isPodInfoDialogOpen: true
    });
  };

  onRightClickNode = (event, nodeId) => {
    window.alert(`Right clicked node ${nodeId}`);
  };

  onMouseOverNode(nodeId) {
    window.alert(`Mouse over node ${nodeId}`);
  }

  onMouseOutNode(nodeId) {
    window.alert(`Mouse out node ${nodeId}`);
  }

  async initializeGraphData() {
    var nodes = [];
    var links = [];

    const pods = backendk8v.getPods();
    const knodes = backendk8v.getNodes();
    const deployments = backendk8v.getDeployments();
    await Promise.all([pods, knodes, deployments]).then(values => {
      const pods = backendk8v.extractPods(values[0]);
      const knodes = backendk8v.extractNodes(values[1]);
      const deployments = backendk8v.extractNodes(values[2]);

      knodes.forEach(node => {
        const id = backendk8v.getUID(node);
        const kind = "node";
        const payload = node;
        const name = backendk8v.getNodeName(node);
        const svg = "images/kubernetes-icons/master-node.svg";
        nodes.push({ id, kind, payload, name, svg });
      });

      pods.forEach(pod => {
        //set node
        const id = backendk8v.getUID(pod);
        const kind = "pod";
        const deployment = backendk8v.getDeploymentByApp(
          deployments,
          backendk8v.getPodAppName(pod)
        );
        const payload = { pod, deployment };
        const name = backendk8v.getPodName(pod);
        const svg = this.pickSvgUrlForPod(pod);
        nodes.push({ id, kind, payload, name, svg });

        //set link
        const podNodeName = backendk8v.getPodNodeName(pod);
        const nodeOfPod = knodes.find(node => {
          return backendk8v.getNodeName(node) === podNodeName;
        });

        const nodeIdOfPod = backendk8v.getUID(nodeOfPod);
        links.push({ source: nodeIdOfPod, target: id });
      });
    });

    return { nodes, links };
  }

  pickSvgUrlForPod(pod) {
    const rootFolder = "images/kubernetes-icons/";
    const podAppName = backendk8v.getPodAppName(pod);

    if (this.svgByPod.has(podAppName)) return this.svgByPod.get(podAppName);

    var color = this.nodeColors.pop();
    if (color === undefined) color = "default";

    const svgUrl = rootFolder + "pod-" + color + ".svg";
    this.svgByPod.set(podAppName, svgUrl);
    return svgUrl;
  }

  getNodeFromArrayById = nodeId => {
    return this.state.graphData.nodes.find(node => {
      return node.id === nodeId;
    });
  };
}

export default App;
