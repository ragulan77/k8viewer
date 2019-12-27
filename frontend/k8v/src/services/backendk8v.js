const axios = require("axios").default;

class Backendk8v {
  constructor(options) {
    this.baseURL = options.baseURL || "http://localhost:5000";
  }

  getNodes() {
    return axios.get(this.baseURL + "/nodes");
  }

  getPods() {
    return axios.get(this.baseURL + "/pods");
  }

  getDeployments() {
    return axios.get(this.baseURL + "/deployments");
  }

  extractPods(pods) {
    return pods.data.body.items;
  }

  extractDeployments(deployments) {
    return deployments.data.body.items;
  }

  extractNodes(nodes) {
    return nodes.data.body.items;
  }

  getPodName(pod) {
    return pod.metadata.name;
  }

  getPodAppName(pod) {
    return pod.metadata.labels.app;
  }

  getPodNamespace(pod) {
    return pod.metadata.namespace;
  }

  getPodNodeName(pod) {
    return pod.spec.nodeName;
  }

  getDeploymentByApp(deployments, label) {
    return deployments.find(deployment => {
      return deployment.metadata.labels.app === label;
    });
  }

  getNodeName(node) {
    return node.metadata.name;
  }

  updateDeploymentReplicas(deployment, replicas) {
    const deploymentName = deployment.metadata.name;
    const data = { deploymentName, replicas };

    return axios.patch(this.baseURL + "/deployments", data);
  }

  /*
   * node, Deployment et Pod possèdent un UID au même endroit
   *
   */
  getUID(object) {
    return object.metadata.uid;
  }
}

module.exports = Backendk8v;
