//express constants
const express = require("express");
const app = express();

const bodyParser = require("body-parser");

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, access-control-allow-origin"
  );
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, PATCH");
  next();
});

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(bodyParser.json());

//k8s client constants
const Client = require("kubernetes-client").Client;
const config = require("kubernetes-client/backends/request").config;

const client = new Client({ version: "1.13" });

app.get("/", (req, res) => {
  client.api.v1.namespaces.get().then(kres => {
    res.send(kres);
  });
});

app.get("/pods", (req, res) => {
  client.api.v1
    .namespaces("default")
    .pods()
    .get()
    .then(kres => {
      res.send(kres);
    });
});

app.get("/nodes", (req, res) => {
  client.api.v1
    .nodes()
    .get()
    .then(kres => {
      res.send(kres);
    });
});

app.get("/deployments", (req, res) => {
  client.apis.apps.v1.deployments.get().then(kres => {
    res.send(kres);
  });
});

//for the moment it support only replicas changement on deployment
app.patch("/deployments", (req, res) => {
  const replicas = {
    spec: {
      replicas: parseInt(req.body.replicas)
    }
  };

  const deploymentName = req.body.deploymentName;

  client.apis.apps.v1
    .namespaces("default")
    .deployments(deploymentName)
    .patch({ body: replicas })
    .then(kres => {
      res.send(kres);
    });
});

app.listen(5000, () => {
  console.log("Application listening on port 5000");
});
