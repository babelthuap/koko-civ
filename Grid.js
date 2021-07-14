import {clamp, mod, rand} from './util.js';

const RT3 = Math.sqrt(3);
const RT3_INV = 1 / Math.sqrt(3);
const RT3_2 = RT3 / 2;
const RT3_2_INV = 2 / RT3;

const OCEAN = [0x4b, 0xb8, 0xe8];
const LAND = [0x47, 0x7e, 0x19];

class Tile {
  constructor() {
    this.data_ = {};
    if (Math.random() < 0.8) {
      this.data_.color = '#' +
          OCEAN.map(n => (n - 10 + rand(21)).toString(16).padStart(2, '0'))
              .join('');
    } else {
      this.data_.color = '#' +
          LAND.map(n => (n - 10 + rand(21)).toString(16).padStart(2, '0'))
              .join('');
    }
  }

  set(key, value) {
    this.data_[key] = value;
    return this;
  }

  get(key) {
    return this.data_[key];
  }

  renderTile(x, y, scale, canvas) {
    canvas.drawRect(x * scale, y * scale, scale, scale, this.get('color'));
  }
}

class HexTile extends Tile {
  constructor() {
    super();
  }

  renderTile(x, y, scale, canvas) {
    canvas.drawHex(x * scale, y * scale, RT3 * scale, scale, this.get('color'));
  }
}

class Grid {
  constructor(width = 0, height = 0, TileClass = Tile) {
    this.tWidth = width;
    this.tHeight = height;
    this.rows_ = new Array(height);
    for (let ty = 0; ty < height; ty++) {
      this.rows_[ty] = new Array(width);
      for (let tx = 0; tx < width; tx++) {
        this.rows_[ty][tx] = new TileClass();
      }
    }
  }

  set(tx, ty, value) {
    this.rows_[ty][tx] = value;
    return this;
  }

  get(tx, ty) {
    if (0 <= ty && ty < this.tHeight) {
      return this.rows_[ty][tx];
    } else {
      return undefined;
    }
  }

  get height() {
    return this.getCoordOffset(0, this.tHeight - 1)[1] + 1;
  }

  getCoordOffset(tx, ty) {
    return [tx, ty];
  }

  coordsToTileIndex(x, y) {
    throw 'not implemented';
  }

  getAdjacentIndexes(tx, ty) {
    const adj = [];
    tx = mod(tx, this.tWidth);
    const leftX = mod(tx - 1, this.tWidth);
    const rightX = mod(tx + 1, this.tWidth);
    if (ty > 0) {
      adj.push([leftX, ty - 1], [tx, ty - 1], [rightX, ty - 1]);
    }
    adj.push([leftX, ty], [rightX, ty]);
    if (ty + 1 < this.tHeight) {
      adj.push([leftX, ty + 1], [tx, ty + 1], [rightX, ty + 1]);
    }
    return adj;
  }

  // Renders the tiles that intersect with the rectangle:
  // (x, y)-----------------|
  // |                      |
  // ----------(x + w, y + h)
  render(topLeftX, topLeftY, w, h, scale, canvas) {
    throw 'not implemented';
  }

  invertColor(x, y) {
    const tileIndex = this.coordsToTileIndex(x, y);
    tileIndex[0] = mod(tileIndex[0], this.tWidth);
    const nbrIndexes = this.getAdjacentIndexes(tileIndex[0], tileIndex[1]);
    for (const index of [tileIndex, ...nbrIndexes]) {
      const tile = this.get(index[0], index[1]);
      if (tile) {
        tile.set(
            'color',
            '#' +
                (0xffffff - parseInt(tile.get('color').slice(1), 16))
                    .toString(16)
                    .padStart(6, '0'));
      }
    }
  }

  toJSON() {
    return this.rows_;
  }

  static fromJSON(json, instance = new Grid()) {
    const arr = JSON.parse(json);
    if (!Array.isArray(arr)) {
      throw `Expected an array, but was: ${json}`;
    }
    if (arr.length > 0) {
      const width = arr[0].length;
      for (const row of arr) {
        if (!Array.isArray(row) || row.length !== width) {
          throw `Expected a 2D array, but was: ${json}`;
        }
      }
    }
    instance.rows_ = arr;
    return instance;
  }
}

export class HexGrid extends Grid {
  constructor(width, height) {
    super(width, height, HexTile);
  }

  getCoordOffset(tx, ty) {
    return (ty & 1) === 0 ? [RT3 * tx, 0.75 * ty] :
                            [RT3 * tx + RT3_2, 0.75 * (ty - 1) + 0.75];
  }

  // viewport = {leftX, topY, scale}
  render(viewport, canvas) {
    canvas.clear();
    const topLeftIndex = this.coordsToTileIndex(viewport.leftX, viewport.topY);
    const bottomRightIndex = this.coordsToTileIndex(
        viewport.leftX + canvas.width / viewport.scale,
        viewport.topY + canvas.height / viewport.scale);
    for (let ty = topLeftIndex[1] - 1; ty <= bottomRightIndex[1] + 1; ty++) {
      for (let tx = topLeftIndex[0] - 1; tx <= bottomRightIndex[0] + 1; tx++) {
        const tile = this.get(mod(tx, this.tWidth), ty);
        if (tile !== undefined) {
          const [offsetX, offsetY] = this.getCoordOffset(tx, ty);
          tile.renderTile(
              offsetX - viewport.leftX, offsetY - viewport.topY, viewport.scale,
              canvas);
        }
      }
    }
  }

  coordsToTileIndex(x, y) {
    // Conceptually, we break up each hex into quarter-heights and half-widths.
    // The behavior of this method depends on which quarter-row and half-column
    // the input point happens to be in.
    let quarterRow = Math.floor(4 * y);
    const halfCol = Math.floor(RT3_2_INV * x);
    // Push points in slant rows into the appropriate box row.
    switch (mod(quarterRow, 6)) {
      case 0:
        // slant up
        x = RT3_2_INV * x - halfCol;
        y = 4 * y - quarterRow;
        if (((halfCol & 1) === 0) ? x + y > 1 : y > x) {
          quarterRow++;
        } else {
          quarterRow--;
        }
        break;
      case 3:
        // slant down
        x = RT3_2_INV * x - halfCol;
        y = 4 * y - quarterRow;
        if (((halfCol & 1) === 0) ? y > x : x + y > 1) {
          quarterRow++;
        } else {
          quarterRow--;
        }
        break;
    }
    // Now the point is in a box row, which is easier to handle.
    switch (mod(quarterRow, 6)) {
      case 1:
      case 2:
        // box even
        return [
          halfCol >> 1,
          2 * Math.floor(quarterRow / 6),
        ];
      case 4:
      case 5:
        // box odd
        return [
          (halfCol - 1) >> 1,
          2 * Math.floor(quarterRow / 6) + 1,
        ];
    }
  }

  getAdjacentIndexes(tx, ty) {
    const adj = [];
    tx = mod(tx, this.tWidth);
    const leftX = mod(tx - 1, this.tWidth);
    const rightX = mod(tx + 1, this.tWidth);
    adj.push([leftX, ty], [rightX, ty]);
    if (ty > 0) {
      adj.push([tx, ty - 1], [(ty & 1) === 0 ? leftX : rightX, ty - 1]);
    }
    if (ty + 1 < this.tHeight) {
      adj.push([tx, ty + 1], [(ty & 1) === 0 ? leftX : rightX, ty + 1]);
    }
    return adj;
  }

  static fromJSON(json) {
    return Grid.fromJSON(json, new HexGrid());
  }
}
