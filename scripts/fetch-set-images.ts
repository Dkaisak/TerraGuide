import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SETS_PATH = resolve(ROOT, "data/sets.json");
const OUT_DIR = resolve(ROOT, "public/sets");
const MANIFEST_PATH = join(OUT_DIR, "manifest.json");

const WIKI_BASE = "https://terraria.wiki.gg";
const API_URL = `${WIKI_BASE}/api.php`;

const HEADERS = { "User-Agent": "TerraGuide/0.1 (static build guide; personal/non-commercial use)" };
const TIMEOUT_MS = 20_000;
const RETRIES = 3;
const CONCURRENCY = 4;
const REQUEST_GAP_MS = 250;

type SetEntry = { id: string; name: string };

// Sets cuyo nombre de archivo en la wiki no sigue el patrón "<Nombre> armor.png"
const OVERRIDES: Record<string, string> = {
  "flinx-armor": "Flinx Fur Coat",
  "wizard-set": "Wizard set",
  "spectre-mask-armor": "Spectre armor",
  "adamantite-magic": "Adamantite armor",
  "hallowed-magic": "Hallowed armor",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchOrFail(url: string): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, { headers: HEADERS, signal: controller.signal, redirect: "follow" });
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

function wikiFile(set: SetEntry): string {
  if (OVERRIDES[set.id]) return OVERRIDES[set.id];
  return set.name.replace(/\s+Armor$/, " armor");
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const sets = JSON.parse(readFileSync(SETS_PATH, "utf-8")) as SetEntry[];

  const ok: string[] = [];
  const failed: string[] = [];

  let next = 0;
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (next < sets.length) {
      const set = sets[next++];
      const dest = resolve(OUT_DIR, `${set.id}.png`);
      if (existsSync(dest) && statSync(dest).size > 0) {
        ok.push(set.id);
        continue;
      }
      const file = wikiFile(set);
      const url = `${API_URL}?action=query&format=json&formatversion=2&prop=imageinfo&iiprop=url&titles=${encodeURIComponent(`File:${file}.png`)}`;
      try {
        const res = await fetchOrFail(url);
        const json = (await res.json()) as { query?: { pages?: Array<{ missing?: boolean; imageinfo?: Array<{ url?: string }> }> } };
        const fileUrl = (json.query?.pages ?? []).find((p) => !p.missing && p.imageinfo?.[0]?.url)?.imageinfo?.[0]?.url;
        if (fileUrl && (await download(fileUrl, dest))) ok.push(set.id);
        else failed.push(`${set.id} (${file})`);
      } catch {
        failed.push(`${set.id} (${file})`);
      }
      await sleep(REQUEST_GAP_MS);
    }
  });
  await Promise.all(workers);

  const okIds = sets.filter((s) => ok.includes(s.id)).map((s) => s.id).sort();
  writeFileSync(MANIFEST_PATH, JSON.stringify(okIds, null, 0) + "\n");

  console.log(`Set images: ${okIds.length}/${sets.length} → public/sets/`);
  if (failed.length) {
    console.log(`\nSin imagen (${failed.length}):`);
    for (const f of failed) console.log(`  - ${f}`);
  }
}

main().catch((err) => {
  console.error("ERROR:", err);
  process.exit(1);
});
