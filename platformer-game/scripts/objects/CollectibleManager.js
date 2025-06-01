// CollectibleManager.js - Manages all collectible items in the game

import { Collectible, Coin, BigCoin, Leaf, Key, Gem } from './Collectible.js';

export class CollectibleManager {
  constructor() {
    this.collectibles = [];
    this.collectedCount = {
      coin: 0,
      bigcoin: 0,
      leaf: 0,
      key: 0,
      gem: 0
    };
  }
  
  // Create a collectible based on type
  createCollectible(type, x, y, options = {}) {
    let collectible;
    
    switch (type) {
      case 'coin':
        collectible = new Coin(x, y);
        break;
        
      case 'bigcoin':
        collectible = new BigCoin(x, y);
        break;
        
      case 'leaf':
        collectible = new Leaf(x, y, options.powerupType || 'speed');
        break;
        
      case 'key':
        collectible = new Key(x, y);
        break;
        
      case 'gem':
        collectible = new Gem(x, y);
        break;
        
      default:
        collectible = new Collectible(x, y, 24, 24, type);
    }
    
    this.collectibles.push(collectible);
    return collectible;
  }
  
  // Update all collectibles
  update(deltaTime, player, game) {
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const collectible = this.collectibles[i];
      
      // Update collectible animation
      collectible.update(deltaTime);
      
      // Check collision with player
      if (collectible.checkCollision(player)) {
        collectible.collect(player, game);
        this.collectedCount[collectible.type]++;
      }
      
      // Remove inactive collectibles
      if (!collectible.isActive) {
        this.collectibles.splice(i, 1);
      }
    }
  }
  
  // Draw all collectibles
  draw(ctx, camera) {
    for (const collectible of this.collectibles) {
      collectible.draw(ctx, camera);
    }
  }
  
  // Create collectibles from level data
  createCollectiblesFromLevel(levelData) {
    // Clear existing collectibles
    this.collectibles = [];
    
    // Reset collected counts
    for (const key in this.collectedCount) {
      this.collectedCount[key] = 0;
    }
    
    // Create collectibles from level data
    if (levelData.collectibles) {
      for (const collectibleData of levelData.collectibles) {
        this.createCollectible(
          collectibleData.type,
          collectibleData.x,
          collectibleData.y,
          collectibleData.options || {}
        );
      }
    }
  }
  
  // Get total number of active collectibles
  getActiveCount() {
    return this.collectibles.filter(c => c.isActive && !c.isCollected).length;
  }
  
  // Get count of collected items by type
  getCollectedCount(type) {
    if (type) {
      return this.collectedCount[type] || 0;
    }
    
    // Return total collected
    let total = 0;
    for (const count of Object.values(this.collectedCount)) {
      total += count;
    }
    return total;
  }
  
  // Create a pattern of collectibles (useful for level design)
  createPattern(pattern, startX, startY, spacing = 30) {
    switch (pattern) {
      case 'line':
        // Create a horizontal line of coins
        for (let i = 0; i < 5; i++) {
          this.createCollectible('coin', startX + i * spacing, startY);
        }
        break;
        
      case 'arc':
        // Create an arc of coins
        for (let i = 0; i < 7; i++) {
          const angle = (i - 3) * 0.3;
          const x = startX + i * spacing;
          const y = startY - Math.cos(angle) * 50;
          this.createCollectible('coin', x, y);
        }
        break;
        
      case 'circle':
        // Create a circle of coins
        const radius = 50;
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const x = startX + Math.cos(angle) * radius;
          const y = startY + Math.sin(angle) * radius;
          this.createCollectible('coin', x, y);
        }
        break;
        
      case 'diamond':
        // Create a diamond shape with a gem in the center
        this.createCollectible('gem', startX, startY);
        const positions = [
          [0, -30], [30, 0], [0, 30], [-30, 0]
        ];
        for (const [dx, dy] of positions) {
          this.createCollectible('coin', startX + dx, startY + dy);
        }
        break;
        
      case 'powerup':
        // Create a powerup with surrounding coins
        this.createCollectible('leaf', startX, startY);
        const coinPositions = [
          [-40, 0], [40, 0], [0, -40], [0, 40]
        ];
        for (const [dx, dy] of coinPositions) {
          this.createCollectible('coin', startX + dx, startY + dy);
        }
        break;
    }
  }
  
  // Clear all collectibles
  clearCollectibles() {
    this.collectibles = [];
  }
  
  // Get collectibles within a certain area (useful for optimization)
  getCollectiblesInArea(x, y, width, height) {
    return this.collectibles.filter(collectible => {
      return collectible.x + collectible.width > x &&
             collectible.x < x + width &&
             collectible.y + collectible.height > y &&
             collectible.y < y + height;
    });
  }
  
  // Debug method to show all collectible positions
  debugDraw(ctx, camera) {
    ctx.font = '10px Arial';
    ctx.fillStyle = 'white';
    
    for (const collectible of this.collectibles) {
      if (!collectible.isActive) continue;
      
      const x = collectible.x - camera.x;
      const y = collectible.y - camera.y - 10;
      
      ctx.fillText(`${collectible.type}`, x, y);
    }
  }
}
