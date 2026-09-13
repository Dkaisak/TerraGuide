"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import { mechanicText } from "@/lib/dataI18n";
import type { Mechanic } from "@/types/data";

function wikiUrl(page: string): string {
  return `https://terraria.wiki.gg/wiki/${encodeURIComponent(page.replaceAll(" ", "_"))}`;
}

export function MechanicsList({ mechanics }: { mechanics: Mechanic[] }) {
  const { locale, t } = useLocale();
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {mechanics.map((m) => {
        const { title, summary, points } = mechanicText(locale, m);
        return (
          <article key={m.id} className="tg-surface flex flex-col gap-2 rounded-lg p-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base font-bold leading-tight">{title}</h2>
              {m.wikiPage ? (
                <a
                  href={wikiUrl(m.wikiPage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs text-zinc-500 transition-colors hover:text-accent"
                  title={t("mechanics.wikiTitle", { page: m.wikiPage })}
                >
                  {t("common.wiki")} ↗
                </a>
              ) : null}
            </div>
            <p className="text-sm text-zinc-400">{summary}</p>
            <ul className="flex flex-col gap-1 text-sm text-zinc-300">
              {points.map((point, i) => (
                <li key={i} className="flex gap-2">
                  <span className="shrink-0 text-accent">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </article>
        );
      })}
    </div>
  );
}
