// 全域陣列 - 所有角色
window.Chars = [];
// 分別存放兩位玩家召喚的角色
window.Player1Chars = [];
window.Player2Chars = [];

/**
 * 角色類別
 */
class Char {
  /**
   * @param {Phaser.Scene} scene - Phaser 場景
   * @param {number} x - 初始 X 座標
   * @param {number} y - 初始 Y 座標
   * @param {string} keyPrefix - 圖片 key 前綴 (e.g. "mano", "stone", "home")
   * @param {boolean} flipX - 是否水平翻轉角色 (決定面向)
   * @param {string} side - "left" 或 "right" (用來決定陣營, 移動方向)
   */
  constructor(scene, x, y, keyPrefix, flipX, side) {
    this.scene = scene;

    // 從 preload 階段預先載入的 JSON 中取得屬性資料
    // 請確保在場景 preload 階段有載入：
    // this.load.json('attribute', 'assets/char/attribute.json');
    const attrData = scene.cache.json.get('attribute');

    if (attrData && attrData[keyPrefix]) {
      const charAttr = attrData[keyPrefix];
      this.atk = charAttr.atk;
      this.hp = charAttr.hp;
      this.energy = charAttr.energy;  // 新增 energy 屬性初始化
    } else {
      // 若無法取得對應屬性資料，則使用預設值
      this.atk = 1;
      this.hp = 5;
      this.energy = 0;
    }
    // 儲存最大血量，用於 hpBar 繪製（以防 hp 在遊戲中被扣減）
    this.maxHp = this.hp;

    this.isDead = false;
    this.isAttacking = false;
    this.side = side;

    // 設定圖片 key
    this.baseKey = `${keyPrefix}_base`;
    this.atkKey  = `${keyPrefix}_atk`;
    this.hurtKey = `${keyPrefix}_hurt`;
    this.dieKey  = `${keyPrefix}_die`;

    // 新增 canAttack 屬性：如果是 home 就不攻擊
    this.canAttack = (keyPrefix !== "home");

    const sensorOptions = { isSensor: true, circleRadius: 40 };
    this.sprite = scene.matter.add.sprite(x, y, this.baseKey, null, sensorOptions);
    this.sprite.setFixedRotation();
    this.sprite.setOrigin(0.5, 1);

    if (flipX) {
      this.sprite.setFlipX(true);
    }

    this.direction = (this.side === "left") ? 1 : -1;
    this.speed = 2;

    this.hpBar = scene.add.graphics();

    window.Chars.push(this);
    if (this.side === "left") {
      window.Player1Chars.push(this);
    } else {
      window.Player2Chars.push(this);
    }

    this.updateHpBar();
  }

  // 每禎更新
  update() {
    if (this.isDead) return;

    // 若非攻擊狀態就持續移動
    if (!this.isAttacking) {
      this.sprite.setVelocityX(this.direction * this.speed);
    } else {
      this.sprite.setVelocityX(0);
    }

    this.updateHpBar();
  }

  // 攻擊
  attack(target) {
    if (!this.canAttack) return;
    if (this.isDead || target.isDead) return;
    if (this.isAttacking) return;

    this.isAttacking = true;
    this.sprite.setTexture(this.atkKey);

    this.scene.sound.play("battle_atk");

    target.takeDamage(this.atk);

    this.scene.time.delayedCall(300, () => {
      if (!this.isDead) {
        this.sprite.setTexture(this.baseKey);
      }
      this.isAttacking = false;
    });
  }

  // 受傷
  takeDamage(dmg) {
    if (this.isDead) return;
    this.showDamage(dmg);
    
    this.hp -= dmg;
    this.updateHpBar();

    if (this.hp <= 0) {
      this.die();
      return;
    }

    this.sprite.setTexture(this.hurtKey);

    if (!this.baseKey.startsWith("home")) {
      const backDistance = 40;
      this.scene.tweens.add({
        targets: this.sprite,
        x: this.sprite.x + (this.direction * -backDistance),
        duration: 200,
        onComplete: () => {
          if (!this.isDead) {
            this.sprite.setTexture(this.baseKey);
          }
        }
      });
    } else {
      this.scene.time.delayedCall(300, () => {
        if (!this.isDead) {
          this.sprite.setTexture(this.baseKey);
        }
      });
    }
  }

  // 顯示傷害數字
  showDamage(dmg) {
    const dmgStr = dmg.toString();
    const digits = dmgStr.split('');
    const digitNames = {
      '0': 'zero',
      '1': 'one',
      '2': 'two',
      '3': 'three',
      '4': 'four',
      '5': 'five',
      '6': 'six',
      '7': 'seven',
      '8': 'eight',
      '9': 'nine'
    };

    const digitWidth = 20;
    const totalWidth = digits.length * digitWidth;
    const startX = this.sprite.x - totalWidth / 2 + digitWidth / 2;
    const startY = this.sprite.y - 60;

    digits.forEach((d, i) => {
      const key = 'damage_' + digitNames[d];
      const digitImage = this.scene.add.image(startX + i * digitWidth, startY, key);
      digitImage.setOrigin(0.5);

      this.scene.tweens.add({
        targets: digitImage,
        y: digitImage.y - 30,
        alpha: 0,
        duration: 500,
        ease: 'Linear',
        onComplete: () => {
          digitImage.destroy();
        }
      });
    });
  }

  // 死亡
  die() {
    this.isDead = true;
    this.sprite.setTexture(this.dieKey);

    this.scene.sound.play("battle_die");

    this.scene.time.delayedCall(500, () => {
      this.sprite.destroy();
      this.hpBar.destroy();

      if (this.side === "left") {
        const idx = window.Player1Chars.indexOf(this);
        if (idx !== -1) {
          window.Player1Chars.splice(idx, 1);
        }
      } else {
        const idx = window.Player2Chars.indexOf(this);
        if (idx !== -1) {
          window.Player2Chars.splice(idx, 1);
        }
      }
    });
  }

  // 血量條繪製
  updateHpBar() {
    if (this.isDead) return;
    this.hpBar.clear();

    // 底色 (黑色)
    this.hpBar.fillStyle(0x000000);
    this.hpBar.fillRect(this.sprite.x - 25, this.sprite.y - 40, 50, 6);

    // 紅色血條：依據當前 hp 與最大 hp 的比例來計算
    const barWidth = (this.hp / this.maxHp) * 50;
    this.hpBar.fillStyle(0xff0000);
    this.hpBar.fillRect(this.sprite.x - 25, this.sprite.y - 40, barWidth, 6);
  }
}

// 讓外部可直接使用 `new window.Char(...)`
window.Char = Char;
