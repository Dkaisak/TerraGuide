"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/Badge";
import { refName } from "@/lib/indexing";
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
}: {
  itemId: string;
  indexes: DataIndexes;
}) {
  const tree = useMemo(
    () => buildTree(itemId, indexes, new Set<string>(), 0),
    [itemId, indexes],
  );
  const usedIn = useMemo(
    () =>
      (indexes.recipesByIngredient.get(itemId) ?? []).map(
        (r) => refName(indexes, r.result),
      ),
    [itemId, indexes],
  );

  if (!tree) {
    return (
      <p className="text-xs text-zinc-500">
        No tiene receta registrada en el dataset.
      </p>
    );
  }

  const needsIngredients = tree.children.length > 0;

  return (
    <div className="flex flex-col gap-3">
      {needsIngredients ? (
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Requiere
          </h4>
          <ul className="flex flex-col gap-2 pl-0">
            <CraftChildren node={tree} indexes={indexes} />
          </ul>
        </div>
      ) : null}

      {usedIn.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Se usa en
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {usedIn.map((name) => (
              <Badge key={name} tone="accent2">
                {name}
              </Badge>
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
}: {
  node: CraftNode;
  indexes: DataIndexes;
}) {
  return (
    <>
      {node.children.map((child, i) => (
        <li key={`${child.id}-${i}`} className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            {child.cycle ? (
              <span className="text-xs italic text-amber-300">
                {child.id} (ciclo)
              </span>
            ) : (
              <span className="font-medium text-foreground/90">
                {child.qty > 1 ? (
                  <span className="mr-1 font-mono text-xs text-zinc-500">
                    {child.qty}×
                  </span>
                ) : null}
                {refName(indexes, child.id)}
              </span>
            )}
            {child.station ? (
              <span className="text-[11px] text-zinc-500">
                En {child.station}
              </span>
            ) : null}
          </div>
          {child.children.length > 0 ? (
            <ul className="flex flex-col gap-1.5 border-l border-edge pl-4">
              <CraftChildren node={child} indexes={indexes} />
            </ul>
          ) : null}
        </li>
      ))}
    </>
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
      return child ?? { id: ing.item, qty: ing.qty, depth: depth + 1, children: [] };
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