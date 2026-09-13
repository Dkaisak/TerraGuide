"use client";

import Link from "next/link";
import { LocaleToggle } from "@/components/i18n/LocaleToggle";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { DifficultySelector } from "@/components/navigation/DifficultySelector";

export function SiteHeader({ version }: { version: string }) {
  const { t } = useLocale();
  return (
    <header
      className="border-b border-edge"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--color-surface) 80%, transparent), transparent)",
      }}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-6 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="tg-title text-xl font-black tracking-tight">
            Terra<span className="text-accent">Guide</span>
          </span>
          <span className="hidden text-xs text-zinc-500 sm:inline">
            {t("nav.tagline")}
          </span>
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            href="/items"
            className="tg-btn rounded-md px-2.5 py-1 text-xs font-medium text-zinc-300"
          >
            {t("nav.items")}
          </Link>
          <Link
            href="/builder"
            title={t("nav.builderCtaTitle")}
            className="tg-cta flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
              <path d="M12 2l1.6 4.4L18 8l-4.4 1.6L12 14l-1.6-4.4L6 8l4.4-1.6L12 2Zm6 10l.8 2.2L21 15l-2.2.8L18 18l-.8-2.2L15 15l2.2-.8L18 12ZM6 14l1 2.7 2.7 1-2.7 1L6 21.4 5 18.7l-2.7-1 2.7-1L6 14Z" />
            </svg>
            {t("nav.builderCta")}
          </Link>
          <DifficultySelector />
          <LocaleToggle />
          <span className="tg-slot rounded px-2 py-0.5 font-mono text-[11px] text-accent">
            v{version}
          </span>
        </div>
      </div>
    </header>
  );
}
