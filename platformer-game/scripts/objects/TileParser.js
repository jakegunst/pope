// TileParser.js - Converts tile-based levels into game objects

import { Platform } from './platform.js';
import { Collectible } from './Collectible.js';

export class TileParser {
  constructor(tileSize = 32) {
    this.tileSize = tileSize;
    
    // Define what each character represents - UPDATED TO MATCH YOUR USAGE
    this.tileDefinitions = {
      // Terrain
      'G': { type: 'ground', solid: true },
      'P': { type: 'platform', solid: true },
      'T': { type: 'one-way-platform', solid: false, oneWay: true }, // Pass through from below
      'S': { type: 'slope', solid: true, slope: true },
      'M': { type: 'moving-platform-down', solid: true, moving: true },
      'U': { type: 'moving-platform-up', solid: true, moving: true },
      
      // Hazards
      'B': { type: 'bottomless-pit', hazard: true, fatal: true },
      'K': { type: 'spike', hazard: true },
      'D': { type: 'destructible', solid: true, breakable: true },
      
      // Collectibles
      'C': { type: 'coin', collectible: true },
      'L': { type: 'leaf', collectible: true }, // Power-up
      
      // Enemies (store position for enemy spawning)
      'WALKER': { type: 'enemy', enemyType: 'walker' },
      'FLYER': { type: 'enemy', enemyType: 'flyer' },
      'JUMPER': { type: 'enemy', enemyType: 'jumper' },
      'SHOOTER': { type: 'enemy', enemyType: 'shooter' },
      
      // Special
      'X': { type: 'player-start' },
      'E': { type: 'exit' }, // Level exit
      ' ': { type: 'empty' }
    };
    
    // Colors for different tile types - UPDATED
    this.tileColors = {
      'ground': '#8B4513',
      'platform': '#4CAF50',
      'one-way-platform': '#00BFFF',
      'slope': '#FFA500',
      'moving-platform-down': '#FF4081',
      'moving-platform-up': '#E91E63',
      'bottomless-pit': '#000000',
      'spike': '#FF0000',
      'destructible': '#DEB887'
    };
  }
  
  /**
   * Parse a tile-based level into game objects
   * @param {Object} levelData - The level data with tile array
   * @returns {Object} Parsed level with platforms, collectibles, enemies, etc.
   */
  parseLevel(levelData) {
    const parsed = {
      name: levelData.name || 'Untitled Level',
      width: levelData.width * this.tileSize,
      height: levelData.height * this.tileSize,
      playerStart: null,
      platforms: [],
      collectibles: [],
      enemies: [],
      hazards: [],
      background: levelData.background || '#87CEEB'
    };
    
    // Process the tile data
    const tiles = levelData.data;
    
    for (let y = 0; y < tiles.length; y++) {
      const row = tiles[y];
      
      for (let x = 0; x < row.length; x++) {
        const char = row[x];
        
        // Skip empty spaces
        if (char === ' ') continue;
        
        // Calculate pixel position
        const pixelX = x * this.tileSize;
        const pixelY = y * this.tileSize;
        
        // Check for multi-character tokens (like "WALKER")
        let token = char;
        let tokenLength = 1;
        
        // Look for known multi-character tokens
        const possibleTokens = ['WALKER', 'FLYER', 'JUMPER', 'SHOOTER'];
        for (const possible of possibleTokens) {
          if (row.substr(x, possible.length) === possible) {
            token = possible;
            tokenLength = possible.length;
            break;
          }
        }
        
        // Get tile definition
        const tileDef = this.tileDefinitions[token];
        
        if (!tileDef) {
          console.warn(`Unknown tile type: ${token} at (${x}, ${y})`);
          continue;
        }
        
        // Process based on tile type
        if (tileDef.type === 'player-start') {
          parsed.playerStart = { x: pixelX, y: pixelY };
        }
        else if (tileDef.solid || tileDef.oneWay) {
          // Create platform
          const platform = this.createPlatform(
            pixelX, pixelY, 
            this.tileSize * tokenLength, this.tileSize, 
            tileDef, x, y, tiles
          );
          if (platform) {
            parsed.platforms.push(platform);
          }
        }
        else if (tileDef.collectible) {
          // Create collectible
          const collectible = {
            type: this.getCollectibleType(token),
            x: pixelX + this.tileSize / 2 - 12, // Center the collectible
            y: pixelY + this.tileSize / 2 - 12,
            options: this.getCollectibleOptions(token)
          };
          parsed.collectibles.push(collectible);
        }
        else if (tileDef.type === 'exit') {
          // Create exit as a special collectible or marker
          parsed.collectibles.push({
            type: 'exit',
            x: pixelX,
            y: pixelY,
            options: { isExit: true }
          });
          
          // Also store exit position
          parsed.exitPosition = { x: pixelX, y: pixelY };
        }
        else if (tileDef.hazard) {
          // Create hazard based on type
          let hazardType = tileDef.type;
          
          // Map tile types to hazard types
          if (tileDef.type === 'spike') {
            hazardType = 'spike'; // K = spike
          } else if (tileDef.type === 'bottomless-pit') {
            hazardType = 'bottomless-pit'; // B = bottomless pit
          }
          
          parsed.hazards.push({
            type: hazardType,
            x: pixelX,
            y: pixelY,
            width: this.tileSize,
            height: this.tileSize
          });
        }
        
        // Skip ahead if we processed a multi-character token
        if (tokenLength > 1) {
          x += tokenLength - 1;
        }
      }
    }
    
    // Merge adjacent platforms for optimization
    parsed.platforms = this.mergePlatforms(parsed.platforms);
    
    // If no player start was specified, use default
    if (!parsed.playerStart) {
      parsed.playerStart = levelData.playerStart || { x: 100, y: 100 };
    }
    
    return parsed;
  }
  
  /**
   * Create a platform from tile data
   */
  createPlatform(x, y, width, height, tileDef, tileX, tileY, tiles) {
    let platformType = 'platform';
    const options = {};
    
    // Determine platform type based on tile definition
    switch (tileDef.type) {
      case 'ground':
      case 'bedrock':
        platformType = 'ground';
        break;
        
      case 'platform':
        platformType = 'platform';
        break;
        
      case 'one-way-platform':
        platformType = 'one-way';
        break;
        
      case 'slope':
        platformType = 'slope';
        options.angle = 30; // Default slope angle
        options.direction = 'right'; // Default direction
        break;
        
      case 'moving-platform-down':
        platformType = 'moving';
        options.moveX = 0;
        options.moveY = 100; // Move down first
        options.moveSpeed = 0.5;
        options.moveTiming = 'sine';
        options.movePhase = 0; // Start at top
        break;
        
      case 'moving-platform-up':
        platformType = 'moving';
        options.moveX = 0;
        options.moveY = -100; // Move up first
        options.moveSpeed = 0.5;
        options.moveTiming = 'sine';
        options.movePhase = 0.5; // Start at bottom
        break;
        
      case 'destructible':
        platformType = 'platform';
        options.destructible = true;
        options.health = 3;
        break;
    }
    
    return {
      x: x,
      y: y,
      width: width,
      height: height,
      type: platformType,
      color: this.tileColors[tileDef.type] || '#999999',
      options: options
    };
  }
  
  /**
   * Get collectible type from tile character
   */
  getCollectibleType(char) {
    const typeMap = {
      'C': 'coin',
      'L': 'leaf', // L = Power-up leaf
      'E': 'gem'   // E might be used for exit, but keeping gem support
    };
    return typeMap[char] || 'coin';
  }
  
  /**
   * Get collectible options based on type
   */
  getCollectibleOptions(char) {
    if (char === 'L') {
      // Randomly assign powerup types to leaves
      const powerupTypes = ['speed', 'jump', 'invincibility', 'magnetism', 'shield', 'doubleJump'];
      return {
        powerupType: powerupTypes[Math.floor(Math.random() * powerupTypes.length)]
      };
    }
    return {};
  }
  
  /**
   * Merge adjacent platforms of the same type for better performance
   */
  mergePlatforms(platforms) {
    const merged = [];
    const processed = new Set();
    
    for (let i = 0; i < platforms.length; i++) {
      if (processed.has(i)) continue;
      
      const platform = platforms[i];
      let width = platform.width;
      let height = platform.height;
      
      // Try to merge horizontally
      for (let j = i + 1; j < platforms.length; j++) {
        if (processed.has(j)) continue;
        
        const other = platforms[j];
        
        // Check if platforms are adjacent horizontally
        if (platform.y === other.y && 
            platform.height === other.height &&
            platform.type === other.type &&
            platform.color === other.color &&
            Math.abs((platform.x + width) - other.x) < 1) {
          
          // Merge
          width += other.width;
          processed.add(j);
        }
      }
      
      // Create merged platform
      merged.push({
        x: platform.x,
        y: platform.y,
        width: width,
        height: height,
        type: platform.type,
        color: platform.color,
        options: platform.options || {}
      });
      
      processed.add(i);
    }
    
    return merged;
  }
  
  /**
   * Debug: Draw the tile grid
   */
  drawTileGrid(ctx, camera, levelWidth, levelHeight) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = 0; x <= levelWidth; x += this.tileSize) {
      if (x >= camera.x && x <= camera.x + camera.width) {
        ctx.beginPath();
        ctx.moveTo(x - camera.x, 0);
        ctx.lineTo(x - camera.x, camera.height);
        ctx.stroke();
      }
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= levelHeight; y += this.tileSize) {
      if (y >= camera.y && y <= camera.y + camera.height) {
        ctx.beginPath();
        ctx.moveTo(0, y - camera.y);
        ctx.lineTo(camera.width, y - camera.y);
        ctx.stroke();
      }
    }
  }
}

// Export a default instance
export const tileParser = new TileParser();
