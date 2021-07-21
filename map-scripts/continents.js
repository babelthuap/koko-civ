import {rand} from '../js/util.js';

import {drawCoastAndSea, drawLand, expandCoastlines, forEachTile} from './common.js';

export default function continents(board, landFraction) {
  let s = performance.now();

  forEachTile(board, tile => tile.terrain = 'WATER');

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
  while (expandCoastlines(board) < minLandTiles) {}
  randStep(board);
  while (expandCoastlines(board) < minLandTiles) {}

  drawCoastAndSea(board);
  drawLand(board);

  console.log(performance.now() - s);
  board.render();
}

function randStep(board) {
  const nbrLandCounts = new Array(board.height);
  for (let y = 0; y < board.height; y++) {
    nbrLandCounts[y] = new Array(board.width).fill(0);
  }
  forEachTile(board, (tile, x, y) => {
    if (tile.terrain === 'LAND') {
      const nbrs = board.getAdjacentCoordinates(x, y);
      for (const [nx, ny] of nbrs) {
        nbrLandCounts[ny][nx]++;
      }
    }
  });
  forEachTile(board, (tile, x, y) => {
    const count = nbrLandCounts[y][x];
    if (rand(6) + 1 < count) {
      tile.terrain = 'LAND';
    } else {
      tile.terrain = 'WATER';
    }
  });
}
