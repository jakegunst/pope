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
    // Basic physics
    this.velocityY += 0.5; // Gravity
    this.y += this.velocityY;
    this.x += this.velocityX;

    // Handle hurt timer
    if (this.hurtTimer > 0) {
      this.hurtTimer -= delta;
    }

    // Check platform collisions
    this.checkPlatformCollisions(platforms);

    // Check if enemy is too far below the screen
    if (this.y > 2000) {
      this.isActive = false;
    }
  }

  // Basic platform collision checking
  checkPlatformCollisions(platforms) {
    for (const platform of platforms) {
      // Skip one-way platforms if we're moving up
      if (platform.isOneWay && this.velocityY < 0) continue;

      // Simple AABB collision
      if (this.x + this.width > platform.x &&
          this.x < platform.x + platform.width &&
          this.y + this.height > platform.y &&
          this.y < platform.y + platform.height) {
        
        // Colliding from above (landing on platform)
        if (this.velocityY > 0 && this.y + this.height - this.velocityY <= platform.y) {
          this.y = platform.y - this.height;
          this.velocityY = 0;
          this.isGrounded = true;
        }
        // Colliding from below (hitting head on platform)
        else if (this.velocityY < 0 && this.y - this.velocityY >= platform.y + platform.height) {
          this.y = platform.y + platform.height;
          this.velocityY = 0;
        }
        // Colliding from the sides
        else if (this.velocityX > 0) {
          this.x = platform.x - this.width;
          this.velocityX = -this.velocityX; // Reverse direction
          this.facingRight = false;
        }
        else if (this.velocityX < 0) {
          this.x = platform.x + platform.width;
          this.velocityX = -this.velocityX; // Reverse direction
          this.facingRight = true;
        }
      }
    }
  }

  // Check collision with player
  checkPlayerCollision(player) {
    // Don't check collision if enemy is hurt or player is hurt
    if (this.hurtTimer > 0 || player.invulnerableTimer > 0) return false;

    // Simple AABB collision
    const collision = (
      this.x + this.width > player.x &&
      this.x < player.x + player.width &&
      this.y + this.height > player.y &&
      this.y < player.y + player.height
    );

    if (collision) {
      // Player is above enemy (stomping)
      if (player.velocityY > 0 && player.y + player.height - player.velocityY <= this.y) {
        this.getHurt(1);
        // Bounce player
        player.velocityY = -12;
        player.isJumping = true;
        player.canDoubleJump = true;
        return true;
      } 
      // Otherwise player gets hurt
      else if (this.isActive) {
        player.getHurt(1);
        return true;
      }
    }
    
    return false;
  }

  getHurt(damage) {
    if (this.hurtTimer <= 0) {
      this.health -= damage;
      this.hurtTimer = 500; // ms of invulnerability
      
      if (this.health <= 0) {
        this.die();
      }
    }
  }

  die() {
    this.isActive = false;
    // You might want to add particle effects or sound here
  }

  draw(ctx, camera) {
    if (!this.isActive) return;
    
    // Skip drawing if off-screen (simple optimization)
    if (this.x + this.width < camera.x || this.x > camera.x + camera.width ||
        this.y + this.height < camera.y || this.y > camera.y + camera.height) {
      return;
    }

    // Flashing effect when hurt
    if (this.hurtTimer > 0 && Math.floor(this.hurtTimer / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Draw enemy (will be overridden by subclasses)
    ctx.fillStyle = '#F44336'; // Default red color
    ctx.fillRect(this.x - camera.x, this.y - camera.y, this.width, this.height);
    
    // Reset alpha
    ctx.globalAlpha = 1;
  }
}

// WalkerEnemy.js - Basic enemy that walks back and forth
class WalkerEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 32, 32);
    this.velocityX = 1.5;
    this.walkTimer = 0;
    this.color = '#F44336'; // Red
    this.projectiles = [];
    this.shootTimer = 0;
    this.shootInterval = 2000;
    this.alertLevel = 0;
  }

  update(delta, platforms, player) {
    // Track if we were on ground before physics update
    const wasGrounded = this.isGrounded;
    this.isGrounded = false;
    
    // Basic physics
    this.velocityY += 0.5; // Gravity
    this.y += this.velocityY;
    this.x += this.velocityX;
    
    // Handle hurt timer
    if (this.hurtTimer > 0) {
      this.hurtTimer -= delta;
    }
    
    // Check platform collisions
    this.checkPlatformCollisions(platforms);
    
    // Check if enemy is too far below the screen
    if (this.y > 2000) {
      this.isActive = false;
    }
    
    // Edge detection - check if there's ground ahead
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
      
      // Turn around if no ground ahead
      if (!groundAhead) {
        this.velocityX = -this.velocityX;
        this.facingRight = !this.facingRight;
      }
    }
    
    // Shooting logic
    if (player) {
      // Face player when they are nearby and visible
      const playerVisible = Math.abs(player.y - this.y) < 150; // Vertical range
      const playerNearby = Math.abs(player.x - this.x) < 250; // Horizontal range
      
      if (playerVisible && playerNearby) {
        // Override walking direction to face player when shooting
        const playerDirection = player.x > this.x ? 1 : -1;
        this.facingRight = playerDirection > 0;
        
        // Update shooting timer
        this.shootTimer += delta;
        
        // Calculate alert level for charging animation
        this.alertLevel = Math.min(1, this.shootTimer / this.shootInterval);
        
        // Time to shoot!
        if (this.shootTimer >= this.shootInterval) {
          this.shoot(player);
          this.shootTimer = 0;
          this.alertLevel = 0;
        }
      } else {
        // Reset timer when player is far away
        this.shootTimer = Math.max(0, this.shootTimer - delta * 0.5);
        this.alertLevel = Math.min(1, this.shootTimer / this.shootInterval);
      }
      
      // Check player collision
      this.checkPlayerCollision(player);
    }
    
    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      
      // Move projectile
      projectile.x += projectile.velocityX;
      projectile.y += projectile.velocityY;
      
      // Apply gravity to projectile (optional, for arc effect)
      projectile.velocityY += 0.1;
      
      // Check if out of bounds
      if (projectile.x < -100 || projectile.x > 5000 || projectile.y > 2000) {
        this.projectiles.splice(i, 1);
        continue;
      }
      
      // Check collision with player
      if (player && 
          projectile.x + projectile.width > player.x &&
          projectile.x < player.x + player.width &&
          projectile.y + projectile.height > player.y &&
          projectile.y < player.y + player.height) {
        
        if (player.invulnerableTimer <= 0) {
          player.getHurt(1);
        }
        
        // Create impact effect
        this.createImpactEffect(projectile.x, projectile.y);
        
        // Remove projectile
        this.projectiles.splice(i, 1);
        continue;
      }
      
      // Check collision with platforms
      for (const platform of platforms) {
        if (projectile.x + projectile.width > platform.x &&
            projectile.x < platform.x + platform.width &&
            projectile.y + projectile.height > platform.y &&
            projectile.y < platform.y + platform.height) {
          
          // Create impact effect
          this.createImpactEffect(projectile.x, projectile.y);
          
          // Remove projectile
          this.projectiles.splice(i, 1);
          break;
        }
      }
    }
    
    // Animate walking
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
    
    // Skip drawing if off-screen (simple optimization)
    if (this.x + this.width < camera.x || this.x > camera.x + camera.width ||
        this.y + this.height < camera.y || this.y > camera.y + camera.height) {
      return;
    }

    // Flashing effect when hurt
    if (this.hurtTimer > 0 && Math.floor(this.hurtTimer / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Draw enemy body
    ctx.fillStyle = this.color;
    
    // Simple "walking" animation by changing shape slightly
    const walkOffset = Math.sin(this.walkTimer / 100) * 2;
    ctx.beginPath();
    ctx.moveTo(this.x - camera.x, this.y - camera.y + this.height);
    ctx.lineTo(this.x - camera.x + this.width, this.y - camera.y + this.height);
    ctx.lineTo(this.x - camera.x + this.width, this.y - camera.y + this.height - 10 + walkOffset);
    ctx.lineTo(this.x - camera.x, this.y - camera.y + this.height - 10 - walkOffset);
    ctx.closePath();
    ctx.fill();
    
    // Draw enemy head
    ctx.fillRect(
      this.x - camera.x + 4, 
      this.y - camera.y + this.height - 26, 
      this.width - 8, 
      16
    );
    
    // Draw eyes
    ctx.fillStyle = 'white';
    const eyeX = this.facingRight ? this.x - camera.x + 20 : this.x - camera.x + 8;
    ctx.fillRect(eyeX, this.y - camera.y + this.height - 22, 4, 8);
    
    // Reset alpha
    ctx.globalAlpha = 1;
  }
}

// JumperEnemy.js - Enemy that jumps up periodically
class JumperEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 28, 36);
    this.jumpTimer = 0;
    this.jumpInterval = 2000; // ms between jumps
    this.color = '#9C27B0'; // Purple
    this.squishAmount = 0;
  }

  update(delta, platforms, player) {
    this.isGrounded = false;
    
    // Call base update for physics and collisions
    super.update(delta, platforms, player);
    
    // Jump logic
    if (this.isGrounded) {
      this.jumpTimer += delta;
      
      // Pre-jump squish animation
      const jumpProgress = this.jumpTimer / this.jumpInterval;
      if (jumpProgress > 0.8) {
        this.squishAmount = Math.min(8, (jumpProgress - 0.8) * 40);
      } else {
        this.squishAmount = 0;
      }
      
      // Time to jump!
      if (this.jumpTimer >= this.jumpInterval) {
        this.velocityY = -16;
        this.jumpTimer = 0;
        this.squishAmount = 0;
      }
    }
  }

  draw(ctx, camera) {
    if (!this.isActive) return;
    
    // Skip drawing if off-screen
    if (this.x + this.width < camera.x || this.x > camera.x + camera.width ||
        this.y + this.height < camera.y || this.y > camera.y + camera.height) {
      return;
    }

    // Flashing effect when hurt
    if (this.hurtTimer > 0 && Math.floor(this.hurtTimer / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }
    
    // Calculate squished dimensions
    const squishWidth = this.width + this.squishAmount;
    const squishHeight = this.height - this.squishAmount;
    const squishX = this.x - this.squishAmount / 2;
    const squishY = this.y + this.squishAmount;

    // Draw body
    ctx.fillStyle = this.color;
    
    // Jump effect - stretch when moving up, squish when moving down
    if (!this.isGrounded) {
      if (this.velocityY < 0) {
        // Stretching upward while jumping
        ctx.fillRect(
          this.x - camera.x + 4, 
          this.y - camera.y - 4, 
          this.width - 8, 
          this.height + 4
        );
      } else {
        // Squishing when falling
        ctx.fillRect(
          this.x - camera.x - 4, 
          this.y - camera.y, 
          this.width + 8, 
          this.height
        );
      }
    } else {
      // Draw squished pre-jump state or normal
      ctx.fillRect(
        squishX - camera.x, 
        squishY - camera.y, 
        squishWidth, 
        squishHeight
      );
    }
    
    // Draw eyes
    ctx.fillStyle = 'white';
    const eyeSpacing = 10;
    ctx.fillRect(this.x - camera.x + (this.width / 2) - eyeSpacing - 2, this.y - camera.y + 10, 4, 4);
    ctx.fillRect(this.x - camera.x + (this.width / 2) + eyeSpacing - 2, this.y - camera.y + 10, 4, 4);
    
    // Reset alpha
    ctx.globalAlpha = 1;
  }
}

// FlyerEnemy.js - Enemy that flies in patterns with dive bombs
class FlyerEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 32, 24);
    this.startX = x;
    this.startY = y;
    this.amplitude = 80; // How far it moves in each direction
    this.period = 4000; // ms to complete one full movement cycle
    this.timer = 0;
    this.patternType = Math.floor(Math.random() * 3); // 0: horizontal, 1: vertical, 2: circular
    this.color = '#4CAF50'; // Green
    this.wingAngle = 0;
    
    // Dive bomb properties
    this.diveBombTimer = 0;
    this.diveBombInterval = 5000 + Math.random() * 3000; // Random timing between dive bombs
    this.isDiveBombing = false;
    this.diveBombTarget = null;
    this.diveBombSpeed = 0;
    this.diveBombMaxSpeed = 12;
    this.diveBombRecoveryTimer = 0;
  }

  update(delta, platforms, player) {
    this.timer += delta;
    
    // Handle hurt timer
    if (this.hurtTimer > 0) {
      this.hurtTimer -= delta;
    }
    
    // Dive bomb logic takes precedence
    if (this.isDiveBombing) {
      this.updateDiveBomb(delta, platforms);
    } 
    // Recovery after dive bomb
    else if (this.diveBombRecoveryTimer > 0) {
      this.diveBombRecoveryTimer -= delta;
      
      // Slowly return to regular flight pattern
      const progress = this.timer / this.period;
      const radians = progress * Math.PI * 2;
      const targetX = this.startX + Math.cos(radians) * this.amplitude;
      const targetY = this.startY + Math.sin(radians) * this.amplitude;
      this.x = this.x * 0.95 + targetX * 0.05;
      this.y = this.y * 0.95 + targetY * 0.05;
      
      // Animate wings
      this.wingAngle += delta * 0.03; // Faster wing beats during recovery
      if (this.wingAngle > Math.PI * 2) {
        this.wingAngle -= Math.PI * 2;
      }
    }
    // Regular flight pattern
    else {
      // Calculate movement based on pattern type
      const progress = (this.timer % this.period) / this.period;
      const radians = progress * Math.PI * 2;
      
      switch (this.patternType) {
        case 0: // Horizontal movement
          this.x = this.startX + Math.sin(radians) * this.amplitude;
          break;
        case 1: // Vertical movement
          this.y = this.startY + Math.sin(radians) * this.amplitude;
          break;
        case 2: // Circular movement
          this.x = this.startX + Math.cos(radians) * this.amplitude;
          this.y = this.startY + Math.sin(radians) * this.amplitude;
          break;
      }
      
      // Animate wings
      this.wingAngle += delta * 0.02;
      if (this.wingAngle > Math.PI * 2) {
        this.wingAngle -= Math.PI * 2;
      }
      
      // Face the right direction based on movement
      const prevX = this.startX + Math.sin((progress - 0.01) * Math.PI * 2) * this.amplitude;
      this.facingRight = this.x > prevX;
      
      // Check if we should start a dive bomb
      if (player) {
        this.diveBombTimer += delta;
        
        if (this.diveBombTimer >= this.diveBombInterval) {
          // Calculate if player is in a reasonable dive bomb position
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 300 && dy > 0) { // Player is below and not too far
            this.startDiveBomb(player);
          } else {
            // Reset timer but don't dive bomb yet
            this.diveBombTimer = this.diveBombInterval - 1000;
          }
        }
      }
    }
    
    // Check player collision
    if (player) {
      this.checkPlayerCollision(player);
    }
  }
  
  startDiveBomb(player) {
    this.isDiveBombing = true;
    this.diveBombTarget = {
      x: player.x + player.width / 2,
      y: player.y + player.height / 2
    };
    this.diveBombSpeed = 1;
    this.diveBombTimer = 0;
  }
  
  updateDiveBomb(delta, platforms) {
    // Accelerate dive bomb
    this.diveBombSpeed = Math.min(this.diveBombMaxSpeed, this.diveBombSpeed + 0.4);
    
    // Calculate direction to target
    const dx = this.diveBombTarget.x - (this.x + this.width / 2);
    const dy = this.diveBombTarget.y - (this.y + this.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Update position
    if (distance > 5) {
      this.x += (dx / distance) * this.diveBombSpeed;
      this.y += (dy / distance) * this.diveBombSpeed;
      
      // Face the direction we're diving
      this.facingRight = dx > 0;
    }
    
    // Check for collision with platforms
    for (const platform of platforms) {
      if (this.x + this.width > platform.x &&
          this.x < platform.x + platform.width &&
          this.y + this.height > platform.y &&
          this.y < platform.y + platform.height) {
        
        // End dive bomb on platform collision
        this.endDiveBomb();
        break;
      }
    }
    
    // End dive bomb if we're past the target or too far below screen
    if (dy < 0 || this.y > 2000) {
      this.endDiveBomb();
    }
    
    // Animate wings very fast during dive
    this.wingAngle += delta * 0.05;
    if (this.wingAngle > Math.PI * 2) {
      this.wingAngle -= Math.PI * 2;
    }
  }
  
  endDiveBomb() {
    this.isDiveBombing = false;
    this.diveBombTarget = null;
    this.diveBombRecoveryTimer = 1000; // 1 second recovery
    this.diveBombInterval = 5000 + Math.random() * 3000; // Reset dive bomb interval
  }

  draw(ctx, camera) {
    if (!this.isActive) return;
    
    // Skip drawing if off-screen
    if (this.x + this.width < camera.x || this.x > camera.x + camera.width ||
        this.y + this.height < camera.y || this.y > camera.y + camera.height) {
      return;
    }

    // Flashing effect when hurt
    if (this.hurtTimer > 0 && Math.floor(this.hurtTimer / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }
    
    // Draw wings
    const wingY = Math.sin(this.wingAngle) * 8;
    
    ctx.fillStyle = '#81C784'; // Light green
    
    // Left wing
    ctx.beginPath();
    ctx.moveTo(this.x - camera.x + this.width / 2, this.y - camera.y + this.height / 2);
    ctx.lineTo(this.x - camera.x, this.y - camera.y + this.height / 2 - wingY);
    ctx.lineTo(this.x - camera.x, this.y - camera.y + this.height / 2 + 5);
    ctx.closePath();
    ctx.fill();
    
    // Right wing
    ctx.beginPath();
    ctx.moveTo(this.x - camera.x + this.width / 2, this.y - camera.y + this.height / 2);
    ctx.lineTo(this.x - camera.x + this.width, this.y - camera.y + this.height / 2 - wingY);
    ctx.lineTo(this.x - camera.x + this.width, this.y - camera.y + this.height / 2 + 5);
    ctx.closePath();
    ctx.fill();
    
    // Draw body
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(
      this.x - camera.x + this.width / 2,
      this.y - camera.y + this.height / 2,
      this.width / 2,
      this.height / 2,
      0, 0, Math.PI * 2
    );
    ctx.fill();
    
    // Draw eyes
    ctx.fillStyle = 'white';
    const eyeX = this.facingRight ? this.x - camera.x + this.width * 0.7 : this.x - camera.x + this.width * 0.3;
    ctx.beginPath();
    ctx.arc(eyeX, this.y - camera.y + this.height * 0.4, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Reset alpha
    ctx.globalAlpha = 1;
  }
}

// ShooterEnemy.js - Stationary enemy that shoots projectiles
class ShooterEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 36, 36);
    this.shootTimer = 0;
    this.shootInterval = 3000; // ms between shots
    this.projectiles = [];
    this.color = '#FF9800'; // Orange
    this.alertLevel = 0; // Used for "charging up" animation
  }

  update(delta, platforms, player) {
    // Handle hurt timer
    if (this.hurtTimer > 0) {
      this.hurtTimer -= delta;
    }
    
    // Face the player
    if (player) {
      this.facingRight = player.x > this.x;
      
      // Update shooting timer
      if (Math.abs(player.x - this.x) < 300) { // Only shoot when player is nearby
        this.shootTimer += delta;
        
        // Calculate alert level for charging animation
        this.alertLevel = Math.min(1, this.shootTimer / this.shootInterval);
        
        // Time to shoot!
        if (this.shootTimer >= this.shootInterval) {
          this.shoot(player);
          this.shootTimer = 0;
          this.alertLevel = 0;
        }
      } else {
        // Reset timer when player is far away
        this.shootTimer = Math.max(0, this.shootTimer - delta * 0.5);
        this.alertLevel = Math.min(1, this.shootTimer / this.shootInterval);
      }
      
      // Check player collision
      this.checkPlayerCollision(player);
    }
    
    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      
      // Move projectile
      p.x += p.velocityX;
      p.y += p.velocityY;
      
      // Apply gravity to projectile (optional, for arc effect)
      p.velocityY += 0.1;
      
      // Check if out of bounds
      if (p.x < -100 || p.x > 5000 || p.y > 2000) {
        this.projectiles.splice(i, 1);
        continue;
      }
      
      // Check collision with player
      if (player && 
          p.x + p.width > player.x && p.x < player.x + player.width &&
          p.y + p.height > player.y && p.y < player.y + player.height) {
        
        if (player.invulnerableTimer <= 0) {
          player.getHurt(1);
        }
        
        // Create impact effect
        this.createImpactEffect(p.x, p.y);
        
        // Remove projectile
        this.projectiles.splice(i, 1);
        continue;
      }
      
      // Check collision with platforms
      for (const platform of platforms) {
        if (p.x + p.width > platform.x && p.x < platform.x + platform.width &&
            p.y + p.height > platform.y && p.y < platform.y + platform.height) {
          
          // Create impact effect
          this.createImpactEffect(p.x, p.y);
          
          // Remove projectile
          this.projectiles.splice(i, 1);
          break;
        }
      }
    }
  }

  shoot(player) {
    // Calculate angle to player (with some randomness)
    const dx = (player.x + player.width / 2) - (this.x + this.width / 2);
    const dy = (player.y + player.height / 2) - (this.y + this.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Normalize and add speed
    const speed = 5;
    const spread = 0.1;
    const vx = (dx / dist) * speed + (Math.random() * 2 - 1) * spread;
    const vy = (dy / dist) * speed + (Math.random() * 2 - 1) * spread;
    
    // Create projectile
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
    
    // Skip drawing if off-screen
    if (this.x + this.width < camera.x || this.x > camera.x + camera.width ||
        this.y + this.height < camera.y || this.y > camera.y + camera.height) {
      return;
    }

    // Flashing effect when hurt
    if (this.hurtTimer > 0 && Math.floor(this.hurtTimer / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }
    
    // Draw base
    ctx.fillStyle = '#E65100'; // Dark orange
    ctx.beginPath();
    ctx.moveTo(this.x - camera.x + 8, this.y - camera.y + this.height);
    ctx.lineTo(this.x - camera.x + this.width - 8, this.y - camera.y + this.height);
    ctx.lineTo(this.x - camera.x + this.width - 12, this.y - camera.y + this.height - 10);
    ctx.lineTo(this.x - camera.x + 12, this.y - camera.y + this.height - 10);
    ctx.closePath();
    ctx.fill();
    
    // Draw body, which "charges up" based on alert level
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
    
    // Draw turret
    ctx.fillStyle = this.color;
    const turretLen = 12, turretW = 6;
    const turretX = this.facingRight
      ? this.x - camera.x + this.width / 2
      : this.x - camera.x + this.width / 2 - turretLen;
    
    ctx.fillRect(
      turretX,
      this.y - camera.y + this.height / 2 - turretW / 2,
      turretLen,
      turretW
    );
    
    // Draw projectiles
    ctx.fillStyle = '#FFCC80'; // Light orange
    for (const p of this.projectiles) {
      ctx.beginPath();
      ctx.arc(
        p.x - camera.x + p.width / 2,
        p.y - camera.y + p.height / 2,
        p.width / 2,
        0, Math.PI * 2
      );
      ctx.fill();
      
      // Draw projectile trail
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 204, 128, 0.5)';
      ctx.lineWidth = 2;
      ctx.moveTo(
        p.x - camera.x + p.width / 2,
        p.y - camera.y + p.height / 2
      );
      ctx.lineTo(
        p.x - camera.x + p.width / 2 - p.velocityX * 3,
        p.y - camera.y + p.height / 2 - p.velocityY * 3
      );
      ctx.stroke();
    }
    
    // Reset alpha
    ctx.globalAlpha = 1;
  }
}

// BossEnemy.js - Multi-phase difficult enemy with special attacks
class BossEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 64, 64);
    this.health = 10;
    this.phase = 1; // Current phase (1-3)
    this.attackTimer = 0;
    this.attackInterval = 2000; // ms between attacks
    this.projectiles = [];
    this.shockwaves = [];
    this.color = '#673AB7'; // Deep purple
    this.isInvulnerable = false;
    this.animationTimer = 0;
  }

  update(delta, platforms, player) {
    this.animationTimer += delta;
    
    if (this.hurtTimer > 0) {
      this.hurtTimer -= delta;
    }

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
      ctx.arc(
        p.x - camera.x + p.width / 2,
        p.y - camera.y + p.height / 2,
        p.width / 2,
        0, Math.PI * 2
      );
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

// BigWalkerEnemy.js - A larger, stronger version of WalkerEnemy
class BigWalkerEnemy extends WalkerEnemy {
  constructor(x, y) {
    super(x, y);
    // Make it bigger
    this.width = 48;
    this.height = 48;
    // Make it stronger
    this.health = 3;
    // Make it slower
    this.velocityX = 0.8;
    // Different color
    this.color = '#D32F2F'; // Darker red
  }

  // Override draw method to make it look different
  draw(ctx, camera) {
    if (!this.isActive) return;
    
    // Skip drawing if off-screen
    if (this.x + this.width < camera.x || this.x > camera.x + camera.width ||
        this.y + this.height < camera.y || this.y > camera.y + camera.height) {
      return;
    }

    // Flashing effect when hurt
    if (this.hurtTimer > 0 && Math.floor(this.hurtTimer / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Draw enemy body
    ctx.fillStyle = this.color;
    
    // "Walking" animation with bigger movement
    const walkOffset = Math.sin(this.walkTimer / 100) * 3;
    ctx.beginPath();
    ctx.moveTo(this.x - camera.x, this.y - camera.y + this.height);
    ctx.lineTo(this.x - camera.x + this.width, this.y - camera.y + this.height);
    ctx.lineTo(this.x - camera.x + this.width, this.y - camera.y + this.height - 15 + walkOffset);
    ctx.lineTo(this.x - camera.x, this.y - camera.y + this.height - 15 - walkOffset);
    ctx.closePath();
    ctx.fill();
    
    // Draw enemy head - bigger
    ctx.fillRect(
      this.x - camera.x + 6, 
      this.y - camera.y + this.height - 38, 
      this.width - 12, 
      24
    );
    
    // Draw eyes - bigger and angrier
    ctx.fillStyle = 'white';
    const eyeX = this.facingRight ? this.x - camera.x + 30 : this.x - camera.x + 12;
    ctx.fillRect(eyeX, this.y - camera.y + this.height - 32, 6, 10);
    
    // Draw eyebrows
    ctx.fillStyle = '#B71C1C';
    ctx.fillRect(
      eyeX - 2,
      this.y - camera.y + this.height - 36,
      10,
      3
    );
    
    // Reset alpha
    ctx.globalAlpha = 1;
    
    // Draw health indicator
    if (this.health > 1) {
      const healthBarWidth = this.width * 0.8;
      const barX = this.x - camera.x + (this.width - healthBarWidth) / 2;
      const barY = this.y - camera.y - 8;
      
      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX, barY, healthBarWidth, 4);
      
      // Health
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(barX, barY, healthBarWidth * (this.health / 3), 4);
    }
  }
}

// FastWalkerEnemy.js - A faster version of WalkerEnemy
class FastWalkerEnemy extends WalkerEnemy {
  constructor(x, y) {
    super(x, y);
    // Make it faster
    this.velocityX = 3;
    // Change color
    this.color = '#42A5F5'; // Blue
    // Less health to balance speed
    this.health = 1;
  }

  update(delta, platforms, player) {
    super.update(delta, platforms, player);
    
    // Additional behavior - jump over small gaps
    if (this.isGrounded) {
      const edgeCheckX = this.facingRight ? this.x + this.width + 30 : this.x - 30;
      let groundAhead = false;
      
      for (const platform of platforms) {
        if (edgeCheckX >= platform.x && edgeCheckX <= platform.x + platform.width &&
            Math.abs((this.y + this.height) - platform.y) < 5) {
          groundAhead = true;
          break;
        }
      }
      
      // Jump over small gaps
      if (!groundAhead && Math.random() < 0.2) {
        this.velocityY = -10;
        this.isGrounded = false;
      }
    }
    
    // Create a motion trail effect
    if (Math.random() < 0.2 && this.isGrounded) {
      // Placeholder for particle effect
      // You might want to add a particle system to create dust effects
    }
  }

  draw(ctx, camera) {
    if (!this.isActive) return;
    
    // Skip drawing if off-screen
    if (this.x + this.width < camera.x || this.x > camera.x + camera.width ||
        this.y + this.height < camera.y || this.y > camera.y + camera.height) {
      return;
    }

    // Draw motion blur effect
    if (Math.abs(this.velocityX) > 2) {
      ctx.globalAlpha = 0.3;
      const blurOffset = this.facingRight ? -5 : 5;
      ctx.fillStyle = this.color;
      ctx.fillRect(
        this.x - camera.x + blurOffset, 
        this.y - camera.y, 
        this.width, 
        this.height
      );
      ctx.globalAlpha = 1;
    }

    // Flashing effect when hurt
    if (this.hurtTimer > 0 && Math.floor(this.hurtTimer / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Draw enemy body
    ctx.fillStyle = this.color;
    
    // Simple "running" animation with more exaggerated motion
    const walkOffset = Math.sin(this.walkTimer / 60) * 3;
    ctx.beginPath();
    ctx.moveTo(this.x - camera.x, this.y - camera.y + this.height);
    ctx.lineTo(this.x - camera.x + this.width, this.y - camera.y + this.height);
    ctx.lineTo(this.x - camera.x + this.width, this.y - camera.y + this.height - 10 + walkOffset);
    ctx.lineTo(this.x - camera.x, this.y - camera.y + this.height - 10 - walkOffset);
    ctx.closePath();
    ctx.fill();
    
    // Draw enemy head - leaned forward when running
    const leanOffset = this.facingRight ? 3 : -3;
    ctx.fillRect(
      this.x - camera.x + 4 + leanOffset, 
      this.y - camera.y + this.height - 26, 
      this.width - 8, 
      16
    );
    
    // Draw streamlined eyes
    ctx.fillStyle = 'white';
    const eyeX = this.facingRight ? this.x - camera.x + 20 + leanOffset : this.x - camera.x + 8 + leanOffset;
    const eyeWidth = this.facingRight ? 6 : 6;
    ctx.fillRect(eyeX, this.y - camera.y + this.height - 22, eyeWidth, 8);
    
    // Reset alpha
    ctx.globalAlpha = 1;
  }
}

// ChaserEnemy.js - Enemy that actively chases the player
class ChaserEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 30, 30);
    this.detectionRange = 300;
    this.chaseSpeed = 2;
    this.idleSpeed = 0.5;
    this.color = '#FF5252'; // Red accent
    this.isChasing = false;
    this.idleTimer = 0;
    this.idleDirection = 1;
    this.alertLevel = 0;
  }

  update(delta, platforms, player) {
    const wasGrounded = this.isGrounded;
    this.isGrounded = false;
    
    // Call base update for physics
    super.update(delta, platforms, player);
    
    // Check if we should chase the player
    if (player) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < this.detectionRange) {
        // Start chasing
        this.isChasing = true;
        this.alertLevel = Math.min(1, this.alertLevel + delta * 0.005);
        
        // Move toward player if on ground
        if (this.isGrounded) {
          this.facingRight = dx > 0;
          this.velocityX = this.facingRight ? this.chaseSpeed : -this.chaseSpeed;
          
          // Jump if player is above and reachable
          if (dy < -50 && Math.abs(dx) < 100 && Math.random() < 0.03) {
            this.velocityY = -12;
          }
          
          // Jump if there's a wall in the way
          const wallCheckX = this.facingRight ? 
            this.x + this.width + 5 : this.x - 5;
          
          for (const platform of platforms) {
            if (wallCheckX >= platform.x && wallCheckX <= platform.x + platform.width &&
                this.y + this.height > platform.y && this.y < platform.y + platform.height) {
              this.velocityY = -12;
              break;
            }
          }
        }
      } else {
        // Stop chasing if player is too far
        this.isChasing = false;
        this.alertLevel = Math.max(0, this.alertLevel - delta * 0.002);
        this.idleMovement(delta);
      }
      
      // Check for player collision
      this.checkPlayerCollision(player);
    } else {
      // No player, just idle
      this.isChasing = false;
      this.alertLevel = 0;
      this.idleMovement(delta);
    }
  }
  
  idleMovement(delta) {
    this.idleTimer += delta;
    
    // Change direction periodically
    if (this.idleTimer > 2000) {
      this.idleDirection = -this.idleDirection;
      this.facingRight = this.idleDirection > 0;
      this.idleTimer = 0;
    }
    
    // Move slowly in the current direction
    this.velocityX = this.idleDirection * this.idleSpeed;
  }

  draw(ctx, camera) {
    if (!this.isActive) return;
    
    // Skip drawing if off-screen
    if (this.x + this.width < camera.x || this.x > camera.x + camera.width ||
        this.y + this.height < camera.y || this.y > camera.y + camera.height) {
      return;
    }

    // Flashing effect when hurt
    if (this.hurtTimer > 0 && Math.floor(this.hurtTimer / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }
    
    // Draw alert indicator
    if (this.alertLevel > 0) {
      ctx.fillStyle = `rgba(255, 0, 0, ${this.alertLevel * 0.5})`;
      ctx.beginPath();
      ctx.arc(
        this.x - camera.x + this.width / 2,
        this.y - camera.y - 10,
        8,
        0, Math.PI * 2
      );
      ctx.fill();
    }

    // Draw enemy body
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(
      this.x - camera.x + this.width / 2,
      this.y - camera.y + this.height / 2,
      this.width / 2,
      0, Math.PI * 2
    );
    ctx.fill();
    
    // Draw eyes based on alert level
    ctx.fillStyle = 'white';
    const eyeSize = 3 + this.alertLevel * 3;
    const eyeSpacing = 8;
    
    // Left eye
    ctx.beginPath();
    ctx.arc(
      this.x - camera.x + this.width / 2 - eyeSpacing,
      this.y - camera.y + this.height / 2 - 3,
      eyeSize,
      0, Math.PI * 2
    );
    ctx.fill();
    
    // Right eye
    ctx.beginPath();
    ctx.arc(
      this.x - camera.x + this.width / 2 + eyeSpacing,
      this.y - camera.y + this.height / 2 - 3,
      eyeSize,
      0, Math.PI * 2
    );
    ctx.fill();
    
    // Draw pupils - look toward player
    ctx.fillStyle = 'black';
    const pupilOffset = this.facingRight ? 1 : -1;
    const pupilSize = eyeSize * 0.6;
    
    // Left pupil
    ctx.beginPath();
    ctx.arc(
      this.x - camera.x + this.width / 2 - eyeSpacing + pupilOffset,
      this.y - camera.y + this.height / 2 - 3,
      pupilSize,
      0, Math.PI * 2
    );
    ctx.fill();
    
    // Right pupil
    ctx.beginPath();
    ctx.arc(
      this.x - camera.x + this.width / 2 + eyeSpacing + pupilOffset,
      this.y - camera.y + this.height / 2 - 3,
      pupilSize,
      0, Math.PI * 2
    );
    ctx.fill();
    
    // Reset alpha
    ctx.globalAlpha = 1;
  }
}

// FlipperEnemy.js - Enemy that jumps and does flips
class FlipperEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 32, 32);
    this.jumpTimer = 0;
    this.jumpInterval = 1500; // ms between jumps
    this.isFlipping = false;
    this.flipAngle = 0;
    this.flipSpeed = 0.2;
    this.color = '#FF5722'; // Orange
    this.velocityX = 0; // Initially not moving horizontally
    this.moveDirection = Math.random() > 0.5 ? 1 : -1; // Random initial direction
  }

  update(delta, platforms, player) {
    // Store if we were on ground before physics update
    const wasGrounded = this.isGrounded;
    this.isGrounded = false;
    
    // Call base update for physics and basic collision
    super.update(delta, platforms, player);
    
    // Jump and flip logic
    if (this.isGrounded) {
      this.jumpTimer += delta;
      
      // Choose a random direction to move when we jump
      if (wasGrounded === false) {
        this.moveDirection = Math.random() > 0.5 ? 1 : -1;
        this.velocityX = this.moveDirection * (Math.random() * 2 + 2); // Random speed
        this.facingRight = this.moveDirection > 0;
      }
      
      // Time to jump!
      if (this.jumpTimer >= this.jumpInterval) {
        this.velocityY = -15;
        this.isFlipping = true;
        this.flipAngle = 0;
        this.jumpTimer = 0;
      }
    } else {
      // Keep flipping while in the air
      if (this.isFlipping) {
        this.flipAngle += this.flipSpeed * delta;
        
        // Complete one full rotation
        if (this.flipAngle >= Math.PI * 2) {
          this.isFlipping = false;
          this.flipAngle = 0;
        }
      }
    }
  }

  draw(ctx, camera) {
    if (!this.isActive) return;
    
    // Skip drawing if off-screen (simple optimization)
    if (this.x + this.width < camera.x || this.x > camera.x + camera.width ||
        this.y + this.height < camera.y || this.y > camera.y + camera.height) {
      return;
    }

    // Flashing effect when hurt
    if (this.hurtTimer > 0 && Math.floor(this.hurtTimer / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }
    
    // Calculate center for rotation
    const centerX = this.x + this.width / 2 - camera.x;
    const centerY = this.y + this.height / 2 - camera.y;
    
    // Save context for rotation
    ctx.save();
    
    if (this.isFlipping) {
      // Rotate around center
      ctx.translate(centerX, centerY);
      ctx.rotate(this.flipAngle);
      ctx.translate(-centerX, -centerY);
    }
    
    // Draw enemy body
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - camera.x, this.y - camera.y, this.width, this.height);
    
    // Draw face (eyes and mouth)
    const eyeSize = 4;
    const eyeOffsetX = this.width / 4;
    const eyeOffsetY = this.height / 3;
    
    ctx.fillStyle = 'white';
    
    // Left eye
    ctx.fillRect(
      (this.x + eyeOffsetX) - camera.x, 
      (this.y + eyeOffsetY) - camera.y, 
      eyeSize, eyeSize
    );
    
    // Right eye
    ctx.fillRect(
      (this.x + this.width - eyeOffsetX - eyeSize) - camera.x, 
      (this.y + eyeOffsetY) - camera.y, 
      eyeSize, eyeSize
    );
    
    // Mouth - changes with flip angle to show effort
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const mouthWidth = this.width / 2;
    const mouthY = this.y + this.height * 0.7 - camera.y;
    const mouthCurve = this.isFlipping ? 
      Math.sin(this.flipAngle * 2) * 5 : 0; // Mouth changes during flip
    
    ctx.moveTo(
      this.x + (this.width - mouthWidth) / 2 - camera.x,
      mouthY
    );
    ctx.quadraticCurveTo(
      this.x + this.width / 2 - camera.x,
      mouthY + mouthCurve,
      this.x + (this.width + mouthWidth) / 2 - camera.x,
      mouthY
    );
    ctx.stroke();
    
    // Restore context after rotation
    ctx.restore();
    
    // Reset alpha
    ctx.globalAlpha = 1;
  }
}

// RangedAttackEnemy.js - Enemy with a more complex ranged attack pattern
class RangedAttackEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 40, 40);
    this.attackTimer = 0;
    this.attackInterval = 3000;
    this.projectiles = [];
    this.color = '#8BC34A'; // Light Green
    this.alertLevel = 0;
    this.burstCount = 0;
    this.burstTotal = 3;
    this.burstDelay = 200;
    this.burstTimer = 0;
    this.isBursting = false;
    this.health = 2;
  }

  update(delta, platforms, player) {
    if (this.hurtTimer > 0) {
      this.hurtTimer -= delta;
    }
    
    // Face the player
    if (player) {
      this.facingRight = player.x > this.x;
      
      // Update attack timer
      if (Math.abs(player.x - this.x) < 400) { // Only attack when player is in range
        this.attackTimer += delta;
        
        // Calculate alert level for charging animation
        this.alertLevel = Math.min(1, this.attackTimer / this.attackInterval);
        
        // Time to start a burst!
        if (this.attackTimer >= this.attackInterval && !this.isBursting) {
          this.startBurst(player);
        }
        
        // Update burst if in progress
        if (this.isBursting) {
          this.updateBurst(delta, player);
        }
      } else {
        // Reset timer when player is far away
        this.attackTimer = Math.max(0, this.attackTimer - delta * 0.5);
        this.alertLevel = Math.min(1, this.attackTimer / this.attackInterval);
      }
      
      // Check player collision
      this.checkPlayerCollision(player);
    }
    
    // Update projectiles
    this.updateProjectiles(platforms, player);
  }
  
  startBurst(player) {
    this.isBursting = true;
    this.burstCount = 0;
    this.burstTimer = 0;
    this.attackTimer = 0;
  }
  
  updateBurst(delta, player) {
    this.burstTimer += delta;
    
    if (this.burstTimer >= this.burstDelay) {
      this.shootProjectile(player);
      this.burstCount++;
      this.burstTimer = 0;
      
      if (this.burstCount >= this.burstTotal) {
        this.isBursting = false;
      }
    }
  }
  
  shootProjectile(player) {
    // Calculate angle to player with spread
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
