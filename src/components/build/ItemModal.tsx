"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { CraftingTree } from "@/components/build/CraftingTree";
import { rarityColor } from "@/components/build/rarityTone";
import { subclassTone } from "@/components/build/subclassTone";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { Badge } from "@/components/ui/Badge";
import { DifficultyToggle } from "@/components/ui/DifficultyToggle";
import { dropFrom, itemObtain, sellText, setBonus } from "@/lib/dataI18n";
import type { DataIndexes } from "@/lib/indexing";
import { isExpertOrMasterOnly, refName, resolveRef, wikiUrl } from "@/lib/indexing";
import type { Difficulty } from "@/types/data";
import { DIFFICULTY_ORDER } from "@/types/data";

const CHANCE_KEY: Record<Difficulty, "classic" | "expert" | "master"> = {
  CLASSIC: "classic",
  EXPERT: "expert",
  MASTER: "master",
};

export function ItemModal({
  targetId,
  indexes,
  difficulty = "CLASSIC",
  onDifficultyChange,
  checked,
  onToggle,
  onOpenItem,
  onClose,
}: {
  targetId: string;
  indexes: DataIndexes;
  difficulty?: Difficulty;
  onDifficultyChange?: (d: Difficulty) => void;
  checked?: (id: string) => boolean;
  onToggle?: (id: string) => void;
  onOpenItem?: (id: string) => void;
  onClose: () => void;
}) {
  const { locale, t, subclassLabel, damageTypeLabel, difficultyLabel, itemTypeLabel } =
    useLocale();
  const ref = resolveRef(indexes, targetId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  if (!ref || ref.kind === "missing") {
    return (
      <ModalShell onClose={onClose}>
        <p className="text-sm text-zinc-400">{t("item.notFound", { id: targetId })}</p>
      </ModalShell>
    );
  }

  if (ref.kind === "set") {
    const pieceIds = [ref.set.head, ref.set.chest, ref.set.legs].filter(
      (id) => id.length > 0,
    );
    const allChecked = onToggle ? pieceIds.every((id) => checked?.(id) ?? false) : false;
    return (
      <ModalShell onClose={onClose}>
        <ModalHeader
          name={ref.set.name}
          badges={<Badge>{t("item.armorSet")}</Badge>}
          image={`/sets/${ref.set.id}.png`}
        />
        <div className="flex flex-col gap-2 text-sm">
          <p className="text-zinc-400">
            {t("item.pieces")}{" "}
            <span className="font-medium text-foreground">
              {pieceIds.map((id) => refName(indexes, id)).join(" · ")}
            </span>
          </p>
          <p className="text-zinc-300">{setBonus(locale, ref.set)}</p>
          {ref.set.note ? (
            <p className="text-xs italic text-zinc-500">{ref.set.note}</p>
          ) : null}
        </div>
        {onToggle ? (
          <button
            type="button"
            onClick={() => onToggle(targetId)}
            className={`mt-4 w-full rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
              allChecked
                ? "border-edge text-foreground"
                : "border-accent/50 bg-accent/10 text-accent hover:bg-accent/20"
            }`}
          >
            {allChecked ? t("item.piecesDone") : t("item.piecesMark")}
          </button>
        ) : null}
      </ModalShell>
    );
  }

  const item = ref.item;
  const drops = indexes.dropsByItem.get(item.id) ?? [];
  const recipes = (indexes.recipesByResult.get(item.id) ?? []).length > 0;
  const expertOnly = isExpertOrMasterOnly(indexes, item.id);

  const stats = item.stats;
  const statChips: { label: string; value: string; color?: string }[] = [];
  if (stats) {
    if (stats.damage !== undefined)
      statChips.push({
        label: t("stat.damage"),
        value: `${stats.damage}${stats.damageType ? ` · ${damageTypeLabel(stats.damageType)}` : ""}`,
      });
    if (stats.defense !== undefined) statChips.push({ label: t("stat.defense"), value: String(stats.defense) });
    if (stats.critical !== undefined) statChips.push({ label: t("stat.critical"), value: `${stats.critical}%` });
    if (stats.useTime !== undefined) statChips.push({ label: t("stat.useTime"), value: String(stats.useTime) });
    if (stats.knockback !== undefined) statChips.push({ label: t("stat.knockback"), value: String(stats.knockback) });
    if (stats.mana !== undefined) statChips.push({ label: t("stat.mana"), value: String(stats.mana) });
    if (stats.velocity !== undefined) statChips.push({ label: t("stat.velocity"), value: String(stats.velocity) });
    if (stats.rare !== undefined)
      statChips.push({ label: t("stat.rarity"), value: String(stats.rare), color: rarityColor(stats.rare) });
    if (stats.autoswing) statChips.push({ label: t("stat.autoswing"), value: t("common.yes") });
    if (stats.sell) statChips.push({ label: t("stat.sell"), value: sellText(locale, stats.sell) });
  }

  return (
    <ModalShell onClose={onClose}>
      <ModalHeader
        name={item.name}
        image={`/items/${item.id}.png`}
        color={stats?.rare !== undefined ? rarityColor(stats.rare) : undefined}
        badges={
          <>
            <Badge>{itemTypeLabel(item.type)}</Badge>
            {item.subclass ? (
              <Badge className={subclassTone(item.subclass)}>
                {subclassLabel(item.subclass)}
              </Badge>
            ) : null}
            {expertOnly ? (
              <Badge tone="accent2" title={t("item.expertOnly")}>
                {t("item.expertOnly")}
              </Badge>
            ) : null}
          </>
        }
      />

      <section className="flex flex-col gap-1">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {t("item.howToGet")}
        </h4>
        <p className="text-sm text-zinc-300">{itemObtain(locale, item, indexes)}</p>
      </section>

      {statChips.length > 0 ? (
        <section className="flex flex-col gap-1.5">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t("item.stats")}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {statChips.map((c) => (
              <span
                key={c.label}
                className="inline-flex items-baseline gap-1 rounded border border-edge bg-surface px-2 py-0.5 text-xs"
              >
                <span className="text-zinc-500">{c.label}</span>
                <span
                  className="font-semibold text-foreground"
                  style={c.color ? { color: c.color } : undefined}
                >
                  {c.value}
                </span>
              </span>
            ))}
          </div>
          {stats?.tooltip ? (
            <p className="text-xs italic text-zinc-500">&quot;{stats.tooltip}&quot;</p>
          ) : null}
        </section>
      ) : null}

      {drops.length > 0 ? (
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {t("item.sources")}
            </h4>
            {onDifficultyChange ? (
              <DifficultyToggle value={difficulty} onChange={onDifficultyChange} />
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            {drops.map((drop, i) => {
              const vals = DIFFICULTY_ORDER.map(
                (d) => drop.chance?.[CHANCE_KEY[d]] ?? "—",
              );
              const same = vals[0] === vals[1] && vals[1] === vals[2];
              return (
                <div
                  key={i}
                  className="rounded-lg border border-edge bg-surface px-3 py-2"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="text-sm font-medium">{dropFrom(locale, drop.from)}</span>
                    {drop.biomes.length > 0 ? (
                      <span className="text-xs text-zinc-500">
                        {drop.biomes.join(", ")}
                      </span>
                    ) : null}
                  </div>
                  {drop.chance ? (
                    same ? (
                      <div className="mt-1 text-xs font-semibold text-accent">
                        {vals[0]}
                      </div>
                    ) : (
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
                        {DIFFICULTY_ORDER.map((d) => (
                          <span
                            key={d}
                            className={
                              d === difficulty
                                ? "font-semibold text-accent"
                                : "text-zinc-600"
                            }
                          >
                            {difficultyLabel(d)}:{" "}
                            {drop.chance?.[CHANCE_KEY[d]] ?? "—"}
                          </span>
                        ))}
                      </div>
                    )
                  ) : drop.price ? (
                    <div className="mt-1 text-xs font-semibold text-accent">
                      {drop.price}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {recipes ? (
        <section className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t("item.crafting")}
          </h4>
          <CraftingTree itemId={item.id} indexes={indexes} onOpenItem={onOpenItem} />
        </section>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {onToggle ? (
          <button
            type="button"
            onClick={() => onToggle(item.id)}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
              checked?.(item.id)
                ? "border-edge text-zinc-400"
                : "border-accent/50 bg-accent/10 text-accent hover:bg-accent/20"
            }`}
          >
            {checked?.(item.id) ? t("common.markedObtained") : t("common.markObtained")}
          </button>
        ) : null}
        <a
          href={wikiUrl(item)}
          target="_blank"
          rel="noopener noreferrer"
          className="tg-btn rounded-lg px-3 py-2 text-sm text-zinc-300"
        >
          {t("common.wiki")} ↗
        </a>
      </div>
    </ModalShell>
  );
}

function ModalShell({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:py-12"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="tg-surface relative flex w-full max-w-xl flex-col gap-4 rounded-xl p-5 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          autoFocus
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded border border-edge text-zinc-500 transition-colors hover:border-edge-2 hover:text-zinc-200"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({
  name,
  badges,
  image,
  color,
}: {
  name: string;
  badges: ReactNode;
  image?: string;
  color?: string;
}) {
  return (
    <header className="flex flex-wrap items-center gap-2 pr-8">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          draggable={false}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          className="h-11 w-11 shrink-0 object-contain [image-rendering:pixelated]"
        />
      ) : null}
      <h3 className="text-lg font-bold leading-tight" style={color ? { color } : undefined}>
        {name}
      </h3>
      {badges}
    </header>
  );
}
