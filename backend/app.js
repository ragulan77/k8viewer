//express constants
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);

const socketIo = require("socket.io");
const io = socketIo(server); // < Interesting!

const bodyParser = require("body-parser");
const JSONStream = require("json-stream");

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, access-control-allow-origin"
  );
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, PATCH, DELETE");
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

app.delete("/pods", (req, res) => {
  client.api.v1
    .namespaces("default")
    .pods(req.body.name)
    .delete()
    .then(kres => {
      res.send(kres);
    })
    .catch(error => {
      res.send(error);
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

let interval;
io.on("connection", socket => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getPodUpdateAndEmit(socket), 10000);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const getPodUpdateAndEmit = async socket => {
  try {
    const stream = client.api.v1.watch.pods.getStream();
    const jsonStream = new JSONStream();
    stream.pipe(jsonStream);
    jsonStream.on("data", object => {
      //console.log("Event: ", JSON.stringify(object, null, 2));
      //if (object.type == "DELETED") {
      //console.log("Event: ", object);
      socket.emit("FromAPI", object); // Emitting a new message which will be consumed by the client
      //}
      //console.log(objectJson.type);
    });
  } catch (error) {
    console.error(`Error: ${error.code}`);
  }
};

server.listen(5000, () => {
  console.log("Application listening on port 5000");
});
