//express constants
const express = require("express");
const app = express();

//k8s client constants
const Client = require("kubernetes-client").Client;
const config = require("kubernetes-client/backends/request").config;

const client = new Client({ version: "1.13" });

app.get("/", (req, res) => {
  client.api.v1.namespaces.get().then(kres => {
    res.header("Access-Control-Allow-Origin", "*");
    res.send(kres);
  });
});

app.get("/getPods", (req, res) => {
  client.api.v1
    .namespaces("default")
    .pods()
    .get()
    .then(kres => {
      res.header("Access-Control-Allow-Origin", "*");
      res.send(kres);
    });
});

app.get("/getNodes", (req, res) => {
  client.api.v1
    .nodes()
    .get()
    .then(kres => {
      res.header("Access-Control-Allow-Origin", "*");
      res.send(kres);
    });
});

app.get("/getDeployments", (req, res) => {
  client.apis.apps.v1.deployments.get().then(kres => {
    res.header("Access-Control-Allow-Origin", "*");
    res.send(kres);
  });
});

app.listen(5000, () => {
  console.log("Application listening on port 5000");
});
