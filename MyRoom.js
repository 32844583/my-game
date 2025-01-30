const { Room } = require("@colyseus/core");

class MyRoom extends Room {
    onCreate() {
        console.log("✅ 房間已創建");
        this.setState({ playersReady: {} });

        this.onMessage("ready", (client, message) => {
            console.log(`📨 伺服器收到 ${client.sessionId} 的 ready 訊息`, message);
            this.state.playersReady[message.player] = true;
            this.broadcast("players_update", JSON.stringify(this.state.playersReady));
        });
    }

    onJoin(client) {
        console.log(`➡️ ${client.sessionId} 加入房間`);
    }

    onLeave(client, consented) {
        console.log(`⬅️ 玩家離開房間: ${client.sessionId} (是否自願: ${consented})`);
    
        client.connection.on("close", (code, reason) => {
            console.error(`⚠️ WebSocket 關閉 - 玩家 ${client.sessionId}, 代碼: ${code}, 原因: ${reason}`);
        });
    }

    onDispose() {
        console.log("🗑️ 房間被釋放");
    }
}

module.exports = { MyRoom };
