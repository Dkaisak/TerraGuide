import type { ItemModifiers } from "@/types/data";

export interface ReforgeModifier {
  id: string;
  name: string;
  effect: string;
  mods: ItemModifiers;
}

// Modificadores de accesorios (Goblin Tinkerer / "chapucero"), Terraria 1.4.5.8.
export const ACCESSORY_MODIFIERS: ReforgeModifier[] = [
  { id: "none", name: "Sin modificar", effect: "—", mods: {} },
  { id: "warding", name: "Warding", effect: "+4 defensa", mods: { defense: 4 } },
  { id: "menacing", name: "Menacing", effect: "+4% daño", mods: { damageAll: 4 } },
  { id: "lucky", name: "Lucky", effect: "+4% crítico", mods: { critAll: 4 } },
  { id: "quick", name: "Quick", effect: "+4% vel. movimiento", mods: { moveSpeed: 4 } },
  { id: "violent", name: "Violent", effect: "+4% vel. melee", mods: { meleeSpeed: 4 } },
  { id: "arcane", name: "Arcane", effect: "+20 maná", mods: { manaMax: 20 } },
  { id: "armored", name: "Armored", effect: "+3 defensa", mods: { defense: 3 } },
  { id: "guarding", name: "Guarding", effect: "+2 defensa", mods: { defense: 2 } },
  { id: "hard", name: "Hard", effect: "+1 defensa", mods: { defense: 1 } },
  { id: "precise", name: "Precise", effect: "+2% crítico", mods: { critAll: 2 } },
  { id: "angry", name: "Angry", effect: "+3% daño", mods: { damageAll: 3 } },
  { id: "spiked", name: "Spiked", effect: "+2% daño", mods: { damageAll: 2 } },
  { id: "jagged", name: "Jagged", effect: "+1% daño", mods: { damageAll: 1 } },
  { id: "hasty", name: "Hasty", effect: "+3% vel. movimiento", mods: { moveSpeed: 3 } },
  { id: "fleeting", name: "Fleeting", effect: "+2% vel. movimiento", mods: { moveSpeed: 2 } },
  { id: "brisk", name: "Brisk", effect: "+1% vel. movimiento", mods: { moveSpeed: 1 } },
  { id: "intrepid", name: "Intrepid", effect: "+3% vel. melee", mods: { meleeSpeed: 3 } },
  { id: "rash", name: "Rash", effect: "+2% vel. melee", mods: { meleeSpeed: 2 } },
  { id: "wild", name: "Wild", effect: "+1% vel. melee", mods: { meleeSpeed: 1 } },
];

export const ACCESSORY_MODIFIER_BY_ID = new Map(
  ACCESSORY_MODIFIERS.map((m) => [m.id, m]),
);
