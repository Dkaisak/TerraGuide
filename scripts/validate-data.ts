import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { datasetSchema } from "../src/lib/schemas.js";
import type { Build, ClassType, Dataset, Subclass } from "../src/types/data.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = resolve(ROOT, "data");

const FILES = [
  "version.json",
  "stages.json",
  "items.json",
  "sets.json",
  "recipes.json",
  "drops.json",
  "builds.json",
  "mechanics.json",
] as const;

const VALID_CLASSES: ClassType[] = [
  "MELEE",
  "RANGED",
  "MAGIC",
  "SUMMONER",
];

const SUBCLASS_BY_CLASS: Record<Exclude<ClassType, "GENERAL">, Subclass[]> = {
  MELEE: ["SWORD", "YOYO", "FLAIL", "SPEAR", "BOOMERANG"],
  RANGED: ["BOW", "GUN", "LAUNCHER", "THROWN"],
  MAGIC: ["STAFF", "TOME", "MAGIC_GUN"],
  SUMMONER: ["MINION", "WHIP", "SENTRY"],
};

function load(): Dataset {
  const raw: Record<string, unknown> = {};
  for (const f of FILES) {
    const p = resolve(DATA_DIR, f);
    if (!existsSync(p)) throw new Error(`Falta el archivo de datos: ${f}`);
    raw[f.replace(/\.json$/, "")] = JSON.parse(readFileSync(p, "utf-8"));
  }
  return datasetSchema.parse(raw) as Dataset;
}

function main() {
  const errors: string[] = [];
  let data: Dataset;

  try {
    data = load();
  } catch (e) {
    console.error("ERROR de schema:", (e as Error).message);
    process.exit(1);
  }

  const itemIds = new Set(data.items.map((i) => i.id));
  const setNameOf = new Map(data.sets.map((s) => [s.id, s.name]));

  const duplicateIds = data.items.filter(
    (item, idx, arr) => arr.findIndex((i) => i.id === item.id) !== idx,
  );
  if (duplicateIds.length) {
    errors.push(`IDs de item duplicados: ${duplicateIds.map((i) => i.id).join(", ")}`);
  }

  for (const it of data.items) {
    if (it.type === "ACCESSORY" && !it.role) {
      errors.push(`Accesorio "${it.id}" sin role (OFENSIVO/DEFENSIVO/MOVILIDAD/UTILIDAD)`);
    }
    if (!it.subclass) continue;
    if (it.classType === "GENERAL") {
      errors.push(`Item "${it.id}": subclass "${it.subclass}" en un item GENERAL`);
    } else if (!SUBCLASS_BY_CLASS[it.classType].includes(it.subclass)) {
      errors.push(
        `Item "${it.id}": subclass "${it.subclass}" incompatible con clase "${it.classType}"`,
      );
    }
  }

  for (const s of data.sets) {
    for (const piece of [s.head, s.chest, s.legs]) {
      if (!piece) continue;
      if (!itemIds.has(piece)) {
        errors.push(`Set "${s.id}": la pieza "${piece}" no existe en items`);
      } else {
        const it = data.items.find((i) => i.id === piece)!;
        if (it.set !== s.id) {
          errors.push(`Set "${s.id}": la pieza "${piece}" no apunta a este set en items.set`);
        }
      }
    }
  }

  for (const r of data.recipes) {
    if (!itemIds.has(r.result)) {
      errors.push(`Receta: el resultado "${r.result}" no existe en items`);
    }
    for (const ing of r.ingredients) {
      if (!itemIds.has(ing.item)) {
        errors.push(`Receta de "${r.result}": el ingrediente "${ing.item}" no existe`);
      }
    }
  }

  for (const d of data.drops) {
    if (!itemIds.has(d.item)) {
      errors.push(`Drop: el item "${d.item}" no existe en items`);
    }
  }

  for (const b of data.builds) {
    if (!VALID_CLASSES.includes(b.classType)) {
      errors.push(`Build "${b.id}": clase inválida "${b.classType}"`);
    }
    const validSubclasses =
      b.classType === "GENERAL" ? [] : SUBCLASS_BY_CLASS[b.classType];
    if (b.subclass && b.classType !== "GENERAL" && !validSubclasses.includes(b.subclass)) {
      errors.push(
        `Build "${b.id}": subclass "${b.subclass}" incompatible con clase "${b.classType}"`,
      );
    }
    if (!data.stages.some((s) => s.id === b.stage)) {
      errors.push(`Build "${b.id}": fase desconocida "${b.stage}"`);
    }
    const checkSlots = (slots: Build["slots"], source: string) => {
      for (const slot of slots) {
        const isSetSlot = slot.slot === "SET_BONUS";
        const check = (id?: string) => {
          if (!id) return;
          const ok = isSetSlot ? setNameOf.has(id) : itemIds.has(id);
          if (!ok) {
            errors.push(
              `Build "${b.id}" (${source}) ${slot.slot}: "${id}" ${isSetSlot ? "(set)" : ""} no existe`,
            );
          }
        };
        check(slot.item);
        slot.alternatives?.forEach(check);
        if (!slot.item && !slot.alternatives?.length) {
          errors.push(`Build "${b.id}" (${source}) ${slot.slot}: sin item ni alternativas`);
        }
      }
    };
    checkSlots(b.slots, "base");
    for (const hint of b.orderHint) {
      if (!itemIds.has(hint) && !setNameOf.has(hint)) {
        errors.push(`Build "${b.id}" orderHint: "${hint}" no existe`);
      }
    }
    const subclasses = new Set<Subclass>();
    if (b.subclass) subclasses.add(b.subclass);
    for (const variant of b.subclassSlots ?? []) {
      if (!validSubclasses.includes(variant.subclass)) {
        errors.push(
          `Build "${b.id}": subclass de variante "${variant.subclass}" incompatible con clase "${b.classType}"`,
        );
      }
      if (subclasses.has(variant.subclass)) {
        errors.push(
          `Build "${b.id}": variante de subclass "${variant.subclass}" duplicada`,
        );
      }
      subclasses.add(variant.subclass);
      checkSlots(variant.slots, `variante ${variant.subclass}`);
      for (const hint of variant.orderHint ?? []) {
        if (!itemIds.has(hint) && !setNameOf.has(hint)) {
          errors.push(`Build "${b.id}" variante ${variant.subclass} orderHint: "${hint}" no existe`);
        }
      }
    }
  }

  const buildCombos = new Set<string>();
  for (const b of data.builds) {
    const key = `${b.classType}/${b.stage}`;
    if (buildCombos.has(key)) {
      errors.push(`Build duplicada para ${key}`);
    }
    buildCombos.add(key);
  }

  const expectedCombos = VALID_CLASSES.length * data.stages.length;
  if (data.builds.length < expectedCombos) {
    console.warn(
      `AVISO: ${data.builds.length} builds de ${expectedCombos} combinaciones posibles (clase x fase).`,
    );
  }

  const slotRefs = data.builds.flatMap((b: Build) => [
    ...b.slots.flatMap((s) => [s.item, ...(s.alternatives ?? [])].filter(Boolean) as string[]),
    ...(b.subclassSlots ?? []).flatMap((v) =>
      v.slots.flatMap((s) => [s.item, ...(s.alternatives ?? [])].filter(Boolean) as string[]),
    ),
  ]);

  if (errors.length) {
    console.error(`\nValidación FALLIDA. ${errors.length} problema(s):\n`);
    for (const e of [...new Set(errors)]) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log(
    [
      "\nDataset OK ✓",
      `  Versión del juego: ${data.version.gameVersion}`,
      `  Fases: ${data.stages.length}`,
      `  Ítems: ${data.items.length}`,
      `  Sets de armadura: ${data.sets.length}`,
      `  Recetas: ${data.recipes.length}`,
      `  Drops: ${data.drops.length}`,
      `  Builds: ${data.builds.length} (slots referenciados: ${slotRefs.length})`,
      `  Mecánicas: ${data.mechanics.length}`,
      "",
    ].join("\n"),
  );
}

main();