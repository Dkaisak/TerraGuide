"use client";

import { subclassTone } from "@/components/build/subclassTone";
import type { Build, Subclass } from "@/types/data";
import { CLASS_SUBCLASSES, SUB_CLASS_LABEL } from "@/types/data";

export function SubclassPicker({
  build,
  selected,
  onChange,
}: {
  build: Build;
  selected?: Subclass;
  onChange: (subclass: Subclass) => void;
}) {
  const base = build.subclass;
  const variantSubclasses = build.subclassSlots?.map((v) => v.subclass) ?? [];
  const options = base ? [base, ...variantSubclasses] : variantSubclasses;
  const unique = [...new Set(options)].sort(
    (a, b) => {
      const order = CLASS_SUBCLASSES[
        build.classType as Exclude<Build["classType"], "GENERAL">
      ];
      return order.indexOf(a) - order.indexOf(b);
    },
  );

  if (unique.length <= 1) return null;

  return (
    <section className="mb-6">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Subclase
      </h2>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Subclase">
        {unique.map((sub) => {
          const active = selected === sub;
          const tone = subclassTone(sub);
          return (
            <button
              key={sub}
              type="button"
              onClick={() => onChange(sub)}
              aria-pressed={active}
              className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? tone
                  : "border-edge bg-surface text-zinc-400 hover:border-edge-2 hover:text-zinc-200"
              }`}
            >
              {active ? "● " : ""}
              {SUB_CLASS_LABEL[sub]}
            </button>
          );
        })}
      </div>
    </section>
  );
}