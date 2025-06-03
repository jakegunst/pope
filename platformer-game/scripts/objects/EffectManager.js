// EffectManager.js - Manages visual effects in the game

class Effect {
  constructor(x, y, type, duration = 1000) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.duration = duration;
    this.age = 0;
    this.active = true;
    
    // Visual properties
    this.alpha = 1;
    this.scale = 1;
    this.rotation = 0;
  }
  
  update(deltaTime) {
    this.age += deltaTime;
    
    if (this.age >= this.duration) {
      this.active = false;
    }
    
    // Update alpha based on age
    this.alpha = 1 - (this.age / this.duration);
  }
  
  draw(ctx) {
    if (!this.active) return;
    
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);
    
    // Draw based on type
    switch(this.type) {
      case 'coin':
        this.drawCoinEffect(ctx);
        break;
      case 'damage':
        this.drawDamageEffect(ctx);
        break;
      case 'jump':
        this.drawJumpEffect(ctx);
        break;
      case 'powerup':
        this.drawPowerupEffect(ctx);
        break;
      default:
        this.drawDefaultEffect(ctx);
    }
    
    ctx.restore();
  }
  
  drawCoinEffect(ctx) {
    // Sparkle effect
    ctx.fillStyle = '#FFD700';
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const distance = 20 * (1 + this.age / this.duration);
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  drawDamageEffect(ctx) {
    // Red flash effect
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 3;
    const radius = 30 * (1 + this.age / this.duration);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  drawJumpEffect(ctx) {
    // Dust cloud effect
    ctx.fillStyle = '#8B7355';
    const spread = 20 * (this.age / this.duration);
    
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.arc(i * spread, 0, 5 - Math.abs(i), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  drawPowerupEffect(ctx) {
    // Rainbow ring effect
    const radius = 40 * (1 + this.age / this.duration);
    const gradient = ctx.createRadialGradient(0, 0, radius - 5, 0, 0, radius + 5);
    
    const hue = (this.age / 100) % 360;
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.5, `hsl(${hue}, 100%, 50%)`);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  drawDefaultEffect(ctx) {
    // Simple expanding circle
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    const radius = 20 * (1 + this.age / this.duration);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export class EffectManager {
  constructor() {
    this.effects = [];
    this.particleSystems = [];
  }
  
  // Create a new effect
  createEffect(type, x, y, options = {}) {
    const effect = new Effect(
      x,
      y,
      type,
      options.duration || 1000
    );
    
    // Apply any custom options
    if (options.scale) effect.scale = options.scale;
    if (options.rotation) effect.rotation = options.rotation;
    if (options.color) effect.color = options.color;
    
    this.effects.push(effect);
    return effect;
  }
  
  // Create multiple effects in a burst
  createBurst(type, x, y, count = 5, options = {}) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const distance = options.spread || 20;
      const offsetX = Math.cos(angle) * distance;
      const offsetY = Math.sin(angle) * distance;
      
      this.createEffect(type, x + offsetX, y + offsetY, {
        ...options,
        rotation: angle
      });
    }
  }
  
  // Create a text effect (for scores, damage numbers, etc.)
  createTextEffect(text, x, y, options = {}) {
    const textEffect = {
      text,
      x,
      y,
      velocityY: options.velocityY || -2,
      duration: options.duration || 1000,
      age: 0,
      active: true,
      color: options.color || '#FFFFFF',
      fontSize: options.fontSize || 16
    };
    
    this.effects.push(textEffect);
  }
  
  // Update all effects
  update(deltaTime) {
    // Update effects and remove inactive ones
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const effect = this.effects[i];
      
      if (effect.update) {
        effect.update(deltaTime);
      } else if (effect.text) {
        // Update text effect
        effect.age += deltaTime;
        effect.y += effect.velocityY;
        
        if (effect.age >= effect.duration) {
          effect.active = false;
        }
      }
      
      if (!effect.active) {
        this.effects.splice(i, 1);
      }
    }
  }
  
  // Draw all effects
  draw(ctx) {
    for (const effect of this.effects) {
      if (effect.draw) {
        effect.draw(ctx);
      } else if (effect.text) {
        // Draw text effect
        ctx.save();
        const alpha = 1 - (effect.age / effect.duration);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = effect.color;
        ctx.font = `bold ${effect.fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(effect.text, effect.x, effect.y);
        ctx.restore();
      }
    }
  }
  
  // Clear all effects
  clear() {
    this.effects = [];
  }
  
  // Create specific effect types
  coinCollectEffect(x, y) {
    this.createEffect('coin', x, y, { duration: 500 });
    this.createTextEffect('+10', x, y - 10, {
      color: '#FFD700',
      fontSize: 14,
      duration: 800
    });
  }
  
  enemyDefeatEffect(x, y) {
    this.createBurst('damage', x, y, 8, {
      duration: 600,
      spread: 30
    });
    this.createTextEffect('+50', x, y - 10, {
      color: '#FF6B6B',
      fontSize: 18,
      duration: 1000
    });
  }
  
  powerupEffect(x, y) {
    this.createEffect('powerup', x, y, {
      duration: 1500,
      scale: 1.5
    });
  }
  
  jumpEffect(x, y) {
    this.createEffect('jump', x, y, {
      duration: 400
    });
  }
  
  damageEffect(x, y, damage) {
    this.createEffect('damage', x, y, {
      duration: 300
    });
    this.createTextEffect(`-${damage}`, x, y - 10, {
      color: '#FF0000',
      fontSize: 16,
      duration: 800
    });
  }
}
