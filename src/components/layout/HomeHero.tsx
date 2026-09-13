"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";

export function HomeHero({
  version,
  stages,
  builds,
  items,
  recipes,
  drops,
}: {
  version: string;
  stages: number;
  builds: number;
  items: number;
  recipes: number;
  drops: number;
}) {
  const { t } = useLocale();
  const stats = [
    t("home.statStages", { n: stages }),
    t("home.statBuilds", { n: builds }),
    t("home.statItems", { n: items }),
    t("home.statRecipes", { n: recipes }),
    t("home.statDrops", { n: drops }),
  ];
  return (
    <section className="max-w-3xl">
      <h1 className="text-4xl font-black leading-tight tracking-tight">
        <span className="text-accent">{t("home.titleA")}</span> {t("home.titleB")}
      </h1>
      <p className="mt-3 text-lg text-zinc-400">
        {t("home.intro", { version })}
      </p>
      <div className="mt-5 flex flex-wrap gap-2 font-mono text-xs text-zinc-500">
        {stats.map((s) => (
          <span key={s} className="rounded border border-edge bg-surface px-2 py-1">
            {s}
          </span>
        ))}
      </div>
    </section>
  );
}
