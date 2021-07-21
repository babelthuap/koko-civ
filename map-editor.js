import board from './js/gameboard.js';
import archipelago from './map-scripts/archipelago.js';
import continents from './map-scripts/continents.js';

board.init({width: 100, height: 130});
board.render();

document.addEventListener('keydown', ({code}) => {
  if (code === 'KeyA') {
    archipelago(board, 0.2);
  }
  if (code === 'KeyC') {
    continents(board, 0.25);
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
