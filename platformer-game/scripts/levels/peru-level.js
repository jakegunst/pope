import { MovingPlatform } from '../objects/MovingPlatform.js';
import { Platform } from '../objects/platform.js';

class PeruLevel {
  constructor(game) {
    this.game = game;
    this.name = 'Peru';
    this.tileSize = 32;
    this.width = 400;  // tiles
    this.height = 180; // tiles
    this.pixelWidth = this.width * this.tileSize;  // 12,800 pixels
    this.pixelHeight = this.height * this.tileSize; // 5,760 pixels
    
    // Store references to game managers
    this.enemyManager = game.enemyManager;
    this.collectibleManager = game.collectibleManager;
    
    this.platforms = [];
    this.movingPlatforms = [];
    this.tiles = [];
    this.startPosition = { x: 100, y: 100 }; // Temporary position until we find 'X'
    
    // The level map data
    this.mapData = [
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                          K                     ",
      "                                                                                                                                                                                                                                                                                                                                                                                          D                 E   ",
      "                                                                                                                                                                                                                                                                                                                                                                                                            E   ",
      "                                                                                                                                                                                                                                                                                                                                                                                 C  TTTT                GGGGGGGG",
      "                                                                                                                                                                                                                                                                                                                                                                                                       G        ",
      "                                                                                                                                                                                                                                                                                                                                                                                                      G         ",
      "                                                                                                                                                                                                                                                                                                                                                                              C  W                      G          ",
      "                                                                                                                                                                                                                                                                                                                                                                                 P            K PPPPP           ",
      "                                                                                                                                                                                                                                                                                                                                                                                P             M                 ",
      "                                                                                                                                                                                                                                                                                                                                                                           C   P                                ",
      "                                                                                                                                                                                                                                                                                                                                                                    F            W   P                                 ",
      "                                                                                                                                                                                                                                                                                                                                                                             P                                  ",
      "                                                                                                                                                                                                                                                                                                                                                                        C   P                                   ",
      "                                                                                                                                                                                                                                                                                                                                                                           P                                    ",
      "                                                                                                                                                                                                                                                                                                                                                                          P                                     ",
      "                                                                                                                                                                                                                                                                                                                                                                         P                                      ",
      "                                                                                                                                                                                                                                                                                                                                                                    C  SP                                       ",
      "                                                                                                                                                                                                                                                                                                                                                                    GGGG                                        ",
      "                                                                                                                                                                                                                                                                                                                                                                    G                                           ",
      "                                                                                                                                                                                                                                                                                                                                                                   SG                                           ",
      "                                                                                                                                                                                                                                                                                                                                                          F          GGGG                                           ",
      "                                                                                                                                                                                                                                                                                                                                                                 G                                              ",
      "                                                                                                                                                                                                                                                                                            F                                                                         KKKK      C SG                                              ",
      "                                                                                                                                                                                                                                                                                                                                                    DDDD      GGGG                                              ",
      "                                                                                                                                                                                                                                                          C           C           C                                                                S          G                                                 ",
      "                                                                                                                                                                                                                                                                                              W                                                      S          SG                                                 ",
      "                                                                                                                                                                                                                                                        DDDD                    DDDD                                                             S         GGGG                                                 ",
      "                                                                                                                                                                                                                                                                                        W                                                        S     C    G                                                    ",
      "                                                                                                                                                                                                                                       PPPPPP                 KKKK        KKKK        KKKK                                                     S          SG                                                    ",
      "                                                                                                                                                                                                             L                                                                                                                                S         GGGG                                                    ",
      "                                                                                                                                                                                                                                                MMMM                MMMM                    MMMM                                             S                                                                  ",
      "                                                                                                                                                                                                                                      KK                                                             TTTTTTT                         C      S                                                                   ",
      "                                                                                                                                                                                                           TTTTT                     KK                                                                                                    S                                                                    ",
      "                                                                                                                                                                                                                                 PPPPPP                                                                                                 W       S                                                                     ",
      "                                                                                                                                                                                                                                                                                                                                C     PPPP                                                                      ",
      "                                                                                                                                                                                                                                                                                                                W                     P                                                                          ",
      "                                                                                                                                                                                                                                 KK                                                                           TTTT               PPPP                                                                           ",
      "                                                                                                                                                                                                                                KK                                                                                            W       P                                                                               ",
      "                                                                                                                                                                                                     TTTTT      TTTTT       PPPPP                                                                                     C     PPPP                                                                                ",
      "                                                                                                                                                                                                                                                                                                      TTTT                 P                                                                                    ",
      "                                                                                                                                        C                                                                                                                                                                                              PPPP                                                                                     ",
      "                                                                                                                                                                                                                           KK                                                                                       W       P                                                                                         ",
      "                                                                                                                                                                                                                          KK                                                                                  C   PPPP                                                                                          ",
      "                                                                                                                                                                                              TTTTTTTTTT          TTTTTTTTTT                                                                                     P                                                                                              ",
      "                                                                                                                                                 TTTTT                                                                                                                                            TTTTTTTTTTPPPPP                                                                                               ",
      "                                                                                                                                                                                       KKK                KKKKKK                                                                                                                                                                                                ",
      "                                                                                                                                                                   C                   P P                                                                                                                                                                                                                      ",
      "                                                                                                                                                                               KKKKK   P P                                                                                                                                                                                                                      ",
      "                                                                                                                                                                        KKKK   P   P   P P    W            W                                                                                                                                                                                                                ",
      "                                                                                                                                            TTTTT     KKKKK     PPPPPPPPPPPPPPP     PPP   PPPPPPPPPPPPPP                                                                                                                                                                                                        ",
      "                                                                                                                                         C                                                                                                                                                                                                                                                                      ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                       TTTTT                                                                                                                                                                                                                                                                    ",
      "                                                                                                                                C                                                                                                                                                                                                                                                                               ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                              TTTTTTTT                                                                                                                                                                                                                                                                          ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                  F                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                      C                                                                                                                                                                                                                                                                         ",
      "                                                                                                                              MMMMPPPPPPPP                                                                                                                                                                                                                                                                      ",
      "                                                                                                                                          P                                                                                                                                                                                                                                                                     ",
      "                                                                                                                                           P                                                                                                                                                                                                                                                                    ",
      "                                                                                                                                           P                                                                                                                                                                                                                                                                    ",
      "                                                                                                                                           P                                                                                                                                                                                                                                                                    ",
      "                                                                                                                                           P   W            W                                                                                                                                                                                                                                                          ",
      "                                                                                                                                            TTTTTTTTTTTTTTT                                                                                                                                                                                                                                                     ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                           TTTTT                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                  C                                                                                                                                                                                                                                             ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                TTTTT                                                                                                                                                                                                                                           ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                     TTTTT                                                                                                                                                                                                                                      ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                   TTTT                                                                                                                                                                                                                                         ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                TTTTT                                                                                                                                                                                                                                           ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                         W        W                                                                                                                                                                                                                                                     ",
      "                                                                                                                                                      TTTTTTTTTT                                                                                                                                                                                                                                                ",
      "                                                                                                                                         C         C                                                                                                                                                                                                                                                            ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                       TTTTT     TTTTT                                                                                                                                                                                                                                                          ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                            F                                                                                                                                                                                                                                                                                   ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                  TTTTT     TTTTT                                                                                                                                                                                                                                                               ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                                ",
      "                                                                                                                        GGGGGTTTTTTTTTTTTTTT                                                                                                                                                                                                                                                                    ",
      "                                                                                                                       G                                                                                                                                                                                                                                                                                        ",
      "                                                                                            C                         G                                                                                                                                                                                                                                                                                         ",
      "                                                                                                                     G                                                                                                                                                                                                                                                                                          ",
      "                                                                                                                    G                                                                                                                                                                                                                                                                                           ",
      "                                                                                                               W        G                                                                                                                                                                                                                                                                                            ",
      "                                                                                                PPPPMMMM    GGGGGGG                                                                                                                                                                                                                                                                                             ",
      "                                                                                               P                                                                                                                                                                                                                                                                                                                ",
      "                                                                                            C  P                                                                                                                                                                                                                                                                                                                ",
      "                                                                                               P                                                                                                                                                                                                                                                                                                                ",
      "                                                                                               P                                                                                                                                                                                                                                                                                                                ",
      "                                                                                           PPPP                                                                                                                                                                                                                                                                                                                 ",
      "                                                                                          P                                                                                                                                                                                                                                                                                                                     ",
      "                                                                                          P                                                                                                                                                                                                                                                                                                                     ",
      "                                                                                          P                                                                                                                                                                                                                                                                                                                     ",
      "                                                                                          P                                                                                                                                                                                                                                                                                                                     ",
      "                                                                                      PPPP                                                                                                                                                                                                                                                                                                                      ",
      "                                                                                  C  P                                                                                                                                                                                                                                                                                                                          ",
      "                                                                                     P                                                                                                                                                                                                                                                                                                                          ",
      "                                                                                     P                                                                                                                                                                                                                                                                                                                          ",
      "                                                              F          F              PPPPP                                                                                                                                                                                                                                                                                                                           ",
      "                                                                            GGGG                                                                                                                                                                                                                                                                                                                                ",
      "                                                                           G                                                                                                                                                                                                                                                                                                                                    ",
      "                                                                          G                                                                                                                                                                                                                                                                                                                                     ",
      "                                                                         G                                                                                                                                                                                                                                                                                                                                      ",
      "                                                                        G                                                                                                                                                                                                                                                                                                                                       ",
      "                                                                       G                                                                                                                                                                                                                                                                                                                                        ",
      "                                          C                           G                                                                                                                                                                                                                                                                                                                                         ",
      "                                                            GGGGGGGGGG                                                                                                                                                                                                                                                                                                                                          ",
      "                                                           G                                                                                                                                                                                                                                                                                                                                                    ",
      "                                                  KKK     G                                                                                                                                                                                                                                                                                                                                                     ",
      "                                  GGGGGG     GGGGGGGGGGGGG                                                                                                                                                                                                                                                                                                                                                      ",
      "                                 G                                                                                                                                                                                                                                                                                                                                                                              ",
      "                                G                                                                                                                                                                                                                                                                                                                                                                               ",
      "      C      C                 G                                                                                                                                                                                                                                                                                                                                                                                ",
      "                         W         G                                                                                                                                                                                                                                                                                                                                                                                 ",
      "                    GGGGGGGGGG                                                                                                                                                                                                                                                                                                                                                                                  ",
      "                   G                                                                                                                                                                                                                                                                                                                                                                                            ",
      " X                G                                                                                                                                                                                                                                                                                                                                                                                             ",
      " XX               G                                                                                                                                                                                                                                                                                                                                                                                             ",
      "GGGGGGGGGGGGGGGGGBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
    ];
    
    this.createLevel();
  }
  
  createLevel() {
    // Parse the map and create platforms, enemies, collectibles, etc.
    this.parseMap();
  }
  
  parseMap() {
    console.log('Parsing Peru level map...');
    let enemyCount = 0;
    let collectibleCount = 0;
    let platformCount = 0;
    let foundStart = false;  // Track if we've found the start position
    
    // Convert the character map into game objects
    for (let row = 0; row < this.mapData.length; row++) {
      this.tiles[row] = [];
      for (let col = 0; col < this.mapData[row].length; col++) {
        const char = this.mapData[row][col];
        const x = col * this.tileSize;
        const y = row * this.tileSize;
        
        // ALWAYS store the character in tiles array for rendering
        this.tiles[row][col] = char;
        
        switch(char) {
          // Solid ground platforms
          case 'G':
            // Test with simple object for G tiles
            this.platforms.push({
              x: x,
              y: y,
              width: this.tileSize,
              height: this.tileSize
            });
            platformCount++;
            break;
          case 'B':
          case 'T':
          case 'P':
            const platform = new Platform(x, y, this.tileSize, this.tileSize, 'normal');
            this.platforms.push(platform);
            platformCount++;
            break;
            
          // Moving platform
          case 'M':
            const movingPlatform = new MovingPlatform(
              x, 
              y, 
              this.tileSize * 3, // width
              this.tileSize / 2, // height
              x - this.tileSize * 2, // leftBound
              x + this.tileSize * 2, // rightBound
              60 // speed (pixels per second)
            );
            this.movingPlatforms.push(movingPlatform);
            this.platforms.push(movingPlatform); // Also add to platforms for collision
            break;
            
          // Walker enemy (replaced WALKER with W)
          case 'W':
            this.enemyManager.createEnemy('walker', x + this.tileSize/2, y + this.tileSize/2);
            enemyCount++;
            break;
            
          // Flyer enemy (replaced FLYER with F)
          case 'F':
            this.enemyManager.createEnemy('flyer', x + this.tileSize/2, y + this.tileSize/2);
            enemyCount++;
            break;
            
          // Coin collectible
          case 'C':
            this.collectibleManager.createCollectible('coin', x + this.tileSize/2, y + this.tileSize/2);
            collectibleCount++;
            break;
            
          // Speed boost powerup
          case 'S':
            this.collectibleManager.createCollectible('leaf', x + this.tileSize/2, y + this.tileSize/2, { powerupType: 'speed' });
            break;
            
          // Double jump powerup
          case 'D':
            this.collectibleManager.createCollectible('leaf', x + this.tileSize/2, y + this.tileSize/2, { powerupType: 'doubleJump' });
            break;
            
          // Spike hazard
          case 'K':
            // For now, just treat as a hazard platform
            this.platforms.push({
              x: x,
              y: y,
              width: this.tileSize,
              height: this.tileSize,
              isHazard: true
            });
            break;
            
          // Player start position
          case 'X':
            if (!foundStart) {
              this.startPosition = { x: x + this.tileSize/2, y: y - this.tileSize };
              console.log(`Found player start at: ${this.startPosition.x}, ${this.startPosition.y} (row ${row}, col ${col})`);
              foundStart = true;
            }
            // Also place a platform under the start position
            this.platforms.push({
              x: x,
              y: y,
              width: this.tileSize,
              height: this.tileSize
            });
            platformCount++;
            break;
        }
      }
    }
    
    console.log(`Peru level parsed: ${platformCount} platforms, ${enemyCount} enemies, ${collectibleCount} collectibles`);
  }
  
  update(deltaTime) {
    // Update moving platforms
    this.movingPlatforms.forEach(platform => {
      platform.update(deltaTime);
    });
  }
  
  draw(ctx, camera) {
    // Calculate visible tile range based on camera
    const startCol = Math.floor(camera.x / this.tileSize);
    const endCol = Math.floor((camera.x + camera.width) / this.tileSize) + 1;
    const startRow = Math.floor(camera.y / this.tileSize);
    const endRow = Math.floor((camera.y + camera.height) / this.tileSize) + 1;
    
    // Clamp to level bounds
    const clampedStartCol = Math.max(0, startCol);
    const clampedEndCol = Math.min(this.width, endCol);
    const clampedStartRow = Math.max(0, startRow);
    const clampedEndRow = Math.min(this.height, endRow);
    
    // Debug: Draw a background so we can see the level area
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(camera.x - 100, camera.y - 100, camera.width + 200, camera.height + 200);
    
    // Debug camera and player position
    console.log(`Camera: (${camera.x}, ${camera.y}), Player: (${this.game.player.x}, ${this.game.player.y})`);
    console.log(`Checking tiles from (${clampedStartCol},${clampedStartRow}) to (${clampedEndCol},${clampedEndRow})`);
    
    // Draw visible tiles
    let tilesDrawn = 0;
    for (let row = clampedStartRow; row < clampedEndRow; row++) {
      for (let col = clampedStartCol; col < clampedEndCol; col++) {
        const tile = this.tiles[row]?.[col];
        if (!tile || tile === ' ') continue;
        
        const x = col * this.tileSize;
        const y = row * this.tileSize;
        
        // DEBUG: Log the first few tiles being drawn
        if (tilesDrawn < 5) {
          console.log(`Drawing tile '${tile}' at (${x}, ${y})`);
        }
        
        switch(tile) {
          case 'G': // Grass/ground
            ctx.save();
            ctx.fillStyle = '#44aa44';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            ctx.restore();
            tilesDrawn++;
            break;
            
          case 'B': // Brown ground
            ctx.save();
            ctx.fillStyle = '#654321';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            ctx.restore();
            tilesDrawn++;
            break;
            
          case 'T': // Stone/tile
            ctx.save();
            ctx.fillStyle = '#888888';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            ctx.restore();
            tilesDrawn++;
            break;
            
          case 'P': // Platform
            ctx.save();
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            ctx.restore();
            tilesDrawn++;
            break;
            
          case 'K': // Spike hazard
            // Draw base
            ctx.fillStyle = '#666';
            ctx.fillRect(x, y + this.tileSize/2, this.tileSize, this.tileSize/2);
            // Draw spikes
            ctx.fillStyle = '#444';
            const spikeCount = 4;
            const spikeWidth = this.tileSize / spikeCount;
            for (let i = 0; i < spikeCount; i++) {
              ctx.beginPath();
              ctx.moveTo(x + i * spikeWidth, y + this.tileSize/2);
              ctx.lineTo(x + i * spikeWidth + spikeWidth/2, y);
              ctx.lineTo(x + (i + 1) * spikeWidth, y + this.tileSize/2);
              ctx.closePath();
              ctx.fill();
            }
            break;
            
          case 'L': // Ladder (visual only for now)
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 2;
            // Draw ladder sides
            ctx.beginPath();
            ctx.moveTo(x + 8, y);
            ctx.lineTo(x + 8, y + this.tileSize);
            ctx.moveTo(x + this.tileSize - 8, y);
            ctx.lineTo(x + this.tileSize - 8, y + this.tileSize);
            ctx.stroke();
            // Draw rungs
            for (let i = 0; i < 4; i++) {
              ctx.beginPath();
              ctx.moveTo(x + 8, y + (i + 1) * (this.tileSize / 5));
              ctx.lineTo(x + this.tileSize - 8, y + (i + 1) * (this.tileSize / 5));
              ctx.stroke();
            }
            break;
            
          case 'E': // Exit/End marker (visual only)
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(x + 8, y + 8, this.tileSize - 16, this.tileSize - 16);
            break;
        }
      }
    }
    
    // Draw moving platforms (they draw themselves)
    this.movingPlatforms.forEach(platform => {
      platform.draw(ctx);
    });
    
    // DEBUG: Draw a test rectangle to verify drawing works
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(camera.x + 100, camera.y + 100, 50, 50);
    console.log(`Drew ${tilesDrawn} tiles this frame`);
  }
}

// Export for use in the game
export { PeruLevel };
