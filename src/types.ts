export interface Attribute {
  name: string;
  shortName: string;
  value: number;
  proficient: boolean;
}

export interface RollResult {
  label: string;
  expression: string;
  rolls: number[];
  modifier: number;
  total: number;
  type: string;
  isCritSuccess?: boolean;
  isCritFailure?: boolean;
  advantageMode?: "normal" | "advantage" | "disadvantage";
  rolledWithAdv?: {
    roll1: number;
    roll2: number;
  };
  timestamp: string;
}

export interface Skill {
  name: string;
  attributeShortName: string;
  proficient: boolean;
}

export interface Feature {
  id: string;
  name: string;
  source: string;
  description: string;
}

export interface Spell {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  prepared: boolean;
}

export interface SpellSlots {
  level1: { max: number; current: number };
  level2: { max: number; current: number };
  level3: { max: number; current: number };
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  description?: string;
  weight?: number;
  isMagical?: boolean;
  equipped?: boolean;
}

export interface CharacterData {
  name: string;
  title: string;
  class: string;
  level: number;
  xp: number;
  hp: {
    max: number;
    current: number;
    temp: number;
  };
  ac: number;
  speed: string;
  initiativeBonus: number;
  attributes: {
    str: Attribute;
    dex: Attribute;
    con: Attribute;
    int: Attribute;
    wis: Attribute;
    cha: Attribute;
  };
  skills: Skill[];
  layOnHands: {
    max: number;
    current: number;
  };
  divineSense: {
    max: number;
    current: number;
  };
  spellSlots: SpellSlots;
  spells: Spell[];
  inventory: InventoryItem[];
  coins: {
    gp: number;
    sp: number;
    cp: number;
  };
  features: Feature[];
  notes: string;
}
