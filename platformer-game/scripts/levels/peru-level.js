export const PeruLevel = {
  name: 'Peru',
  width: 12800, // 400 tiles * 32 pixels per tile
  height: 5760, // 180 tiles * 32 pixels per tile
  playerStart: { x: 32, y: 5664 }, // X position at tile (1, 177)
  
  platforms: [
    // Bottom ground - the main floor (row 179)
    { x: 0, y: 5728, width: 576, height: 32, type: 'ground' }, // Left ground section
    { x: 576, y: 5728, width: 12224, height: 32, type: 'ground' }, // Main ground (B tiles)
    
    // Starting area platforms (left side)
    { x: 608, y: 5024, width: 256, height: 32, type: 'platform' }, // P platform
    { x: 768, y: 4960, width: 32, height: 32, type: 'platform' }, // P
    { x: 768, y: 4928, width: 32, height: 32, type: 'platform' }, // P
    { x: 768, y: 4896, width: 32, height: 32, type: 'platform' }, // P
    { x: 768, y: 4864, width: 32, height: 32, type: 'platform' }, // P
    { x: 672, y: 4800, width: 128, height: 32, type: 'platform' }, // PPPP
    
    // Pyramid structure (around x: 2240)
    { x: 2240, y: 2528, width: 512, height: 32, type: 'one-way' }, // TTTTTTTTTTTT
    { x: 2368, y: 2336, width: 320, height: 32, type: 'one-way' }, // TTTTTTTT
    { x: 2464, y: 2176, width: 160, height: 32, type: 'one-way' }, // TTTTT
    { x: 2528, y: 2048, width: 160, height: 32, type: 'one-way' }, // TTTTT
    
    // Platform sections with enemies (middle area)
    { x: 3520, y: 1792, width: 320, height: 32, type: 'platform' }, // PPPPPP
    { x: 3936, y: 1664, width: 256, height: 32, type: 'platform' }, // PPPPPP
    
    // Moving platforms
    { x: 4064, y: 1600, width: 128, height: 32, type: 'moving', 
      moveX: 0, moveY: 100, moveSpeed: 0.5, moveTiming: 'sine' }, // MMMM
    { x: 4320, y: 1600, width: 128, height: 32, type: 'moving',
      moveX: 0, moveY: 100, moveSpeed: 0.5, moveTiming: 'sine', movePhase: 0.5 }, // MMMM
    
    // Right side cliff area
    { x: 9984, y: 4448, width: 128, height: 32, type: 'ground' }, // GGGG
    { x: 10048, y: 4384, width: 32, height: 32, type: 'ground' }, // G
    { x: 10080, y: 4352, width: 32, height: 32, type: 'ground' }, // G
    { x: 10080, y: 4480, width: 128, height: 32, type: 'ground' }, // GGGG
    
    // Large ground sections on right
    { x: 10432, y: 864, width: 256, height: 32, type: 'ground' }, // GGGGGGGG
    { x: 10368, y: 896, width: 32, height: 32, type: 'ground' }, // G
    { x: 10336, y: 928, width: 32, height: 32, type: 'ground' }, // G
    
    // Slopes (S tiles)
    { x: 9920, y: 1344, width: 64, height: 64, type: 'slope', angle: 30, direction: 'right' }, // S
    { x: 9984, y: 1440, width: 64, height: 64, type: 'slope', angle: 30, direction: 'right' }, // S
    { x: 10048, y: 1536, width: 64, height: 64, type: 'slope', angle: 30, direction: 'right' }, // S
    
    // One-way platforms scattered throughout
    { x: 4320, y: 1216, width: 224, height: 32, type: 'one-way' }, // TTTTTTT
    { x: 3872, y: 1952, width: 128, height: 32, type: 'one-way' }, // TTTT
    { x: 5632, y: 2080, width: 160, height: 32, type: 'one-way' }, // TTTTT
    
    // Add more key platforms for gameplay flow
    { x: 1856, y: 3648, width: 192, height: 32, type: 'platform' }, // PPPPPP
    { x: 2464, y: 3776, width: 128, height: 32, type: 'platform' }, // PPPP
    { x: 3200, y: 3904, width: 160, height: 32, type: 'platform' }, // PPPPP
  ],
  
  // Enemies array
  enemies: [
    { type: 'walker', x: 544, y: 5696 },
    { type: 'walker', x: 2720, y: 2496 },
    { type: 'walker', x: 5984, y: 1056 },
    { type: 'walker', x: 7040, y: 2336 },
    { type: 'flyer', x: 3232, y: 1504 },
    { type: 'flyer', x: 5280, y: 1472 },
    { type: 'flyer', x: 4896, y: 2944 },
    { type: 'flyer', x: 4128, y: 4256 },
  ],
  
  // Collectibles (coins)
  collectibles: [
    { type: 'coin', x: 1120, y: 4704 },
    { type: 'coin', x: 2240, y: 2064 },
    { type: 'coin', x: 3584, y: 1088 },
    { type: 'coin', x: 4448, y: 2240 },
    { type: 'coin', x: 5344, y: 1664 },
    { type: 'coin', x: 6080, y: 992 },
  ],
  
  // Hazards (spikes)
  hazards: [
    { type: 'spike', x: 2688, y: 1888, width: 32, height: 32 },
    { type: 'spike', x: 3488, y: 1760, width: 32, height: 32 },
    { type: 'spike', x: 4288, y: 1568, width: 32, height: 32 },
  ]
};
