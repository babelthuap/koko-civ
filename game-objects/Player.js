// Set of props that will not be serialized. These can be inferred from the
// other saved data and are only stored in this class for the sake of runtime
// efficiency.
const TRANSIENT_PROPS = new Set(['index', 'units', 'cities']);

/** Data about one of the game players. */
export default class Player {
  constructor({index, name, civ, leader, gold, units, cities}) {
    // The index of this player in the game. Determines turn order.
    this.index = index;
    // The user-chosen name of this player.
    this.name = name;
    // The civilization of this player.
    this.civ = civ;
    // The leader that this player is playing as.
    this.leader = leader;
    // Gold is gold is gold!
    this.gold = gold;
    // Set of units belonging to this user.
    this.units = units;
    // Set of cities belonging to this user.
    this.cities = cities;
  }

  toJSON() {
    const json = {};
    for (let key in this) {
      if (!TRANSIENT_PROPS.has(key)) {
        json[key] = this[key];
      }
    }
    return json;
  }

  static fromJSON(json, index, grid) {
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
  }
}
