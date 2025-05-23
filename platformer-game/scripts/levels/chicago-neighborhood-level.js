// chicago-neighborhood-level.js
const chicagoNeighborhoodLevel = {
  name: "Chicago Neighborhood",
  width: 2000,
  height: 800,
  playerStart: { x: 50, y: 600 },
  
  platforms: [
    // Main street level
    { x: 0, y: 750, width: 2000, height: 50, type: 'ground' },
    
    // Sidewalk sections (slightly raised)
    { x: 0, y: 730, width: 400, height: 20, type: 'platform' },
    { x: 500, y: 730, width: 300, height: 20, type: 'platform' },
    { x: 900, y: 730, width: 400, height: 20, type: 'platform' },
    { x: 1400, y: 730, width: 600, height: 20, type: 'platform' },
    
    // Maria's entrance platform
    { x: 50, y: 650, width: 150, height: 20, type: 'platform' },
    
    // Pequod's Pizza building platforms
    { x: 400, y: 600, width: 200, height: 20, type: 'platform' }, // Awning
    { x: 350, y: 500, width: 100, height: 20, type: 'one-way' }, // Window ledge
    { x: 500, y: 450, width: 120, height: 20, type: 'one-way' }, // Upper window
    { x: 400, y: 350, width: 200, height: 40, type: 'platform' }, // Roof
    
    // Alley gap platforms
    { x: 650, y: 650, width: 60, height: 20, type: 'platform' },
    { x: 750, y: 550, width: 60, height: 20, type: 'platform' },
    { x: 650, y: 450, width: 60, height: 20, type: 'platform' },
    
    // Old Town Ale House building
    { x: 850, y: 600, width: 300, height: 20, type: 'platform' }, // Main awning
    { x: 900, y: 500, width: 80, height: 20, type: 'one-way' }, // Left window
    { x: 1020, y: 500, width: 80, height: 20, type: 'one-way' }, // Right window
    { x: 950, y: 400, width: 100, height: 20, type: 'one-way' }, // Middle window
    { x: 850, y: 300, width: 300, height: 40, type: 'platform' }, // Roof
    { x: 900, y: 250, width: 200, height: 20, type: 'platform' }, // Upper roof section
    
    // Fire escape platforms
    { x: 800, y: 680, width: 50, height: 15, type: 'one-way' },
    { x: 820, y: 580, width: 50, height: 15, type: 'one-way' },
    { x: 800, y: 480, width: 50, height: 15, type: 'one-way' },
    { x: 820, y: 380, width: 50, height: 15, type: 'one-way' },
    
    // Street lamp platforms (can jump on top)
    { x: 300, y: 680, width: 30, height: 30, type: 'platform' },
    { x: 700, y: 680, width: 30, height: 30, type: 'platform' },
    { x: 1200, y: 680, width: 30, height: 30, type: 'platform' },
    { x: 1600, y: 680, width: 30, height: 30, type: 'platform' },
    
    // Background buildings platforms
    { x: 1250, y: 550, width: 150, height: 20, type: 'platform' },
    { x: 1450, y: 600, width: 200, height: 20, type: 'platform' },
    { x: 1500, y: 450, width: 100, height: 20, type: 'one-way' },
    { x: 1700, y: 500, width: 150, height: 20, type: 'platform' },
    
    // Rooftop connections
    { x: 600, y: 320, width: 250, height: 20, type: 'one-way' }, // Between buildings
    { x: 1150, y: 280, width: 100, height: 20, type: 'one-way' }, // High platform
    
    // Moving platforms
    { x: 250, y: 550, width: 80, height: 20, type: 'moving',
      moveX: 0, moveY: 100, moveSpeed: 0.5, moveTiming: 'sine' }, // Delivery lift
    { x: 1300, y: 400, width: 100, height: 20, type: 'moving',
      moveX: 150, moveY: 0, moveSpeed: 0.6, moveTiming: 'linear' }, // Between roofs
    { x: 750, y: 350, width: 60, height: 20, type: 'moving',
      moveX: 0, moveY: 150, moveSpeed: 0.4, moveTiming: 'sine' } // Alley lift
  ],
  
  enemies: [
    // Street level enemies
    { type: 'walker', x: 250, y: 700 },
    { type: 'walker', x: 600, y: 700 },
    { type: 'walker', x: 1000, y: 700 },
    { type: 'walker', x: 1500, y: 700 },
    
    // Pizza delivery enemies (fast walkers)
    { type: 'fastwalker', x: 450, y: 550 },
    { type: 'fastwalker', x: 950, y: 550 },
    
    // Rooftop enemies
    { type: 'jumper', x: 500, y: 300 },
    { type: 'jumper', x: 1000, y: 250 },
    
    // Window shooters
    { type: 'shooter', x: 380, y: 450 },
    { type: 'shooter', x: 950, y: 360 },
    { type: 'shooter', x: 1550, y: 400 },
    
    // Flying enemies between buildings
    { type: 'flyer', x: 700, y: 400 },
    { type: 'flyer', x: 1100, y: 350 },
    { type: 'flyer', x: 1400, y: 450 },
    
    // Chasers in alleys
    { type: 'chaser', x: 680, y: 600 },
    { type: 'chaser', x: 1350, y: 500 },
    
    // Boss enemy on Old Town Ale House roof
    { type: 'boss', x: 1000, y: 200 }
  ],
  
  coins: [
    // Street level coins
    { x: 100, y: 700 },
    { x: 200, y: 700 },
    { x: 300, y: 700 },
    { x: 800, y: 700 },
    { x: 1100, y: 700 },
    { x: 1400, y: 700 },
    
    // Pequod's area coins
    { x: 400, y: 550 },
    { x: 450, y: 550 },
    { x: 500, y: 400 },
    { x: 550, y: 400 },
    
    // Old Town Ale House coins
    { x: 900, y: 550 },
    { x: 1000, y: 550 },
    { x: 1100, y: 550 },
    { x: 1000, y: 350 },
    
    // Rooftop coins
    { x: 500, y: 300 },
    { x: 1000, y: 200 },
    { x: 700, y: 270 },
    { x: 1200, y: 230 },
    
    // Alley coins
    { x: 680, y: 600 },
    { x: 680, y: 500 },
    { x: 680, y: 400 },
    
    // Fire escape coins
    { x: 825, y: 530 },
    { x: 825, y: 430 },
    { x: 825, y: 330 },
    
    // Hidden coins
    { x: 50, y: 600 }, // Behind Maria's
    { x: 1950, y: 450 }, // Far right building
    { x: 1000, y: 150 } // Above boss
  ],
  
  bouncers: [
    // Street level bouncers
    { x: 400, y: 710, width: 60, height: 20, bounceForce: -16 },
    { x: 900, y: 710, width: 60, height: 20, bounceForce: -18 },
    { x: 1300, y: 710, width: 60, height: 20, bounceForce: -16 },
    
    // Rooftop super bouncer
    { x: 750, y: 280, width: 80, height: 20, bounceForce: -22 }
  ],
  
  // Special collectibles
  powerups: [
    { type: 'pizza_slice', x: 500, y: 320, effect: 'health' }, // On Pequod's roof
    { type: 'beer', x: 1000, y: 270, effect: 'invincibility' }, // On Ale House roof
    { type: 'hot_dog', x: 300, y: 650, effect: 'speed' },
    { type: 'trophy', x: 1000, y: 180, effect: 'bonus_points' } // Above boss
  ],
  
  // NPCs or special elements
  npcs: [
    { type: 'pope', x: 470, y: 550, dialogue: "Try the caramelized crust!" },
    { type: 'bartender', x: 1000, y: 550, dialogue: "Welcome to Old Town!" }
  ],
  
  // Visual theme
  theme: {
    background: 'chicago_evening',
    music: 'neighborhood_jazz',
    ambientEffects: ['neon_signs', 'steam', 'streetlights']
  }
};

export default chicagoNeighborhoodLevel;
