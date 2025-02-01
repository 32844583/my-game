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
  if (gameInstance) return gameInstance;
  
  const config = {
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 600,
    },
    parent: "battle",
    physics: {
      default: "matter",
      matter: {
        gravity: { y: 0 },
        debug: false,
      },
    },
    scene: [BattleScene],
  };

  // 只建立一次遊戲實例
  gameInstance = new Phaser.Game(config);
  return gameInstance;
};
