const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: "matter",
        matter: {
            gravity: { y: 0 },
            debug: false // 關閉 debug 線條
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let players = []; // 儲存所有角色

class Player {
    constructor(scene, x, y, keyPrefix, flipX) {
        this.scene = scene;

        // 統一屬性
        this.hp = 5;      // 血量
        this.atk = 1;     // 攻擊力
        this.isDead = false;
        this.isAttacking = false; // 是否正在做攻擊動作（避免狂觸發）

        // 各種貼圖 key
        this.baseKey = `${keyPrefix}_base`;
        this.atkKey = `${keyPrefix}_atk`;
        this.hurtKey = `${keyPrefix}_hurt`;
        this.dieKey = `${keyPrefix}_die`;

        // 建立 Matter.js sprite，設為感應器 + 擴大碰撞範圍
        const sensorOptions = { isSensor: true, circleRadius: 40 };
        this.sprite = scene.matter.add.sprite(x, y, this.baseKey, null, sensorOptions);
        this.sprite.setFixedRotation();

        // 如果要水平翻轉
        if (flipX) {
            this.sprite.setFlipX(true);
        }

        // 用「x 位置」來判定左右，方便後面計算退後方向
        //  但也可自行設定 direction = 1(往右) / -1(往左)
        this.direction = (x < 400) ? 1 : -1;
        this.speed = 2;

        // 建立血條（用 Phaser 的 graphics）
        this.hpBar = scene.add.graphics();

        players.push(this);
        this.updateHpBar(); // 先畫出血條
    }

    // === 核心動作 ===
    update() {
        // 如果已死，就不動也不更新了
        if (this.isDead) return;

        // 若沒有在攻擊中，就讓角色自動左右來回移動
        if (!this.isAttacking) {
            if (this.sprite.x >= 700) this.direction = -1;
            if (this.sprite.x <= 100) this.direction = 1;
            this.sprite.setVelocityX(this.direction * this.speed);
        } else {
            // 攻擊/受傷動畫中，暫停移動
            this.sprite.setVelocityX(0);
        }

        // 實時更新血條位置
        this.updateHpBar();
    }

    attack(target) {
        // 如果自己或對方死亡，就不需要再攻擊
        if (this.isDead || target.isDead) return;

        // 若已經在攻擊中，也避免重複攻擊
        if (this.isAttacking) return;

        this.isAttacking = true;

        // 1) 切換到攻擊圖
        this.sprite.setTexture(this.atkKey);

        // 2) 攻擊對方 → 對方扣血 + 受傷動作
        target.takeDamage(this.atk);

        // 3) 攻擊動畫結束後，回到 base
        this.scene.time.delayedCall(300, () => {
            if (!this.isDead) {
                this.sprite.setTexture(this.baseKey);
            }
            this.isAttacking = false;
        });
    }

    takeDamage(dmg) {
        // 若已死就不再處理
        if (this.isDead) return;

        // 扣血
        this.hp -= dmg;
        this.updateHpBar();

        // 若血量歸 0，直接死亡
        if (this.hp <= 0) {
            this.die();
            return;
        }

        // 如果還沒死 → 播受傷 & 往後退
        this.sprite.setTexture(this.hurtKey);

        // 用 tween 讓角色後退一小段
        const backDistance = 40; // 後退距離
        this.scene.tweens.add({
            targets: this.sprite,
            x: this.sprite.x + (this.direction * -backDistance),
            duration: 200,
            onComplete: () => {
                // 如果還存活，就回到 base 圖
                if (!this.isDead) {
                    this.sprite.setTexture(this.baseKey);
                }
            }
        });
    }

    die() {
        this.isDead = true;
        this.sprite.setTexture(this.dieKey);

        // 顯示死亡動作後，延遲 0.5 秒把角色銷毀
        this.scene.time.delayedCall(500, () => {
            this.sprite.destroy();
            this.hpBar.destroy();
        });
    }

    // === 血條繪製 ===
    updateHpBar() {
        // 如果角色已死，就不再顯示血條
        if (this.isDead) return;

        this.hpBar.clear();

        // 先畫血條底
        this.hpBar.fillStyle(0x000000);
        // 位置在角色頭上
        this.hpBar.fillRect(this.sprite.x - 25, this.sprite.y - 40, 50, 6);

        // 再畫血量 (依照當前 HP 百分比)
        const barWidth = (this.hp / 5) * 50;
        this.hpBar.fillStyle(0xff0000);
        this.hpBar.fillRect(this.sprite.x - 25, this.sprite.y - 40, barWidth, 6);
    }
}

// === Phaser 基本流程 ===
function preload() {
    // mano
    this.load.image("mano_base",  "assets/char/mano/base.png");
    this.load.image("mano_atk",   "assets/char/mano/atk.png");
    this.load.image("mano_hurt",  "assets/char/mano/hurt.png");
    this.load.image("mano_die",   "assets/char/mano/die.png");

    // stone
    this.load.image("stone_base", "assets/char/stone/base.png");
    this.load.image("stone_atk",  "assets/char/stone/atk.png");
    this.load.image("stone_hurt", "assets/char/stone/hurt.png");
    this.load.image("stone_die",  "assets/char/stone/die.png");

    // hero
    this.load.image("hero_base",  "assets/char/hero/base.png");
    this.load.image("hero_atk",   "assets/char/hero/atk.png");
    this.load.image("hero_hurt",  "assets/char/hero/hurt.png");
    this.load.image("hero_die",   "assets/char/hero/die.png");
}

function create() {
    this.cameras.main.setBackgroundColor("#87CEEB");

    // === 建立三個角色作測試 ===
    // 左側 mano：水平翻轉
    new Player(this, 100, 300, "mano", true);
    // 右側 stone
    new Player(this, 700, 300, "stone", false);
    // 中間 hero (可再試試不同位置)
    new Player(this, 400, 400, "hero", true);

    // === 碰撞偵測 ===
    this.matter.world.on("collisionstart", (event) => {
        event.pairs.forEach((pair) => {
            const playerA = players.find(p => p.sprite === pair.bodyA.gameObject);
            const playerB = players.find(p => p.sprite === pair.bodyB.gameObject);

            // 雙方都在場且都還活著 → 同步互相攻擊
            if (playerA && playerB && !playerA.isDead && !playerB.isDead) {
                playerA.attack(playerB);
                playerB.attack(playerA);
            }
        });
    });
}

function update() {
    // 逐一更新所有角色行為
    players.forEach(p => p.update());
}

const game = new Phaser.Game(config);
