// battleScene.js
class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: "BattleScene" });
    this.playerHearts = {
      player1: 3,  // 初始化玩家1的生命值為3顆心
      player2: 3   // 初始化玩家2的生命值為3顆心
    };
  }

  preload() {
    // 載入 mano
    this.load.image("mano_base",  "assets/char/mano/base.png");
    this.load.image("mano_atk",   "assets/char/mano/atk.png");
    this.load.image("mano_hurt",  "assets/char/mano/hurt.png");
    this.load.image("mano_die",   "assets/char/mano/die.png");

    // 載入 stone (召喚物)
    this.load.image("stone_base", "assets/char/stone/base.png");
    this.load.image("stone_atk",  "assets/char/stone/atk.png");
    this.load.image("stone_hurt", "assets/char/stone/hurt.png");
    this.load.image("stone_die",  "assets/char/stone/die.png");
    // 載入 stone (召喚物)
    this.load.image("blue_snail_base", "assets/char/blue_snail/base.png");
    this.load.image("blue_snail_atk",  "assets/char/blue_snail/atk.png");
    this.load.image("blue_snail_hurt", "assets/char/blue_snail/hurt.png");
    this.load.image("blue_snail_die",  "assets/char/blue_snail/die.png");

    // 載入 stone (召喚物)
    this.load.image("red_snail_base", "assets/char/red_snail/base.png");
    this.load.image("red_snail_atk",  "assets/char/red_snail/atk.png");
    this.load.image("red_snail_hurt", "assets/char/red_snail/hurt.png");
    this.load.image("red_snail_die",  "assets/char/red_snail/die.png");

    // 載入 castle (主堡)
    this.load.image("home_base", "assets/char/home/base.png");
    this.load.image("home_atk",  "assets/char/home/atk.png");
    this.load.image("home_hurt", "assets/char/home/hurt.png");
    this.load.image("home_die",  "assets/char/home/die.png");

    this.load.image("damage_one", "assets/damage/one.png");
    this.load.image("damage_two", "assets/damage/two.png");
    this.load.image("damage_three", "assets/damage/three.png");
    this.load.image("damage_four", "assets/damage/four.png");
    this.load.image("damage_five", "assets/damage/five.png");
    this.load.image("damage_six", "assets/damage/six.png");
    this.load.image("damage_seven", "assets/damage/seven.png");
    this.load.image("damage_eight", "assets/damage/eight.png");
    this.load.image("damage_nine", "assets/damage/nine.png");
    this.load.image("damage_zero", "assets/damage/zero.png");

    // 載入音樂
    this.load.audio("battle_bgm", "assets/audio/background.mp3");
    this.load.audio("battle_atk", "assets/audio/atk.mp3");
    this.load.audio("battle_die", "assets/audio/die.mp3");

    // 在 preload 中
    this.load.json('attribute', 'assets/char/attribute.json');

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
