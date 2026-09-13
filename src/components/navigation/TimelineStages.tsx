"use client";

import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { ClassType, GameStage, Stage } from "@/types/data";
import { classSlug, stageSlug } from "@/lib/indexing";
import { stageTitle, stageShort, stageBoss } from "@/lib/dataI18n";

export function TimelineStages({
  stages,
  classType,
  currentStage,
}: {
  stages: Stage[];
  classType?: ClassType;
  currentStage?: GameStage;
}) {
  const { locale, t } = useLocale();
  const currentOrder = currentStage
    ? stages.find((s) => s.id === currentStage)?.order ?? -1
    : -1;

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-6 h-px bg-edge"
      />
      <ol className="relative flex gap-2 overflow-x-auto pb-1">
        {stages.map((stage) => {
          const done = currentOrder > stage.order;
          const isCurrent = currentStage === stage.id;
          const href =
            classType && classType !== "GENERAL"
              ? `/${classSlug(classType)}/${stageSlug(stage.id)}`
              : null;

          const classes = `flex w-[150px] min-w-[150px] shrink-0 flex-col gap-1 rounded-lg p-2 transition-colors ${
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
                  className={`flex h-5 w-5 items-center justify-center rounded font-mono text-[10px] font-bold ${
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
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-accent">
                    {t("common.current")}
                  </span>
                ) : null}
              </div>
              <span className="truncate text-xs font-semibold leading-tight">
                {stageTitle(locale, stage)}
              </span>
              <span className="line-clamp-2 text-[10px] leading-snug text-zinc-400">
                {stageShort(locale, stage)}
              </span>
              <span
                className="mt-auto truncate text-[10px] text-zinc-500"
                title={`${t("common.boss")}: ${stageBoss(locale, stage)}`}
              >
                <span className="text-zinc-600">{t("common.boss")}: </span>
                {stageBoss(locale, stage)}
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
