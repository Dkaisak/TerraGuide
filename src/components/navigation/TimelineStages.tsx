import Link from "next/link";
import type { ClassType, GameStage } from "@/types/data";
import type { DataIndexes } from "@/lib/indexing";
import { classSlug, stageSlug } from "@/lib/indexing";

export function TimelineStages({
  indexes,
  classType,
  currentStage,
}: {
  indexes: DataIndexes;
  classType?: ClassType;
  currentStage?: GameStage;
}) {
  const currentOrder = currentStage
    ? indexes.stagesById.get(currentStage)?.order ?? -1
    : -1;

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-6 h-px bg-edge"
      />
      <ol className="relative flex gap-2 overflow-x-auto pb-1">
        {indexes.stages.map((stage) => {
          const done = currentOrder > stage.order;
          const isCurrent = currentStage === stage.id;
          const href =
            classType && classType !== "GENERAL"
              ? `/${classSlug(classType)}/${stageSlug(stage.id)}`
              : null;

          const classes = `flex w-[200px] min-w-[200px] shrink-0 flex-col gap-2 rounded-lg p-3 transition-colors ${
            isCurrent
              ? "tg-surface border-accent ring-1 ring-accent/40"
              : done
                ? "tg-surface border-accent-2/40 hover:border-accent"
                : "tg-surface hover:border-edge-2"
          }`;

          const inner = (
            <>
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded font-mono text-[11px] font-bold ${
                    isCurrent
                      ? "bg-accent text-background"
                      : done
                        ? "bg-accent-2/20 text-accent-2"
                        : "tg-slot text-zinc-400"
                  }`}
                >
                  {done ? "✓" : String(stage.order + 1).padStart(2, "0")}
                </span>
                {isCurrent ? (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-accent">
                    Actual
                  </span>
                ) : null}
              </div>
              <span className="text-sm font-semibold leading-tight">
                {stage.title}
              </span>
              <span className="line-clamp-2 text-[11px] leading-snug text-zinc-400">
                {stage.short}
              </span>
              <span
                className="mt-auto truncate text-[10px] text-zinc-500"
                title={`Jefe: ${stage.gate.boss}`}
              >
                <span className="text-zinc-600">Jefe: </span>
                {stage.gate.boss}
              </span>
            </>
          );

          return (
            <li key={stage.id} className="flex">
              {href ? (
                <Link href={href} className={classes} title={stage.description}>
                  {inner}
                </Link>
              ) : (
                <div className={classes} title={stage.description}>
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
