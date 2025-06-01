// PowerupSystem.js - Manages active powerups and their effects

export class PowerupSystem {
  constructor() {
    this.activePowerups = [];
    this.powerupDefinitions = {
      speed: {
        name: 'Speed Boost',
        duration: 5000,
        color: '#00FF00',
        effect: (player) => {
          player.maxSpeed *= 1.5;
          player.friction = 0.9; // Less friction for better speed
        },
        remove: (player) => {
          player.maxSpeed /= 1.5;
          player.friction = 0.85; // Reset to default
        },
        particle: { color: '#00FF00', trail: true }
      },
      
      jump: {
        name: 'Super Jump',
        duration: 5000,
        color: '#00FFFF',
        effect: (player) => {
          player.jumpForce *= 1.3;
          player.gravity *= 0.8; // Slightly less gravity
        },
        remove: (player) => {
          player.jumpForce /= 1.3;
          player.gravity /= 0.8;
        },
        particle: { color: '#00FFFF', burst: true }
      },
      
      invincibility: {
        name: 'Invincibility',
        duration: 5000,
        color: '#FFD700',
        effect: (player) => {
          player.isInvincible = true;
          player.invulnerableTimer = 5000;
        },
        remove: (player) => {
          player.isInvincible = false;
          player.invulnerableTimer = 0;
        },
        particle: { color: '#FFD700', sparkle: true }
      },
      
      doubleJump: {
        name: 'Triple Jump',
        duration: 10000,
        color: '#FF00FF',
        effect: (player) => {
          player.maxJumps = 3; // Allow triple jump
          player.jumpsRemaining = 3;
        },
        remove: (player) => {
          player.maxJumps = 2; // Back to double jump
          if (player.jumpsRemaining > 2) {
            player.jumpsRemaining = 2;
          }
        },
        particle: { color: '#FF00FF', swirl: true }
      },
      
      magnetism: {
        name: 'Coin Magnet',
        duration: 8000,
        color: '#FFB300',
        effect: (player) => {
          player.magnetRadius = 100; // Attract coins within 100 pixels
        },
        remove: (player) => {
          player.magnetRadius = 0;
        },
        particle: { color: '#FFB300', pulse: true }
      },
      
      shield: {
        name: 'Shield',
        duration: 6000,
        color: '#4169E1',
        effect: (player) => {
          player.hasShield = true;
          player.shieldHits = 3; // Can absorb 3 hits
        },
        remove: (player) => {
          player.hasShield = false;
          player.shieldHits = 0;
        },
        particle: { color: '#4169E1', orbit: true }
      },
      
      miniaturize: {
        name: 'Mini Mode',
        duration: 7000,
        color: '#9C27B0',
        effect: (player) => {
          player.scale = 0.6;
          player.width *= 0.6;
          player.height *= 0.6;
          player.jumpForce *= 1.1; // Slightly higher jump when small
        },
        remove: (player) => {
          player.scale = 1;
          player.width /= 0.6;
          player.height /= 0.6;
          player.jumpForce /= 1.1;
        },
        particle: { color: '#9C27B0', shrink: true }
      },
      
      giant: {
        name: 'Giant Mode',
        duration: 6000,
        color: '#F44336',
        effect: (player) => {
          player.scale = 1.5;
          player.width *= 1.5;
          player.height *= 1.5;
          player.canBreakBlocks = true; // Can break certain blocks
          player.gravity *= 1.2; // Heavier
        },
        remove: (player) => {
          player.scale = 1;
          player.width /= 1.5;
          player.height /= 1.5;
          player.canBreakBlocks = false;
          player.gravity /= 1.2;
        },
        particle: { color: '#F44336', grow: true }
      }
    };
    
    // Visual effect particles
    this.effectParticles = [];
  }
  
  // Add a powerup to the player
  addPowerup(type, player) {
    const definition = this.powerupDefinitions[type];
    if (!definition) {
      console.warn(`Unknown powerup type: ${type}`);
      return;
    }
    
    // Check if powerup is already active
    const existingIndex = this.activePowerups.findIndex(p => p.type === type);
    
    if (existingIndex !== -1) {
      // Refresh duration of existing powerup
      this.activePowerups[existingIndex].timeRemaining = definition.duration;
      console.log(`Refreshed ${definition.name}`);
    } else {
      // Add new powerup
      const powerup = {
        type: type,
        name: definition.name,
        timeRemaining: definition.duration,
        definition: definition
      };
      
      // Apply effect
      definition.effect(player);
      
      this.activePowerups.push(powerup);
      console.log(`Activated ${definition.name}`);
      
      // Create activation particles
      this.createActivationEffect(player, definition);
    }
  }
  
  // Update all active powerups
  update(deltaTime, player) {
    // Update active powerups
    for (let i = this.activePowerups.length - 1; i >= 0; i--) {
      const powerup = this.activePowerups[i];
      
      // Decrease time remaining
      powerup.timeRemaining -= deltaTime;
      
      // Create ongoing visual effects
      this.createOngoingEffects(player, powerup);
      
      // Remove expired powerups
      if (powerup.timeRemaining <= 0) {
        // Remove effect
        powerup.definition.remove(player);
        console.log(`${powerup.name} expired`);
        
        // Remove from active list
        this.activePowerups.splice(i, 1);
      }
    }
    
    // Update visual effect particles
    for (let i = this.effectParticles.length - 1; i >= 0; i--) {
      const particle = this.effectParticles[i];
      
      // Update particle based on type
      this.updateParticle(particle, deltaTime, player);
      
      // Remove dead particles
      if (particle.life <= 0) {
        this.effectParticles.splice(i, 1);
      }
    }
  }
  
  // Create activation effect
  createActivationEffect(player, definition) {
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    
    // Create burst of particles
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 / 20) * i;
      const speed = 3 + Math.random() * 2;
      
      this.effectParticles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: definition.color,
        size: 4 + Math.random() * 4,
        life: 1,
        type: 'burst'
      });
    }
  }
  
  // Create ongoing visual effects
  createOngoingEffects(player, powerup) {
    const definition = powerup.definition;
    const particleInfo = definition.particle;
    
    if (!particleInfo) return;
    
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    
    // Different effect types
    if (particleInfo.trail && Math.random() < 0.3) {
      // Speed trail effect
      this.effectParticles.push({
        x: centerX + (Math.random() - 0.5) * player.width,
        y: player.y + player.height,
        vx: -player.velocityX * 0.5,
        vy: -1,
        color: particleInfo.color,
        size: 3 + Math.random() * 3,
        life: 0.5,
        type: 'trail'
      });
    }
    
    if (particleInfo.sparkle && Math.random() < 0.4) {
      // Sparkle effect for invincibility
      const angle = Math.random() * Math.PI * 2;
      const radius = player.width * 0.7;
      
      this.effectParticles.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: 0,
        vy: -0.5,
        color: particleInfo.color,
        size: 2 + Math.random() * 4,
        life: 0.8,
        type: 'sparkle'
      });
    }
    
    if (particleInfo.orbit) {
      // Orbiting particles for shield
      const time = Date.now() * 0.001;
      const orbitRadius = player.width * 0.8;
      
      if (Math.random() < 0.1) {
        const angle = time * 2;
        
        this.effectParticles.push({
          x: centerX + Math.cos(angle) * orbitRadius,
          y: centerY + Math.sin(angle) * orbitRadius,
          vx: 0,
          vy: 0,
          color: particleInfo.color,
          size: 4,
          life: 2,
          type: 'orbit',
          angle: angle,
          radius: orbitRadius
        });
      }
    }
    
    if (particleInfo.pulse && Math.random() < 0.05) {
      // Pulse effect for magnetism
      this.effectParticles.push({
        x: centerX,
        y: centerY,
        vx: 0,
        vy: 0,
        color: particleInfo.color,
        size: 10,
        life: 1,
        type: 'pulse',
        maxSize: player.magnetRadius || 100
      });
    }
  }
  
  // Update individual particle
  updateParticle(particle, deltaTime, player) {
    const decay = deltaTime * 0.001;
    
    switch (particle.type) {
      case 'burst':
      case 'trail':
        // Basic physics
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1; // Gravity
        particle.life -= decay * 2;
        break;
        
      case 'sparkle':
        // Float upward and fade
        particle.y += particle.vy;
        particle.life -= decay;
        particle.size = particle.size * (0.95 + Math.random() * 0.1);
        break;
        
      case 'orbit':
        // Orbit around player
        particle.angle += decay * 4;
        const centerX = player.x + player.width / 2;
        const centerY = player.y + player.height / 2;
        particle.x = centerX + Math.cos(particle.angle) * particle.radius;
        particle.y = centerY + Math.sin(particle.angle) * particle.radius;
        particle.life -= decay * 0.5;
        break;
        
      case 'pulse':
        // Expand outward
        particle.size += 2;
        particle.life = 1 - (particle.size / particle.maxSize);
        break;
    }
  }
  
  // Draw powerup effects
  draw(ctx, camera) {
    // Draw effect particles
    for (const particle of this.effectParticles) {
      ctx.save();
      
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      
      if (particle.type === 'pulse') {
        // Draw expanding ring
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
          particle.x - camera.x,
          particle.y - camera.y,
          particle.size,
          0, Math.PI * 2
        );
        ctx.stroke();
      } else if (particle.type === 'sparkle') {
        // Draw star shape
        const x = particle.x - camera.x;
        const y = particle.y - camera.y;
        const size = particle.size;
        
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const angle = (Math.PI / 2) * i;
          const outerX = x + Math.cos(angle) * size;
          const outerY = y + Math.sin(angle) * size;
          const innerX = x + Math.cos(angle + Math.PI / 4) * (size * 0.4);
          const innerY = y + Math.sin(angle + Math.PI / 4) * (size * 0.4);
          
          if (i === 0) {
            ctx.moveTo(outerX, outerY);
          } else {
            ctx.lineTo(outerX, outerY);
          }
          ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        // Draw regular circle
        ctx.beginPath();
        ctx.arc(
          particle.x - camera.x,
          particle.y - camera.y,
          particle.size,
          0, Math.PI * 2
        );
        ctx.fill();
      }
      
      ctx.restore();
    }
  }
  
  // Draw UI for active powerups
  drawUI(ctx, x, y) {
    const iconSize = 32;
    const spacing = 5;
    let offsetX = 0;
    
    for (const powerup of this.activePowerups) {
      const progress = powerup.timeRemaining / powerup.definition.duration;
      
      // Draw powerup icon background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(x + offsetX, y, iconSize, iconSize);
      
      // Draw powerup color
      ctx.fillStyle = powerup.definition.color;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(x + offsetX + 2, y + 2, iconSize - 4, iconSize - 4);
      ctx.globalAlpha = 1;
      
      // Draw timer bar
      ctx.fillStyle = 'white';
      ctx.fillRect(x + offsetX, y + iconSize - 4, iconSize * progress, 4);
      
      // Draw powerup initial
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        powerup.name.charAt(0),
        x + offsetX + iconSize / 2,
        y + iconSize / 2
      );
      
      offsetX += iconSize + spacing;
    }
    
    // Reset text alignment
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }
  
  // Check if a specific powerup is active
  isPowerupActive(type) {
    return this.activePowerups.some(p => p.type === type);
  }
  
  // Get remaining time for a powerup
  getPowerupTimeRemaining(type) {
    const powerup = this.activePowerups.find(p => p.type === type);
    return powerup ? powerup.timeRemaining : 0;
  }
  
  // Clear all powerups (for level reset, etc.)
  clearAllPowerups(player) {
    for (const powerup of this.activePowerups) {
      powerup.definition.remove(player);
    }
    this.activePowerups = [];
    this.effectParticles = [];
  }
}
