import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ITEMS_PATH = resolve(ROOT, "data/items.json");

type Modifiers = Record<string, number>;
type Item = { id: string; name: string; stats?: { tooltip?: string }; modifiers?: Modifiers };

const CLASS: Record<string, string> = {
  melee: "Melee",
  ranged: "Ranged",
  magic: "Magic",
  summon: "Summon",
  minion: "Summon",
};

export function parseModifiers(tooltip?: string): Modifiers | undefined {
  if (!tooltip) return undefined;
  let t = ` ${tooltip} `;
  const mods: Modifiers = {};
  const add = (key: string, value: number) => {
    mods[key] = (mods[key] ?? 0) + value;
  };

  // Combinados: "X% increased <clase> damage and critical strike chance"
  t = t.replace(
    /(\d+)% increased (melee|ranged|magic|summon|minion) damage and critical strike chance/gi,
    (_, n, c) => {
      add(`damage${CLASS[c.toLowerCase()]}`, Number(n));
      add(`crit${CLASS[c.toLowerCase()]}`, Number(n));
      return " ";
    },
  );
  t = t.replace(/(\d+)% increased damage and critical strike chance/gi, (_, n) => {
    add("damageAll", Number(n));
    add("critAll", Number(n));
    return " ";
  });
  t = t.replace(/Increases arrow damage by (\d+)%/gi, (_, n) => {
    add("damageRanged", Number(n));
    return " ";
  });
  t = t.replace(/(\d+)% increased (melee|ranged|magic|summon|minion) damage/gi, (_, n, c) => {
    add(`damage${CLASS[c.toLowerCase()]}`, Number(n));
    return " ";
  });
  t = t.replace(/(\d+)% increased damage/gi, (_, n) => {
    add("damageAll", Number(n));
    return " ";
  });
  t = t.replace(
    /(\d+)% increased (melee|ranged|magic|summon|minion) critical strike chance/gi,
    (_, n, c) => {
      add(`crit${CLASS[c.toLowerCase()]}`, Number(n));
      return " ";
    },
  );
  t = t.replace(/(\d+)% increased critical strike chance/gi, (_, n) => {
    add("critAll", Number(n));
    return " ";
  });
  t = t.replace(/(\d+)% increased melee speed/gi, (_, n) => {
    add("meleeSpeed", Number(n));
    return " ";
  });
  t = t.replace(/(\d+)% increased movement speed/gi, (_, n) => {
    add("moveSpeed", Number(n));
    return " ";
  });
  t = t.replace(/\+(\d+) defense/gi, (_, n) => {
    add("defense", Number(n));
    return " ";
  });
  t = t.replace(/Increases maximum mana by (\d+)/gi, (_, n) => {
    add("manaMax", Number(n));
    return " ";
  });
  t = t.replace(/Reduces mana (?:usage|cost) by (\d+)%/gi, (_, n) => {
    add("manaCost", Number(n));
    return " ";
  });
  t = t.replace(/(\d+)% reduced mana (?:usage|cost)/gi, (_, n) => {
    add("manaCost", Number(n));
    return " ";
  });
  t = t.replace(/(\d+)% chance to not consume (?:ammo|arrows)/gi, (_, n) => {
    add("ammoSave", Number(n));
    return " ";
  });
  t = t.replace(/Reduces damage taken by (\d+)%/gi, (_, n) => {
    add("damageReduction", Number(n));
    return " ";
  });
  void t;

  return Object.keys(mods).length > 0 ? mods : undefined;
}

function main() {
  const items = JSON.parse(readFileSync(ITEMS_PATH, "utf-8")) as Item[];
  let count = 0;
  for (const item of items) {
    const mods = parseModifiers(item.stats?.tooltip);
    if (mods) {
      item.modifiers = mods;
      count++;
    } else {
      delete item.modifiers;
    }
  }
  writeFileSync(ITEMS_PATH, JSON.stringify(items, null, 2) + "\n");
  console.log(`Modificadores extraídos: ${count}/${items.length} items.`);
}

// Ejecuta solo si se llama directamente (permite importar parseModifiers).
if (process.argv[1] && process.argv[1].endsWith("parse-modifiers.ts")) {
  main();
}
