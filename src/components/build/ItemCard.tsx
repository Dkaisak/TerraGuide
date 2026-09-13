"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import { Badge } from "@/components/ui/Badge";
import { ItemSprite } from "@/components/ui/ItemSprite";
import { SetSprite } from "@/components/ui/SetSprite";
import { rarityColor } from "@/components/build/rarityTone";
import { ACCESSORY_MODIFIER_BY_ID } from "@/lib/modifiers";
import { subclassTone } from "@/components/build/subclassTone";
import { itemObtain, setBonus } from "@/lib/dataI18n";
import type { DataIndexes, SlotRef } from "@/lib/indexing";
import { isExpertOrMasterOnly, refName, wikiUrl } from "@/lib/indexing";

const ROLE_TONE: Record<string, string> = {
  OFENSIVO: "accent",
  DEFENSIVO: "accent2",
  MOVILIDAD: "neutral",
  UTILIDAD: "default",
};

export function ItemCard({
  slotRef,
  note,
  alternatives,
  qty,
  reforge,
  checked = false,
  onToggle,
  onOpen,
  onOpenItem,
  indexes,
}: {
  slotRef: SlotRef;
  note: string;
  alternatives?: string[];
  qty?: number;
  reforge?: string;
  checked?: boolean;
  onToggle?: () => void;
  onOpen?: () => void;
  onOpenItem?: (id: string) => void;
  indexes: DataIndexes;
}) {
  const { locale, t, roleLabel, subclassLabel } = useLocale();
  const name =
    slotRef.kind === "item"
      ? slotRef.item.name
      : slotRef.kind === "set"
        ? slotRef.set.name
        : slotRef.id;
  const isSet = slotRef.kind === "set";
  const item = slotRef.kind === "item" ? slotRef.item : undefined;
  const subclass = item?.subclass;
  const detail =
    slotRef.kind === "set"
      ? setBonus(locale, slotRef.set)
      : slotRef.kind === "item"
        ? itemObtain(locale, slotRef.item, indexes)
        : t("item.notFound", { id: slotRef.id });

  const letter = (name || "?").charAt(0).toUpperCase();
  const itemId = slotRef.kind === "item" ? slotRef.item.id : undefined;
  const expertOnly =
    slotRef.kind === "item" ? isExpertOrMasterOnly(indexes, slotRef.item.id) : false;
  const nameColor =
    item?.stats?.rare !== undefined ? rarityColor(item.stats.rare) : undefined;
  const avatar = (checked: boolean) =>
    checked
      ? "✓"
      : itemId
        ? <ItemSprite itemId={itemId} fallback={letter} />
        : slotRef.kind === "set"
          ? <SetSprite setId={slotRef.set.id} fallback={letter} />
          : letter;

  return (
    <div
      className={`tg-surface flex items-start gap-2.5 rounded-lg p-2 transition-colors ${
        checked ? "border-accent ring-1 ring-accent/30" : ""
      }`}
      style={
        nameColor
          ? { borderLeftWidth: "4px", borderLeftColor: nameColor }
          : undefined
      }
    >
      {onToggle ? (
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={checked}
          title={checked ? t("common.markPending") : t("common.markObtained")}
          className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded border font-mono text-sm font-bold transition-colors ${
            subclass ? subclassTone(subclass) : isSet ? "border-edge-2 text-zinc-400" : "border-edge-2 text-zinc-300"
          } ${
            checked
              ? "bg-accent/20 ring-1 ring-accent"
              : "hover:border-accent/60 hover:text-accent"
          }`}
        >
          {avatar(checked)}
        </button>
      ) : (
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded border font-mono text-sm font-bold ${
            subclass ? subclassTone(subclass) : isSet ? "border-edge-2 text-zinc-400" : "border-edge-2 text-zinc-300"
          }`}
        >
          {avatar(false)}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {nameColor ? (
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: nameColor }}
              title={`${t("stat.rarity")} ${item?.stats?.rare}`}
            />
          ) : null}
          {onOpen ? (
            <button
              type="button"
              onClick={onOpen}
              className="max-w-full truncate text-left font-semibold leading-tight transition-colors hover:text-accent"
              title={t("item.howToGet")}
            >
              {name}
            </button>
          ) : (
            <span className="font-semibold leading-tight">{name}</span>
          )}
          {qty && qty > 1 ? <Badge tone="neutral">×{qty}</Badge> : null}
          {subclass ? (
            <Badge className={subclassTone(subclass)}>{subclassLabel(subclass)}</Badge>
          ) : isSet ? (
            <Badge tone="neutral">{t("item.setBadge")}</Badge>
          ) : null}
          {expertOnly ? (
            <Badge tone="accent2" title={t("item.expertOnly")}>
              {t("common.expertPlus")}
            </Badge>
          ) : null}
          {item?.type === "ACCESSORY" && item.role ? (
            <Badge tone={ROLE_TONE[item.role] ?? "default"} title={roleLabel(item.role)}>
              {roleLabel(item.role)}
            </Badge>
          ) : null}
          {reforge ? (
            <Badge tone="accent" title={t("tester.optimalReforge")}>
              {ACCESSORY_MODIFIER_BY_ID.get(reforge)?.name ?? reforge}
            </Badge>
          ) : null}
          {item?.stats?.damage !== undefined ? (
            <Badge tone="neutral" title={t("stat.damage")}>
              {t("stat.damageShort", { n: item.stats.damage })}
            </Badge>
          ) : null}
          {item?.stats?.defense !== undefined ? (
            <Badge tone="neutral" title={t("stat.defense")}>
              {t("stat.defenseShort", { n: item.stats.defense })}
            </Badge>
          ) : null}
          {item ? (
            <a
              href={wikiUrl(item)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="ml-auto text-xs text-zinc-500 transition-colors hover:text-accent"
              title={`${t("common.wiki")} ↗`}
            >
              {t("common.wiki")} ↗
            </a>
          ) : null}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">{detail}</p>
        {note ? <p className="mt-1 text-xs italic leading-relaxed text-zinc-400">{note}</p> : null}
        {alternatives && alternatives.length > 0 ? (
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <span className="text-[11px] text-zinc-600">{t("item.variants")}</span>
            {alternatives.map((alt) => {
              const altName = refName(indexes, alt);
              const chipClass =
                "rounded border border-edge bg-surface px-1.5 py-0.5 text-[11px] text-zinc-400";
              return onOpenItem ? (
                <button
                  key={alt}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenItem(alt);
                  }}
                  title={t("common.view", { name: altName })}
                  className={`${chipClass} cursor-pointer transition-colors hover:border-accent/60 hover:text-accent`}
                >
                  {altName}
                </button>
              ) : (
                <span key={alt} className={chipClass}>
                  {altName}
                </span>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
