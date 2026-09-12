import type { ClassType } from "@/types/data";

export interface WeaponModifier {
  id: string;
  name: string;
  applies: "UNIVERSAL" | "COMMON" | "MELEE" | "RANGED" | "MAGIC" | "SUMMON";
  damage: number;
  crit: number;
  speed: number;
  knockback: number;
  size: number;
  velocity: number;
  manaCost: number;
}

// Modificadores de armas (Goblin Tinkerer), Terraria 1.4.5.7.
// Se omiten los claramente negativos; se listan los útiles.
export const WEAPON_MODIFIERS: WeaponModifier[] = [
  { id: "none", name: "Sin modificar", applies: "UNIVERSAL", damage: 0, crit: 0, speed: 0, knockback: 0, size: 0, velocity: 0, manaCost: 0 },
  // Universales
  { id: "godly", name: "Godly", applies: "UNIVERSAL", damage: 15, crit: 5, speed: 0, knockback: 15, size: 0, velocity: 0, manaCost: 0 },
  { id: "demonic", name: "Demonic", applies: "UNIVERSAL", damage: 15, crit: 5, speed: 0, knockback: 0, size: 0, velocity: 0, manaCost: 0 },
  { id: "superior", name: "Superior", applies: "UNIVERSAL", damage: 10, crit: 3, speed: 0, knockback: 10, size: 0, velocity: 0, manaCost: 0 },
  { id: "ruthless", name: "Ruthless", applies: "UNIVERSAL", damage: 18, crit: 0, speed: 0, knockback: -10, size: 0, velocity: 0, manaCost: 0 },
  { id: "hurtful", name: "Hurtful", applies: "UNIVERSAL", damage: 10, crit: 0, speed: 0, knockback: 0, size: 0, velocity: 0, manaCost: 0 },
  { id: "keen", name: "Keen", applies: "UNIVERSAL", damage: 0, crit: 3, speed: 0, knockback: 0, size: 0, velocity: 0, manaCost: 0 },
  { id: "zealous", name: "Zealous", applies: "UNIVERSAL", damage: 0, crit: 5, speed: 0, knockback: 0, size: 0, velocity: 0, manaCost: 0 },
  { id: "forceful", name: "Forceful", applies: "UNIVERSAL", damage: 0, crit: 0, speed: 0, knockback: 15, size: 0, velocity: 0, manaCost: 0 },
  { id: "strong", name: "Strong", applies: "UNIVERSAL", damage: 0, crit: 0, speed: 0, knockback: 15, size: 0, velocity: 0, manaCost: 0 },
  { id: "unpleasant", name: "Unpleasant", applies: "UNIVERSAL", damage: 5, crit: 0, speed: 0, knockback: 15, size: 0, velocity: 0, manaCost: 0 },
  // Comunes (melee/ranged/magic)
  { id: "deadly-common", name: "Deadly", applies: "COMMON", damage: 10, crit: 0, speed: 10, knockback: 0, size: 0, velocity: 0, manaCost: 0 },
  { id: "quick", name: "Quick", applies: "COMMON", damage: 0, crit: 0, speed: 10, knockback: 0, size: 0, velocity: 0, manaCost: 0 },
  { id: "agile", name: "Agile", applies: "COMMON", damage: 0, crit: 3, speed: 10, knockback: 0, size: 0, velocity: 0, manaCost: 0 },
  { id: "murderous", name: "Murderous", applies: "COMMON", damage: 7, crit: 3, speed: 6, knockback: 0, size: 0, velocity: 0, manaCost: 0 },
  { id: "nimble", name: "Nimble", applies: "COMMON", damage: 0, crit: 0, speed: 5, knockback: 0, size: 0, velocity: 0, manaCost: 0 },
  { id: "nasty", name: "Nasty", applies: "COMMON", damage: 5, crit: 2, speed: 10, knockback: -10, size: 0, velocity: 0, manaCost: 0 },
  // Melee
  { id: "legendary", name: "Legendary", applies: "MELEE", damage: 15, crit: 5, speed: 10, knockback: 15, size: 10, velocity: 0, manaCost: 0 },
  { id: "savage", name: "Savage", applies: "MELEE", damage: 10, crit: 0, speed: 0, knockback: 10, size: 10, velocity: 0, manaCost: 0 },
  { id: "sharp", name: "Sharp", applies: "MELEE", damage: 15, crit: 0, speed: 0, knockback: 0, size: 0, velocity: 0, manaCost: 0 },
  { id: "pointy", name: "Pointy", applies: "MELEE", damage: 10, crit: 0, speed: 0, knockback: 0, size: 0, velocity: 0, manaCost: 0 },
  { id: "dangerous", name: "Dangerous", applies: "MELEE", damage: 5, crit: 2, speed: 0, knockback: 0, size: 5, velocity: 0, manaCost: 0 },
  { id: "light", name: "Light", applies: "MELEE", damage: 0, crit: 0, speed: 15, knockback: -10, size: 0, velocity: 0, manaCost: 0 },
  { id: "large", name: "Large", applies: "MELEE", damage: 0, crit: 0, speed: 0, knockback: 0, size: 12, velocity: 0, manaCost: 0 },
  { id: "massive", name: "Massive", applies: "MELEE", damage: 0, crit: 0, speed: 0, knockback: 0, size: 18, velocity: 0, manaCost: 0 },
  // Ranged
  { id: "unreal", name: "Unreal", applies: "RANGED", damage: 15, crit: 5, speed: 10, knockback: 15, size: 0, velocity: 10, manaCost: 0 },
  { id: "rapid", name: "Rapid", applies: "RANGED", damage: 0, crit: 0, speed: 15, knockback: 0, size: 0, velocity: 10, manaCost: 0 },
  { id: "hasty", name: "Hasty", applies: "RANGED", damage: 0, crit: 0, speed: 10, knockback: 0, size: 0, velocity: 15, manaCost: 0 },
  { id: "deadly-ranged", name: "Deadly", applies: "RANGED", damage: 10, crit: 2, speed: 5, knockback: 5, size: 0, velocity: 5, manaCost: 0 },
  { id: "sighted", name: "Sighted", applies: "RANGED", damage: 10, crit: 3, speed: 0, knockback: 0, size: 0, velocity: 0, manaCost: 0 },
  { id: "staunch", name: "Staunch", applies: "RANGED", damage: 10, crit: 0, speed: 0, knockback: 15, size: 0, velocity: 0, manaCost: 0 },
  { id: "intimidating", name: "Intimidating", applies: "RANGED", damage: 0, crit: 0, speed: 0, knockback: 15, size: 0, velocity: 5, manaCost: 0 },
  // Magic
  { id: "mythical", name: "Mythical", applies: "MAGIC", damage: 15, crit: 5, speed: 10, knockback: 15, size: 0, velocity: 0, manaCost: -10 },
  { id: "masterful", name: "Masterful", applies: "MAGIC", damage: 15, crit: 0, speed: 0, knockback: 5, size: 0, velocity: 0, manaCost: -15 },
  { id: "mystic", name: "Mystic", applies: "MAGIC", damage: 10, crit: 0, speed: 0, knockback: 0, size: 0, velocity: 0, manaCost: -15 },
  { id: "adept", name: "Adept", applies: "MAGIC", damage: 0, crit: 0, speed: 0, knockback: 0, size: 0, velocity: 0, manaCost: -15 },
  { id: "celestial", name: "Celestial", applies: "MAGIC", damage: 10, crit: 0, speed: -10, knockback: 10, size: 0, velocity: 0, manaCost: -10 },
  { id: "furious", name: "Furious", applies: "MAGIC", damage: 15, crit: 0, speed: 0, knockback: 15, size: 0, velocity: 0, manaCost: 20 },
  // Summon
  { id: "fabled", name: "Fabled", applies: "SUMMON", damage: 15, crit: 0, speed: 0, knockback: 15, size: 0, velocity: 0, manaCost: 0 },
  { id: "worthy", name: "Worthy", applies: "SUMMON", damage: 15, crit: 0, speed: 0, knockback: 0, size: 0, velocity: 0, manaCost: 0 },
  { id: "loyal", name: "Loyal", applies: "SUMMON", damage: 10, crit: 0, speed: 0, knockback: 5, size: 0, velocity: 0, manaCost: 0 },
  { id: "focused", name: "Focused", applies: "SUMMON", damage: 10, crit: 0, speed: 0, knockback: 0, size: 0, velocity: 0, manaCost: 0 },
  { id: "eager", name: "Eager", applies: "SUMMON", damage: 0, crit: 0, speed: 0, knockback: 0, size: 0, velocity: 0, manaCost: 0 },
  { id: "ballistic", name: "Ballistic", applies: "SUMMON", damage: 0, crit: 0, speed: 0, knockback: 0, size: 0, velocity: 0, manaCost: 0 },
  { id: "rabid", name: "Rabid", applies: "SUMMON", damage: 10, crit: 0, speed: 0, knockback: -10, size: 0, velocity: 0, manaCost: 0 },
];

export const WEAPON_MODIFIER_BY_ID = new Map(WEAPON_MODIFIERS.map((m) => [m.id, m]));

const CLASS_TO_WEAPON: Record<string, WeaponModifier["applies"]> = {
  MELEE: "MELEE",
  RANGED: "RANGED",
  MAGIC: "MAGIC",
  SUMMONER: "SUMMON",
};

export function weaponModifiersFor(classType: ClassType): WeaponModifier[] {
  const target = CLASS_TO_WEAPON[classType];
  return WEAPON_MODIFIERS.filter((m) => {
    if (m.applies === "UNIVERSAL") {
      // Los minions no pueden llevar modificadores universales con crítico.
      if (target === "SUMMON" && m.crit > 0) return false;
      return true;
    }
    if (m.applies === "COMMON") return target !== "SUMMON";
    return m.applies === target;
  });
}
