"use strict";

const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.Server(app);
const io = socketIO(server);

const PORT = process.env.PORT || 1337;

io.on("connection", socket => {
  console.log("connection: ", socket.id);

  socket.on("disconnect", () => {
    console.log("disconnect: ", socket.id);
  });

  socket.on("signaling", objData => {
    console.log("signaling: ", socket.id);
    console.log("- type: ", objData.type);

    socket.broadcast.emit("signaling", objData);
  });
});

app.use(express.static(__dirname + "/public"));

server.listen(PORT, () => {
  console.log("Server on port %d", PORT);
});
