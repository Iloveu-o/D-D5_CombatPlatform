export const Faction = {
  PLAYER: 'player',      // Blue
  FRIENDLY: 'friendly',  // Green
  NEUTRAL: 'neutral',    // Yellow
  HOSTILE: 'hostile'     // Red
};

function generateId() {
  return 'unit_' + Math.random().toString(36).substr(2, 9);
}

export class Unit {
  constructor({
    name = 'New Unit',
    hpMax = 10,
    hpCurrent = 10,
    initiative = 10,
    faction = Faction.HOSTILE,
    ac = 10,
    stats = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    spellSlots = {},
    customProps = {},
    status = []
  } = {}) {
    this.id = generateId();
    this.name = name;
    this.hpMax = hpMax;
    this.hpCurrent = hpCurrent;
    this.initiative = initiative;
    this.faction = faction;
    this.ac = ac;
    this.stats = stats; // Ability Scores
    this.spellSlots = spellSlots; // e.g., { 1: 4, 2: 3 }
    this.customProps = customProps; // e.g., { "Class": "Wizard" }
    this.status = status; // Array of strings or objects
  }
}
