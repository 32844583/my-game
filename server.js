// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://my-game-aapb.onrender.com"],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type"]
  }
});
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"]
//   }
// });
app.use(express.static("public"));

// 添加 Express CORS 中間件
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});



let players = new Map();
let playerCount = 0;

io.on("connection", (socket) => {
  playerCount++;
  if (playerCount <= 2) {
    players.set(socket.id, playerCount);
    socket.emit("player_number", playerCount);
  }

  socket.on("ready", (data) => {
    io.emit("player_ready", data);
  });

  socket.on("both_ready", () => {
    const sides = Math.random() < 0.5 ? 
      { player1Side: "left", player2Side: "right" } :
      { player1Side: "right", player2Side: "left" };
    
    io.emit("game_start", sides);
  });

  socket.on("summon_monster", (data) => {
    io.emit("monster_summoned", data);
  });

  socket.on("disconnect", () => {
    playerCount--;
    players.delete(socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});