export function expandCoastlines(board) {
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

  let totalLand = 0;
  board.forEachTile((tile, x, y) => {
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
  board.forEachTile((tile, x, y) => {
    if (tile.terrain === 'WATER') {
      const nbrs = board.getAdjacentCoordinates(x, y);
      if (nbrs.some(([nx, ny]) => board.getTile(nx, ny).terrain === 'LAND')) {
        tile.terrain = 'COAST';
      }
    }
  });
  // Sea and ocean
  board.forEachTile((tile, x, y) => {
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
  board.forEachTile((tile) => {
    if (tile.terrain === 'LAND') {
      tile.terrain = 'GRASSLAND';
    }
  });
}
