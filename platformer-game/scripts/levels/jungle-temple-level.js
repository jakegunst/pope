// jungle-temple-level.js
const jungleTempleLevel = {
  name: "Jungle Temple",
  width: 1600,
  height: 800,
  playerStart: { x: 50, y: 600 },
  
  platforms: [
    // Ground level
    { x: 0, y: 760, width: 1600, height: 40, type: 'ground' },
    
    // Left side temple blocks
    { x: 100, y: 680, width: 120, height: 80, type: 'platform' },
    { x: 50, y: 600, width: 80, height: 80, type: 'platform' },
    { x: 180, y: 620, width: 100, height: 60, type: 'platform' },
    
    // Lower middle section
    { x: 320, y: 640, width: 200, height: 40, type: 'platform' },
    { x: 380, y: 580, width: 80, height: 60, type: 'platform' },
    
    // Central temple structure
    { x: 600, y: 500, width: 160, height: 40, type: 'platform' },
    { x: 640, y: 440, width: 80, height: 60, type: 'platform' },
    { x: 580, y: 380, width: 200, height: 40, type: 'platform' },
    { x: 620, y: 320, width: 120, height: 60, type: 'platform' },
    
    // Right side temple
    { x: 900, y: 560, width: 140, height: 40, type: 'platform' },
    { x: 880, y: 480, width: 180, height: 40, type: 'platform' },
    { x: 920, y: 400, width: 100, height: 40, type: 'platform' },
    { x: 960, y: 340, width: 80, height: 40, type: 'platform' },
    
    // Upper platforms
    { x: 300, y: 280, width: 120, height: 20, type: 'one-way' },
    { x: 500, y: 200, width: 100, height: 20, type: 'one-way' },
    { x: 800, y: 240, width: 120, height: 20, type: 'one-way' },
    
    // Far right structures
    { x: 1200, y: 600, width: 100, height: 160, type: 'platform' },
    { x: 1320, y: 520, width: 120, height: 40, type: 'platform' },
    { x: 1280, y: 440, width: 80, height: 40, type: 'platform' },
    { x: 1380, y: 380, width: 100, height: 40, type: 'platform' },
    
    // Floating platforms for traversal
    { x: 450, y: 460, width: 80, height: 20, type: 'one-way' },
    { x: 780, y: 420, width: 80, height: 20, type: 'one-way' },
    { x: 1100, y: 480, width: 80, height: 20, type: 'one-way' },
    
    // Moving platforms
    { x: 250, y: 500, width: 80, height: 20, type: 'moving',
      moveX: 100, moveY: 0, moveSpeed: 0.5, moveTiming: 'sine' },
    { x: 700, y: 280, width: 80, height: 20, type: 'moving',
      moveX: 0, moveY: 80, moveSpeed: 0.6, moveTiming: 'sine' },
    { x: 1000, y: 600, width: 100, height: 20, type: 'moving',
      moveX: 150, moveY: 0, moveSpeed: 0.7, moveTiming: 'sine' }
  ],
  
  enemies: [
    // Ground level enemies
    { type: 'walker', x: 200, y: 700 },
    { type: 'walker', x: 500, y: 700 },
    { type: 'walker', x: 1100, y: 700 },
    
    // Platform enemies
    { type: 'jumper', x: 400, y: 540 },
    { type: 'jumper', x: 920, y: 460 },
    
    // Temple guardians
    { type: 'shooter', x: 660, y: 280 },
    { type: 'shooter', x: 1300, y: 480 },
    
    // Flying enemies
    { type: 'flyer', x: 350, y: 350 },
    { type: 'flyer', x: 800, y: 300 },
    { type: 'flyer', x: 1200, y: 350 },
    
    // Chasers on upper platforms
    { type: 'chaser', x: 350, y: 240 },
    { type: 'chaser', x: 850, y: 200 },
    
    // Boss enemy at the temple peak
    { type: 'boss', x: 680, y: 240 }
  ],
  
  coins: [
    // Left side coins
    { x: 60, y: 680 },
    { x: 160, y: 550 },
    { x: 240, y: 600 },
    
    // Middle path coins
    { x: 400, y: 540 },
    { x: 460, y: 540 },
    { x: 520, y: 540 },
    
    // Temple entrance
    { x: 640, y: 400 },
    { x: 680, y: 400 },
    { x: 720, y: 400 },
    
    // Upper route coins
    { x: 350, y: 240 },
    { x: 550, y: 160 },
    { x: 850, y: 200 },
    
    // Right side coins
    { x: 1250, y: 560 },
    { x: 1350, y: 480 },
    { x: 1400, y: 340 },
    
    // Hidden coins (reward for exploration)
    { x: 300, y: 180 },
    { x: 800, y: 140 },
    { x: 1450, y: 340 }
  ],
  
  bouncers: [
    // Help reach higher platforms
    { x: 160, y: 740, width: 60, height: 20, bounceForce: -18 },
    { x: 540, y: 660, width: 60, height: 20, bounceForce: -16 },
    { x: 840, y: 740, width: 60, height: 20, bounceForce: -20 },
    { x: 1150, y: 740, width: 60, height: 20, bounceForce: -18 }
  ],
  
  // Visual theme hints for future implementation
  theme: {
    background: 'jungle_sunset',
    music: 'temple_mystery',
    ambientEffects: ['leaves', 'fireflies']
  }
};

export default jungleTempleLevel;
