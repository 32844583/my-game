// Battle.js
import socket from './NetworkManager.js';
import { playerSelections, currentPlayer } from './Prepare.js';
import { preloadAssets } from "./preloadAssets.js"; // 載入資源用的函式

// ================= 戰鬥階段關鍵變數 =================

// 玩家左右邊設定（由 server 在 game_start 時傳入）
export let player1Side = null;
export let player2Side = null;
export let gameStarted = false;

// 儲存已召喚角色的 Map
export let activeCharacters = new Map();

// Phaser 相關變數，讓外部能存取目前的 Phaser scene
export const PhaserSingleton = {
  scene: null,
};

let gameInstance = null; // 確保只建立一次遊戲實例

// ================= 戰鬥場景 (BattleScene) 與遊戲載入 =================

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: "BattleScene" });
    // 初始化玩家生命值（示範用）
    this.playerHearts = {
      player1: 3,
      player2: 3
    };
  }

  preload() {
    // 載入遊戲資源
    preloadAssets(this);
  }

  create() {
    // 設定背景色
    this.cameras.main.setBackgroundColor("#87CEEB");

    // 讓外部可取得目前 scene
    PhaserSingleton.scene = this;

    // 監聽 Matter.js 碰撞事件，處理角色間互動與攻擊邏輯
    this.matter.world.on("collisionstart", (event) => {
      event.pairs.forEach((pair) => {
        const CharA = window.Chars.find((p) => p.sprite === pair.bodyA.gameObject);
        const CharB = window.Chars.find((p) => p.sprite === pair.bodyB.gameObject);
    
        if (CharA && CharB && !CharA.isDead && !CharB.isDead) {
          // 若兩角色屬於不同陣營，進行攻擊判定
          if (CharA.side !== CharB.side) {
            // 假設 castle (home) 的 baseKey 是以 "home" 開頭
            const isAHome = CharA.baseKey.startsWith("home");
            const isBHome = CharB.baseKey.startsWith("home");
    
            if (isAHome && !isBHome) {
              // A 為 castle，讓 B 攻擊 A，攻擊後 B 自己死亡
              CharB.attack(CharA);
              CharB.die();
            } else if (!isAHome && isBHome) {
              // B 為 castle，讓 A 攻擊 B，攻擊後 A 自己死亡
              CharA.attack(CharB);
              CharA.die();
            } else {
              // 雙方皆非 castle，則雙方互攻
              CharA.attack(CharB);
              CharB.attack(CharA);
            }
          }
        }
      });
    });

    // 播放背景音樂
    this.bgm = this.sound.add("battle_bgm", {
      loop: true,
      volume: 0.5,
    });
    this.bgm.play();

    // 建立左右主堡（castle）
    const castleY = this.game.config.height / 2;
    const leftCastleX = 100;
    const rightCastleX = this.game.config.width - 100;

    // 注意：召喚物一般建立時，左側為 flipX: false，右側為 flipX: true
    // 但 home 的素材方向可能剛好相反，因此這裡調整 flipX 的值

    // 左側主堡：flipX 設為 true（與召喚物相反）
    const leftCastle = new window.Char(this, leftCastleX, castleY, "home", true, "left");
    leftCastle.speed = 0;  // 主堡固定不動

    // 右側主堡：flipX 設為 false
    const rightCastle = new window.Char(this, rightCastleX, castleY, "home", false, "right");
    rightCastle.speed = 0;
  }

  update() {
    // 每禎更新所有角色（假設 window.Chars 為角色陣列）
    window.Chars.forEach((p) => p.update());
  }
}

// 讓外部可透過 window 取得 BattleScene（如有需要）
window.BattleScene = BattleScene;

// 建立並啟動 Phaser 遊戲（僅建立一次）
export function startGame() {
  if (gameInstance) return gameInstance;
  
  const config = {
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 600,
    },
    parent: "battle", // HTML 中存放戰鬥畫面的容器 id
    physics: {
      default: "matter",
      matter: {
        gravity: { y: 0 },
        debug: false,
      },
    },
    scene: [BattleScene],
  };

  gameInstance = new Phaser.Game(config);
  return gameInstance;
}

// ================= 戰鬥階段其他函式與 Socket 事件 =================

// 當 server 通知雙方 Ready 完成後進入戰鬥場景
socket.on("game_start", (data) => {
  player1Side = data.player1Side;
  player2Side = data.player2Side;
  
  // 切換畫面：隱藏大廳、顯示戰鬥介面與召喚區
  document.getElementById("lobby").style.display = "none";
  document.getElementById("battle").style.display = "block";
  document.getElementById("summon-container").style.display = "block";
  
  // 更新召喚區，呈現準備階段選好的召喚物
  updateSummonContainer();
  
  // 啟動 Phaser 遊戲
  startGame();
  gameStarted = true;
});

// 更新召喚區：顯示玩家在準備階段選好的召喚物
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
    // 點擊後呼叫召喚角色函式
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
  
  // castle (home) 只能建立一次
  if (monsterKey === "home") {
    console.log("Castle already exists. Skip summoning duplicate home.");
    return;
  }
  
  // 判斷是否為本地玩家觸發
  const isLocal = (typeof summonedPlayer === "undefined");
  const player = isLocal ? currentPlayer : summonedPlayer;
  
  // 根據玩家編號決定角色所屬邊
  const side = (player === 1) ? player1Side : player2Side;
  if (!side) return;
  
  // 依據目前 Phaser 場景計算角色生成位置
  const scene = PhaserSingleton.scene;
  const y = scene.game.config.height / 2;
  const x = (side === "left") ? 100 : (scene.game.config.width - 100);
  // 決定角色面向：預設 sprite 面向右，若位於右側則翻轉（根據遊戲設定）
  const flipX = (side === "left");
  
  // 若為本地玩家點擊，發送召喚訊息給 server 廣播
  if (isLocal) {
    socket.emit("summon_monster", {
      monsterKey,
      player,
      side
    });
  }
  
  // 以時間戳建立唯一的角色 key 並建立角色物件
  const charKey = `${monsterKey}_${player}_${Date.now()}`;
  const char = new window.Char(scene, x, y, monsterKey, flipX, side);
  activeCharacters.set(charKey, char);
}

// 當收到其他玩家的召喚訊息時進行召喚
socket.on("monster_summoned", (data) => {
  const { monsterKey, player, side } = data;
  summonMonster(monsterKey, player);
});

// 移除角色的輔助函式
export function cleanupCharacter(charKey) {
  const char = activeCharacters.get(charKey);
  if (char) {
    char.destroy();
    activeCharacters.delete(charKey);
  }
}

// 讓 HTML 中的 onclick 可存取召喚函式
window.summonMonster = summonMonster;
