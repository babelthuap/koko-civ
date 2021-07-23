import board from './js/gameboard.js';
import {hide, show} from './js/util.js';
import {forEachTile} from './map-scripts/common.js';
import continents from './map-scripts/continents.js';

// TODO: Persist params in localStorage.
let params = {};

/** Enum of view states. */
const View = {
  MAIN_MENU: 0,
};

const El = {
  GAMEBOARD: document.getElementById('gameboard'),
  MAIN_MENU: document.getElementById('main-menu'),
};

const temporaryListeners = new Map();

const addTemporaryListener = (el, type, ...args) => {
  el.addEventListener(type, ...args);
  if (!temporaryListeners.has(el)) {
    temporaryListeners.set(el, new Map());
  }
  temporaryListeners.get(el).set(type, args);
};

function renderView(view) {
  Object.values(El).forEach(child => hide(child));
  temporaryListeners.forEach(
      (typeArgs, el) => typeArgs.forEach(
          (args, type) => el.removeEventListener(type, ...args)));
  temporaryListeners.clear();
  switch (view) {
    case View.MAIN_MENU:
      requestAnimationFrame(renderMainMenu);
      break;
    case View.GAME:
      requestAnimationFrame(renderGame);
      break;
  }
}

function renderMainMenu() {
  show(El.MAIN_MENU);

  // Handle buttons.
  const newGame = document.getElementById('new-game');
  const quickStart = document.getElementById('quick-start');
  const loadGame = document.getElementById('load-game');
  const hallOfFame = document.getElementById('hall-of-fame');
  const preferences = document.getElementById('preferences');
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
  board.init({width: 20, height: 20, wrap: true});
  forEachTile(board, (tile, x, y) => {
    const r = Math.random();
    tile.terrain = r < 0.3 ? 'SEA' : 'OCEAN';
  });
  board.render();
  show(El.GAMEBOARD);
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
  const gameState = {
    turn: 1,
  };
}

/* Start on the main menu. */
renderView(View.MAIN_MENU);
