// Updated game.js with integrated enemy system
import * as Utils from './utils.js';
import { keys } from './input.js';

// Import game objects and levels
import { Bouncer } from '../objects/bouncer.js';
import { EnemyManager } from '../objects/EnemyManager.js';
import { demoLevel } from '../levels/demo-level.js';
import { PeruLevel } from '../levels/peru-level.js';
import { Player } from '../objects/player.js';
import { Enemy } from '../objects/Enemy.js';
import { Platform } from '../objects/platform.js';

// Your existing game code follows...

// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GRAVITY = 0.5;
const FRICTION = 0.8;

// Game variables
let canvas, ctx;
let gameRunning = false;
let score = 0;
let lives = 3;

// Game objects
let player;
let platforms = [];
let bouncers = []; // Array for bouncers
let enemyManager; // Enemy manager instance
let camera = { 
    x: 0, 
    y: 0, 
    width: CANVAS_WIDTH, 
    height: CANVAS_HEIGHT,
    prevX: 0, // Keep track of previous position for delta calculations
    prevY: 0
}; // Camera for scrolling

// Current level
let currentLevel = null;
let useCustomLevel = false; // Set to true to use the demo level

// Initialize the game
function init() {
    console.log("Game initializing");
    
    // Set up canvas
    canvas = document.getElementById('game-canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    ctx = canvas.getContext('2d');
    
    // Set up input - using our local implementation
    setupInputListeners();
    
    // Set up event listeners
    document.getElementById('start-button').addEventListener('click', startGame);
    
    // Hide game UI initially
    document.getElementById('game-ui').style.display = 'none';
    
    // Initialize enemy manager
    enemyManager = new EnemyManager();
    
    // Add level select UI after DOM is ready
    setTimeout(() => {
        const container = document.querySelector('.game-container') || document.querySelector('#game-container') || document.body;
        if (container) {
            createLevelSelectUI(container);
        }
    }, 100);
}

// Optional: Add a level select menu
function createLevelSelectUI(container) {
    const levelInfo = document.createElement('div');
    levelInfo.id = 'level-info';
    levelInfo.style.cssText = `
        position: absolute;
        bottom: 40px;
        left: 10px;
        color: white;
        font-family: Arial, sans-serif;
        font-size: 14px;
        text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5);
        background: rgba(0, 0, 0, 0.5);
        padding: 10px;
        border-radius: 5px;
        z-index: 10;
    `;
    levelInfo.innerHTML = `
        <strong>Level Select:</strong><br>
        L - Toggle Demo Level<br>
        P - Peru Level<br>
        1 - Jungle Temple<br>
        2 - Chicago Streets<br>
        3 - Chicago Neighborhood<br>
        4 - Vatican Conclave<br>
        0 - Default Level
    `;
    container.appendChild(levelInfo);
}

// Set up keyboard input listeners
function setupInputListeners() {
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        
        // Handle jump key presses in the keydown event
        if (player && (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ')) {
            player.jump();
        }
    });
    
    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
        
        // Handle jump key releases to enable repeated jumps
        if (player && (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ')) {
            player.releaseJumpKey();
        }
    });
}

// Start the game
function startGame() {
    console.log("Game starting!");
    
    // Hide menu, show UI
    document.getElementById('game-menu').style.display = 'none';
    document.getElementById('game-ui').style.display = 'block';
    
    if (useCustomLevel) {
        // Load demo level
        loadLevel(demoLevel);
    } else {
        // Load default level
        loadDefaultLevel();
    }
    
    // Start game loop
    gameRunning = true;
    requestAnimationFrame(gameLoop);
}

// Load a level from data
function loadLevel(levelData) {
    currentLevel = levelData;
    
    // Initialize player at level's starting position
    const startPos = levelData.playerStart || { x: 100, y: 300 };
    player = new Player(startPos.x, startPos.y);
    
    // Load platforms
    platforms = [];
    if (levelData.platforms) {
        levelData.platforms.forEach(platformData => {
            // Create platform based on type
            const platform = new Platform(
                platformData.x, 
                platformData.y, 
                platformData.width, 
                platformData.height, 
                platformData.type || 'normal', 
                platformData
            );
            platforms.push(platform);
        });
    }
    
    // Load bouncers
    bouncers = [];
    if (levelData.bouncers) {
        levelData.bouncers.forEach(bouncerData => {
            const bouncer = new Bouncer(
                bouncerData.x,
                bouncerData.y,
                bouncerData.width,
                bouncerData.height,
                bouncerData.bounceForce || -15
            );
            bouncers.push(bouncer);
        });
    }
    
    // Load enemies
    enemyManager.clearEnemies();
    if (levelData.enemies) {
        enemyManager.createEnemiesFromLevel(levelData);
    }
    
    // Reset camera
    camera.x = 0;
    camera.y = 0;
    camera.prevX = 0;
    camera.prevY = 0;
    
    // Handle special level features
    if (levelData.powerups) {
        // Initialize powerups (you'll need to create a powerup system)
        console.log("Level has special powerups:", levelData.powerups);
    }
    
    if (levelData.theme) {
        // Apply visual theme (future feature)
        console.log("Level theme:", levelData.theme);
    }
    
    // Update UI with level name
    document.getElementById('level-name').textContent = levelData.name || '';
}

// Load a tile-based level (like Peru) - SIMPLIFIED VERSION WITHOUT TILEPARSER
function loadTileBasedLevel(levelData) {
    console.log("Loading tile-based level:", levelData.name);
    
    // Set current level with proper dimensions in pixels
    currentLevel = {
        name: levelData.name,
        width: levelData.width * levelData.tileSize,
        height: levelData.height * levelData.tileSize
    };
    
    // Initialize player at starting position
    player = new Player(levelData.playerStart.x, levelData.playerStart.y);
    console.log("Player starting at:", levelData.playerStart.x, levelData.playerStart.y);
    
    // Clear platforms and parse them from tile data
    platforms = [];
    const tileSize = levelData.tileSize;
    
    // Process each row of the level
    for (let y = 0; y < levelData.data.length; y++) {
        const row = levelData.data[y];
        
        for (let x = 0; x < row.length; x++) {
            const tile = row[x];
            const pixelX = x * tileSize;
            const pixelY = y * tileSize;
            
            // Create platforms based on tile type
            switch(tile) {
                case 'G': // Ground
                    platforms.push(new Platform(pixelX, pixelY, tileSize, tileSize, 'ground'));
                    break;
                    
                case 'P': // Platform
                    platforms.push(new Platform(pixelX, pixelY, tileSize, tileSize, 'platform'));
                    break;
                    
                case 'T': // One-way platform
                    platforms.push(new Platform(pixelX, pixelY, tileSize, tileSize, 'one-way'));
                    break;
                    
                case 'S': // Slope
                    platforms.push(new Platform(pixelX, pixelY, tileSize, tileSize, 'slope', {
                        angle: 30,
                        direction: 'right'
                    }));
                    break;
                    
                case 'M': // Moving platform
                    platforms.push(new Platform(pixelX, pixelY, tileSize, tileSize, 'moving', {
                        moveX: 0,
                        moveY: 100,
                        moveSpeed: 0.5,
                        moveTiming: 'sine'
                    }));
                    break;
                    
                case 'D': // Destructible block
                    platforms.push(new Platform(pixelX, pixelY, tileSize, tileSize, 'platform'));
                    break;
            }
        }
    }
    
    console.log("Created", platforms.length, "platforms");
    
    // Clear and reload enemies
    enemyManager.clearEnemies();
    
    // Parse enemies from the tile data
    for (let y = 0; y < levelData.data.length; y++) {
        const row = levelData.data[y];
        for (let x = 0; x < row.length; x++) {
            // Check for WALKER
            if (row.substr(x, 6) === 'WALKER') {
                enemyManager.createEnemy('walker', x * tileSize, y * tileSize - 20);
                x += 5; // Skip ahead
            }
            // Check for FLYER
            else if (row.substr(x, 5) === 'FLYER') {
                enemyManager.createEnemy('flyer', x * tileSize, y * tileSize);
                x += 4; // Skip ahead
            }
        }
    }
    
    console.log("Created", enemyManager.getEnemyCount(), "enemies");
    
    // Reset camera
    camera.x = 0;
    camera.y = 0;
    camera.prevX = 0;
    camera.prevY = 0;
    
    // Update UI with level name
    document.getElementById('level-name').textContent = levelData.name || '';
}

// Create the default level
function loadDefaultLevel() {
    // Initialize player
    player = new Player(100, 300);
    
    // Create platforms for the level
    platforms = [
        // Ground - full width brown platform at the bottom
        new Platform(0, CANVAS_HEIGHT - 40, CANVAS_WIDTH, 40, 'ground'),
        
        // Regular platforms - green
        new Platform(100, 450, 200, 20),  // Lower left platform
        new Platform(400, 450, 200, 20),  // Lower right platform
        
        // One-way platforms - blue with dashed line on top
        new Platform(200, 350, 150, 15, 'one-way'),  // Middle left one-way platform
        new Platform(500, 350, 150, 15, 'one-way'),  // Middle right one-way platform
        
        // Regular platform - green
        new Platform(300, 250, 200, 20),  // Upper middle platform
        
        // More one-way platforms - blue
        new Platform(100, 150, 120, 15, 'one-way'),  // Upper left one-way platform
        new Platform(580, 150, 120, 15, 'one-way'),  // Upper right one-way platform
        
        // Slopes - orange triangles
        new Platform(50, 500, 100, 50, 'slope', { angle: 25, direction: 'right' }),
        new Platform(650, 500, 100, 50, 'slope', { angle: 25, direction: 'left' }),
        new Platform(300, 400, 100, 50, 'slope', { angle: 35, direction: 'right' }),
        new Platform(450, 200, 80, 80, 'slope', { angle: 45, direction: 'left' }),
        
        // Moving Platforms - pink with directional arrows
        
        // Horizontal moving platform
        new Platform(300, 120, 120, 15, 'moving', { 
            moveX: 150, // Move horizontally 150 pixels
            moveY: 0,  // Don't move vertically
            moveSpeed: 0.8, // Speed multiplier
            moveTiming: 'sine' // Smooth sine movement
        }),
        
        // Vertical moving platform - smoother movement
        new Platform(40, 250, 80, 15, 'moving', {
            moveX: 0,  // Don't move horizontally
            moveY: 100, // Reduced movement range
            moveSpeed: 0.5, // Reduced speed
            moveTiming: 'sine' // Smoother movement
        }),
        
        // Circular/diagonal moving platform
        new Platform(550, 280, 80, 15, 'moving', {
            moveX: 100, // Move horizontally
            moveY: 60,  // And vertically for diagonal motion
            moveSpeed: 0.5,
            moveTiming: 'sine',
            movePhase: 0.5 // Start at different point in the movement cycle
        }),
        
        // Moving slope platform
        new Platform(450, 380, 80, 40, 'slope', {
            angle: 30,
            direction: 'right',
            moveX: 70,
            moveY: 0,
            moveSpeed: 0.7,
            moveTiming: 'linear'
        }),
    ];

    // Create bouncers - FIXED positioning and reduced bounce force
    bouncers = [
        // Parameters: x, y, width, height, bounceForce (reduced from default -20)
        new Bouncer(150, 520, 80, 15, -13), // Lower left, smaller bounce
        new Bouncer(570, 520, 80, 15, -15), // Lower right, medium bounce
        new Bouncer(320, 230, 60, 15, -12), // Upper platform, smallest bounce
    ];
    
    // Add some test enemies
    enemyManager.clearEnemies();
    enemyManager.createEnemy('walker', 200, 400);
    enemyManager.createEnemy('jumper', 400, 400);
    enemyManager.createEnemy('flyer', 300, 200);
    enemyManager.createEnemy('flipper', 600, 400);
    
    // Reset camera
    camera.x = 0;
    camera.y = 0;
    camera.prevX = 0;
    camera.prevY = 0;
    
    // Clear level name
    document.getElementById('level-name').textContent = '';
}

// Update camera position to follow player
function updateCamera() {
    // Store previous camera position to calculate delta
    camera.prevX = camera.x;
    camera.prevY = camera.y;
    
    // Only update camera for custom levels that are wider than the screen
    if (!currentLevel || !currentLevel.width || currentLevel.width <= CANVAS_WIDTH) {
        return;
    }
    
    // Center camera on player
    const targetX = player.x - CANVAS_WIDTH / 2;
    
    // Clamp camera to level bounds
    camera.x = Math.max(0, Math.min(targetX, currentLevel.width - CANVAS_WIDTH));
}

// Main game loop
function gameLoop() {
    // Get current time for animations and cooldowns
    const currentTime = performance.now();
    
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Basic blue background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Update camera to follow player
    updateCamera();
    
    // Update all platforms (specifically moving ones)
    platforms.forEach(platform => {
        if (platform.isMoving) {
            platform.update();
        }
    });
    
    // Update all bouncers
    bouncers.forEach(bouncer => {
        bouncer.update(currentTime);
    });
    
    // Update enemy logic - these updates happen in world space, before any camera translation
    enemyManager.update(platforms, player);
    
    // Update player with controls
    if (player) {
        // Handle player movement input
        if (keys['ArrowLeft'] || keys['a']) {
            player.moveLeft();
        }
        if (keys['ArrowRight'] || keys['d']) {
            player.moveRight();
        }
        
        // Update player physics
        player.update(platforms);
        
        // Check bouncer collisions - pass current time to help debugging
        player.checkCollisions(platforms, bouncers);
    }
    
    // DRAWING - Apply camera transformation for all drawing operations
    ctx.save();
    
    // Apply camera offset
    ctx.translate(-camera.x, -camera.y);
    
    // Draw platforms
    platforms.forEach(platform => {
        // Only draw platforms if they're visible in the camera view
        if (platform.x + platform.width > camera.x && 
            platform.x < camera.x + CANVAS_WIDTH &&
            platform.y + platform.height > camera.y &&
            platform.y < camera.y + CANVAS_HEIGHT) {
            platform.draw(ctx);
        }
    });
    
    // Draw bouncers
    bouncers.forEach(bouncer => {
        // Only draw bouncers if they're visible in the camera view
        if (bouncer.x + bouncer.width > camera.x && 
            bouncer.x < camera.x + CANVAS_WIDTH &&
            bouncer.y + bouncer.height > camera.y &&
            bouncer.y < camera.y + CANVAS_HEIGHT) {
            bouncer.draw(ctx);
        }
    });
    
    // Draw enemies - This now happens inside the camera transformation context
    enemyManager.draw(ctx, camera);
    
    // Draw player
    if (player) {
        player.draw(ctx);
    }
    
    // Restore context after camera transformation
    ctx.restore();
    
    // Draw UI (not affected by camera)
    updateUI();
    
    // Continue loop if game is running
    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// Update game UI
function updateUI() {
    // Update score display
    document.getElementById('score').textContent = `Score: ${score}`;
    
    // Update lives display
    if (player) {
        document.getElementById('lives').textContent = `Lives: ${player.health}`;
        lives = player.health; // Sync lives with player health
    } else {
        document.getElementById('lives').textContent = `Lives: ${lives}`;
    }
    
    // Display enemy count
    document.getElementById('enemies').textContent = `Enemies: ${enemyManager.getEnemyCount()}`;
    
    // Level name if using custom level
    if (currentLevel && currentLevel.name) {
        document.getElementById('level-name').textContent = currentLevel.name;
    }
    
    // Debug info - shows useful stats at bottom of screen
    if (player) {
        const debugInfo = `Position: ${Math.round(player.x)}, ${Math.round(player.y)} | Velocity: ${player.velocityX.toFixed(2)}, ${player.velocityY.toFixed(2)} | Grounded: ${player.isGrounded} | Platform: ${player.activePlatform ? player.activePlatform.type : 'none'}${player.wasOnMovingPlatform ? ' (moving)' : ''}`;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(10, CANVAS_HEIGHT - 30, CANVAS_WIDTH - 20, 20);
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(debugInfo, 15, CANVAS_HEIGHT - 15);
    }
}

// Key handler to toggle between levels
window.addEventListener('keydown', (e) => {
    // Level switching keys
    if (gameRunning) {
        switch(e.key.toLowerCase()) {
            case 'l': // Toggle between default and demo level
                useCustomLevel = !useCustomLevel;
                if (useCustomLevel) {
                    loadLevel(demoLevel);
                } else {
                    loadDefaultLevel();
                }
                break;
                
            case 'p': // Peru level
                loadTileBasedLevel(PeruLevel);
                console.log("Loading Peru level");
                break;
                
            case '1': // Jungle Temple
                loadLevel(jungleTempleLevel);
                console.log("Loading Jungle Temple level");
                break;
                
            case '2': // Chicago Streets
                loadLevel(chicagoStreetLevel);
                console.log("Loading Chicago Streets level");
                break;
                
            case '3': // Chicago Neighborhood
                loadLevel(chicagoNeighborhoodLevel);
                console.log("Loading Chicago Neighborhood level");
                break;
                
            case '4': // Vatican Conclave
                loadLevel(vaticanConclaveLevel);
                console.log("Loading Vatican Conclave level");
                break;
                
            case '0': // Return to default level
                loadDefaultLevel();
                console.log("Loading default level");
                break;
        }
    }
});

// Initialize the game when the page loads
window.addEventListener('load', init);

// Export the constants if needed elsewhere
export { CANVAS_WIDTH, CANVAS_HEIGHT, GRAVITY, FRICTION };
