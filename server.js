// server.js (Socket.IO 版本)
const express = require("express");
const http = require("http");         // Node.js 原生 http
const { Server } = require("socket.io"); // socket.io

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 靜態資源 (前端)
app.use(express.static("public"));

// Socket.IO 連線邏輯
io.on("connection", (socket) => {
  console.log("有玩家連上來了，socket.id =", socket.id);

  // 監聽「ready」事件
  socket.on("ready", (data) => {
    console.log(`玩家 ${data.player} 準備！`);

    // 廣播給所有連線玩家
    io.emit("players_update", { player: data.player });
  });

  // 玩家離線
  socket.on("disconnect", () => {
    console.log(`玩家離線，socket.id = ${socket.id}`);
  });
});

server.listen(3000, () => {
  console.log("🚀 伺服器運行中：http://localhost:3000");
});
