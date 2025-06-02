// Hazard.js - System for spikes, bottomless pits, and other environmental dangers

export class Hazard {
  constructor(x, y, width, height, type = 'spike') {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    
    // Hazard properties
    this.damage = 1;
    this.knockbackForce = 8;
    this.isActive = true;
    
    // Animation properties
    this.animationTimer = 0;
    this.animationFrame = 0;
    
    // Type-specific setup
    this.setupType();
  }
  
  setupType() {
    switch (this.type) {
      case 'spike':
        this.damage = 1;
        this.color = '#FF0000';
        this.pattern = 'static';
        break;
        
      case 'spike-up':
        this.damage = 1;
        this.color = '#FF0000';
        this.pattern = 'static';
        this.direction = 'up';
        break;
        
      case 'spike-down':
        this.damage = 1;
        this.color = '#FF0000';
        this.pattern = 'static';
        this.direction = 'down';
        break;
        
      case 'spike-left':
        this.damage = 1;
        this.color = '#FF0000';
        this.pattern = 'static';
        this.direction = 'left';
        break;
        
      case 'spike-right':
        this.damage = 1;
        this.color = '#FF0000';
        this.pattern = 'static';
        this.direction = 'right';
        break;
        
      case 'retractable-spike':
        this.damage = 1;
        this.color = '#FF6600';
        this.pattern = 'retractable';
        this.extended = true;
        this.retractTimer = 0;
        this.retractDuration = 2000; // 2 seconds extended
        this.retractedDuration = 1000; // 1 second retracted
        break;
        
      case 'bottomless-pit':
        this.damage = 999; // Instant death
        this.color = '#000000';
        this.pattern = 'static';
        break;
        
      case 'lava':
        this.damage = 2;
        this.color = '#FF4500';
        this.pattern = 'animated';
        break;
        
      case 'electric':
        this.damage = 1;
        this.color = '#00FFFF';
        this.pattern = 'pulsing';
        this.pulseTimer = 0;
        break;
    }
  }
  
  update(deltaTime) {
    this.animationTimer += deltaTime;
    
    // Update based on pattern
    switch (this.pattern) {
      case 'retractable':
        this.retractTimer += deltaTime;
        
        if (this.extended) {
          if (this.retractTimer >= this.retractDuration) {
            this.extended = false;
            this.retractTimer = 0;
            this.isActive = false; // Can't hurt when retracted
          }
        } else {
          if (this.retractTimer >= this.retractedDuration) {
            this.extended = true;
            this.retractTimer = 0;
            this.isActive = true;
          }
        }
        break;
        
      case 'pulsing':
        this.pulseTimer += deltaTime * 0.005;
        break;
        
      case 'animated':
        this.animationFrame = Math.floor(this.animationTimer / 200) % 4;
        break;
    }
  }
  
  checkCollision(player) {
    if (!this.isActive) return false;
    
    // Check for bottomless pit - special handling
    if (this.type === 'bottomless-pit') {
      // Check if player's bottom is below the pit threshold
      return player.y + player.height > this.y + 10;
    }
    
    // Standard AABB collision for other hazards
    return (
      player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.y + this.height &&
      player.y + player.height > this.y
    );
  }
  
  onPlayerCollision(player) {
    // Special handling for bottomless pits
    if (this.type === 'bottomless-pit') {
      player.die();
      return;
    }
    
    // Apply damage
    player.getHurt(this.damage);
    
    // Apply knockback based on hazard position
    if (player.invulnerableTimer > 0) {
      const playerCenterX = player.x + player.width / 2;
      const playerCenterY = player.y + player.height / 2;
      const hazardCenterX = this.x + this.width / 2;
      const hazardCenterY = this.y + this.height / 2;
      
      // Calculate knockback direction
      const dx = playerCenterX - hazardCenterX;
      const dy = playerCenterY - hazardCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        // Normalize and apply knockback
        player.velocityX = (dx / distance) * this.knockbackForce;
        player.velocityY = Math.min(-5, (dy / distance) * this.knockbackForce);
      }
    }
  }
  
  draw(ctx, camera) {
    // Skip if off-screen
    if (this.x + this.width < camera.x || this.x > camera.x + camera.width ||
        this.y + this.height < camera.y || this.y > camera.y + camera.height) {
      return;
    }
    
    const drawX = this.x - camera.x;
    const drawY = this.y - camera.y;
    
    switch (this.type) {
      case 'spike':
      case 'spike-up':
        this.drawSpikes(ctx, drawX, drawY, 'up');
        break;
        
      case 'spike-down':
        this.drawSpikes(ctx, drawX, drawY, 'down');
        break;
        
      case 'spike-left':
        this.drawSpikes(ctx, drawX, drawY, 'left');
        break;
        
      case 'spike-right':
        this.drawSpikes(ctx, drawX, drawY, 'right');
        break;
        
      case 'retractable-spike':
        if (this.extended) {
          const extension = this.retractTimer < 200 ? 
            this.retractTimer / 200 : 
            this.retractTimer > this.retractDuration - 200 ?
            (this.retractDuration - this.retractTimer) / 200 : 1;
          this.drawSpikes(ctx, drawX, drawY, 'up', extension);
        }
        break;
        
      case 'bottomless-pit':
        this.drawBottomlessPit(ctx, drawX, drawY);
        break;
        
      case 'lava':
        this.drawLava(ctx, drawX, drawY);
        break;
        
      case 'electric':
        this.drawElectric(ctx, drawX, drawY);
        break;
        
      default:
        // Default hazard appearance
        ctx.fillStyle = this.color;
        ctx.fillRect(drawX, drawY, this.width, this.height);
    }
  }
  
  drawSpikes(ctx, x, y, direction = 'up', extension = 1) {
    const spikeCount = Math.floor(this.width / 16);
    const spikeWidth = this.width / spikeCount;
    
    ctx.fillStyle = this.color;
    
    for (let i = 0; i < spikeCount; i++) {
      const spikeX = x + i * spikeWidth;
      
      ctx.beginPath();
      
      switch (direction) {
        case 'up':
          ctx.moveTo(spikeX, y + this.height);
          ctx.lineTo(spikeX + spikeWidth / 2, y + this.height - this.height * extension);
          ctx.lineTo(spikeX + spikeWidth, y + this.height);
          break;
          
        case 'down':
          ctx.moveTo(spikeX, y);
          ctx.lineTo(spikeX + spikeWidth / 2, y + this.height * extension);
          ctx.lineTo(spikeX + spikeWidth, y);
          break;
          
        case 'left':
          ctx.moveTo(x + this.width, y);
          ctx.lineTo(x + this.width - this.width * extension, y + this.height / 2);
          ctx.lineTo(x + this.width, y + this.height);
          break;
          
        case 'right':
          ctx.moveTo(x, y);
          ctx.lineTo(x + this.width * extension, y + this.height / 2);
          ctx.lineTo(x, y + this.height);
          break;
      }
      
      ctx.closePath();
      ctx.fill();
    }
    
    // Draw base
    ctx.fillStyle = '#666666';
    switch (direction) {
      case 'up':
        ctx.fillRect(x, y + this.height - 5, this.width, 5);
        break;
      case 'down':
        ctx.fillRect(x, y, this.width, 5);
        break;
      case 'left':
        ctx.fillRect(x + this.width - 5, y, 5, this.height);
        break;
      case 'right':
        ctx.fillRect(x, y, 5, this.height);
        break;
    }
  }
  
  drawBottomlessPit(ctx, x, y) {
    // Draw darkness gradient
    const gradient = ctx.createLinearGradient(x, y, x, y + this.height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, this.width, this.height);
    
    // Draw warning stripes at top
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + this.width, y);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  
  drawLava(ctx, x, y) {
    // Animated lava surface
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(x, y + 5, this.width, this.height - 5);
    
    // Bubbling surface
    ctx.fillStyle = '#FF6347';
    const bubbleCount = 3;
    for (let i = 0; i < bubbleCount; i++) {
      const bubbleX = x + (this.width / bubbleCount) * i + 
                      Math.sin(this.animationTimer * 0.001 + i) * 5;
      const bubbleY = y + Math.sin(this.animationTimer * 0.002 + i * 2) * 3;
      const bubbleSize = 5 + Math.sin(this.animationTimer * 0.003 + i * 3) * 2;
      
      ctx.beginPath();
      ctx.arc(bubbleX + 10, bubbleY + 5, bubbleSize, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Glow effect
    ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
    ctx.fillRect(x - 2, y - 2, this.width + 4, 10);
  }
  
  drawElectric(ctx, x, y) {
    // Pulsing electric field
    const pulseAlpha = 0.5 + Math.sin(this.pulseTimer) * 0.3;
    
    // Base
    ctx.fillStyle = '#0088CC';
    ctx.fillRect(x, y, this.width, this.height);
    
    // Electric arcs
    ctx.strokeStyle = `rgba(0, 255, 255, ${pulseAlpha})`;
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * this.width / 3, y);
      
      // Create jagged line
      for (let j = 0; j < 4; j++) {
        const offsetX = (Math.random() - 0.5) * 10;
        const segmentY = y + (this.height / 4) * (j + 1);
        ctx.lineTo(x + i * this.width / 3 + offsetX, segmentY);
      }
      
      ctx.stroke();
    }
    
    // Glow
    const glowSize = 5 + Math.sin(this.pulseTimer) * 3;
    const gradient = ctx.createRadialGradient(
      x + this.width / 2, y + this.height / 2, 0,
      x + this.width / 2, y + this.height / 2, this.width / 2 + glowSize
    );
    gradient.addColorStop(0, `rgba(0, 255, 255, ${pulseAlpha * 0.5})`);
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(
      x - glowSize, y - glowSize,
      this.width + glowSize * 2, this.height + glowSize * 2
    );
  }
}

// Hazard Manager class
export class HazardManager {
  constructor() {
    this.hazards = [];
  }
  
  createHazard(type, x, y, width, height) {
    const hazard = new Hazard(x, y, width, height, type);
    this.hazards.push(hazard);
    return hazard;
  }
  
  createHazardsFromLevel(hazardData) {
    this.hazards = [];
    
    if (!hazardData) return;
    
    for (const data of hazardData) {
      this.createHazard(
        data.type,
        data.x,
        data.y,
        data.width || 32,
        data.height || 32
      );
    }
  }
  
  update(deltaTime, player) {
    for (const hazard of this.hazards) {
      // Update hazard
      hazard.update(deltaTime);
      
      // Check collision with player
      if (hazard.checkCollision(player)) {
        hazard.onPlayerCollision(player);
      }
    }
  }
  
  draw(ctx, camera) {
    for (const hazard of this.hazards) {
      hazard.draw(ctx, camera);
    }
  }
  
  clearHazards() {
    this.hazards = [];
  }
}
