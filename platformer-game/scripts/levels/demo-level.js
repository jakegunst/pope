// demo-level.js - A demo level featuring all enemy types
export default {
  name: "Enemy Showcase",
  width: 3500,
  height: 600,
  
  // Player starting position
  playerStart: {
    x: 100,
    y: 300
  },
  
  // Platforms for the level
  platforms: [
    // Main ground
    { x: 0, y: 500, width: 3500, height: 100, type: "normal" },
    
    // Walker section
    { x: 250, y: 420, width: 150, height: 20, type: "normal" },
    
    // Jumper section
    { x: 450, y: 420, width: 150, height: 20, type: "normal" },
    
    // Flyer section
    { x: 650, y: 370, width: 150, height: 20, type: "normal" },
    { x: 650, y: 270, width: 50, height: 20, type: "normal" },
    { x: 750, y: 270, width: 50, height: 20, type: "normal" },
    
    // Shooter section
    { x: 850, y: 420, width: 150, height: 20, type: "normal" },
    
    // Flipper section
    { x: 1050, y: 420, width: 150, height: 20, type: "normal" },
    { x: 1050, y: 320, width: 50, height: 20, type: "normal" },
    { x: 1150, y: 320, width: 50, height: 20, type: "normal" },
    
    // Walking shooter section
    { x: 1250, y: 420, width: 200, height: 20, type: "normal" },
    
    // Big walker section
    { x: 1500, y: 420, width: 200, height: 20, type: "normal" },
    
    // Fast walker section
    { x: 1750, y: 420, width: 250, height: 20, type: "normal" },
    { x: 1800, y: 370, width: 50, height: 50, type: "normal" },
    { x: 1900, y: 370, width: 50, height: 50, type: "normal" },
    
    // Chaser section
    { x: 2050, y: 420, width: 200, height: 20, type: "normal" },
    { x: 2050, y: 320, width: 50, height: 20, type: "normal" },
    { x: 2200, y: 370, width: 50, height: 20, type: "normal" },
    
    // Ranged attack section
    { x: 2300, y: 420, width: 200, height: 20, type: "normal" },
    { x: 2350, y: 320, width: 100, height: 20, type: "normal" },
    
    // Boss area
    { x: 2550, y: 450, width: 300, height: 20, type: "normal" },
    { x: 2550, y: 250, width: 20, height: 200, type: "normal" },
    { x: 2830, y: 250, width: 20, height: 200, type: "normal" },
    
    // Bouncer showcase
    { x: 3000, y: 500, width: 350, height: 100, type: "normal" },
    { x: 3100, y: 420, width: 50, height: 20, type: "normal" },
    { x: 3200, y: 340, width: 50, height: 20, type: "normal" },
    { x: 3300, y: 260, width: 50, height: 20, type: "normal" }
  ],
  
  // Bouncers for the level
  bouncers: [
    { x: 3050, y: 480, width: 40, height: 20 },
    { x: 3150, y: 400, width: 40, height: 20 },
    { x: 3250, y: 320, width: 40, height: 20 }
  ],
  
  // All enemy types showcased
  enemies: [
    // Section 1: Basic enemies
    { type: 'walker', x: 250, y: 400 },
    { type: 'jumper', x: 450, y: 400 },
    { type: 'flyer', x: 650, y: 250 },
    { type: 'shooter', x: 850, y: 400 },
    
    // Section 2: New enemies
    { type: 'flipper', x: 1050, y: 400 },
    { type: 'walkingshooter', x: 1300, y: 400 },
    { type: 'bigwalker', x: 1550, y: 400 },
    { type: 'fastwalker', x: 1800, y: 400 },
    { type: 'chaser', x: 2100, y: 400 },
    { type: 'rangedattack', x: 2400, y: 400 },
    
    // Section 3: Boss battle
    { type: 'boss', x: 2700, y: 350 }
  ],
  
  // Collectibles (coins, etc)
  collectibles: [
    // Walker section coins
    { x: 250, y: 370, type: "coin" },
    { x: 300, y: 370, type: "coin" },
    { x: 350, y: 370, type: "coin" },
    
    // Jumper section coins
    { x: 450, y: 370, type: "coin" },
    { x: 500, y: 350, type: "coin" },
    { x: 550, y: 370, type: "coin" },
    
    // Flyer section coins
    { x: 650, y: 220, type: "coin" },
    { x: 700, y: 220, type: "coin" },
    { x: 750, y: 220, type: "coin" },
    
    // Shooter section coins
    { x: 850, y: 370, type: "coin" },
    { x: 900, y: 370, type: "coin" },
    { x: 950, y: 370, type: "coin" },
    
    // Flipper section coins
    { x: 1050, y: 270, type: "coin" },
    { x: 1100, y: 270, type: "coin" },
    { x: 1150, y: 270, type: "coin" },
    
    // Walking shooter section
    { x: 1275, y: 370, type: "coin" },
    { x: 1325, y: 370, type: "coin" },
    { x: 1375, y: 370, type: "coin" },
    
    // Big walker section
    { x: 1525, y: 370, type: "coin" },
    { x: 1575, y: 370, type: "coin" },
    { x: 1625, y: 370, type: "coin" },
    
    // Fast walker section
    { x: 1775, y: 320, type: "coin" },
    { x: 1825, y: 320, type: "coin" },
    { x: 1875, y: 320, type: "coin" },
    { x: 1925, y: 320, type: "coin" },
    
    // Chaser section
    { x: 2075, y: 270, type: "coin" },
    { x: 2125, y: 270, type: "coin" },
    { x: 2175, y: 320, type: "coin" },
    { x: 2225, y: 320, type: "coin" },
    
    // Ranged attack section
    { x: 2325, y: 270, type: "coin" },
    { x: 2375, y: 270, type: "coin" },
    { x: 2425, y: 270, type: "coin" },
    
    // Boss arena coins (reward)
    { x: 2600, y: 400, type: "coin" },
    { x: 2650, y: 400, type: "coin" },
    { x: 2700, y: 400, type: "coin" },
    { x: 2750, y: 400, type: "coin" },
    { x: 2800, y: 400, type: "coin" },
    
    // Bouncer section coins
    { x: 3050, y: 420, type: "coin" },
    { x: 3150, y: 340, type: "coin" },
    { x: 3250, y: 260, type: "coin" },
    { x: 3350, y: 200, type: "coin" }
  ],
  
  // Signs to explain the enemy types
  signs: [
    { x: 100, y: 450, text: "ENEMY SHOWCASE LEVEL\n→ Check out each enemy type!" },
    { x: 250, y: 350, text: "WALKER\nBasic enemy that walks back & forth" },
    { x: 450, y: 350, text: "JUMPER\nStationary enemy that jumps periodically" },
    { x: 650, y: 200, text: "FLYER\nFlying enemy that now does dive bombs!" },
    { x: 850, y: 350, text: "SHOOTER\nStationary enemy that fires projectiles" },
    { x: 1050, y: 350, text: "FLIPPER\nDoes flips while jumping!" },
    { x: 1275, y: 350, text: "WALKING SHOOTER\nMobile enemy that shoots" },
    { x: 1550, y: 350, text: "BIG WALKER\nLarger enemy with more health" },
    { x: 1800, y: 350, text: "FAST WALKER\nSpeedy enemy that jumps obstacles" },
    { x: 2100, y: 350, text: "CHASER\nAggressively pursues when in range" },
    { x: 2400, y: 350, text: "RANGED ATTACKER\nThrows returning boomerangs" },
    { x: 2600, y: 400, text: "BOSS BATTLE!\nMulti-phase challenging enemy" },
    { x: 3000, y: 450, text: "BOUNCERS\nUse these to reach high places!" }
  ]
};
