import board from './js/gameboard.js';
import {registerDragCallbacks} from './js/globalDragHandler.js';
import {Terrain} from './js/terrain.js';
import {clamp, constantCaseToTitleCase, limitOncePerFrame} from './js/util.js';
import archipelago from './map-scripts/archipelago.js';
import continents from './map-scripts/continents.js';

// Elements.
const WIDTH_INPUT = document.getElementById('width');
const HEIGHT_INPUT = document.getElementById('height');
const TERRAIN_SELECT = document.getElementById('terrain-select');
const CONTROLS = document.getElementById('controls');
const DRAGBAR = CONTROLS.querySelector('#dragbar');
const MINIMIZE = CONTROLS.querySelector('#minimize');
const PLUS = MINIMIZE.querySelector('.plus');
const CONTENT = CONTROLS.querySelector('.content');

// Load parameters from localStorage.
const params = (() => {
  const json = localStorage['KOKO_CIV.map_editor_params'];
  return json ? JSON.parse(json) : {};
})();
updateUI();

// Updates parameters and syncs them with localStorage.
params.set = (patch) => {
  for (const [key, value] of Object.entries(patch)) {
    params[key] = value;
  }
  localStorage['KOKO_CIV.map_editor_params'] = JSON.stringify(params);
  updateUI();
};

// Sync the current params to the UI.
function updateUI() {
  WIDTH_INPUT.value = params.width;
  HEIGHT_INPUT.value = params.height;
}

// Re-initialize the board with the currently-chosen width & height.
function updateBoardDimensions() {
  params.set({
    width: clamp(parseInt(WIDTH_INPUT.value), 10, 512) || /* default= */ 100,
    height: clamp(parseInt(HEIGHT_INPUT.value), 10, 512) || /* default= */ 130,
  });
  board.init(params);
}

// Handle key presses.
document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'a':
      updateBoardDimensions();
      archipelago(board, 0.2);
      break;
    case 'c':
      updateBoardDimensions();
      continents(board, 0.25);
      break;
    default:
      board.handleKeydown(event);
  }
});

// Map generation controls.
document.getElementById('archipelago').addEventListener('click', () => {
  updateBoardDimensions();
  archipelago(board, 0.2);
});
document.getElementById('continents').addEventListener('click', () => {
  updateBoardDimensions();
  continents(board, 0.25);
});

// Initialize terrain dropdown.
Object.entries(Terrain).forEach(([terrain, stats]) => {
  if (stats.color) {  // TODO: Remove once all terrain types are implemented.
    const option = document.createElement('option');
    option.innerText = constantCaseToTitleCase(terrain);
    option.value = terrain;
    TERRAIN_SELECT.append(option);
  }
});

// Handle tile clicks.
board.addClickListener((event, tile) => {
  switch (event.button) {
    case 0:
      // Left click.
      tile.terrain = TERRAIN_SELECT.value;
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
    CONTROLS.style.left = `${clamp(left + dx, 0, window.innerWidth - width)}px`;
    CONTROLS.style.top = `${clamp(top + dy, 0, window.innerHeight - height)}px`;
  },
  finalize: () => {
    DRAGBAR.style.cursor = '';
  },
});

// Handle minimizing controls
let isMinimized = false;
MINIMIZE.addEventListener('mousedown', () => {
  isMinimized = !isMinimized;
  if (isMinimized) {
    CONTENT.style.display = 'none';
    PLUS.style.display = '';
  } else {
    CONTENT.style.display = '';
    PLUS.style.display = 'none';
  }
});

// Expose board
window.board = board;

// Display an initial map.
updateBoardDimensions();
continents(board, 0.25);
