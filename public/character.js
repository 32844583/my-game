export class Char {
    constructor(scene, x, y, keyPrefix, flipX) {
        this.scene = scene;
        this.hp = 5;
        this.atk = 1;
        this.isDead = false;
        this.isAttacking = false;

        this.baseKey = `${keyPrefix}_base`;
        this.atkKey = `${keyPrefix}_atk`;
        this.hurtKey = `${keyPrefix}_hurt`;
        this.dieKey = `${keyPrefix}_die`;

        const sensorOptions = { isSensor: true, circleRadius: 40 };
        this.sprite = scene.matter.add.sprite(x, y, this.baseKey, null, sensorOptions);
        this.sprite.setFixedRotation();

        if (flipX) {
            this.sprite.setFlipX(true);
        }

        this.direction = (x < 400) ? 1 : -1;
        this.speed = 2;

        this.hpBar = scene.add.graphics();
        Chars.push(this);
        this.updateHpBar();
    }

    update() {
        if (this.isDead) return;

        if (!this.isAttacking) {
            if (this.sprite.x >= 700) this.direction = -1;
            if (this.sprite.x <= 100) this.direction = 1;
            this.sprite.setVelocityX(this.direction * this.speed);
        } else {
            this.sprite.setVelocityX(0);
        }

        this.updateHpBar();
    }

    attack(target) {
        if (this.isDead || target.isDead) return;
        if (this.isAttacking) return;

        this.isAttacking = true;
        this.sprite.setTexture(this.atkKey);
        target.takeDamage(this.atk);

        this.scene.time.delayedCall(300, () => {
            if (!this.isDead) {
                this.sprite.setTexture(this.baseKey);
            }
            this.isAttacking = false;
        });
    }

    takeDamage(dmg) {
        if (this.isDead) return;

        this.hp -= dmg;
        this.updateHpBar();

        if (this.hp <= 0) {
            this.die();
            return;
        }

        this.sprite.setTexture(this.hurtKey);

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

    die() {
        this.isDead = true;
        this.sprite.setTexture(this.dieKey);
        this.scene.time.delayedCall(500, () => {
            this.sprite.destroy();
            this.hpBar.destroy();
        });
    }

    updateHpBar() {
        if (this.isDead) return;
        this.hpBar.clear();
        this.hpBar.fillStyle(0x000000);
        this.hpBar.fillRect(this.sprite.x - 25, this.sprite.y - 40, 50, 6);

        const barWidth = (this.hp / 5) * 50;
        this.hpBar.fillStyle(0xff0000);
        this.hpBar.fillRect(this.sprite.x - 25, this.sprite.y - 40, barWidth, 6);
    }
}
