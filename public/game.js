// Phaser 遊戲初始化
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
      default: "matter",
      matter: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: { preload, create, update }
  };
  
  function preload() {
    this.load.image("mano_base", "assets/char/mano/base.png");
    this.load.image("mano_atk",  "assets/char/mano/atk.png");
    this.load.image("mano_hurt", "assets/char/mano/hurt.png");
    this.load.image("mano_die",  "assets/char/mano/die.png");
  
    this.load.image("stone_base", "assets/char/stone/base.png");
    this.load.image("stone_atk",  "assets/char/stone/atk.png");
    this.load.image("stone_hurt", "assets/char/stone/hurt.png");
    this.load.image("stone_die",  "assets/char/stone/die.png");
  }
  
  function create() {
    this.cameras.main.setBackgroundColor("#87CEEB");
  
    // 建立角色 (注意：我們用 window.Char)
    new window.Char(this, 100, 300, "mano", true);
    new window.Char(this, 700, 300, "stone", false);
  
    // 碰撞
    this.matter.world.on("collisionstart", (event) => {
      event.pairs.forEach((pair) => {
        const CharA = window.Chars.find(p => p.sprite === pair.bodyA.gameObject);
        const CharB = window.Chars.find(p => p.sprite === pair.bodyB.gameObject);
  
        if (CharA && CharB && !CharA.isDead && !CharB.isDead) {
          CharA.attack(CharB);
          CharB.attack(CharA);
        }
      });
    });
  }
  
  function update() {
    // 每禎更新所有角色
    window.Chars.forEach(p => p.update());
  }
  
  const game = new Phaser.Game(config);
  