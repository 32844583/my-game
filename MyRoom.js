const colyseus = require("colyseus");

class MyRoom extends colyseus.Room {
    onCreate() {
        this.setState({ playersReady: {} });

        this.onMessage("ready", (client, message) => {
            this.state.playersReady[message.player] = true;
            console.log(`玩家 ${message.player} 準備！`);

            // 廣播給所有玩家
            this.broadcast("player_ready", { player: message.player });
        });
    }

    onJoin(client) {
        console.log(`${client.sessionId} 加入房間`);
    }

    onLeave(client) {
        console.log(`${client.sessionId} 離開房間`);
    }
}

module.exports = { MyRoom };
