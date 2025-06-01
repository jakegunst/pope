// Collectible.js - Base class for all collectible items (coins, powerups, etc.)

export class Collectible {
  constructor(x, y, width, height, type = 'coin') {
    // Position and size
    this.x = x;
    this.y = y;
    this.width = width || 24;
    this.height = height || 24;
    
    // Collectible properties
    this.type = type; // 'coin', 'leaf', 'key', etc.
    this.isActive = true;
    this.isCollected = false;
    
    // Visual properties
    this.color = '#FFD700'; // Default gold color
    this.glowAmount = 0;
    this.glowDirection = 1;
    
    // Animation properties
    this.animationTimer = 0;
    this.floatOffset = 0;
    this.floatSpeed = 0.002;
    this.floatAmount = 3;
    this.rotationAngle = 0;
    this.rotationSpeed = 0.05;
    
    // Particle effect properties
    this.particles = [];
    
    // Collection effect properties
    this.collectAnimationTimer = 0;
    this.collectAnimationDuration = 500; // ms
    
    // Set specific properties based on type
    this.setupType();
  }
  
  setupType() {
    switch (this.type) {
      case 'coin':
        this.color = '#FFD700'; // Gold
        this.value = 10;
        this.width = 20;
        this.height = 20;
        break;
        
      case 'bigcoin':
        this.color = '#FFD700'; // Gold
        this.value = 50;
        this.width = 30;
        this.height = 30;
        this.floatAmount = 5;
        break;
        
      case 'leaf':
        this.color = '#00FF00'; // Green
        this.value = 0;
        this.width = 24;
        this.height = 20;
        this.powerupType = 'speed'; // Default powerup
        break;
        
      case 'key':
        this.color = '#C0C0C0'; // Silver
        this.value = 0;
        this.width = 16;
        this.height = 24;
        this.floatAmount = 2;
        break;
        
      case 'gem':
        this.color = '#FF1493'; // Deep pink
        this.value = 100;
        this.width = 18;
        this.height = 18;
        this.rotationSpeed = 0.08;
        break;
        
      default:
        this.value = 10;
    }
  }
  
  update(deltaTime) {
    if (!this.isActive) return;
    
    // Update animation timer
    this.animationTimer += deltaTime;
    
    // Floating animation
    this.floatOffset = Math.sin(this.animationTimer * this.floatSpeed) * this.floatAmount;
    
    // Rotation animation (for coins and gems)
    if (this.type === 'coin' || this.type === 'bigcoin' || this.type === 'gem') {
      this.rotationAngle += this.rotationSpeed;
      if (this.rotationAngle > Math.PI * 2) {
        this.rotationAngle -= Math.PI * 2;
      }
    }
    
    // Glow pulsing effect
    this.glowAmount += this.glowDirection * 0.02;
    if (this.glowAmount > 1) {
      this.glowAmount = 1;
      this.glowDirection = -1;
    } else if (this.glowAmount < 0) {
      this.glowAmount = 0;
      this.glowDirection = 1;
    }
    
    // Update collection animation
    if (this.isCollected) {
      this.collectAnimationTimer += deltaTime;
      
      // Deactivate after animation completes
      if (this.collectAnimationTimer >= this.collectAnimationDuration) {
        this.isActive = false;
      }
    }
    
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Move particle
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Apply gravity
      particle.vy += 0.1;
      
      // Fade out
      particle.alpha -= 0.02;
      
      // Remove faded particles
      if (particle.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  checkCollision(player) {
    if (!this.isActive || this.isCollected) return false;
    
    // Simple AABB collision detection
    return (
      player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.y + this.height &&
      player.y + player.height > this.y
    );
  }
  
  collect(player, game) {
    if (this.isCollected) return;
    
    this.isCollected = true;
    this.collectAnimationTimer = 0;
    
    // Apply collection effects based on type
    switch (this.type) {
      case 'coin':
      case 'bigcoin':
      case 'gem':
        // Add score
        if (game) {
          game.addScore(this.value);
        }
        // Play coin sound
        this.playCoinSound();
        break;
        
      case 'leaf':
        // Apply powerup to player
        if (player && this.powerupType) {
          this.applyPowerup(player);
        }
        break;
        
      case 'key':
        // Add key to inventory
        if (game) {
          game.addKey();
        }
        break;
    }
    
    // Create collection particles
    this.createCollectionParticles();
  }
  
  applyPowerup(player) {
    // Override in subclasses or implement powerup system
    switch (this.powerupType) {
      case 'speed':
        player.maxSpeed = player.maxSpeed * 1.5;
        // Set timer to remove effect later
        setTimeout(() => {
          player.maxSpeed = player.maxSpeed / 1.5;
        }, 5000); // 5 seconds
        break;
        
      case 'jump':
        player.jumpForce = player.jumpForce * 1.3;
        setTimeout(() => {
          player.jumpForce = player.jumpForce / 1.3;
        }, 5000);
        break;
        
      case 'invincibility':
        player.invulnerableTimer = 5000; // 5 seconds
        break;
        
      case 'health':
        player.health = Math.min(player.health + 1, player.maxHealth);
        break;
    }
  }
  
  createCollectionParticles() {
    const particleCount = 12;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i;
      const speed = 2 + Math.random() * 2;
      
      this.particles.push({
        x: this.x + this.width / 2,
        y: this.y + this.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        color: this.color,
        alpha: 1,
        size: Math.random() * 3 + 2
      });
    }
  }
  
  playCoinSound() {
    // Placeholder for sound effect
    // In a real implementation, you'd play an audio file here
    console.log('Coin collected!');
  }
  
  draw(ctx, camera) {
    if (!this.isActive) return;
    
    // Skip drawing if off-screen
    if (this.x + this.width < camera.x || this.x > camera.x + camera.width ||
        this.y + this.height < camera.y || this.y > camera.y + camera.height) {
      return;
    }
    
    const drawX = this.x - camera.x;
    const drawY = this.y - camera.y + this.floatOffset;
    
    ctx.save();
    
    // Apply collection animation effects
    if (this.isCollected) {
      const progress = this.collectAnimationTimer / this.collectAnimationDuration;
      
      // Scale up and fade out
      const scale = 1 + progress * 0.5;
      ctx.globalAlpha = 1 - progress;
      
      ctx.translate(drawX + this.width / 2, drawY + this.height / 2);
      ctx.scale(scale, scale);
      ctx.translate(-this.width / 2, -this.height / 2);
    } else {
      ctx.translate(drawX, drawY);
    }
    
    // Draw glow effect
    if (this.glowAmount > 0 && !this.isCollected) {
      const gradient = ctx.createRadialGradient(
        this.width / 2, this.height / 2, 0,
        this.width / 2, this.height / 2, this.width
      );
      gradient.addColorStop(0, `rgba(255, 255, 255, ${this.glowAmount * 0.3})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width * 2, this.height * 2);
    }
    
    // Draw the collectible based on type
    this.drawShape(ctx);
    
    ctx.restore();
    
    // Draw particles
    for (const particle of this.particles) {
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(
        particle.x - camera.x,
        particle.y - camera.y,
        particle.size,
        0, Math.PI * 2
      );
      ctx.fill();
    }
    
    ctx.globalAlpha = 1;
  }
  
  drawShape(ctx) {
    switch (this.type) {
      case 'coin':
      case 'bigcoin':
        this.drawCoin(ctx);
        break;
        
      case 'leaf':
        this.drawLeaf(ctx);
        break;
        
      case 'key':
        this.drawKey(ctx);
        break;
        
      case 'gem':
        this.drawGem(ctx);
        break;
        
      default:
        // Default circle shape
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.width / 2, this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
    }
  }
  
  drawCoin(ctx) {
    // Draw a rotating coin
    const perspective = Math.cos(this.rotationAngle);
    const width = this.width * Math.abs(perspective);
    
    ctx.fillStyle = this.color;
    
    if (width > 1) {
      // Draw coin face
      ctx.beginPath();
      ctx.ellipse(
        this.width / 2, this.height / 2,
        width / 2, this.height / 2,
        0, 0, Math.PI * 2
      );
      ctx.fill();
      
      // Draw inner circle
      ctx.fillStyle = '#FFA500'; // Darker gold
      ctx.beginPath();
      ctx.ellipse(
        this.width / 2, this.height / 2,
        width / 3, this.height / 3,
        0, 0, Math.PI * 2
      );
      ctx.fill();
      
      // Draw shine
      if (perspective > 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.ellipse(
          this.width / 2 - width / 6, this.height / 2 - this.height / 6,
          width / 6, this.height / 6,
          0, 0, Math.PI * 2
        );
        ctx.fill();
      }
    } else {
      // Edge view
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.width / 2, 0);
      ctx.lineTo(this.width / 2, this.height);
      ctx.stroke();
    }
  }
  
  drawLeaf(ctx) {
    // Draw a simple leaf shape
    ctx.fillStyle = this.color;
    
    ctx.beginPath();
    ctx.moveTo(this.width / 2, 0);
    ctx.quadraticCurveTo(this.width * 0.8, this.height * 0.2, this.width * 0.7, this.height * 0.5);
    ctx.quadraticCurveTo(this.width * 0.8, this.height * 0.8, this.width / 2, this.height);
    ctx.quadraticCurveTo(this.width * 0.2, this.height * 0.8, this.width * 0.3, this.height * 0.5);
    ctx.quadraticCurveTo(this.width * 0.2, this.height * 0.2, this.width / 2, 0);
    ctx.fill();
    
    // Draw leaf vein
    ctx.strokeStyle = '#00AA00';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.width / 2, this.height * 0.2);
    ctx.lineTo(this.width / 2, this.height * 0.8);
    ctx.stroke();
  }
  
  drawKey(ctx) {
    // Draw a simple key shape
    ctx.fillStyle = this.color;
    
    // Key handle (circle)
    ctx.beginPath();
    ctx.arc(this.width / 2, this.height * 0.3, this.width * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Key hole
    ctx.fillStyle = '#808080';
    ctx.beginPath();
    ctx.arc(this.width / 2, this.height * 0.3, this.width * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    // Key shaft
    ctx.fillStyle = this.color;
    ctx.fillRect(this.width * 0.4, this.height * 0.5, this.width * 0.2, this.height * 0.4);
    
    // Key teeth
    ctx.fillRect(this.width * 0.3, this.height * 0.85, this.width * 0.1, this.height * 0.15);
    ctx.fillRect(this.width * 0.6, this.height * 0.85, this.width * 0.1, this.height * 0.15);
  }
  
  drawGem(ctx) {
    // Draw a diamond/gem shape
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    // Apply rotation for sparkle effect
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.rotationAngle);
    ctx.translate(-centerX, -centerY);
    
    // Draw gem
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(this.width, centerY);
    ctx.lineTo(centerX, this.height);
    ctx.lineTo(0, centerY);
    ctx.closePath();
    ctx.fill();
    
    // Inner shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.moveTo(centerX, this.height * 0.3);
    ctx.lineTo(this.width * 0.7, centerY);
    ctx.lineTo(centerX, this.height * 0.7);
    ctx.lineTo(this.width * 0.3, centerY);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }
}

// Specific collectible subclasses can be created here
export class Coin extends Collectible {
  constructor(x, y) {
    super(x, y, 20, 20, 'coin');
  }
}

export class BigCoin extends Collectible {
  constructor(x, y) {
    super(x, y, 30, 30, 'bigcoin');
  }
}

export class Leaf extends Collectible {
  constructor(x, y, powerupType = 'speed') {
    super(x, y, 24, 20, 'leaf');
    this.powerupType = powerupType;
  }
}

export class Key extends Collectible {
  constructor(x, y) {
    super(x, y, 16, 24, 'key');
  }
}

export class Gem extends Collectible {
  constructor(x, y) {
    super(x, y, 18, 18, 'gem');
  }
}
