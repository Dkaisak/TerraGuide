import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { datasetSchema } from "@/lib/schemas";
import type { Dataset } from "@/types/data";

const DATA_DIR = path.join(process.cwd(), "data");

export function parseDataset(raw: unknown): Dataset {
  return datasetSchema.parse(raw) as Dataset;
}

function readJson(relative: string): unknown {
  return JSON.parse(readFileSync(path.join(DATA_DIR, relative), "utf8")) as unknown;
}

export function loadDataset(): Dataset {
  return parseDataset({
    version: readJson("version.json"),
    stages: readJson("stages.json"),
    items: readJson("items.json"),
    sets: readJson("sets.json"),
    recipes: readJson("recipes.json"),
    drops: readJson("drops.json"),
    builds: readJson("builds.json"),
  });
}

let cached: Dataset | undefined;

export function getDataset(): Dataset {
  if (!cached) {
    cached = loadDataset();
  }
  return cached;
}