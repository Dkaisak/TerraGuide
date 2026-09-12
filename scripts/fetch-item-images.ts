import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ITEMS_PATH = resolve(ROOT, "data/items.json");
const OUT_DIR = resolve(ROOT, "public/items");
const MANIFEST_PATH = join(OUT_DIR, "manifest.json");

const WIKI_BASE = "https://terraria.wiki.gg";
const IMG_BASE = `${WIKI_BASE}/images`;
const API_URL = `${WIKI_BASE}/api.php`;

const HEADERS = { "User-Agent": "TerraGuide/0.1 (static build guide; personal/non-commercial use)" };
const TIMEOUT_MS = 20_000;
const RETRIES = 3;
const CONCURRENCY = 4;
const REQUEST_GAP_MS = 250;
const RELAY_MS = 400;
const API_BATCH = 50;

type Item = { id: string; name: string };

type OutcomeStatus = "ok" | "missing" | "error";
interface DownloadOutcome {
  id: string;
  status: OutcomeStatus;
  source: "direct" | "api";
}

const OVERRIDES: Record<string, string> = {
  beenades: "Beenade",
  "mana-cuffs": "Magic_Cuffs",
  "necro-shirt": "Necro_Breastplate",
  "necro-leggings": "Necro_Greaves",
  "forbidden-robe": "Forbidden_Robes",
  "hallowed-breastplate": "Hallowed_Plate_Mail",
  "chlorophyte-plate": "Chlorophyte_Plate_Mail",
  "chlorophyte-leggings": "Chlorophyte_Greaves",
  "stardust-breastplate": "Stardust_Plate",
  "jungle-spore": "Jungle_Spores",
  "lifeforce-potion": "Lifeforce_Potion",
  "eye-of-golem": "Eye_of_the_Golem",
  "obsidian-helmet": "Obsidian_Outlaw_Hat",
  "obsidian-shirt": "Obsidian_Longcoat",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchOrFail(url: string): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        headers: HEADERS,
        signal: controller.signal,
        redirect: "follow",
      });
      if (res.status === 429) {
        await sleep(6000 * (attempt + 1));
        continue;
      }
      return res;
    } catch (err) {
      lastErr = err;
      await sleep(1500 * (attempt + 1));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(`Request falló (${url})`);
}

async function download(url: string, dest: string): Promise<boolean> {
  const res = await fetchOrFail(url);
  if (!res.ok) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0) return false;
  writeFileSync(dest, buf);
  return true;
}

async function mapPool<T>(items: T[], size: number, fn: (item: T) => Promise<void>): Promise<void> {
  let next = 0;
  const workers = Array.from({ length: size }, async () => {
    while (next < items.length) {
      const item = items[next++];
      await fn(item);
      await sleep(REQUEST_GAP_MS);
    }
  });
  await Promise.all(workers);
}

function candidateName(id: string, name: string): string {
  return (OVERRIDES[id] ?? name).replace(/\s+/g, "_");
}

async function resolveViaApi(ids: string[], itemsByName: Map<string, Item>): Promise<DownloadOutcome[]> {
  const outcomes: DownloadOutcome[] = [];
  const done = new Set<string>();

  async function worker(titles: Array<{ id: string; url: string }>): Promise<void> {
    for (const job of titles) {
      if (done.has(job.id)) continue;
      let ok = false;
      let status: OutcomeStatus = "missing";
      try {
        const res = await fetchOrFail(job.url);
        if (res.ok) {
          const json = (await res.json()) as {
            query?: { pages?: Array<{ missing?: boolean; imageinfo?: Array<{ url?: string }> }> };
          };
          const fileUrl = (json.query?.pages ?? []).find(
            (p) => !p.missing && p.imageinfo?.[0]?.url,
          )?.imageinfo?.[0]?.url;
          if (fileUrl) {
            ok = await download(fileUrl, resolve(OUT_DIR, `${job.id}.png`));
            if (!ok) status = "error";
          }
        }
      } catch {
        status = "error";
      }
      if (!done.has(job.id)) {
        done.add(job.id);
        outcomes.push({ id: job.id, status: ok ? "ok" : status, source: "api" });
      }
      await sleep(RELAY_MS);
    }
  }

  const batches: Array<Array<{ id: string; url: string }>> = [];
  for (let i = 0; i < ids.length; i += API_BATCH) {
    batches.push(
      ids.slice(i, i + API_BATCH).map((id) => ({
        id,
        url: `${API_URL}?action=query&format=json&prop=imageinfo&iiprop=url&redirects=1&formatversion=2&titles=${encodeURIComponent(`File:${candidateName(id, itemsByName.get(id)!.name)}.png`)}`,
      })),
    );
  }
  await Promise.all(batches.map((batch) => worker(batch)));
  return outcomes;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const rawItems = JSON.parse(readFileSync(ITEMS_PATH, "utf-8")) as Item[];
  const itemsByName = new Map(rawItems.map((i) => [i.id, i]));

  const todo = rawItems.filter((item) => {
    const file = resolve(OUT_DIR, `${item.id}.png`);
    return !existsSync(file) || statSync(file).size === 0;
  });

  console.log(`Sprites desde ${WIKI_BASE}/images/ (${rawItems.length} ítems, ${todo.length} pendientes).\n`);

  const missing: string[] = [];
  const directOutcomes: DownloadOutcome[] = [];

  await mapPool(todo, CONCURRENCY, async (item) => {
    const url = `${IMG_BASE}/${encodeURIComponent(candidateName(item.id, item.name))}.png`;
    const ok = await download(url, resolve(OUT_DIR, `${item.id}.png`)).catch(() => false);
    directOutcomes.push({ id: item.id, status: ok ? "ok" : "missing", source: "direct" });
    if (!ok) missing.push(item.id);
  });

  const okDirect = directOutcomes.filter((o) => o.status === "ok").length;
  console.log(`Directo: ${okDirect}/${todo.length} OK; ${missing.length} a resolver vía API.`);

  const apiOutcomes = missing.length > 0 ? await resolveViaApi(missing, itemsByName) : [];

  const okIds = rawItems
    .filter((i) => existsSync(resolve(OUT_DIR, `${i.id}.png`)) && statSync(resolve(OUT_DIR, `${i.id}.png`)).size > 0)
    .map((i) => i.id)
    .sort();

  writeFileSync(MANIFEST_PATH, JSON.stringify(okIds, null, 0) + "\n");

  const unresolved = rawItems.map((i) => i.id).filter((id) => !okIds.includes(id));
  const statusById = new Map(directOutcomes.concat(apiOutcomes).map((o) => [o.id, o.status]));

  console.log(`\nResultado: ${okIds.length}/${rawItems.length} sprites (manifest → public/items/manifest.json).`);
  if (unresolved.length) {
    console.log(`\nSin sprite (${unresolved.length}):`);
    for (const id of unresolved) {
      console.log(`  - ${id} (${itemsByName.get(id)!.name}) [${statusById.get(id) ?? "sin intento"}]`);
    }
  }
}

main().catch((err) => {
  console.error("ERROR:", err);
  process.exit(1);
});