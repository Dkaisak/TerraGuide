"use client";

import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";

export function SiteFooter({ version }: { version: string }) {
  const { t } = useLocale();
  return (
    <footer className="border-t border-edge">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-6 py-4 text-xs text-zinc-600">
        <div className="flex flex-wrap items-center gap-3">
          <span>{t("nav.dataAligned", { version })}</span>
          <Link
            href="/changelog"
            className="text-zinc-500 transition-colors hover:text-accent"
          >
            {t("nav.changelog")} →
          </Link>
        </div>
        <span>{t("nav.disclaimer")}</span>
      </div>
    </footer>
  );
}
