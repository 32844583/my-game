// game.js

// 讓外部能存取 Phaser 場景
const PhaserSingleton = {
  scene: null,
};

/**
 * 建立並啟動 Phaser 遊戲。
 * 若想在網頁載入時就自動啟動，則可直接把 new Phaser.Game(...) 寫在最外層。
 */
window.startGame = function() {
  const config = {
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.FIT,   // 或 Phaser.Scale.RESIZE
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,   // 基礎寬
      height: 600,  // 基礎高
    },
    parent: "battle",
    physics: {
      default: "matter",
      matter: {
        gravity: { y: 0 },
        debug: false,
      },
    },
    // 注意：若以 class 寫法，這裡用陣列引入
    scene: [BattleScene],
  };

  // 建立 Phaser.Game 實例
  new Phaser.Game(config);
};
