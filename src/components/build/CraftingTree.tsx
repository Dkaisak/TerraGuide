"use client";

import { useMemo } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { ItemSprite } from "@/components/ui/ItemSprite";
import { refName, resolveRef } from "@/lib/indexing";
import type { DataIndexes } from "@/lib/indexing";

const MAX_DEPTH = 3;

interface CraftNode {
  id: string;
  qty: number;
  station?: string;
  depth: number;
  cycle?: boolean;
  children: CraftNode[];
}

export function CraftingTree({
  itemId,
  indexes,
  onOpenItem,
}: {
  itemId: string;
  indexes: DataIndexes;
  onOpenItem?: (id: string) => void;
}) {
  const { t } = useLocale();
  const tree = useMemo(
    () => buildTree(itemId, indexes, new Set<string>(), 0),
    [itemId, indexes],
  );
  const usedIn = useMemo(
    () => (indexes.recipesByIngredient.get(itemId) ?? []).map((r) => r.result),
    [itemId, indexes],
  );

  if (!tree) {
    return <p className="text-xs text-zinc-500">{t("craft.none")}</p>;
  }

  const needsIngredients = tree.children.length > 0;

  return (
    <div className="flex flex-col gap-3">
      {needsIngredients ? (
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t("craft.requires")}
          </h4>
          <ul className="flex flex-col gap-2 pl-0">
            <CraftChildren node={tree} indexes={indexes} onOpenItem={onOpenItem} />
          </ul>
        </div>
      ) : null}

      {usedIn.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t("craft.usedIn")}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {usedIn.map((id) => (
              <UsedInChip key={id} id={id} indexes={indexes} onOpenItem={onOpenItem} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CraftChildren({
  node,
  indexes,
  onOpenItem,
}: {
  node: CraftNode;
  indexes: DataIndexes;
  onOpenItem?: (id: string) => void;
}) {
  const { t } = useLocale();
  return (
    <>
      {node.children.map((child, i) => (
        <li key={`${child.id}-${i}`} className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {child.qty > 1 ? (
              <span className="font-mono text-xs text-zinc-500">{child.qty}×</span>
            ) : null}
            <ItemLabel
              id={child.id}
              indexes={indexes}
              onOpenItem={onOpenItem}
              cycle={child.cycle}
            />
            {child.station ? (
              <span className="text-[11px] text-zinc-500">
                {t("craft.at", { station: child.station })}
              </span>
            ) : null}
          </div>
          {child.children.length > 0 ? (
            <ul className="flex flex-col gap-1.5 border-l border-edge pl-4">
              <CraftChildren node={child} indexes={indexes} onOpenItem={onOpenItem} />
            </ul>
          ) : null}
        </li>
      ))}
    </>
  );
}

function ItemLabel({
  id,
  indexes,
  onOpenItem,
  cycle,
}: {
  id: string;
  indexes: DataIndexes;
  onOpenItem?: (id: string) => void;
  cycle?: boolean;
}) {
  const { t } = useLocale();
  const name = refName(indexes, id);
  if (cycle) {
    return (
      <span className="text-xs italic text-amber-300">
        {t("craft.cycle", { name })}
      </span>
    );
  }

  const ref = resolveRef(indexes, id);
  const exists = ref?.kind === "item" || ref?.kind === "set";
  const inner = (
    <>
      <ItemSprite itemId={id} fallback={name.charAt(0).toUpperCase()} size="sm" />
      <span className="font-medium">{name}</span>
    </>
  );

  if (!onOpenItem || !exists) {
    return <span className="flex items-center gap-2 text-foreground/90">{inner}</span>;
  }

  return (
    <button
      type="button"
      onClick={() => onOpenItem(id)}
      title={t("common.view", { name })}
      className="flex cursor-pointer items-center gap-2 rounded text-foreground/90 transition-colors hover:text-accent"
    >
      {inner}
    </button>
  );
}

function UsedInChip({
  id,
  indexes,
  onOpenItem,
}: {
  id: string;
  indexes: DataIndexes;
  onOpenItem?: (id: string) => void;
}) {
  const { t } = useLocale();
  const name = refName(indexes, id);
  const ref = resolveRef(indexes, id);
  const exists = ref?.kind === "item" || ref?.kind === "set";
  const base =
    "inline-flex items-center gap-1 rounded border border-accent-2/40 bg-accent-2/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-2";

  if (!onOpenItem || !exists) {
    return <span className={base}>{name}</span>;
  }

  return (
    <button
      type="button"
      onClick={() => onOpenItem(id)}
      title={t("common.view", { name })}
      className={`${base} cursor-pointer transition-colors hover:border-accent-2 hover:bg-accent-2/20`}
    >
      {name}
    </button>
  );
}

function buildTree(
  id: string,
  indexes: DataIndexes,
  visited: Set<string>,
  depth: number,
): CraftNode | null {
  const recipes = indexes.recipesByResult.get(id);
  if (!recipes || recipes.length === 0) return null;
  if (depth >= MAX_DEPTH) {
    return { id, qty: 1, depth, children: [] };
  }
  if (visited.has(id)) {
    return { id, qty: 1, cycle: true, depth, children: [] };
  }

  const nextVisited = new Set(visited);
  nextVisited.add(id);

  const recipe = recipes[0];
  const children: CraftNode[] = recipe.ingredients
    .map((ing) => {
      const child = buildTree(ing.item, indexes, nextVisited, depth + 1);
      return child
        ? { ...child, qty: ing.qty }
        : { id: ing.item, qty: ing.qty, depth: depth + 1, children: [] };
    })
    .filter((child): child is CraftNode => child !== null);

  return {
    id,
    qty: recipe.qty,
    station: recipe.station,
    depth,
    children,
  };
}
