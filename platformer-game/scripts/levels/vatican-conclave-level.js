// vatican-conclave-level.js
const vaticanConclaveLevel = {
  name: "Vatican Conclave",
  width: 1600,
  height: 1200,
  playerStart: { x: 100, y: 1100 },
  
  platforms: [
    // Ground floor
    { x: 0, y: 1150, width: 1600, height: 50, type: 'ground' },
    
    // Main chapel floor
    { x: 0, y: 1000, width: 600, height: 30, type: 'platform' },
    { x: 700, y: 1000, width: 900, height: 30, type: 'platform' },
    
    // Confessional booth platforms
    { x: 50, y: 900, width: 120, height: 20, type: 'platform' },
    { x: 220, y: 850, width: 100, height: 20, type: 'platform' },
    
    // Pews (as platforms)
    { x: 400, y: 950, width: 80, height: 15, type: 'platform' },
    { x: 500, y: 950, width: 80, height: 15, type: 'platform' },
    { x: 400, y: 900, width: 80, height: 15, type: 'platform' },
    { x: 500, y: 900, width: 80, height: 15, type: 'platform' },
    
    // Altar area
    { x: 650, y: 920, width: 150, height: 40, type: 'platform' },
    { x: 680, y: 880, width: 90, height: 20, type: 'platform' }, // Altar top
    
    // Holy water font platforms
    { x: 850, y: 950, width: 60, height: 30, type: 'platform' },
    { x: 1100, y: 950, width: 60, height: 30, type: 'platform' },
    
    // Stained glass window ledges (left side)
    { x: 0, y: 800, width: 100, height: 20, type: 'one-way' },
    { x: 150, y: 750, width: 100, height: 20, type: 'one-way' },
    { x: 0, y: 650, width: 100, height: 20, type: 'one-way' },
    { x: 150, y: 600, width: 100, height: 20, type: 'one-way' },
    
    // Stained glass window ledges (right side)
    { x: 1500, y: 800, width: 100, height: 20, type: 'one-way' },
    { x: 1350, y: 750, width: 100, height: 20, type: 'one-way' },
    { x: 1500, y: 650, width: 100, height: 20, type: 'one-way' },
    { x: 1350, y: 600, width: 100, height: 20, type: 'one-way' },
    
    // Mid-level gallery
    { x: 300, y: 700, width: 1000, height: 30, type: 'platform' },
    
    // Statue pedestals
    { x: 350, y: 650, width: 80, height: 50, type: 'platform' },
    { x: 550, y: 650, width: 80, height: 50, type: 'platform' },
    { x: 950, y: 650, width: 80, height: 50, type: 'platform' },
    { x: 1150, y: 650, width: 80, height: 50, type: 'platform' },
    
    // Upper gallery platforms
    { x: 200, y: 500, width: 300, height: 25, type: 'platform' },
    { x: 600, y: 450, width: 400, height: 25, type: 'platform' },
    { x: 1100, y: 500, width: 300, height: 25, type: 'platform' },
    
    // Bell tower access
    { x: 750, y: 350, width: 100, height: 20, type: 'platform' },
    { x: 700, y: 250, width: 200, height: 20, type: 'platform' },
    
    // Crosses (small platforms)
    { x: 300, y: 1100, width: 40, height: 40, type: 'platform' },
    { x: 1300, y: 1100, width: 40, height: 40, type: 'platform' },
    { x: 800, y: 150, width: 60, height: 60, type: 'platform' }, // Top cross
    
    // Moving platforms (elevating platforms)
    { x: 100, y: 950, width: 80, height: 20, type: 'moving',
      moveX: 0, moveY: 200, moveSpeed: 0.3, moveTiming: 'sine' }, // Left elevator
    { x: 1400, y: 950, width: 80, height: 20, type: 'moving',
      moveX: 0, moveY: 200, moveSpeed: 0.3, moveTiming: 'sine' }, // Right elevator
    { x: 700, y: 600, width: 100, height: 20, type: 'moving',
      moveX: 200, moveY: 0, moveSpeed: 0.5, moveTiming: 'sine' }, // Gallery connector
    { x: 600, y: 300, width: 80, height: 20, type: 'moving',
      moveX: 0, moveY: 100, moveSpeed: 0.4, moveTiming: 'sine' } // Tower access
  ],
  
  enemies: [
    // Ground floor guards
    { type: 'walker', x: 200, y: 1100 },
    { type: 'walker', x: 500, y: 1100 },
    { type: 'walker', x: 900, y: 1100 },
    { type: 'walker', x: 1200, y: 1100 },
    
    // Pew area enemies
    { type: 'jumper', x: 450, y: 850 },
    { type: 'jumper', x: 550, y: 850 },
    
    // Gallery defenders
    { type: 'shooter', x: 400, y: 650 },
    { type: 'shooter', x: 1000, y: 650 },
    { type: 'shooter', x: 800, y: 400 },
    
    // Flying angels (flyer enemies)
    { type: 'flyer', x: 300, y: 800 },
    { type: 'flyer', x: 800, y: 550 },
    { type: 'flyer', x: 1200, y: 600 },
    { type: 'flyer', x: 600, y: 350 },
    
    // Elite guards
    { type: 'chaser', x: 350, y: 450 },
    { type: 'chaser', x: 1250, y: 450 },
    
    // Holy guardian (boss)
    { type: 'boss', x: 750, y: 200 }
  ],
  
  coins: [
    // Ground level coins
    { x: 150, y: 1100 },
    { x: 250, y: 1100 },
    { x: 750, y: 1100 },
    { x: 1050, y: 1100 },
    { x: 1350, y: 1100 },
    
    // Pew area coins
    { x: 440, y: 850 },
    { x: 540, y: 850 },
    
    // Altar coins
    { x: 700, y: 850 },
    { x: 730, y: 850 },
    { x: 760, y: 850 },
    
    // Window ledge coins
    { x: 50, y: 750 },
    { x: 200, y: 700 },
    { x: 50, y: 600 },
    { x: 1400, y: 700 },
    { x: 1550, y: 600 },
    
    // Gallery coins
    { x: 400, y: 650 },
    { x: 600, y: 650 },
    { x: 800, y: 650 },
    { x: 1000, y: 650 },
    { x: 1200, y: 650 },
    
    // Upper level coins
    { x: 350, y: 450 },
    { x: 800, y: 400 },
    { x: 1250, y: 450 },
    
    // Tower coins
    { x: 750, y: 300 },
    { x: 800, y: 300 },
    { x: 850, y: 300 },
    
    // Secret/holy coins
    { x: 320, y: 1050 }, // Behind cross
    { x: 1320, y: 1050 }, // Behind cross
    { x: 800, y: 100 } // Above final cross
  ],
  
  bouncers: [
    // Holy springs
    { x: 380, y: 980, width: 60, height: 20, bounceForce: -14 },
    { x: 580, y: 980, width: 60, height: 20, bounceForce: -14 },
    { x: 800, y: 680, width: 80, height: 20, bounceForce: -18 },
    { x: 750, y: 480, width: 60, height: 20, bounceForce: -20 }
  ],
  
  // Special holy items
  powerups: [
    { type: 'holy_water', x: 875, y: 920, effect: 'invincibility' },
    { type: 'cross', x: 730, y: 830, effect: 'double_jump' },
    { type: 'bible', x: 100, y: 550, effect: 'shield' },
    { type: 'chalice', x: 1400, y: 550, effect: 'health' },
    { type: 'papal_key', x: 800, y: 50, effect: 'unlock_secret' }
  ],
  
  // Decorative elements (for atmosphere)
  decorations: [
    { type: 'statue', x: 380, y: 600 },
    { type: 'statue', x: 580, y: 600 },
    { type: 'statue', x: 980, y: 600 },
    { type: 'statue', x: 1180, y: 600 },
    { type: 'candles', x: 690, y: 860 },
    { type: 'banner', x: 400, y: 500 },
    { type: 'banner', x: 1200, y: 500 }
  ],
  
  // Visual theme
  theme: {
    background: 'vatican_interior',
    music: 'gregorian_chant',
    ambientEffects: ['incense', 'light_rays', 'candle_flicker']
  }
};

export default vaticanConclaveLevel;
