// Battle.js
import socket from './NetworkManager.js';
// 如有需要存取準備階段的資料（例如玩家選擇），可從 Prepare.js 匯入
import { playerSelections, currentPlayer } from './Prepare.js';

// ================= 戰鬥階段關鍵變數 =================

export let player1Side = null;
export let player2Side = null;
export let gameStarted = false;

// 儲存已召喚角色的 Map
export let activeCharacters = new Map();

// ================= 戰鬥階段函式與 Socket 事件 =================

// 當 server 通知雙方 Ready 完成後，進入戰鬥場景
socket.on("game_start", (data) => {
  player1Side = data.player1Side;
  player2Side = data.player2Side;
  
  // 切換畫面：隱藏大廳、顯示戰鬥介面與召喚區
  document.getElementById("lobby").style.display = "none";
  document.getElementById("battle").style.display = "block";
  document.getElementById("summon-container").style.display = "block";
  
  // 更新召喚區，呈現準備階段已選好的召喚物
  updateSummonContainer();
  
  if (window.startGame) window.startGame();
  gameStarted = true;
});

// 更新召喚區（依據準備階段記錄的 playerSelections）
export function updateSummonContainer() {
  const summonGrid = document.querySelector("#summon-container .monster-grid");
  if (!summonGrid) return;
  summonGrid.innerHTML = "";
  
  const selections = playerSelections[currentPlayer] || [];
  
  selections.forEach(monsterKey => {
    const img = document.createElement("img");
    img.src = `assets/char/${monsterKey}/base.png`;
    img.alt = monsterKey;
    img.className = "monster-img";
    // 點擊後執行召喚動作
    img.onclick = function() { summonMonster(monsterKey); };
    summonGrid.appendChild(img);
  });
}

// 召喚角色函式
export function summonMonster(monsterKey, summonedPlayer) {
  // 防止短時間內重複召喚
  if (window.lastSummonTime && Date.now() - window.lastSummonTime < 1000) {
    return;
  }
  window.lastSummonTime = Date.now();
  
  // 若 monsterKey 為 "home"，避免重複生成
  if (monsterKey === "home") {
    console.log("Castle already exists. Skip summoning duplicate home.");
    return;
  }
  
  // 判斷是否為本地玩家發起的召喚
  const isLocal = (typeof summonedPlayer === "undefined");
  const player = isLocal ? currentPlayer : summonedPlayer;
  
  // 根據玩家編號決定角色所屬邊（在 game_start 時已設定）
  const side = (player === 1) ? player1Side : player2Side;
  if (!side) return;
  
  // 依據 Phaser 場景計算角色生成位置
  const scene = PhaserSingleton.scene;
  const y = scene.game.config.height / 2;
  const x = (side === "left") ? 100 : (scene.game.config.width - 100);
  const flipX = (side === "left");
  
  // 如果是本地玩家點擊，發送召喚訊息給 server 廣播
  if (isLocal) {
    socket.emit("summon_monster", {
      monsterKey,
      player,
      side
    });
  }
  
  // 產生唯一的角色 key 並建立角色物件（假設 window.Char 為自訂角色類別）
  const charKey = `${monsterKey}_${player}_${Date.now()}`;
  const char = new window.Char(scene, x, y, monsterKey, flipX, side);
  activeCharacters.set(charKey, char);
}

// 接收其他玩家的召喚訊息
socket.on("monster_summoned", (data) => {
  const { monsterKey, player, side } = data;
  summonMonster(monsterKey, player);
});

// 移除角色輔助函式
export function cleanupCharacter(charKey) {
  const char = activeCharacters.get(charKey);
  if (char) {
    char.destroy();
    activeCharacters.delete(charKey);
  }
}

// 將 summonMonster 函式掛在 global 供 HTML onclick 使用
window.summonMonster = summonMonster;
