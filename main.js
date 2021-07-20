import {Gameboard} from './js/Gameboard.js';

const board = new Gameboard(100, 100);
window.board = board;

// TODO: Globe view!
// https://blog.mastermaps.com/2013/09/creating-webgl-earth-with-threejs.html

document.addEventListener('keydown', ({code}) => {
  if (code === 'Enter') {
    makeSnaky();
  }
});

makeSnaky();

function makeSnaky() {
  let s = performance.now();
  generateIslands();
  const minLandTiles = 0.25 * board.width * board.height;
  let i = 0;
  while (expandCoastlines() < minLandTiles) {
    i++;
  }
  drawCoastAndSea();
  drawLand();
  console.log('i:', i);
  console.log(performance.now() - s);
  board.render();
}

function generateIslands() {
  randomize(0.7);
  for (let i = 0; i < 6; i++) {
    step(0, 1);
  }
  for (let i = 0; i < 3; i++) {
    step(4, 5, 6);
  }
}

function randomize(waterFraction) {
  forEachTile(tile => {
    tile.terrain = Math.random() < waterFraction ? 'WATER' : 'LAND';
  });
}

function step(...nbrLandRequirements) {
  const set = new Set(nbrLandRequirements);
  const nbrLandCounts = new Array(board.height);
  for (let y = 0; y < board.height; y++) {
    nbrLandCounts[y] = new Array(board.width).fill(0);
  }
  forEachTile((tile, x, y) => {
    if (tile.terrain === 'LAND') {
      const nbrs = board.getAdjacentIndexes(x, y);
      for (const [nx, ny] of nbrs) {
        nbrLandCounts[ny][nx]++;
      }
    }
  });
  forEachTile((tile, x, y) => {
    if (set.has(nbrLandCounts[y][x])) {
      tile.terrain = 'LAND';
    } else {
      tile.terrain = 'WATER';
    }
  });
}

function expandCoastlines() {
  const nbrLandCounts = new Array(board.height);
  for (let y = 0; y < board.height; y++) {
    nbrLandCounts[y] = new Array(board.width).fill(0);
  }
  forEachTile((tile, x, y) => {
    if (tile.terrain === 'LAND') {
      const nbrs = board.getAdjacentIndexes(x, y);
      for (const [nx, ny] of nbrs) {
        nbrLandCounts[ny][nx]++;
      }
    }
  });

  let totalLand = 0;
  forEachTile((tile, x, y) => {
    if (tile.terrain === 'WATER') {
      const count = nbrLandCounts[y][x];
      if (count > 0 && Math.ceil(Math.random() * 6) < count) {
        tile.terrain = 'LAND';
        totalLand++;
      }
    } else {
      totalLand++;
    }
  });

  return totalLand;
}

function drawCoastAndSea() {
  // Coast
  forEachTile((tile, x, y) => {
    if (tile.terrain === 'WATER') {
      const nbrs = board.getAdjacentIndexes(x, y);
      if (nbrs.some(([nx, ny]) => board.getTile(nx, ny).terrain === 'LAND')) {
        tile.terrain = 'COAST';
      }
    }
  });
  // Sea and ocean
  forEachTile((tile, x, y) => {
    const nbrs = board.getAdjacentIndexes(x, y);
    if (tile.terrain === 'WATER') {
      if (nbrs.some(([nx, ny]) => board.getTile(nx, ny).terrain === 'COAST')) {
        tile.terrain = 'SEA';
      } else {
        tile.terrain = 'OCEAN';
      }
    }
  });
}

function drawLand() {
  forEachTile((tile) => {
    if (tile.terrain === 'LAND') {
      tile.terrain = 'GRASSLAND';
    }
  });
}

function forEachTile(iteratee) {
  for (let y = 0; y < board.height; y++) {
    for (let x = 0; x < board.width; x++) {
      iteratee(board.getTile(x, y), x, y);
    }
  }
}
