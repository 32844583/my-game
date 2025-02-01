// Prepare.js
import socket from './NetworkManager.js';

// ================= 準備階段關鍵變數 =================

// 記錄各玩家在選擇階段所選擇的召喚物
export const playerSelections = { 1: [], 2: [] };

// 記錄每位玩家在選擇區已選取的召喚物數量（上限例如 6 個）
export const selectionCounts = { 1: 0, 2: 0 };

// 玩家 Ready 狀態
export let player1Ready = false;
export let player2Ready = false;

// 當前玩家編號（由 server 指定）
export let currentPlayer = null;

// ================= 準備階段函式與 Socket 事件 =================

// 更新按鈕 UI
export function updateUI() {
  const readyButton = (currentPlayer === 1) ?
    document.getElementById("player1-ready") :
    document.getElementById("player2-ready");
  if (readyButton) {
    readyButton.disabled = false;
  }
}

// 檢查雙方是否 Ready 完成，若是則通知 server
function checkBothReady() {
  if (player1Ready && player2Ready) {
    socket.emit("both_ready");
  }
}

// 接收 server 指定玩家編號
socket.on("player_number", (number) => {
  currentPlayer = number;
  console.log(`You are Player ${number}`);
  updateUI();
});

// 接收其他玩家 Ready 狀態更新
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

// Ready 按鈕點擊事件
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

// 當玩家在選擇區點擊某張召喚物圖片時，呼叫此函式
export function selectMonster(monsterKey, imgElem) {
  if (selectionCounts[currentPlayer] >= 6) {
    alert('你已選滿召喚物');
    return;
  }
  
  // 讓被選取的圖片變灰並禁止點擊
  imgElem.style.filter = 'grayscale(100%)';
  imgElem.style.pointerEvents = 'none';
  
  // 更新自己畫面：在選擇結果區新增縮圖
  updateSelectionUI(monsterKey, currentPlayer);
  
  // 更新本地計數並記錄選擇結果
  selectionCounts[currentPlayer]++;
  playerSelections[currentPlayer].push(monsterKey);
  
  // 通知 server 同步其他玩家的選擇
  socket.emit("monster_selected", { monsterKey, player: currentPlayer });
}

// 當收到其他玩家的選擇事件時，更新對方選擇區
socket.on("monster_selected", (data) => {
  if (data.player === currentPlayer) return;
  updateSelectionUI(data.monsterKey, data.player);
  selectionCounts[data.player] = (selectionCounts[data.player] || 0) + 1;
  disableMonsterImage(data.monsterKey);
});

// 更新選擇結果畫面（依玩家編號更新對應區塊）
export function updateSelectionUI(monsterKey, player) {
  const containerId = (player === 1) ? "player1-selection" : "player2-selection";
  const container = document.getElementById(containerId);
  
  const selectedImg = document.createElement("img");
  selectedImg.src = `assets/char/${monsterKey}/base.png`;
  selectedImg.style.width = "50px";
  selectedImg.style.margin = "5px";
  
  container.appendChild(selectedImg);
}

// 根據 monsterKey 找出選擇區內所有對應圖片，將其設為灰階且禁止點擊
export function disableMonsterImage(monsterKey) {
  const imgs = document.querySelectorAll('#selection-container .monster-grid img');
  imgs.forEach(img => {
    if (img.src.indexOf(`/assets/char/${monsterKey}/base.png`) !== -1) {
      img.style.filter = 'grayscale(100%)';
      img.style.pointerEvents = 'none';
    }
  });
}

// 為了讓 HTML 中的 onclick 可以存取，將 selectMonster 挂在 global
window.selectMonster = selectMonster;
