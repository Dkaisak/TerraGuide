"use client";

import { useMemo, useState } from "react";
import { ItemCard } from "@/components/build/ItemCard";
import { ItemModal } from "@/components/build/ItemModal";
import { SubclassPicker } from "@/components/build/SubclassPicker";
import { subclassTone } from "@/components/build/subclassTone";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { Badge } from "@/components/ui/Badge";
import { ItemSprite } from "@/components/ui/ItemSprite";
import { useChecklist } from "@/hooks/useChecklist";
import { usePersistedState } from "@/hooks/usePersistedState";
import { DIFFICULTY_STORAGE_KEY } from "@/lib/storage";
import { buildIndexes } from "@/lib/indexing";
import type { DataIndexes } from "@/lib/indexing";
import { mergeSlots, refName, resolveRef, isExpertOrMasterOnly, computeMaterials } from "@/lib/indexing";
import {
  buildIntro,
  buildStartGuide,
  buildTitle,
  slotWhy,
  stageTips as stageTipsOf,
  stageTitle,
  variantText,
} from "@/lib/dataI18n";
import type { MessageKey } from "@/lib/i18n";
import type {
  Build,
  BuildSlot,
  BuildSlotType,
  Difficulty,
  GameStage,
  SlimDataset,
  Stage,
  Subclass,
} from "@/types/data";
import { sourceZone, zoneRank } from "@/lib/zones";

const SLOT_COLUMNS: { titleKey: MessageKey; slots: BuildSlotType[] }[][] = [
  [
    { titleKey: "build.group.armor", slots: ["HELMET", "CHEST", "LEGS", "SET_BONUS"] },
    { titleKey: "build.group.utility", slots: ["BUFF", "AMMO"] },
  ],
  [{ titleKey: "build.group.weapons", slots: ["WEAPON", "WEAPON_ALT", "MINION", "WHIP"] }],
  [{ titleKey: "build.group.accessories", slots: ["ACCESSORY", "ACCESSORY_ALT"] }],
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
  previousStage,
  stage,
  dataset,
}: {
  build: Build;
  previousBuild?: Build;
  previousStage?: Stage;
  stage?: Stage;
  dataset: SlimDataset;
}) {
  const { locale, t, classLabel, stageLabel, subclassLabel } = useLocale();
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

  const farmRoute = useMemo(() => {
    const targets = new Set<string>();
    for (const slot of slots) {
      const id = slot.item;
      if (!id || !indexes.items.has(id)) continue;
      const hasRecipe = (indexes.recipesByResult.get(id)?.length ?? 0) > 0;
      if (!hasRecipe) targets.add(id);
    }
    for (const m of materials) targets.add(m.itemId);

    const byZone = new Map<string, Map<string, { from: string; chance?: string }[]>>();
    for (const id of targets) {
      for (const drop of indexes.dropsByItem.get(id) ?? []) {
        const zone = sourceZone(drop.from);
        let items = byZone.get(zone);
        if (!items) {
          items = new Map();
          byZone.set(zone, items);
        }
        let sources = items.get(id);
        if (!sources) {
          sources = [];
          items.set(id, sources);
        }
        sources.push({ from: drop.from, chance: drop.chance?.classic ?? drop.price });
      }
    }

    return [...byZone.entries()]
      .map(([zone, items]) => ({
        zone,
        items: [...items.entries()].map(([itemId, sources]) => ({ itemId, sources })),
      }))
      .sort((a, b) => zoneRank(a.zone) - zoneRank(b.zone));
  }, [slots, materials, indexes]);

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

  const startGuide = buildStartGuide(locale, build);
  const tips = stage ? stageTipsOf(locale, stage) : [];
  const variantLabel = variant
    ? variantText(locale, build.classType, variant.subclass, {
        title: variant.title,
        intro: variant.intro,
      })
    : undefined;

  return (
    <div>
      <header className="mb-4 border-b border-edge pb-3">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          <span>{classLabel(build.classType)}</span>
          <span>·</span>
          <span>{stageLabel(build.stage)}</span>
          {activeSubclass ? (
            <>
              <span>·</span>
              <Badge className={subclassTone(activeSubclass)}>
                {subclassLabel(activeSubclass)}
              </Badge>
            </>
          ) : null}
        </div>
        <h1 className="tg-title mt-1 text-2xl font-bold">{buildTitle(locale, build)}</h1>
        <p className="mt-0.5 max-w-3xl text-sm text-zinc-400">
          {buildIntro(locale, build)}
        </p>

        {startGuide.length > 0 ? (
          <div className="mt-3 max-w-3xl rounded-lg border border-edge bg-surface px-3 py-2">
            <h2 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-accent">
              {t("build.startGuideTitle")}
            </h2>
            <ol className="flex flex-col gap-1 text-sm text-zinc-300">
              {startGuide.map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span className="shrink-0 font-mono text-xs text-zinc-600">
                    {i + 1}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {tips.length > 0 ? (
          <div className="mt-3 max-w-3xl rounded-lg border border-edge bg-surface px-3 py-2">
            <h2 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-accent-2">
              {t("build.arenaTitle")}
            </h2>
            <ul className="flex flex-col gap-1 text-sm text-zinc-300">
              {tips.map((tip, i) => (
                <li key={i} className="flex gap-2">
                  <span className="shrink-0 text-accent-2">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </header>

      <SubclassPicker
        build={build}
        selected={activeSubclass}
        onChange={setSelectedSubclass}
      />

      {variantLabel?.title ? (
        <section className="mb-4">
          <div className="flex flex-col gap-1 rounded-lg border border-edge-2 bg-surface px-3 py-1.5">
            <span className="text-sm font-semibold text-accent">{variantLabel.title}</span>
            {variantLabel.intro ? (
              <span className="text-xs text-zinc-400">{variantLabel.intro}</span>
            ) : null}
          </div>
        </section>
      ) : null}

      {orderHint.length > 0 ? (
        <section className="mb-4">
          <h2 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t("build.orderTitle")}
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {SLOT_COLUMNS.map((column, ci) => (
          <div key={ci} className="flex flex-col gap-4">
            {column.map((group) => {
              const statuses = slotStatuses.filter((s) =>
                group.slots.includes(s.slot.slot),
              );
              if (statuses.length === 0) return null;
              return (
                <section key={group.titleKey}>
                  <h2 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {t(group.titleKey)}
                  </h2>
                  <div className="flex flex-col gap-1.5">
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
        ))}
      </div>

      {materials.length > 0 ? (
        <section className="mt-5">
          <h2 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t("build.materialsTitle")}
          </h2>
          <p className="mb-2 text-xs text-zinc-600">{t("build.materialsIntro")}</p>
          <div className="flex flex-wrap gap-2">
            {materials.map((m) => (
              <button
                key={m.itemId}
                type="button"
                onClick={() => setModalId(m.itemId)}
                title={t("common.view", { name: refName(indexes, m.itemId) })}
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

      {farmRoute.length > 0 ? (
        <section className="mt-5">
          <h2 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t("build.farmTitle")}
          </h2>
          <p className="mb-2 text-xs text-zinc-600">{t("build.farmIntro")}</p>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {farmRoute.map(({ zone, items }) => (
              <div key={zone} className="tg-surface rounded-lg p-3">
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-accent">
                  {zone}
                </h3>
                <ul className="flex flex-col gap-2">
                  {items.map(({ itemId, sources }) => (
                    <li key={itemId} className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => setModalId(itemId)}
                        title={t("common.view", { name: refName(indexes, itemId) })}
                        className="flex shrink-0 items-center gap-1.5 text-xs font-medium transition-colors hover:text-accent"
                      >
                        <ItemSprite
                          itemId={itemId}
                          fallback={refName(indexes, itemId).charAt(0).toUpperCase()}
                          size="sm"
                        />
                        <span>{refName(indexes, itemId)}</span>
                      </button>
                      <span className="min-w-0 flex-1 text-[11px] leading-snug text-zinc-500">
                        {sources.map((s, i) => (
                          <span
                            key={`${s.from}-${i}`}
                            className="block truncate"
                            title={`${s.from}${s.chance ? ` · ${s.chance}` : ""}`}
                          >
                            {s.from}
                            {s.chance ? (
                              <span className="text-accent"> · {s.chance}</span>
                            ) : null}
                          </span>
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {previousBuild && (changes.added.length > 0 || changes.removed.length > 0) ? (
        <section className="mt-5">
          <h2 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t("build.changesTitle", {
              stage: previousStage
                ? stageTitle(locale, previousStage)
                : t("build.changesFallback"),
            })}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {changes.added.length > 0 ? (
              <div>
                <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-accent">
                  {t("build.new")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {changes.added.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setModalId(id)}
                      title={t("common.view", { name: refName(indexes, id) })}
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
                  {t("build.removed")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {changes.removed.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setModalId(id)}
                      title={t("common.view", { name: refName(indexes, id) })}
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
          key={modalId}
          targetId={modalId}
          indexes={indexes}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          checked={checklist.has}
          onToggle={checklist.toggle}
          onOpenItem={(id) => setModalId(id)}
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
  const { locale, slotLabel } = useLocale();
  const ref = resolveRef(indexes, slot.item);
  if (!ref) return null;
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
          {slotLabel(slot.slot)}
        </span>
        {slot.qty && slot.qty > 1 ? (
          <span className="font-mono text-[10px] text-zinc-600">×{slot.qty}</span>
        ) : null}
      </div>
      <ItemCard
        slotRef={ref}
        note={slotWhy(locale, slot)}
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
