export type ItemType =
  | "WEAPON"
  | "ARMOR"
  | "ACCESSORY"
  | "AMMO"
  | "BUFF"
  | "MATERIAL";

export type AccessoryRole = "OFENSIVO" | "DEFENSIVO" | "MOVILIDAD" | "UTILIDAD";

export const ACCESSORY_ROLE_LABEL: Record<AccessoryRole, string> = {
  OFENSIVO: "ofensivo",
  DEFENSIVO: "defensivo",
  MOVILIDAD: "movilidad",
  UTILIDAD: "utilidad",
};

export type ClassType = "MELEE" | "RANGED" | "MAGIC" | "SUMMONER" | "GENERAL";

export type Subclass =
  | "SWORD"
  | "YOYO"
  | "FLAIL"
  | "SPEAR"
  | "BOOMERANG"
  | "BOW"
  | "GUN"
  | "LAUNCHER"
  | "THROWN"
  | "STAFF"
  | "TOME"
  | "MAGIC_GUN"
  | "MINION"
  | "WHIP"
  | "SENTRY";

export type GameStage =
  | "PRE_BOSSES"
  | "PRE_SKELETRON"
  | "PRE_HARDMODE"
  | "PRE_MECH_BOSSES"
  | "PRE_PLANTERA"
  | "PRE_GOLEM"
  | "PRE_LUNAR_EVENTS"
  | "PRE_MOON_LORD"
  | "POST_MOON_LORD";

export type Difficulty = "CLASSIC" | "EXPERT" | "MASTER";

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  CLASSIC: "Normal",
  EXPERT: "Experto",
  MASTER: "Maestro",
};

export const DIFFICULTY_ORDER: Difficulty[] = ["CLASSIC", "EXPERT", "MASTER"];

export interface GameVersion {
  gameVersion: string;
  updatedAt: string;
  changelog: string[];
}

export interface Stage {
  id: GameStage;
  order: number;
  title: string;
  short: string;
  description: string;
  gate: { bars?: string[]; boss: string };
  tips?: string[];
}

export interface ItemStats {
  damage?: number;
  damageType?: "MELEE" | "RANGED" | "MAGIC" | "SUMMON";
  defense?: number;
  critical?: number;
  useTime?: number;
  knockback?: number;
  mana?: number;
  velocity?: number;
  rare?: number;
  autoswing?: boolean;
  sell?: string;
  tooltip?: string;
}

export interface ItemModifiers {
  damageAll?: number;
  damageMelee?: number;
  damageRanged?: number;
  damageMagic?: number;
  damageSummon?: number;
  critAll?: number;
  critMelee?: number;
  critRanged?: number;
  critMagic?: number;
  critSummon?: number;
  defense?: number;
  meleeSpeed?: number;
  moveSpeed?: number;
  manaMax?: number;
  manaCost?: number;
  lifeRegen?: number;
  damageReduction?: number;
  ammoSave?: number;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  classType: ClassType;
  subclass?: Subclass;
  sprite?: string;
  set?: string;
  role?: AccessoryRole;
  obtainDescription: string;
  wikiPage?: string;
  stats?: ItemStats;
  modifiers?: ItemModifiers;
}

export interface ArmorSet {
  id: string;
  name: string;
  head: string;
  chest: string;
  legs: string;
  bonus: string;
  note?: string;
  modifiers?: ItemModifiers;
}

export interface RecipeIngredient {
  item: string;
  qty: number;
}

export interface Recipe {
  result: string;
  qty: number;
  ingredients: RecipeIngredient[];
  station: string;
}

export interface Drop {
  item: string;
  from: string;
  biomes: string[];
  chance?: { classic: string; expert: string; master: string };
  price?: string;
}

export type BuildSlotType =
  | "HELMET"
  | "CHEST"
  | "LEGS"
  | "SET_BONUS"
  | "WEAPON"
  | "WEAPON_ALT"
  | "MINION"
  | "WHIP"
  | "ACCESSORY"
  | "ACCESSORY_ALT"
  | "BUFF"
  | "AMMO";

export interface BuildSlot {
  slot: BuildSlotType;
  item?: string;
  alternatives?: string[];
  qty?: number;
  why: string;
  reforge?: string;
}

export interface BuildSubclassVariant {
  subclass: Subclass;
  title?: string;
  intro?: string;
  orderHint?: string[];
  slots: BuildSlot[];
}

export interface Build {
  id: string;
  stage: GameStage;
  classType: ClassType;
  subclass?: Subclass;
  title: string;
  intro: string;
  startGuide?: string[];
  orderHint: string[];
  slots: BuildSlot[];
  subclassSlots?: BuildSubclassVariant[];
}

export interface Mechanic {
  id: string;
  title: string;
  summary: string;
  points: string[];
  wikiPage?: string;
}

export interface Dataset {
  version: GameVersion;
  stages: Stage[];
  items: Item[];
  sets: ArmorSet[];
  recipes: Recipe[];
  drops: Drop[];
  builds: Build[];
  mechanics: Mechanic[];
}

export type SlimDataset = Pick<Dataset, "items" | "sets" | "recipes" | "drops">;

export const CLASS_ORDER: ClassType[] = [
  "MELEE",
  "RANGED",
  "MAGIC",
  "SUMMONER",
];

export const CLASS_LABEL: Record<ClassType, string> = {
  MELEE: "Melé",
  RANGED: "Distancia",
  MAGIC: "Magia",
  SUMMONER: "Invocador",
  GENERAL: "General",
};

export const STAGE_LABEL: Record<GameStage, string> = {
  PRE_BOSSES: "Pre-Bosses",
  PRE_SKELETRON: "Pre-Esqueleto",
  PRE_HARDMODE: "Pre-Modo Difícil",
  PRE_MECH_BOSSES: "Pre-Bosses Mecánicos",
  PRE_PLANTERA: "Pre-Plantera",
  PRE_GOLEM: "Pre-Gólem",
  PRE_LUNAR_EVENTS: "Pre-Eventos Lunares",
  PRE_MOON_LORD: "Pre-Moon Lord",
  POST_MOON_LORD: "Post-Moon Lord",
};

export const SLOT_LABEL: Record<BuildSlotType, string> = {
  HELMET: "Casco",
  CHEST: "Pecho",
  LEGS: "Piernas",
  SET_BONUS: "Bonus de Set",
  WEAPON: "Arma principal",
  WEAPON_ALT: "Arma secundaria",
  MINION: "Minión",
  WHIP: "Látigo",
  ACCESSORY: "Accesorio",
  ACCESSORY_ALT: "Accesorio sustituto",
  BUFF: "Buff / Poción",
  AMMO: "Munición",
};

export const CLASS_SUBCLASSES: Record<Exclude<ClassType, "GENERAL">, Subclass[]> = {
  MELEE: ["SWORD", "YOYO", "FLAIL", "SPEAR", "BOOMERANG"],
  RANGED: ["BOW", "GUN", "LAUNCHER", "THROWN"],
  MAGIC: ["STAFF", "TOME", "MAGIC_GUN"],
  SUMMONER: ["MINION", "WHIP", "SENTRY"],
};

export const SUB_CLASS_LABEL: Record<Subclass, string> = {
  SWORD: "Espada",
  YOYO: "Yoyo",
  FLAIL: "Martillo de cadena",
  SPEAR: "Lanza",
  BOOMERANG: "Bumerán",
  BOW: "Arco",
  GUN: "Pistola / arma de fuego",
  LAUNCHER: "Lanzacohetes",
  THROWN: "Arrojadizo",
  STAFF: "Bastón / varita",
  TOME: "Tomo",
  MAGIC_GUN: "Pistola mágica",
  MINION: "Minión",
  WHIP: "Látigo",
  SENTRY: "Centinela",
};