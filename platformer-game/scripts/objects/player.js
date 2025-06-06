// Player class with corrected slope edge physics and powerup support
import { keys } from '../engine/input.js';

class Player {
  constructor(x, y) {
    // Position and size
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 48;
    
    // Physics properties - adjusted for better feel
    this.velocityX = 0;
    this.velocityY = 0;
    this.maxSpeed = 6;      // Increased from 5 - faster horizontal movement
    this.jumpForce = -13;   // Changed from -15 - slightly lower jumps
    this.gravity = 0.6;     // Changed from 0.8 - slightly less gravity
    this.friction = 0.85;   // Changed from 0.8 - slightly more friction
    
    // States
    this.isJumping = false;
    this.isGrounded = false;
    this.direction = 1; // 1 for right, -1 for left
    this.canDoubleJump = false; // Initially false, set to true after first jump
    this.jumpKeyReleased = true; // Track if jump key has been released
    
    // Health and damage properties
    this.health = 3;  // Player health (same as lives)
    this.maxHealth = 3;
    this.invulnerableTimer = 0;  // Invulnerability time after getting hurt
    this.maxInvulnerableTime = 1000;  // 1 second of invulnerability
    this.knockbackForce = 8;  // Horizontal knockback when hurt
    this.isDamaged = false;  // Visual indicator
    
    // Flip animation properties
    this.isFlipping = false;
    this.flipAngle = 0;
    this.flipSpeed = 15; // Degrees per frame
    this.flipDirection = 1; // 1 for clockwise, -1 for counter-clockwise
    
    // Particle effects for double jump
    this.particles = [];
    
    // Slope-related properties
    this.isOnSlope = false;
    this.slopeAngle = 0;
    this.slopePosition = 'middle'; // 'middle', 'top', 'bottom'
    this.hangingDirection = 0; // Direction player is hanging (-1 left, 1 right)
    this.hangingAmount = 0; // How much of player width is hanging (0-1)
    
    // Moving platform properties
    this.activePlatform = null;
    this.wasOnMovingPlatform = false;
    this.lastMovingPlatformDeltaX = 0;
    this.lastMovingPlatformDeltaY = 0;
    
    // Add coyote time (grace period for jumping after leaving edge)
    this.coyoteTimeCounter = 0;
    
    // One-way platform dropping
    this.isDropping = false;
    this.dropTimer = 0; // Timer for temporary disabling one-way collisions
    
    // Wall slide and wall jump properties
    this.isTouchingWall = false;
    this.wallDirection = 0; // -1 for left wall, 1 for right wall
    this.wallSlideSpeed = 2; // Maximum falling speed when wall sliding
    this.wallJumpForce = -11; // Slightly weaker than normal jump
    this.wallJumpPushForce = 8; // Horizontal push when wall jumping
    this.wallJumpCooldown = 0; // Cooldown timer to prevent multiple wall jumps
    this.maxWallJumpCooldown = 10; // Frames of cooldown
    
    // Powerup-related properties
    this.isInvincible = false;
    this.magnetRadius = 0; // Radius for coin attraction
    this.hasShield = false;
    this.shieldHits = 0;
    this.scale = 1; // For size-changing powerups
    this.canBreakBlocks = false; // For giant mode
    this.maxJumps = 2; // Default double jump
    this.jumpsRemaining = 0;
    
    // Visual effect properties for powerups
    this.powerupGlow = null;
    this.shieldAngle = 0;
  }

  update(platforms, bouncers = []) {
    // Apply gravity
    this.velocityY += this.gravity;
    
    // Apply friction when on ground
    if (this.isGrounded) {
      this.velocityX *= this.friction;
    } else {
      // Less friction in the air for better control
      this.velocityX *= 0.95;
    }
    
    // Update invulnerability timer
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= 16; // Assuming ~60fps (16ms per frame)
      
      // Clear damaged visual state after a short time
      if (this.invulnerableTimer < this.maxInvulnerableTime - 200) {
        this.isDamaged = false;
      }
    }
    
    // Update wall jump cooldown
    if (this.wallJumpCooldown > 0) {
      this.wallJumpCooldown--;
    }
    
    // Check if player is pressing down to drop through one-way platforms
    const isPressingDown = keys['s'] || keys['ArrowDown'];
    if (isPressingDown && this.isGrounded && !this.isDropping) {
      // Check if standing on a one-way platform
      if (this.activePlatform && this.activePlatform.isOneWay) {
        this.isDropping = true;
        this.dropTimer = 15; // Allow dropping for 15 frames
        this.isGrounded = false;
      }
    }
    
    // Update drop timer
    if (this.isDropping) {
      this.dropTimer--;
      if (this.dropTimer <= 0) {
        this.isDropping = false;
      }
    }
    
    // Store state before update
    const wasGrounded = this.isGrounded;
    const wasOnMovingPlatform = this.wasOnMovingPlatform;
    const wasTouchingWall = this.isTouchingWall;
    
    // Reset platform tracking variables
    this.wasOnMovingPlatform = false;
    this.lastMovingPlatformDeltaX = 0;
    this.lastMovingPlatformDeltaY = 0;
    
    // Reset wall touching state
    this.isTouchingWall = false;
    this.wallDirection = 0;
    
    // Apply wall slide if touching wall
    if (this.isTouchingWall && !this.isGrounded && this.velocityY > 0) {
      // Cap falling speed when wall sliding
      this.velocityY = Math.min(this.velocityY, this.wallSlideSpeed);
      
      // Create wall slide effect particles occasionally
      if (Math.random() < 0.2) {
        this.createWallSlideParticles();
      }
    }
    
    // Apply velocity to position
    this.x += this.velocityX;
    this.y += this.velocityY;
    
    // Reset grounded state and active platform before checking collisions
    this.isGrounded = false;
    this.activePlatform = null;
    this.isOnSlope = false;
    this.slopeAngle = 0;
    this.slopePosition = 'middle';
    this.hangingDirection = 0;
    this.hangingAmount = 0;
    
    // Check for collisions with platforms
    this.checkCollisions(platforms, bouncers);
    
    // Reset small velocities to zero
    if (Math.abs(this.velocityX) < 0.1) {
      this.velocityX = 0;
    }
    
    // Update flip animation
    if (this.isFlipping) {
      this.flipAngle += this.flipSpeed * this.flipDirection;
      
      // Complete a full rotation (360 degrees)
      if (Math.abs(this.flipAngle) >= 360) {
        this.isFlipping = false;
        this.flipAngle = 0;
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
      particle.alpha -= 0.02;
      
      // Remove faded particles
      if (particle.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
    
    // Update shield angle for animation
    if (this.hasShield) {
      this.shieldAngle += 0.05;
    }
  }

  moveLeft() {
    // Add a stronger acceleration for more responsive movement
    this.velocityX -= 1.2;
    this.velocityX = Math.max(this.velocityX, -this.maxSpeed);
    this.direction = -1;
  }

  moveRight() {
    // Add a stronger acceleration for more responsive movement
    this.velocityX += 1.2;
    this.velocityX = Math.min(this.velocityX, this.maxSpeed);
    this.direction = 1;
  }

  jump() {
    // Only jump if the jump key has been released since the last jump
    if (!this.jumpKeyReleased) {
      return;
    }
    
    // Wall jump has priority over regular jumps
    if (this.isTouchingWall && !this.isGrounded && this.wallJumpCooldown <= 0) {
      // Wall jump: push away from wall
      this.velocityY = this.wallJumpForce;
      this.velocityX = this.wallJumpPushForce * -this.wallDirection; // Push away from wall
      this.isJumping = true;
      this.jumpKeyReleased = false;
      this.jumpsRemaining = this.maxJumps - 1; // Reset jumps after wall jump
      this.wallJumpCooldown = this.maxWallJumpCooldown; // Set cooldown
      
      // Create wall jump effect particles
      this.createWallJumpParticles();
      return;
    }
    
    // Ground jump
    if (this.isGrounded || this.coyoteTimeCounter > 0) {
      // Normal jump from ground
      this.velocityY = this.jumpForce;
      this.isJumping = true;
      this.isGrounded = false;
      this.coyoteTimeCounter = 0; // Reset coyote time
      this.jumpsRemaining = this.maxJumps - 1; // Use one jump
      this.jumpKeyReleased = false; // Mark jump key as pressed
    } 
    // Air jumps
    else if (this.jumpsRemaining > 0) {
      // Air jump with slightly reduced power for each subsequent jump
      this.velocityY = this.jumpForce * (0.9 - (0.1 * (this.maxJumps - this.jumpsRemaining)));
      this.jumpsRemaining--;
      this.jumpKeyReleased = false;
      
      // Start flip animation for air jumps
      this.isFlipping = true;
      this.flipAngle = 0;
      this.flipDirection = this.direction; // Flip in the direction of movement
      
      // Create particles for effect
      this.createDoubleJumpParticles();
    }
  }
  
  /**
   * Method to handle player getting hurt
   * @param {number} damage - Amount of damage to apply
   */
  getHurt(damage) {
    // Check for invincibility
    if (this.isInvincible || this.invulnerableTimer > 0) {
      return false;
    }
    
    // Check for shield
    if (this.hasShield && this.shieldHits > 0) {
      this.shieldHits--;
      
      // Create shield impact effect
      this.createShieldImpactEffect();
      
      // Remove shield if no hits left
      if (this.shieldHits <= 0) {
        this.hasShield = false;
      }
      
      // Brief invulnerability after shield hit
      this.invulnerableTimer = 500;
      
      return false; // Damage blocked by shield
    }
    
    // Apply damage normally
    this.health -= damage;
    this.invulnerableTimer = this.maxInvulnerableTime;
    this.velocityX = this.knockbackForce * -this.direction;
    this.velocityY = -5;
    this.isDamaged = true;
    this.createHurtParticles();
    
    if (this.health <= 0) {
      this.die();
    }
    
    return true;
  }

  /**
   * Method to handle player death
   */
  die() {
    console.log("Player died!");
    // Reset player position
    this.x = 100;
    this.y = 300;
    
    // Reset velocity
    this.velocityX = 0;
    this.velocityY = 0;
    
    // Reset health (or decrement lives if you track those separately)
    this.health = this.maxHealth;
    
    // Create death effect
    this.createDeathParticles();
  }

  /**
   * Create particles for hurt effect
   */
  createHurtParticles() {
    // Create a burst of red particles
    const particleCount = 10;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i;
      
      this.particles.push({
        x: this.x + this.width / 2,
        y: this.y + this.height / 2,
        vx: Math.cos(angle) * 2,
        vy: Math.sin(angle) * 2,
        color: '#FF5555', // Red color
        alpha: 1,
        size: Math.random() * 3 + 2
      });
    }
  }

  /**
   * Create particles for death effect
   */
  createDeathParticles() {
    // Create a bigger explosion of particles
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i;
      const speed = 2 + Math.random() * 3;
      
      this.particles.push({
        x: this.x + this.width / 2,
        y: this.y + this.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: i % 3 === 0 ? '#FF5555' : (i % 3 === 1 ? '#FFFFFF' : '#5555FF'), // Red, white, blue
        alpha: 1,
        size: Math.random() * 4 + 3
      });
    }
  }
  
  // Method to handle key release
  releaseJumpKey() {
    this.jumpKeyReleased = true;
  }

  createDoubleJumpParticles() {
    // Create a burst of particles
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i;
      
      this.particles.push({
        x: this.x + this.width / 2,
        y: this.y + this.height / 2,
        vx: Math.cos(angle) * 2,
        vy: Math.sin(angle) * 2,
        color: `hsl(${Math.random() * 60 + 40}, 100%, 70%)`, // Yellow/orange colors
        alpha: 1,
        size: Math.random() * 4 + 2
      });
    }
  }
  
  // Shield impact effect
  createShieldImpactEffect() {
    const particleCount = 10;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i;
      
      this.particles.push({
        x: this.x + this.width / 2,
        y: this.y + this.height / 2,
        vx: Math.cos(angle) * 3,
        vy: Math.sin(angle) * 3,
        color: '#4169E1',
        alpha: 1,
        size: 4
      });
    }
  }
  
  // NEW METHOD for wall slide particles
  createWallSlideParticles() {
    // Create sliding dust particles
    const particleCount = 2;
    
    for (let i = 0; i < particleCount; i++) {
      // Determine particle position based on wall direction
      const particleX = this.wallDirection === -1 ? 
                        this.x : 
                        this.x + this.width;
      
      const particleY = this.y + this.height / 2 + Math.random() * (this.height / 2);
      
      // Create particles that move away from wall
      const angle = this.wallDirection === -1 ? 
                    Math.PI + (Math.random() * 0.5 - 0.25) : 
                    0 + (Math.random() * 0.5 - 0.25);
                    
      const speed = 0.5 + Math.random();
      
      this.particles.push({
        x: particleX,
        y: particleY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5, // Slight upward drift
        color: 'white', // White dust particles
        alpha: 0.7,
        size: Math.random() * 2 + 1
      });
    }
  }
  
  // NEW METHOD for wall jump particles
  createWallJumpParticles() {
    // Create an explosion of particles from the wall
    const particleCount = 10;
    
    // Determine particle position based on wall direction
    const particleX = this.wallDirection === -1 ? 
                      this.x : 
                      this.x + this.width;
    
    for (let i = 0; i < particleCount; i++) {
      // Create particles that mainly move away from wall
      const angle = this.wallDirection === -1 ? 
                    Math.PI + (Math.random() * 1 - 0.5) : 
                    0 + (Math.random() * 1 - 0.5);
                    
      const speed = 1 + Math.random() * 3;
      
      this.particles.push({
        x: particleX,
        y: this.y + Math.random() * this.height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1, // Additional upward force
        color: `hsl(${Math.random() * 40 + 200}, 100%, 70%)`, // Blue-ish colors
        alpha: 0.8,
        size: Math.random() * 3 + 1
      });
    }
  }
  
  // Method for bounce trail effect
  createBounceTrailEffect() {
    // Create a trail effect when player bounces
    const trailCount = 10;
    
    for (let i = 0; i < trailCount; i++) {
      // Create particles that follow player's upward trajectory
      const angle = Math.PI * 1.5 + (Math.random() * 0.4 - 0.2); // Mostly upward with slight variation
      const speed = 1 + Math.random() * 2;
      
      this.particles.push({
        x: this.x + Math.random() * this.width,
        y: this.y + this.height - 5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: `hsl(${Math.random() * 40 + 200}, 100%, 70%)`, // Blue-ish colors
        alpha: 0.8,
        size: Math.random() * 3 + 1
      });
    }
  }

  checkCollisions(platforms, bouncers = []) {
    // Store the previous position for better collision resolution
    const prevX = this.x;
    const prevY = this.y;
    
    // Store current active slope or moving platform, if any
    let activeSlope = null;
    let activeMovingPlatform = null;
    
    // First pass - check for slopes
    for (const platform of platforms) {
      if (platform.isSlope) {
        // Check if player is above the slope
        if (this.x + this.width > platform.x && 
            this.x < platform.x + platform.width) {
          
          // Calculate player's feet position
          const playerFeetY = this.y + this.height;
          
          // Calculate player's horizontal position relative to the slope
          const playerCenterX = this.x + (this.width / 2);
          const slopeProgress = (playerCenterX - platform.x) / platform.width;
          
          // Determine slope position (top, middle, bottom)
          if (slopeProgress < 0.15) {
            this.slopePosition = 'bottom';
          } else if (slopeProgress > 0.85) {
            this.slopePosition = 'top';
          } else {
            this.slopePosition = 'middle';
          }
          
          // Check for hanging off the edges - THIS IS THE CRITICAL PART
          // Calculate how much of player is hanging off edges
          let leftHangAmount = 0;
          let rightHangAmount = 0;
          
          if (this.x < platform.x) {
            // Hanging off left edge
            leftHangAmount = (platform.x - this.x) / this.width;
          }
          
          if (this.x + this.width > platform.x + platform.width) {
            // Hanging off right edge
            rightHangAmount = (this.x + this.width - platform.x - platform.width) / this.width;
          }
          
          // Set hanging direction and amount
          if (leftHangAmount > rightHangAmount) {
            this.hangingDirection = -1; // Hanging left
            this.hangingAmount = leftHangAmount;
          } else if (rightHangAmount > 0) {
            this.hangingDirection = 1; // Hanging right
            this.hangingAmount = rightHangAmount;
          }
          
          // Get the Y position on the slope at player's position
          // Need to get slope Y position at both left and right edge of player
          const leftEdgeX = Math.max(this.x, platform.x);
          const rightEdgeX = Math.min(this.x + this.width, platform.x + platform.width);
          
          const leftSlopeY = platform.getSlopeYAtX(leftEdgeX);
          const rightSlopeY = platform.getSlopeYAtX(rightEdgeX);
          
          // Use the higher point of the slope under the player
          const slopeY = platform.direction === 'right' ? 
                          Math.min(leftSlopeY, rightSlopeY) : 
                          Math.min(leftSlopeY, rightSlopeY);
          
          // Check if player is on or slightly above/below the slope
          const slopeTolerance = 5; // Pixels of tolerance
          
          if (playerFeetY >= slopeY - slopeTolerance && 
              playerFeetY <= slopeY + slopeTolerance) {
            
            // Player is on the slope
            this.y = slopeY - this.height;
            this.isGrounded = true;
            this.isOnSlope = true;
            this.slopeAngle = platform.angle * (platform.direction === 'right' ? 1 : -1);
            activeSlope = platform;
            this.activePlatform = platform;
            
            // Reset jumps when grounded
            this.jumpsRemaining = this.maxJumps;
            
            // Apply slight Y velocity when on slope to stick to it
            if (Math.abs(this.velocityX) > 0.5) {
              // Calculate slope angle factor (higher angle = higher push down)
              const pushFactor = Math.abs(Math.sin(platform.angle * Math.PI / 180)) * 0.8;
              this.velocityY = pushFactor;
            }
            
            // If the slope is a moving platform, track it for player movement
            if (platform.isMoving) {
              activeMovingPlatform = platform;
              this.wasOnMovingPlatform = true;
              this.lastMovingPlatformDeltaX = platform.deltaX || 0;
              this.lastMovingPlatformDeltaY = platform.deltaY || 0;
            }
          }
          // If player is below the slope, handle collision
          else if (playerFeetY > slopeY + slopeTolerance && 
                  this.y < slopeY && 
                  this.velocityY > 0) {
            
            // Place player on the slope
            this.y = slopeY - this.height;
            this.velocityY = 0;
            this.isGrounded = true;
            this.isOnSlope = true;
            this.slopeAngle = platform.angle * (platform.direction === 'right' ? 1 : -1);
            activeSlope = platform;
            this.activePlatform = platform;
            
            // Reset jumps when grounded
            this.jumpsRemaining = this.maxJumps;
            
            // If the slope is a moving platform, track it for player movement
            if (platform.isMoving) {
              activeMovingPlatform = platform;
              this.wasOnMovingPlatform = true;
              this.lastMovingPlatformDeltaX = platform.deltaX || 0;
              this.lastMovingPlatformDeltaY = platform.deltaY || 0;
            }
          }
        }
      }
    }
    
    // If we're not on a slope, perform regular platform collision
    if (!this.isOnSlope) {
      // Check for ground below (small ray cast)
      const groundCheckDistance = 3; // Small distance below player
      let isOnGround = false;
      
      for (const platform of platforms) {
        // Skip slopes as we handled them separately
        if (platform.isSlope) continue;
        
        // Skip one-way platforms if dropping through
        if (platform.isOneWay && this.isDropping) continue;
        
        // Ground check ray - detect ground more precisely
        if (this.x + 5 < platform.x + platform.width && 
            this.x + this.width - 5 > platform.x) {
          
          const playerBottom = this.y + this.height;
          const platformTop = platform.y;
          
          // For one-way platforms, only consider them if moving downward
          if (platform.isOneWay) {
            if (this.velocityY > 0 && 
                playerBottom <= platformTop + 5 && 
                playerBottom >= platformTop - 2) {
              
              isOnGround = true;
              this.y = platformTop - this.height; // Snap to top
              this.velocityY = 0;
              this.activePlatform = platform;
              
              if (platform.isMoving) {
                activeMovingPlatform = platform;
                this.wasOnMovingPlatform = true;
                this.lastMovingPlatformDeltaX = platform.deltaX || 0;
                this.lastMovingPlatformDeltaY = platform.deltaY || 0;
              }
              break;
            }
          } else if (playerBottom >= platformTop - 2 && 
                    playerBottom <= platformTop + groundCheckDistance) {
            // Regular platforms - standard ground detection  
            isOnGround = true;
            this.activePlatform = platform;
            
            if (platform.isMoving) {
              activeMovingPlatform = platform;
              this.wasOnMovingPlatform = true;
              this.lastMovingPlatformDeltaX = platform.deltaX || 0;
              this.lastMovingPlatformDeltaY = platform.deltaY || 0;
            }
            break;
          }
        }
      }
      
      // Apply ground state before collision resolution
      if (isOnGround) {
        this.isGrounded = true;
        this.canDoubleJump = false; // Reset double jump when on ground
        this.jumpsRemaining = this.maxJumps; // Reset jumps when grounded
      }
      
      // Predictive collision detection for high speeds
      const futureX = this.x + this.velocityX;
      const futureY = this.y + this.velocityY;
      
      // Broad phase - find platforms we might collide with
      const potentialCollisions = platforms.filter(platform => {
        // Skip slopes as we handled them separately
        if (platform.isSlope) return false;
        
        // Handle one-way platforms specially
        if (platform.isOneWay) {
          // Skip if currently dropping through
          if (this.isDropping) return false;
          
          // Only check collision if:
          // 1. Player is above the platform
          // 2. Player is moving downward
          const isAbove = this.y + this.height <= platform.y + 2; // Small tolerance
          const isMovingDown = this.velocityY > 0;
          
          return isAbove && isMovingDown && 
                (futureX < platform.x + platform.width &&
                 futureX + this.width > platform.x &&
                 futureY + this.height > platform.y &&
                 futureY < platform.y + platform.height);
        }
        
        return (futureX < platform.x + platform.width &&
                futureX + this.width > platform.x &&
                futureY < platform.y + platform.height &&
                futureY + this.height > platform.y);
      });
      
      // Narrow phase - detailed collision resolution
      for (const platform of potentialCollisions) {
        // For one-way platforms, only check collision from above
        if (platform.isOneWay) {
          // Only check if player is falling onto the platform
          if (this.velocityY > 0 && this.y + this.height <= platform.y + 2) {
            this.y = platform.y - this.height;
            this.velocityY = 0;
            this.isGrounded = true;
            this.isJumping = false;
            this.canDoubleJump = false; // Reset double jump
            this.jumpsRemaining = this.maxJumps; // Reset jumps
            this.activePlatform = platform;
            
            // If it's a moving platform, track it
            if (platform.isMoving) {
              activeMovingPlatform = platform;
              this.wasOnMovingPlatform = true;
              this.lastMovingPlatformDeltaX = platform.deltaX || 0;
              this.lastMovingPlatformDeltaY = platform.deltaY || 0;
            }
          }
          continue; // Skip other collision checks for one-way platforms
        }
        
        // X-axis collision check for regular platforms
        if (futureX + this.width > platform.x && 
            futureX < platform.x + platform.width &&
            this.y + this.height > platform.y + 2 && // Small tolerance
            this.y < platform.y + platform.height - 2) {
          
          // If moving right and hitting left side of platform
          if (this.velocityX > 0 && this.x + this.width <= platform.x + 2) {
            this.x = platform.x - this.width;
            this.velocityX = 0;
            
            // Set wall touching state for right wall
            this.isTouchingWall = true;
            this.wallDirection = 1; // Right wall
          } 
          // If moving left and hitting right side of platform
          else if (this.velocityX < 0 && this.x >= platform.x + platform.width - 2) {
            this.x = platform.x + platform.width;
            this.velocityX = 0;
            
            // Set wall touching state for left wall
            this.isTouchingWall = true;
            this.wallDirection = -1; // Left wall
          }
        }
        
        // Y-axis collision check for regular platforms
        if (futureY + this.height > platform.y && 
            futureY < platform.y + platform.height &&
            this.x + this.width > platform.x + 2 && 
            this.x < platform.x + platform.width - 2) {
          
          // If moving down and hitting top of platform
          if (this.velocityY > 0 && this.y + this.height <= platform.y + 5) {
            this.y = platform.y - this.height;
            this.velocityY = 0;
            this.isGrounded = true;
            this.isJumping = false;
            this.canDoubleJump = false; // Reset double jump
            this.jumpsRemaining = this.maxJumps; // Reset jumps
            this.activePlatform = platform;
            
            // If it's a moving platform, track it
            if (platform.isMoving) {
              activeMovingPlatform = platform;
              this.wasOnMovingPlatform = true;
              this.lastMovingPlatformDeltaX = platform.deltaX || 0;
              this.lastMovingPlatformDeltaY = platform.deltaY || 0;
            }
          } 
          // If moving up and hitting bottom of platform
          else if (this.velocityY < 0 && this.y >= platform.y + platform.height - 5) {
            this.y = platform.y + platform.height;
            this.velocityY = 0;
          }
        }
      }
    }
    
    // Apply slope physics to movement when on a slope
    if (this.isOnSlope && activeSlope) {
      // For steeper slopes, reduce horizontal speed
      const slopeSpeedFactor = 1 - (Math.abs(Math.sin(this.slopeAngle * Math.PI / 180)) * 0.4);
      
      // Apply different friction on slopes
      const slopeFriction = this.isGrounded ? 0.92 : 0.98; // Less friction on slopes
      this.velocityX *= slopeFriction;
      
      // IMPORTANT: Check for hanging off edges at the top of slope
      if (this.slopePosition === 'top' && this.hangingAmount > 0.5) {
        // We're hanging more than 50% off the top - apply force in hanging direction
        const edgePushForce = 0.5; // Strength of the push
        
        // Apply force in the hanging direction
        this.velocityX += this.hangingDirection * edgePushForce;
        
        // Visual feedback
        if (Math.random() < 0.2) { // Only occasionally to avoid too many particles
          this.particles.push({
            x: this.x + this.width / 2,
            y: this.y + this.height - 5,
            vx: this.hangingDirection * 1,
            vy: -0.5,
            color: 'yellow', // Yellow particles for falling effect
            alpha: 0.8,
            size: 2
          });
        }
      } else {
        // Regular slope physics - add sliding
        if (this.isGrounded) {
          // Calculate sliding force - note the correct sign to make player slide down
          const slideForce = -Math.sin(this.slopeAngle * Math.PI / 180) * 0.3; // Negative sign for correct direction
          
          // Apply sliding force
          this.velocityX += slideForce;
          
          // Increase sliding on steeper slopes
          if (Math.abs(this.slopeAngle) > 25) {
            // Extra sliding multiplier for steep slopes
            this.velocityX *= 1.05;
          }
        }
      }
    }
    
    // Apply moving platform physics - move with the platform
    if (activeMovingPlatform) {
      if (activeMovingPlatform.deltaX) {
        // Apply X movement, but only if it's not tiny
        if (Math.abs(activeMovingPlatform.deltaX) >= 0.05) {
          this.x += activeMovingPlatform.deltaX;
        }
      }
      
      if (activeMovingPlatform.deltaY) {
        // For Y movement, only move the player if they're grounded
        // This prevents the player from being pushed through ceilings
        if (this.isGrounded && activeMovingPlatform.deltaY < 0) {
          this.y += activeMovingPlatform.deltaY;
        }
        // If platform is moving down, always move player with it
        else if (activeMovingPlatform.deltaY > 0) {
          this.y += activeMovingPlatform.deltaY;
        }
      }
    }
    
    // World boundaries - check for wall touching on world edges too
    if (this.x < 0) {
      this.x = 0;
      this.velocityX = 0;
      
      // Mark as touching left wall
      this.isTouchingWall = true;
      this.wallDirection = -1;
    }
    
    if (this.x + this.width > 800) { // Using canvas width
      this.x = 800 - this.width;
      this.velocityX = 0;
      
      // Mark as touching right wall
      this.isTouchingWall = true;
      this.wallDirection = 1;
    }
    
    // Bottom boundary
    if (this.y + this.height > 600) { // Using canvas height
      this.y = 600 - this.height;
      this.velocityY = 0;
      this.isGrounded = true;
      this.isJumping = false;
      this.canDoubleJump = false; // Reset double jump when on ground
      this.jumpsRemaining = this.maxJumps; // Reset jumps
    }
    
    // Falling off edge detection - allow jump grace period
    const wasGrounded = this.isGrounded || this.coyoteTimeCounter > 0;
    if (wasGrounded && !this.isGrounded) {
      // Add a small coyote time (grace period for jumping after leaving platform)
      this.coyoteTimeCounter = 7; // Frames of coyote time
    } else if (this.coyoteTimeCounter > 0) {
      this.coyoteTimeCounter--;
      if (!this.isGrounded) {
        this.isGrounded = true; // Still considered grounded during coyote time
      }
    }
    
    // After all platform collisions are handled, check bouncer collisions
    const currentTime = performance.now();
    for (const bouncer of bouncers) {
      // First check if collision is possible without modifying the player
      if (bouncer.checkCollision(this)) {
        // Then check if we can bounce (cooldown check)
        if (bouncer.bounce(this, currentTime)) {
          // Only apply bounce effects if both checks passed
          this.velocityY = bouncer.bounceForce;
          this.canDoubleJump = true;
          this.isJumping = true;
          this.isGrounded = false;
          // Create trail effect
          this.createBounceTrailEffect();
        }
      }
    }
  }
  
  // Draw powerup effects
  drawPowerupEffects(ctx) {
    // Shield visual
    if (this.hasShield) {
      ctx.strokeStyle = '#4169E1';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5 + Math.sin(this.shieldAngle) * 0.2;
      
      // Draw shield bubble
      ctx.beginPath();
      ctx.ellipse(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.width * 0.7,
        this.height * 0.6,
        0, 0, Math.PI * 2
      );
      ctx.stroke();
      
      // Draw shield hit indicators
      for (let i = 0; i < this.shieldHits; i++) {
        const angle = (Math.PI * 2 / 3) * i + this.shieldAngle;
        const x = this.x + this.width / 2 + Math.cos(angle) * this.width * 0.6;
        const y = this.y + this.height / 2 + Math.sin(angle) * this.height * 0.5;
        
        ctx.fillStyle = '#4169E1';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.globalAlpha = 1;
    }
    
    // Invincibility glow
    if (this.isInvincible) {
      const glowSize = 5 + Math.sin(Date.now() * 0.01) * 3;
      const gradient = ctx.createRadialGradient(
        this.x + this.width / 2,
        this.y + this.height / 2,
        0,
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.width
      );
      gradient.addColorStop(0, 'rgba(255, 215, 0, 0.5)');
      gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(
        this.x - glowSize,
        this.y - glowSize,
        this.width + glowSize * 2,
        this.height + glowSize * 2
      );
    }
    
    // Magnet field visual
    if (this.magnetRadius > 0) {
      ctx.strokeStyle = '#FFB300';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      ctx.setLineDash([5, 5]);
      
      ctx.beginPath();
      ctx.arc(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.magnetRadius,
        0, Math.PI * 2
      );
      ctx.stroke();
      
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }
  }

  draw(ctx) {
    // Save the canvas state before transformations
    ctx.save();
    
    // Apply scale transformation if size is changed
    if (this.scale !== 1) {
      const centerX = this.x + this.width / 2;
      const centerY = this.y + this.height / 2;
      ctx.translate(centerX, centerY);
      ctx.scale(this.scale, this.scale);
      ctx.translate(-centerX, -centerY);
    }
    
    // Flashing effect during invulnerability
    if (this.invulnerableTimer > 0) {
      if (Math.floor(this.invulnerableTimer / 100) % 2 === 0) {
        ctx.globalAlpha = 0.5; // Blink by changing opacity
      }
    }
    
    // Draw powerup effects behind player
    this.drawPowerupEffects(ctx);
    
    if (this.isFlipping) {
      // Calculate the center of the player for rotation
      const centerX = this.x + this.width / 2;
      const centerY = this.y + this.height / 2;
      
      // Translate to the center of the player
      ctx.translate(centerX, centerY);
      
      // Rotate based on the current flip angle (convert to radians)
      ctx.rotate(this.flipAngle * Math.PI / 180);
      
      // Translate back to draw the player at the right position
      ctx.translate(-this.width / 2, -this.height / 2);
      
      // Draw the flipping player - change color if damaged
      ctx.fillStyle = this.isDamaged ? 'red' : 'blue';
      ctx.fillRect(0, 0, this.width, this.height);
      
      // Draw direction indicator (eye)
      ctx.fillStyle = 'white';
      if (this.direction === 1) {
        ctx.fillRect(this.width - 10, 10, 5, 5);
      } else {
        ctx.fillRect(5, 10, 5, 5);
      }
    } else {
      // Draw normal player - change color based on state
      let playerColor = 'blue';
      
      if (this.isDamaged) {
        playerColor = 'red';
      } else if (this.isTouchingWall && !this.isGrounded) {
        playerColor = 'purple'; // Purple when wall sliding
      }
      
      ctx.fillStyle = playerColor;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      
      // Draw direction indicator (eye)
      ctx.fillStyle = 'white';
      if (this.direction === 1) {
        ctx.fillRect(this.x + this.width - 10, this.y + 10, 5, 5);
      } else {
        ctx.fillRect(this.x + 5, this.y + 10, 5, 5);
      }
      
      // Visual indicator for double jump availability (optional)
      if (!this.isGrounded && this.canDoubleJump) {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height - 5, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Visual indicator for wall slide (optional)
      if (this.isTouchingWall && !this.isGrounded) {
        // Draw little dust particles
        ctx.fillStyle = 'white';
        
        // Position based on which wall we're touching
        const particleX = this.wallDirection === -1 ? 
                          this.x : 
                          this.x + this.width;
        
        for (let i = 0; i < 2; i++) {
          const particleY = this.y + this.height / 2 + (Math.random() * this.height / 2);
          ctx.beginPath();
          ctx.arc(particleX, particleY, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Visual indicator for slope state (optional, for debugging)
      if (this.isOnSlope) {
        // Different colors for different slope positions
        if (this.slopePosition === 'top') {
          ctx.fillStyle = 'red'; // Red for top
        } else if (this.slopePosition === 'bottom') {
          ctx.fillStyle = 'green'; // Green for bottom
        } else {
          ctx.fillStyle = 'orange'; // Orange for middle
        }
        
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + 5, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Special indicator for hanging direction
        if (this.hangingAmount > 0.5) {
          // Draw an arrow showing hanging direction
          const arrowX = this.x + this.width / 2 + (this.hangingDirection * 8);
          
          ctx.fillStyle = 'yellow';
          ctx.beginPath();
          ctx.moveTo(this.x + this.width / 2, this.y + 10);
          ctx.lineTo(arrowX, this.y + 10);
          ctx.lineTo(arrowX, this.y + 7);
          ctx.lineTo(this.x + this.width / 2 + (this.hangingDirection * 13), this.y + 13);
          ctx.lineTo(arrowX, this.y + 19);
          ctx.lineTo(arrowX, this.y + 16);
          ctx.lineTo(this.x + this.width / 2, this.y + 16);
          ctx.closePath();
          ctx.fill();
        }
      }
      
      // Visual indicator for dropping through platforms (optional)
      if (this.isDropping) {
        ctx.fillStyle = 'cyan';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height - 5, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Visual indicator for moving platform (optional)
      if (this.wasOnMovingPlatform) {
        ctx.fillStyle = 'pink';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + 15, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Visual indicator for remaining jumps
      ctx.fillStyle = 'cyan';
      for (let i = 0; i < this.jumpsRemaining; i++) {
        ctx.beginPath();
        ctx.arc(this.x + 5 + i * 8, this.y - 5, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Restore the canvas state
    ctx.restore();
    
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

    // Draw slope debug info (optional)
    if (this.isOnSlope) {
      ctx.font = '10px Arial';
      ctx.fillStyle = 'white';
      
      // Show slope angle and position
      const slopeInfo = `${this.slopeAngle.toFixed(0)}° ${this.slopePosition}`;
      ctx.fillText(slopeInfo, this.x, this.y - 5);
      
      // Show hanging indicator if more than 50% off
      if (this.hangingAmount > 0.5) {
        ctx.fillStyle = 'yellow';
        ctx.fillText(`${Math.round(this.hangingAmount * 100)}% ${this.hangingDirection > 0 ? 'right' : 'left'}`, this.x, this.y - 15);
      }
    }
    
    // Draw wall slide/jump debug info
    if (this.isTouchingWall && !this.isGrounded) {
      ctx.font = '10px Arial';
      ctx.fillStyle = 'white';
      
      // Show wall direction
      const wallInfo = `Wall ${this.wallDirection > 0 ? 'Right' : 'Left'}`;
      ctx.fillText(wallInfo, this.x, this.y - 5);
      
      // Show wall jump cooldown if active
      if (this.wallJumpCooldown > 0) {
        ctx.fillStyle = 'orange';
        ctx.fillText(`Cooldown: ${this.wallJumpCooldown}`, this.x, this.y - 15);
      }
    }
    
    // Draw health/invulnerability info (optional)
    if (this.invulnerableTimer > 0) {
      ctx.font = '10px Arial';
      ctx.fillStyle = 'red';
      ctx.fillText(`Invulnerable: ${Math.ceil(this.invulnerableTimer / 100) / 10}s`, this.x, this.y - 25);
    }
    
    // Draw health indicator
    ctx.font = '10px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`Health: ${this.health}/${this.maxHealth}`, this.x, this.y - 35);
  }
}

// Export the Player class
export { Player };
