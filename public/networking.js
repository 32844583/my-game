networking.js
const socket = io("https://my-game-aapb.onrender.com", {
  withCredentials: true,
  transports: ['websocket', 'polling']
});
// const socket = io("http://localhost:3000");

let player1Ready = false;
let player2Ready = false;
let player1Side = null;
let player2Side = null;
let gameStarted = false;
let currentPlayer = null;

socket.on("connect", () => {
  console.log("Connected to server");
});

socket.on("player_number", (number) => {
  currentPlayer = number;
  console.log(`You are Player ${number}`);
  updateUI();
});

socket.on("player_ready", (data) => {
  if (data.player === 1) {
    player1Ready = true;
    document.getElementById("player1-ready").textContent = "Ready!";
  }
  if (data.player === 2) {
    player2Ready = true;
    document.getElementById("player2-ready").textContent = "Ready!";
  }
  checkBothReady();
});

let gameInstance = null;

socket.on("game_start", (data) => {
  player1Side = data.player1Side;
  player2Side = data.player2Side;
  
  document.getElementById("lobby").style.display = "none";
  document.getElementById("battle").style.display = "block";
  document.getElementById("summon-container").style.display = "block";
  
  if (!gameInstance) {
    gameInstance = startGame();
  }
});

socket.on("monster_summoned", (data) => {
  const { monsterKey, player, side } = data;
  summonMonster(monsterKey, player);
});

document.getElementById("player1-ready").addEventListener("click", () => {
  if (currentPlayer === 1 && !player1Ready) {
    socket.emit("ready", { player: 1 });
  }
});

document.getElementById("player2-ready").addEventListener("click", () => {
  if (currentPlayer === 2 && !player2Ready) {
    socket.emit("ready", { player: 2 });
  }
});

function checkBothReady() {
  if (player1Ready && player2Ready && !gameStarted) {
    socket.emit("both_ready");
  }
}

function summonMonster(monsterKey, player) {
  // Prevent repeated summons
  if (window.lastSummonTime && Date.now() - window.lastSummonTime < 1000) {
    return;
  }
  window.lastSummonTime = Date.now();

  const side = (player === 1) ? player1Side : player2Side;
  if (!side) return;

  const x = (side === "left") ? 100 : 700;
  const y = 300;
  const flipX = (side === "left");

  if (player === currentPlayer) {
    socket.emit("summon_monster", {
      monsterKey,
      player,
      side
    });
  }

  // Create character instance only once
  if (!window.activeCharacters) {
    window.activeCharacters = new Map();
  }

  const charKey = `${monsterKey}_${player}_${Date.now()}`;
  const char = new window.Char(PhaserSingleton.scene, x, y, monsterKey, flipX, side);
  window.activeCharacters.set(charKey, char);
}

// Add cleanup function
function cleanupCharacter(charKey) {
  const char = window.activeCharacters.get(charKey);
  if (char) {
    char.destroy();
    window.activeCharacters.delete(charKey);
  }
}

function updateUI() {
  const readyButton = (currentPlayer === 1) ? 
    document.getElementById("player1-ready") : 
    document.getElementById("player2-ready");
  
  if (readyButton) {
    readyButton.disabled = false;
  }
}

window.summonMonster = summonMonster;