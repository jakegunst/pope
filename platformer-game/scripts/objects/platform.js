// Platform class with fixed moving platform handling
class Platform {
  constructor(x, y, width, height, type = 'platform', options = {}) {
    // Core properties
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type; // 'ground', 'platform', 'slope', 'one-way', or 'moving'
    
    // Platform type flags - directly set based on type
    this.isOneWay = type === 'one-way';
    this.isSlope = type === 'slope';
    
    // Slope properties
    if (this.isSlope) {
      this.angle = options.angle || 0; // Angle in degrees
      this.direction = options.direction || 'right'; // 'right' means going up from left to right
      this.calculateSlopeProperties();
    }
    
    // Moving platform properties - check for moving platform or options with movement
    this.isMoving = type === 'moving' || options.moveX !== undefined || options.moveY !== undefined;
    
    if (this.isMoving) {
      // Core movement properties
      this.startX = x;
      this.startY = y;
      this.moveX = options.moveX || 0;  // Horizontal distance to move
      this.moveY = options.moveY || 0;  // Vertical distance to move
      this.moveSpeed = options.moveSpeed || 1;  // Speed factor
      this.moveTiming = options.moveTiming || 'sine'; // 'linear', 'sine', or 'bounce'
      this.moveProgress = options.movePhase || 0; // Starting phase (0-1)
      
      // Track current position for stable delta calculations
      this.prevX = x;
      this.prevY = y;
      this.deltaX = 0;
      this.deltaY = 0;
      
      // For very slow speeds, we'll use a movement accumulator
      this.moveAccumX = 0;
      this.moveAccumY = 0;
    }
  }
  
  calculateSlopeProperties() {
    if (!this.isSlope) return;
    
    // Calculate slope properties for collision detection
    this.slopeRise = Math.tan(this.angle * Math.PI / 180) * this.width;
    
    if (this.direction === 'right') {
      // Going up from left to right
      this.startY = this.y + this.height;
      this.endY = this.y + this.height - this.slopeRise;
    } else {
      // Going up from right to left
      this.startY = this.y + this.height - this.slopeRise;
      this.endY = this.y + this.height;
    }
  }

  // Get the Y position of the slope at a given X position
  getSlopeYAtX(x) {
    if (!this.isSlope) return this.y;
    
    // Convert x position to relative position on slope (0 to 1)
    const relativeX = Math.max(0, Math.min(1, (x - this.x) / this.width));
    
    if (this.direction === 'right') {
      // From bottom-left to top-right
      return this.startY - (relativeX * this.slopeRise);
    } else {
      // From top-left to bottom-right
      return this.startY + (relativeX * this.slopeRise);
    }
  }
  
  // Update position for moving platforms
  update() {
    if (!this.isMoving) return;
    
    // Store current position before updating
    this.prevX = this.x;
    this.prevY = this.y;
    
    // Update the movement progress
    this.moveProgress += 0.01 * this.moveSpeed;
    if (this.moveProgress > 1) {
      this.moveProgress = 0;
    }
    
    // Calculate the movement factor based on timing function
    let moveFactor;
    switch (this.moveTiming) {
      case 'linear':
        // Simple linear back and forth
        moveFactor = this.moveProgress <= 0.5 ? 
                      this.moveProgress * 2 : // 0 to 1 during first half
                      (1 - this.moveProgress) * 2; // 1 to 0 during second half
        break;
      case 'sine':
        // Smooth sine wave movement
        moveFactor = Math.sin(this.moveProgress * Math.PI * 2) * 0.5 + 0.5;
        break;
      case 'bounce':
        // Bouncy easing with a pause at the extremes
        if (this.moveProgress < 0.3) {
          // Accelerate from origin: cubic ease-in
          moveFactor = Math.pow(this.moveProgress / 0.3, 3);
        } else if (this.moveProgress < 0.5) {
          // Decelerate to peak: cubic ease-out
          const t = (this.moveProgress - 0.3) / 0.2;
          moveFactor = 1 - Math.pow(1 - t, 3);
        } else if (this.moveProgress < 0.8) {
          // Accelerate from peak: cubic ease-in (opposite direction)
          const t = (this.moveProgress - 0.5) / 0.3;
          moveFactor = 1 - Math.pow(t, 3);
        } else {
          // Decelerate to origin: cubic ease-out (opposite direction)
          const t = (this.moveProgress - 0.8) / 0.2;
          moveFactor = Math.pow(1 - t, 3);
        }
        break;
      default:
        moveFactor = this.moveProgress <= 0.5 ? 
                      this.moveProgress * 2 : 
                      (1 - this.moveProgress) * 2;
    }
    
    // Calculate the target position
    const targetX = this.startX + this.moveX * moveFactor;
    const targetY = this.startY + this.moveY * moveFactor;
    
    // Set new position
    this.x = targetX;
    this.y = targetY;
    
    // Calculate delta movement - exact difference between current and previous
    this.deltaX = this.x - this.prevX;
    this.deltaY = this.y - this.prevY;
    
    // For very small movements, accumulate and apply only when significant
    this.moveAccumX += this.deltaX;
    this.moveAccumY += this.deltaY;
    
    // If movement is extremely small, accumulate until it's significant
    if (Math.abs(this.deltaX) < 0.01) {
      this.deltaX = 0;
    }
    
    if (Math.abs(this.deltaY) < 0.01) {
      this.deltaY = 0;
    }
    
    // Update slope properties if we're a moving slope
    if (this.isSlope) {
      this.calculateSlopeProperties();
    }
  }

  draw(ctx) {
    // Set color based on platform type
    if (this.type === 'ground') {
      ctx.fillStyle = '#8B4513'; // Brown for ground
    } else if (this.type === 'platform') {
      ctx.fillStyle = '#4CAF50'; // Green for platforms
    } else if (this.type === 'slope') {
      ctx.fillStyle = '#FFA500'; // Orange for slopes
    } else if (this.type === 'one-way') {
      ctx.fillStyle = '#00BFFF'; // Light blue for one-way platforms
    } else if (this.type === 'moving') {
      ctx.fillStyle = '#FF4081'; // Pink for moving platforms
    } else {
      // Default fallback
      ctx.fillStyle = '#999999';
    }
    
    // Draw based on platform type
    if (this.isOneWay) {
      // Draw one-way platform
      ctx.fillRect(this.x, this.y, this.width, this.height);
      
      // Draw dashed line on top to indicate one-way
      ctx.beginPath();
      ctx.setLineDash([5, 3]); // Dashed line pattern
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.width, this.y);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash pattern
    } else if (this.isSlope) {
      // Draw slope as a triangle
      ctx.beginPath();
      
      if (this.direction === 'right') {
        // Going up from left to right
        ctx.moveTo(this.x, this.y + this.height); // Bottom left
        ctx.lineTo(this.x + this.width, this.y + this.height - this.slopeRise); // Top right
        ctx.lineTo(this.x + this.width, this.y + this.height); // Bottom right
      } else {
        // Going up from right to left
        ctx.moveTo(this.x, this.y + this.height - this.slopeRise); // Top left
        ctx.lineTo(this.x + this.width, this.y + this.height); // Bottom right
        ctx.lineTo(this.x, this.y + this.height); // Bottom left
      }
      
      ctx.closePath();
      ctx.fill();
    } else {
      // Draw regular platform/ground/moving as rectangle
      ctx.fillRect(this.x, this.y, this.width, this.height);
      
      // Add movement indicators for moving platforms
      if (this.isMoving) {
        ctx.fillStyle = 'white';
        const arrowSize = 8;
        
        if (this.moveX !== 0) {
          // Horizontal movement indicator
          ctx.beginPath();
          ctx.moveTo(this.x + this.width / 2 - arrowSize, this.y + this.height / 2);
          ctx.lineTo(this.x + this.width / 2 + arrowSize, this.y + this.height / 2);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'white';
          ctx.stroke();
          
          // Arrow head
          if (this.moveX > 0) {
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2 + arrowSize, this.y + this.height / 2);
            ctx.lineTo(this.x + this.width / 2 + arrowSize - 4, this.y + this.height / 2 - 4);
            ctx.lineTo(this.x + this.width / 2 + arrowSize - 4, this.y + this.height / 2 + 4);
            ctx.closePath();
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2 - arrowSize, this.y + this.height / 2);
            ctx.lineTo(this.x + this.width / 2 - arrowSize + 4, this.y + this.height / 2 - 4);
            ctx.lineTo(this.x + this.width / 2 - arrowSize + 4, this.y + this.height / 2 + 4);
            ctx.closePath();
            ctx.fill();
          }
        }
        
        if (this.moveY !== 0) {
          // Vertical movement indicator
          ctx.beginPath();
          ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2 - arrowSize);
          ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2 + arrowSize);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'white';
          ctx.stroke();
          
          // Arrow head
          if (this.moveY > 0) {
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2 + arrowSize);
            ctx.lineTo(this.x + this.width / 2 - 4, this.y + this.height / 2 + arrowSize - 4);
            ctx.lineTo(this.x + this.width / 2 + 4, this.y + this.height / 2 + arrowSize - 4);
            ctx.closePath();
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2 - arrowSize);
            ctx.lineTo(this.x + this.width / 2 - 4, this.y + this.height / 2 - arrowSize + 4);
            ctx.lineTo(this.x + this.width / 2 + 4, this.y + this.height / 2 - arrowSize + 4);
            ctx.closePath();
            ctx.fill();
          }
        }
      }
    }
  }
}

// Export the Platform class as the default export
export default Platform;