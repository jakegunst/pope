function parseLevel(levelData) {
  const tiles = [];
  const enemies = [];
  const platforms = [];
  const hazards = [];
  const collectibles = [];
  
  for (let y = 0; y < levelData.data.length; y++) {
    const row = levelData.data[y];
    tiles[y] = [];
    
    for (let x = 0; x < row.length; x++) {
      const tile = row[x];
      const worldX = x * levelData.tileSize;
      const worldY = y * levelData.tileSize;
      
      switch(tile) {
        case 'G': // Ground
        case 'P': // Solid platform
          tiles[y][x] = 1; // Solid tile
          break;
        case 'T': // Pass-through platform
          platforms.push({
            x: worldX,
            y: worldY,
            width: levelData.tileSize,
            height: levelData.tileSize,
            type: 'passthrough'
          });
          break;
        case 'W': // Check for WALKER
          if (row.substring(x, x + 6) === 'WALKER') {
            enemies.push({
              x: worldX,
              y: worldY,
              type: 'walker'
            });
            x += 5; // Skip rest of WALKER
          }
          break;
        case 'F': // Check for FLYER
          if (row.substring(x, x + 5) === 'FLYER') {
            enemies.push({
              x: worldX,
              y: worldY,
              type: 'flyer'
            });
            x += 4; // Skip rest of FLYER
          }
          break;
        case 'C': // Coin
          collectibles.push({
            x: worldX,
            y: worldY,
            type: 'coin'
          });
          break;
        case 'K': // Spikes
          hazards.push({
            x: worldX,
            y: worldY,
            type: 'spikes'
          });
          break;
        case 'B': // Bottomless pit
          hazards.push({
            x: worldX,
            y: worldY,
            type: 'pit'
          });
          break;
      }
    }
  }
  
  return { tiles, enemies, platforms, hazards, collectibles };
}
