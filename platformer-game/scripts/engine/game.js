// Updated game.js to fix bouncer placement and make them less bouncy
import * as Utils from './utils.js';
import { keys } from './input.js';

// Import game objects
import Player from '../objects/player.js';
import Platform from '../objects/platform.js';
import Bouncer from '../objects/bouncer.js';

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
let enemies = [];
let bouncers = []; // Array for bouncers

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
    
    // Initialize game objects
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
    
    enemies = [];
    
    // Start game loop
    gameRunning = true;
    requestAnimationFrame(gameLoop);
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
    
    // Draw platforms
    platforms.forEach(platform => {
        platform.draw(ctx);
    });
    
    // Draw bouncers
    bouncers.forEach(bouncer => {
        bouncer.draw(ctx);
    });
    
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
        
        // Draw player
        player.draw(ctx);
    }
    
    // Draw UI
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
    document.getElementById('lives').textContent = `Lives: ${lives}`;
    
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

// Initialize the game when the page loads
window.addEventListener('load', init);

// Export the constants if needed elsewhere
export { CANVAS_WIDTH, CANVAS_HEIGHT, GRAVITY, FRICTION };