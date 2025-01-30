// battleScene.js

class BattleScene extends Phaser.Scene {
    constructor() {
      super({ key: "BattleScene" });
    }
  
    preload() {
      // 載入 mano
      this.load.image("mano_base",  "assets/char/mano/base.png");
      this.load.image("mano_atk",   "assets/char/mano/atk.png");
      this.load.image("mano_hurt",  "assets/char/mano/hurt.png");
      this.load.image("mano_die",   "assets/char/mano/die.png");
  
      // 載入 stone
      this.load.image("stone_base", "assets/char/stone/base.png");
      this.load.image("stone_atk",  "assets/char/stone/atk.png");
      this.load.image("stone_hurt", "assets/char/stone/hurt.png");
      this.load.image("stone_die",  "assets/char/stone/die.png");
  
      // 載入音樂
      this.load.audio("battle_bgm", "assets/audio/background.mp3");
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
            // 如果不同 side，表示敵對，便觸發互相攻擊
            if (CharA.side !== CharB.side) {
              CharA.attack(CharB);
              CharB.attack(CharA);
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
    }
  
    update() {
      // 每禎更新所有角色
      window.Chars.forEach((p) => p.update());
    }
  }
  
  // 讓 game.js 能引用到這個場景類別
  window.BattleScene = BattleScene;
  