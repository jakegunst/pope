// test-level.js - A simple tile-based level for testing
export const testLevel = {
  name: 'Test Tile Level',
  width: 25,  // 25 tiles wide
  height: 20, // 20 tiles tall
  tileSize: 32,
  data: [
    "                         ",
    "                         ",
    "                         ",
    "                         ",
    "       CCC               ",
    "                         ",
    "     PPPPPPP             ",
    "                         ",
    "                  L      ",
    "                PPPP     ",
    "   C                     ",
    "  PPP                    ",
    "          E       C      ",
    "        PPPP    PPP      ",
    "                         ",
    " X          WALKER       ",
    "PPP    S            S    ",
    "GGGGGGGGGGGGGGGGGGGGGGGGG",
    "GGGGGGGGGGGGGGGGGGGGGGGGG",
    "GGGGGGGGGGGGGGGGGGGGGGGGG"
  ],
  playerStart: { x: 1 * 32, y: 15 * 32 }
};
