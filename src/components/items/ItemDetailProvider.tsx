"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ItemModal } from "@/components/build/ItemModal";
import { buildIndexes } from "@/lib/indexing";
import type { DataIndexes } from "@/lib/indexing";
import type { ArmorSet, Drop, Item, Recipe } from "@/types/data";

interface SlimData {
  items: Item[];
  sets: ArmorSet[];
  recipes: Recipe[];
  drops: Drop[];
}

interface ItemDetailContextValue {
  openItem: (id: string) => void;
}

const ItemDetailContext = createContext<ItemDetailContextValue | null>(null);

export function useItemDetail(): ItemDetailContextValue {
  return useContext(ItemDetailContext) ?? { openItem: () => {} };
}

export function ItemDetailProvider({ children }: { children: ReactNode }) {
  const [targetId, setTargetId] = useState<string | null>(null);
  const [indexes, setIndexes] = useState<DataIndexes | null>(null);
  const [loading, setLoading] = useState(false);
  const dataRef = useRef<SlimData | null>(null);
  const requestRef = useRef<Promise<SlimData> | null>(null);

  const load = useCallback(async (): Promise<DataIndexes> => {
    if (!dataRef.current) {
      requestRef.current =
        requestRef.current ??
        fetch("/dataset.json").then((r) => {
          if (!r.ok) throw new Error("dataset no disponible");
          return r.json() as Promise<SlimData>;
        });
      dataRef.current = await requestRef.current;
    }
    return buildIndexes({ ...dataRef.current, stages: [], builds: [] });
  }, []);

  const openItem = useCallback(
    (id: string) => {
      setTargetId(id);
      if (indexes) return;
      setLoading(true);
      load()
        .then((idx) => setIndexes(idx))
        .catch(() => setTargetId(null))
        .finally(() => setLoading(false));
    },
    [indexes, load],
  );

  const value = useMemo(() => ({ openItem }), [openItem]);

  return (
    <ItemDetailContext.Provider value={value}>
      {children}
      {loading && !indexes ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center">
          <span className="tg-surface rounded-full px-3 py-1.5 text-xs text-zinc-400 shadow-lg">
            Cargando ficha…
          </span>
        </div>
      ) : null}
      {targetId && indexes ? (
        <ItemModal
          key={targetId}
          targetId={targetId}
          indexes={indexes}
          onOpenItem={(id) => setTargetId(id)}
          onClose={() => setTargetId(null)}
        />
      ) : null}
    </ItemDetailContext.Provider>
  );
}
