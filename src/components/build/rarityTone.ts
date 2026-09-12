export function rarityColor(rare?: number): string | undefined {
  if (rare === undefined) return undefined;
  if (rare < 0) return "var(--rarity-negative)";
  if (rare <= 11) return `var(--rarity-${rare})`;
  return undefined;
}
