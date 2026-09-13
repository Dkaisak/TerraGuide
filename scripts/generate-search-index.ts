import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { datasetSchema } from "../src/lib/schemas.js";
import type { ClassType, Dataset, GameStage, Subclass } from "../src/types/data.js";
import { CLASS_LABEL, SUB_CLASS_LABEL } from "../src/types/data.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = resolve(ROOT, "data");
const OUT = resolve(ROOT, "public", "search-index.json");
const DATASET_OUT = resolve(ROOT, "public", "dataset.json");

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

function load(): Dataset {
  const raw: Record<string, unknown> = {};
  for (const f of FILES) {
    const p = resolve(DATA_DIR, f);
    if (!existsSync(p)) throw new Error(`Falta el archivo de datos: ${f}`);
    raw[f.replace(/\.json$/, "")] = JSON.parse(readFileSync(p, "utf-8"));
  }
  return datasetSchema.parse(raw) as Dataset;
}

interface SearchItem {
  k: "item";
  id: string;
  name: string;
  type: string;
  classType: ClassType;
  subclass?: Subclass;
  classLabel: string;
  subclassLabel?: string;
  wiki: string;
  expertOnly: boolean;
  rare?: number;
}

interface SearchBuild {
  k: "build";
  id: string;
  title: string;
  classType: ClassType;
  stage: GameStage;
  classLabel: string;
  path: string;
}

function main() {
  const data = load();

  const dropsByItem = new Map<string, typeof data.drops>();
  for (const drop of data.drops) {
    const list = dropsByItem.get(drop.item);
    if (list) list.push(drop);
    else dropsByItem.set(drop.item, [drop]);
  }
  const UNAVAILABLE = new Set(["", "-", "—", "?"]);
  const expertOnlyIds = new Set<string>();
  for (const [id, list] of dropsByItem) {
    if (
      list.length > 0 &&
      list.every(
        (drop) =>
          drop.chance != null &&
          UNAVAILABLE.has(drop.chance.classic) &&
          !UNAVAILABLE.has(drop.chance.expert),
      )
    ) {
      expertOnlyIds.add(id);
    }
  }

  const items: SearchItem[] = data.items.map((item) => ({
    k: "item",
    id: item.id,
    name: item.name,
    type: item.type,
    classType: item.classType,
    subclass: item.subclass,
    classLabel: CLASS_LABEL[item.classType],
    subclassLabel: item.subclass ? SUB_CLASS_LABEL[item.subclass] : undefined,
    wiki: `https://terraria.wiki.gg/wiki/${encodeURIComponent(
      (item.wikiPage ?? item.name).replaceAll(" ", "_"),
    )}`,
    expertOnly: expertOnlyIds.has(item.id),
    rare: item.stats?.rare,
  }));

  const builds: SearchBuild[] = data.builds.map((build) => ({
    k: "build",
    id: build.id,
    title: build.title,
    classType: build.classType,
    stage: build.stage,
    classLabel: CLASS_LABEL[build.classType],
    path: `/${build.classType.toLowerCase()}/${build.stage
      .toLowerCase()
      .replaceAll("_", "-")}`,
  }));

  writeFileSync(OUT, JSON.stringify({ items, builds }));

  writeFileSync(
    DATASET_OUT,
    JSON.stringify({
      items: data.items,
      sets: data.sets,
      recipes: data.recipes,
      drops: data.drops,
    }),
  );

  console.log(
    `search-index.json generado: ${items.length} ítems, ${builds.length} builds`,
  );
}

main();