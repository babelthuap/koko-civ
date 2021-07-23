// The base terrain types.
export const Terrain = {
  // Land, not eligible for features.
  MOUNTAIN: {
    color: '#714626',
    moveCost: 3, defenseBonus: 100, food: 0, production: 1, gold: 0,
  },
  VOLCANO: {
    moveCost: 3, defenseBonus: 80, food: 0, production: 3, gold: 0,
  },
  FLOOD_PLAIN: {
    moveCost: 1, defenseBonus: 10, food: 3, production: 0, gold: 0,
  },

  // Land, eligible for features.
  GRASSLAND: {
    color: '#b1b54b',
    moveCost: 1, defenseBonus: 10, food: 2, production: 0, gold: 0,
  },
  BONUS_GRASSLAND: {
    moveCost: 1, defenseBonus: 10, food: 2, production: 1, gold: 0,
  },
  PLAINS: {
    color: '#dabe5d',
    moveCost: 1, defenseBonus: 10, food: 1, production: 1, gold: 0,
  },
  DESERT: {
    color: '#fceea9',
    moveCost: 1, defenseBonus: 10, food: 0, production: 1, gold: 0,
  },
  TUNDRA: {
    color: '#eaf1db',
    moveCost: 1, defenseBonus: 10, food: 1, production: 0, gold: 0,
  },

  // Water.
  OCEAN: {
    color: '#3c9e84',
    moveCost: 1, defenseBonus: 10, food: 0, production: 0, gold: 0,
  },
  SEA: {
    color: '#3ebda2',
    moveCost: 1, defenseBonus: 10, food: 1, production: 0, gold: 1,
  },
  COAST: {
    color: '#a0e2b5',
    moveCost: 1, defenseBonus: 10, food: 1, production: 0, gold: 2,
  },
  FRESHWATER_LAKE: {
    color: '#9eecbe',
    moveCost: 1, defenseBonus: 10, food: 2, production: 0, gold: 2,
  },
};

// Features that modify a base terrain type.
export const TerrainFeatures = {
  FOREST: {
    moveCost: 2, defenseBonus: 25, food: 1, production: 2, gold: 0,
    // Note: In Civ3, always clears to grassland.
    mayModify: ['GRASSLAND', 'BONUS_GRASSLAND', 'PLAINS', 'TUNDRA'],
  },
  JUNGLE: {
    moveCost: 3, defenseBonus: 25, food: 1, production: 0, gold: 0,
    // Note: In Civ3, always clears to plains.
    mayModify: ['GRASSLAND', 'BONUS_GRASSLAND', 'PLAINS'],
  },
  MARSH: {
    moveCost: 2, defenseBonus: 20, food: 1, production: 0, gold: 0,
    mayModify: ['GRASSLAND', 'BONUS_GRASSLAND', 'PLAINS'],
  },
  HILLS: {
    moveCost: 2, defenseBonus: 50, food: 1, production: 1, gold: 0,
    mayModify: ['GRASSLAND', 'BONUS_GRASSLAND', 'PLAINS', 'TUNDRA', 'DESERT'],
  },
};
