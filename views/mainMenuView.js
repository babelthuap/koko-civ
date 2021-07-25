import board from '../js/gameboard.js';
import {hide} from '../js/util.js';

import {constructViewElFromHtml} from './viewUtil.js';

export default {init};

const MAIN_MENU_HTML = `<div id="main-menu" class="ui">
  <div class="title">
    <h1>Welcome to Koko Civ</h1>
    <p>
      <em>"Like Civ 3, but butter."</em>
    </p>
  </div>
  <hr>
  <div class="menu">
    <div>
      <p><button id="quick-start">Quick Start</button></p>
      <p><button id="new-game" title="Not implemented" disabled>New Game</button></p>
      <p><button id="load-game" title="Not implemented" disabled>Load Game</button></p>
      <p><button id="hall-of-fame" title="Not implemented" disabled>Hall of Fame</button></p>
      <p><button id="preferences" title="Not implemented" disabled>Preferences</button></p>
    </div>
    <div>
      <p><button id="open-map-editor">Map Editor</button></p>
      <div class="cow"></div>
      <p>{{<a href="https://github.com/babelthuap/koko-civ" target="_blank">source code</a>}}</p>
    </div>
  </div>
</div>`;

let mainMenuEl;
let haveFocus;

function init(renderView) {
  haveFocus = true;

  // One-time initialization.
  if (!mainMenuEl) {
    mainMenuEl = constructViewElFromHtml(MAIN_MENU_HTML);

    // Handle navigation.
    const quickStart = mainMenuEl.querySelector('#quick-start');
    const newGame = mainMenuEl.querySelector('#new-game');
    const loadGame = mainMenuEl.querySelector('#load-game');
    const hallOfFame = mainMenuEl.querySelector('#hall-of-fame');
    const preferences = mainMenuEl.querySelector('#preferences');
    const openMapEditor = mainMenuEl.querySelector('#open-map-editor');
    quickStart.addEventListener('click', () => {
      haveFocus = false;
      renderView('QUICK_START');
    });
    openMapEditor.addEventListener('click', () => {
      haveFocus = false;
      renderView('MAP_EDITOR');
    });
  }

  // Render pretty background.
  board.init({width: 20, height: 10, wrap: true});
  board.forEachTile((tile, x, y) => {
    const r = Math.random();
    tile.terrain = r < 0.3 ? 'SEA' : 'OCEAN';
  });
  board.revealAll(true);
  board.render();
  let prevT = performance.now();
  const scrollBoard = (t) => {
    board.move({dx: (t - prevT) * 7e-5});
    board.render();
    prevT = t;
    if (haveFocus) {
      requestAnimationFrame(scrollBoard);
    }
  };
  requestAnimationFrame(scrollBoard);

  return mainMenuEl;
}
