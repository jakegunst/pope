// chicago-street-level.js
const chicagoStreetLevel = {
  name: "Chicago Streets",
  width: 1800,
  height: 800,
  playerStart: { x: 100, y: 500 },
  
  platforms: [
    // Street level (main ground)
    { x: 0, y: 700, width: 1800, height: 100, type: 'ground' },
    
    // Underground platforms (subway entrance areas)
    { x: 50, y: 620, width: 200, height: 20, type: 'platform' },
    { x: 400, y: 620, width: 150, height: 20, type: 'platform' },
    { x: 1000, y: 620, width: 200, height: 20, type: 'platform' },
    { x: 1500, y: 620, width: 150, height: 20, type: 'platform' },
    
    // Street-level objects (fire hydrants, mailboxes as small platforms)
    { x: 300, y: 680, width: 40, height: 20, type: 'platform' },
    { x: 600, y: 680, width: 40, height: 20, type: 'platform' },
    { x: 900, y: 680, width: 40, height: 20, type: 'platform' },
    { x: 1400, y: 680, width: 40, height: 20, type: 'platform' },
    
    // Building awnings and fire escapes
    { x: 0, y: 500, width: 150, height: 20, type: 'one-way' },
    { x: 200, y: 450, width: 120, height: 20, type: 'one-way' },
    { x: 380, y: 400, width: 140, height: 20, type: 'one-way' },
    { x: 580, y: 480, width: 100, height: 20, type: 'one-way' },
    { x: 750, y: 420, width: 120, height: 20, type: 'one-way' },
    { x: 920, y: 380, width: 130, height: 20, type: 'one-way' },
    { x: 1100, y: 450, width: 140, height: 20, type: 'one-way' },
    { x: 1300, y: 400, width: 120, height: 20, type: 'one-way' },
    { x: 1500, y: 480, width: 150, height: 20, type: 'one-way' },
    
    // Higher building ledges
    { x: 100, y: 300, width: 100, height: 20, type: 'one-way' },
    { x: 300, y: 250, width: 120, height: 20, type: 'one-way' },
    { x: 500, y: 280, width: 100, height: 20, type: 'one-way' },
    { x: 700, y: 220, width: 140, height: 20, type: 'one-way' },
    { x: 1000, y: 260, width: 120, height: 20, type: 'one-way' },
    { x: 1200, y: 200, width: 100, height: 20, type: 'one-way' },
    { x: 1400, y: 280, width: 130, height: 20, type: 'one-way' },
    
    // Rooftop level
    { x: 0, y: 150, width: 200, height: 40, type: 'platform' },
    { x: 400, y: 120, width: 250, height: 40, type: 'platform' },
    { x: 800, y: 100, width: 200, height: 40, type: 'platform' },
    { x: 1200, y: 130, width: 180, height: 40, type: 'platform' },
    { x: 1500, y: 140, width: 200, height: 40, type: 'platform' },
    
    // Moving platforms (window washer platforms, construction lifts)
    { x: 250, y: 550, width: 80, height: 20, type: 'moving',
      moveX: 0, moveY: 200, moveSpeed: 0.4, moveTiming: 'sine' },
    { x: 650, y: 350, width: 100, height: 20, type: 'moving',
      moveX: 150, moveY: 0, moveSpeed: 0.6, moveTiming: 'linear' },
    { x: 1050, y: 500, width: 80, height: 20, type: 'moving',
      moveX: 0, moveY: 150, moveSpeed: 0.5, moveTiming: 'sine' },
    { x: 1350, y: 300, width: 100, height: 20, type: 'moving',
      moveX: 100, moveY: 100, moveSpeed: 0.7, moveTiming: 'sine' }
  ],
  
  enemies: [
    // Street level enemies
    { type: 'walker', x: 200, y: 650 },
    { type: 'walker', x: 500, y: 650 },
    { type: 'walker', x: 800, y: 650 },
    { type: 'walker', x: 1300, y: 650 },
    
    // Fast enemies on lower platforms
    { type: 'fastwalker', x: 300, y: 400 },
    { type: 'fastwalker', x: 900, y: 350 },
    
    // Jumpers on mid-level
    { type: 'jumper', x: 400, y: 350 },
    { type: 'jumper', x: 1100, y: 400 },
    
    // Shooters in windows (stationary threats)
    { type: 'shooter', x: 150, y: 250 },
    { type: 'shooter', x: 750, y: 180 },
    { type: 'shooter', x: 1250, y: 160 },
    
    // Flying enemies between buildings
    { type: 'flyer', x: 350, y: 300 },
    { type: 'flyer', x: 700, y: 350 },
    { type: 'flyer', x: 1150, y: 300 },
    
    // Chasers on rooftops
    { type: 'chaser', x: 100, y: 100 },
    { type: 'chaser', x: 900, y: 50 },
    
    // Ranged enemies on high buildings
    { type: 'rangedattack', x: 500, y: 80 },
    { type: 'rangedattack', x: 1300, y: 90 }
  ],
  
  coins: [
    // Street level coins
    { x: 150, y: 650 },
    { x: 250, y: 650 },
    { x: 350, y: 650 },
    
    // Fire escape route coins
    { x: 250, y: 400 },
    { x: 450, y: 350 },
    { x: 650, y: 430 },
    { x: 850, y: 370 },
    
    // Rooftop coins
    { x: 100, y: 100 },
    { x: 500, y: 70 },
    { x: 900, y: 50 },
    { x: 1300, y: 80 },
    
    // Underground area coins
    { x: 150, y: 580 },
    { x: 475, y: 580 },
    { x: 1100, y: 580 },
    
    // Mid-air coins (require precise jumps)
    { x: 400, y: 500 },
    { x: 700, y: 400 },
    { x: 1000, y: 450 },
    { x: 1400, y: 350 },
    
    // Secret coins (behind/between buildings)
    { x: 50, y: 250 },
    { x: 1650, y: 200 },
    { x: 600, y: 150 }
  ],
  
  bouncers: [
    // Street level bouncers (manholes, springs)
    { x: 400, y: 680, width: 60, height: 20, bounceForce: -16 },
    { x: 750, y: 680, width: 60, height: 20, bounceForce: -18 },
    { x: 1150, y: 680, width: 60, height: 20, bounceForce: -16 },
    
    // Rooftop bouncers for reaching higher areas
    { x: 300, y: 100, width: 50, height: 20, bounceForce: -20 },
    { x: 1100, y: 80, width: 50, height: 20, bounceForce: -22 }
  ],
  
  // Power-ups matching the collectibles in the image
  powerups: [
    { type: 'potion', x: 600, y: 630, effect: 'speed' },
    { type: 'potion', x: 1200, y: 430, effect: 'jump' },
    { type: 'trophy', x: 700, y: 150, effect: 'bonus_points' },
    { type: 'hotdog', x: 300, y: 550, effect: 'health' },
    { type: 'pizza', x: 1000, y: 630, effect: 'health' }
  ],
  
  // Visual theme
  theme: {
    background: 'chicago_skyline',
    music: 'urban_beat',
    ambientEffects: ['traffic', 'birds', 'wind']
  }
};

export default chicagoStreetLevel;
