import {compress, decompress} from './compression.js';
import {registerDragCallbacks} from './globalDragHandler.js';
import {clear, coordsToPosition, getInternalCoords, renderTile} from './renderUtils.js';
import {clamp, limitOncePerFrame, mod} from './util.js';

// TODO: Globe view!
// https://blog.mastermaps.com/2013/09/creating-webgl-earth-with-threejs.html

export default new Gameboard();

function Gameboard() {
  /*************/
  /* CONSTANTS */
  /*************/

  // Gameboard HTML element.
  const GAMEBOARD_EL = document.getElementById('gameboard');

  // Maximum scale factor (pixels per unit)
  const MAX_SCALE = 300;

  // The HTML canvas element onto which we'll render the gameboard.
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  GAMEBOARD_EL.innerHTML = '';
  GAMEBOARD_EL.append(canvas);


  /**********/
  /* FIELDS */
  /**********/

  // Configuration options set during initialization.
  let width, height, wrap;

  // Array of tiles. The tile at position (x, y) is stored at index width*y + x.
  let tiles;

  // Size of the board in internal coordinates.
  let coordWidth, coordHeight;

  // List of callback functions to invoke when a click is detected.
  let clickListeners = [];

  // The parameters that determine what part of the board we should render.
  const view = {
    leftX: 0,
    topY: 0,
    scale: 100,  // pixels per unit (of internal coordinates)
  };


  /******************/
  /* PUBLIC METHODS */
  /******************/

  /**
   * Initializes the board. The following options are supported:
   *   - width (number of columns)
   *   - height (number of rows)
   */
  function init(options) {
    width = options.width;
    height = options.height;
    wrap = options.wrap;
    tiles = new Array(width * height).fill().map(() => ({terrain: 'OCEAN'}));
    coordWidth = getInternalCoords(width, 0)[0];
    coordHeight = getInternalCoords(0, height - 1)[1] + 1;
    updateView({leftX: 0, topY: 0, scale: 0});
    attachListeners();
  }

  /** Serializes the board. */
  function save() {
    return JSON.stringify([{width, height, wrap}, compress(tiles)]);
  }

  /** Initializes the board from serialized data. */
  function load(serialized) {
    const [options, compressedTiles] = JSON.parse(serialized);
    const decompressedTiles = decompress(compressedTiles);

    console.assert(Array.isArray(decompressedTiles));
    console.assert(Number.isInteger(options.width));
    console.assert(Number.isInteger(options.height));
    console.assert(decompressedTiles.length === options.width * options.height);

    width = options.width;
    height = options.height;
    wrap = options.wrap;
    tiles = decompressedTiles;
    coordWidth = getInternalCoords(width, 0)[0];
    coordHeight = getInternalCoords(0, height - 1)[1] + 1;
    updateView({leftX: 0, topY: 0, scale: 0});
    attachListeners();
  }

  /** Renders the gameboard. */
  function render() {
    limitOncePerFrame(rawRender);
  }

  /** Sets wrap on or off. */
  function setWrap(shouldWrap) {
    wrap = shouldWrap;
  }

  /** Gets the tile at the specified position. */
  function getTile(tx, ty) {
    return 0 <= ty && ty < height ? tiles[width * ty + tx] : undefined;
  }

  /** Gets the list of tile coordinates adjacent to the given coordinates. */
  function getAdjacentCoordinates(tx, ty) {
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

  /**
   * Adds a click listener that will be invoked when the board is clicked on.
   * The listener callback receives 2 arguments:
   *   - event: The normal MouseEvent.
   *   - tile: The tile that was clicked on. May be undefined.
   */
  function addClickListener(callback) {
    clickListeners.push(callback);
  }

  /** Removes one or more click listener callbacks. */
  function removeClickListener(...callbacks) {
    callbacks = new Set(callbacks);
    clickListeners =
        clickListeners.filter(callback => !callbacks.has(callback));
  }

  /** Removes all click listener callbacks. */
  function clearClickListeners() {
    clickListeners = [];
  }

  /** Handles a keydown event. */
  function handleKeydown(event) {
    switch (event.key) {
      case 'ArrowDown':
        updateView({leftX: view.leftX, topY: view.topY + 1, scale: view.scale});
        return render();
      case 'ArrowUp':
        updateView({leftX: view.leftX, topY: view.topY - 1, scale: view.scale});
        return render();
      case 'ArrowLeft':
        updateView({leftX: view.leftX - 1, topY: view.topY, scale: view.scale});
        return render();
      case 'ArrowRight':
        updateView({leftX: view.leftX + 1, topY: view.topY, scale: view.scale});
        return render();
      case 'PageUp':
        return handleWheel({
          deltaY: -10,
          offsetX: window.innerWidth / 2,
          offsetY: window.innerHeight / 2,
        });
      case 'PageDown':
        return handleWheel({
          deltaY: 10,
          offsetX: window.innerWidth / 2,
          offsetY: window.innerHeight / 2,
        });
      case 'Home':
        updateView({leftX: 0, topY: 0, scale: 100});
        return render();
      case 'End':
        updateView({leftX: 0, topY: 0, scale: 0});
        return render();
    }
  }


  /*******************/
  /* PRIVATE METHODS */
  /*******************/

  function rawRender() {
    // Raw, non-rate-limited render. Always use inside limitOncePerFrame.
    clear(canvas);
    const topLeftIndex = coordsToPosition(view.leftX, view.topY, width);
    const bottomRightIndex = coordsToPosition(
        view.leftX + canvas.width / view.scale,
        view.topY + canvas.height / view.scale, width);
    for (let ty = topLeftIndex[1] - 1; ty <= bottomRightIndex[1] + 1; ty++) {
      if (ty < 0 || ty >= height) {
        continue;
      }
      for (let tx = topLeftIndex[0] - 1; tx <= bottomRightIndex[0] + 1; tx++) {
        if (!wrap && (tx < 0 || tx > width)) {
          continue;
        }
        const tile = tiles[width * ty + mod(tx, width)];
        const [x, y] = getInternalCoords(tx, ty);
        renderTile(tile, x, y, view, canvas);
      }
    }
  }

  let listenersAttached = false;
  let mouseInCanvas = false;
  function attachListeners() {
    if (listenersAttached) return;
    listenersAttached = true;
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mouseenter', () => mouseInCanvas = true);
    canvas.addEventListener('mouseleave', () => mouseInCanvas = false);
    canvas.addEventListener('wheel', handleWheel);
    attachMouseListeners();
  }

  function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    updateView(view);
    render();
  }

  function handleWheel({deltaY, offsetX, offsetY}) {
    if (!mouseInCanvas) return;

    // Fix the *internal* position that the cursor is hovering over. I.e., try
    // to re-center the view so that the the cursor is hovering over the same
    // tile before and after zooming.
    const internalX = view.leftX + offsetX / view.scale;
    const internalY = view.topY + offsetY / view.scale;

    // Relate the wheel's y-scale to our scale logarithmically. I tried linear
    // and quadratic relationships, but this feels better.
    const logScale = Math.log(view.scale);
    const newLogScale = logScale - deltaY * 0.007;
    const newScale =
        clamp(Math.exp(newLogScale), canvas.height / coordHeight, MAX_SCALE);

    updateView({
      leftX: internalX - offsetX / newScale,
      topY: internalY - offsetY / newScale,
      scale: newScale,
    });
    render();
  }

  function attachMouseListeners() {
    // Disable the normal context menu.
    canvas.addEventListener('contextmenu', event => event.preventDefault());

    // Enable click-and-drag to pan map.
    let startDragLeftX;
    let startDragTopY;
    registerDragCallbacks(canvas, {
      onDragStart: () => {
        startDragLeftX = view.leftX;
        startDragTopY = view.topY;
      },
      onDrag: (dx, dy) => {
        canvas.style.cursor = 'grabbing';
        updateView({
          leftX: startDragLeftX - dx / view.scale,
          topY: startDragTopY - dy / view.scale,
          scale: view.scale,
        });
        rawRender();  // Note that onDrag is already rate-limited.
      },
      onLeftClick: invokeClickListeners,
      onRightClick: invokeClickListeners,
      finalize: () => {
        canvas.style.cursor = '';
      },
    });

    function invokeClickListeners(event) {
      const x = wrap ?
          mod(view.leftX + event.offsetX / view.scale, coordWidth) :
          view.leftX + event.offsetX / view.scale;
      const [tx, ty] =
          coordsToPosition(x, view.topY + event.offsetY / view.scale, width);
      const tile = getTile(tx, ty);
      if (tile) {
        clickListeners.forEach(callback => callback(event, tile));
      }
    }
  }

  /**
   * Update the view parameters, constraining them so the view doesn't go off
   * the map.
   */
  function updateView(newView) {
    view.scale = clamp(newView.scale, canvas.height / coordHeight, MAX_SCALE);
    view.leftX = wrap ? mod(newView.leftX, coordWidth) : newView.leftX;
    view.topY =
        clamp(newView.topY, 0, coordHeight - canvas.height / view.scale);
  }


  /*************************/
  /* EXPOSE PUBLIC METHODS */
  /*************************/
  return {
    init: init,
    save: save,
    load: load,
    render: render,
    setWrap: setWrap,
    getTile: getTile,
    getAdjacentCoordinates: getAdjacentCoordinates,
    addClickListener: addClickListener,
    removeClickListener: removeClickListener,
    clearClickListeners: clearClickListeners,
    handleKeydown: handleKeydown,
    get width() {
      return width;
    },
    get height() {
      return height;
    },
  };
}
