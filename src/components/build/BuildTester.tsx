"use client";

import { useEffect, useMemo, useState } from "react";
import { rarityColor } from "@/components/build/rarityTone";
import { Badge } from "@/components/ui/Badge";
import { ItemSprite } from "@/components/ui/ItemSprite";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { usePersistedState } from "@/hooks/usePersistedState";
import { buildIndexes } from "@/lib/indexing";
import type { DataIndexes } from "@/lib/indexing";
import { ACCESSORY_MODIFIERS, ACCESSORY_MODIFIER_BY_ID } from "@/lib/modifiers";
import { bestWeaponReforge, recommendAccessoryReforge } from "@/lib/reforge";
import { BUILDER_SAVES_STORAGE_KEY } from "@/lib/storage";
import { WEAPON_MODIFIER_BY_ID, weaponModifiersFor } from "@/lib/weaponModifiers";
import type { Build, ClassType, Item, ItemModifiers, SlimDataset } from "@/types/data";
import { CLASS_LABEL, CLASS_ORDER } from "@/types/data";

type ArmorSlot = "HELMET" | "CHEST" | "LEGS";

const ARMOR_SLOTS: ArmorSlot[] = ["HELMET", "CHEST", "LEGS"];
const ARMOR_LABEL: Record<ArmorSlot, string> = {
  HELMET: "Casco",
  CHEST: "Pecho",
  LEGS: "Piernas",
};

const ACCESSORY_COUNT = 7;
const emptyAccessories = () => Array<string>(ACCESSORY_COUNT).fill("");
const noReforges = () => Array<string>(ACCESSORY_COUNT).fill("none");

interface TesterState {
  classType: ClassType;
  weapon: string;
  weaponReforge: string;
  armor: Record<ArmorSlot, string>;
  accessories: string[];
  reforges: string[];
}

interface SavedBuild {
  name: string;
  data: string;
}

function serializeState(s: TesterState): string {
  const p = new URLSearchParams();
  p.set("c", s.classType);
  if (s.weapon) p.set("w", s.weapon);
  if (s.weaponReforge !== "none") p.set("wr", s.weaponReforge);
  if (s.armor.HELMET) p.set("h", s.armor.HELMET);
  if (s.armor.CHEST) p.set("ch", s.armor.CHEST);
  if (s.armor.LEGS) p.set("l", s.armor.LEGS);
  const accs = s.accessories.join(",");
  if (accs.replace(/,/g, "")) p.set("a", accs);
  const refs = s.reforges.map((r) => (r === "none" ? "" : r)).join(",");
  if (refs.replace(/,/g, "")) p.set("r", refs);
  return p.toString();
}

function parseState(search: string): Partial<TesterState> | undefined {
  const p = new URLSearchParams(search);
  if ([...p.keys()].length === 0) return undefined;
  const out: Partial<TesterState> = {};
  const c = p.get("c");
  if (c && (CLASS_ORDER as string[]).includes(c)) out.classType = c as ClassType;
  out.weapon = p.get("w") ?? "";
  out.weaponReforge = p.get("wr") ?? "none";
  out.armor = {
    HELMET: p.get("h") ?? "",
    CHEST: p.get("ch") ?? "",
    LEGS: p.get("l") ?? "",
  };
  const accs = (p.get("a") ?? "").split(",");
  out.accessories = Array.from({ length: ACCESSORY_COUNT }, (_, i) => accs[i] ?? "");
  const refs = (p.get("r") ?? "").split(",");
  out.reforges = Array.from({ length: ACCESSORY_COUNT }, (_, i) => refs[i] || "none");
  return out;
}

export interface TesterStats {
  totalDefense: number;
  effDamage: number;
  dmgBonus: number;
  effCrit: number;
  critBonus: number;
  effUseTime: number;
  hitsPerSec: number;
  dps: number;
  effMana?: number;
  manaMax: number;
  damageReduction: number;
  ammoSave: number;
}

export function computeStats(state: TesterState, indexes: DataIndexes): TesterStats {
  const ids = [
    state.weapon,
    state.armor.HELMET,
    state.armor.CHEST,
    state.armor.LEGS,
    ...state.accessories,
  ].filter(Boolean);
  const selected = ids
    .map((id) => indexes.items.get(id))
    .filter((x): x is Item => x != null);

  const helmetSet = state.armor.HELMET ? indexes.setByPiece.get(state.armor.HELMET) : undefined;
  const chestSet = state.armor.CHEST ? indexes.setByPiece.get(state.armor.CHEST) : undefined;
  const legsSet = state.armor.LEGS ? indexes.setByPiece.get(state.armor.LEGS) : undefined;
  const fullSet =
    helmetSet && chestSet?.id === helmetSet.id && legsSet?.id === helmetSet.id
      ? helmetSet
      : undefined;

  const mods: Record<string, number> = {};
  const addMods = (m?: ItemModifiers) => {
    if (!m) return;
    for (const [k, v] of Object.entries(m)) mods[k] = (mods[k] ?? 0) + (v as number);
  };
  for (const it of selected) addMods(it.modifiers);
  for (const r of state.reforges) addMods(ACCESSORY_MODIFIER_BY_ID.get(r)?.mods);
  if (fullSet) addMods(fullSet.modifiers);

  const itemDefense = selected.reduce(
    (sum, it) => sum + (it.stats?.defense ?? it.modifiers?.defense ?? 0),
    0,
  );
  const reforgeSetDefense =
    state.reforges.reduce(
      (sum, r) => sum + (ACCESSORY_MODIFIER_BY_ID.get(r)?.mods.defense ?? 0),
      0,
    ) + (fullSet?.modifiers?.defense ?? 0);

  const weaponItem = state.weapon ? indexes.items.get(state.weapon) : undefined;
  const ws = weaponItem?.stats;
  const classKey = weaponItem ? CLASS_KEY[weaponItem.classType] : undefined;
  const wm = WEAPON_MODIFIER_BY_ID.get(state.weaponReforge) ?? WEAPON_MODIFIER_BY_ID.get("none")!;

  const dmg = ws?.damage ?? 0;
  const crit = ws?.critical ?? 0;
  const useTime = ws?.useTime ?? 0;
  const dmgBonus =
    (mods.damageAll ?? 0) + (classKey ? (mods[`damage${classKey}`] ?? 0) : 0) + wm.damage;
  const critBonus =
    (mods.critAll ?? 0) + (classKey ? (mods[`crit${classKey}`] ?? 0) : 0) + wm.crit;
  const speedBonus =
    (weaponItem?.classType === "MELEE" ? (mods.meleeSpeed ?? 0) : 0) + wm.speed;
  const effDamage = dmg * (1 + dmgBonus / 100);
  const effCrit = crit + critBonus;
  const effUseTime = useTime > 0 ? useTime / (1 + speedBonus / 100) : 0;
  const hitsPerSec = effUseTime > 0 ? 60 / effUseTime : 0;
  const dps = effDamage * hitsPerSec * (1 + effCrit / 100);
  const effMana =
    ws?.mana !== undefined
      ? ws.mana * (1 + wm.manaCost / 100) * (1 - (mods.manaCost ?? 0) / 100)
      : undefined;

  return {
    totalDefense: itemDefense + reforgeSetDefense,
    effDamage,
    dmgBonus,
    effCrit,
    critBonus,
    effUseTime,
    hitsPerSec,
    dps,
    effMana,
    manaMax: mods.manaMax ?? 0,
    damageReduction: mods.damageReduction ?? 0,
    ammoSave: mods.ammoSave ?? 0,
  };
}

function buildStateFromBuild(build: Build, indexes: DataIndexes): TesterState {
  const w =
    build.slots.find(
      (s) => s.slot === "WEAPON" || s.slot === "MINION" || s.slot === "WHIP",
    )?.item ?? "";
  const pick = (slot: ArmorSlot) => build.slots.find((s) => s.slot === slot)?.item ?? "";
  const accSlots = build.slots
    .filter((s) => s.slot === "ACCESSORY")
    .slice(0, ACCESSORY_COUNT);
  return {
    classType: build.classType,
    weapon: w,
    weaponReforge: w
      ? bestWeaponReforge(indexes.items.get(w)?.classType ?? build.classType)
      : "none",
    armor: { HELMET: pick("HELMET"), CHEST: pick("CHEST"), LEGS: pick("LEGS") },
    accessories: [...accSlots.map((s) => s.item ?? ""), ...emptyAccessories()].slice(
      0,
      ACCESSORY_COUNT,
    ),
    reforges: [...accSlots.map((s) => s.reforge ?? "none"), ...noReforges()].slice(
      0,
      ACCESSORY_COUNT,
    ),
  };
}

function toFullState(p?: Partial<TesterState>): TesterState | undefined {
  if (!p) return undefined;
  return {
    classType: p.classType ?? "MELEE",
    weapon: p.weapon ?? "",
    weaponReforge: p.weaponReforge ?? "none",
    armor: p.armor ?? { HELMET: "", CHEST: "", LEGS: "" },
    accessories: p.accessories ?? emptyAccessories(),
    reforges: p.reforges ?? noReforges(),
  };
}

function LoadoutEditor({
  state,
  onChange,
  weaponOptions,
  armorOptions,
  accessoryOptions,
  allWeapons,
  onToggleAllWeapons,
  indexes,
}: {
  state: TesterState;
  onChange: (patch: Partial<TesterState>) => void;
  weaponOptions: Item[];
  armorOptions: Map<ArmorSlot, Item[]>;
  accessoryOptions: Item[];
  allWeapons: boolean;
  onToggleAllWeapons?: (value: boolean) => void;
  indexes: DataIndexes;
}) {
  const weaponItem = state.weapon ? indexes.items.get(state.weapon) : undefined;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="flex flex-col gap-1">
        <span className="flex items-center justify-between text-[11px] text-zinc-500">
          <span>Arma</span>
          {onToggleAllWeapons ? (
            <label className="flex cursor-pointer items-center gap-1 text-[10px] text-zinc-500">
              <input
                type="checkbox"
                checked={allWeapons}
                onChange={(e) => onToggleAllWeapons(e.target.checked)}
                className="accent-[var(--color-accent)]"
              />
              Todas las clases (mixto)
            </label>
          ) : null}
        </span>
        <SearchSelect
          value={state.weapon}
          onChange={(id) => onChange({ weapon: id })}
          ariaLabel="Arma"
          placeholder="— Sin arma —"
          options={[
            { id: "", label: "— Sin arma —" },
            ...weaponOptions.map((i) => ({
              id: i.id,
              label: i.name,
              itemId: i.id,
              group: allWeapons ? CLASS_LABEL[i.classType] : undefined,
            })),
          ]}
        />
        <SearchSelect
          value={state.weaponReforge}
          onChange={(id) => onChange({ weaponReforge: id })}
          disabled={!state.weapon}
          ariaLabel="Modificador del arma"
          options={weaponModifiersFor(weaponItem?.classType ?? state.classType).map((m) => ({
            id: m.id,
            label: m.id === "none" ? m.name : `${m.name} · ${weaponModEffect(m)}`,
          }))}
        />
      </div>
      {ARMOR_SLOTS.map((slot) => (
        <div key={slot} className="flex flex-col gap-1">
          <span className="text-[11px] text-zinc-500">{ARMOR_LABEL[slot]}</span>
          <SearchSelect
            value={state.armor[slot]}
            onChange={(id) => onChange({ armor: { ...state.armor, [slot]: id } })}
            ariaLabel={ARMOR_LABEL[slot]}
            options={[
              { id: "", label: "— Ninguno —" },
              ...(armorOptions.get(slot) ?? []).map((i) => ({
                id: i.id,
                label: i.name,
                itemId: i.id,
              })),
            ]}
          />
        </div>
      ))}
      {state.accessories.map((acc, idx) => (
        <div key={idx} className="flex flex-col gap-1">
          <span className="text-[11px] text-zinc-500">Accesorio {idx + 1}</span>
          <SearchSelect
            value={acc}
            onChange={(id) =>
              onChange({ accessories: state.accessories.map((v, i) => (i === idx ? id : v)) })
            }
            ariaLabel={`Accesorio ${idx + 1}`}
            options={[
              { id: "", label: "— Ninguno —" },
              ...accessoryOptions.map((i) => ({
                id: i.id,
                label: i.name,
                itemId: i.id,
              })),
            ]}
          />
          <SearchSelect
            value={state.reforges[idx] ?? "none"}
            onChange={(id) =>
              onChange({ reforges: state.reforges.map((v, i) => (i === idx ? id : v)) })
            }
            disabled={!acc}
            ariaLabel={`Modificador del accesorio ${idx + 1}`}
            options={ACCESSORY_MODIFIERS.map((m) => ({
              id: m.id,
              label: m.id === "none" ? m.name : `${m.name} · ${m.effect}`,
            }))}
          />
        </div>
      ))}
    </div>
  );
}

const CLASS_KEY: Record<string, string> = {
  MELEE: "Melee",
  RANGED: "Ranged",
  MAGIC: "Magic",
  SUMMONER: "Summon",
};

const MOD_LABEL: Record<string, string> = {
  damageAll: "daño",
  damageMelee: "daño melee",
  damageRanged: "daño ranged",
  damageMagic: "daño mágico",
  damageSummon: "daño summon",
  critAll: "crítico",
  critMelee: "crítico melee",
  critRanged: "crítico ranged",
  critMagic: "crítico mágico",
  critSummon: "crítico summon",
  defense: "defensa",
  meleeSpeed: "vel. melee",
  moveSpeed: "vel. mov.",
  manaMax: "maná",
  manaCost: "-coste maná",
  lifeRegen: "vida/s",
  damageReduction: "red. daño",
  ammoSave: "ahorro munición",
};

function byName(a: Item, b: Item) {
  return a.name.localeCompare(b.name);
}

function weaponModEffect(m: {
  damage: number;
  crit: number;
  speed: number;
  manaCost: number;
}): string {
  const parts: string[] = [];
  if (m.damage) parts.push(`${m.damage > 0 ? "+" : ""}${m.damage}% daño`);
  if (m.crit) parts.push(`${m.crit > 0 ? "+" : ""}${m.crit}% crít`);
  if (m.speed) parts.push(`${m.speed > 0 ? "+" : ""}${m.speed}% vel`);
  if (m.manaCost) parts.push(`${m.manaCost > 0 ? "+" : ""}${m.manaCost}% maná`);
  return parts.join(", ");
}

function Mannequin() {
  return (
    <svg viewBox="0 0 16 24" className="h-full w-full" aria-hidden>
      <g fill="#7d8698" stroke="#39415a" strokeWidth="0.35">
        <rect x="6" y="2" width="4" height="4" />
        <rect x="6" y="6" width="4" height="7" />
        <rect x="4" y="6" width="2" height="6" />
        <rect x="10" y="6" width="2" height="6" />
        <rect x="6" y="13" width="2" height="7" />
        <rect x="8" y="13" width="2" height="7" />
      </g>
      <g fill="#9aa3b5">
        <rect x="6" y="2" width="4" height="1" />
        <rect x="6" y="6" width="4" height="1" />
        <rect x="6" y="13" width="4" height="1" />
      </g>
    </svg>
  );
}

function GuideSprite() {
  const [failed, setFailed] = useState(false);
  if (failed) return <Mannequin />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/guide.png"
      alt=""
      draggable={false}
      onError={() => setFailed(true)}
      className="h-full w-full object-contain [image-rendering:pixelated]"
    />
  );
}

function Slot({
  label,
  itemId,
  name,
  size = "md",
}: {
  label: string;
  itemId: string;
  name?: string;
  size?: "md" | "lg";
}) {
  const dims = size === "lg" ? "h-14 w-14" : "h-12 w-12";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`tg-slot flex ${dims} items-center justify-center rounded-md`}>
        {itemId ? (
          <ItemSprite itemId={itemId} fallback={name?.charAt(0) ?? "?"} size="md" />
        ) : (
          <span className="text-[10px] text-zinc-600">—</span>
        )}
      </div>
      <span className="text-[9px] uppercase tracking-wide text-zinc-600">{label}</span>
    </div>
  );
}

export function BuildTester({
  dataset,
  builds,
}: {
  dataset: SlimDataset;
  builds: Build[];
}) {
  const indexes = useMemo(
    () => buildIndexes({ ...dataset, stages: [], builds: [] }),
    [dataset],
  );

  const armorSlot = useMemo(() => {
    const map = new Map<string, ArmorSlot>();
    for (const set of dataset.sets) {
      if (set.head) map.set(set.head, "HELMET");
      if (set.chest) map.set(set.chest, "CHEST");
      if (set.legs) map.set(set.legs, "LEGS");
    }
    return map;
  }, [dataset.sets]);

  const [classType, setClassType] = useState<ClassType>("MELEE");
  const [weapon, setWeapon] = useState("");
  const [weaponReforge, setWeaponReforge] = useState("none");
  const [allWeapons, setAllWeapons] = useState(false);
  const [armor, setArmor] = useState<Record<ArmorSlot, string>>({
    HELMET: "",
    CHEST: "",
    LEGS: "",
  });
  const [accessories, setAccessories] = useState<string[]>(emptyAccessories);
  const [reforges, setReforges] = useState<string[]>(noReforges);
  const [loadId, setLoadId] = useState("");
  const [saves, setSaves] = usePersistedState<SavedBuild[]>(BUILDER_SAVES_STORAGE_KEY, []);
  const [saveName, setSaveName] = useState("");
  const [copied, setCopied] = useState(false);
  const [compareId, setCompareId] = useState("");
  const [customB, setCustomB] = useState<TesterState>({
    classType: "MELEE",
    weapon: "",
    weaponReforge: "none",
    armor: { HELMET: "", CHEST: "", LEGS: "" },
    accessories: emptyAccessories(),
    reforges: noReforges(),
  });

  const weaponOptions = useMemo(() => {
    const all = [...dataset.items.filter((i) => i.type === "WEAPON")].sort((a, b) => {
      if (allWeapons && a.classType !== b.classType) {
        return CLASS_ORDER.indexOf(a.classType) - CLASS_ORDER.indexOf(b.classType);
      }
      return a.name.localeCompare(b.name);
    });
    return allWeapons ? all : all.filter((i) => i.classType === classType);
  }, [dataset.items, classType, allWeapons]);
  const allWeaponOptions = useMemo(
    () =>
      dataset.items
        .filter((i) => i.type === "WEAPON")
        .sort((a, b) =>
          a.classType === b.classType
            ? a.name.localeCompare(b.name)
            : CLASS_ORDER.indexOf(a.classType) - CLASS_ORDER.indexOf(b.classType),
        ),
    [dataset.items],
  );
  const armorOptions = useMemo(() => {
    const map = new Map<ArmorSlot, Item[]>();
    for (const slot of ARMOR_SLOTS) map.set(slot, []);
    for (const item of dataset.items) {
      if (item.type !== "ARMOR") continue;
      const slot = armorSlot.get(item.id);
      if (slot) map.get(slot)!.push(item);
    }
    for (const list of map.values()) list.sort(byName);
    return map;
  }, [dataset.items, armorSlot]);
  const accessoryOptions = useMemo(
    () => dataset.items.filter((i) => i.type === "ACCESSORY").sort(byName),
    [dataset.items],
  );

  const classBuilds = useMemo(
    () => builds.filter((b) => b.classType === classType),
    [builds, classType],
  );

  const selected = useMemo(
    () =>
      [weapon, armor.HELMET, armor.CHEST, armor.LEGS, ...accessories]
        .filter(Boolean)
        .map((id) => indexes.items.get(id))
        .filter((x): x is Item => x != null),
    [weapon, armor, accessories, indexes],
  );

  const weaponItem = weapon ? indexes.items.get(weapon) : undefined;
  const ws = weaponItem?.stats;

  const fullSet = useMemo(() => {
    const helmetSet = armor.HELMET ? indexes.setByPiece.get(armor.HELMET) : undefined;
    if (!helmetSet) return undefined;
    const chestSet = armor.CHEST ? indexes.setByPiece.get(armor.CHEST) : undefined;
    const legsSet = armor.LEGS ? indexes.setByPiece.get(armor.LEGS) : undefined;
    if (chestSet?.id === helmetSet.id && legsSet?.id === helmetSet.id) return helmetSet;
    return undefined;
  }, [armor, indexes]);

  const stateA: TesterState = { classType, weapon, weaponReforge, armor, accessories, reforges };
  const statsA = computeStats(stateA, indexes);

  const stateB = useMemo(() => {
    if (!compareId) return undefined;
    if (compareId === "custom") return customB;
    if (compareId.startsWith("build:")) {
      const b = builds.find((x) => x.id === compareId.slice(6));
      return b ? buildStateFromBuild(b, indexes) : undefined;
    }
    if (compareId.startsWith("save:")) {
      const s = saves.find((x) => x.name === compareId.slice(5));
      return toFullState(parseState(s?.data ?? ""));
    }
    return undefined;
  }, [compareId, builds, saves, indexes, customB]);
  const statsB = stateB ? computeStats(stateB, indexes) : undefined;

  const compareRows = statsB
    ? [
        { label: "Defensa", a: statsA.totalDefense, b: statsB.totalDefense, higher: true, fmt: (v: number) => String(v) },
        { label: "Daño efectivo", a: statsA.effDamage, b: statsB.effDamage, higher: true, fmt: (v: number) => v.toFixed(1) },
        { label: "Crítico", a: statsA.effCrit, b: statsB.effCrit, higher: true, fmt: (v: number) => `${v}%` },
        { label: "Uso", a: statsA.effUseTime, b: statsB.effUseTime, higher: false, fmt: (v: number) => v.toFixed(1) },
        { label: "DPS", a: statsA.dps, b: statsB.dps, higher: true, fmt: (v: number) => Math.round(v).toLocaleString("es") },
      ]
    : [];

  const name = (id: string) => (id ? indexes.items.get(id)?.name : undefined);

  function loadBuild(id: string) {
    setLoadId(id);
    const b = builds.find((x) => x.id === id);
    if (!b) return;
    const w = b.slots.find(
      (s) => s.slot === "WEAPON" || s.slot === "MINION" || s.slot === "WHIP",
    )?.item;
    setWeapon(w ?? "");
    setWeaponReforge(
      w ? bestWeaponReforge(indexes.items.get(w)?.classType ?? classType) : "none",
    );
    const pick = (slot: ArmorSlot) => b.slots.find((s) => s.slot === slot)?.item ?? "";
    setArmor({ HELMET: pick("HELMET"), CHEST: pick("CHEST"), LEGS: pick("LEGS") });
    const accSlots = b.slots
      .filter((s) => s.slot === "ACCESSORY")
      .slice(0, ACCESSORY_COUNT);
    const accs = accSlots.map((s) => s.item ?? "");
    setAccessories([...accs, ...emptyAccessories()].slice(0, ACCESSORY_COUNT));
    const accReforges = accSlots.map((s) => {
      if (s.reforge) return s.reforge;
      const it = s.item ? indexes.items.get(s.item) : undefined;
      return it ? recommendAccessoryReforge(it, classType) : "none";
    });
    setReforges([...accReforges, ...noReforges()].slice(0, ACCESSORY_COUNT));
  }

  function applyOptimalReforges() {
    if (weaponItem) setWeaponReforge(bestWeaponReforge(weaponItem.classType));
    setReforges(
      accessories.map((id) => {
        const it = id ? indexes.items.get(id) : undefined;
        return it ? recommendAccessoryReforge(it, classType) : "none";
      }),
    );
  }

  function reset() {
    setWeapon("");
    setWeaponReforge("none");
    setArmor({ HELMET: "", CHEST: "", LEGS: "" });
    setAccessories(emptyAccessories());
    setReforges(noReforges());
    setLoadId("");
  }

  function getState(): TesterState {
    return { classType, weapon, weaponReforge, armor, accessories, reforges };
  }

  function applyState(s: Partial<TesterState>) {
    if (s.classType) setClassType(s.classType);
    if (s.weapon !== undefined) setWeapon(s.weapon);
    if (s.weaponReforge !== undefined) setWeaponReforge(s.weaponReforge);
    if (s.armor) setArmor(s.armor);
    if (s.accessories) setAccessories(s.accessories);
    if (s.reforges) setReforges(s.reforges);
  }

  useEffect(() => {
    const parsed = parseState(window.location.search);
    if (!parsed) return;
    queueMicrotask(() => applyState(parsed));
  }, []);

  function share() {
    const qs = serializeState(getState());
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
    navigator.clipboard
      ?.writeText(`${window.location.origin}${window.location.pathname}?${qs}`)
      .catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function save() {
    const name = saveName.trim() || `Build ${saves.length + 1}`;
    const data = serializeState(getState());
    setSaves((prev) => [{ name, data }, ...prev.filter((s) => s.name !== name)]);
    setSaveName("");
  }

  const stats: { label: string; value: string; tone?: "accent" | "accent2" }[] = [
    { label: "Defensa total", value: String(statsA.totalDefense) },
    { label: "Daño efectivo", value: ws ? statsA.effDamage.toFixed(1) : "—" },
    { label: "Bonus de daño", value: statsA.dmgBonus ? `+${statsA.dmgBonus}%` : "—" },
    { label: "Crítico", value: ws ? `${statsA.effCrit}%` : "—" },
    { label: "Bonus de crítico", value: statsA.critBonus ? `+${statsA.critBonus}%` : "—" },
    { label: "Uso", value: statsA.effUseTime ? statsA.effUseTime.toFixed(1) : "—" },
    { label: "Golpes/s", value: statsA.hitsPerSec ? statsA.hitsPerSec.toFixed(2) : "—" },
    {
      label: "DPS estimado",
      value: statsA.dps ? Math.round(statsA.dps).toLocaleString("es") : "—",
      tone: "accent",
    },
    { label: "Maná máx.", value: statsA.manaMax ? `+${statsA.manaMax}` : "—" },
    {
      label: "Coste de maná",
      value: statsA.effMana !== undefined ? statsA.effMana.toFixed(1) : "—",
    },
    {
      label: "Reducción daño",
      value: statsA.damageReduction ? `${statsA.damageReduction}%` : "—",
    },
    { label: "Ahorro munición", value: statsA.ammoSave ? `${statsA.ammoSave}%` : "—" },
  ];

  const selectClass =
    "w-full rounded-md border border-edge bg-background px-2 py-1.5 text-sm text-foreground outline-none transition-colors focus:border-accent";

  return (
    <div className="flex flex-col gap-6">
      <header className="border-b border-edge pb-5">
        <h1 className="tg-title text-2xl font-bold">Build Tester</h1>
        <p className="mt-1 max-w-3xl text-sm text-zinc-400">
          Viste a tu personaje con armas, armaduras y accesorios y compara las
          estadísticas en vivo. El DPS es una estimación con los bonus
          porcentuales de accesorios/armadura (daño × golpes/s, crítico como
          doble daño); no incluye efectos especiales ni set bonuses no
          numéricos.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {CLASS_ORDER.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setClassType(c);
              reset();
            }}
            className={`tg-btn rounded-full px-3 py-1 text-xs font-semibold ${
              classType === c ? "border-accent text-accent" : ""
            }`}
          >
            {CLASS_LABEL[c]}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-edge" />
        <select
          value={loadId}
          onChange={(e) => loadBuild(e.target.value)}
          className={`${selectClass} w-auto`}
        >
          <option value="">Cargar una build…</option>
          {classBuilds.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title}
            </option>
          ))}
        </select>
        <select
          value={compareId}
          onChange={(e) => setCompareId(e.target.value)}
          className={`${selectClass} w-auto`}
        >
          <option value="">Comparar con…</option>
          <option value="custom">Personalizada (editar abajo)</option>
          <optgroup label="Builds curadas">
            {builds.map((b) => (
              <option key={b.id} value={`build:${b.id}`}>
                {b.title}
              </option>
            ))}
          </optgroup>
          {saves.length > 0 ? (
            <optgroup label="Guardadas">
              {saves.map((s) => (
                <option key={s.name} value={`save:${s.name}`}>
                  {s.name}
                </option>
              ))}
            </optgroup>
          ) : null}
        </select>
        <button
          type="button"
          onClick={applyOptimalReforges}
          className="tg-btn rounded-full px-3 py-1 text-xs"
          title="Aplica el mejor modificador a cada accesorio (según su rol) y al arma (según su clase)"
        >
          Reforjar óptimo
        </button>
        <button type="button" onClick={reset} className="tg-btn rounded-full px-3 py-1 text-xs">
          Limpiar
        </button>
        <button type="button" onClick={share} className="tg-btn rounded-full px-3 py-1 text-xs">
          {copied ? "¡Copiado!" : "Compartir"}
        </button>
        <span className="flex items-center gap-1">
          <input
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
            }}
            placeholder="Nombre…"
            className="w-28 rounded-full border border-edge bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-accent"
          />
          <button type="button" onClick={save} className="tg-btn rounded-full px-3 py-1 text-xs">
            Guardar
          </button>
        </span>
      </div>

      {saves.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-zinc-500">Guardadas:</span>
          {saves.map((s) => (
            <span
              key={s.name}
              className="flex items-center gap-1.5 rounded-full border border-edge bg-surface px-2 py-0.5 text-xs"
            >
              <button
                type="button"
                onClick={() => applyState(parseState(s.data) ?? {})}
                className="font-medium transition-colors hover:text-accent"
                title="Cargar esta build"
              >
                {s.name}
              </button>
              <button
                type="button"
                onClick={() => setSaves((prev) => prev.filter((x) => x.name !== s.name))}
                className="text-zinc-600 transition-colors hover:text-red-400"
                title="Eliminar"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-5">
          <section className="tg-surface rounded-lg p-4">
            <div className="flex items-start justify-center gap-4 sm:gap-8">
              <div className="flex flex-col items-center pt-16">
                <Slot label="Arma" itemId={weapon} name={name(weapon)} size="lg" />
              </div>

              <div className="relative h-[300px] w-[150px]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <GuideSprite />
                </div>
                <div className="absolute left-1/2 top-0 -translate-x-1/2">
                  <Slot label="Casco" itemId={armor.HELMET} name={name(armor.HELMET)} />
                </div>
                <div className="absolute left-1/2 top-[100px] -translate-x-1/2">
                  <Slot label="Pecho" itemId={armor.CHEST} name={name(armor.CHEST)} />
                </div>
                <div className="absolute left-1/2 top-[200px] -translate-x-1/2">
                  <Slot label="Piernas" itemId={armor.LEGS} name={name(armor.LEGS)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1 pt-2">
                {accessories.map((a, i) => (
                  <Slot key={i} label={`Acc ${i + 1}`} itemId={a} name={name(a)} />
                ))}
              </div>
            </div>

            {fullSet ? (
              <p className="mt-4 text-center text-xs text-zinc-400">
                <span className="font-semibold text-accent">Set {fullSet.name}:</span>{" "}
                {fullSet.bonus}
              </p>
            ) : null}
          </section>

          <section className="tg-surface rounded-lg p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Elegir ítems
            </h2>
            <LoadoutEditor
              state={stateA}
              onChange={applyState}
              weaponOptions={weaponOptions}
              armorOptions={armorOptions}
              accessoryOptions={accessoryOptions}
              allWeapons={allWeapons}
              onToggleAllWeapons={setAllWeapons}
              indexes={indexes}
            />
          </section>

          {compareId === "custom" ? (
            <section className="tg-surface rounded-lg p-4">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Build B (personalizada)
              </h2>
              <LoadoutEditor
                state={customB}
                onChange={(patch) => setCustomB((prev) => ({ ...prev, ...patch }))}
                weaponOptions={allWeaponOptions}
                armorOptions={armorOptions}
                accessoryOptions={accessoryOptions}
                allWeapons
                indexes={indexes}
              />
            </section>
          ) : null}
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
          <section className="tg-surface rounded-lg p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Estadísticas
            </h2>
            <dl className="flex flex-col gap-1.5">
              {stats.map((s) => (
                <div key={s.label} className="flex items-baseline justify-between gap-2 text-sm">
                  <dt className="text-zinc-500">{s.label}</dt>
                  <dd
                    className={`font-mono font-semibold ${
                      s.tone === "accent" ? "text-accent" : "text-foreground"
                    }`}
                  >
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {stateB && statsB ? (
            <section className="tg-surface rounded-lg p-4">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Comparación
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wide text-zinc-600">
                    <th className="text-left font-medium">Stat</th>
                    <th className="text-right font-medium">Actual</th>
                    <th className="text-right font-medium">B</th>
                  </tr>
                </thead>
                <tbody>
                  {compareRows.map((row) => {
                    const aBetter = row.higher ? row.a >= row.b : row.a <= row.b;
                    const bBetter = row.higher ? row.b >= row.a : row.b <= row.a;
                    return (
                      <tr key={row.label} className="border-t border-edge/60">
                        <td className="py-1 text-zinc-500">{row.label}</td>
                        <td
                          className={`py-1 text-right font-mono ${
                            aBetter ? "font-semibold text-accent" : "text-foreground"
                          }`}
                        >
                          {row.fmt(row.a)}
                        </td>
                        <td
                          className={`py-1 text-right font-mono ${
                            bBetter ? "font-semibold text-accent" : "text-foreground"
                          }`}
                        >
                          {row.fmt(row.b)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          ) : null}

          {selected.length > 0 ? (
            <section className="tg-surface rounded-lg p-4">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Equipado ({selected.length})
              </h2>
              <ul className="flex flex-col gap-2">
                {selected.map((it) => {
                  const color =
                    it.stats?.rare !== undefined ? rarityColor(it.stats.rare) : undefined;
                  return (
                    <li key={it.id} className="flex items-start gap-2">
                      <ItemSprite itemId={it.id} fallback={it.name.charAt(0)} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="truncate text-xs font-semibold"
                            style={color ? { color } : undefined}
                          >
                            {it.name}
                          </span>
                          {it.stats?.defense !== undefined ? (
                            <Badge tone="neutral">{it.stats.defense} def</Badge>
                          ) : null}
                          {it.modifiers
                            ? Object.entries(it.modifiers).map(([k, v]) => (
                                <Badge key={k} tone="accent">
                                  {k === "manaCost" ? "-" : "+"}
                                  {v} {MOD_LABEL[k] ?? k}
                                </Badge>
                              ))
                            : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
