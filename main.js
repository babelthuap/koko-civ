import board from './js/gameboard.js';
import {rand} from './js/util.js';

board.init({width: 100, height: 130});
window.board = board;

// TODO: Globe view!
// https://blog.mastermaps.com/2013/09/creating-webgl-earth-with-threejs.html

document.addEventListener('keydown', ({code}) => {
  if (code === 'KeyA') {
    archipelago(0.2);
  }
  if (code === 'KeyC') {
    continents(0.25);
  }
});
document.getElementById('archipelago')
    .addEventListener('click', () => archipelago(0.2));
document.getElementById('continents')
    .addEventListener('click', () => continents(0.25));

continents(0.25);

board.addClickListener((event, tile) => {
  switch (event.button) {
    case 0:
      // Left click.
      tile.terrain = 'MOUNTAIN';
      board.render();
      break;
    case 2:
      // Right click.
      alert(tile.terrain);
      break;
  }
});

function continents(landFraction) {
  let s = performance.now();

  forEachTile(tile => tile.terrain = 'WATER');

  // left
  for (let i = 0; i < 15; i++) {
    const x = Math.round(board.width / 8 + rand(board.width) / 6);
    const y = Math.round(board.height / 8 + rand(board.height) * 5 / 8);
    board.getTile(x, y).terrain = 'LAND';
    const nbrs = board.getAdjacentCoordinates(x, y);
    nbrs.forEach(([nx, ny]) => {
      if (Math.random() < 0.6) board.getTile(nx, ny).terrain = 'LAND';
    });
  }
  // right
  for (let i = 0; i < 30; i++) {
    const x = Math.round(board.width / 2 + rand(board.width) * 5 / 16);
    const y = Math.round(board.height * 2 / 8 + rand(board.height) * 5 / 8);
    board.getTile(x, y).terrain = 'LAND';
    const nbrs = board.getAdjacentCoordinates(x, y);
    nbrs.forEach(([nx, ny]) => {
      if (Math.random() < 0.6) board.getTile(nx, ny).terrain = 'LAND';
    });
  }

  const minLandTiles = landFraction * board.width * board.height;
  while (expandCoastlines() < minLandTiles) {
  }
  randStep();
  while (expandCoastlines() < minLandTiles) {
  }

  drawCoastAndSea();
  drawLand();

  console.log(performance.now() - s);
  board.render();
}

function archipelago(landFraction) {
  let s = performance.now();
  generateIslands();
  const minLandTiles = landFraction * board.width * board.height;
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
      const nbrs = board.getAdjacentCoordinates(x, y);
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

function randStep() {
  const nbrLandCounts = new Array(board.height);
  for (let y = 0; y < board.height; y++) {
    nbrLandCounts[y] = new Array(board.width).fill(0);
  }
  forEachTile((tile, x, y) => {
    if (tile.terrain === 'LAND') {
      const nbrs = board.getAdjacentCoordinates(x, y);
      for (const [nx, ny] of nbrs) {
        nbrLandCounts[ny][nx]++;
      }
    }
  });
  forEachTile((tile, x, y) => {
    const count = nbrLandCounts[y][x];
    if (rand(6) + 1 < count) {
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
      const nbrs = board.getAdjacentCoordinates(x, y);
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
      const nbrs = board.getAdjacentCoordinates(x, y);
      if (nbrs.some(([nx, ny]) => board.getTile(nx, ny).terrain === 'LAND')) {
        tile.terrain = 'COAST';
      }
    }
  });
  // Sea and ocean
  forEachTile((tile, x, y) => {
    const nbrs = board.getAdjacentCoordinates(x, y);
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

window.continents = continents;
window.archipelago = archipelago;
window.generateIslands = generateIslands;
window.randomize = randomize;
window.step = step;
window.randStep = randStep;
window.expandCoastlines = expandCoastlines;
window.drawCoastAndSea = drawCoastAndSea;
window.drawLand = drawLand;
window.forEachTile = forEachTile;
