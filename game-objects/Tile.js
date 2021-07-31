const PROP_TO_JSON = {
  units: Array.from,
  hasSeen: Array.from,
  canSee: Array.from,
};

const newSet = arr => new Set(arr);
const PROP_FROM_JSON = {
  units: newSet,
  hasSeen: newSet,
  canSee: newSet,
};

const DEFAULT_JSON = {
  terrain: '',
  units: [],
  hasSeen: [],
  canSee: [],
};

export default class Tile {
  constructor(json = DEFAULT_JSON) {
    for (let key in json) {
      const value = json[key];
      this[key] = key in PROP_FROM_JSON ? PROP_FROM_JSON[key](value) : value;
    }
  }
}

Tile.prototype.toJSON = function() {
  const json = {};
  for (let key in this) {
    const value = this[key];
    json[key] = key in PROP_TO_JSON ? PROP_TO_JSON[key](value) : value;
  }
  return json;
};
