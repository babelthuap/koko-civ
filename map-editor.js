import board from './js/gameboard.js';
import {registerDragCallbacks} from './js/globalDragHandler.js';
import {Terrain} from './js/terrain.js';
import {clamp, constantCaseToTitleCase, limitOncePerFrame} from './js/util.js';
import archipelago from './map-scripts/archipelago.js';
import continents from './map-scripts/continents.js';

board.init({width: 100, height: 130});
continents(board, 0.25);

// Handle key presses.
document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'a':
      archipelago(board, 0.2);
      break;
    case 'c':
      continents(board, 0.25);
      break;
    default:
      board.handleKeydown(event);
  }
});

// Handle button clicks.
document.getElementById('archipelago')
    .addEventListener('click', () => archipelago(board, 0.2));
document.getElementById('continents')
    .addEventListener('click', () => continents(board, 0.25));

// Initialize terrain dropdown.
const TERRAIN_SELECT = document.getElementById('terrain-select');
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
const CONTROLS = document.getElementById('controls');
const DRAGBAR = CONTROLS.querySelector('#dragbar');
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
const MINIMIZE = CONTROLS.querySelector('#minimize');
const PLUS = MINIMIZE.querySelector('.plus');
const CONTENT = CONTROLS.querySelector('.content');
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
