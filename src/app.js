const express = require("express");
const app = express();

const http = require("http").Server(app);
const PORT = process.env.PORT || 7000;

app.get("/", function (_, res) {
  res.sendFile(__dirname + "/index.html");
});

http.listen(PORT, function () {
  console.log("server listening. PORT:" + PORT);
});
