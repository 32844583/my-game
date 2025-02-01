// NetworkManager.js
// 建立 socket 連線，未來所有模組都從此取得 socket 實例
const socket = io("http://localhost:3000");

// 伺服器端上線後使用
// const socket = io("https://my-game-aapb.onrender.com", {
//   withCredentials: true,
//   transports: ['websocket', 'polling']
// });

socket.on("connect", () => {
  console.log("Connected to server");
});

// 如果採用 ES Module，可 export 出 socket
export default socket;

// 或者直接掛在 window 上（依需求調整）
// window.socket = socket;
