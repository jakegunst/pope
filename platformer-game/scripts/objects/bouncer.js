// Simplified bouncer.js with improved collision detection
class Bouncer {
  constructor(x, y, width, height, bounceForce = -15) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.bounceForce = bounceForce;
    
    // Animation properties
    this.isCompressed = false;
    this.compressionAmount = 0;
    this.maxCompression = this.height * 0.3;
    this.compressionSpeed = 0.5;
    this.expansionSpeed = 0.8;
    
    // Particle effect properties
    this.particles = [];
    
    // Cooldown tracking
    this.lastBounceTime = 0;
    this.bounceCooldown = 300; // ms
  }
  
  update(currentTime) {
    // Update compression animation
    if (this.isCompressed) {
      this.compressionAmount -= this.expansionSpeed;
      if (this.compressionAmount <= 0) {
        this.isCompressed = false;
        this.compressionAmount = 0;
      }
    }
    
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Move particle
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Apply gravity to particle
      particle.vy += 0.1;
      
      // Fade out
      particle.alpha -= 0.04;
      
      // Remove faded particles
      if (particle.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  // Simplified version that returns true/false but doesn't modify player
  checkCollision(player) {
    // Basic collision check - player's feet must be right at the bouncer's top
    const playerBottom = player.y + player.height;
    const isFalling = player.velocityY > 0;
    const isAtBouncerTop = Math.abs(playerBottom - this.y) < 5; // 5px tolerance
    const isOverlapping = 
      player.x + player.width > this.x + 5 && 
      player.x < this.x + this.width - 5;
    
    return isFalling && isAtBouncerTop && isOverlapping;
  }
  
  // Separate method to actually bounce the player
  bounce(player, currentTime) {
    // Check cooldown
    if (currentTime - this.lastBounceTime < this.bounceCooldown) {
      return false;
    }
    
    // Start compression animation
    this.isCompressed = true;
    this.compressionAmount = this.maxCompression;
    
    // Create particles
    this.createBounceParticles();
    
    // Update bounce time
    this.lastBounceTime = currentTime;
    
    return true;
  }
  
  createBounceParticles() {
    // Create a burst of particles
    const particleCount = 12;
    
    for (let i = 0; i < particleCount; i++) {
      // Calculate angle for this particle (mostly upward)
      const angle = (Math.PI * 1.5) + (Math.random() * Math.PI) - (Math.PI / 2);
      const speed = 2 + Math.random() * 3;
      
      this.particles.push({
        x: this.x + Math.random() * this.width,
        y: this.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: `hsl(${190 + Math.random() * 40}, 100%, 70%)`, // Blue-cyan colors
        alpha: 1,
        size: Math.random() * 4 + 2
      });
    }
  }
  
  draw(ctx) {
    // Calculate compressed height for animation
    const drawHeight = this.height - this.compressionAmount;
    const yOffset = this.compressionAmount;
    
    // Draw main bouncer body
    ctx.fillStyle = '#2196F3'; // Blue base
    
    // Draw with rounded corners
    const radius = 8;
    ctx.beginPath();
    ctx.moveTo(this.x + radius, this.y + yOffset);
    ctx.lineTo(this.x + this.width - radius, this.y + yOffset);
    ctx.quadraticCurveTo(this.x + this.width, this.y + yOffset, this.x + this.width, this.y + yOffset + radius);
    ctx.lineTo(this.x + this.width, this.y + yOffset + drawHeight - radius);
    ctx.quadraticCurveTo(this.x + this.width, this.y + yOffset + drawHeight, this.x + this.width - radius, this.y + yOffset + drawHeight);
    ctx.lineTo(this.x + radius, this.y + yOffset + drawHeight);
    ctx.quadraticCurveTo(this.x, this.y + yOffset + drawHeight, this.x, this.y + yOffset + drawHeight - radius);
    ctx.lineTo(this.x, this.y + yOffset + radius);
    ctx.quadraticCurveTo(this.x, this.y + yOffset, this.x + radius, this.y + yOffset);
    ctx.closePath();
    ctx.fill();
    
    // Draw top surface - darker blue
    ctx.fillStyle = '#1976D2';
    ctx.beginPath();
    ctx.moveTo(this.x + radius, this.y + yOffset);
    ctx.lineTo(this.x + this.width - radius, this.y + yOffset);
    ctx.quadraticCurveTo(this.x + this.width, this.y + yOffset, this.x + this.width, this.y + yOffset + radius);
    ctx.lineTo(this.x + this.width, this.y + yOffset + 5);
    ctx.lineTo(this.x, this.y + yOffset + 5);
    ctx.lineTo(this.x, this.y + yOffset + radius);
    ctx.quadraticCurveTo(this.x, this.y + yOffset, this.x + radius, this.y + yOffset);
    ctx.closePath();
    ctx.fill();
    
    // Draw highlight lines
    ctx.strokeStyle = '#90CAF9';
    ctx.lineWidth = 2;
    
    // 3 horizontal lines
    const lineSpacing = this.width / 4;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(this.x + lineSpacing * i, this.y + yOffset + 2);
      ctx.lineTo(this.x + lineSpacing * i, this.y + yOffset + drawHeight - 2);
      ctx.stroke();
    }
    
    // Draw particles
    for (const particle of this.particles) {
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Reset alpha
    ctx.globalAlpha = 1;
    
    // Draw collision indicator line
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.width, this.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

// Export the Bouncer class
export default Bouncer;