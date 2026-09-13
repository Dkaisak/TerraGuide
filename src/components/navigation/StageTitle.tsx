"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import { stageTitle } from "@/lib/dataI18n";
import type { Stage } from "@/types/data";

export function StageTitle({ stage }: { stage: Stage }) {
  const { locale } = useLocale();
  return <>{stageTitle(locale, stage)}</>;
}
