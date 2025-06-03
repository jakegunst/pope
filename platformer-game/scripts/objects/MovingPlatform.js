// MovingPlatform.js - Handles moving platforms in the game

export class MovingPlatform {
  constructor(x, y, width, height, leftBound, rightBound, speed = 60) {
    // Position and dimensions
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    
    // Movement boundaries
    this.leftBound = leftBound;
    this.rightBound = rightBound;
    this.topBound = y;
    this.bottomBound = y;
    
    // Movement properties
    this.speed = speed; // pixels per second
    this.direction = 1; // 1 = right, -1 = left
    this.velocityX = speed;
    this.velocityY = 0;
    
    // Visual properties
    this.color = '#8B4513'; // Brown color
    this.isMoving = true;
    this.type = 'moving';
    
    // For vertical movement
    this.moveVertically = false;
    this.originalY = y;
  }
  
  // Set vertical movement bounds
  setVerticalBounds(topBound, bottomBound) {
    this.topBound = topBound;
    this.bottomBound = bottomBound;
    this.moveVertically = true;
    this.direction = 1; // 1 = down, -1 = up for vertical
  }
  
  // Update platform position
  update(deltaTime) {
    if (!this.isMoving) return;
    
    // Convert deltaTime to seconds
    const dt = deltaTime / 1000;
    
    if (this.moveVertically) {
      // Vertical movement
      this.y += this.direction * this.speed * dt;
      this.velocityY = this.direction * this.speed;
      this.velocityX = 0;
      
      // Check bounds and reverse direction
      if (this.y <= this.topBound) {
        this.y = this.topBound;
        this.direction = 1; // Move down
      } else if (this.y >= this.bottomBound) {
        this.y = this.bottomBound;
        this.direction = -1; // Move up
      }
    } else {
      // Horizontal movement
      this.x += this.direction * this.speed * dt;
      this.velocityX = this.direction * this.speed;
      this.velocityY = 0;
      
      // Check bounds and reverse direction
      if (this.x <= this.leftBound) {
        this.x = this.leftBound;
        this.direction = 1; // Move right
      } else if (this.x >= this.rightBound) {
        this.x = this.rightBound;
        this.direction = -1; // Move left
      }
    }
  }
  
  // Draw the platform
  draw(ctx) {
    // Main platform body
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Add some visual details
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    // Draw movement direction indicator
    ctx.fillStyle = '#FFD700';
    ctx.font = '12px Arial';
    const arrow = this.moveVertically ? 
      (this.direction > 0 ? '↓' : '↑') : 
      (this.direction > 0 ? '→' : '←');
    ctx.fillText(arrow, this.x + this.width/2 - 5, this.y + this.height/2 + 4);
  }
  
  // Check collision with an entity
  checkCollision(entity) {
    return entity.x < this.x + this.width &&
           entity.x + entity.width > this.x &&
           entity.y < this.y + this.height &&
           entity.y + entity.height > this.y;
  }
  
  // Get platform velocity (for carrying entities)
  getVelocity() {
    return {
      x: this.velocityX,
      y: this.velocityY
    };
  }
  
  // Stop/start platform movement
  stop() {
    this.isMoving = false;
    this.velocityX = 0;
    this.velocityY = 0;
  }
  
  start() {
    this.isMoving = true;
  }
  
  // Set custom movement pattern
  setMovementPattern(pattern) {
    switch(pattern) {
      case 'patrol':
        // Already the default behavior
        break;
        
      case 'circular':
        // Would need more complex movement logic
        console.log('Circular movement not yet implemented');
        break;
        
      case 'sine':
        // Smooth sine wave movement
        console.log('Sine movement not yet implemented');
        break;
    }
  }
}

// Export a factory function for creating moving platforms from data
export function createMovingPlatform(data) {
  const platform = new MovingPlatform(
    data.x,
    data.y,
    data.width || 100,
    data.height || 20,
    data.leftBound || data.x - 100,
    data.rightBound || data.x + 100,
    data.speed || 60
  );
  
  if (data.verticalBounds) {
    platform.setVerticalBounds(
      data.verticalBounds.top || data.y - 100,
      data.verticalBounds.bottom || data.y + 100
    );
  }
  
  if (data.pattern) {
    platform.setMovementPattern(data.pattern);
  }
  
  return platform;
}
