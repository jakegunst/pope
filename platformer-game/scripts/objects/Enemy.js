
// Enemy.js - Base enemy class
class Enemy {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.velocityX = 0;
    this.velocityY = 0;
    this.isActive = true;
    this.hurtTimer = 0;
    this.health = 1;
    this.facingRight = true;
  }

  update(delta, platforms, player) {
    this.velocityY += 0.5;
    this.y += this.velocityY;
    this.x += this.velocityX;

    if (this.hurtTimer > 0) this.hurtTimer -= delta;

    this.checkPlatformCollisions(platforms);

    if (this.y > 2000) this.isActive = false;
  }

  checkPlatformCollisions(platforms) {
    for (const platform of platforms) {
      if (platform.isOneWay && this.velocityY < 0) continue;
      if (this.x + this.width > platform.x &&
          this.x < platform.x + platform.width &&
          this.y + this.height > platform.y &&
          this.y < platform.y + platform.height) {
        if (this.velocityY > 0 && this.y + this.height - this.velocityY <= platform.y) {
          this.y = platform.y - this.height;
          this.velocityY = 0;
          this.isGrounded = true;
        } else if (this.velocityY < 0 && this.y - this.velocityY >= platform.y + platform.height) {
          this.y = platform.y + platform.height;
          this.velocityY = 0;
        } else if (this.velocityX > 0) {
          this.x = platform.x - this.width;
          this.velocityX = -this.velocityX;
          this.facingRight = false;
        } else if (this.velocityX < 0) {
          this.x = platform.x + platform.width;
          this.velocityX = -this.velocityX;
          this.facingRight = true;
        }
      }
    }
  }

  checkPlayerCollision(player) {
    if (this.hurtTimer > 0 || player.invulnerableTimer > 0) return false;
    const collision = (
      this.x + this.width > player.x &&
      this.x < player.x + player.width &&
      this.y + this.height > player.y &&
      this.y < player.y + player.height
    );
    if (collision) {
      if (player.velocityY > 0 && player.y + player.height - player.velocityY <= this.y) {
        this.getHurt(1);
        player.velocityY = -12;
        player.isJumping = true;
        player.canDoubleJump = true;
        return true;
      } else if (this.isActive) {
        player.getHurt(1);
        return true;
      }
    }
    return false;
  }

  getHurt(damage) {
    if (this.hurtTimer <= 0) {
      this.health -= damage;
      this.hurtTimer = 500;
      if (this.health <= 0) this.die();
    }
  }

  die() {
    this.isActive = false;
  }

  draw(ctx, camera) {
    if (!this.isActive) return;
    if (this.x + this.width < camera.x || this.x > camera.x + camera.width ||
        this.y + this.height < camera.y || this.y > camera.y + camera.height) {
      return;
    }
    if (this.hurtTimer > 0 && Math.floor(this.hurtTimer / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }
    ctx.fillStyle = '#F44336';
    ctx.fillRect(this.x - camera.x, this.y - camera.y, this.width, this.height);
    ctx.globalAlpha = 1;
  }
}

// Additional enemy classes would be appended here...
// For brevity, only Enemy is added. User can request others.


// WalkerEnemy.js
class WalkerEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 32, 32);
    this.velocityX = 1.5;
    this.walkTimer = 0;
    this.color = '#F44336';
    this.projectiles = [];
    this.shootTimer = 0;
    this.shootInterval = 2000;
    this.alertLevel = 0;
  }

  update(delta, platforms, player) {
    const wasGrounded = this.isGrounded;
    this.isGrounded = false;

    this.velocityY += 0.5;
    this.y += this.velocityY;
    this.x += this.velocityX;

    if (this.hurtTimer > 0) this.hurtTimer -= delta;

    this.checkPlatformCollisions(platforms);

    if (this.y > 2000) this.isActive = false;

    if (this.isGrounded) {
      const edgeCheckX = this.facingRight ? this.x + this.width + 5 : this.x - 5;
      let groundAhead = false;

      for (const platform of platforms) {
        if (edgeCheckX >= platform.x && edgeCheckX <= platform.x + platform.width &&
            Math.abs((this.y + this.height) - platform.y) < 5) {
          groundAhead = true;
          break;
        }
      }

      if (!groundAhead) {
        this.velocityX = -this.velocityX;
        this.facingRight = !this.facingRight;
      }
    }

    if (player) {
      const playerVisible = Math.abs(player.y - this.y) < 150;
      const playerNearby = Math.abs(player.x - this.x) < 250;

      if (playerVisible && playerNearby) {
        const playerDirection = player.x > this.x ? 1 : -1;
        this.facingRight = playerDirection > 0;

        this.shootTimer += delta;
        this.alertLevel = Math.min(1, this.shootTimer / this.shootInterval);

        if (this.shootTimer >= this.shootInterval) {
          this.shoot(player);
          this.shootTimer = 0;
          this.alertLevel = 0;
        }
      } else {
        this.shootTimer = Math.max(0, this.shootTimer - delta * 0.5);
        this.alertLevel = Math.min(1, this.shootTimer / this.shootInterval);
      }

      this.checkPlayerCollision(player);
    }

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      projectile.x += projectile.velocityX;
      projectile.y += projectile.velocityY;
      projectile.velocityY += 0.1;

      if (projectile.x < -100 || projectile.x > 5000 || projectile.y > 2000) {
        this.projectiles.splice(i, 1);
        continue;
      }

      if (player &&
          projectile.x + projectile.width > player.x &&
          projectile.x < player.x + player.width &&
          projectile.y + projectile.height > player.y &&
          projectile.y < player.y + player.height) {

        if (player.invulnerableTimer <= 0) {
          player.getHurt(1);
        }

        this.createImpactEffect(projectile.x, projectile.y);
        this.projectiles.splice(i, 1);
        continue;
      }

      for (const platform of platforms) {
        if (projectile.x + projectile.width > platform.x &&
            projectile.x < platform.x + platform.width &&
            projectile.y + projectile.height > platform.y &&
            projectile.y < platform.y + platform.height) {

          this.createImpactEffect(projectile.x, projectile.y);
          this.projectiles.splice(i, 1);
          break;
        }
      }
    }

    if (this.isGrounded) {
      this.walkTimer += delta;
    }
  }

  shoot(player) {
    const dx = (player.x + player.width / 2) - (this.x + this.width / 2);
    const dy = (player.y + player.height / 2) - (this.y + this.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    const speed = 5;
    const velocityX = (dx / distance) * speed;
    const velocityY = (dy / distance) * speed;

    this.projectiles.push({
      x: this.x + this.width / 2 - 4,
      y: this.y + this.height / 2 - 4,
      width: 8,
      height: 8,
      velocityX,
      velocityY
    });
  }

  createImpactEffect(x, y) {
    // Visual or sound effect can be added here
  }

  draw(ctx, camera) {
    if (!this.isActive) return;
    if (this.x + this.width < camera.x || this.x > camera.x + camera.width ||
        this.y + this.height < camera.y || this.y > camera.y + camera.height) {
      return;
    }

    if (this.hurtTimer > 0 && Math.floor(this.hurtTimer / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    ctx.fillStyle = this.color;
    const walkOffset = Math.sin(this.walkTimer / 100) * 2;
    ctx.beginPath();
    ctx.moveTo(this.x - camera.x, this.y - camera.y + this.height);
    ctx.lineTo(this.x - camera.x + this.width, this.y - camera.y + this.height);
    ctx.lineTo(this.x - camera.x + this.width, this.y - camera.y + this.height - 10 + walkOffset);
    ctx.lineTo(this.x - camera.x, this.y - camera.y + this.height - 10 - walkOffset);
    ctx.closePath();
    ctx.fill();

    ctx.fillRect(
      this.x - camera.x + 4,
      this.y - camera.y + this.height - 26,
      this.width - 8,
      16
    );

    ctx.fillStyle = 'white';
    const eyeX = this.facingRight ? this.x - camera.x + 20 : this.x - camera.x + 8;
    ctx.fillRect(eyeX, this.y - camera.y + this.height - 22, 4, 8);

    ctx.globalAlpha = 1;
  }
}

// Other classes like JumperEnemy, FlyerEnemy, etc. would follow this same structure...


// JumperEnemy.js
class JumperEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 28, 36);
    this.jumpTimer = 0;
    this.jumpInterval = 2000;
    this.color = '#9C27B0';
    this.squishAmount = 0;
  }

  update(delta, platforms, player) {
    this.isGrounded = false;
    super.update(delta, platforms, player);

    if (this.isGrounded) {
      this.jumpTimer += delta;
      const jumpProgress = this.jumpTimer / this.jumpInterval;
      this.squishAmount = jumpProgress > 0.8 ? Math.min(8, (jumpProgress - 0.8) * 40) : 0;
      if (this.jumpTimer >= this.jumpInterval) {
        this.velocityY = -16;
        this.jumpTimer = 0;
        this.squishAmount = 0;
      }
    }
  }

  draw(ctx, camera) {
    if (!this.isActive) return;
    if (this.x + this.width < camera.x || this.x > camera.x + camera.width ||
        this.y + this.height < camera.y || this.y > camera.y + camera.height) return;

    if (this.hurtTimer > 0 && Math.floor(this.hurtTimer / 100) % 2 === 0) ctx.globalAlpha = 0.5;

    const squishWidth = this.width + this.squishAmount;
    const squishHeight = this.height - this.squishAmount;
    const squishX = this.x - this.squishAmount / 2;
    const squishY = this.y + this.squishAmount;

    ctx.fillStyle = this.color;

    if (!this.isGrounded) {
      if (this.velocityY < 0) {
        ctx.fillRect(this.x - camera.x + 4, this.y - camera.y - 4, this.width - 8, this.height + 4);
      } else {
        ctx.fillRect(this.x - camera.x - 4, this.y - camera.y, this.width + 8, this.height);
      }
    } else {
      ctx.fillRect(squishX - camera.x, squishY - camera.y, squishWidth, squishHeight);
    }

    ctx.fillStyle = 'white';
    const eyeSpacing = 10;
    ctx.fillRect(this.x - camera.x + (this.width / 2) - eyeSpacing - 2, this.y - camera.y + 10, 4, 4);
    ctx.fillRect(this.x - camera.x + (this.width / 2) + eyeSpacing - 2, this.y - camera.y + 10, 4, 4);

    ctx.globalAlpha = 1;
  }
}

// Additional classes (FlyerEnemy, ShooterEnemy, BossEnemy) would follow similarly...

// FlyerEnemy.js
class FlyerEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 32, 24);
    this.startX = x;
    this.startY = y;
    this.amplitude = 80;
    this.period = 4000;
    this.timer = 0;
    this.patternType = Math.floor(Math.random() * 3);
    this.color = '#4CAF50';
    this.wingAngle = 0;
    this.diveBombTimer = 0;
    this.diveBombInterval = 5000 + Math.random() * 3000;
    this.isDiveBombing = false;
    this.diveBombTarget = null;
    this.diveBombSpeed = 0;
    this.diveBombMaxSpeed = 12;
    this.diveBombRecoveryTimer = 0;
  }

  update(delta, platforms, player) {
    this.timer += delta;
    if (this.hurtTimer > 0) this.hurtTimer -= delta;

    if (this.isDiveBombing) {
      this.updateDiveBomb(delta, platforms);
    } else if (this.diveBombRecoveryTimer > 0) {
      this.diveBombRecoveryTimer -= delta;
      const progress = this.timer / this.period;
      const radians = progress * Math.PI * 2;
      const targetX = this.startX + Math.cos(radians) * this.amplitude;
      const targetY = this.startY + Math.sin(radians) * this.amplitude;
      this.x = this.x * 0.95 + targetX * 0.05;
      this.y = this.y * 0.95 + targetY * 0.05;
      this.wingAngle += delta * 0.03;
    } else {
      const progress = (this.timer % this.period) / this.period;
      const radians = progress * Math.PI * 2;
      switch (this.patternType) {
        case 0: this.x = this.startX + Math.sin(radians) * this.amplitude; break;
        case 1: this.y = this.startY + Math.sin(radians) * this.amplitude; break;
        case 2:
          this.x = this.startX + Math.cos(radians) * this.amplitude;
          this.y = this.startY + Math.sin(radians) * this.amplitude;
          break;
      }
      this.wingAngle += delta * 0.02;
      this.facingRight = this.x > (this.startX + Math.sin((progress - 0.01) * Math.PI * 2) * this.amplitude);
      if (player) {
        this.diveBombTimer += delta;
        if (this.diveBombTimer >= this.diveBombInterval) {
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 300 && dy > 0) {
            this.startDiveBomb(player);
          } else {
            this.diveBombTimer = this.diveBombInterval - 1000;
          }
        }
      }
    }

    if (player) {
      this.checkPlayerCollision(player);
    }
  }

  startDiveBomb(player) {
    this.isDiveBombing = true;
    this.diveBombTarget = { x: player.x + player.width / 2, y: player.y + player.height / 2 };
    this.diveBombSpeed = 1;
    this.diveBombTimer = 0;
  }

  updateDiveBomb(delta, platforms) {
    this.diveBombSpeed = Math.min(this.diveBombMaxSpeed, this.diveBombSpeed + 0.4);
    const dx = this.diveBombTarget.x - (this.x + this.width / 2);
    const dy = this.diveBombTarget.y - (this.y + this.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 5) {
      this.x += (dx / distance) * this.diveBombSpeed;
      this.y += (dy / distance) * this.diveBombSpeed;
      this.facingRight = dx > 0;
    }
    for (const platform of platforms) {
      if (this.x + this.width > platform.x &&
          this.x < platform.x + platform.width &&
          this.y + this.height > platform.y &&
          this.y < platform.y + platform.height) {
        this.endDiveBomb();
        break;
      }
    }
    if (dy < 0 || this.y > 2000) this.endDiveBomb();
    this.wingAngle += delta * 0.05;
  }

  endDiveBomb() {
    this.isDiveBombing = false;
    this.diveBombTarget = null;
    this.diveBombRecoveryTimer = 1000;
    this.diveBombInterval = 5000 + Math.random() * 3000;
  }

  draw(ctx, camera) {
    if (!this.isActive) return;
    if (this.x + this.width < camera.x || this.x > camera.x + camera.width ||
        this.y + this.height < camera.y || this.y > camera.y + camera.height) return;

    if (this.hurtTimer > 0 && Math.floor(this.hurtTimer / 100) % 2 === 0) ctx.globalAlpha = 0.5;

    const wingY = Math.sin(this.wingAngle) * 8;
    ctx.fillStyle = '#81C784';
    ctx.beginPath();
    ctx.moveTo(this.x - camera.x + this.width / 2, this.y - camera.y + this.height / 2);
    ctx.lineTo(this.x - camera.x, this.y - camera.y + this.height / 2 - wingY);
    ctx.lineTo(this.x - camera.x, this.y - camera.y + this.height / 2 + 5);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(this.x - camera.x + this.width / 2, this.y - camera.y + this.height / 2);
    ctx.lineTo(this.x - camera.x + this.width, this.y - camera.y + this.height / 2 - wingY);
    ctx.lineTo(this.x - camera.x + this.width, this.y - camera.y + this.height / 2 + 5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(this.x - camera.x + this.width / 2, this.y - camera.y + this.height / 2,
      this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'white';
    const eyeX = this.facingRight ? this.x - camera.x + this.width * 0.7 : this.x - camera.x + this.width * 0.3;
    ctx.beginPath();
    ctx.arc(eyeX, this.y - camera.y + this.height * 0.4, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
  }
}

// NOTE: ShooterEnemy and BossEnemy code sections would continue here with similar formatting.
// They are omitted for brevity but can be appended similarly if needed.

// ShooterEnemy.js
class ShooterEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 36, 36);
    this.shootTimer = 0;
    this.shootInterval = 3000;
    this.projectiles = [];
    this.color = '#FF9800';
    this.alertLevel = 0;
  }

  update(delta, platforms, player) {
    if (this.hurtTimer > 0) this.hurtTimer -= delta;

    if (player) {
      this.facingRight = player.x > this.x;
      if (Math.abs(player.x - this.x) < 300) {
        this.shootTimer += delta;
        this.alertLevel = Math.min(1, this.shootTimer / this.shootInterval);
        if (this.shootTimer >= this.shootInterval) {
          this.shoot(player);
          this.shootTimer = 0;
          this.alertLevel = 0;
        }
      } else {
        this.shootTimer = Math.max(0, this.shootTimer - delta * 0.5);
        this.alertLevel = Math.min(1, this.shootTimer / this.shootInterval);
      }
      this.checkPlayerCollision(player);
    }

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.velocityX;
      p.y += p.velocityY;
      p.velocityY += 0.1;
      if (p.x < -100 || p.x > 5000 || p.y > 2000) {
        this.projectiles.splice(i, 1);
        continue;
      }
      if (player &&
          p.x + p.width > player.x && p.x < player.x + player.width &&
          p.y + p.height > player.y && p.y < player.y + player.height) {
        if (player.invulnerableTimer <= 0) player.getHurt(1);
        this.createImpactEffect(p.x, p.y);
        this.projectiles.splice(i, 1);
        continue;
      }
      for (const platform of platforms) {
        if (p.x + p.width > platform.x && p.x < platform.x + platform.width &&
            p.y + p.height > platform.y && p.y < platform.y + platform.height) {
          this.createImpactEffect(p.x, p.y);
          this.projectiles.splice(i, 1);
          break;
        }
      }
    }
  }

  shoot(player) {
    const dx = (player.x + player.width / 2) - (this.x + this.width / 2);
    const dy = (player.y + player.height / 2) - (this.y + this.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = 5;
    const spread = 0.1;
    const vx = (dx / dist) * speed + (Math.random() * 2 - 1) * spread;
    const vy = (dy / dist) * speed + (Math.random() * 2 - 1) * spread;
    this.projectiles.push({
      x: this.x + this.width / 2 - 4,
      y: this.y + this.height / 2 - 4,
      width: 8,
      height: 8,
      velocityX: vx,
      velocityY: vy
    });
  }

  createImpactEffect(x, y) {
    // Placeholder for effects
  }

  draw(ctx, camera) {
    if (!this.isActive) return;
    if (this.x + this.width < camera.x || this.x > camera.x + camera.width ||
        this.y + this.height < camera.y || this.y > camera.y + camera.height) return;

    if (this.hurtTimer > 0 && Math.floor(this.hurtTimer / 100) % 2 === 0) ctx.globalAlpha = 0.5;

    ctx.fillStyle = '#E65100';
    ctx.beginPath();
    ctx.moveTo(this.x - camera.x + 8, this.y - camera.y + this.height);
    ctx.lineTo(this.x - camera.x + this.width - 8, this.y - camera.y + this.height);
    ctx.lineTo(this.x - camera.x + this.width - 12, this.y - camera.y + this.height - 10);
    ctx.lineTo(this.x - camera.x + 12, this.y - camera.y + this.height - 10);
    ctx.closePath();
    ctx.fill();

    const glowColor = `rgba(255, ${255 * (1 - this.alertLevel)}, 0, 1)`;
    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.arc(
      this.x - camera.x + this.width / 2,
      this.y - camera.y + this.height / 2 - 5,
      this.width / 2.5,
      0, Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = this.color;
    const turretLen = 12, turretW = 6;
    const turretX = this.facingRight
      ? this.x - camera.x + this.width / 2
      : this.x - camera.x + this.width / 2 - turretLen;
    ctx.fillRect(turretX, this.y - camera.y + this.height / 2 - turretW / 2, turretLen, turretW);

    ctx.fillStyle = '#FFCC80';
    for (const p of this.projectiles) {
      ctx.beginPath();
      ctx.arc(p.x - camera.x + p.width / 2, p.y - camera.y + p.height / 2, p.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 204, 128, 0.5)';
      ctx.lineWidth = 2;
      ctx.moveTo(p.x - camera.x + p.width / 2, p.y - camera.y + p.height / 2);
      ctx.lineTo(p.x - camera.x + p.width / 2 - p.velocityX * 3,
                 p.y - camera.y + p.height / 2 - p.velocityY * 3);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }
}

// BossEnemy placeholder
class BossEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 64, 64);
    this.health = 10;
    this.phase = 1;
    this.attackTimer = 0;
    this.attackInterval = 2000;
    this.projectiles = [];
    this.shockwaves = [];
    this.color = '#673AB7';
    this.isInvulnerable = false;
    this.animationTimer = 0;
  }

  update(delta, platforms, player) {
    this.animationTimer += delta;
    if (this.hurtTimer > 0) this.hurtTimer -= delta;

    if (this.health <= 7 && this.phase === 1) {
      this.phase = 2;
      this.isInvulnerable = true;
      setTimeout(() => { this.isInvulnerable = false; }, 2000);
    } else if (this.health <= 3 && this.phase === 2) {
      this.phase = 3;
      this.isInvulnerable = true;
      setTimeout(() => { this.isInvulnerable = false; }, 2000);
    }

    if (player) {
      this.facingRight = player.x > this.x;
      this.attackTimer += delta;
      if (this.attackTimer >= this.attackInterval) {
        this.shootProjectileAt(player);
        this.attackTimer = 0;
      }
      this.checkPlayerCollision(player);
    }
  }

  shootProjectileAt(player) {
    const dx = (player.x + player.width / 2) - (this.x + this.width / 2);
    const dy = (player.y + player.height / 2) - (this.y + this.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = 5;
    const vx = (dx / dist) * speed;
    const vy = (dy / dist) * speed;
    this.projectiles.push({
      x: this.x + this.width / 2 - 6,
      y: this.y + this.height / 2 - 6,
      width: 12,
      height: 12,
      velocityX: vx,
      velocityY: vy,
      color: '#9575CD'
    });
  }

  draw(ctx, camera) {
    if (!this.isActive) return;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(
      this.x - camera.x + this.width / 2,
      this.y - camera.y + this.height / 2,
      this.width / 2,
      0, Math.PI * 2
    );
    ctx.fill();

    for (const p of this.projectiles) {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x - camera.x + p.width / 2, p.y - camera.y + p.height / 2, p.width / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Health bar
    const barWidth = this.width * 1.5;
    const healthPct = this.health / 10;
    ctx.fillStyle = 'black';
    ctx.fillRect(this.x - camera.x, this.y - camera.y - 10, barWidth, 6);
    ctx.fillStyle = healthPct > 0.6 ? '#4CAF50' : (healthPct > 0.3 ? '#FFC107' : '#F44336');
    ctx.fillRect(this.x - camera.x, this.y - camera.y - 10, barWidth * healthPct, 6);
  }
}
