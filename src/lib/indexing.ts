import type {
  ArmorSet,
  Build,
  BuildSlot,
  ClassType,
  Dataset,
  Drop,
  GameStage,
  Item,
  Recipe,
  Stage,
} from "@/types/data";
import { CLASS_ORDER } from "@/types/data";

type IndexSource = Pick<
  Dataset,
  "items" | "sets" | "recipes" | "drops" | "stages" | "builds"
>;

export interface DataIndexes {
  items: Map<string, Item>;
  itemsByClass: Map<ClassType, Item[]>;
  sets: Map<string, ArmorSet>;
  setByPiece: Map<string, ArmorSet>;
  recipesByResult: Map<string, Recipe[]>;
  recipesByIngredient: Map<string, Recipe[]>;
  dropsByItem: Map<string, Drop[]>;
  buildsByClassStage: Map<string, Build>;
  buildsByClass: Map<ClassType, Build[]>;
  stages: Stage[];
  stagesById: Map<GameStage, Stage>;
  classBySlug: Map<string, ClassType>;
  stageBySlug: Map<string, GameStage>;
}

export function buildIndexes(dataset: IndexSource): DataIndexes {
  const push = <K, V>(map: Map<K, V[]>, key: K, value: V) => {
    const list = map.get(key);
    if (list) {
      list.push(value);
    } else {
      map.set(key, [value]);
    }
  };

  const items = new Map<string, Item>();
  const itemsByClass = new Map<ClassType, Item[]>();
  for (const item of dataset.items) {
    items.set(item.id, item);
    if (item.classType !== "GENERAL") {
      push(itemsByClass, item.classType, item);
    }
  }

  const sets = new Map<string, ArmorSet>();
  const setByPiece = new Map<string, ArmorSet>();
  for (const set of dataset.sets) {
    sets.set(set.id, set);
    if (set.head) setByPiece.set(set.head, set);
    if (set.chest) setByPiece.set(set.chest, set);
    if (set.legs) setByPiece.set(set.legs, set);
  }

  const recipesByResult = new Map<string, Recipe[]>();
  const recipesByIngredient = new Map<string, Recipe[]>();
  for (const recipe of dataset.recipes) {
    push(recipesByResult, recipe.result, recipe);
    for (const ing of recipe.ingredients) {
      push(recipesByIngredient, ing.item, recipe);
    }
  }

  const dropsByItem = new Map<string, Drop[]>();
  for (const drop of dataset.drops) {
    push(dropsByItem, drop.item, drop);
  }

  const stages = [...dataset.stages];
  stages.sort((a, b) => a.order - b.order);
  const stagesById = new Map<GameStage, Stage>();
  for (const stage of stages) stagesById.set(stage.id, stage);

  const buildsByClassStage = new Map<string, Build>();
  const buildsByClass = new Map<ClassType, Build[]>();
  for (const build of dataset.builds) {
    buildsByClassStage.set(`${build.classType}::${build.stage}`, build);
    push(buildsByClass, build.classType, build);
  }

  const classBySlug = new Map<string, ClassType>();
  const stageBySlug = new Map<string, GameStage>();
  for (const classType of CLASS_ORDER) classBySlug.set(classSlug(classType), classType);
  for (const stage of stages) stageBySlug.set(stageSlug(stage.id), stage.id);

  return {
    items,
    itemsByClass,
    sets,
    setByPiece,
    recipesByResult,
    recipesByIngredient,
    dropsByItem,
    buildsByClassStage,
    buildsByClass,
    stages,
    stagesById,
    classBySlug,
    stageBySlug,
  };
}

export const classSlug = (classType: ClassType): string => classType.toLowerCase();

export const stageSlug = (stage: GameStage): string => stage.toLowerCase().replaceAll("_", "-");

export function getBuild(
  indexes: DataIndexes,
  classType: ClassType,
  stage: GameStage,
): Build | undefined {
  return indexes.buildsByClassStage.get(`${classType}::${stage}`);
}

export function mergeSlots(base: BuildSlot[], slots?: BuildSlot[]): BuildSlot[] {
  if (!slots || slots.length === 0) return base;
  const overrideByType = new Map(slots.map((slot) => [slot.slot, slot]));
  const overridden = new Set(overrideByType.keys());
  return [
    ...base.filter((slot) => !overridden.has(slot.slot)),
    ...slots,
  ];
}

export function getItem(indexes: DataIndexes, id: string): Item | undefined {
  return indexes.items.get(id);
}

export function getSet(indexes: DataIndexes, id: string): ArmorSet | undefined {
  return indexes.sets.get(id);
}

export type SlotRef =
  | { kind: "item"; item: Item }
  | { kind: "set"; set: ArmorSet }
  | { kind: "missing"; id: string };

export function resolveRef(indexes: DataIndexes, id?: string): SlotRef | undefined {
  if (!id) return undefined;
  const item = indexes.items.get(id);
  if (item) return { kind: "item", item };
  const set = indexes.sets.get(id);
  if (set) return { kind: "set", set };
  return { kind: "missing", id };
}

export function refName(indexes: DataIndexes, id?: string): string {
  const ref = resolveRef(indexes, id);
  if (!ref) return "—";
  if (ref.kind === "item") return ref.item.name;
  if (ref.kind === "set") return ref.set.name;
  return ref.id;
}

export function wikiUrl(item: Item): string {
  const page = item.wikiPage ?? item.name;
  return `https://terraria.wiki.gg/wiki/${encodeURIComponent(page.replaceAll(" ", "_"))}`;
}

const UNAVAILABLE = new Set(["", "-", "—", "?"]);

export function isExpertOrMasterOnly(indexes: DataIndexes, itemId: string): boolean {
  const drops = indexes.dropsByItem.get(itemId);
  if (!drops || drops.length === 0) return false;
  return drops.every(
    (drop) =>
      drop.chance != null &&
      UNAVAILABLE.has(drop.chance.classic) &&
      !UNAVAILABLE.has(drop.chance.expert),
  );
}

export interface MaterialEntry {
  itemId: string;
  qty: number;
}

/**
 * Agrega recursivamente los materiales base (sin receta) de una lista de items.
 * Para items con receta usa la primera receta disponible y reparte cantidades.
 */
export function computeMaterials(
  itemIds: string[],
  indexes: DataIndexes,
  maxDepth = 10,
): MaterialEntry[] {
  const totals = new Map<string, number>();
  const visit = (id: string, qty: number, depth: number) => {
    if (depth > maxDepth) return;
    const recipes = indexes.recipesByResult.get(id);
    if (recipes && recipes.length > 0) {
      const recipe = recipes[0];
      const produced = recipe.qty > 0 ? recipe.qty : 1;
      const batches = qty / produced;
      for (const ing of recipe.ingredients) visit(ing.item, ing.qty * batches, depth + 1);
    } else if (depth > 0 && indexes.items.has(id)) {
      // Solo ingredientes: los ítems de nivel 0 (slots) sin receta no son materiales.
      totals.set(id, (totals.get(id) ?? 0) + qty);
    }
  };
  for (const id of itemIds) visit(id, 1, 0);
  return [...totals.entries()]
    .map(([itemId, qty]) => ({ itemId, qty: Math.max(1, Math.ceil(qty)) }))
    .sort((a, b) => b.qty - a.qty || a.itemId.localeCompare(b.itemId));
}