import archipelago from '../map-scripts/archipelago.js';
import continents from '../map-scripts/continents.js';

import board from './js/gameboard.js';
import {constructViewElFromHtml} from './viewUtil.js';

export default {initNewGame};

const INGAME_UI_HTML = `<div id="ingame-menu" class="ui">
  <button class="exit">Exit to main menu</button>
</div>`;

let ingameUi;

function initNewGame(renderView, gameSetup) {
  // One-time initialization.
  if (!ingameUi) {
    ingameUi = constructViewElFromHtml(INGAME_UI_HTML);

    // Handle navigation
    ingameUi.addEventListener('click', () => renderView('MAIN_MENU'));
  }

  board.init(gameSetup.boardParams);
  switch (gameSetup.boardParams.mapScript) {
    case 'ARCHIPELAGO':
      archipelago(board, 0.2);
      break;
    case 'CONTINENTS':
      continents(board, 0.25);
      break;
    default:
      throw 'no map script set';
  }
  board.render();

  return ingameUi;
}
