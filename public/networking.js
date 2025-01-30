// networking.js

const socket = io("https://my-game-aapb.onrender.com");

socket.on("both_ready", () => {
  document.getElementById("summon-container").style.display = "block";
});

let player1Ready = false;
let player2Ready = false;
let player1Side = null;
let player2Side = null;
let gameStarted = false; // 防止重複執行 startGame()

/************************
 * 監聽「準備」按鈕事件
 ************************/
document.getElementById("player1-ready").addEventListener("click", () => {
  player1Ready = true;
  checkBothReady();
});

document.getElementById("player2-ready").addEventListener("click", () => {
  player2Ready = true;
  checkBothReady();
});

/************************
 * 檢查雙方是否都準備好
 ************************/
function checkBothReady() {
  if (player1Ready && player2Ready && !gameStarted) {
    // 隨機分配 side
    if (Math.random() < 0.5) {
      player1Side = "left";
      player2Side = "right";
    } else {
      player1Side = "right";
      player2Side = "left";
    }

    console.log(`玩家1 side = ${player1Side}`);
    console.log(`玩家2 side = ${player2Side}`);

    // 顯示狀態
    document.getElementById("status").textContent = "雙方都準備完成，進入戰鬥！";

    // 隱藏 lobby, 顯示 battle 區域
    document.getElementById("lobby").style.display  = "none";
    document.getElementById("battle").style.display = "block";
    // 顯示召喚按鈕
    document.getElementById("summon-container").style.display = "block";

    // 呼叫 game.js 中的 startGame() 來初始化 Phaser
    window.startGame();
    gameStarted = true;
  }
}

/************************
 * 召喚怪物
 * @param {string} monsterKey - e.g. "mano", "stone"
 * @param {number} player - 1 or 2
 ************************/
function summonMonster(monsterKey, player) {
  // 根據玩家取得 side
  let side = (player === 1) ? player1Side : player2Side;
  if (!side) {
    console.warn("召喚失敗：尚未分配 side 或玩家未準備。");
    return;
  }

  // 依 side 決定角色起始座標 & flipX
  let x, y = 300, flipX;
  if (side === "left") {
    x = 100;
    flipX = true;
  } else {
    x = 700;
    flipX = false;
  }

  // 建立角色（需依賴 character.js + BattleScene）
  new window.Char(PhaserSingleton.scene, x, y, monsterKey, flipX, side);

  console.log(`玩家${player}(${side}) 召喚了 ${monsterKey}`);
}

// 讓前端按鈕可直接呼叫 summonMonster
window.summonMonster = summonMonster;
