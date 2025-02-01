export function preloadAssets(scene) {
  // 角色資源
  const characters = [
    "mano", "stone", "blue_snail", "red_snail", "cellion",
    "grupin", "lioner", "lucida", "king_clang", "lycanthrope",
    "yeti", "dark_yeti", "home"
  ];

  characters.forEach((char) => {
    scene.load.image(`${char}_base`, `assets/char/${char}/base.png`);
    scene.load.image(`${char}_atk`, `assets/char/${char}/atk.png`);
    scene.load.image(`${char}_hurt`, `assets/char/${char}/hurt.png`);
    scene.load.image(`${char}_die`, `assets/char/${char}/die.png`);
  });

  // 傷害數字資源
  for (let i = 0; i <= 9; i++) {
    scene.load.image(`damage_${i}`, `assets/damage/${i}.png`);
  }

  // 音樂資源
  scene.load.audio("battle_bgm", "assets/audio/background.mp3");

  scene.load.audio("battle_die", "assets/audio/die.mp3");
  scene.load.audio("battle_atk", "assets/audio/atk.mp3");
  // 屬性資料
  scene.load.json("attribute", "assets/char/attribute.json");
}
