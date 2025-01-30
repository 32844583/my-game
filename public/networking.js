 // networking.js
 const client = new Colyseus.Client("wss://my-game-aapb.onrender.com");
 let room;
 
 async function joinRoom() {
     try {
         room = await client.joinOrCreate("game_room");
         console.log("成功加入房間", room.sessionId);
 
         room.onMessage("player_ready", (data) => {
             document.getElementById("status").innerText = `玩家 ${data.player} 已準備！`;
         });
 
         room.onLeave((code) => {
             console.log("WebSocket 連線關閉，嘗試重新連線...", code);
             setTimeout(joinRoom, 3000); // 3 秒後重新連線
         });
         
         // 錯誤處理要放在 try 區塊中
         room.onError((error) => {
           console.error("WebSocket 錯誤:", error);
         });
 
     } catch (error) {
        console.error("連線錯誤:", error);
     }
 }
 
 document.getElementById("player1-ready").addEventListener("click", () => {
     if (room) room.send("ready", { player: 1 });
 });
 
 document.getElementById("player2-ready").addEventListener("click", () => {
     if (room) room.send("ready", { player: 2 });
 });
 
 joinRoom();