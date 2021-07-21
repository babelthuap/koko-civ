export function forEachTile(board, iteratee) {
  for (let y = 0; y < board.height; y++) {
    for (let x = 0; x < board.width; x++) {
      iteratee(board.getTile(x, y), x, y);
    }
  }
}

export function expandCoastlines(board) {
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

  let totalLand = 0;
  forEachTile(board, (tile, x, y) => {
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

export function drawCoastAndSea(board) {
  // Coast
  forEachTile(board, (tile, x, y) => {
    if (tile.terrain === 'WATER') {
      const nbrs = board.getAdjacentCoordinates(x, y);
      if (nbrs.some(([nx, ny]) => board.getTile(nx, ny).terrain === 'LAND')) {
        tile.terrain = 'COAST';
      }
    }
  });
  // Sea and ocean
  forEachTile(board, (tile, x, y) => {
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

export function drawLand(board) {
  forEachTile(board, (tile) => {
    if (tile.terrain === 'LAND') {
      tile.terrain = 'GRASSLAND';
    }
  });
}
