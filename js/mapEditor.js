import archipelago from '../map-scripts/archipelago.js';
import continents from '../map-scripts/continents.js';

import board from './gameboard.js';
import {registerDragCallbacks} from './globalDragHandler.js';
import {Terrain} from './terrain.js';
import {clamp, constantCaseToTitleCase, limitOncePerFrame} from './util.js';

export default {init, cleanUp};

const temporaryListeners = new Map();

const addTemporaryListener = (el, type, ...args) => {
  el.addEventListener(type, ...args);
  if (!temporaryListeners.has(el)) {
    temporaryListeners.set(el, new Map());
  }
  temporaryListeners.get(el).set(type, args);
};

const removeTemporaryListeners = () => {
  temporaryListeners.forEach(
      (typeArgs, el) => typeArgs.forEach(
          (args, type) => el.removeEventListener(type, ...args)));
  temporaryListeners.clear();
};

function init(rootEl) {
  // Elements.
  const SAVE = rootEl.querySelector('#save');
  const LOAD = rootEl.querySelector('#load');
  const WIDTH_INPUT = rootEl.querySelector('#width');
  const HEIGHT_INPUT = rootEl.querySelector('#height');
  const PERSPECTIVE = rootEl.querySelector('#perspective');
  const WRAP = rootEl.querySelector('#wrap');
  const TERRAIN_SELECT = rootEl.querySelector('#terrain-select');
  const BRUSH_SIZE = rootEl.querySelector('#brush-size');
  const CONTROLS = rootEl.querySelector('#map-editor-controls');
  const DRAGBAR = CONTROLS.querySelector('#dragbar');
  const MINIMIZE = CONTROLS.querySelector('#minimize');
  const PLUS = MINIMIZE.querySelector('.plus');
  const CONTENT = CONTROLS.querySelector('.content');

  // Load parameters from localStorage.
  const params = (() => {
    const json = localStorage['KOKO_CIV.map_editor_params'];
    return json ? JSON.parse(json) : {};
  })();

  // Updates parameters and syncs them with localStorage.
  params.set = (patch) => {
    for (const [key, value] of Object.entries(patch)) {
      params[key] = value;
    }
    localStorage['KOKO_CIV.map_editor_params'] = JSON.stringify(params);
    updateUI();
  };

  // Display an initial map.
  updateUI();

  // Sync the current params to the UI.
  function updateUI() {
    WIDTH_INPUT.value = params.width;
    HEIGHT_INPUT.value = params.height;
    WRAP.checked = params.wrap;
    PERSPECTIVE.checked = params.perspective;
    if (params.perspective) {
      document.body.classList.add('perspective');
    } else {
      document.body.classList.remove('perspective');
    }
  }

  // Re-initialize the board with the currently-chosen width & height.
  function updateBoardDimensions() {
    params.set({
      width: clamp(parseInt(WIDTH_INPUT.value), 10, 512) || /* default= */ 100,
      height:
          clamp(parseInt(HEIGHT_INPUT.value), 10, 512) || /* default= */ 100,
    });
    board.init(params);
  }

  // Toggle perspective.
  addTemporaryListener(PERSPECTIVE, 'change', () => {
    params.set({perspective: PERSPECTIVE.checked});
    board.render();
  });

  // Toggle wrap.
  addTemporaryListener(WRAP, 'change', () => {
    params.set({wrap: WRAP.checked});
    board.setWrap(params.wrap);
    board.render();
  });

  // Handle key presses.
  addTemporaryListener(document, 'keydown', (event) => {
    switch (event.key) {
      case 'm':
        TERRAIN_SELECT.value = 'MOUNTAIN';
        break;
      case 'g':
        TERRAIN_SELECT.value = 'GRASSLAND';
        break;
      case 'p':
        TERRAIN_SELECT.value = 'PLAINS';
        break;
      case 'd':
        TERRAIN_SELECT.value = 'DESERT';
        break;
      case 't':
        TERRAIN_SELECT.value = 'TUNDRA';
        break;
      case 'o':
        TERRAIN_SELECT.value = 'OCEAN';
        break;
      case 's':
        TERRAIN_SELECT.value = 'SEA';
        break;
      case 'c':
        TERRAIN_SELECT.value = 'COAST';
        break;
      case 'f':
        TERRAIN_SELECT.value = 'FRESHWATER_LAKE';
        break;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        BRUSH_SIZE.value = event.key;
        break;
      default:
        board.handleKeydown(event);
    }
  });

  // Map generation controls.
  addTemporaryListener(rootEl.querySelector('#archipelago'), 'click', () => {
    updateBoardDimensions();
    archipelago(board, 0.2);
  });
  addTemporaryListener(rootEl.querySelector('#continents'), 'click', () => {
    updateBoardDimensions();
    continents(board, 0.25);
  });

  // Initialize terrain dropdown.
  TERRAIN_SELECT.innerHTML = '';
  Object.entries(Terrain).forEach(([terrain, stats]) => {
    if (stats.color) {  // TODO: Remove once all terrain types are implemented.
      const option = document.createElement('option');
      option.innerText = constantCaseToTitleCase(terrain);
      option.value = terrain;
      TERRAIN_SELECT.append(option);
    }
  });

  // Handle tile clicks.
  board.addClickListener((event, tile, x, y) => {
    switch (event.button) {
      case 0:
        // Left click.
        const terrain = TERRAIN_SELECT.value;
        if (tile) {
          tile.terrain = terrain;
        }
        const paintNeighbors = (x, y, radius) => {
          if (radius > 1) {
            for (const [nx, ny] of board.getAdjacentCoordinates(x, y)) {
              const neighbor = board.getTile(nx, ny);
              if (neighbor) {
                neighbor.terrain = terrain;
                paintNeighbors(nx, ny, radius - 1);
              }
            }
          }
        };
        paintNeighbors(x, y, parseInt(BRUSH_SIZE.value));
        board.render();
        break;
      case 2:
        // Right click.
        alert(tile.terrain);
        break;
    }
  });

  // Handle click-and-drag for the controls window.
  let controlsBoundingBox;
  registerDragCallbacks(DRAGBAR, {
    onDragStart: () => {
      controlsBoundingBox = CONTROLS.getBoundingClientRect();
      DRAGBAR.style.cursor = 'grabbing';
    },
    onDrag: (dx, dy) => {
      const {left, width, top, height} = controlsBoundingBox;
      CONTROLS.style.left =
          `${clamp(left + dx, 0, window.innerWidth - width)}px`;
      CONTROLS.style.top =
          `${clamp(top + dy, 0, window.innerHeight - height)}px`;
    },
    finalize: () => {
      DRAGBAR.style.cursor = '';
    },
  });

  // Handle minimizing controls
  let isMinimized = false;
  addTemporaryListener(MINIMIZE, 'mousedown', () => {
    isMinimized = !isMinimized;
    if (isMinimized) {
      CONTENT.style.display = 'none';
      PLUS.style.display = '';
    } else {
      CONTENT.style.display = '';
      PLUS.style.display = 'none';
    }
  });

  // Handle save.
  addTemporaryListener(SAVE, 'click', () => {
    const blob = new Blob([board.save()], {type: 'text/json'});
    const el = document.createElement('a');
    el.href = URL.createObjectURL(blob);
    el.download = `map_${Date.now()}.json`;
    rootEl.appendChild(el);
    el.click();
    el.remove();
  });

  // Handle load.
  addTemporaryListener(LOAD, 'click', () => {
    const uploader = document.createElement('input');
    uploader.type = 'file';
    uploader.accept = '.json';
    uploader.addEventListener('change', () => {
      const file = uploader.files[0];
      if (file) {
        const reader = new FileReader();
        reader.addEventListener('load', (e) => {
          const json = e.target.result;
          board.load(json);
          params.set(
              {width: board.width, height: board.height, wrap: board.wrap});
          board.render();
        });
        reader.readAsText(file);
      }
    });
    rootEl.appendChild(uploader);
    uploader.click();
    uploader.remove();
  });
}

function cleanUp() {
  board.clearClickListeners();
  removeTemporaryListeners();
}
