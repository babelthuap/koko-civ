const PROP_TO_JSON = {
  units: Array.from,
  hasSeen: Array.from,
  canSee: Array.from,
};

const PROP_FROM_JSON = {
  units: arr => new Set(arr),
  hasSeen: arr => new Set(arr),
  canSee: arr => new Set(arr),
};

const DEFAULT_JSON = {
  terrain: '',
  units: [],
  hasSeen: [],
  canSee: [],
};

/**
 * All data for one tile of the game board.
 *   terrain: The underlaying geographical features.
 *   units: The list of units occupying the tile.
 *   hasSeen: The indexes of the players who have seen the tile.
 *   canSee: The indexes of the players who can currently see the tile.
 */
export default function Tile(json = DEFAULT_JSON) {
  for (let key in json) {
    const value = json[key];
    this[key] = key in PROP_FROM_JSON ? PROP_FROM_JSON[key](value) : value;
  }
}

/** For use by JSON.stringify(). */
Tile.prototype.toJSON = function() {
  const json = {};
  for (let key in this) {
    const value = this[key];
    json[key] = key in PROP_TO_JSON ? PROP_TO_JSON[key](value) : value;
  }
  return json;
};

/** Inverse of toJSON. */
Tile.fromJSON = (json) => new Tile(json);
