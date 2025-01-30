const client = new Colyseus.Client("wss://my-game-aapb.onrender.com");
let room;

async function joinRoom() {
    try {
        room = await client.joinOrCreate("game_room");
        console.log("✅ 成功加入房間", room.sessionId);

        room.onMessage("players_update", (data) => {
            console.log("📨 收到房間狀態:", data);
            document.getElementById("status").innerText = JSON.stringify(data);
        });

    } catch (err) {
        console.error("❌ 無法加入房間", err);
    }
}

document.getElementById("player1-ready").addEventListener("click", () => {
    if (!room || room.connection.state !== "open") {
        console.error("⚠️ 無法發送訊息，房間尚未連接或 WebSocket 已關閉");
        return;
    }
    console.log("📨 發送玩家準備訊息", room.sessionId);
    room.send("ready", { player: 1 });
});

document.getElementById("player2-ready").addEventListener("click", () => {
    if (room && room.connection && room.connection.isOpen) {
        room.send("ready", { player: 2 });
    } else {
        console.error("房間尚未連接，無法發送訊息。");
    }
    
});

joinRoom();