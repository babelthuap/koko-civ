import board from './js/gameboard.js';
import {hide, show} from './js/util.js';
import continents from './map-scripts/continents.js';
import {initMainMenu} from './views/mainMenuView.js';
import {initMapEditor} from './views/mapEditorView.js';

// TODO: Persist params in localStorage.
let params = {};

const El = {
  BACKDROP: document.getElementById('backdrop'),
  GAMEBOARD: document.getElementById('gameboard'),
  INGAME_MENU: document.getElementById('ingame-menu'),
};

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

function renderView(view) {
  Object.values(El).forEach(child => hide(child));
  removeTemporaryListeners();
  switch (view) {
    case 'MAIN_MENU':
      renderMainMenu();
      break;
    case 'MAP_EDITOR':
      renderMapEditor();
      break;
    case 'QUICK_START':
      params = {
        width: 100,
        height: 100,
        wrap: true,
        mapScript: 'CONTINENTS',
      };
      renderGame();
      break;
  }
}

function renderMainMenu() {
  El.MAIN_MENU = initMainMenu(renderView);
  show(El.GAMEBOARD);
  show(El.BACKDROP);
  show(El.MAIN_MENU);
}

function renderMapEditor() {
  El.MAP_EDITOR = initMapEditor(renderView);
  show(El.GAMEBOARD);
  show(El.MAP_EDITOR);
}

function renderGame() {
  board.init(params);
  switch (params.mapScript) {
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
  show(El.GAMEBOARD);
  show(El.INGAME_MENU);
  addTemporaryListener(El.INGAME_MENU, 'click', () => renderView('MAIN_MENU'));
  const gameState = {
    turn: 1,
  };
}

/* Start on the main menu. */
renderView('MAIN_MENU');
