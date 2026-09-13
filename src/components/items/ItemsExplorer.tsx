"use client";

import { useMemo, useState } from "react";
import { ItemModal } from "@/components/build/ItemModal";
import { rarityColor } from "@/components/build/rarityTone";
import { subclassTone } from "@/components/build/subclassTone";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { Badge } from "@/components/ui/Badge";
import { ItemSprite } from "@/components/ui/ItemSprite";
import { buildIndexes } from "@/lib/indexing";
import type {
  AccessoryRole,
  ClassType,
  Item,
  ItemType,
  SlimDataset,
} from "@/types/data";
import { CLASS_ORDER } from "@/types/data";

const PAGE = 60;

const ITEM_TYPES: ItemType[] = [
  "WEAPON",
  "ARMOR",
  "ACCESSORY",
  "AMMO",
  "BUFF",
  "MATERIAL",
];

const CLASS_FILTERS: ClassType[] = [...CLASS_ORDER, "GENERAL"];

const ROLES: AccessoryRole[] = ["OFENSIVO", "DEFENSIVO", "MOVILIDAD", "UTILIDAD"];

const selectClass =
  "rounded-md border border-edge bg-background px-2 py-1.5 text-sm text-foreground outline-none transition-colors focus:border-accent";

export function ItemsExplorer({ dataset }: { dataset: SlimDataset }) {
  const { t, classLabel, subclassLabel, itemTypeLabel, roleLabel } = useLocale();
  const indexes = useMemo(
    () => buildIndexes({ ...dataset, stages: [], builds: [] }),
    [dataset],
  );

  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState<ClassType | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<ItemType | "ALL">("ALL");
  const [roleFilter, setRoleFilter] = useState<AccessoryRole | "ALL">("ALL");
  const [rarityFilter, setRarityFilter] = useState<string>("ALL");
  const [sort, setSort] = useState<"name" | "rarity">("name");
  const [visible, setVisible] = useState(PAGE);
  const [modalId, setModalId] = useState<string | null>(null);

  const rarities = useMemo(() => {
    const set = new Set<number>();
    for (const item of dataset.items) {
      if (item.stats?.rare !== undefined) set.add(item.stats.rare);
    }
    return [...set].sort((a, b) => b - a);
  }, [dataset.items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = dataset.items.filter((item) => {
      if (q && !item.name.toLowerCase().includes(q) && !item.id.includes(q)) {
        return false;
      }
      if (classFilter !== "ALL" && item.classType !== classFilter) return false;
      if (typeFilter !== "ALL" && item.type !== typeFilter) return false;
      if (roleFilter !== "ALL" && item.role !== roleFilter) return false;
      if (rarityFilter !== "ALL" && String(item.stats?.rare) !== rarityFilter) {
        return false;
      }
      return true;
    });
    out.sort((a, b) => {
      if (sort === "rarity") {
        const ra = a.stats?.rare ?? -99;
        const rb = b.stats?.rare ?? -99;
        if (ra !== rb) return rb - ra;
      }
      return a.name.localeCompare(b.name);
    });
    return out;
  }, [dataset.items, query, classFilter, typeFilter, roleFilter, rarityFilter, sort]);

  const shown = filtered.slice(0, visible);
  const hasFilters =
    query !== "" ||
    classFilter !== "ALL" ||
    typeFilter !== "ALL" ||
    roleFilter !== "ALL" ||
    rarityFilter !== "ALL";

  const reset = () => {
    setQuery("");
    setClassFilter("ALL");
    setTypeFilter("ALL");
    setRoleFilter("ALL");
    setRarityFilter("ALL");
    setSort("name");
    setVisible(PAGE);
  };

  return (
    <div className="flex flex-col gap-4">
      <header className="border-b border-edge pb-3">
        <h1 className="tg-title text-2xl font-bold">{t("items.title")}</h1>
        <p className="mt-1 max-w-3xl text-sm text-zinc-400">
          {t("items.intro", { n: dataset.items.length })}
        </p>
      </header>

      <div className="tg-surface flex flex-wrap items-center gap-2 rounded-lg p-2">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisible(PAGE);
          }}
          placeholder={t("items.search")}
          className={`${selectClass} min-w-[200px] flex-1`}
        />
        <select
          value={classFilter}
          onChange={(e) => {
            setClassFilter(e.target.value as ClassType | "ALL");
            setVisible(PAGE);
          }}
          className={selectClass}
          aria-label={t("items.allClasses")}
        >
          <option value="ALL">{t("items.allClasses")}</option>
          {CLASS_FILTERS.map((c) => (
            <option key={c} value={c}>
              {classLabel(c)}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value as ItemType | "ALL");
            setVisible(PAGE);
          }}
          className={selectClass}
          aria-label={t("items.allTypes")}
        >
          <option value="ALL">{t("items.allTypes")}</option>
          {ITEM_TYPES.map((ty) => (
            <option key={ty} value={ty}>
              {itemTypeLabel(ty)}
            </option>
          ))}
        </select>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value as AccessoryRole | "ALL");
            setVisible(PAGE);
          }}
          className={selectClass}
          aria-label={t("items.allRoles")}
        >
          <option value="ALL">{t("items.allRoles")}</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {roleLabel(r)}
            </option>
          ))}
        </select>
        <select
          value={rarityFilter}
          onChange={(e) => {
            setRarityFilter(e.target.value);
            setVisible(PAGE);
          }}
          className={selectClass}
          aria-label={t("items.allRarities")}
        >
          <option value="ALL">{t("items.allRarities")}</option>
          {rarities.map((r) => (
            <option key={r} value={String(r)}>
              {t("items.rarityN", { n: r })}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "name" | "rarity")}
          className={selectClass}
          aria-label={t("items.sortName")}
        >
          <option value="name">{t("items.sortName")}</option>
          <option value="rarity">{t("items.sortRarity")}</option>
        </select>
        {hasFilters ? (
          <button
            type="button"
            onClick={reset}
            className="tg-btn rounded-md px-2.5 py-1.5 text-sm"
          >
            {t("common.clear")}
          </button>
        ) : null}
      </div>

      <p className="text-xs text-zinc-500">{t("items.results", { n: filtered.length })}</p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {shown.map((item) => (
          <ItemTile
            key={item.id}
            item={item}
            onOpen={() => setModalId(item.id)}
            classLabel={classLabel}
            subclassLabel={subclassLabel}
            itemTypeLabel={itemTypeLabel}
            viewTitle={t("common.view", { name: item.name })}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">{t("items.empty")}</p>
      ) : null}

      {visible < filtered.length ? (
        <button
          type="button"
          onClick={() => setVisible((v) => v + PAGE)}
          className="tg-btn mx-auto rounded-lg px-4 py-2 text-sm"
        >
          {t("items.showMore", { n: filtered.length - visible })}
        </button>
      ) : null}

      {modalId ? (
        <ItemModal
          key={modalId}
          targetId={modalId}
          indexes={indexes}
          onOpenItem={(id) => setModalId(id)}
          onClose={() => setModalId(null)}
        />
      ) : null}
    </div>
  );
}

function ItemTile({
  item,
  onOpen,
  classLabel,
  subclassLabel,
  itemTypeLabel,
  viewTitle,
}: {
  item: Item;
  onOpen: () => void;
  classLabel: (c: ClassType) => string;
  subclassLabel: (s: NonNullable<Item["subclass"]>) => string;
  itemTypeLabel: (t: ItemType) => string;
  viewTitle: string;
}) {
  const color =
    item.stats?.rare !== undefined ? rarityColor(item.stats.rare) : undefined;
  return (
    <button
      type="button"
      onClick={onOpen}
      title={viewTitle}
      className="tg-surface flex items-center gap-2 rounded-lg p-2 text-left transition-colors hover:border-accent"
    >
      <ItemSprite itemId={item.id} fallback={item.name.charAt(0).toUpperCase()} />
      <span className="min-w-0 flex-1">
        <span
          className="block truncate text-sm font-semibold leading-tight"
          style={color ? { color } : undefined}
        >
          {item.name}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-1">
          <Badge tone="neutral">{itemTypeLabel(item.type)}</Badge>
          {item.subclass ? (
            <Badge className={subclassTone(item.subclass)}>
              {subclassLabel(item.subclass)}
            </Badge>
          ) : item.classType !== "GENERAL" ? (
            <Badge tone="neutral">{classLabel(item.classType)}</Badge>
          ) : null}
        </span>
      </span>
    </button>
  );
}
