import React from "react";
import socketIOClient from "socket.io-client";

import "./App.css";

import { Graph } from "react-d3-graph";

import {
  Alignment,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading
} from "@blueprintjs/core";

import PodDialog from "./podDialog";
import { toasterErrorMsg, toasterSuccessMsg, toasterInfoMsg } from "./toaster";

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
        fontSize: 14,
        highlightFontSize: 16,
        highlightStrokeColor: "blue",
        labelProperty: "name"
      },
      link: {
        highlightColor: "lightblue"
      }
    };

    var graphData = {
      nodes: [],
      links: [],
      deployments: []
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
      var { nodes, links, deployments } = result;
      this.setState({ graphData: { nodes, links, deployments } });
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

  addNodeFromEvent(eventData) {
    //if the status of the new pod is not running, don't put it in our graph
    //another event would come if the new pod is ready in the kubernetes cluster
    if (eventData.object.status.phase !== "Running") return;
    if (this.getPodIndex(eventData.object.metadata.uid) !== -1) return;

    const podToAddName = eventData.object.metadata.name;
    backendk8v.getPod(podToAddName).then(res => {
      var nodes = [...this.state.graphData.nodes];
      var links = [...this.state.graphData.links];
      var deployments = [...this.state.graphData.deployments];

      if (res.data.statusCode === 200) {
        const pod = res.data.body;
        //set node
        const id = backendk8v.getUID(pod);
        const kind = "pod";
        // the deployment of a pod is always the app name
        backendk8v
          .getDeployment(backendk8v.getPodAppName(pod))
          .then(deploymentData => {
            const deployment = deploymentData.data.body;
            const deployIndex = deployments.findIndex(
              d => d.metadata.name === deployment.metadata.name
            );
            if (deployIndex !== -1) {
              deployments[deployIndex].metadata.replicas =
                deployment.metadata.replicas;
            }

            const payload = { pod, deployment: deployments[deployIndex] };
            const name = backendk8v.getPodName(pod);
            const svg = this.pickSvgUrlForPod(pod);
            nodes.push({ id, kind, payload, name, svg });

            //set link
            const podNodeName = backendk8v.getPodNodeName(pod);
            const nodeOfPod = nodes.find(node => {
              return backendk8v.getNodeName(node.payload) === podNodeName;
            });

            const nodeIdOfPod = backendk8v.getUID(nodeOfPod.payload);
            links.push({ source: nodeIdOfPod, target: id });
            //toasterInfoMsg("New pod added : " + name);
            this.setState({ graphData: { nodes, links, deployments } });
          });
      }
    });
  }

  deleteNodeFromEvent(eventData) {
    const podToDeleteName = eventData.object.metadata.name;
    this.deletePod(podToDeleteName);
  }

  deletePod(podName) {
    const podToDeleteName = podName;
    var nodes = [...this.state.graphData.nodes];
    var links = [...this.state.graphData.links];
    var deployments = [...this.state.graphData.deployments];

    const podToDeleteIndex = nodes.findIndex(node => {
      if (node.kind === "pod") {
        return backendk8v.getPodName(node.payload.pod) === podToDeleteName;
      }
      return false;
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
      this.setState({ graphData: { nodes, links, deployments } });
    }
  }

  render() {
    if (this.state.graphData.nodes.length > 0) {
      return (
        <>
          <Navbar className="bp3-dark">
            <NavbarGroup align={Alignment.LEFT}>
              <NavbarHeading>K8Viewer</NavbarHeading>
              <NavbarDivider />
              <NavbarHeading>By Ragulan</NavbarHeading>
            </NavbarGroup>
          </Navbar>
          <Graph
            id="graph-id" // id is mandatory, if no id is defined rd3g will throw an error
            data={this.state.graphData}
            config={this.state.myConfig}
            onDoubleClickNode={this.onDoubleClickNode}
            onRightClickNode={this.onRightClickNode}
          />
          {this.state.selectedPod && (
            <PodDialog
              data={this.state.selectedPod}
              isOpen={this.state.isPodInfoDialogOpen}
              onClose={this.handlePodInfoDialogClose}
              onConfirmEdit={this.handlePodReplicasEdit}
              onDelete={this.handlePodDelete}
            />
          )}
        </>
      );
    }

    return <p>waiting</p>;
  }

  handlePodDelete = () => {
    const podToDelete = this.state.selectedPod.pod;
    const nameOfPodToDelete = backendk8v.getPodName(podToDelete);

    backendk8v
      .deletePod(nameOfPodToDelete)
      .then(res => {
        this.deletePod(nameOfPodToDelete);
        toasterSuccessMsg("Pod successfully deleted : " + nameOfPodToDelete);
        this.handlePodInfoDialogClose();
      })
      .catch(error => {
        toasterErrorMsg(
          "An error happened during the deletion of pod ",
          nameOfPodToDelete
        );
      });
  };

  handlePodReplicasEdit = nbReplicas => {
    const deploymentName = this.state.selectedPod.deployment.metadata.name;

    backendk8v
      .updateDeploymentReplicas(this.state.selectedPod.deployment, nbReplicas)
      .then(res => {
        toasterSuccessMsg(
          "Replicas updated for the deployment " + deploymentName
        );

        var editedPod = this.state.selectedPod;
        editedPod.deployment.spec.replicas = nbReplicas;
        this.setState({ selectedPod: editedPod });
        this.handlePodInfoDialogClose();
      })
      .catch(error => {
        toasterErrorMsg(
          "Something wrong happened during the Replicas update for the deployment " +
            deploymentName
        );
      });
  };

  handlePodInfoDialogClose = () => {
    this.setState({ isPodInfoDialogOpen: false });
  };

  onDoubleClickNode = nodeId => {
    const currentNode = this.getNodeFromArrayById(nodeId);
    if (currentNode.kind === "pod") {
      this.setState({
        selectedPod: currentNode.payload,
        isPodInfoDialogOpen: true
      });
    }
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
    var deployments = [];

    const pods = backendk8v.getPods();
    const knodes = backendk8v.getNodes();
    const kdeployments = backendk8v.getDeployments();
    await Promise.all([pods, knodes, kdeployments]).then(values => {
      const pods = backendk8v.extractPods(values[0]);
      const knodes = backendk8v.extractNodes(values[1]);
      deployments = backendk8v.extractNodes(values[2]);

      knodes.forEach(node => {
        const id = backendk8v.getUID(node);
        const kind = "node";
        const payload = node;
        const name = backendk8v.getNodeName(node);
        const svg = "images/kubernetes-icons/worker-node.svg";
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

    return { nodes, links, deployments };
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

  // get the index of the node with the UID in array
  getPodIndex(uid) {
    return this.state.graphData.nodes.findIndex(node => {
      if (node.kind === "pod") {
        return backendk8v.getUID(node.payload.pod) === uid;
      }
      return false;
    });
  }
}

export default App;
