import text from '../data/text.js';
import board from '../js/gameboard.js';
import {mod} from '../js/util.js';

export default {init, cleanUp};

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

// Game state. Properties:
//   - turn: the turn number
//   - player: whose turn it is
//   - focus: which element should receive keyboard events
//   - playerObjects: the objects that belong to each player
let state;

function init({turn, player}) {
  const playerObjects = [];
  board.forEachTile((tile, x, y) => {
    for (const unit of tile.units) {
      const objects =
          playerObjects[unit.owner] || (playerObjects[unit.owner] = {});
      const playerUnits = objects.units || (objects.units = []);
      playerUnits.push({unit, x, y});
    }
  });

  board.addClickListener((event, tile, x, y) => {
    // DEBUG
    if (tile.units.length) {
      alert(`I'm a ${tile.units[0].type}!`);
    }
  });

  board.centerOn(0, 0, /* scale= */ 125);
  setTimeout(() => alert(text.TURN_ONE_INTRO));

  state = {turn, player, focus: board, playerObjects};
  handleTurn({player: 0});
}

function cleanUp() {
  board.clearClickListeners();
  removeTemporaryListeners();
}

function updateVisibility(player) {
  board.forEachTile(tile => tile.canSee.clear());
  for (const {unit, x, y} of state.playerObjects[player].units) {
    board.getTile(x, y).canSee.add(unit);
    board.getTile(x, y).hasSeen.add(player);
    for (const [nx, ny] of board.getAdjacentCoordinates(x, y)) {
      board.getTile(nx, ny).canSee.add(unit);
      board.getTile(nx, ny).hasSeen.add(player);
    }
  }
}

function handleTurn({player}) {
  updateVisibility(player);

  let playerUnits = state.playerObjects[player].units;

  let unitIndex = 0;
  let activeUnitLocation = playerUnits[unitIndex];
  board.centerOn(activeUnitLocation.x, activeUnitLocation.y);
  board.render();

  addTemporaryListener(document, 'keydown', event => {
    const {unit, x, y} = activeUnitLocation;
    switch (event.code) {
      case 'Enter':
        unitIndex = mod(unitIndex + 1, playerUnits.length);
        activeUnitLocation = playerUnits[unitIndex];
        board.centerOn(activeUnitLocation.x, activeUnitLocation.y);
        return board.render();
      case 'Numpad1':
        board.getTile(x, y).units =
            board.getTile(x, y).units.filter(other => other !== unit);
        if (y % 2 === 0) {
          activeUnitLocation.x--;
        }
        activeUnitLocation.y++;
        board.getTile(activeUnitLocation.x, activeUnitLocation.y)
            .units.push(unit);
        updateVisibility(player);
        return board.render();
      case 'Numpad3':
        board.getTile(x, y).units =
            board.getTile(x, y).units.filter(other => other !== unit);
        if (y % 2 === 1) {
          activeUnitLocation.x++;
        }
        activeUnitLocation.y++;
        board.getTile(activeUnitLocation.x, activeUnitLocation.y)
            .units.push(unit);
        updateVisibility(player);
        return board.render();
      case 'Numpad4':
        board.getTile(x, y).units =
            board.getTile(x, y).units.filter(other => other !== unit);
        activeUnitLocation.x--;
        board.getTile(activeUnitLocation.x, y).units.push(unit);
        updateVisibility(player);
        return board.render();
      case 'Numpad6':
        board.getTile(x, y).units =
            board.getTile(x, y).units.filter(other => other !== unit);
        activeUnitLocation.x++;
        board.getTile(activeUnitLocation.x, y).units.push(unit);
        updateVisibility(player);
        return board.render();
      case 'Numpad7':
        board.getTile(x, y).units =
            board.getTile(x, y).units.filter(other => other !== unit);
        if (y % 2 === 0) {
          activeUnitLocation.x--;
        }
        activeUnitLocation.y--;
        board.getTile(activeUnitLocation.x, activeUnitLocation.y)
            .units.push(unit);
        updateVisibility(player);
        return board.render();
      case 'Numpad9':
        board.getTile(x, y).units =
            board.getTile(x, y).units.filter(other => other !== unit);
        if (y % 2 === 1) {
          activeUnitLocation.x++;
        }
        activeUnitLocation.y--;
        board.getTile(activeUnitLocation.x, activeUnitLocation.y)
            .units.push(unit);
        updateVisibility(player);
        return board.render();
      default:
        return board.handleKeydown(event);
    }
  });
}
