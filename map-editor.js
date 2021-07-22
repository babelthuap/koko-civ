import board from './js/gameboard.js';
import {clamp, limitOncePerFrame} from './js/util.js';
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

// Handle tile clicks.
board.addClickListener((event, tile) => {
  switch (event.button) {
    case 0:
      // Left click.
      tile.terrain = 'MOUNTAIN';
      board.render();
      break;
    case 2:
      // Right click.
      alert(tile.terrain);
      break;
  }
});

// Handle click-and-drag controls.
const CONTROLS = document.getElementById('controls');
const DRAGBAR = CONTROLS.querySelector('#dragbar');
let mousePressed = false;
let dragging = false;
let controlsBox;
let startDrag = {};
DRAGBAR.addEventListener('mousedown', ({clientX, clientY}) => {
  mousePressed = true;
  controlsBox = CONTROLS.getBoundingClientRect();
  startDrag = {clientX, clientY};
  DRAGBAR.style.cursor = 'grabbing';
});
const repositionControls = (clientX, clientY) => {
  dragging = true;
  const dx = clientX - startDrag.clientX;
  const dy = clientY - startDrag.clientY;
  const {left, width, top, height} = controlsBox;
  CONTROLS.style.left = `${
      clamp(
          controlsBox.left + dx, 0, window.innerWidth - controlsBox.width)}px`;
  CONTROLS.style.top = `${
      clamp(
          controlsBox.top + dy, 0, window.innerHeight - controlsBox.height)}px`;
};
document.addEventListener('mousemove', ({clientX, clientY}) => {
  if (mousePressed) {
    limitOncePerFrame(repositionControls, clientX, clientY);
  }
});
document.addEventListener('mouseup', () => {
  mousePressed = false;
  dragging = false;
  DRAGBAR.style.cursor = '';
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
