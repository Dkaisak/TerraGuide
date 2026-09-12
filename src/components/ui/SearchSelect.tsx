"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ItemSprite } from "@/components/ui/ItemSprite";

export interface SelectOption {
  id: string;
  label: string;
  group?: string;
  itemId?: string;
}

export function SearchSelect({
  value,
  onChange,
  options,
  placeholder = "— Ninguno —",
  disabled = false,
  ariaLabel,
}: {
  value: string;
  onChange: (id: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const choose = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[active];
      if (opt) choose(opt.id);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  let lastGroup: string | undefined;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => {
          if (open) {
            setOpen(false);
          } else {
            setQuery("");
            setActive(0);
            setOpen(true);
          }
        }}
        className="flex w-full items-center gap-2 rounded-md border border-edge bg-background px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:border-edge-2 focus:border-accent disabled:opacity-40"
      >
        {selected?.itemId ? (
          <ItemSprite itemId={selected.itemId} fallback={selected.label.charAt(0)} size="sm" />
        ) : null}
        <span className={`flex-1 truncate ${selected ? "" : "text-zinc-600"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="text-[10px] text-zinc-600">▾</span>
      </button>
      {open ? (
        <div className="absolute left-0 z-40 mt-1 w-full overflow-hidden rounded-md border border-edge-2 bg-surface shadow-2xl">
          <div className="border-b border-edge p-1.5">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Buscar…"
              className="w-full rounded bg-background px-2 py-1 text-sm text-foreground outline-none placeholder:text-zinc-600"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <li className="px-2 py-3 text-center text-xs text-zinc-500">
                Sin resultados
              </li>
            ) : (
              filtered.map((o, i) => {
                const showGroup = o.group && o.group !== lastGroup;
                lastGroup = o.group;
                return (
                  <li key={o.id || "__none"}>
                    {showGroup ? (
                      <div className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
                        {o.group}
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => choose(o.id)}
                      className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm ${
                        i === active ? "bg-accent/10 text-accent" : "text-foreground"
                      }`}
                    >
                      {o.itemId ? (
                        <ItemSprite itemId={o.itemId} fallback={o.label.charAt(0)} size="sm" />
                      ) : null}
                      <span className="truncate">{o.label}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
