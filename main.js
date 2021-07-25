import board from './js/gameboard.js';
import {hide, show} from './js/util.js';
import mainMenuView from './views/mainMenuView.js';
import mapEditorView from './views/mapEditorView.js';
import gameView from './views/gameView.js';

const RootEl = {
  BACKDROP: document.getElementById('backdrop'),
  GAMEBOARD: document.getElementById('gameboard'),
};

function renderView(view) {
  Object.values(RootEl).forEach(child => hide(child));
  switch (view) {
    case 'MAIN_MENU':
      renderMainMenu();
      break;
    case 'MAP_EDITOR':
      renderMapEditor();
      break;
    case 'QUICK_START':
      startNewGame({
        boardParams: {
          width: 100,
          height: 100,
          wrap: true,
          mapScript: 'CONTINENTS',
        },
      });
      break;
  }
}

function renderMainMenu() {
  RootEl.MAIN_MENU = mainMenuView.init(renderView);
  show(RootEl.GAMEBOARD);
  show(RootEl.BACKDROP);
  show(RootEl.MAIN_MENU);
}

function renderMapEditor() {
  RootEl.MAP_EDITOR = mapEditorView.init(renderView);
  show(RootEl.GAMEBOARD);
  show(RootEl.MAP_EDITOR);
}

function startNewGame(gameSetup) {
  RootEl.INGAME_UI = gameView.initNewGame(renderView, gameSetup);
  show(RootEl.GAMEBOARD);
  show(RootEl.INGAME_UI);
}

/* Start on the main menu. */
renderView('MAIN_MENU');
