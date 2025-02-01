// networking.js
// const socket = io("https://my-game-aapb.onrender.com", {
//   withCredentials: true,
//   transports: ['websocket', 'polling']
// });
const socket = io("http://localhost:3000");
// 記錄各玩家在選擇階段所選擇的召喚物
window.playerSelections = { 1: [], 2: [] };

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


socket.on("game_start", (data) => {
  player1Side = data.player1Side;
  player2Side = data.player2Side;
  
  document.getElementById("lobby").style.display = "none";
  document.getElementById("battle").style.display = "block";
  document.getElementById("summon-container").style.display = "block";
  
  // （後續還會更新召喚區，參見任務三）
  updateSummonContainer();
  
  window.startGame();
  gameStarted = true;
});

function updateSummonContainer() {
  // 找到召喚區內的 monster-grid 區塊
  const summonGrid = document.querySelector("#summon-container .monster-grid");
  if (!summonGrid) return;
  // 清空原有的固定圖片（由 HTML 預設的內容）
  summonGrid.innerHTML = "";
  
  // 取得本地玩家所選擇的召喚物陣列
  const selections = window.playerSelections[currentPlayer] || [];
  
  // 依序建立每個選擇的召喚物圖片，並掛上召喚點擊事件
  selections.forEach(monsterKey => {
    const img = document.createElement("img");
    img.src = `assets/char/${monsterKey}/base.png`;
    img.alt = monsterKey;
    img.className = "monster-img";
    img.onclick = function() { summonMonster(monsterKey, this); };
    summonGrid.appendChild(img);
  });
}

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

// ================= 選擇區相關 =================

// 記錄每位玩家在選擇區已選取的召喚物數量（上限依需求設定，例如 6 個）
const selectionCounts = {
  1: 0,
  2: 0
};

// 當玩家在選擇區點擊某張召喚物圖片時，呼叫此函式
function selectMonster(monsterKey, imgElem) {
  // 假設每位玩家最多可選 6 個
  if (selectionCounts[currentPlayer] >= 6) {
    alert('你已選滿召喚物');
    return;
  }

  // 將點選的圖片變灰並禁用
  imgElem.style.filter = 'grayscale(100%)';
  imgElem.style.pointerEvents = 'none';

  // 更新自己畫面：在選擇結果區新增縮圖
  updateSelectionUI(monsterKey, currentPlayer);

  // 更新本地計數
  selectionCounts[currentPlayer]++;
  
  // 任務三：記錄本地玩家所選擇的召喚物
  window.playerSelections[currentPlayer].push(monsterKey);

  // 發送選擇事件給伺服器，讓其他玩家同步更新
  socket.emit("monster_selected", { monsterKey, player: currentPlayer });
}

// 當收到其他玩家的選擇事件時，更新對方的選擇區
socket.on("monster_selected", (data) => {
  // 若事件來自本地，則已由 selectMonster 處理，不需重複更新
  if (data.player === currentPlayer) return;
  updateSelectionUI(data.monsterKey, data.player);
  // 更新對方的選擇計數（如有需要）
  selectionCounts[data.player] = (selectionCounts[data.player] || 0) + 1;
  // 禁用對應選擇區的圖片
  disableMonsterImage(data.monsterKey);
});

// 更新選擇區畫面的函式（根據玩家編號更新對應區塊）
function updateSelectionUI(monsterKey, player) {
  const containerId = (player === 1) ? "player1-selection" : "player2-selection";
  const container = document.getElementById(containerId);

  // 建立選取角色的圖片（可依需求調整尺寸與樣式）
  const selectedImg = document.createElement("img");
  selectedImg.src = `assets/char/${monsterKey}/base.png`;
  selectedImg.style.width = "50px";
  selectedImg.style.margin = "5px";

  container.appendChild(selectedImg);
}

// 將 selectMonster 暴露到全域，讓 HTML 中的 onclick 可存取
window.selectMonster = selectMonster;


// 根據 monsterKey 找出選擇區內所有對應圖片，並設為灰階、禁止點擊
function disableMonsterImage(monsterKey) {
  const imgs = document.querySelectorAll('#selection-container .monster-grid img');
  imgs.forEach(img => {
    // 假設圖片來源格式固定為 "assets/char/【monsterKey】/base.png"
    if (img.src.indexOf(`/assets/char/${monsterKey}/base.png`) !== -1) {
      img.style.filter = 'grayscale(100%)';
      img.style.pointerEvents = 'none';
    }
  });
}
