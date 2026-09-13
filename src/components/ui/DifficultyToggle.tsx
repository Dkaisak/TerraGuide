"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import type { Difficulty } from "@/types/data";
import { DIFFICULTY_ORDER } from "@/types/data";

export function DifficultyToggle({
  value,
  onChange,
  label = false,
  className = "",
}: {
  value: Difficulty;
  onChange: (difficulty: Difficulty) => void;
  label?: boolean;
  className?: string;
}) {
  const { t, difficultyLabel } = useLocale();
  return (
    <div
      role="group"
      aria-label={t("common.difficulty")}
      className={`inline-flex items-center overflow-hidden rounded border border-edge ${className}`}
    >
      {label ? (
        <span
          aria-hidden="true"
          className="border-r border-edge bg-surface px-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500"
        >
          {t("common.difficulty")}
        </span>
      ) : null}
      {DIFFICULTY_ORDER.map((d) => {
        const active = value === d;
        return (
          <button
            key={d}
            type="button"
            onClick={() => onChange(d)}
            aria-pressed={active}
            className={`px-2.5 py-1 text-xs font-medium transition-colors ${
              active
                ? "bg-accent text-background"
                : "bg-surface text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {difficultyLabel(d)}
          </button>
        );
      })}
    </div>
  );
}