import {Wrap} from '../common/enums.js';
import {mod} from '../common/util.js';

import Tile from './Tile.js';

/**
 * The basic data structure for all game objects that have a position on the
 * game board.
 *   width: Width of the board (number of tiles).
 *   height: Height of the board (number of tiles).
 *   wrap: Topology of the board. Determines adjacency.
 *   tiles: Array of tile data.
 */
export default function Grid(
    {width, height, wrap = Wrap.FLAT, tilesJson = undefined}) {
  this.width = width;
  this.height = height;
  this.wrap = wrap;
  this.tiles = new Array(width * height);
  if (tilesJson) {
    for (let i = 0; i < this.tiles.length; i++) {
      this.tiles[i] = Tile.fromJSON(tilesJson[i]);
    }
  } else {
    for (let i = 0; i < this.tiles.length; i++) {
      this.tiles[i] = new Tile();
    }
  }
}

/** Gets the tile at the specified position. Accounts for wrapping. */
Grid.prototype.get = function(x, y) {
  [x, y] = this.toCanonicalPosition(x, y);
  return this.tiles[this.width * y + x];
};

/** Calls iteratee(tile, x, y) for each tile in the grid. */
Grid.prototype.forEachTile = function(iteratee) {
  for (let y = 0; y < this.height; y++) {
    for (let x = 0; x < this.width; x++) {
      iteratee(this.tiles[this.width * y + x], x, y);
    }
  }
};

/**
 * Gets the canonical position, accounting for wrapping. May be `undefined`
 * if off the edge of the grid.
 */
Grid.prototype.toCanonicalPosition = function(x, y) {
  switch (this.wrap) {
    case Wrap.FLAT:
      if (0 <= x && x < this.width && 0 <= y && y < this.height) {
        return [x, y];
      } else {
        return undefined;
      }
    case Wrap.CYLINDER:
      if (0 <= y && y < this.height) {
        return [mod(x, this.width), y];
      } else {
        return undefined;
      }
    case Wrap.TORUS:
      return [mod(x, this.width), mod(y, this.height)];
    case Wrap.MOBIUS_STRIP:
      if (0 <= y && y < this.height) {
        return [
          mod(x, this.width),
          mod(x, 2 * this.width) < this.width ? y : this.height - 1 - y,
        ];
      } else {
        return undefined;
      }
    case Wrap.KLEIN_BOTTLE:
      y = mod(y, this.height);
      return [
        mod(x, this.width),
        mod(x, 2 * this.width) < this.width ? y : this.height - 1 - y,
      ];
    default:
      throw `Unknown wrap value ${this.wrap}`;
  }
};

/**
 * Gets the positions of all neighbors of the specified position. Always
 * returns a length-6 array in the order [NW, NE, W, E, SW, SE]:
 * -   NW NE
 * - W       E
 * -   SW SE
 * Some of the positions may be `undefined` if off the edge of the grid.
 */
Grid.prototype.getNeighborPositions = function(x, y) {
  [x, y] = this.toCanonicalPosition(x, y);
  if (y % 2 === 0) {
    // Even row
    return [
      this.toCanonicalPosition(x - 1, y - 1),
      this.toCanonicalPosition(x, y - 1),
      this.toCanonicalPosition(x - 1, y),
      this.toCanonicalPosition(x + 1, y),
      this.toCanonicalPosition(x - 1, y + 1),
      this.toCanonicalPosition(x, y + 1),
    ];
  } else {
    // Odd row
    return [
      this.toCanonicalPosition(x, y - 1),
      this.toCanonicalPosition(x + 1, y - 1),
      this.toCanonicalPosition(x - 1, y),
      this.toCanonicalPosition(x + 1, y),
      this.toCanonicalPosition(x, y + 1),
      this.toCanonicalPosition(x + 1, y + 1),
    ];
  }
};

/** For use by JSON.stringify(). */
Grid.prototype.toJSON = function() {
  return [this.width, this.height, this.wrap, this.tiles];
};

/** Inverse of toJSON. */
Grid.fromJSON = (json) => {
  const [width, height, wrap, tilesJson] = json;
  return new Grid({width, height, wrap, tilesJson});
};
