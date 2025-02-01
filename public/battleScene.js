// battleScene.js

import { preloadAssets } from "./preloadAssets.js"; // 引入載入函式


class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: "BattleScene" });
    this.playerHearts = {
      player1: 3,  // 初始化玩家1的生命值為3顆心
      player2: 3   // 初始化玩家2的生命值為3顆心
    };
  }

  preload() {
    preloadAssets(this); // 調用載入函式
  }

  create() {
    // 場景背景色
    this.cameras.main.setBackgroundColor("#87CEEB");

    // 讓外部可從 PhaserSingleton.scene 取得此 scene
    PhaserSingleton.scene = this;

    // 監聽角色碰撞
    this.matter.world.on("collisionstart", (event) => {
      event.pairs.forEach((pair) => {
        const CharA = window.Chars.find((p) => p.sprite === pair.bodyA.gameObject);
        const CharB = window.Chars.find((p) => p.sprite === pair.bodyB.gameObject);
    
        if (CharA && CharB && !CharA.isDead && !CharB.isDead) {
          // 如果兩角色屬於不同陣營
          if (CharA.side !== CharB.side) {
            // 檢查是否有 castle (home) 參與，這裡假設 castle 的 baseKey 是以 "home" 開頭
            const isAHome = CharA.baseKey.startsWith("home");
            const isBHome = CharB.baseKey.startsWith("home");
    
            if (isAHome && !isBHome) {
              // 若 A 為 castle，則讓 B (召喚物) 攻擊 A，並在攻擊後立即死亡
              CharB.attack(CharA);
              CharB.die();
            } else if (!isAHome && isBHome) {
              // 若 B 為 castle，則讓 A (召喚物) 攻擊 B，並在攻擊後立即死亡
              CharA.attack(CharB);
              CharA.die();
            } else {
              // 若雙方皆不是 castle，則雙方互攻
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
      volume: 0.5, // 音量 0~1
    });
    this.bgm.play();


    // 取得目前場景，並根據遊戲設定計算位置
    const scene = PhaserSingleton.scene;
    // 任務二：垂直位置統一為 config 高度的一半
    const castleY = scene.game.config.height / 2;
    const leftCastleX = 100;  
    const rightCastleX = this.game.config.width - 100;

    // 注意：召喚物一般建立時，左側為 flipX: false，右側為 flipX: true
    // 但 home 的素材方向剛好相反，因此這裡交換 flipX 的布林值

    // 左側主堡：設定 flipX 為 true（與召喚物相反）
    const leftCastle = new Char(this, leftCastleX, castleY, "home", true, "left");
    leftCastle.speed = 0;  // 主堡不移動

    // 右側主堡：設定 flipX 為 false
    const rightCastle = new Char(this, rightCastleX, castleY, "home", false, "right");
    rightCastle.speed = 0;

  }


  update() {
    // 每禎更新所有角色
    window.Chars.forEach((p) => p.update());
  }
}

// 讓 game.js 能引用到這個場景類別
window.BattleScene = BattleScene;
