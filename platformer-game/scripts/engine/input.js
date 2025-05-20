// Input handling system

// Keyboard state
export let keys = {};

// Set up keyboard input listeners
export function setupInputListeners() {
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });
    
    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
}

// Helper function to check if a key is pressed
export function isKeyDown(key) {
    return keys[key] === true;
}