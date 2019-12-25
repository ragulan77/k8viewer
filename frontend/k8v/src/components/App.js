import React from "react";
import "./App.css";

import { Graph } from "react-d3-graph";

import {
  Alignment,
  Button,
  Classes,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading
} from "@blueprintjs/core";

const Backendk8v = require("../services/backendk8v");
const backendk8v = new Backendk8v({});

class App extends React.Component {
  constructor() {
    super();
    this.myConfig = {
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

    this.graphData = {
      nodes: [],
      links: []
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

      this.graphData.nodes = nodes;
      this.graphData.links = links;

      this.setState({ graphData: this.graphData });
    });
  }

  render() {
    if (this.state != null) {
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
            config={this.myConfig}
            onClickNode={this.onClickNode}
            onRightClickNode={this.onRightClickNode}
            onClickGraph={this.onClickGraph}
          />
        </>
      );
    }

    return null;
  }

  // graph event callbacks
  onClickGraph() {
    window.alert(`Clicked the graph background`);
  }

  onClickNode(nodeId) {
    window.alert(`Clicked node ${nodeId}`);
    backendk8v.getNodes();
  }

  onDoubleClickNode(nodeId) {
    window.alert(`Double clicked node ${nodeId}`);
  }

  onRightClickNode(event, nodeId) {
    window.alert(`Right clicked node ${nodeId}`);
  }

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
    await Promise.all([pods, knodes]).then(values => {
      const pods = backendk8v.extractPods(values[0]);
      const knodes = backendk8v.extractNodes(values[1]);

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
        const payload = pod;
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

      console.log("initialize fin promise all");
    });

    console.log("return initialize");
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
}

export default App;
