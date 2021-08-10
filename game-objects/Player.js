// Set of props that will not be serialized. These can be inferred from the
// other saved data and are only stored in this class for the sake of runtime
// efficiency.
const TRANSIENT_PROPS = new Set(['index', 'units', 'cities']);

/**
 * Data about one of the game players.
 *   index: The unique index of this player in the game. Determines turn order.
 *   units: Set of units belonging to this user.
 *   cities: Set of cities belonging to this user.
 *   general:
 *     name: The user-chosen name of this player.
 *     civ: The civilization of this player.
 *     leader: The leader that this player is playing as.
 *   finance:
 *     gold: The girth of the treasury.
 *     science: 0-100, The percent of income allocated to research.
 *     culture: 0-100, The percent of income allocated to culture.
 *   research:
 *     researched: The list of techs the player has researched.
 *     current: The tech currently being researched.
 */
export default function Player(json) {
  this.index = json.index;
  this.units = json.units;
  this.cities = json.cities;
  this.general = json.general;
  this.finance = json.finance;
  this.research = json.research;
}

/** For use by JSON.stringify(). */
Player.prototype.toJSON = function() {
  const json = {};
  // Ignore transient props.
  for (let prop in this) {
    if (!TRANSIENT_PROPS.has(prop)) {
      json[prop] = this[prop];
    }
  }
  return json;
};

/** Inverse of toJSON. */
Player.fromJSON = (json, index, grid) => {
  // Initialize transient props.
  json.index = index;
  json.units = new Set();
  json.cities = new Set();
  grid.forEachTile((tile, x, y) => {
    for (const unit of tile.units) {
      if (unit.owner === index) {
        json.units.add({unit, x, y});
      }
    }
    if (tile.city && tile.city.owner === index) {
      json.cities.add({tile.city, x, y});
    }
  });
  return new Player(json);
};
