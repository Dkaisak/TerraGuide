"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { CraftingTree } from "@/components/build/CraftingTree";
import { rarityColor } from "@/components/build/rarityTone";
import { subclassTone } from "@/components/build/subclassTone";
import { Badge } from "@/components/ui/Badge";
import { DifficultyToggle } from "@/components/ui/DifficultyToggle";
import type { DataIndexes } from "@/lib/indexing";
import { isExpertOrMasterOnly, refName, resolveRef, wikiUrl } from "@/lib/indexing";
import type { Difficulty } from "@/types/data";
import {
  DIFFICULTY_LABEL,
  DIFFICULTY_ORDER,
  SUB_CLASS_LABEL,
} from "@/types/data";

const CHANCE_KEY: Record<Difficulty, "classic" | "expert" | "master"> = {
  CLASSIC: "classic",
  EXPERT: "expert",
  MASTER: "master",
};

const DAMAGE_TYPE_LABEL: Record<string, string> = {
  MELEE: "Melee",
  RANGED: "Ranged",
  MAGIC: "Magia",
  SUMMON: "Invocación",
};

export function ItemModal({
  targetId,
  indexes,
  difficulty,
  onDifficultyChange,
  checked,
  onToggle,
  onClose,
}: {
  targetId: string;
  indexes: DataIndexes;
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
  checked: (id: string) => boolean;
  onToggle: (id: string) => void;
  onClose: () => void;
}) {
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
        <p className="text-sm text-zinc-400">
          Ítem no encontrado en el dataset (id: {targetId}).
        </p>
      </ModalShell>
    );
  }

  if (ref.kind === "set") {
    const pieceIds = [ref.set.head, ref.set.chest, ref.set.legs].filter(
      (id) => id.length > 0,
    );
    const allChecked = pieceIds.every((id) => checked(id));
    return (
      <ModalShell onClose={onClose}>
        <ModalHeader
          name={ref.set.name}
          badges={<Badge>Set de armadura</Badge>}
          image={`/sets/${ref.set.id}.png`}
        />
        <div className="flex flex-col gap-2 text-sm">
          <p className="text-zinc-400">
            Piezas:{" "}
            <span className="font-medium text-foreground">
              {pieceIds.map((id) => refName(indexes, id)).join(" · ")}
            </span>
          </p>
          <p className="text-zinc-300">{ref.set.bonus}</p>
          {ref.set.note ? (
            <p className="text-xs italic text-zinc-500">{ref.set.note}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onToggle(targetId)}
          className={`mt-4 w-full rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
            allChecked
              ? "border-edge text-foreground"
              : "border-accent/50 bg-accent/10 text-accent hover:bg-accent/20"
          }`}
        >
          {allChecked ? "✓ Piezas conseguidas" : "Marcar piezas como conseguidas"}
        </button>
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
        label: "Daño",
        value: `${stats.damage}${stats.damageType ? ` · ${DAMAGE_TYPE_LABEL[stats.damageType] ?? stats.damageType}` : ""}`,
      });
    if (stats.defense !== undefined) statChips.push({ label: "Defensa", value: String(stats.defense) });
    if (stats.critical !== undefined) statChips.push({ label: "Crítico", value: `${stats.critical}%` });
    if (stats.useTime !== undefined) statChips.push({ label: "Uso", value: String(stats.useTime) });
    if (stats.knockback !== undefined) statChips.push({ label: "Knockback", value: String(stats.knockback) });
    if (stats.mana !== undefined) statChips.push({ label: "Maná", value: String(stats.mana) });
    if (stats.velocity !== undefined) statChips.push({ label: "Velocidad", value: String(stats.velocity) });
    if (stats.rare !== undefined)
      statChips.push({ label: "Rareza", value: String(stats.rare), color: rarityColor(stats.rare) });
    if (stats.autoswing) statChips.push({ label: "Autoswing", value: "Sí" });
    if (stats.sell) statChips.push({ label: "Venta", value: stats.sell });
  }

  return (
    <ModalShell onClose={onClose}>
      <ModalHeader
        name={item.name}
        image={`/items/${item.id}.png`}
        color={stats?.rare !== undefined ? rarityColor(stats.rare) : undefined}
        badges={
          <>
            <Badge>{item.type}</Badge>
            {item.subclass ? (
              <Badge className={subclassTone(item.subclass)}>
                {SUB_CLASS_LABEL[item.subclass]}
              </Badge>
            ) : null}
            {expertOnly ? (
              <Badge tone="accent2" title="Solo disponible en Expert/Master">
                Solo Expert/Master
              </Badge>
            ) : null}
          </>
        }
      />

      <section className="flex flex-col gap-1">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Cómo conseguirlo
        </h4>
        <p className="text-sm text-zinc-300">{item.obtainDescription}</p>
      </section>

      {statChips.length > 0 ? (
        <section className="flex flex-col gap-1.5">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Estadísticas
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
            <p className="text-xs italic text-zinc-500">
              &quot;{stats.tooltip}&quot;
            </p>
          ) : null}
        </section>
      ) : null}

      {drops.length > 0 ? (
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Fuentes de obtención
            </h4>
            <DifficultyToggle value={difficulty} onChange={onDifficultyChange} />
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
                    <span className="text-sm font-medium">{drop.from}</span>
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
                            {DIFFICULTY_LABEL[d]}:{" "}
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
            Crafteo
          </h4>
          <CraftingTree itemId={item.id} indexes={indexes} />
        </section>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onToggle(item.id)}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
            checked(item.id)
              ? "border-edge text-zinc-400"
              : "border-accent/50 bg-accent/10 text-accent hover:bg-accent/20"
          }`}
        >
          {checked(item.id) ? "Marcado como obtenido" : "Marcar como obtenido"}
        </button>
        <a
          href={wikiUrl(item)}
          target="_blank"
          rel="noopener noreferrer"
          className="tg-btn rounded-lg px-3 py-2 text-sm text-zinc-300"
        >
          Wiki ↗
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
          aria-label="Cerrar"
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
