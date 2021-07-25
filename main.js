import board from './js/gameboard.js';
import {hide, show} from './js/util.js';
import {forEachTile} from './map-scripts/common.js';
import continents from './map-scripts/continents.js';
import {getMapEditorEl} from './views/mapEditorView.js';

// TODO: Persist params in localStorage.
let params = {};

let currentView;

/** Enum of view states. */
const View = {
  MAIN_MENU: 0,
  MAP_EDITOR: 1,
  GAME: 3,
};

const El = {
  GAMEBOARD: document.getElementById('gameboard'),
  BACKDROP: document.getElementById('backdrop'),
  MAIN_MENU: document.getElementById('main-menu'),
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
  currentView = view;
  switch (view) {
    case View.MAIN_MENU:
      requestAnimationFrame(renderMainMenu);
      break;
    case View.MAP_EDITOR:
      requestAnimationFrame(renderMapEditor);
      break;
    case View.GAME:
      requestAnimationFrame(renderGame);
      break;
  }
}

function renderMainMenu() {
  show(El.BACKDROP);
  show(El.MAIN_MENU);

  // Handle buttons.
  const newGame = El.MAIN_MENU.querySelector('#new-game');
  const quickStart = El.MAIN_MENU.querySelector('#quick-start');
  const loadGame = El.MAIN_MENU.querySelector('#load-game');
  const hallOfFame = El.MAIN_MENU.querySelector('#hall-of-fame');
  const preferences = El.MAIN_MENU.querySelector('#preferences');
  const openMapEditor = El.MAIN_MENU.querySelector('#open-map-editor');
  addTemporaryListener(openMapEditor, 'click', () => {
    renderView(View.MAP_EDITOR);
  });
  addTemporaryListener(quickStart, 'click', () => {
    params = {
      width: 88,
      height: 114,
      wrap: true,
      mapScript: 'CONTINENTS',
    };
    renderView(View.GAME);
  });

  // Render pretty background.
  board.init({width: 20, height: 10, wrap: true});
  forEachTile(board, (tile, x, y) => {
    const r = Math.random();
    tile.terrain = r < 0.3 ? 'SEA' : 'OCEAN';
  });
  board.render();
  let prevT = performance.now();
  const scrollBoard = (t) => {
    board.move({dx: (t - prevT) * 7e-5});
    board.render();
    prevT = t;
    if (currentView === View.MAIN_MENU) {
      requestAnimationFrame(scrollBoard);
    }
  };
  requestAnimationFrame(scrollBoard);

  show(El.GAMEBOARD);
}

function renderMapEditor() {
  El.MAP_EDITOR = El.MAP_EDITOR || getMapEditorEl();
  show(El.MAP_EDITOR);
  show(El.GAMEBOARD);
  addTemporaryListener(
      El.MAP_EDITOR.querySelector('#return-to-main-menu'), 'click',
      () => renderView(View.MAIN_MENU));
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
  addTemporaryListener(
      El.INGAME_MENU, 'click', () => renderView(View.MAIN_MENU));
  const gameState = {
    turn: 1,
  };
}

/* Start on the main menu. */
renderView(View.MAIN_MENU);
