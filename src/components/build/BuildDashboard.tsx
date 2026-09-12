"use client";

import { useMemo, useState } from "react";
import { ItemCard } from "@/components/build/ItemCard";
import { ItemModal } from "@/components/build/ItemModal";
import { SubclassPicker } from "@/components/build/SubclassPicker";
import { subclassTone } from "@/components/build/subclassTone";
import { Badge } from "@/components/ui/Badge";
import { ItemSprite } from "@/components/ui/ItemSprite";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useChecklist } from "@/hooks/useChecklist";
import { usePersistedState } from "@/hooks/usePersistedState";
import { DIFFICULTY_STORAGE_KEY } from "@/lib/storage";
import { buildIndexes } from "@/lib/indexing";
import type { DataIndexes } from "@/lib/indexing";
import { mergeSlots, refName, resolveRef, isExpertOrMasterOnly, computeMaterials } from "@/lib/indexing";
import type {
  Build,
  BuildSlot,
  BuildSlotType,
  Difficulty,
  GameStage,
  SlimDataset,
  Subclass,
} from "@/types/data";
import { CLASS_LABEL, DIFFICULTY_LABEL, SLOT_LABEL, STAGE_LABEL, SUB_CLASS_LABEL } from "@/types/data";

const SLOT_GROUPS: { title: string; slots: BuildSlotType[] }[] = [
  { title: "Armadura", slots: ["HELMET", "CHEST", "LEGS", "SET_BONUS"] },
  { title: "Armas", slots: ["WEAPON", "WEAPON_ALT", "MINION", "WHIP"] },
  { title: "Accesorios", slots: ["ACCESSORY", "ACCESSORY_ALT"] },
  { title: "Utilidad", slots: ["BUFF", "AMMO"] },
];

const POST_WOF_STAGES: GameStage[] = [
  "PRE_MECH_BOSSES",
  "PRE_PLANTERA",
  "PRE_GOLEM",
  "PRE_LUNAR_EVENTS",
  "PRE_MOON_LORD",
  "POST_MOON_LORD",
];

// Huecos de accesorio: Clásico 5; Experto 5→6 (Demon Heart, post-WoF); Maestro 6→7.
function accessoryCap(difficulty: Difficulty, stage: GameStage): number {
  const postWof = POST_WOF_STAGES.includes(stage);
  if (difficulty === "CLASSIC") return 5;
  if (difficulty === "EXPERT") return postWof ? 6 : 5;
  return postWof ? 7 : 6;
}

function applyDifficulty(
  slots: BuildSlot[],
  difficulty: Difficulty,
  stage: GameStage,
  indexes: DataIndexes,
): BuildSlot[] {
  const cap = accessoryCap(difficulty, stage);
  let accCount = 0;
  const out: BuildSlot[] = [];
  for (const slot of slots) {
    let primary = slot.item;
    let alts = slot.alternatives ?? [];
    if (difficulty === "CLASSIC") {
      const isExp = (id?: string) => Boolean(id) && isExpertOrMasterOnly(indexes, id as string);
      if (isExp(primary)) {
        const alt = alts.find((a) => !isExp(a));
        if (!alt) continue;
        primary = alt;
        alts = alts.filter((a) => a !== alt && !isExp(a));
      } else {
        alts = alts.filter((a) => !isExp(a));
      }
    }
    if (slot.slot === "ACCESSORY") {
      if (accCount >= cap) continue;
      accCount++;
    }
    const next: BuildSlot = { ...slot, item: primary };
    if (alts.length > 0) next.alternatives = alts;
    else delete next.alternatives;
    out.push(next);
  }
  return out;
}

function effectiveSlots(
  build: Build,
  subclass: Subclass | undefined,
  difficulty: Difficulty,
  indexes: DataIndexes,
): BuildSlot[] {
  const variant = build.subclassSlots?.find((v) => v.subclass === subclass);
  const base = variant ? mergeSlots(build.slots, variant.slots) : build.slots;
  return applyDifficulty(base, difficulty, build.stage, indexes);
}

export function BuildDashboard({
  build,
  previousBuild,
  previousStageTitle,
  dataset,
}: {
  build: Build;
  previousBuild?: Build;
  previousStageTitle?: string;
  dataset: SlimDataset;
}) {
  const indexes = useMemo(
    () => buildIndexes({ ...dataset, stages: [], builds: [] }),
    [dataset],
  );
  const checklist = useChecklist();
  const [difficulty, setDifficulty] = usePersistedState<Difficulty>(
    DIFFICULTY_STORAGE_KEY,
    "CLASSIC",
  );
  const [modalId, setModalId] = useState<string | null>(null);
  const [selectedSubclass, setSelectedSubclass] = useState<Subclass | undefined>(
    build.subclass,
  );

  const variant = build.subclassSlots?.find(
    (v) => v.subclass === selectedSubclass,
  );
  const activeSubclass = selectedSubclass ?? build.subclass;

  const slots = useMemo(() => {
    const base = variant ? mergeSlots(build.slots, variant.slots) : build.slots;
    return applyDifficulty(base, difficulty, build.stage, indexes);
  }, [build, variant, difficulty, indexes]);

  const orderHint =
    variant && variant.orderHint && variant.orderHint.length > 0
      ? variant.orderHint
      : build.orderHint;

  const materials = useMemo(() => {
    const ids = slots
      .map((s) => s.item)
      .filter((id): id is string => Boolean(id) && indexes.items.has(id as string));
    return computeMaterials(ids, indexes);
  }, [slots, indexes]);

  const accessorySlots = accessoryCap(difficulty, build.stage);
  const expertOnlyNames = useMemo(() => {
    const raw = variant ? mergeSlots(build.slots, variant.slots) : build.slots;
    const ids = new Set<string>();
    for (const s of raw) {
      for (const id of [s.item, ...(s.alternatives ?? [])]) {
        if (id && indexes.items.has(id) && isExpertOrMasterOnly(indexes, id)) ids.add(id);
      }
    }
    return [...ids].map((id) => refName(indexes, id));
  }, [build, variant, indexes]);

  const changes = useMemo(() => {
    if (!previousBuild) return { added: [] as string[], removed: [] as string[] };
    const prev = effectiveSlots(previousBuild, activeSubclass, difficulty, indexes);
    const prevIds = new Set(prev.map((s) => s.item).filter((id): id is string => Boolean(id)));
    const curIds = new Set(slots.map((s) => s.item).filter((id): id is string => Boolean(id)));
    return {
      added: [...curIds].filter((id) => !prevIds.has(id) && indexes.items.has(id)),
      removed: [...prevIds].filter((id) => !curIds.has(id) && indexes.items.has(id)),
    };
  }, [previousBuild, activeSubclass, difficulty, indexes, slots]);

  const slotStatuses = slots.map((slot) => ({
    slot,
    done: isSlotDone(slot, indexes, checklist.has),
  }));

  const totalSlots = slotStatuses.length;
  const doneCount = slotStatuses.filter((s) => s.done).length;
  const pct = totalSlots > 0 ? Math.round((doneCount / totalSlots) * 100) : 0;
  const allDone = totalSlots > 0 && doneCount === totalSlots;

  const nextPending = slotStatuses.find((s) => !s.done);
  const nextName = allDone
    ? "¡Loadout completado!"
    : nextPending?.slot.item
      ? refName(indexes, nextPending.slot.item)
      : null;

  const handleToggle = (slot: BuildSlot) => {
    const ref = resolveRef(indexes, slot.item);
    if (!ref) return;
    if (ref.kind === "set") {
      const pieceIds = [ref.set.head, ref.set.chest, ref.set.legs].filter(
        (id) => id.length > 0,
      );
      const add = !pieceIds.every((id) => checklist.has(id));
      checklist.setMany(pieceIds, add);
    } else if (ref.kind === "item") {
      checklist.toggle(ref.item.id);
    }
  };

  return (
    <div>
      <header className="mb-6 border-b border-edge pb-5">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          <span>{CLASS_LABEL[build.classType]}</span>
          <span>·</span>
          <span>{STAGE_LABEL[build.stage]}</span>
          {activeSubclass ? (
            <>
              <span>·</span>
              <Badge className={subclassTone(activeSubclass)}>
                {SUB_CLASS_LABEL[activeSubclass]}
              </Badge>
            </>
          ) : null}
        </div>
        <h1 className="tg-title mt-2 text-2xl font-bold">{build.title}</h1>
        <p className="mt-1 max-w-3xl text-sm text-zinc-400">{build.intro}</p>

        <div className="mt-4 max-w-md">
          <div className="mb-1 flex items-center justify-between text-xs text-zinc-400">
            <span>Progreso del loadout</span>
            <span className="flex items-center gap-2">
              <span className="font-mono">
                {doneCount}/{totalSlots} obtenidos
              </span>
              {doneCount > 0 ? (
                <button
                  type="button"
                  onClick={checklist.clear}
                  className="text-[11px] text-zinc-600 transition-colors hover:text-zinc-300"
                >
                  reiniciar
                </button>
              ) : null}
            </span>
          </div>
          <ProgressBar value={pct} />
          <p className="mt-1 text-[11px] text-zinc-600">
            Marca los ítems que consigas: el progreso se guarda en tu navegador
            y es compartido entre todas las builds.
          </p>
        </div>

        <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-accent">
            {allDone ? "Estado" : "Siguiente objetivo"}
          </span>
          <span className="font-semibold">{nextName ?? "—"}</span>
        </div>
      </header>

      <div className="tg-surface mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg px-3 py-2 text-xs text-zinc-400">
        <span>
          Huecos de accesorio:{" "}
          <span className="font-semibold text-foreground">{accessorySlots}</span>{" "}
          ({DIFFICULTY_LABEL[difficulty]})
        </span>
        {expertOnlyNames.length > 0 ? (
          <span>
            {difficulty === "CLASSIC" ? "Ocultos en Clásico" : "Solo Expert/Master"}:{" "}
            <span className="text-accent2">{expertOnlyNames.join(", ")}</span>
          </span>
        ) : null}
      </div>

      <SubclassPicker
        build={build}
        selected={activeSubclass}
        onChange={setSelectedSubclass}
      />

      {variant?.title ? (
        <section className="mb-6">
          <div className="flex flex-col gap-1 rounded-lg border border-edge-2 bg-surface px-3 py-2">
            <span className="text-sm font-semibold text-accent">{variant.title}</span>
            {variant.intro ? (
              <span className="text-xs text-zinc-400">{variant.intro}</span>
            ) : null}
          </div>
        </section>
      ) : null}

      {orderHint.length > 0 ? (
        <section className="mb-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Orden recomendado
          </h2>
          <ol className="flex flex-wrap gap-2">
            {orderHint.map((id, i) => (
              <li
                key={`${id}-${i}`}
                className="rounded-md border border-edge bg-surface px-2 py-1 text-xs text-zinc-300"
              >
                <span className="mr-1 font-mono text-zinc-600">{i + 1}.</span>
                {refName(indexes, id)}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {SLOT_GROUPS.map((group) => {
          const statuses = slotStatuses.filter((s) =>
            group.slots.includes(s.slot.slot),
          );
          if (statuses.length === 0) return null;
          return (
            <section key={group.title}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {group.title}
              </h2>
              <div className="flex flex-col gap-2">
                {statuses.map(({ slot, done }) => (
                  <SlotCard
                    key={slot.slot + slot.item}
                    slot={slot}
                    checked={done}
                    indexes={indexes}
                    onToggle={() => handleToggle(slot)}
                    onOpen={() => setModalId(slot.item ?? null)}
                    onOpenItem={(id) => setModalId(id)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {materials.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Lista de materiales
          </h2>
          <p className="mb-3 text-xs text-zinc-600">
            Materiales e ingredientes necesarios para craftear los ítems de esta build (incluye ingredientes que se obtienen por botín).
          </p>
          <div className="flex flex-wrap gap-2">
            {materials.map((m) => (
              <button
                key={m.itemId}
                type="button"
                onClick={() => setModalId(m.itemId)}
                title={`Ver ${refName(indexes, m.itemId)}`}
                className="flex items-center gap-1.5 rounded-lg border border-edge bg-surface px-2 py-1 text-xs transition-colors hover:border-accent/60 hover:text-accent"
              >
                <ItemSprite
                  itemId={m.itemId}
                  fallback={refName(indexes, m.itemId).charAt(0).toUpperCase()}
                  size="sm"
                />
                <span className="font-medium">{refName(indexes, m.itemId)}</span>
                <span className="font-mono text-accent">×{m.qty}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {previousBuild && (changes.added.length > 0 || changes.removed.length > 0) ? (
        <section className="mt-8">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Cambios desde {previousStageTitle ?? "la fase anterior"}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {changes.added.length > 0 ? (
              <div>
                <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-accent">
                  Nuevo
                </h3>
                <div className="flex flex-wrap gap-2">
                  {changes.added.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setModalId(id)}
                      title={`Ver ${refName(indexes, id)}`}
                      className="flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/5 px-2 py-1 text-xs transition-colors hover:border-accent hover:text-accent"
                    >
                      <ItemSprite itemId={id} fallback={refName(indexes, id).charAt(0).toUpperCase()} size="sm" />
                      <span className="font-medium">{refName(indexes, id)}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {changes.removed.length > 0 ? (
              <div>
                <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                  Ya no se usa
                </h3>
                <div className="flex flex-wrap gap-2">
                  {changes.removed.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setModalId(id)}
                      title={`Ver ${refName(indexes, id)}`}
                      className="flex items-center gap-1.5 rounded-lg border border-edge bg-surface px-2 py-1 text-xs text-zinc-500 transition-colors hover:border-accent/60 hover:text-accent"
                    >
                      <ItemSprite itemId={id} fallback={refName(indexes, id).charAt(0).toUpperCase()} size="sm" />
                      <span className="font-medium">{refName(indexes, id)}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {modalId ? (
        <ItemModal
          targetId={modalId}
          indexes={indexes}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          checked={checklist.has}
          onToggle={checklist.toggle}
          onClose={() => setModalId(null)}
        />
      ) : null}
    </div>
  );
}

function isSlotDone(
  slot: BuildSlot,
  indexes: DataIndexes,
  has: (id: string) => boolean,
): boolean {
  const candidates = [slot.item, ...(slot.alternatives ?? [])].filter(
    (id): id is string => Boolean(id),
  );
  if (candidates.length === 0) return true;
  return candidates.some((id) => {
    const ref = resolveRef(indexes, id);
    if (!ref) return false;
    if (ref.kind === "item") return has(ref.item.id);
    if (ref.kind === "set") {
      const pieces = [ref.set.head, ref.set.chest, ref.set.legs].filter(
        (p) => p.length > 0,
      );
      return pieces.length > 0 && pieces.every((p) => has(p));
    }
    return false;
  });
}

function SlotCard({
  slot,
  checked,
  indexes,
  onToggle,
  onOpen,
  onOpenItem,
}: {
  slot: BuildSlot;
  checked: boolean;
  indexes: DataIndexes;
  onToggle: () => void;
  onOpen: () => void;
  onOpenItem: (id: string) => void;
}) {
  const ref = resolveRef(indexes, slot.item);
  if (!ref) return null;
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
          {SLOT_LABEL[slot.slot]}
        </span>
        {slot.qty && slot.qty > 1 ? (
          <span className="font-mono text-[10px] text-zinc-600">×{slot.qty}</span>
        ) : null}
      </div>
      <ItemCard
        slotRef={ref}
        note={slot.why}
        alternatives={slot.alternatives}
        qty={slot.qty}
        reforge={slot.reforge}
        checked={checked}
        onToggle={onToggle}
        onOpen={onOpen}
        onOpenItem={onOpenItem}
        indexes={indexes}
      />
    </div>
  );
}