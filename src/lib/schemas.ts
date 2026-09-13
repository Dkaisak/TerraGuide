import { z } from "zod";

export const classTypeSchema = z.enum([
  "MELEE",
  "RANGED",
  "MAGIC",
  "SUMMONER",
  "GENERAL",
]);

export const subclassSchema = z.enum([
  "SWORD",
  "YOYO",
  "FLAIL",
  "SPEAR",
  "BOOMERANG",
  "BOW",
  "GUN",
  "LAUNCHER",
  "THROWN",
  "STAFF",
  "TOME",
  "MAGIC_GUN",
  "MINION",
  "WHIP",
  "SENTRY",
]);

export const itemTypeSchema = z.enum([
  "WEAPON",
  "ARMOR",
  "ACCESSORY",
  "AMMO",
  "BUFF",
  "MATERIAL",
]);

export const accessoryRoleSchema = z.enum([
  "OFENSIVO",
  "DEFENSIVO",
  "MOVILIDAD",
  "UTILIDAD",
]);

export const gameStageSchema = z.enum([
  "PRE_BOSSES",
  "PRE_SKELETRON",
  "PRE_HARDMODE",
  "PRE_MECH_BOSSES",
  "PRE_PLANTERA",
  "PRE_GOLEM",
  "PRE_LUNAR_EVENTS",
  "PRE_MOON_LORD",
  "POST_MOON_LORD",
]);

export const buildSlotTypeSchema = z.enum([
  "HELMET",
  "CHEST",
  "LEGS",
  "SET_BONUS",
  "WEAPON",
  "WEAPON_ALT",
  "MINION",
  "WHIP",
  "ACCESSORY",
  "ACCESSORY_ALT",
  "BUFF",
  "AMMO",
]);

export const gameVersionSchema = z.object({
  gameVersion: z.string(),
  updatedAt: z.string(),
  changelog: z.array(z.string()),
});

export const stageSchema = z.object({
  id: gameStageSchema,
  order: z.number().int().nonnegative(),
  title: z.string().min(1),
  short: z.string(),
  description: z.string(),
  gate: z.object({
    bars: z.array(z.string()).optional(),
    boss: z.string(),
  }),
  tips: z.array(z.string()).optional(),
});

export const itemStatsSchema = z.object({
  damage: z.number().optional(),
  damageType: z.enum(["MELEE", "RANGED", "MAGIC", "SUMMON"]).optional(),
  defense: z.number().optional(),
  critical: z.number().optional(),
  useTime: z.number().optional(),
  knockback: z.number().optional(),
  mana: z.number().optional(),
  velocity: z.number().optional(),
  rare: z.number().optional(),
  autoswing: z.boolean().optional(),
  sell: z.string().optional(),
  tooltip: z.string().optional(),
});

export const itemModifiersSchema = z.object({
  damageAll: z.number().optional(),
  damageMelee: z.number().optional(),
  damageRanged: z.number().optional(),
  damageMagic: z.number().optional(),
  damageSummon: z.number().optional(),
  critAll: z.number().optional(),
  critMelee: z.number().optional(),
  critRanged: z.number().optional(),
  critMagic: z.number().optional(),
  critSummon: z.number().optional(),
  defense: z.number().optional(),
  meleeSpeed: z.number().optional(),
  moveSpeed: z.number().optional(),
  manaMax: z.number().optional(),
  manaCost: z.number().optional(),
  lifeRegen: z.number().optional(),
  damageReduction: z.number().optional(),
  ammoSave: z.number().optional(),
});

export const itemSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, "id debe ser kebab-case"),
  name: z.string().min(1),
  type: itemTypeSchema,
  classType: classTypeSchema,
  subclass: subclassSchema.optional(),
  sprite: z.string().optional(),
  set: z.string().optional(),
  role: accessoryRoleSchema.optional(),
  obtainDescription: z.string(),
  wikiPage: z.string().optional(),
  stats: itemStatsSchema.optional(),
  modifiers: itemModifiersSchema.optional(),
});

export const armorSetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  head: z.string(),
  chest: z.string(),
  legs: z.string(),
  bonus: z.string(),
  note: z.string().optional(),
  modifiers: itemModifiersSchema.optional(),
});

export const recipeSchema = z.object({
  result: z.string().min(1),
  qty: z.number().int().positive(),
  ingredients: z.array(
    z.object({
      item: z.string().min(1),
      qty: z.number().int().positive(),
    }),
  ),
  station: z.string().min(1),
});

export const dropSchema = z.object({
  item: z.string().min(1),
  from: z.string().min(1),
  biomes: z.array(z.string()),
  chance: z
    .object({
      classic: z.string(),
      expert: z.string(),
      master: z.string(),
    })
    .optional(),
  price: z.string().optional(),
});

export const buildSlotSchema = z.object({
  slot: buildSlotTypeSchema,
  item: z.string().optional(),
  alternatives: z.array(z.string()).optional(),
  qty: z.number().int().positive().optional(),
  why: z.string().min(1),
  reforge: z.string().optional(),
});

export const buildSubclassVariantSchema = z.object({
  subclass: subclassSchema,
  title: z.string().optional(),
  intro: z.string().optional(),
  orderHint: z.array(z.string()).optional(),
  slots: z.array(buildSlotSchema),
});

export const buildSchema = z.object({
  id: z.string().min(1),
  stage: gameStageSchema,
  classType: classTypeSchema,
  subclass: subclassSchema.optional(),
  title: z.string().min(1),
  intro: z.string(),
  startGuide: z.array(z.string()).optional(),
  orderHint: z.array(z.string()),
  slots: z.array(buildSlotSchema),
  subclassSlots: z.array(buildSubclassVariantSchema).optional(),
}).superRefine((build, ctx) => {
  if (build.classType === "GENERAL") {
    ctx.addIssue({
      code: "custom",
      path: ["classType"],
      message: "Las builds no pueden ser de clase GENERAL",
    });
  }
});

export const mechanicSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string(),
  points: z.array(z.string()),
  wikiPage: z.string().optional(),
});

export const datasetSchema = z.object({
  version: gameVersionSchema,
  stages: z.array(stageSchema),
  items: z.array(itemSchema),
  sets: z.array(armorSetSchema),
  recipes: z.array(recipeSchema),
  drops: z.array(dropSchema),
  builds: z.array(buildSchema),
  mechanics: z.array(mechanicSchema),
});