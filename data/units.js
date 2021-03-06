// All Civ3 units, with 0-value stats omitted.
const units = {
  'AEGIS Cruiser': {cost: 160, attack: 15, defense: 10, moves: 7, bombard: 6, range: 2, rateOfFire: 2},
  'Ancient Cavalry': {cost: 40, attack: 3, defense: 2, moves: 2},
  'Ansar Warrior': {cost: 60, attack: 4, defense: 2, moves: 3},
  'Archer': {cost: 20, attack: 2, defense: 1, moves: 1, bombard: 1, rateOfFire: 1},
  'Artillery': {cost: 80, moves: 1, bombard: 12, range: 2, rateOfFire: 2},
  'Battleship': {cost: 200, attack: 18, defense: 12, moves: 5, bombard: 8, range: 2, rateOfFire: 2},
  'Berserk': {cost: 70, attack: 6, defense: 2, moves: 1},
  'Bomber': {cost: 100, defense: 2, moves: 1, bombard: 12, range: 10, rateOfFire: 3},
  'Bowman': {cost: 20, attack: 2, defense: 2, moves: 1, bombard: 1, rateOfFire: 1},
  'Cannon': {cost: 40, moves: 1, bombard: 8, range: 1, rateOfFire: 1},
  'Caravel': {cost: 40, attack: 1, defense: 2, moves: 4},
  'Carrack': {cost: 40, attack: 2, defense: 2, moves: 4},
  'Carrier': {cost: 180, attack: 1, defense: 8, moves: 7},
  'Catapult': {cost: 20, moves: 1, bombard: 4, range: 1, rateOfFire: 1},
  'Cavalry': {cost: 80, attack: 6, defense: 3, moves: 3},
  'Chariot': {cost: 20, attack: 1, defense: 1, moves: 2},
  'Chasqui Scout': {cost: 20, attack: 1, defense: 1, moves: 2},
  'Conquistador': {cost: 70, attack: 3, defense: 2, moves: 2},
  'Cossack': {cost: 90, attack: 6, defense: 3, moves: 3},
  'Cruise Missile': {cost: 60, moves: 1, bombard: 16, range: 4, rateOfFire: 3},
  'Cruiser': {cost: 160, attack: 15, defense: 10, moves: 6, bombard: 7, range: 1, rateOfFire: 2},
  'Crusader': {cost: 70, attack: 5, defense: 3, moves: 1},
  'Curragh': {cost: 15, attack: 1, defense: 1, moves: 2},
  'Destroyer': {cost: 120, attack: 12, defense: 8, moves: 8, bombard: 6, range: 1, rateOfFire: 2},
  'Dromon': {cost: 30, attack: 2, defense: 1, moves: 3, bombard: 2, range: 1, rateOfFire: 2},
  'Enkidu Warrior': {cost: 10, attack: 1, defense: 2, moves: 1},
  'Explorer': {cost: 20, moves: 2},
  'F-15': {cost: 100, attack: 8, defense: 4, moves: 1, bombard: 6, range: 9, rateOfFire: 2},
  'Fighter': {cost: 80, attack: 4, defense: 2, moves: 1, bombard: 3, range: 6, rateOfFire: 1},
  'Flak': {cost: 70, attack: 1, defense: 6, moves: 1},
  'Frigate': {cost: 60, attack: 2, defense: 2, moves: 5, bombard: 3, range: 1, rateOfFire: 2},
  'Galleon': {cost: 50, attack: 1, defense: 2, moves: 4},
  'Galley': {cost: 30, attack: 1, defense: 1, moves: 3},
  'Gallic Swordsman': {cost: 50, attack: 3, defense: 2, moves: 2},
  'Guerilla': {cost: 90, attack: 6, defense: 6, moves: 1, bombard: 3, rateOfFire: 1},
  'Helicopter': {cost: 100, defense: 2, moves: 1, range: 6},
  'Hoplite': {cost: 20, attack: 1, defense: 3, moves: 1},
  'Horseman': {cost: 30, attack: 2, defense: 1, moves: 2},
  'Hussar': {cost: 80, attack: 6, defense: 3, moves: 3},
  'Hwacha': {cost: 40, moves: 1, bombard: 8, range: 1, rateOfFire: 1},
  'ICBM': {cost: 500, moves: 1},
  'Immortals': {cost: 30, attack: 4, defense: 2, moves: 1},
  'Impi': {cost: 20, attack: 1, defense: 2, moves: 2},
  'Infantry': {cost: 90, attack: 6, defense: 10, moves: 1},
  'Ironclad': {cost: 90, attack: 5, defense: 6, moves: 3, bombard: 6, range: 1, rateOfFire: 2},
  'Jaguar Warrior': {cost: 15, attack: 1, defense: 1, moves: 2},
  'Javelin Thrower': {cost: 30, attack: 2, defense: 2, moves: 1},
  'Jet Fighter': {cost: 100, attack: 8, defense: 4, moves: 1, bombard: 3, range: 9, rateOfFire: 1},
  'Keshik': {cost: 60, attack: 4, defense: 2, moves: 2},
  'Knight': {cost: 70, attack: 4, defense: 3, moves: 2},
  'Leader': {moves: 3},
  'Legionary': {cost: 30, attack: 3, defense: 3, moves: 1},
  'Longbowman': {cost: 40, attack: 4, defense: 1, moves: 1, bombard: 2, rateOfFire: 1},
  'Man-O-War': {cost: 65, attack: 4, defense: 2, moves: 5, bombard: 4, range: 1, rateOfFire: 2},
  'Marine': {cost: 120, attack: 12, defense: 6, moves: 1},
  'Mech Infantry': {cost: 110, attack: 12, defense: 18, moves: 2},
  'Medieval Infantry': {cost: 40, attack: 4, defense: 2, moves: 1},
  'Mobile SAM': {cost: 100, attack: 1, defense: 6, moves: 2},
  'Modern Armor': {cost: 120, attack: 24, defense: 16, moves: 3},
  'Modern Paratrooper': {cost: 110, attack: 6, defense: 11, moves: 1},
  'Mounted Warrior': {cost: 30, attack: 3, defense: 1, moves: 2},
  'Musketeer': {cost: 60, attack: 2, defense: 5, moves: 1, bombard: 2, rateOfFire: 1},
  'Musketman': {cost: 60, attack: 2, defense: 4, moves: 1},
  'Nuclear Submarine': {cost: 140, attack: 8, defense: 4, moves: 5},
  'Numidian Mercenary': {cost: 30, attack: 2, defense: 3, moves: 1},
  'Panzer': {cost: 100, attack: 16, defense: 8, moves: 3},
  'Paratrooper': {cost: 90, attack: 4, defense: 9, moves: 1},
  'Pikeman': {cost: 30, attack: 1, defense: 3, moves: 1},
  'Privateer': {cost: 50, attack: 2, defense: 1, moves: 5},
  'Radar Artillery': {cost: 120, moves: 2, bombard: 16, range: 2, rateOfFire: 2},
  'Rider': {cost: 70, attack: 4, defense: 3, moves: 3},
  'Rifleman': {cost: 80, attack: 4, defense: 6, moves: 1},
  'Samurai': {cost: 70, attack: 4, defense: 4, moves: 2},
  'Scout': {cost: 10, moves: 2},
  'Settler': {cost: 30, moves: 1},
  'Sipahi': {cost: 100, attack: 8, defense: 3, moves: 3},
  'Spearman': {cost: 20, attack: 1, defense: 2, moves: 1},
  'Stealth Bomber': {cost: 240, defense: 5, moves: 1, bombard: 18, range: 16, rateOfFire: 3},
  'Stealth Fighter': {cost: 120, attack: 8, defense: 6, moves: 1, bombard: 6, range: 12, rateOfFire: 2},
  'Submarine': {cost: 100, attack: 8, defense: 4, moves: 4},
  'Swiss Mercenary': {cost: 30, attack: 1, defense: 4, moves: 1},
  'Swordsman': {cost: 30, attack: 3, defense: 2, moves: 1},
  'TOW Infantry': {cost: 120, attack: 12, defense: 14, moves: 1, bombard: 6, rateOfFire: 1},
  'Tactical Nuke': {cost: 300, moves: 1},
  'Tank': {cost: 100, attack: 16, defense: 8, moves: 2},
  'Three-Man Chariot': {cost: 30, attack: 2, defense: 2, moves: 2},
  'Transport': {cost: 100, attack: 1, defense: 2, moves: 6},
  'Trebuchet': {cost: 30, moves: 1, bombard: 6, range: 1, rateOfFire: 1},
  'War Chariot': {cost: 20, attack: 2, defense: 1, moves: 2},
  'War Elephant': {cost: 70, attack: 4, defense: 3, moves: 2},
  'Warrior': {cost: 10, attack: 1, defense: 1, moves: 1},
  'Worker': {cost: 10, moves: 1},
};

export default units;
