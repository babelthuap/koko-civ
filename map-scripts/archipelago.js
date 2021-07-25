import {drawCoastAndSea, drawLand, expandCoastlines} from './common.js';

export default function archipelago(board, landFraction) {
  let s = performance.now();

  generateIslands(board, landFraction);

  const minLandTiles = landFraction * board.width * board.height;
  let i = 0;
  while (expandCoastlines(board) < minLandTiles) {
    i++;
  }

  drawCoastAndSea(board);
  drawLand(board);

  console.log(performance.now() - s);
  board.render();
}

function generateIslands(board, landFraction) {
  randomize(board, 0.7);
  for (let i = 0; i < 6; i++) {
    step(board, 0, 1);
  }
  for (let i = 0; i < 3; i++) {
    step(board, 4, 5, 6);
  }
}

function randomize(board, waterFraction) {
  board.forEachTile(tile => {
    tile.terrain = Math.random() < waterFraction ? 'WATER' : 'LAND';
  });
}

function step(board, ...nbrLandRequirements) {
  const set = new Set(nbrLandRequirements);
  const nbrLandCounts = new Array(board.height);
  for (let y = 0; y < board.height; y++) {
    nbrLandCounts[y] = new Array(board.width).fill(0);
  }
  board.forEachTile((tile, x, y) => {
    if (tile.terrain === 'LAND') {
      const nbrs = board.getAdjacentCoordinates(x, y);
      for (const [nx, ny] of nbrs) {
        nbrLandCounts[ny][nx]++;
      }
    }
  });
  board.forEachTile((tile, x, y) => {
    if (set.has(nbrLandCounts[y][x])) {
      tile.terrain = 'LAND';
    } else {
      tile.terrain = 'WATER';
    }
  });
}
