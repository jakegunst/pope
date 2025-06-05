// Updated game.js with integrated collectible system and bug fixes
import * as Utils from './utils.js';
import { keys } from './input.js';

// Import game objects - FIXED: removed duplicates and corrected Bouncer import
import { Bouncer } from '../objects/bouncer.js';
import { EnemyManager } from '../objects/EnemyManager.js';
import { TileParser, tileParser } from '../objects/TileParser.js';
import { CollectibleManager } from '../objects/CollectibleManager.js';
import { HazardManager } from '../objects/Hazard.js';
import { PowerupSystem } from '../objects/PowerupSystem.js';
import { demoLevel } from '../levels/demo-level.js';
import { PeruLevel } from '../levels/peru-level.js';
import { Player } from '../objects/player.js';
import { Platform } from '../objects/platform.js';

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
let collectedKeys = 0; // Track collected keys - renamed to avoid conflict

// Game objects
let player;
let platforms = [];
let bouncers = [];
let enemyManager;
let collectibleManager;
let powerupSystem;
let hazardManager;
let camera = { 
    x: 0, 
    y: 0, 
    width: CANVAS_WIDTH, 
    height: CANVAS_HEIGHT,
    prevX: 0,
    prevY: 0
};

// Current level
let currentLevel = null;
let useCustomLevel = false;

// Initialize the game
function init() {
    console.log("Game initializing");
    
    // Set up canvas
    canvas = document.getElementById('game-canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    ctx = canvas.getContext('2d');
    
    // Set up input
    setupInputListeners();
    
    // Set up event listeners
    document.getElementById('start-button').addEventListener('click', startGame);
    
    // Hide game UI initially
    document.getElementById('game-ui').style.display = 'none';
    
    // Initialize managers (move to init to ensure they exist before game starts)
    enemyManager = new EnemyManager();
    collectibleManager = new CollectibleManager();
    powerupSystem = new PowerupSystem();
    hazardManager = new HazardManager();
    
    // Add level select UI after DOM is ready
    setTimeout(() => {
        const container = document.querySelector('.game-container') || document.querySelector('#game-container') || document.body;
        if (container) {
            createLevelSelectUI(container);
        }
    }, 100);
}

// Create level select UI
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
        P - Peru Level (Tile-based)<br>
        0 - Default Level
    `;
    container.appendChild(levelInfo);
}

// Set up keyboard input listeners
function setupInputListeners() {
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        
        // Handle jump key presses
        if (player && (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ')) {
            player.jump();
        }
    });
    
    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
        
        // Handle jump key releases
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
    
    // Load default level
    loadDefaultLevel();
    
    // Start game loop
    gameRunning = true;
    requestAnimationFrame(gameLoop);
}

// Load a level from data
function loadLevel(levelData) {
    // Check if this is a tile-based level
    if (levelData.data && Array.isArray(levelData.data)) {
        loadTileLevel(levelData);
        return;
    }
    
    // Otherwise load as object-based level
    currentLevel = levelData;
    
    // Initialize player at level's starting position
    const startPos = levelData.playerStart || { x: 100, y: 300 };
    player = new Player(startPos.x, startPos.y);
    
    // Load platforms
    platforms = [];
    if (levelData.platforms) {
        levelData.platforms.forEach(platformData => {
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
    
    // Load collectibles
    collectibleManager.clearCollectibles();
    if (levelData.collectibles) {
        collectibleManager.createCollectiblesFromLevel(levelData);
    }
    
    // Load hazards
    hazardManager.clearHazards();
    if (levelData.hazards) {
        hazardManager.createHazardsFromLevel(levelData.hazards);
    }
    
    // Reset camera
    camera.x = 0;
    camera.y = 0;
    camera.prevX = 0;
    camera.prevY = 0;
    
    // Reset score, keys, and powerups for new level
    score = 0;
    collectedKeys = 0;
    powerupSystem.clearAllPowerups(player);
    
    // Update UI with level name
    document.getElementById('level-name').textContent = levelData.name || '';
}

// Load a tile-based level
function loadTileLevel(levelData) {
    console.log("Loading tile-based level:", levelData.name);
    console.log("Level dimensions:", levelData.width, "x", levelData.height);
    console.log("Tile data rows:", levelData.data.length);
    
    // Make sure we have a tileParser instance
    if (!tileParser) {
        console.error("TileParser not initialized!");
        return;
    }
    
    // Parse the tile data
    const parsed = tileParser.parseLevel(levelData);
    console.log("Parsed level data:", parsed);
    console.log("Number of platforms:", parsed.platforms.length);
    console.log("Number of collectibles:", parsed.collectibles.length);
    console.log("Number of enemies:", parsed.enemies.length);
    
    // Set as current level
    currentLevel = parsed;
    
    // Initialize player
    if (parsed.playerStart) {
        player = new Player(parsed.playerStart.x, parsed.playerStart.y);
        console.log("Player starting at:", parsed.playerStart);
    } else {
        player = new Player(100, 100);
        console.log("Using default player position");
    }
    
    // Load platforms from parsed data
    platforms = [];
    parsed.platforms.forEach(platformData => {
        const platform = new Platform(
            platformData.x,
            platformData.y,
            platformData.width,
            platformData.height,
            platformData.type,
            platformData.options || {}
        );
        platforms.push(platform);
    });
    
    // Load enemies
    enemyManager.clearEnemies();
    if (parsed.enemies) {
        enemyManager.createEnemiesFromLevel({ enemies: parsed.enemies });
    }
    
    // Load collectibles
    collectibleManager.clearCollectibles();
    if (parsed.collectibles) {
        collectibleManager.createCollectiblesFromLevel({ collectibles: parsed.collectibles });
    }
    
    // Load hazards
    hazardManager.clearHazards();
    if (parsed.hazards) {
        hazardManager.createHazardsFromLevel(parsed.hazards);
    }
    
    // No bouncers in tile-based levels (yet)
    bouncers = [];
    
    // Reset camera
    camera.x = 0;
    camera.y = 0;
    camera.prevX = 0;
    camera.prevY = 0;
    
    // Reset score and powerups
    score = 0;
    collectedKeys = 0;
    powerupSystem.clearAllPowerups(player);
    
    // Update UI
    document.getElementById('level-name').textContent = parsed.name;
}

// Create the default level
function loadDefaultLevel() {
    // Initialize player
    player = new Player(100, 300);
    
    // Create platforms for the level
    platforms = [
        // Ground
        new Platform(0, CANVAS_HEIGHT - 40, CANVAS_WIDTH, 40, 'ground'),
        
        // Regular platforms
        new Platform(100, 450, 200, 20),
        new Platform(400, 450, 200, 20),
        
        // One-way platforms
        new Platform(200, 350, 150, 15, 'one-way'),
        new Platform(500, 350, 150, 15, 'one-way'),
        
        // Upper platforms
        new Platform(300, 250, 200, 20),
        new Platform(100, 150, 120, 15, 'one-way'),
        new Platform(580, 150, 120, 15, 'one-way'),
        
        // Slopes
        new Platform(50, 500, 100, 50, 'slope', { angle: 25, direction: 'right' }),
        new Platform(650, 500, 100, 50, 'slope', { angle: 25, direction: 'left' }),
        new Platform(300, 400, 100, 50, 'slope', { angle: 35, direction: 'right' }),
        new Platform(450, 200, 80, 80, 'slope', { angle: 45, direction: 'left' }),
        
        // Moving Platforms
        new Platform(300, 120, 120, 15, 'moving', { 
            moveX: 150,
            moveY: 0,
            moveSpeed: 0.8,
            moveTiming: 'sine'
        }),
        
        new Platform(40, 250, 80, 15, 'moving', {
            moveX: 0,
            moveY: 100,
            moveSpeed: 0.5,
            moveTiming: 'sine'
        }),
        
        new Platform(550, 280, 80, 15, 'moving', {
            moveX: 100,
            moveY: 60,
            moveSpeed: 0.5,
            moveTiming: 'sine',
            movePhase: 0.5
        }),
        
        new Platform(450, 380, 80, 40, 'slope', {
            angle: 30,
            direction: 'right',
            moveX: 70,
            moveY: 0,
            moveSpeed: 0.7,
            moveTiming: 'linear'
        }),
    ];

    // Create bouncers
    bouncers = [
        new Bouncer(150, 520, 80, 15, -13),
        new Bouncer(570, 520, 80, 15, -15),
        new Bouncer(320, 230, 60, 15, -12),
    ];
    
    // Add enemies
    enemyManager.clearEnemies();
    enemyManager.createEnemy('walker', 200, 400);
    enemyManager.createEnemy('jumper', 400, 400);
    enemyManager.createEnemy('flyer', 300, 200);
    enemyManager.createEnemy('flipper', 600, 400);
    
    // Create collectibles with various patterns
    collectibleManager.clearCollectibles();
    
    // Line of coins on lower platforms
    collectibleManager.createPattern('line', 120, 420);
    collectibleManager.createPattern('line', 420, 420);
    
    // Arc over the middle platform
    collectibleManager.createPattern('arc', 250, 300);
    
    // Powerups with different types
    collectibleManager.createCollectible('leaf', 350, 220, { powerupType: 'jump' });
    collectibleManager.createCollectible('leaf', 110, 120, { powerupType: 'speed' });
    collectibleManager.createCollectible('leaf', 550, 480, { powerupType: 'invincibility' });
    collectibleManager.createCollectible('leaf', 40, 220, { powerupType: 'magnetism' });
    collectibleManager.createCollectible('leaf', 600, 250, { powerupType: 'shield' });
    collectibleManager.createCollectible('leaf', 200, 100, { powerupType: 'doubleJump' });
    
    // Gems in hard-to-reach places
    collectibleManager.createCollectible('gem', 640, 120);
    collectibleManager.createCollectible('gem', 490, 170);
    
    // Circle pattern
    collectibleManager.createPattern('circle', 200, 250);
    
    // Keys
    collectibleManager.createCollectible('key', 590, 320);
    
    // Coins along slopes
    for (let i = 0; i < 3; i++) {
        collectibleManager.createCollectible('coin', 70 + i * 25, 480 - i * 10);
        collectibleManager.createCollectible('coin', 680 + i * 25, 480 - i * 10);
    }
    
    // Big coins as rewards
    collectibleManager.createCollectible('bigcoin', 350, 90);
    collectibleManager.createCollectible('bigcoin', 50, 220);
    
    // Reset camera
    camera.x = 0;
    camera.y = 0;
    camera.prevX = 0;
    camera.prevY = 0;
    
    // Reset score and keys
    score = 0;
    collectedKeys = 0;
    
    // Clear level name
    document.getElementById('level-name').textContent = '';
}

// Update camera position to follow player
function updateCamera() {
    camera.prevX = camera.x;
    camera.prevY = camera.y;
    
    // Only update camera for levels wider than screen
    if (!currentLevel || !currentLevel.width || currentLevel.width <= CANVAS_WIDTH) {
        return;
    }
    
    // Center camera on player with some smoothing
    const targetX = player.x - CANVAS_WIDTH / 2;
    
    // Smooth camera movement
    camera.x += (targetX - camera.x) * 0.1;
    
    // Clamp camera to level bounds
    camera.x = Math.max(0, Math.min(camera.x, currentLevel.width - CANVAS_WIDTH));
}

// Game object for score and key management
const game = {
    addScore: function(points) {
        score += points;
        console.log(`Score: ${score} (+${points})`);
    },
    
    addKey: function() {
        collectedKeys++;
        console.log(`Keys: ${collectedKeys}`);
    },
    
    powerupSystem: null // Will be set to the actual powerupSystem
};

// Main game loop
function gameLoop() {
    const currentTime = performance.now();
    const deltaTime = 16; // Assuming 60fps
    
    // Set game powerup system reference
    game.powerupSystem = powerupSystem;
    
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Update camera
    updateCamera();
    
    // Update platforms
    platforms.forEach(platform => {
        if (platform.isMoving) {
            platform.update();
        }
    });
    
    // Update bouncers
    bouncers.forEach(bouncer => {
        bouncer.update(currentTime);
    });
    
    // Update enemies
    enemyManager.update(platforms, player);
    
    // Update powerup system
    powerupSystem.update(deltaTime, player);
    
    // Update collectibles (with powerup system integration)
    collectibleManager.update(deltaTime, player, game);
    
    // Update hazards
    hazardManager.update(deltaTime, player);
    
    // Update player
    if (player) {
        // Handle input
        if (keys['ArrowLeft'] || keys['a']) {
            player.moveLeft();
        }
        if (keys['ArrowRight'] || keys['d']) {
            player.moveRight();
        }
        
        // Update physics
        player.update(platforms, bouncers);
    }
    
    // DRAWING - Apply camera transformation
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    
    // Draw platforms
    platforms.forEach(platform => {
        if (platform.x + platform.width > camera.x && 
            platform.x < camera.x + CANVAS_WIDTH &&
            platform.y + platform.height > camera.y &&
            platform.y < camera.y + CANVAS_HEIGHT) {
            platform.draw(ctx);
        }
    });
    
    // Debug: Draw tile grid for tile-based levels
    if (currentLevel && currentLevel.width > CANVAS_WIDTH && tileParser) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        const tileSize = 32;
        
        // Draw vertical lines
        for (let x = Math.floor(camera.x / tileSize) * tileSize; x < camera.x + CANVAS_WIDTH; x += tileSize) {
            ctx.beginPath();
            ctx.moveTo(x - camera.x, 0);
            ctx.lineTo(x - camera.x, CANVAS_HEIGHT);
            ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = Math.floor(camera.y / tileSize) * tileSize; y < camera.y + CANVAS_HEIGHT; y += tileSize) {
            ctx.beginPath();
            ctx.moveTo(0, y - camera.y);
            ctx.lineTo(CANVAS_WIDTH, y - camera.y);
            ctx.stroke();
        }
    }
    
    // Draw collectibles
    collectibleManager.draw(ctx, camera);
    
    // Draw hazards
    hazardManager.draw(ctx, camera);
    
    // Draw bouncers
    bouncers.forEach(bouncer => {
        if (bouncer.x + bouncer.width > camera.x && 
            bouncer.x < camera.x + CANVAS_WIDTH &&
            bouncer.y + bouncer.height > camera.y &&
            bouncer.y < camera.y + CANVAS_HEIGHT) {
            bouncer.draw(ctx);
        }
    });
    
    // Draw enemies
    enemyManager.draw(ctx, camera);
    
    // Draw powerup effects (before player so effects appear behind)
    powerupSystem.draw(ctx, camera);
    
    // Draw player
    if (player) {
        player.draw(ctx);
    }
    
    // Restore context
    ctx.restore();
    
    // Draw UI (not affected by camera)
    updateUI();
    
    // Draw powerup UI
    powerupSystem.drawUI(ctx, 10, 80);
    
    // Continue loop
    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// Update game UI
function updateUI() {
    // Update score
    document.getElementById('score').textContent = `Score: ${score}`;
    
    // Update lives
    if (player) {
        document.getElementById('lives').textContent = `Lives: ${player.health}`;
        lives = player.health;
    } else {
        document.getElementById('lives').textContent = `Lives: ${lives}`;
    }
    
    // Display enemy count
    document.getElementById('enemies').textContent = `Enemies: ${enemyManager.getEnemyCount()}`;
    
    // Add collectibles info
    const coinsCollected = collectibleManager.getCollectedCount('coin');
    const totalCollected = collectibleManager.getCollectedCount();
    const activeCollectibles = collectibleManager.getActiveCount();
    
    // Create or update collectibles display
    let collectiblesDisplay = document.getElementById('collectibles');
    if (!collectiblesDisplay) {
        collectiblesDisplay = document.createElement('div');
        collectiblesDisplay.id = 'collectibles';
        document.getElementById('game-ui').appendChild(collectiblesDisplay);
    }
    collectiblesDisplay.textContent = `Coins: ${coinsCollected} | Keys: ${collectedKeys} | Items: ${activeCollectibles}`;
    
    // Debug info
    if (player) {
        const debugInfo = `Pos: ${Math.round(player.x)},${Math.round(player.y)} | Vel: ${player.velocityX.toFixed(1)},${player.velocityY.toFixed(1)} | Ground: ${player.isGrounded}`;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(10, CANVAS_HEIGHT - 30, CANVAS_WIDTH - 20, 20);
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(debugInfo, 15, CANVAS_HEIGHT - 15);
    }
}

// Key handler for level switching
window.addEventListener('keydown', (e) => {
    if (gameRunning) {
        switch(e.key.toLowerCase()) {
            case 'l':
                useCustomLevel = !useCustomLevel;
                if (useCustomLevel) {
                    loadLevel(demoLevel);
                } else {
                    loadDefaultLevel();
                }
                console.log(useCustomLevel ? "Loading Demo Level" : "Loading Default Level");
                break;
                
            case 'p':
                // Load Peru level (tile-based)
                loadLevel(PeruLevel);
                console.log("Loading Peru level (tile-based)");
                break;
                
            case 't':
                // Load test tile level
                loadLevel(testLevel);
                console.log("Loading test tile level");
                break;
                
            case '0':
                loadDefaultLevel();
                console.log("Loading default level");
                break;
        }
    }
});

// Initialize when page loads
window.addEventListener('load', init);

// Export constants
export { CANVAS_WIDTH, CANVAS_HEIGHT, GRAVITY, FRICTION };
