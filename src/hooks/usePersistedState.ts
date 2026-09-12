"use client";

import { useCallback, useSyncExternalStore } from "react";

interface CacheEntry {
  raw: string | null;
  value: unknown;
}

const cache: Record<string, CacheEntry> = {};
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function readCached<T>(key: string, initial: T): T {
  const raw = typeof window === "undefined" ? null : window.localStorage.getItem(key);
  const entry = cache[key];
  if (entry && entry.raw === raw) {
    return entry.value as T;
  }
  let value: unknown = initial;
  if (raw != null) {
    try {
      value = JSON.parse(raw);
    } catch {
      /* datos corruptos: usar el valor inicial */
    }
  }
  cache[key] = { raw, value };
  return value as T;
}

export function usePersistedState<T>(
  key: string,
  initial: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const subscribe = useCallback(
    (callback: () => void) => {
      listeners.add(callback);
      const onStorage = (event: StorageEvent) => {
        if (event.key === key || event.key == null) {
          callback();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(callback);
        window.removeEventListener("storage", onStorage);
      };
    },
    [key],
  );

  const state = useSyncExternalStore(
    subscribe,
    () => readCached(key, initial),
    () => initial,
  );

  const setState = useCallback(
    (update: React.SetStateAction<T>) => {
      const current = readCached(key, initial);
      const next =
        typeof update === "function"
          ? (update as (prev: T) => T)(current)
          : update;
      window.localStorage.setItem(key, JSON.stringify(next));
      cache[key] = { raw: JSON.stringify(next), value: next };
      emit();
    },
    [key, initial],
  );

  return [state, setState];
}