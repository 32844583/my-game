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
      width: 800,
      height: 600,
    },
    parent: "battle", // HTML 容器 id
    physics: {
      default: "matter",
      matter: {
        gravity: { y: 0 },
        debug: false,
      },
    },
    scene: [PrepareScene, BattleScene], // 設定場景
  };

  gameInstance = new Phaser.Game(config);
  return gameInstance;
}
startGame();
// 讓外部可以透過 window 取得 `startGame`
window.startGame = startGame;
