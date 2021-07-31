import {Wrap} from '../common/enums.js'
import {mod} from '../common/util.js'

import Tile from './Tile.js'

/**
 * The basic data structure for all game objects that have a position on the
 * game board.
 */
export default class Grid extends Array {
  constructor({width, height, wrap = Wrap.FLAT, tilesJson = undefined}) {
    super(width * height);
    // Readonly props.
    Object.defineProperty(this, 'width', {get: () => width});
    Object.defineProperty(this, 'height', {get: () => height});
    if (tilesJson) {
      for (let i = 0; i < this.length; i++) {
        this[i] = new Tile(tilesJson[i]);
      }
    } else {
      for (let i = 0; i < this.length; i++) {
        this[i] = new Tile();
      }
    }
    // Mutable props.
    this.wrap = wrap;
  }

  /** Gets the tile at the specified position. Accounts for wrapping. */
  get(x, y) {
    const canonicalPosition = toCanonicalPosition(x, y);
    return this[this.width * y + x];
  }

  /**
   * Gets the canonical position, accounting for wrapping. May be `undefined`
   * if off the edge of the grid.
   */
  toCanonicalPosition(x, y) {
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
    }
  }

  /**
   * Gets the positions of all neighbors of the specified position. Always
   * returns a length-6 array in the order [NW, NE, W, E, SW, SE]:
   * -   NW NE
   * - W       E
   * -   SW SE
   * Some of the positions may be `undefined` if off the edge of the grid.
   */
  getNeighborPositions(x, y) {
    [x, y] = toCanonicalPosition(x, y);
    if (y % 2 === 0) {
      // Even row
      return [
        toCanonicalPosition(x - 1, y - 1),
        toCanonicalPosition(x, y - 1),
        toCanonicalPosition(x - 1, y),
        toCanonicalPosition(x + 1, y),
        toCanonicalPosition(x - 1, y + 1),
        toCanonicalPosition(x, y + 1),
      ];
    } else {
      // Odd row
      return [
        toCanonicalPosition(x, y - 1),
        toCanonicalPosition(x + 1, y - 1),
        toCanonicalPosition(x - 1, y),
        toCanonicalPosition(x + 1, y),
        toCanonicalPosition(x, y + 1),
        toCanonicalPosition(x + 1, y + 1),
      ];
    }
  }

  /** For use by JSON.stringify(). */
  toJSON() {
    return [this.width, this.height, this.wrap].concat(this);
  }

  /** Inverse of toJSON. */
  static fromJSON(json) {
    const [width, height, wrap, ...tilesJson] = json;
    return new Grid({width, height, wrap, tilesJson});
  }
}
