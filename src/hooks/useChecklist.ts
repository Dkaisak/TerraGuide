"use client";

import { useMemo } from "react";
import { usePersistedState } from "@/hooks/usePersistedState";
import { CHECKLIST_STORAGE_KEY } from "@/lib/storage";

export function useChecklist() {
  const [ids, setIds] = usePersistedState<string[]>(CHECKLIST_STORAGE_KEY, []);

  const set = useMemo(() => new Set(ids), [ids]);

  const has = (id: string): boolean => set.has(id);

  const toggle = (id: string) => {
    setIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const setMany = (toAdd: string[], add: boolean) => {
    setIds((prev) => {
      const next = new Set(prev);
      for (const id of toAdd) {
        if (add) {
          next.add(id);
        } else {
          next.delete(id);
        }
      }
      return [...next];
    });
  };

  const clear = () => setIds([]);

  return { has, set, toggle, setMany, clear };
}