// Game.js
import { BattleScene } from "./Battle.js";
import { PrepareScene } from "./Prepare.js";

let gameInstance = null; // 確保遊戲實例只建立一次

export function startGame() {
  if (gameInstance) return gameInstance;

  const config = {
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: window.innerWidth * 0.9,  // 讓寬度等於 90vw
      height: window.innerHeight * 0.9, // 讓高度等於 90vh
    },
    parent: "battle", 
    physics: {
      default: "matter",
      matter: {
        gravity: { y: 0 },
        debug: false,
      },
    },
    scene: [PrepareScene, BattleScene],
  };

  gameInstance = new Phaser.Game(config);
  return gameInstance;
}
startGame();
// 讓外部可以透過 window 取得 `startGame`
window.startGame = startGame;
