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
  }

  update(delta, platforms, player) {
    // Track if we were on ground before physics update
    const wasGrounded = this.isGrounded;
    this.isGrounded = false;
    
    // Call ShooterEnemy update but skip the super.update call at the top
    // to allow us to handle our own movement
    
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
    }Grounded = false;

    // Call base update for physics and basic collision
    super.update(delta, platforms, player);

    // Edge detection - check if there's ground ahead
    if (wasGrounded) {
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

    // Animate walking
    this.walkTimer += delta;
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
      this.x = this.x * 0.95 + (this.startX + Math.sin(this.timer / this.period * Math.PI * 2) * this.amplitude) * 0.05;
      this.y = this.y * 0.95 + (this.startY + Math.sin(this.timer / this.period * Math.PI * 2) * this.amplitude) * 0.05;
      
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
    
    // Draw dive bomb trail if dive bombing
    if (this.isDiveBombing) {
      const trailLength = 5;
      const trailSpread = 3;
      
      ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
      for (let i = 0; i < trailLength; i++) {
        const distance = Math.sqrt(
          Math.pow(this.diveBombTarget.x - (this.x + this.width / 2), 2) + 
          Math.pow(this.diveBombTarget.y - (this.y + this.height / 2), 2)
        );
        if (distance > 0) {
          const trailX = this.x - (this.diveBombTarget.x - (this.x + this.width / 2)) / distance * (i * 5);
          const trailY = this.y - (this.diveBombTarget.y - (this.y + this.height / 2)) / distance * (i * 5);
          
          ctx.beginPath();
          ctx.arc(
            trailX - camera.x + this.width / 2,
            trailY - camera.y + this.height / 2,
            this.width / 3 - (i * 2),
            0, Math.PI * 2
          );
          ctx.fill();
        }
      }
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
    
    // Draw body - streamlined during dive bomb
    ctx.fillStyle = this.color;
    if (this.isDiveBombing) {
      // Streamlined diagonal body during dive
      ctx.beginPath();
      if (this.facingRight) {
        ctx.moveTo(this.x - camera.x, this.y - camera.y);
        ctx.lineTo(this.x - camera.x + this.width, this.y - camera.y + this.height);
        ctx.lineTo(this.x - camera.x, this.y - camera.y + this.height);
      } else {
        ctx.moveTo(this.x - camera.x + this.width, this.y - camera.y);
        ctx.lineTo(this.x - camera.x, this.y - camera.y + this.height);
        ctx.lineTo(this.x - camera.x + this.width, this.y - camera.y + this.height);
      }
      ctx.closePath();
      ctx.fill();
    } else {
      // Regular oval body
      ctx.beginPath();
      ctx.ellipse(
        this.x - camera.x + this.width / 2,
        this.y - camera.y + this.height / 2,
        this.width / 2,
        this.height / 2,
        0, 0, Math.PI * 2
      );
      ctx.fill();
    }
    
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
    // This enemy doesn't move, so we just handle shooting logic
    // and projectile movement
    
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
  }

  shoot(player) {
    // Calculate angle to player (with some randomness)
    const dx = (player.x + player.width / 2) - (this.x + this.width / 2);
    const dy = (player.y + player.height / 2) - (this.y + this.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Normalize and add speed
    const speed = 5;
    const randomSpread = 0.1; // Adds some inaccuracy
    const velocityX = (dx / distance) * speed + (Math.random() * 2 - 1) * randomSpread;
    const velocityY = (dy / distance) * speed + (Math.random() * 2 - 1) * randomSpread;
    
    // Create projectile
    this.projectiles.push({
      x: this.x + this.width / 2 - 4,
      y: this.y + this.height / 2 - 4,
      width: 8,
      height: 8,
      velocityX: velocityX,
      velocityY: velocityY
    });
  }

  createImpactEffect(x, y) {
    // You could add particle effects here
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
    const turretLength = 12;
    const turretWidth = 6;
    const turretX = this.facingRight ? 
      this.x - camera.x + this.width / 2 : 
      this.x - camera.x + this.width / 2 - turretLength;
    
    ctx.fillRect(
      turretX,
      this.y - camera.y + this.height / 2 - turretWidth / 2,
      turretLength,
      turretWidth
    );
    
    // Draw projectiles
    ctx.fillStyle = '#FFCC80'; // Light orange
    for (const projectile of this.projectiles) {
      ctx.beginPath();
      ctx.arc(
        projectile.x - camera.x + projectile.width / 2,
        projectile.y - camera.y + projectile.height / 2,
        projectile.width / 2,
        0, Math.PI * 2
      );
      ctx.fill();
      
      // Draw projectile trail
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 204, 128, 0.5)';
      ctx.lineWidth = 2;
      ctx.moveTo(
        projectile.x - camera.x + projectile.width / 2,
        projectile.y - camera.y + projectile.height / 2
      );
      ctx.lineTo(
        projectile.x - camera.x + projectile.width / 2 - projectile.velocityX * 3,
        projectile.y - camera.y + projectile.height / 2 - projectile.velocityY * 3
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
    this.attackType = 0; // Current attack type
    this.projectiles = [];
    this.shockwaves = [];
    this.color = '#673AB7'; // Deep purple
    this.isInvulnerable = false;
    this.chargeTarget = null; // For charge attack
    this.chargeSpeed = 0;
    this.targetX = x; // For movement
    this.targetY = y;
    this.animationTimer = 0;
  }

  update(delta, platforms, player) {
    this.animationTimer += delta;
    
    // Update hurt timer
    if (this.hurtTimer > 0) {
      this.hurtTimer -= delta;
    }
    
    // Phase transition handling
    if (this.health <= 7 && this.phase === 1) {
      this.phase = 2;
      this.isInvulnerable = true;
      setTimeout(() => { this.isInvulnerable = false; }, 2000);
    }
    else if (this.health <= 3 && this.phase === 2) {
      this.phase = 3;
      this.isInvulnerable = true;
      setTimeout(() => { this.isInvulnerable = false; }, 2000);
    }
    
    // Movement and attack logic based on phase
    if (player) {
      this.updatePhaseActions(delta, platforms, player);
    }
    
    // Update projectiles
    this.updateProjectiles(platforms, player);
    
    // Update shockwaves
    this.updateShockwaves(player);
    
    // Check player collision
    if (player) {
      this.checkPlayerCollision(player);
    }
  }

  updatePhaseActions(delta, platforms, player) {
    switch (this.phase) {
      case 1: // Phase 1: Simple movement and projectile attacks
        // Move around
        if (Math.random() < 0.01) {
          this.targetX = this.x + (Math.random() * 200 - 100);
          this.targetY = this.y + (Math.random() * 100 - 50);
        }
        
        // Move towards target
        const dx1 = this.targetX - this.x;
        const dy1 = this.targetY - this.y;
        const distance1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
        
        if (distance1 > 5) {
          this.x += dx1 * 0.02;
          this.y += dy1 * 0.02;
        }
        
        // Face player
        this.facingRight = player.x > this.x;
        
        // Attack timer
        this.attackTimer += delta;
        if (this.attackTimer >= this.attackInterval) {
          this.shootProjectiles(player);
          this.attackTimer = 0;
        }
        break;
        
      case 2: // Phase 2: Faster movement, shockwave attack
        // More frequent target changes
        if (Math.random() < 0.02) {
          this.targetX = this.x + (Math.random() * 300 - 150);
          this.targetY = this.y + (Math.random() * 150 - 75);
        }
        
        // Move towards target faster
        const dx2 = this.targetX - this.x;
        const dy2 = this.targetY - this.y;
        const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        
        if (distance2 > 5) {
          this.x += dx2 * 0.03;
          this.y += dy2 * 0.03;
        }
        
        // Face player
        this.facingRight = player.x > this.x;
        
        // Attack timer
        this.attackTimer += delta;
        if (this.attackTimer >= this.attackInterval * 0.8) { // Faster attacks
          // Alternate between projectiles and shockwaves
          if (Math.random() < 0.5) {
            this.shootProjectiles(player);
          } else {
            this.createShockwave();
          }
          this.attackTimer = 0;
        }
        break;
        
      case 3: // Phase 3: Fast, aggressive movement, all attack types
        // Check if charging
        if (this.chargeTarget !== null) {
          // Continue charge attack
          this.chargeSpeed += 0.2;
          const chargeVelocity = Math.min(15, this.chargeSpeed);
          
          // Calculate direction
          const chargeDx = this.chargeTarget.x - this.x;
          const chargeDy = this.chargeTarget.y - this.y;
          const chargeDistance = Math.sqrt(chargeDx * chargeDx + chargeDy * chargeDy);
          
          if (chargeDistance < 10 || chargeDistance > 500) {
            // End charge if we hit target or went too far
            this.chargeTarget = null;
            this.chargeSpeed = 0;
          } else {
            // Move towards charge target
            this.x += (chargeDx / chargeDistance) * chargeVelocity;
            this.y += (chargeDy / chargeDistance) * chargeVelocity;
          }
        } else {
          // Random frequent movement
          if (Math.random() < 0.03) {
            this.targetX = this.x + (Math.random() * 400 - 200);
            this.targetY = this.y + (Math.random() * 200 - 100);
          }
          
          // Move towards target very fast
          const dx3 = this.targetX - this.x;
          const dy3 = this.targetY - this.y;
          const distance3 = Math.sqrt(dx3 * dx3 + dy3 * dy3);
          
          if (distance3 > 5) {
            this.x += dx3 * 0.04;
            this.y += dy3 * 0.04;
          }
          
          // Face player
          this.facingRight = player.x > this.x;
          
          // Attack timer
          this.attackTimer += delta;
          if (this.attackTimer >= this.attackInterval * 0.6) { // Even faster attacks
            // Choose random attack type
            const attackChoice = Math.random();
            if (attackChoice < 0.4) {
              this.shootProjectiles(player);
            } else if (attackChoice < 0.7) {
              this.createShockwave();
            } else {
              // Start charge attack
              this.chargeTarget = {
                x: player.x,
                y: player.y
              };
              this.chargeSpeed = 0;
            }
            this.attackTimer = 0;
          }
        }
        break;
    }
  }

  shootProjectiles(player) {
    // Calculate angle to player
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    
    const dx = playerCenterX - centerX;
    const dy = playerCenterY - centerY;
    const angle = Math.atan2(dy, dx);
    
    // Number of projectiles depends on phase
    const projectileCount = this.phase === 3 ? 5 : (this.phase === 2 ? 3 : 1);
    const spreadAngle = Math.PI / 6; // 30 degrees
    
    for (let i = 0; i < projectileCount; i++) {
      let projectileAngle = angle;
      
      // Add spread for multiple projectiles
      if (projectileCount > 1) {
        const spreadOffset = spreadAngle * ((i / (projectileCount - 1)) - 0.5);
        projectileAngle += spreadOffset;
      }
      
      const speed = 6 + Math.random() * 2;
      const velocityX = Math.cos(projectileAngle) * speed;
      const velocityY = Math.sin(projectileAngle) * speed;
      
      this.projectiles.push({
        x: centerX - 6,
        y: centerY - 6,
        width: 12,
        height: 12,
        velocityX: velocityX,
        velocityY: velocityY,
        color: '#9575CD', // Light purple
        age: 0
      });
    }
  }

  createShockwave() {
    this.shockwaves.push({
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
      radius: 0,
      maxRadius: 200,
      growSpeed: 5,
      alpha: 1
    });
  }

  updateProjectiles(platforms, player) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      
      // Move projectile
      projectile.x += projectile.velocityX;
      projectile.y += projectile.velocityY;
      
      // Increase age
      projectile.age += 1;
      
      // Check if out of bounds or too old
      if (projectile.x < -100 || projectile.x > 5000 || projectile.y > 2000 || projectile.age > 200) {
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
          
          // Remove projectile
          this.projectiles.splice(i, 1);
          break;
        }
      }
    }
  }

  updateShockwaves(player) {
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const shockwave = this.shockwaves[i];
      
      // Grow shockwave
      shockwave.radius += shockwave.growSpeed;
      
      // Fade out as it grows
      if (shockwave.radius > shockwave.maxRadius * 0.6) {
        shockwave.alpha = 1 - ((shockwave.radius - shockwave.maxRadius * 0.6) / (shockwave.maxRadius * 0.4));
      }
      
      // Check if complete
      if (shockwave.radius >= shockwave.maxRadius) {
        this.shockwaves.splice(i, 1);
        continue;
      }
      
      // Check collision with player
      if (player) {
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;
        
        const dx = playerCenterX - shockwave.x;
        const dy = playerCenterY - shockwave.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Collision with the ring of the shockwave
        const ringThickness = 20;
        if (Math.abs(distance - shockwave.radius) < ringThickness) {
          if (player.invulnerableTimer <= 0) {
            player.getHurt(1);
            
            // Knockback based on direction from shockwave center
            player.velocityX = dx / distance * 15;
            player.velocityY = dy / distance * 10 - 5; // Upward component for better gameplay
          }
        }
      }
    }
  }

  getHurt(damage) {
    if (this.hurtTimer <= 0 && !this.isInvulnerable) {
      this.health -= damage;
      this.hurtTimer = 500; // ms of invulnerability
      
      if (this.health <= 0) {
        this.die();
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

    // Draw shockwaves
    for (const shockwave of this.shockwaves) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(151, 117, 205, ${shockwave.alpha})`;
      ctx.lineWidth = 20;
      ctx.arc(
        shockwave.x - camera.x,
        shockwave.y - camera.y,
        shockwave.radius,
        0, Math.PI * 2
      );
      ctx.stroke();
    }
    
    // Draw projectiles
    for (const projectile of this.projectiles) {
      ctx.fillStyle = projectile.color;
      ctx.beginPath();
      ctx.arc(
        projectile.x - camera.x + projectile.width / 2,
        projectile.y - camera.y + projectile.height / 2,
        projectile.width / 2,
        0, Math.PI * 2
      );
      ctx.fill();
      
      // Draw trail
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(151, 117, 205, 0.5)';
      ctx.lineWidth = 3;
      ctx.moveTo(
        projectile.x - camera.x + projectile.width / 2,
        projectile.y - camera.y + projectile.height / 2
      );
      ctx.lineTo(
        projectile.x - camera.x + projectile.width / 2 - projectile.velocityX * 3,
        projectile.y - camera.y + projectile.height / 2 - projectile.velocityY * 3
      );
      ctx.stroke();
    }
    
    // Flashing effect when hurt or invulnerable
    if ((this.hurtTimer > 0 && Math.floor(this.hurtTimer / 100) % 2 === 0) || 
        (this.isInvulnerable && Math.floor(this.animationTimer / 100) % 2 === 0)) {
      ctx.globalAlpha = 0.5;
    }
    
    // Draw boss based on phase
    switch (this.phase) {
      case 1:
        this.drawPhase1(ctx, camera);
        break;
      case 2:
        this.drawPhase2(ctx, camera);
        break;
      case 3:
        this.drawPhase3(ctx, camera);
        break;
    }
    
    // Draw health bar
    this.drawHealthBar(ctx, camera);
    
    // Reset alpha
    ctx.globalAlpha = 1;
  }

  drawPhase1(ctx, camera) {
    const centerX = this.x - camera.x + this.width / 2;
    const centerY = this.y - camera.y + this.height / 2;
    
    // Draw body
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(centerX, centerY, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw eyes
    const eyeOffset = 15;
    const eyeX = this.facingRight ? eyeOffset : -eyeOffset;
    
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(centerX + eyeX, centerY - 10, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw pupil
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(centerX + eyeX + (this.facingRight ? 2 : -2), centerY - 10, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  drawPhase2(ctx, camera) {
    const centerX = this.x - camera.x + this.width / 2;
    const centerY = this.y - camera.y + this.height / 2;
    
    // Draw spiky body
    const spikeCount = 12;
    const innerRadius = this.width / 2.5;
    const outerRadius = this.width / 2;
    
    ctx.fillStyle = this.color;
    ctx.beginPath();
    
    for (let i = 0; i < spikeCount * 2; i++) {
      const angle = (i * Math.PI) / spikeCount;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    ctx.fill();
    
    // Draw inner circle
    ctx.fillStyle = '#7E57C2'; // Lighter purple
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius * 0.8, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw eyes
    const eyeOffset = 10;
    const eyeX = this.facingRight ? eyeOffset : -eyeOffset;
    
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(centerX + eyeX, centerY - 8, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw pupil
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(centerX + eyeX + (this.facingRight ? 2 : -2), centerY - 8, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  drawPhase3(ctx, camera) {
    const centerX = this.x - camera.x + this.width / 2;
    const centerY = this.y - camera.y + this.height / 2;
    
    // Pulsating effect
    const pulseScale = 1 + Math.sin(this.animationTimer * 0.01) * 0.1;
    
    // Draw outer glow
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, this.width * 0.8 * pulseScale
    );
    gradient.addColorStop(0, '#9C27B0'); // Deep purple
    gradient.addColorStop(0.6, '#673AB7'); // This color
    gradient.addColorStop(1, 'rgba(103, 58, 183, 0)'); // Fade out
    
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(centerX, centerY, this.width * 0.8 * pulseScale, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw core
    ctx.fillStyle = '#4527A0'; // Darker purple
    ctx.beginPath();
    ctx.arc(centerX, centerY, this.width / 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw spinning orbs
    const orbCount = 3;
    const orbRadius = 10;
    const orbitRadius = this.width / 2.5;
    const orbSpeed = this.animationTimer * 0.003;
    
    ctx.fillStyle = '#B39DDB'; // Light purple
    
    for (let i = 0; i < orbCount; i++) {
      const angle = (i * (Math.PI * 2) / orbCount) + orbSpeed;
      const orbX = centerX + Math.cos(angle) * orbitRadius * pulseScale;
      const orbY = centerY + Math.sin(angle) * orbitRadius * pulseScale;
      
      ctx.beginPath();
      ctx.arc(orbX, orbY, orbRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw orbit path
      ctx.strokeStyle = 'rgba(179, 157, 219, 0.3)'; // Light purple, transparent
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbitRadius * pulseScale, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Draw eyeS
    const eyeDistance = 15;
    const eyeY = -5;
    
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(centerX - eyeDistance, centerY + eyeY, 7, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(centerX + eyeDistance, centerY + eyeY, 7, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw pupils - look at player
    ctx.fillStyle = 'black';
    const pupilOffset = this.facingRight ? 2 : -2;
    
    ctx.beginPath();
    ctx.arc(centerX - eyeDistance + pupilOffset, centerY + eyeY, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(centerX + eyeDistance + pupilOffset, centerY + eyeY, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  drawHealthBar(ctx, camera) {
    const barWidth = this.width * 1.5;
    const barHeight = 8;
    const barX = this.x - camera.x + (this.width - barWidth) / 2;
    const barY = this.y - camera.y - 20;
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Health bar
    const healthPercentage = this.health / 10; // Max health is 10
    
    // Color based on health
    let barColor;
    if (healthPercentage > 0.6) {
      barColor = '#4CAF50'; // Green
    } else if (healthPercentage > 0.3) {
      barColor = '#FFC107'; // Yellow
    } else {
      barColor = '#F44336'; // Red
    }
    
    ctx.fillStyle = barColor;
    ctx.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
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

// WalkingShooterEnemy.js - Enemy that walks and shoots
class WalkingShooterEnemy extends ShooterEnemy {
  constructor(x, y) {
    super(x, y);
    this.velocityX = 1; // Walking speed
    this.walkTimer = 0;
    this.color = '#E64A19'; // Darker orange
  }

  update(delta, platforms, player) {
    // Track if we were on ground before physics update
    const wasGrounded = this.isGrounded;
    this.is
