// networking.js
const socket = io("https://my-game-aapb.onrender.com", {
  withCredentials: true,
  transports: ['websocket', 'polling']
});
// const socket = io("http://localhost:3000");

let player1Ready = false;
let player2Ready = false;
let player1Side = null;
let player2Side = null;
let gameStarted = false;
let currentPlayer = null;

socket.on("connect", () => {
  console.log("Connected to server");
});

socket.on("player_number", (number) => {
  currentPlayer = number;
  console.log(`You are Player ${number}`);
  updateUI();
});

socket.on("player_ready", (data) => {
  if (data.player === 1) {
    player1Ready = true;
    document.getElementById("player1-ready").textContent = "Ready!";
  }
  if (data.player === 2) {
    player2Ready = true;
    document.getElementById("player2-ready").textContent = "Ready!";
  }
  checkBothReady();
});

let gameInstance = null;

// 在遊戲開始時初始化生命值
socket.on("game_start", (data) => {
  player1Side = data.player1Side;
  player2Side = data.player2Side;
  
  document.getElementById("lobby").style.display = "none";
  document.getElementById("battle").style.display = "block";
  document.getElementById("summon-container").style.display = "block";
  
  // 初始化雙方生命值為3顆心
  socket.emit('initialize_hearts', {
    player1Hearts: 3,
    player2Hearts: 3
  });
  
  window.startGame();
  gameStarted = true;
});


socket.on("monster_summoned", (data) => {
  const { monsterKey, player, side } = data;
  summonMonster(monsterKey, player);
});

document.getElementById("player1-ready").addEventListener("click", () => {
  if (currentPlayer === 1 && !player1Ready) {
    socket.emit("ready", { player: 1 });
  }
});

document.getElementById("player2-ready").addEventListener("click", () => {
  if (currentPlayer === 2 && !player2Ready) {
    socket.emit("ready", { player: 2 });
  }
});

function checkBothReady() {
  if (player1Ready && player2Ready && !gameStarted) {
    socket.emit("both_ready");
  }
}

function summonMonster(monsterKey, summonedPlayer) {
  // 防止短時間內重複召喚（例如：點擊過快）
  if (window.lastSummonTime && Date.now() - window.lastSummonTime < 1000) {
    return;
  }
  window.lastSummonTime = Date.now();

  // 若 monsterKey 為 "home"（castle）則不重複召喚
  if (monsterKey === "home") {
    console.log("Castle already exists. Skip summoning duplicate home.");
    return;
  }

  // 判斷是否為本地發起的召喚（點擊時未傳入 summonedPlayer）
  const isLocal = (typeof summonedPlayer === "undefined");

  // 取得實際召喚者，若非本地則使用傳入的 player 編號，否則預設 currentPlayer
  const player = isLocal ? currentPlayer : summonedPlayer;

  // 根據玩家編號決定召喚物應屬於哪一邊
  // 注意：這裡假設在 game_start 事件中已設定 player1Side 與 player2Side，
  // 例如：player1Side = "left", player2Side = "right"
  const side = (player === 1) ? player1Side : player2Side;
  if (!side) return;

  // 取得當前 Phaser 場景，並依照遊戲設定計算位置
  const scene = PhaserSingleton.scene;
  // 垂直位置統一為畫面高度的一半
  const y = scene.game.config.height / 2;
  // 依據 side 決定 x 座標：左側固定為 100；右側為 (寬度 - 100)
  const x = (side === "left") ? 100 : (scene.game.config.width - 100);

  // 決定角色面向：
  // 預設 sprite 面向右，因此若在右側則需要翻轉（讓角色面向左）
  const flipX = (side === "left");

  // 如果是本地玩家點擊（發起召喚），通知伺服器廣播
  if (isLocal) {
    socket.emit("summon_monster", {
      monsterKey,
      player,
      side
    });
  }

  // 建立或取得 activeCharacters 的 Map
  if (!window.activeCharacters) {
    window.activeCharacters = new Map();
  }
  
  // 以時間戳建立唯一的角色 key
  const charKey = `${monsterKey}_${player}_${Date.now()}`;
  // 建立角色物件（假設 window.Char 為自訂的角色類別）
  const char = new window.Char(scene, x, y, monsterKey, flipX, side);
  window.activeCharacters.set(charKey, char);
}



// Add cleanup function
function cleanupCharacter(charKey) {
  const char = window.activeCharacters.get(charKey);
  if (char) {
    char.destroy();
    window.activeCharacters.delete(charKey);
  }
}

function updateUI() {
  const readyButton = (currentPlayer === 1) ? 
    document.getElementById("player1-ready") : 
    document.getElementById("player2-ready");
  
  if (readyButton) {
    readyButton.disabled = false;
  }
}

window.summonMonster = summonMonster;