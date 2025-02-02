// Battle.js
import socket from './NetworkManager.js';
import { playerSelections, currentPlayer } from './Prepare.js';
import { preloadAssets } from "./preloadAssets.js";

window.player1Side = null;
window.player2Side = null;
export let activeCharacters = new Map();

let currentScene = null; // 儲存當前場景的參考

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: "BattleScene" });
  }
  init(data) {
    // 接收 `PrepareScene` 傳來的 `sides` 資料
    if (data) {
      player1Side = data.player1Side || "left";
      player2Side = data.player2Side || "right";
    }
  }
  preload() {
    preloadAssets(this);
  }

  create() {
    this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, "battle_bg")
      .setOrigin(0.5, 0.5)
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
      
    currentScene = this;

    this.matter.world.on("collisionstart", (event) => {
      event.pairs.forEach((pair) => {
        const CharA = window.Chars.find((p) => p.sprite === pair.bodyA.gameObject);
        const CharB = window.Chars.find((p) => p.sprite === pair.bodyB.gameObject);

        if (CharA && CharB && !CharA.isDead && !CharB.isDead) {
          if (CharA.side !== CharB.side) {
            const isAHome = CharA.baseKey.startsWith("home");
            const isBHome = CharB.baseKey.startsWith("home");

            if (isAHome && !isBHome) {
              CharB.attack(CharA);
              CharB.die();
            } else if (!isAHome && isBHome) {
              CharA.attack(CharB);
              CharA.die();
            } else {
              CharA.attack(CharB);
              CharB.attack(CharA);
            }
          }
        }
      });
    });

    this.bgm = this.sound.add("battle_bgm", { loop: true, volume: 0.2 });
    this.bgm.play();

    const castleY = this.game.config.height / 2;
    const leftCastleX = 100;
    const rightCastleX = this.game.config.width - 100;

    const leftCastle = new window.Char(this, leftCastleX, castleY, "home", true, "left");
    leftCastle.speed = 0;

    const rightCastle = new window.Char(this, rightCastleX, castleY, "home", false, "right");
    rightCastle.speed = 0;

    document.getElementById("lobby").style.display = "none";
    document.getElementById("battle").style.display = "block";
    document.getElementById("summon-container").style.display = "block";

    updateSummonContainer();
  }

  update() {
    window.Chars.forEach((p) => p.update());
  }
}

window.BattleScene = BattleScene;

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
    
    img.onclick = function() {
      summonMonster(monsterKey); // 不傳 currentPlayer
    };
    
    summonGrid.appendChild(img);
  });
}

export function summonMonster(monsterKey, summonedPlayer) {
  // 檢查是否為本地觸發的召喚
  const isLocal = (typeof summonedPlayer === "undefined");

  // 如果是本地召喚才檢查節流機制
  if (isLocal && window.lastSummonTime && Date.now() - window.lastSummonTime < 1000) return;
  if (isLocal) {
    window.lastSummonTime = Date.now();
  }

  if (monsterKey === "home") return;

  // 根據來源決定玩家編號
  const player = isLocal ? currentPlayer : summonedPlayer;
  const side = (player === 1) ? player1Side : player2Side;
  
  if (!side || !currentScene) return;
  
  const scene = currentScene;
  const y = scene.game.config.height / 2;
  const x = (side === "left") ? 100 : (scene.game.config.width - 100);
  const flipX = (side === "left");
  
  // 若為本地召喚，通知伺服器
  if (isLocal) {
    socket.emit("summon_monster", { monsterKey, player});
  }
  
  const charKey = `${monsterKey}_${player}_${Date.now()}`;
  const char = new window.Char(scene, x, y, monsterKey, flipX, side);
  activeCharacters.set(charKey, char);
}


socket.on("monster_summoned", (data) => {
  summonMonster(data.monsterKey, data.player);
});

export function cleanupCharacter(charKey) {
  const char = activeCharacters.get(charKey);
  if (char) {
    char.destroy();
    activeCharacters.delete(charKey);
  }
}

window.summonMonster = summonMonster;
