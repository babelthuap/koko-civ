import {clear, coordsToTileIndex, getInternalCoords, renderTile} from './renderUtils.js';
import {clamp, limitOncePerFrame, mod, rand} from './util.js';

// Gameboard HTML element.
const GAMEBOARD_EL = document.getElementById('gameboard');

// [TEMP] tile colors
const OCEAN = [0x4b, 0xb8, 0xe8];
const LAND = [0x47, 0x7e, 0x19];
function getRandomTileColor() {
  return '#' +
      (Math.random() < 0.8 ? OCEAN : LAND)
          .map(n => (n - 10 + rand(21)).toString(16).padStart(2, '0'))
          .join('');
}

/** The fundamental data structure for the tiles that constitute the map. */
export function Gameboard(numColumnsOrJson, numRows) {
  /////////////////////
  // Initialize data //
  /////////////////////

  const {width, height, rows} = ((numColumnsOrJson, numRows) => {
    let width, height, rows;
    if (typeof numColumnsOrJson === 'string') {
      // Initialize from a JSON array
      rows = JSON.parse(numColumnsOrJson);
      if (!Array.isArray(rows) || rows.length === 0) {
        throw `Expected a 2D array, but was: ${numColumnsOrJson}`;
      }
      height = rows.length
      width = rows[0].length;
      for (const row of rows) {
        if (!Array.isArray(row) || row.length !== width) {
          throw `Expected a 2D array, but was: ${numColumnsOrJson}`;
        }
      }
    } else {
      // Create a new empty instance
      rows = new Array(height);
      width = numColumnsOrJson;
      height = numRows;
      for (let ty = 0; ty < height; ty++) {
        rows[ty] = new Array(width);
        for (let tx = 0; tx < width; tx++) {
          rows[ty][tx] = {color: getRandomTileColor()};
        }
      }
    }
    return {width, height, rows};
  })(numColumnsOrJson, numRows);
  numColumnsOrJson = undefined;
  numRows = undefined;

  const coordWidth = getInternalCoords(width, 0)[0];
  const coordHeight = getInternalCoords(0, height - 1)[1] + 1;


  ///////////////////////
  // Initialize canvas //
  ///////////////////////

  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  GAMEBOARD_EL.innerHTML = '';
  GAMEBOARD_EL.append(canvas);
  let view = constrainView({leftX: 0, topY: 0, scale: 130});
  render();


  /////////////////////////
  // Handle pan and zoom //
  /////////////////////////

  // Handle window resize. TODO: unlisten when this board is destroyed.
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    view = constrainView(view);
    render();
  });

  // Zoom map when mouse wheel is rotated.
  canvas.addEventListener('wheel', ({deltaY}) => {
    view = constrainView({
      leftX: view.leftX,
      topY: view.topY,
      scale: view.scale - deltaY * 0.25,
    });
    console.log('view.scale:', view.scale);
    render();
  });

  // Handle mouse clicks.
  (() => {
    let dragging = false;
    const startDrag = {};
    canvas.addEventListener('mousedown', ({button, layerX, layerY}) => {
      switch (button) {
        case 0:
          // Enable click-and-drag to pan the map.
          dragging = true;
          canvas.style.cursor = 'grabbing';
          startDrag.leftX = view.leftX;
          startDrag.topY = view.topY;
          startDrag.layerX = layerX;
          startDrag.layerY = layerY;
          break;
        case 2:
          // Highlight the right-clicked tile.
          invertColor(
              layerX / view.scale + view.leftX,
              layerY / view.scale + view.topY);
          render();
          break;
      }
    });
    canvas.addEventListener('mousemove', ({layerX, layerY}) => {
      if (dragging) {
        const dx = (layerX - startDrag.layerX) / view.scale;
        const dy = (layerY - startDrag.layerY) / view.scale;
        view = constrainView({
          leftX: startDrag.leftX - dx,
          topY: startDrag.topY - dy,
          scale: view.scale,
        });
        render();
      }
    });
    const finalizeDragging = () => {
      canvas.style.cursor = '';
      dragging = false;
    };
    canvas.addEventListener('mouseup', finalizeDragging);
    canvas.addEventListener('mouseleave', finalizeDragging);

    // Disable the normal context menu.
    canvas.addEventListener('contextmenu', event => event.preventDefault());
  })();

  // Handle keyboard scrolling. TODO: unlisten when this board is destroyed.
  document.addEventListener('keydown', event => {
    switch (event.code) {
      case 'ArrowDown':
        view = constrainView(
            {leftX: view.leftX, topY: view.topY + 1, scale: view.scale});
        return render();
      case 'ArrowUp':
        view = constrainView(
            {leftX: view.leftX, topY: view.topY - 1, scale: view.scale});
        return render();
      case 'ArrowLeft':
        view = constrainView(
            {leftX: view.leftX - 1, topY: view.topY, scale: view.scale});
        return render();
      case 'ArrowRight':
        view = constrainView(
            {leftX: view.leftX + 1, topY: view.topY, scale: view.scale});
        return render();
      case 'PageUp':
        view = constrainView(
            {leftX: view.leftX, topY: view.topY, scale: view.scale * 1.1});
        return render();
      case 'PageDown':
        view = constrainView(
            {leftX: view.leftX, topY: view.topY, scale: view.scale * 0.9});
        return render();
      case 'Home':
        view = constrainView({leftX: 0, topY: 0, scale: 130});
        return render();
      case 'End':
        view = constrainView({leftX: 0, topY: 0, scale: 0});
        return render();
    }
  });


  ////////////////////
  // Public methods //
  ////////////////////

  /** Gets the tile at the specified index. */
  function get(tx, ty) {
    return 0 <= ty && ty < height ? rows[ty][tx] : undefined;
  }

  /** Gets the list of tile indexes adjacent to the given tile index. */
  function getAdjacentIndexes(tx, ty) {
    const adj = [];
    tx = mod(tx, width);
    const leftX = mod(tx - 1, width);
    const rightX = mod(tx + 1, width);
    const isEvenRow = (ty & 1) === 0;
    // Row above
    if (ty > 0) {
      adj.push([tx, ty - 1], [isEvenRow ? leftX : rightX, ty - 1]);
    }
    // Same row
    adj.push([leftX, ty], [rightX, ty]);
    // Row below
    if (ty + 1 < height) {
      adj.push([tx, ty + 1], [isEvenRow ? leftX : rightX, ty + 1]);
    }
    return adj;
  }


  /////////////////////
  // Private methods //
  /////////////////////

  /** Rate-limited render. Always use this. */
  function render() {
    limitOncePerFrame(rawRender);
  }

  /** Raw render. Never use this directly. */
  function rawRender() {
    clear(canvas);
    const topLeftIndex = coordsToTileIndex(view.leftX, view.topY);
    const bottomRightIndex = coordsToTileIndex(
        view.leftX + canvas.width / view.scale,
        view.topY + canvas.height / view.scale);
    for (let ty = topLeftIndex[1] - 1; ty <= bottomRightIndex[1] + 1; ty++) {
      if (ty < 0 || ty >= height) {
        continue;
      }
      for (let tx = topLeftIndex[0] - 1; tx <= bottomRightIndex[0] + 1; tx++) {
        const tile = get(mod(tx, width), ty);
        const [x, y] = getInternalCoords(tx, ty);
        renderTile(tile, x, y, view, canvas);
      }
    }
  }

  /** [TEMP] Test that click detection is working. */
  function invertColor(x, y) {
    const tileIndex = coordsToTileIndex(x, y);
    tileIndex[0] = mod(tileIndex[0], width);
    const nbrIndexes = getAdjacentIndexes(tileIndex[0], tileIndex[1]);
    for (const index of [tileIndex, ...nbrIndexes]) {
      const tile = get(index[0], index[1]);
      if (tile) {
        tile.color = '#' +
            (0xffffff - parseInt(tile.color.slice(1), 16))
                .toString(16)
                .padStart(6, '0');
      }
    }
  }

  /** Constrain view parameters */
  function constrainView(newView) {
    const scale = clamp(newView.scale, canvas.height / coordHeight, 300);
    return {
      leftX: mod(newView.leftX, coordWidth),
      topY: clamp(newView.topY, 0, coordHeight - canvas.height / scale),
      scale: scale,
    };
  }


  ///////////////////////////
  // Expose public methods //
  ///////////////////////////
  return {
    get: get,
    getAdjacentIndexes: getAdjacentIndexes,
    toJSON: () => rows,
    get width() {
      return width;
    },
    get height() {
      return height;
    },
  };
}
