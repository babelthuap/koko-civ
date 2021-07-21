import board from './js/gameboard.js';
import archipelago from './map-scripts/archipelago.js';
import continents from './map-scripts/continents.js';

board.init({width: 100, height: 130});
continents(board, 0.25);

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

document.getElementById('archipelago')
    .addEventListener('click', () => archipelago(board, 0.2));
document.getElementById('continents')
    .addEventListener('click', () => continents(board, 0.25));

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

// Expose board
window.board = board;
