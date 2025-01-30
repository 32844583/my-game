const express = require("express");
const { Server } = require("colyseus");
const { createServer } = require("http");
const { MyRoom } = require("./MyRoom.js");

const app = express();
const server = createServer(app);
const gameServer = new Server({ server });

gameServer.define("game_room", MyRoom);

app.use(express.static("public"));

server.listen(3000, () => {
    console.log("🚀 伺服器運行中：http://localhost:3000");
});
