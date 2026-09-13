"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MiniSearch from "minisearch";
import { subclassTone } from "@/components/build/subclassTone";
import { rarityColor } from "@/components/build/rarityTone";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useItemDetail } from "@/components/items/ItemDetailProvider";
import { Badge } from "@/components/ui/Badge";
import { ItemSprite } from "@/components/ui/ItemSprite";
import { usePersistedState } from "@/hooks/usePersistedState";
import { DIFFICULTY_STORAGE_KEY } from "@/lib/storage";
import type { ClassType, Difficulty, GameStage, ItemType, Subclass } from "@/types/data";
import { CLASS_ORDER } from "@/types/data";

interface ItemEntry {
  k: "item";
  id: string;
  name: string;
  type: string;
  classType: ClassType;
  subclass?: Subclass;
  classLabel: string;
  subclassLabel?: string;
  wiki: string;
  expertOnly?: boolean;
  rare?: number;
}

interface BuildEntry {
  k: "build";
  id: string;
  title: string;
  classType: ClassType;
  stage: GameStage;
  classLabel: string;
  path: string;
}

type Entry = ItemEntry | BuildEntry;

function docId(entry: Entry): string {
  return `${entry.k}:${entry.id}`;
}

const RESULT_LIMIT = 10;

const ITEM_TYPES = ["WEAPON", "ARMOR", "ACCESSORY", "AMMO", "BUFF", "MATERIAL"] as const;

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors ${
        active
          ? "border-accent bg-accent/15 text-accent"
          : "border-edge text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {children}
    </button>
  );
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { t, itemTypeLabel, classLabel } = useLocale();
  const { openItem } = useItemDetail();
  const [activeIndex, setActiveIndex] = useState(0);
  const [entries, setEntries] = useState<Entry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [difficulty] = usePersistedState<Difficulty>(DIFFICULTY_STORAGE_KEY, "CLASSIC");
  const [classFilter, setClassFilter] = useState<ClassType | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [hideExpertOverride, setHideExpertOverride] = useState<boolean | null>(null);
  const hideExpert = hideExpertOverride ?? difficulty === "CLASSIC";

  const mini = useMemo(
    () =>
      new MiniSearch<Entry>({
        idField: "_id",
        fields: ["name", "title", "classLabel", "subclassLabel", "type"],
        storeFields: [
          "k",
          "name",
          "title",
          "type",
          "classType",
          "subclass",
          "classLabel",
          "subclassLabel",
          "stage",
          "path",
          "wiki",
          "expertOnly",
          "rare",
        ] as const,
        searchOptions: { prefix: true, fuzzy: 0.2, boost: { name: 2, title: 2 } },
      }),
    [],
  );

  useEffect(() => {
    fetch("/search-index.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("index no disponible"))))
      .then((data: { items: ItemEntry[]; builds: BuildEntry[] }) => {
        const all: Entry[] = [...data.items, ...data.builds];
        if (mini.documentCount === 0) {
          mini.addAll(all.map((e) => ({ ...e, _id: docId(e) })));
        }
        setEntries(all);
      })
      .catch(() => {
        /* el índice aún no existe (p.ej. npm run dev sin predev) */
      });
  }, [mini]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) {
          setOpen(false);
        } else {
          setQuery("");
          setActiveIndex(0);
          setOpen(true);
        }
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const byId = useMemo(
    () => new Map(entries.map((e) => [docId(e), e] as const)),
    [entries],
  );

  const filtered = useMemo(
    () =>
      entries.filter((e) => {
        if (classFilter !== "ALL" && e.classType !== classFilter) return false;
        if (e.k === "item") {
          if (typeFilter !== "ALL" && e.type !== typeFilter) return false;
          if (hideExpert && e.expertOnly) return false;
        } else if (typeFilter !== "ALL") {
          return false;
        }
        return true;
      }),
    [entries, classFilter, typeFilter, hideExpert],
  );

  const filteredIds = useMemo(() => new Set(filtered.map(docId)), [filtered]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return filtered.slice(0, RESULT_LIMIT);
    const hits = mini.search(q, { prefix: true, fuzzy: 0.2 });
    return hits
      .map((hit) => byId.get(hit.id))
      .filter((d): d is Entry => d != null && filteredIds.has(docId(d)))
      .slice(0, RESULT_LIMIT);
  }, [query, filtered, filteredIds, mini, byId]);

  const applyClassFilter = (c: ClassType | "ALL") => {
    setClassFilter(c);
    setActiveIndex(0);
  };
  const applyTypeFilter = (t: string) => {
    setTypeFilter(t);
    setActiveIndex(0);
  };
  const toggleHideExpert = () => {
    setHideExpertOverride(!hideExpert);
    setActiveIndex(0);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setQuery("");
          setActiveIndex(0);
          setOpen(true);
        }}
        title={t("search.open")}
        className="tg-btn fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-zinc-400 shadow-lg"
      >
        <span className="text-sm leading-none">⌕</span>
        <span className="hidden sm:inline">
          <kbd className="font-mono text-[10px] text-zinc-500">Ctrl</kbd>{" "}
          <kbd className="font-mono text-[10px] text-zinc-500">K</kbd>
        </span>
      </button>
    );
  }

  const select = (entry: Entry) => {
    if (entry.k === "item") {
      openItem(entry.id);
    } else {
      window.location.href = entry.path;
    }
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      select(results[activeIndex]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 backdrop-blur-sm sm:pt-24"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Búsqueda"
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-xl flex-col overflow-hidden rounded-xl border border-edge-2 bg-surface shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-edge px-4 py-3">
          <span className="text-sm text-zinc-500">⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={t("search.placeholder")}
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-zinc-600"
          />
          <kbd className="font-mono text-[10px] text-zinc-600">{t("search.close")}</kbd>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 border-b border-edge px-4 py-2">
          <FilterChip active={classFilter === "ALL"} onClick={() => applyClassFilter("ALL")}>
            {t("search.allClasses")}
          </FilterChip>
          {CLASS_ORDER.map((c) => (
            <FilterChip key={c} active={classFilter === c} onClick={() => applyClassFilter(c)}>
              {classLabel(c)}
            </FilterChip>
          ))}
          <span className="mx-1 h-4 w-px bg-edge" />
          <FilterChip active={typeFilter === "ALL"} onClick={() => applyTypeFilter("ALL")}>
            {t("search.allTypes")}
          </FilterChip>
          {ITEM_TYPES.map((ty) => (
            <FilterChip key={ty} active={typeFilter === ty} onClick={() => applyTypeFilter(ty)}>
              {itemTypeLabel(ty)}
            </FilterChip>
          ))}
          <span className="mx-1 h-4 w-px bg-edge" />
          <FilterChip active={hideExpert} onClick={toggleHideExpert}>
            {t("search.hideExpert")}
          </FilterChip>
        </div>
        <ul ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-zinc-500">
              {t("search.noResults", { query })}
            </li>
          ) : (
            results.map((entry, i) => (
              <li key={entry.k + entry.id}>
                <ResultRow
                  entry={entry}
                  active={i === activeIndex}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => select(entry)}
                />
              </li>
            ))
          )}
        </ul>
        <footer className="border-t border-edge px-4 py-2 text-[11px] text-zinc-600">
          {t("search.footer")}
        </footer>
      </div>
    </div>
  );
}

function ResultRow({
  entry,
  active,
  onMouseEnter,
  onClick,
}: {
  entry: Entry;
  active: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
}) {
  const { t, classLabel, stageLabel, subclassLabel, itemTypeLabel } = useLocale();
  const isItem = entry.k === "item";
  const name = isItem ? entry.name : entry.title;
  const nameColor =
    isItem && entry.rare !== undefined ? rarityColor(entry.rare) : undefined;
  const subclass = isItem ? entry.subclass : undefined;
  const meta = isItem
    ? entry.subclass
      ? subclassLabel(entry.subclass)
      : itemTypeLabel(entry.type as ItemType)
    : stageLabel(entry.stage);
  return (
    <button
      type="button"
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
        active ? "bg-accent/10" : ""
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded border font-mono text-xs font-bold ${
          subclass ? subclassTone(subclass) : "border-edge-2 text-zinc-400"
        }`}
      >
        {isItem ? (
          <ItemSprite itemId={entry.id} fallback={name.charAt(0).toUpperCase()} size="sm" />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span
            className={`max-w-full truncate text-sm font-medium ${
              active ? "text-accent" : ""
            }`}
            style={!active && nameColor ? { color: nameColor } : undefined}
          >
            {name}
          </span>
          {entry.k === "item" && entry.expertOnly ? (
            <Badge tone="accent2" title={t("item.expertOnly")}>
              {t("common.expertPlus")}
            </Badge>
          ) : null}
        </span>
        <span className="block text-[11px] text-zinc-500">{meta}</span>
      </span>
      <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
        {classLabel(entry.classType)}
      </span>
    </button>
  );
}