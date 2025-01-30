const { Room } = require("colyseus");

class MyRoom extends Room {
    onCreate() {
        console.log("🚀 遊戲房間建立");
        this.setState({ players: {} });

        this.onMessage("move", (client, data) => {
            this.state.players[client.sessionId] = data;
            this.broadcast("state", this.state.players);
        });
    }

    onJoin(client) {
        console.log(client.sessionId, "加入房間");
        this.state.players[client.sessionId] = { x: 0, y: 0 };
    }

    onLeave(client) {
        console.log(client.sessionId, "離開房間");
        delete this.state.players[client.sessionId];
    }
}

module.exports = { MyRoom };
