"use client";

import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { usePersistedState } from "@/hooks/usePersistedState";
import { LOCALE_STORAGE_KEY } from "@/lib/storage";
import {
  ACCESSORY_ROLE_LABEL_I18N,
  CLASS_LABEL_I18N,
  CLASS_TAGLINE_I18N,
  DAMAGE_TYPE_LABEL_I18N,
  DEFAULT_LOCALE,
  DIFFICULTY_LABEL_I18N,
  ITEM_TYPE_LABEL_I18N,
  SLOT_LABEL_I18N,
  STAGE_LABEL_I18N,
  SUB_CLASS_LABEL_I18N,
  translate,
} from "@/lib/i18n";
import type { Locale, MessageKey } from "@/lib/i18n";
import type {
  AccessoryRole,
  ClassType,
  Difficulty,
  GameStage,
  ItemType,
  Subclass,
} from "@/types/data";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
  classLabel: (classType: ClassType) => string;
  classTagline: (classType: ClassType) => string;
  stageLabel: (stage: GameStage) => string;
  subclassLabel: (subclass: Subclass) => string;
  itemTypeLabel: (type: ItemType) => string;
  roleLabel: (role: AccessoryRole) => string;
  difficultyLabel: (difficulty: Difficulty) => string;
  slotLabel: (slot: string) => string;
  damageTypeLabel: (damageType: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function makeContext(locale: Locale, setLocale: (l: Locale) => void): LocaleContextValue {
  return {
    locale,
    setLocale,
    t: (key, vars) => translate(locale, key, vars),
    classLabel: (c) => CLASS_LABEL_I18N[locale][c],
    classTagline: (c) => CLASS_TAGLINE_I18N[locale][c],
    stageLabel: (s) => STAGE_LABEL_I18N[locale][s],
    subclassLabel: (s) => SUB_CLASS_LABEL_I18N[locale][s],
    itemTypeLabel: (t) => ITEM_TYPE_LABEL_I18N[locale][t],
    roleLabel: (r) => ACCESSORY_ROLE_LABEL_I18N[locale][r],
    difficultyLabel: (d) => DIFFICULTY_LABEL_I18N[locale][d],
    slotLabel: (slot) => SLOT_LABEL_I18N[locale][slot] ?? slot,
    damageTypeLabel: (dt) => DAMAGE_TYPE_LABEL_I18N[locale][dt] ?? dt,
  };
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext) ?? makeContext(DEFAULT_LOCALE, () => {});
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = usePersistedState<Locale>(
    LOCALE_STORAGE_KEY,
    DEFAULT_LOCALE,
  );

  const value = useMemo(() => makeContext(locale, setLocale), [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
