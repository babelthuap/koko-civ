import {TerrainDarker, TerrainImage, UnitImage} from './images.js';
import {Terrain} from './terrain.js';
import {mod} from './util.js';

// The width of each hex in internal coordinates. (The height is 1.)
export const HEX_WIDTH = Math.sqrt(3);
const HEX_WIDTH_INV = 1 / HEX_WIDTH;
const HEX_WIDTH_2 = HEX_WIDTH / 2;
const HEX_WIDTH_2_INV = 2 / HEX_WIDTH;

const GRASSLAND_IMG = document.getElementById('grassland');

/**
 * Given the internal coordinates of a point, determines the position (i.e.
 * column & row) of the tile that contains that point.
 */
export function coordsToPosition(x, y, width) {
  // Conceptually, we break up each hex into quarter-heights and half-widths.
  // The behavior of this method depends on which quarter-row and half-column
  // the input point happens to be in.
  let quarterRow = Math.floor(4 * y);
  const halfCol = Math.floor(HEX_WIDTH_2_INV * x);
  // Push points in slant rows into the appropriate box row.
  switch (mod(quarterRow, 6)) {
    case 0:
      // slant up
      x = HEX_WIDTH_2_INV * x - halfCol;
      y = 4 * y - quarterRow;
      if (((halfCol & 1) === 0) ? x + y > 1 : y > x) {
        quarterRow++;
      } else {
        quarterRow--;
      }
      break;
    case 3:
      // slant down
      x = HEX_WIDTH_2_INV * x - halfCol;
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

/** Erases the canvas. */
export function clear(canvas, ctx) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * Converts from a tile's position (i.e. column & row) to the internal
 * coordinates of the upper-left corner of its bounding box.
 */
export function positionToCoords(tx, ty) {
  return (ty & 1) === 0 ?
      [HEX_WIDTH * tx, 0.75 * ty] :
      [HEX_WIDTH * tx + HEX_WIDTH_2, 0.75 * (ty - 1) + 0.75];
}

/**
 * Renders the specified view of a single tile onto a canvas given the
 * upper-left corner of its bounding box in internal coordinates.
 */
export function renderTerrain(tile, x, y, view, ctx, canSee) {
  // Terrain
  if (tile.terrain in TerrainImage) {
    const img =
        canSee ? TerrainImage[tile.terrain] : TerrainDarker[tile.terrain];
    const imgWidth = img.width;
    const imgHeight = img.height;
    ctx.drawImage(
        img, (x - HEX_WIDTH * 50 / imgWidth - view.leftX) * view.scale,
        (y - 50 / imgHeight - view.topY) * view.scale,
        HEX_WIDTH * view.scale * (imgWidth + 100) / imgWidth,
        /* hex height == 1 */ view.scale * (imgHeight + 100) / imgHeight);
  } else {
    const color =
        (tile.terrain in Terrain) ? Terrain[tile.terrain].color : 'magenta';
    drawHex(
        ctx, (x - view.leftX) * view.scale, (y - view.topY) * view.scale,
        HEX_WIDTH * view.scale, /* hex height == 1 */ view.scale, color,
        /* fill= */ true);
  }
}

export function renderGrid(x, y, view, ctx) {
  drawHex(
      ctx, (x - view.leftX) * view.scale, (y - view.topY) * view.scale,
      HEX_WIDTH * view.scale, /* hex height == 1 */ view.scale, '#999',
      /* fill= */ false);
}

export function renderUnitStack(units, x, y, view, ctx) {
  // Arbitrarily pick the first unit in the array.
  const topUnit = units[0];
  if (topUnit.type in UnitImage) {
    const img = UnitImage[topUnit.type];
    ctx.drawImage(
        img,
        (x - view.leftX + (HEX_WIDTH - 1) / 2) * view.scale,
        (y - view.topY) * view.scale,
        view.scale,
        view.scale);
  } else {
    ctx.fillStyle = 'magenta';
    ctx.beginPath();
    ctx.arc(
        (x + 0.5 * HEX_WIDTH - view.leftX) * view.scale,
        (y + 0.5 - view.topY) * view.scale, view.scale / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draws a vertical hex on the canvas given: the upper-left corner of its
 * bounding box, its width, its height, and its color.
 */
function drawHex(ctx, x, y, width, height, color, fill) {
  ctx.beginPath();
  const midX = x + width * 0.5;
  const maxX = x + width;
  const y_4 = y + 0.25 * height;
  const y3_4 = y + 0.75 * height;
  ctx.moveTo(midX, y);
  ctx.lineTo(maxX, y_4);
  ctx.lineTo(maxX, y3_4);
  ctx.lineTo(midX, y + height);
  ctx.lineTo(x, y3_4);
  ctx.lineTo(x, y_4);
  ctx.lineTo(midX, y);
  if (fill) {
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    ctx.strokeStyle = color;
    ctx.stroke();
  }
}
