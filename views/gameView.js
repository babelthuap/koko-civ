import game from '../js/game.js';
import board from '../js/gameboard.js';
import {rand} from '../js/util.js';
import archipelago from '../map-scripts/archipelago.js';
import continents from '../map-scripts/continents.js';

import {constructViewElFromHtml} from './viewUtil.js';

export default {initNewGame, cleanUp};

const INGAME_UI_HTML = `<div id="ingame-menu" class="ui">
  <button class="exit">Exit to main menu</button>
</div>`;

let ingameUi;

function initNewGame(renderView, gameSetup) {
  // One-time initialization.
  if (!ingameUi) {
    ingameUi = constructViewElFromHtml(INGAME_UI_HTML);

    // Handle navigation
    ingameUi.addEventListener('click', () => {
      cleanUp();
      renderView('MAIN_MENU');
    });
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
  board.revealAll(false);
  board.render();

  // TESTING //
  let x, y;
  do {
    x = rand(board.width);
    y = rand(board.height);
  } while (new Set(['OCEAN', 'SEA', 'COAST']).has(board.getTile(x, y).terrain));
  board.getTile(x, y).units.push({type: 'SCOUT', owner: 0});
  // TESTING //

  game.init({
    turn: 1,
    player: 0,
  });

  return ingameUi;
}

function cleanUp() {
  game.cleanUp();
}
