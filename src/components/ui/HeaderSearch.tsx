"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MiniSearch from "minisearch";
import { rarityColor } from "@/components/build/rarityTone";
import { subclassTone } from "@/components/build/subclassTone";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useItemDetail } from "@/components/items/ItemDetailProvider";
import { Badge } from "@/components/ui/Badge";
import { ItemSprite } from "@/components/ui/ItemSprite";
import type { ClassType, GameStage, ItemType, Subclass } from "@/types/data";

interface ItemEntry {
  k: "item";
  id: string;
  name: string;
  type: string;
  classType: ClassType;
  subclass?: Subclass;
  classLabel: string;
  subclassLabel?: string;
  rare?: number;
  expertOnly?: boolean;
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

const docId = (e: Entry) => `${e.k}:${e.id}`;
const LIMIT = 8;

export function HeaderSearch() {
  const { openItem } = useItemDetail();
  const { t, classLabel, stageLabel, subclassLabel, itemTypeLabel } = useLocale();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [entries, setEntries] = useState<Entry[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

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
          "rare",
          "expertOnly",
        ] as const,
        searchOptions: { prefix: true, fuzzy: 0.2, boost: { name: 2, title: 2 } },
      }),
    [],
  );

  useEffect(() => {
    fetch("/search-index.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("sin índice"))))
      .then((data: { items: ItemEntry[]; builds: BuildEntry[] }) => {
        const all: Entry[] = [...data.items, ...data.builds];
        if (mini.documentCount === 0) {
          mini.addAll(all.map((e) => ({ ...e, _id: docId(e) })));
        }
        setEntries(all);
      })
      .catch(() => {
        /* índice no disponible */
      });
  }, [mini]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const byId = useMemo(
    () => new Map(entries.map((e) => [docId(e), e] as const)),
    [entries],
  );

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return mini
      .search(q)
      .map((hit) => byId.get(hit.id))
      .filter((d): d is Entry => d != null)
      .slice(0, LIMIT);
  }, [query, mini, byId]);

  const select = (entry: Entry) => {
    if (entry.k === "item") {
      openItem(entry.id);
    } else {
      window.location.href = entry.path;
    }
    setQuery("");
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
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={boxRef} className="relative w-40 sm:w-52 lg:w-64">
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={t("nav.searchPlaceholder")}
        aria-label={t("nav.searchAria")}
        className="w-full rounded-md border border-edge bg-background px-2.5 py-1 text-xs text-foreground outline-none transition-colors placeholder:text-zinc-600 focus:border-accent"
      />
      {open && results.length > 0 ? (
        <ul className="tg-surface absolute right-0 top-full z-50 mt-1 max-h-[60vh] w-[320px] overflow-y-auto rounded-lg p-1 shadow-2xl">
          {results.map((entry, i) => (
            <li key={docId(entry)}>
              <button
                type="button"
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => select(entry)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors ${
                  i === activeIndex ? "bg-accent/10" : ""
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded border font-mono text-[11px] font-bold ${
                    entry.k === "item" && entry.subclass
                      ? subclassTone(entry.subclass)
                      : "border-edge-2 text-zinc-400"
                  }`}
                >
                  {entry.k === "item" ? (
                    <ItemSprite
                      itemId={entry.id}
                      fallback={entry.name.charAt(0).toUpperCase()}
                      size="sm"
                    />
                  ) : (
                    entry.title.charAt(0).toUpperCase()
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className="block truncate text-xs font-medium"
                    style={
                      entry.k === "item" && entry.rare !== undefined
                        ? { color: rarityColor(entry.rare) }
                        : undefined
                    }
                  >
                    {entry.k === "item" ? entry.name : entry.title}
                  </span>
                  <span className="block truncate text-[10px] text-zinc-500">
                    {entry.k === "item"
                      ? entry.subclass
                        ? subclassLabel(entry.subclass)
                        : itemTypeLabel(entry.type as ItemType)
                      : stageLabel(entry.stage)}
                  </span>
                </span>
                {entry.k === "item" && entry.expertOnly ? (
                  <Badge tone="accent2">{t("common.expertPlus")}</Badge>
                ) : null}
                <span className="shrink-0 text-[10px] uppercase tracking-wide text-zinc-600">
                  {classLabel(entry.classType)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
