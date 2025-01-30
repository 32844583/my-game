const express = require("express");
const { Server } = require("@colyseus/core");
const { WebSocketTransport } = require("@colyseus/ws-transport");
const { createServer } = require("http");
const { MyRoom } = require("./MyRoom");
const cors = require("cors"); // ✨ 新增這一行

const app = express();
const server = createServer(app);

// ✨ 設定 CORS，允許前端連線
app.use(cors({
    origin: "*",  // 🔥 允許所有來源，或改成你的網域 "http://localhost:3000"
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// 設定 Colyseus WebSocket 伺服器
const gameServer = new Server({
    transport: new WebSocketTransport({
        server, // 共享 HTTP 伺服器
    }),
});

// 定義遊戲房間
gameServer.define("game_room", MyRoom).enableRealtimeListing();

// 設定 Express 提供靜態檔案
app.use(express.static("public"));

// 啟動伺服器，PORT 需符合 Render 要求
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 伺服器運行中：http://localhost:${PORT}`);
});
