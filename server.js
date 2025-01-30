const express = require("express");
const { Server } = require("colyseus");
const { createServer } = require("http");
const { MyRoom } = require("./MyRoom.js");
const { WebSocketTransport } = require("@colyseus/ws-transport");

const app = express();
const server = createServer(app);
const gameServer = new Server({
    transport: new WebSocketTransport({
          //  可以設定 ping 間隔時間 (單位：毫秒)，預設是 20000
         // pingInterval: 20000,
         // 可以設定 ping 最大重試次數，預設是 3
         // pingMaxRetries: 3,
          server: server, // 請使用你的 http server 
          // verifyClient: (info, cb) => { // 自訂驗證方法，可參考官方文件
          //  cb(true);
         // }
    })
  });
gameServer.define("game_room", MyRoom);

app.use(express.static("public"));

server.listen(3000, () => {
    console.log("🚀 伺服器運行中：http://localhost:3000");
});
