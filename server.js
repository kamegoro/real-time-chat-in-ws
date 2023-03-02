"use strict"; // 厳格モードとする

// モジュール
const express = require("express");
const http = require("http");

// オブジェクト
const app = express();
const server = http.Server(app);

// 定数
const PORT = process.env.PORT || 1337;

// 公開フォルダの指定
app.use(express.static(__dirname + "/public"));

// サーバーの起動
server.listen(PORT, () => {
  console.log("Server on port %d", PORT);
});
