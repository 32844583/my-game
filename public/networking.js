const client = new Client("wss://my-game-aapb.onrender.com");
let room;

async function joinRoom() {
    room = await client.joinOrCreate("game_room");
    console.log("成功加入房間", room.sessionId);

    room.onMessage("player_ready", (data) => {
        document.getElementById("status").innerText = `玩家 ${data.player} 已準備！`;
    });
}

document.getElementById("player1-ready").addEventListener("click", () => {
    if (room) room.send("ready", { player: 1 });
});

document.getElementById("player2-ready").addEventListener("click", () => {
    if (room) room.send("ready", { player: 2 });
});

joinRoom();
