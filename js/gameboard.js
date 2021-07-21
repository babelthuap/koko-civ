import {clear, coordsToPosition, getInternalCoords, renderTile} from './renderUtils.js';
import {serialize} from './serialize.js';
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
    wrap = options.wrap || 1;  // default = CYLINDRICAL
    tiles = new Array(width * height).fill().map(() => ({terrain: 'OCEAN'}));
    coordWidth = getInternalCoords(width, 0)[0];
    coordHeight = getInternalCoords(0, height - 1)[1] + 1;
    updateView({leftX: 0, topY: 0, scale: 0});
    attachListeners();
  }

  /** Serializes the board. */
  function save() {
    return JSON.stringify({tiles, options: {width, height, wrap}});
  }

  /** Initializes the board from serialized data. */
  function load(serialized) {
    const deserialized = JSON.parse(serialized);

    console.assert(Array.isArray(deserialized.tiles));
    console.assert(Number.isInteger(deserialized.options.width));
    console.assert(Number.isInteger(deserialized.options.height));
    console.assert(
        deserialized.tiles.length ===
        deserialized.options.width * deserialized.options.height);

    width = deserialized.options.width;
    height = deserialized.options.height;
    wrap = deserialized.options.wrap;
    tiles = deserialized.tiles;
    coordWidth = getInternalCoords(width, 0)[0];
    coordHeight = getInternalCoords(0, height - 1)[1] + 1;
    updateView({leftX: 0, topY: 0, scale: 0});
    attachListeners();
  }

  /** Renders the gameboard. */
  function render() {
    limitOncePerFrame(rawRender);
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


  /*******************/
  /* PRIVATE METHODS */
  /*******************/

  function rawRender() {
    // Raw, non-rate-limited render. Never use this directly.
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
        const tile = tiles[width * ty + mod(tx, width)];
        const [x, y] = getInternalCoords(tx, ty);
        renderTile(tile, x, y, view, canvas);
      }
    }
  }

  let listenersAttached = false;
  function attachListeners() {
    if (listenersAttached) return;
    listenersAttached = true;
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('wheel', handleWheel);
    document.addEventListener('keydown', handleKeydown);
    attachMouseListeners();
  }

  function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    updateView(view);
    render();
  }


  function handleWheel({deltaY, layerX, layerY}) {
    // Fix the *internal* position that the cursor is hovering over. I.e., try
    // to re-center the view so that the the cursor is hovering over the same
    // tile before and after zooming.
    const internalX = view.leftX + layerX / view.scale;
    const internalY = view.topY + layerY / view.scale;

    // Relate the wheel's y-scale to our scale logarithmically. I tried linear
    // and quadratic relationships, but this feels better.
    const logScale = Math.log(view.scale);
    const newLogScale = logScale - deltaY * 0.007;
    const newScale =
        clamp(Math.exp(newLogScale), canvas.height / coordHeight, MAX_SCALE);

    updateView({
      leftX: internalX - layerX / newScale,
      topY: internalY - layerY / newScale,
      scale: newScale,
    });
    render();
  }

  function handleKeydown(event) {
    // TODO: Handle all keyboard events externally.
    switch (event.code) {
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
          layerX: window.innerWidth / 2,
          layerY: window.innerHeight / 2,
        });
      case 'PageDown':
        return handleWheel({
          deltaY: 10,
          layerX: window.innerWidth / 2,
          layerY: window.innerHeight / 2,
        });
      case 'Home':
        updateView({leftX: 0, topY: 0, scale: 100});
        return render();
      case 'End':
        updateView({leftX: 0, topY: 0, scale: 0});
        return render();
    }
  }

  function attachMouseListeners() {
    // Disable the normal context menu.
    canvas.addEventListener('contextmenu', event => event.preventDefault());

    // Enable click-and-drag to pan map.
    let mousePressed = false;
    let dragging = false;
    const startDrag = {leftX: 0, topY: 0, layerX: 0, layerY: 0};
    canvas.addEventListener('mousedown', (event) => {
      switch (event.button) {
        case 0:
          // Left click.
          mousePressed = true;
          startDrag.leftX = view.leftX;
          startDrag.topY = view.topY;
          startDrag.layerX = event.layerX;
          startDrag.layerY = event.layerY;
          break;
        case 2:
          // Right click.
          invokeClickListeners(event);
          break;
      }
    });
    canvas.addEventListener('mousemove', (event) => {
      if (mousePressed) {
        dragging = true;
        canvas.style.cursor = 'grabbing';
        const dx = (event.layerX - startDrag.layerX) / view.scale;
        const dy = (event.layerY - startDrag.layerY) / view.scale;
        updateView({
          leftX: startDrag.leftX - dx,
          topY: startDrag.topY - dy,
          scale: view.scale,
        });
        render();
      }
    });
    canvas.addEventListener('mouseup', (event) => {
      switch (event.button) {
        case 0:
          // Left click: end dragging and invoke click listeners if the cursor
          // has not moved much since mousedown.
          const shouldInvokeClickListeners = (mousePressed && !dragging) ||
              (Math.abs(event.layerX - startDrag.layerX) < 2 &&
               Math.abs(event.layerY - startDrag.layerY) < 2);
          finalizeDragging(event);
          if (shouldInvokeClickListeners) {
            invokeClickListeners(event);
          }
          break;
        case 2:
          // Right click: do nothing. This is already handled in mousedown.
          break;
      }
    });
    canvas.addEventListener('mouseleave', finalizeDragging);

    function finalizeDragging(event) {
      canvas.style.cursor = '';
      mousePressed = false;
      dragging = false;
    }

    function invokeClickListeners(event) {
      const [tx, ty] = coordsToPosition(
          mod(view.leftX + event.layerX / view.scale, coordWidth),
          view.topY + event.layerY / view.scale, width);
      const tile = getTile(tx, ty);
      clickListeners.forEach(callback => callback(event, tile));
    }
  }

  /**
   * Update the view parameters, constraining them so the view doesn't go off
   * the map.
   */
  function updateView(newView) {
    const scale = clamp(newView.scale, canvas.height / coordHeight, MAX_SCALE);
    const leftX = mod(newView.leftX, coordWidth);
    const topY = clamp(newView.topY, 0, coordHeight - canvas.height / scale);
    view.scale = scale;
    view.leftX = leftX;
    view.topY = topY;
  }


  /*************************/
  /* EXPOSE PUBLIC METHODS */
  /*************************/
  return {
    init: init,
    save: save,
    load: load,
    render: render,
    getTile: getTile,
    getAdjacentCoordinates: getAdjacentCoordinates,
    addClickListener: addClickListener,
    removeClickListener: removeClickListener,
    clearClickListeners: clearClickListeners,
    get width() {
      return width;
    },
    get height() {
      return height;
    },
  };
}
