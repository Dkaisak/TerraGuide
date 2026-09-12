import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ITEMS_PATH = resolve(ROOT, "data/items.json");
const DROPS_PATH = resolve(ROOT, "data/drops.json");
const RECIPES_PATH = resolve(ROOT, "data/recipes.json");

const API_URL = "https://terraria.wiki.gg/api.php";
const HEADERS = { "User-Agent": "TerraGuide/0.1 (static build guide; personal/non-commercial use)" };
const BATCH = 30;
const GAP_MS = 350;

type Item = { id: string; name: string; type: string; classType: string; obtainDescription?: string; stats?: Record<string, unknown> };
type Chance = { classic: string; expert: string; master: string };
type DropEntry = { item: string; from: string; biomes: string[]; chance?: Chance; price?: string };
type Recipe = { result: string; qty: number; ingredients: Array<{ item: string; qty: number }>; station: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function stripWiki(s: string): string {
  return s
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1");
}

function stripHtml(s: string): string {
  return stripWiki(s)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function cleanRate(s: string): string {
  let t = stripHtml(s);
  t = t.replace(/\((?:Desktop|Console|Mobile|Old-gen|3DS)[^)]*\)/gi, " ").replace(/\s+/g, " ").trim();
  if (t.includes(" / ")) t = t.split(" / ")[0].trim();
  return t;
}

function parseRate(rateHtml: string, normal: string, expert: string, master: string): Partial<Chance> {
  const out: Partial<Chance> = {};
  if (/mode-content/.test(rateHtml)) {
    const normalM = rateHtml.match(/<span class="m-normal[^"]*">([^<]*)<\/span>/);
    const expertM = rateHtml.match(/<span class="m-expert-master">[\s\S]*?(?:<abbr[^>]*>([^<]*)<\/abbr>|>([^<]*)<\/span>)/);
    const classic = normalM ? cleanRate(normalM[1]) : undefined;
    const expertVal = expertM ? cleanRate(expertM[1] ?? expertM[2] ?? "") : undefined;
    if (normal === "1" && classic) out.classic = classic;
    if (expert === "1" && expertVal) out.expert = expertVal;
    if (master === "1" && expertVal) out.master = expertVal;
  } else {
    const val = cleanRate(rateHtml);
    if (normal === "1") out.classic = val;
    if (expert === "1") out.expert = val;
    if (master === "1") out.master = val;
  }
  return out;
}

// La wiki separa con <br/> las tasas por bioma/capa dentro del mismo campo `rate`.
function parseRateParts(rateHtml: string, normal: string, expert: string, master: string): Array<{ note: string; chance: Partial<Chance> }> {
  if (/mode-content/.test(rateHtml)) return [{ note: "", chance: parseRate(rateHtml, normal, expert, master) }];
  const parts = rateHtml.split(/<br\s*\/?>/i);
  const out: Array<{ note: string; chance: Partial<Chance> }> = [];
  for (const part of parts) {
    const noteM = part.match(/<span class="note-text[^"]*">([\s\S]*?)<\/span>/);
    const note = noteM ? stripHtml(noteM[1]).replace(/^\(+|\)+$/g, "").replace(/^"|"$/g, "").trim() : "";
    const withoutNote = noteM ? part.replace(noteM[0], "") : part;
    const val = cleanRate(withoutNote);
    if (!val) continue;
    const chance: Partial<Chance> = {};
    if (normal === "1") chance.classic = val;
    if (expert === "1") chance.expert = val;
    if (master === "1") chance.master = val;
    out.push({ note, chance });
  }
  return out.length > 0 ? out : [{ note: "", chance: parseRate(rateHtml, normal, expert, master) }];
}

function parseSource(pageName: string, nameHtml: string, isFromNpc: string): string {
  if (isFromNpc === "1") return stripHtml(pageName);
  const name = stripHtml(nameHtml);
  const bag = name.match(/^Treasure Bag \(([^)]+)\)/);
  if (bag) return bag[1];
  return name.replace(/\s*\((?:Desktop|Console|Mobile|Old-gen|3DS)[^)]*\)/gi, "").trim();
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['\u2019]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseNum(s?: string): number | undefined {
  if (!s) return undefined;
  const m = stripHtml(s).match(/-?\d+(?:\.\d+)?/);
  if (!m) return undefined;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : undefined;
}

function parseDamageType(s?: string): "MELEE" | "RANGED" | "MAGIC" | "SUMMON" | undefined {
  const t = stripHtml(s ?? "").toLowerCase();
  if (t.includes("melee")) return "MELEE";
  if (t.includes("ranged")) return "RANGED";
  if (t.includes("magic")) return "MAGIC";
  if (t.includes("summon")) return "SUMMON";
  return undefined;
}

function formatCoins(copper: number): string {
  const pp = Math.floor(copper / 1000000);
  const gp = Math.floor((copper % 1000000) / 10000);
  const sp = Math.floor((copper % 10000) / 100);
  const cp = copper % 100;
  const parts: string[] = [];
  if (pp) parts.push(`${pp} platino`);
  if (gp) parts.push(`${gp} oro`);
  if (sp) parts.push(`${sp} plata`);
  if (cp) parts.push(`${cp} cobre`);
  return parts.join(" ") || "0";
}

function parseCoin(html?: string): string | undefined {
  if (!html) return undefined;
  const m = html.match(/data-sort-value="(\d+)"/);
  if (!m) return undefined;
  const copper = Number(m[1]);
  return copper > 0 ? formatCoins(copper) : undefined;
}

async function cargo(tables: string, fields: string, where: string): Promise<Array<Record<string, string>>> {
  const params = new URLSearchParams({
    action: "cargoquery",
    tables,
    fields,
    where,
    limit: "500",
    format: "json",
    formatversion: "2",
  });
  const res = await fetch(`${API_URL}?${params.toString()}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as { cargoquery?: Array<{ title: Record<string, string> }> };
  return (json.cargoquery ?? []).map((r) => r.title);
}

const quote = (names: string[]) => names.map((t) => `"${t.replace(/"/g, '\\"')}"`).join(",");

async function main() {
  const items = JSON.parse(readFileSync(ITEMS_PATH, "utf-8")) as Item[];
  const byName = new Map(items.map((i) => [i.name, i]));
  const byId = new Map(items.map((i) => [i.id, i]));

  // ---------------- DROPS ----------------
  const existingDrops: DropEntry[] = existsSync(DROPS_PATH) ? JSON.parse(readFileSync(DROPS_PATH, "utf-8")) : [];
  const biomesByKey = new Map(existingDrops.map((d) => [`${d.item}|${d.from}`, d.biomes]));
  const groups = new Map<string, { item: string; from: string; note: string; chance: Partial<Chance> }>();

  const names = items.map((i) => i.name);
  for (let i = 0; i < names.length; i += BATCH) {
    const batch = names.slice(i, i + BATCH);
    let rows: Array<Record<string, string>> = [];
    try {
      rows = await cargo("Drops", "_pageName,name,item,quantity,rate,normal,expert,master,isfromnpc", `item IN (${quote(batch)})`);
    } catch (e) {
      console.error(`Drops batch ${i} falló:`, (e as Error).message);
    }
    for (const row of rows) {
      const item = byName.get(row.item);
      if (!item) continue;
      const from = parseSource(row._pageName, row.name, row.isfromnpc);
      for (const part of parseRateParts(row.rate ?? "", row.normal ?? "", row.expert ?? "", row.master ?? "")) {
        const key = `${item.id}|${from}|${part.note}`;
        const g = groups.get(key) ?? { item: item.id, from, note: part.note, chance: {} };
        for (const k of ["classic", "expert", "master"] as const) if (part.chance[k] && !g.chance[k]) g.chance[k] = part.chance[k];
        groups.set(key, g);
      }
    }
    process.stdout.write(`\rDrops: ${Math.min(i + BATCH, names.length)}/${names.length}`);
    await sleep(GAP_MS);
  }
  console.log("");

  const generatedDrops: DropEntry[] = [...groups.values()]
    .map((g) => {
      const c = g.chance;
      const classic = c.classic ?? "—";
      const expert = c.expert ?? c.classic ?? "—";
      const master = c.master ?? c.expert ?? c.classic ?? "—";
      return { item: g.item, from: g.from, biomes: g.note ? [g.note] : biomesByKey.get(`${g.item}|${g.from}`) ?? [], chance: { classic, expert, master } };
    })
    .sort((a, b) => a.item.localeCompare(b.item) || a.from.localeCompare(b.from));

  const generatedItems = new Set(generatedDrops.map((g) => g.item));
  const mergedDrops = [...existingDrops.filter((d) => !generatedItems.has(d.item)), ...generatedDrops].sort(
    (a, b) => a.item.localeCompare(b.item) || a.from.localeCompare(b.from),
  );
  writeFileSync(DROPS_PATH, JSON.stringify(mergedDrops, null, 2) + "\n");
  console.log(`Drops: ${existingDrops.length} → ${mergedDrops.length} (para ${generatedItems.size} items).`);

  // ---------------- RECIPES ----------------
  const existingRecipes: Recipe[] = existsSync(RECIPES_PATH) ? JSON.parse(readFileSync(RECIPES_PATH, "utf-8")) : [];
  const generatedRecipes: Recipe[] = [];
  const newMaterials = new Map<string, Item>();
  const resolvedResults = new Set<string>();

  for (let i = 0; i < names.length; i += BATCH) {
    const batch = names.slice(i, i + BATCH);
    let rows: Array<Record<string, string>> = [];
    try {
      rows = await cargo("Recipes", "result,amount,station,ings,legacy", `result IN (${quote(batch)}) AND legacy="0"`);
    } catch (e) {
      console.error(`Recipes batch ${i} falló:`, (e as Error).message);
    }
    for (const row of rows) {
      const result = byName.get(row.result);
      if (!result) continue;
      const ingredients: Array<{ item: string; qty: number }> = [];
      for (const tok of (row.ings ?? "").split("^")) {
        let t = tok.trim();
        if (!t) continue;
        if (t.startsWith("¦")) t = t.slice(1);
        const idx = t.lastIndexOf("¦");
        const name = (idx === -1 ? t : t.slice(0, idx)).trim();
        const qty = idx === -1 ? 1 : parseInt(t.slice(idx + 1).trim(), 10) || 1;
        if (!name) continue;
        let ing = byName.get(name);
        if (!ing) {
          const id = slug(name);
          ing = byId.get(id);
          if (!ing) {
            const mat: Item = { id, name, type: "MATERIAL", classType: "GENERAL", obtainDescription: "Material de crafteo." };
            newMaterials.set(id, mat);
            byId.set(id, mat);
            ing = mat;
          }
        }
        ingredients.push({ item: ing.id, qty });
      }
      if (ingredients.length === 0) continue;
      generatedRecipes.push({ result: result.id, qty: parseInt(row.amount ?? "1", 10) || 1, ingredients, station: stripHtml(row.station ?? "") });
      resolvedResults.add(result.id);
    }
    process.stdout.write(`\rRecetas: ${Math.min(i + BATCH, names.length)}/${names.length}`);
    await sleep(GAP_MS);
  }
  console.log("");

  const mergedRecipes = [...existingRecipes.filter((r) => !resolvedResults.has(r.result)), ...generatedRecipes].sort((a, b) =>
    a.result.localeCompare(b.result),
  );
  writeFileSync(RECIPES_PATH, JSON.stringify(mergedRecipes, null, 2) + "\n");

  if (newMaterials.size > 0) {
    const mergedItems = [...items, ...newMaterials.values()].sort((a, b) => a.id.localeCompare(b.id));
    writeFileSync(ITEMS_PATH, JSON.stringify(mergedItems, null, 2) + "\n");
  }
  console.log(`Recetas: ${existingRecipes.length} → ${mergedRecipes.length} (para ${resolvedResults.size} items); materiales nuevos: ${newMaterials.size}.`);

  // ---------------- STATS ----------------
  const finalItems = JSON.parse(readFileSync(ITEMS_PATH, "utf-8")) as Item[];
  const finalByName = new Map(finalItems.map((i) => [i.name, i]));
  const shopEntries: DropEntry[] = [];
  let statCount = 0;
  for (let i = 0; i < finalItems.length; i += BATCH) {
    const batch = finalItems.slice(i, i + BATCH).map((it) => it.name);
    let rows: Array<Record<string, string>> = [];
    try {
      rows = await cargo(
        "Items",
        "name,damage,damagetype,defense,critical,usetime,knockback,mana,velocity,rare,autoswing,tooltip,sell,buy,tag",
        `name IN (${quote(batch)})`,
      );
    } catch (e) {
      console.error(`Stats batch ${i} falló:`, (e as Error).message);
    }
    for (const row of rows) {
      const item = finalByName.get(row.name);
      if (!item) continue;
      // Vendedores (tiendas de NPC)
      const price = parseCoin(row.buy);
      for (const t of (row.tag ?? "").split("^")) {
        const tag = t.trim();
        if (tag.startsWith("vendor:")) {
          const vendor = tag.slice("vendor:".length).trim();
          if (vendor && !shopEntries.some((s) => s.item === item.id && s.from === vendor)) {
            shopEntries.push({ item: item.id, from: vendor, biomes: [], ...(price ? { price } : {}) });
          }
        }
      }
      const stats: Record<string, unknown> = {};
      const dmg = parseNum(row.damage);
      if (dmg !== undefined) stats.damage = dmg;
      const dt = parseDamageType(row.damagetype);
      if (dt) stats.damageType = dt;
      const def = parseNum(row.defense);
      if (def !== undefined) stats.defense = def;
      const crit = parseNum(row.critical);
      if (crit !== undefined) stats.critical = crit;
      const use = parseNum(row.usetime);
      if (use !== undefined) stats.useTime = use;
      const kb = parseNum(row.knockback);
      if (kb !== undefined) stats.knockback = kb;
      const mana = parseNum(row.mana);
      if (mana !== undefined) stats.mana = mana;
      const vel = parseNum(row.velocity);
      if (vel !== undefined) stats.velocity = vel;
      const rare = parseNum(row.rare);
      if (rare !== undefined) stats.rare = rare;
      if (row.autoswing === "1") stats.autoswing = true;
      const tip = stripHtml(row.tooltip ?? "");
      if (tip) stats.tooltip = tip;
      const sell = parseCoin(row.sell);
      if (sell) stats.sell = sell;
      if (Object.keys(stats).length > 0) {
        item.stats = stats;
        statCount++;
      }
    }
    process.stdout.write(`\rStats: ${Math.min(i + BATCH, finalItems.length)}/${finalItems.length}`);
    await sleep(GAP_MS);
  }
  console.log("");
  writeFileSync(ITEMS_PATH, JSON.stringify(finalItems, null, 2) + "\n");
  console.log(`Stats: ${statCount}/${finalItems.length} items con estadísticas.`);

  // Tiendas de NPC → drops.json (con precio, sin chance)
  if (shopEntries.length > 0) {
    const finalDrops = JSON.parse(readFileSync(DROPS_PATH, "utf-8")) as DropEntry[];
    const keys = new Set(finalDrops.map((d) => `${d.item}|${d.from}`));
    const toAdd = shopEntries.filter((s) => !keys.has(`${s.item}|${s.from}`));
    const merged = [...finalDrops, ...toAdd].sort((a, b) => a.item.localeCompare(b.item) || a.from.localeCompare(b.from));
    writeFileSync(DROPS_PATH, JSON.stringify(merged, null, 2) + "\n");
    console.log(`Tiendas: ${toAdd.length} fuentes añadidas (de ${shopEntries.length}).`);
  }
}

main().catch((err) => {
  console.error("ERROR:", err);
  process.exit(1);
});
