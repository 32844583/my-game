// 利用 colyseus.js (在 index.html 已載入到 window.Colyseus)
const client = new window.Colyseus.Client("wss://my-game-aapb.onrender.com");
let room;

async function joinRoom() {
  try {
    room = await client.joinOrCreate("game_room");
    console.log("成功加入房間", room.sessionId);

    // 監聽廣播訊息
    room.onMessage("player_ready", (data) => {
      document.getElementById("status").innerText = `玩家 ${data.player} 已準備！`;
    });
  } catch (e) {
    console.error("加入房間失敗", e);
  }
}

document.getElementById("player1-ready").addEventListener("click", () => {
  if (room) room.send("ready", { player: 1 });
});

document.getElementById("player2-ready").addEventListener("click", () => {
  if (room) room.send("ready", { player: 2 });
});

joinRoom();
