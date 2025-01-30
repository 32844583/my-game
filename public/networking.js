// networking.js (Socket.IO 版本)

// 假如你的伺服器位於同網域/同網址，就可以直接空白 io()
// const socket = io("http://localhost:3000");

// 如果你要指定網址，可以使用：
const socket = io("https://my-game-aapb.onrender.com");
// 但實際上 socket.io 預設會用 https:// 或 wss:// 動態連線
socket.on("connect", () => {
    console.log("本機連線成功，socket.id =", socket.id);
});

document.getElementById("player1-ready").addEventListener("click", () => {
  socket.emit("ready", { player: 1 });
});

document.getElementById("player2-ready").addEventListener("click", () => {
  socket.emit("ready", { player: 2 });
});

// 接收後端廣播
socket.on("players_update", (data) => {
  document.getElementById("status").innerText = `玩家 ${data.player} 已準備！`;
});

console.log("Socket.IO 已載入, socket =", socket);
