// Updated game.js with integrated enemy system and Peru level support
import * as Utils from './utils.js';
import { keys } from './input.js';

// Import game objects and levels
import { Bouncer } from '../objects/bouncer.js';
import { demoLevel } from '../levels/demo-level.js';
import { PeruLevel } from '../levels/peru-level.js';
import { Player } from '../objects/player.js';
import { Enemy } from '../objects/Enemy.js';
import { EnemyManager } from '../objects/EnemyManager.js';
import { Platform } from '../objects/platform.js';
import { MovingPlatform } from '../objects/MovingPlatform.js';
import { CollectibleManager } from '../objects/CollectibleManager.js';
import { EffectManager } from '../objects/EffectManager.js';

// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GRAVITY = 0.5;
const FRICTION = 0.8;

// Game variables
let canvas, ctx;
let gameRunning = false;
let gameOver = false;
let isPaused = false;
let score = 0;
let lives = 3;

// Game objects
let player;
let platforms = [];
let bouncers = []; // Array for bouncers
let enemyManager; // Enemy manager instance
let collectibleManager; // Collectible manager instance
let effectManager; // Effect manager instance
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

// Create game object that will be passed to levels
const game = {
    get enemyManager() { return enemyManager; },
    get collectibleManager() { return collectibleManager; },
    get effectManager() { return effectManager; },
    get player() { return player; },
    get score() { return score; },
    set score(value) { score = value; },
    get camera() { return camera; }
};

// Initialize the game
function init() {
    console.log("Game initializing");
    
    // Set up canvas
    canvas = document.getElementById('game-canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    ctx = canvas.getContext('2d');
    
    // Initialize managers BEFORE anything else
    enemyManager = new EnemyManager();
    collectibleManager = new CollectibleManager();
    effectManager = new EffectManager();
    
    // Set up input - using our local implementation
    setupInputListeners();
    
    // Set up event listeners
    document.getElementById('start-button').addEventListener('click', startGame);
    
    // Hide game UI initially
    document.getElementById('game-ui').style.display = 'none';
    
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

// Load a tile-based level (like Peru)
function loadTileBasedLevel(LevelClass) {
    // Clear existing objects
    enemyManager.clearEnemies();
    collectibleManager.clearCollectibles();  // Use the correct method name
    effectManager.clear();
    platforms = [];
    bouncers = [];
    
    // Create the level instance
    currentLevel = new LevelClass(game);
    
    // Initialize player at level's starting position
    const startPos = currentLevel.startPosition || { x: 100, y: 300 };
    player = new Player(startPos.x, startPos.y);
    
    // Use the level's platforms
    platforms = currentLevel.platforms || [];
    
    // Reset camera for large levels
    camera.x = 0;
    camera.y = 0;
    camera.prevX = 0;
    camera.prevY = 0;
    
    // Set camera bounds based on level size
    if (currentLevel.pixelWidth) {
        camera.maxX = Math.max(0, currentLevel.pixelWidth - CANVAS_WIDTH);
    }
    if (currentLevel.pixelHeight) {
        camera.maxY = Math.max(0, currentLevel.pixelHeight - CANVAS_HEIGHT);
    }
    
    console.log(`Loaded ${currentLevel.name} level`);
    console.log(`Level size: ${currentLevel.pixelWidth}x${currentLevel.pixelHeight}`);
    console.log(`Enemies: ${enemyManager.getEnemyCount()}`);
    console.log(`Collectibles: ${collectibleManager.collectibles.length}`);
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

// Create the default level
function loadDefaultLevel() {
    // Clear any existing level
    currentLevel = null;
    
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
    
    // Add some collectibles to the default level
    collectibleManager.clearCollectibles();
    collectibleManager.createCollectible('coin', 150, 420);
    collectibleManager.createCollectible('coin', 250, 320);
    collectibleManager.createCollectible('coin', 350, 220);
    collectibleManager.createCollectible('coin', 450, 420);
    collectibleManager.createCollectible('coin', 550, 320);
    collectibleManager.createCollectible('bigcoin', 400, 120);
    collectibleManager.createCollectible('gem', 650, 120);
    
    // Reset camera
    camera.x = 0;
    camera.y = 0;
    camera.prevX = 0;
    camera.prevY = 0;
    camera.maxX = 0;
    camera.maxY = 0;
    
    // Clear level name
    document.getElementById('level-name').textContent = '';
}

// Update camera position to follow player
function updateCamera() {
    // Store previous camera position to calculate delta
    camera.prevX = camera.x;
    camera.prevY = camera.y;
    
    // For tile-based levels with pixelWidth/pixelHeight
    if (currentLevel && currentLevel.pixelWidth) {
        // Center camera on player horizontally
        const targetX = player.x - CANVAS_WIDTH / 2;
        
        // Smooth camera movement (optional)
        // camera.x += (targetX - camera.x) * 0.1;
        
        // Direct camera follow
        camera.x = targetX;
        
        // Clamp camera to level bounds
        camera.x = Math.max(0, Math.min(camera.x, currentLevel.pixelWidth - CANVAS_WIDTH));
        
        // Handle vertical camera if level is taller than screen
        if (currentLevel.pixelHeight > CANVAS_HEIGHT) {
            const targetY = player.y - CANVAS_HEIGHT / 2;
            camera.y = Math.max(0, Math.min(targetY, currentLevel.pixelHeight - CANVAS_HEIGHT));
        }
    }
    // For data-based levels with width property
    else if (currentLevel && currentLevel.width && currentLevel.width > CANVAS_WIDTH) {
        // Center camera on player
        const targetX = player.x - CANVAS_WIDTH / 2;
        
        // Clamp camera to level bounds
        camera.x = Math.max(0, Math.min(targetX, currentLevel.width - CANVAS_WIDTH));
    }
}

// Main game loop
function gameLoop(deltaTime) {
    if (!gameRunning || gameOver || isPaused) {
        if (gameRunning) {
            requestAnimationFrame(gameLoop);
        }
        return;
    }
    
    // Calculate actual deltaTime (capped at 16ms to prevent huge jumps)
    const cappedDeltaTime = Math.min(deltaTime || 16, 16);
    
    // Get current time for animations and cooldowns
    const currentTime = performance.now();
    
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Basic blue background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Update camera to follow player
    updateCamera();
    
    // Update tile-based level if it has an update method
    if (currentLevel && currentLevel.update) {
        currentLevel.update(cappedDeltaTime);
    }
    
    // Update all platforms (specifically moving ones)
    platforms.forEach(platform => {
        if (platform.isMoving || platform.update) {
            platform.update();
        }
    });
    
    // Update all bouncers
    bouncers.forEach(bouncer => {
        bouncer.update(currentTime);
    });
    
    // Update managers
    enemyManager.update(platforms, player);  // Enemy manager doesn't use deltaTime
    collectibleManager.update(cappedDeltaTime, player, game);  // Pass game object
    effectManager.update(cappedDeltaTime);
    
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
    
    // Draw level background/tiles if it has a draw method
    if (currentLevel && currentLevel.draw) {
        currentLevel.draw(ctx, camera);
    }
    
    // Draw platforms (for non-tile-based levels)
    if (!currentLevel || !currentLevel.draw) {
        platforms.forEach(platform => {
            // Only draw platforms if they're visible in the camera view
            if (platform.x + platform.width > camera.x && 
                platform.x < camera.x + CANVAS_WIDTH &&
                platform.y + platform.height > camera.y &&
                platform.y < camera.y + CANVAS_HEIGHT) {
                platform.draw(ctx);
            }
        });
    }
    
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
    
    // Draw collectibles
    collectibleManager.draw(ctx, camera);
    
    // Draw enemies
    enemyManager.draw(ctx, camera);
    
    // Draw player
    if (player) {
        player.draw(ctx);
    }
    
    // Draw effects on top
    effectManager.draw(ctx);
    
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
            
            case 'p': // Load Peru level
                loadTileBasedLevel(PeruLevel);
                break;
                
            case '1': // Jungle Temple
                // loadLevel(jungleTempleLevel);
                console.log("Jungle Temple level not yet implemented");
                break;
                
            case '2': // Chicago Streets
                // loadLevel(chicagoStreetLevel);
                console.log("Chicago Streets level not yet implemented");
                break;
                
            case '3': // Chicago Neighborhood
                // loadLevel(chicagoNeighborhoodLevel);
                console.log("Chicago Neighborhood level not yet implemented");
                break;
                
            case '4': // Vatican Conclave
                // loadLevel(vaticanConclaveLevel);
                console.log("Vatican Conclave level not yet implemented");
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
export { CANVAS_WIDTH, CANVAS_HEIGHT, GRAVITY, FRICTION, game };
