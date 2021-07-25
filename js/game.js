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
      const playerUnitLocations = objects.units || (objects.units = []);
      playerUnitLocations.push({unit, x, y});
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

  let playerUnitLocations = state.playerObjects[player].units;

  let unitIndex, activeUnitLocation;
  setActiveUnitIndex(0);
  board.centerOn(activeUnitLocation.x, activeUnitLocation.y);
  board.render();

  function setActiveUnitIndex(index) {
    unitIndex = index;
    activeUnitLocation = playerUnitLocations[unitIndex];
    board.setActiveUnitPosition(activeUnitLocation.x, activeUnitLocation.y);
  }

  board.addClickListener((event, tile, x, y) => {
    for (const unit of tile.units) {
      const index = playerUnitLocations.findIndex(
          unitLocation => unitLocation.unit === unit);
      if (index !== -1) {
        setActiveUnitIndex(index);
        return board.render();
      }
    }
  });

  addTemporaryListener(document, 'keydown', event => {
    const {unit, x, y} = activeUnitLocation;
    switch (event.code) {
      case 'Enter':
        setActiveUnitIndex(mod(unitIndex + 1, playerUnitLocations.length));
        board.centerOn(activeUnitLocation.x, activeUnitLocation.y);
        return board.render();
      case 'c':
        board.centerOn(activeUnitLocation.x, activeUnitLocation.y);
        return board.render();
      case 'Numpad1':
        return moveActiveUnit('SW');
      case 'Numpad3':
        return moveActiveUnit('SE');
      case 'Numpad4':
        return moveActiveUnit('W');
      case 'Numpad6':
        return moveActiveUnit('E');
      case 'Numpad7':
        return moveActiveUnit('NW');
      case 'Numpad9':
        return moveActiveUnit('NE');
      default:
        return board.handleKeydown(event);
    }
  });

  function moveActiveUnit(direction) {
    const {unit, x, y} = activeUnitLocation;
    let toX, toY;
    switch (direction) {
      case 'NE':
        if (y === 0) return;
        toX = (y % 2 === 1) ? mod(x + 1, board.width) : x;
        toY = y - 1;
        break;
      case 'NW':
        if (y === 0) return;
        toX = (y % 2 === 0) ? mod(x - 1, board.width) : x;
        toY = y - 1;
        break;
      case 'E':
        toX = mod(x + 1, board.width);
        toY = y;
        break;
      case 'W':
        toX = mod(x - 1, board.width);
        toY = y;
        break;
      case 'SE':
        if (y === board.height - 1) return;
        toX = (y % 2 === 1) ? mod(x + 1, board.width) : x;
        toY = y + 1;
        break;
      case 'SW':
        if (y === board.height - 1) return;
        toX = (y % 2 === 0) ? mod(x - 1, board.width) : x;
        toY = y + 1;
        break;
    }

    const toTile = board.getTile(toX, toY);
    const toTerrain = toTile.terrain;
    switch (unit.type) {
      case 'SETTLER':
        if (['OCEAN', 'SEA', 'COAST', 'FRESHWATER_LAKE'].includes(toTerrain)) {
          return;
        }
        break;
      case 'SCOUT':
        // No restrictions, woohoo!
        break;
    }

    board.getTile(x, y).units =
        board.getTile(x, y).units.filter(other => other !== unit);
    toTile.units.push(unit);
    activeUnitLocation.x = toX;
    activeUnitLocation.y = toY;
    board.setActiveUnitPosition(activeUnitLocation.x, activeUnitLocation.y);
    updateVisibility(player);
    board.render();
  }
}
