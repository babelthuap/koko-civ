import {coordsToTileIndex, renderGameboard} from './Renderer.js';
import {deserialize, serialize} from './serialize.js';
import {mod, rand} from './util.js';

// [TEMP] tile colors
const OCEAN = [0x4b, 0xb8, 0xe8];
const LAND = [0x47, 0x7e, 0x19];

/** The fundamental data structure for the tiles that constitute the map. */
export function Gameboard(widthOrJson, height) {
  // Initialization
  let rows, width;
  if (typeof widthOrJson === 'string') {
    // Initialize from a JSON array
    rows = deserialize(widthOrJson);
    if (!Array.isArray(rows) || rows.length === 0) {
      throw `Expected a 2D array, but was: ${widthOrJson}`;
    }
    width = rows[0].length;
    for (const row of rows) {
      if (!Array.isArray(row) || row.length !== width) {
        throw `Expected a 2D array, but was: ${widthOrJson}`;
      }
    }
  } else {
    // Create a new empty instance
    rows = new Array(height);
    width = widthOrJson;
    for (let ty = 0; ty < height; ty++) {
      rows[ty] = new Array(width);
      for (let tx = 0; tx < width; tx++) {
        rows[ty][tx] = {color: getRandomTileColor()};
      }
    }
  }

  // Methods
  return {
    get width() {
      return width;
    },

    get height() {
      return height;
    },

    /** Gets the tile stored at the given tile index. */
    get(tx, ty) {
      return 0 <= ty && ty < height ? rows[ty][tx] : undefined;
    },

    /** Gets the list of tile indexes adjacent to the given tile index. */
    getAdjacentIndexes(tx, ty) {
      const adj = [];
      tx = mod(tx, width);
      const leftX = mod(tx - 1, width);
      const rightX = mod(tx + 1, width);
      adj.push([leftX, ty], [rightX, ty]);
      if (ty > 0) {
        adj.push([tx, ty - 1], [(ty & 1) === 0 ? leftX : rightX, ty - 1]);
      }
      if (ty + 1 < height) {
        adj.push([tx, ty + 1], [(ty & 1) === 0 ? leftX : rightX, ty + 1]);
      }
      return adj;
    },

    /** [TEMP] Test that click detection is working. */
    invertColor(x, y) {
      const tileIndex = coordsToTileIndex(x, y);
      tileIndex[0] = mod(tileIndex[0], width);
      const nbrIndexes = this.getAdjacentIndexes(tileIndex[0], tileIndex[1]);
      for (const index of [tileIndex, ...nbrIndexes]) {
        const tile = this.get(index[0], index[1]);
        if (tile) {
          tile.color = '#' +
              (0xffffff - parseInt(tile.color.slice(1), 16))
                  .toString(16)
                  .padStart(6, '0');
        }
      }
    },

    /** Renders this gameboard onto a canvas with the specified view. */
    render(canvas, view) {
      renderGameboard(this, canvas, view);
    },

    /** Serializes the contents of this gameboard to a string. */
    serialize() {
      return serialize(rows);
    },
  };
}

function getRandomTileColor() {
  return '#' +
      (Math.random() < 0.8 ? OCEAN : LAND)
          .map(n => (n - 10 + rand(21)).toString(16).padStart(2, '0'))
          .join('');
}
