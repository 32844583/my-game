// character.js

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
   * @param {string} keyPrefix - 圖片 key 前綴 (e.g. "mano", "stone")
   * @param {boolean} flipX - 是否水平翻轉角色 (決定面向)
   * @param {string} side - "left" 或 "right" (用來決定陣營, 移動方向)
   */
  constructor(scene, x, y, keyPrefix, flipX, side) {
    this.scene = scene;
    this.hp = 5;
    this.atk = 1;
    this.isDead = false;
    this.isAttacking = false;

    // 紀錄玩家陣營 (left / right)
    this.side = side;

    // 設定圖片 key
    this.baseKey = `${keyPrefix}_base`;
    this.atkKey  = `${keyPrefix}_atk`;
    this.hurtKey = `${keyPrefix}_hurt`;
    this.dieKey  = `${keyPrefix}_die`;

    // 使用 Matter.js
    const sensorOptions = { isSensor: true, circleRadius: 40 };
    this.sprite = scene.matter.add.sprite(x, y, this.baseKey, null, sensorOptions);
    this.sprite.setFixedRotation();

    if (flipX) {
      this.sprite.setFlipX(true);
    }

    // 根據陣營決定基礎移動方向 (left 往右 / right 往左)
    this.direction = (this.side === "left") ? 1 : -1;
    this.speed = 2;

    // 建立血量條
    this.hpBar = scene.add.graphics();

    // 推進全域 Chars
    window.Chars.push(this);

    // 同步記錄到對應玩家陣列
    if (this.side === "left") {
      window.Player1Chars.push(this);
    } else {
      window.Player2Chars.push(this);
    }

    // 初始化血量條繪製
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
    if (this.isDead || target.isDead) return;
    if (this.isAttacking) return;

    this.isAttacking = true;
    this.sprite.setTexture(this.atkKey);

    // 造成傷害
    target.takeDamage(this.atk);

    // 攻擊後延遲 300ms 恢復
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

    this.hp -= dmg;
    this.updateHpBar();

    if (this.hp <= 0) {
      this.die();
      return;
    }

    this.sprite.setTexture(this.hurtKey);

    // 擊退距離
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
  }

  // 死亡
  die() {
    this.isDead = true;
    this.sprite.setTexture(this.dieKey);

    // 延遲 0.5 秒銷毀
    this.scene.time.delayedCall(500, () => {
      this.sprite.destroy();
      this.hpBar.destroy();

      // 從對應玩家陣列移除
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

    // 底色 (黑)
    this.hpBar.fillStyle(0x000000);
    this.hpBar.fillRect(this.sprite.x - 25, this.sprite.y - 40, 50, 6);

    // 紅色血條
    const barWidth = (this.hp / 5) * 50;
    this.hpBar.fillStyle(0xff0000);
    this.hpBar.fillRect(this.sprite.x - 25, this.sprite.y - 40, barWidth, 6);
  }
}

// 讓外部可直接使用 `new window.Char(...)`
window.Char = Char;
