import units from '../data/units.js';

/**
 * Data about an individual unit.
 *   type: The type of the unit.
 *   owner: The owner of the unit.
 */
export default function Unit(json) {
  if (!(json.type in units)) {
    throw `Unrecognized unit type "${json.type}"`;
  }
  Object.assign(this, json);
}

Unit.prototype.stats = function() {
  return units[this.type];
};

Unit.prototype.image() {
  throw `TODO`;
};

/** Inverse of toJSON. */
Unit.fromJSON = (json) => new Unit(json);
