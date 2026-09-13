"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import { LOCALES, LOCALE_NAME, LOCALE_SHORT } from "@/lib/i18n";

export function LocaleToggle() {
  const { locale, setLocale, t } = useLocale();
  return (
    <div
      role="group"
      aria-label={t("nav.language")}
      className="inline-flex items-center overflow-hidden rounded border border-edge"
    >
      {LOCALES.map((l) => {
        const active = locale === l;
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            aria-pressed={active}
            title={LOCALE_NAME[l]}
            className={`px-2 py-1 text-[11px] font-semibold transition-colors ${
              active
                ? "bg-accent text-background"
                : "bg-surface text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {LOCALE_SHORT[l]}
          </button>
        );
      })}
    </div>
  );
}
