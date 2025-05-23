// Add these imports at the top of your game.js file (after the existing imports)
import jungleTempleLevel from '../levels/jungle-temple-level.js';
import chicagoStreetLevel from '../levels/chicago-street-level.js';
import chicagoNeighborhoodLevel from '../levels/chicago-neighborhood-level.js';
import vaticanConclaveLevel from '../levels/vatican-conclave-level.js';

// Add this to your existing key handler (around line 500-510 where you have the 'L' key handler)
window.addEventListener('keydown', (e) => {
    // Your existing key handlers...
    
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

// Optional: Add a level select menu
function createLevelSelectUI() {
    const levelInfo = document.createElement('div');
    levelInfo.id = 'level-info';
    levelInfo.style.cssText = `
        position: absolute;
        bottom: 10px;
        left: 10px;
        color: white;
        font-family: Arial, sans-serif;
        font-size: 14px;
        text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5);
        background: rgba(0, 0, 0, 0.5);
        padding: 10px;
        border-radius: 5px;
    `;
    levelInfo.innerHTML = `
        <strong>Level Select:</strong><br>
        L - Toggle Demo Level<br>
        1 - Jungle Temple<br>
        2 - Chicago Streets<br>
        3 - Chicago Neighborhood<br>
        4 - Vatican Conclave<br>
        0 - Default Level
    `;
    document.getElementById('game-container').appendChild(levelInfo);
}

// Call this in your init() function
function init() {
    // Your existing init code...
    
    // Add level select UI
    createLevelSelectUI();
}

// Optional: Update the loadLevel function to handle special level features
function loadLevel(levelData) {
    currentLevel = levelData;
    
    // Your existing loadLevel code...
    
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
