/**
 * All Civ4 techs. The format of the 'requires' field is:
 *
 * SYNTAX                           MEANING
 * requires := <null>               -> automatically satisfied
 *           | prerequisite         -> satisfied if the prerequisite is met
 * prerequisite := <string>         -> met if the tech has been researched
 *               | or
 *               | and
 *               | not
 * or := {OR: [prerequisite...]}    -> met if any sub-prerequisite is met
 * and := {AND: [prerequisite...]}  -> met if all sub-prerequisites are met
 * not := {NOT: prerequisite}       -> met if the sub-prerequisite is not met
 */
const techs = {
  // ANCIENT ERA
  'The Wheel': {
    cost: 60,
    era: 'Ancient',
    requires: null,
  },
  'Agriculture': {
    cost: 60,
    era: 'Ancient',
    requires: null,
  },
  'Animal Husbandry': {
    cost: 100,
    era: 'Ancient',
    requires: {OR: ['Agriculture', 'Hunting']},
  },
  'Fishing': {
    cost: 40,
    era: 'Ancient',
    requires: null,
  },
  'Hunting': {
    cost: 40,
    era: 'Ancient',
    requires: null,
  },
  'Mysticism': {
    cost: 50,
    era: 'Ancient',
    requires: null,
  },
  'Archery': {
    cost: 60,
    era: 'Ancient',
    requires: 'Hunting',
  },
  'Pottery': {
    cost: 80,
    era: 'Ancient',
    requires: {AND: ['The Wheel', {OR: ['Agriculture', 'Fishing']}]},
  },
  'Writing': {
    cost: 120,
    era: 'Ancient',
    requires: {OR: ['Priesthood', 'Animal Husbandry', 'Pottery']},
  },
  'Sailing': {
    cost: 100,
    era: 'Ancient',
    requires: 'Fishing',
  },
  'Masonry': {
    cost: 80,
    era: 'Ancient',
    requires: {OR: ['Mining', 'Mysticism']},
  },
  'Mining': {
    cost: 50,
    era: 'Ancient',
    requires: null,
  },
  'Priesthood': {
    cost: 60,
    era: 'Ancient',
    requires: {OR: ['Meditation', 'Polytheism']},
  },
  'Bronze Working': {
    cost: 120,
    era: 'Ancient',
    requires: 'Mining',
  },
  'Polytheism': {
    cost: 100,
    era: 'Ancient',
    requires: 'Mysticism',
  },
  'Monotheism': {
    cost: 120,
    era: 'Ancient',
    requires: {AND: ['Masonry', 'Polytheism']},
  },
  'Meditation': {
    cost: 80,
    era: 'Ancient',
    requires: 'Mysticism',
  },

  // CLASSICAL ERA
  'Monarchy': {
    cost: 300,
    era: 'Classical',
    requires: {OR: ['Priesthood', 'Monotheism']},
  },
  'Alphabet': {
    cost: 300,
    era: 'Classical',
    requires: 'Writing',
  },
  'Mathematics': {
    cost: 250,
    era: 'Classical',
    requires: 'Writing',
  },
  'Construction': {
    cost: 350,
    era: 'Classical',
    requires: {AND: ['Masonry', 'Mathematics']},
  },
  'Code of Laws': {
    cost: 350,
    era: 'Classical',
    requires: {AND: ['Writing', {OR: ['Priesthood', 'Currency']}]},
  },
  'Metal Casting': {
    cost: 450,
    era: 'Classical',
    requires: {AND: ['Pottery', 'Bronze Working']},
  },
  'Compass': {
    cost: 400,
    era: 'Classical',
    requires: {AND: ['Sailing', 'Iron Working']},
  },
  'Currency': {
    cost: 400,
    era: 'Classical',
    requires: {AND: ['Mathematics', 'Alphabet']},
  },
  'Horseback Riding': {
    cost: 250,
    era: 'Classical',
    requires: 'Animal Husbandry',
  },
  'Drama': {
    cost: 300,
    era: 'Classical',
    requires: 'Aesthetics',
  },
  'Calendar': {
    cost: 350,
    era: 'Classical',
    requires: {AND: ['Sailing', 'Mathematics']},
  },
  'Iron Working': {
    cost: 200,
    era: 'Classical',
    requires: 'Bronze Working',
  },
  'Literature': {
    cost: 200,
    era: 'Classical',
    requires: {AND: ['Polytheism', 'Aesthetics']},
  },
  'Aesthetics': {
    cost: 300,
    era: 'Classical',
    requires: 'Writing',
  },

  // MEDIEVAL ERA
  'Banking': {
    cost: 700,
    era: 'Medieval',
    requires: {AND: ['Currency', 'Guilds']},
  },
  'Engineering': {
    cost: 1000,
    era: 'Medieval',
    requires: {AND: ['Machinery', 'Construction']},
  },
  'Guilds': {
    cost: 1000,
    era: 'Medieval',
    requires: {AND: ['Feudalism', 'Machinery']},
  },
  'Feudalism': {
    cost: 700,
    era: 'Medieval',
    requires: {AND: ['Writing', 'Monarchy']},
  },
  'Machinery': {
    cost: 700,
    era: 'Medieval',
    requires: 'Metal Casting',
  },
  'Civil Service': {
    cost: 800,
    era: 'Medieval',
    requires: {AND: ['Mathematics', {OR: ['Code of Laws', 'Feudalism']}]},
  },
  'Philosophy': {
    cost: 800,
    era: 'Medieval',
    requires: {AND: ['Meditation', {OR: ['Drama', 'Code of Laws']}]},
  },
  'Optics': {
    cost: 600,
    era: 'Medieval',
    requires: {AND: ['Compass', 'Machinery']},
  },
  'Paper': {
    cost: 600,
    era: 'Medieval',
    requires: {AND: ['Theology', 'Civil Service']},
  },
  'Music': {
    cost: 600,
    era: 'Medieval',
    requires: {AND: ['Mathematics', {OR: ['Literature', 'Drama']}]},
  },
  'Divine Right': {
    cost: 1200,
    era: 'Medieval',
    requires: {AND: ['Theology', 'Monarchy']},
  },

  // RENAISSANCE ERA
  'Economics': {
    cost: 1400,
    era: 'Renaissance',
    requires: {AND: ['Banking', 'Education']},
  },
  'Constitution': {
    cost: 2000,
    era: 'Renaissance',
    requires: {AND: ['Code of Laws', 'Nationalism']},
  },
  'Astronomy': {
    cost: 2000,
    era: 'Renaissance',
    requires: {AND: ['Calendar', 'Optics']},
  },
  'Democracy': {
    cost: 2800,
    era: 'Renaissance',
    requires: {AND: ['Constitution', 'Printing Press']}
  },
  'Education': {
    cost: 1800,
    era: 'Renaissance',
    requires: 'Paper',
  },
  'Chemistry': {
    cost: 1800,
    era: 'Renaissance',
    requires: {AND: ['Engineering', 'Gunpowder']}
  },
  'Corporation': {
    cost: 1600,
    era: 'Renaissance',
    requires: {AND: ['Constitution', 'Economics']}
  },
  'Replaceable Parts': {
    cost: 1800,
    era: 'Renaissance',
    requires: {AND: ['Banking', 'Printing Press']}
  },
  'Gunpowder': {
    cost: 1200,
    era: 'Renaissance',
    requires: {OR: ['Guilds', 'Education']},
  },
  'Rifling': {
    cost: 2400,
    era: 'Renaissance',
    requires: {AND: ['Gunpowder', 'Replaceable Parts']}
  },
  'Printing Press': {
    cost: 1600,
    era: 'Renaissance',
    requires: {AND: ['Machinery', 'Alphabet', 'Paper']}
  },
  'Nationalism': {
    cost: 1800,
    era: 'Renaissance',
    requires: {AND: ['Civil Service', {OR: ['Philosophy', 'Divine Right']}]},
  },
  'Military Science': {
    cost: 2000,
    era: 'Renaissance',
    requires: 'Chemistry',
  },
  'Military Tradition': {
    cost: 2000,
    era: 'Renaissance',
    requires: {AND: ['Music', 'Nationalism']}
  },
  'Liberalism': {
    cost: 1400,
    era: 'Renaissance',
    requires: {AND: ['Philosophy', 'Education']}
  },

  // INDUSTRIAL ERA
  'Railroad': {
    cost: 4500,
    era: 'Industrial',
    requires: {AND: ['Steam Power', 'Steel']}
  },
  'Electricity': {
    cost: 4500,
    era: 'Industrial',
    requires: 'Physics',
  },
  'Assembly Line': {
    cost: 5000,
    era: 'Industrial',
    requires: {AND: ['Corporation', 'Steam Power']}
  },
  'Steel': {
    cost: 2800,
    era: 'Industrial',
    requires: {AND: ['Iron Working', 'Chemistry']}
  },
  'Medicine': {
    cost: 4500,
    era: 'Industrial',
    requires: {AND: ['Optics', 'Biology']},
  },
  'Industrialism': {
    cost: 6500,
    era: 'Industrial',
    requires: {AND: ['Electricity', 'Assembly Line']}
  },
  'Communism': {
    cost: 2800,
    era: 'Industrial',
    requires: {AND: ['Liberalism', 'Scientific Method']}
  },
  'Steam Power': {
    cost: 3200,
    era: 'Industrial',
    requires: {AND: ['Chemistry', 'Replaceable Parts']}
  },
  'Fission': {
    cost: 5500,
    era: 'Industrial',
    requires: 'Electricity',
  },
  'Combustion': {
    cost: 3600,
    era: 'Industrial',
    requires: 'Railroad',
  },
  'Biology': {
    cost: 3600,
    era: 'Industrial',
    requires: {AND: ['Chemistry', 'Scientific Method']},
  },
  'Physics': {
    cost: 4000,
    era: 'Industrial',
    requires: {AND: ['Astronomy', 'Scientific Method']},
  },
  'Fascism': {
    cost: 2400,
    era: 'Industrial',
    requires: {AND: ['Assembly Line', 'Nationalism']},
  },
  'Artillery': {
    cost: 4000,
    era: 'Industrial',
    requires: {AND: ['Physics', 'Steel', 'Rifling']},
  },

  // MODERN ERA
  'Radio': {
    cost: 6000,
    era: 'Modern',
    requires: 'Electricity',
  },
  'Flight': {
    cost: 5000,
    era: 'Modern',
    requires: {AND: ['Physics', 'Combustion']},
  },
  'Mass Media': {
    cost: 3600,
    era: 'Modern',
    requires: 'Radio',
  },
  'Plastics': {
    cost: 7000,
    era: 'Modern',
    requires: {AND: ['Combustion', 'Industrialism']}
  },
  'Computers': {
    cost: 6500,
    era: 'Modern',
    requires: {AND: ['Radio', 'Plastics']},
  },
  'Ecology': {
    cost: 5500,
    era: 'Modern',
    requires: {AND: ['Biology', {OR: ['Plastics', 'Fission']}]},
  },
  'Refrigeration': {
    cost: 4000,
    era: 'Modern',
    requires: {AND: ['Biology', 'Electricity']},
  },
  'Rocketry': {
    cost: 5000,
    era: 'Modern',
    requires: {AND: ['Rifling', {OR: ['Flight', 'Artillery']}]},
  },
  'Robotics': {
    cost: 8000,
    era: 'Modern',
    requires: 'Computers',
  },
  'Satellites': {
    cost: 6000,
    era: 'Modern',
    requires: {AND: ['Radio', 'Rocketry']},
  },
  'Fusion': {
    cost: 8000,
    era: 'Modern',
    requires: {AND: ['Fission', 'Fiber Optics']},
  },
  'Laser': {
    cost: 7000,
    era: 'Modern',
    requires: {AND: ['Plastics', 'Satellites']},
  },
  'Stealth': {
    cost: 8000,
    era: 'Modern',
    requires: {AND: ['Composites', 'Advanced Flight']},
  },
  'Genetics': {
    cost: 7000,
    era: 'Modern',
    requires: {AND: ['Medicine', 'Superconductors']},
  },
  'Fiber Optics': {
    cost: 7500,
    era: 'Modern',
    requires: {OR: ['Computers', 'Laser']},
  },
  'Advanced Flight': {
    cost: 5000,
    era: 'Modern',
    requires: {AND: ['Satellites', 'Flight']},
  },
  'Superconductors': {
    cost: 6500,
    era: 'Modern',
    requires: {OR: ['Refrigeration', 'Computers']},
  },
  'Future Tech': {
    cost: 8000,
    era: 'Modern',
    requires: {AND: ['Composites', 'Genetics']},
  },
};

export default techs;
