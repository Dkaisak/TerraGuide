"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import type { MessageKey } from "@/lib/i18n";

/** Renderiza una cadena de la interfaz traducida; útil desde server components. */
export function T({
  k,
  vars,
}: {
  k: MessageKey;
  vars?: Record<string, string | number>;
}) {
  const { t } = useLocale();
  return <>{t(k, vars)}</>;
}
