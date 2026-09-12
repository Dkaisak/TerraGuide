import type { ClassType, Item } from "@/types/data";

// Mejor reforge de arma según la clase.
export function bestWeaponReforge(classType: ClassType): string {
  switch (classType) {
    case "MELEE":
      return "legendary";
    case "RANGED":
      return "unreal";
    case "MAGIC":
      return "mythical";
    case "SUMMONER":
      return "fabled";
    default:
      return "godly";
  }
}

// Mejor reforge de accesorio con criterio: refuerza el stat propio del accesorio
// y, si no tiene modificadores parseados, usa su rol.
export function recommendAccessoryReforge(item: Item, classType: ClassType): string {
  // El rol manda para defensa y movilidad.
  if (item.role === "DEFENSIVO") return "warding";
  if (item.role === "MOVILIDAD") return "quick";

  const m = item.modifiers;
  if (m) {
    if (m.meleeSpeed) return "violent"; // velocidad de ataque melee
    if (m.damageAll || m.damageMelee || m.damageRanged || m.damageMagic || m.damageSummon) {
      return "menacing";
    }
    if (
      classType !== "SUMMONER" &&
      (m.critAll || m.critMelee || m.critRanged || m.critMagic || m.critSummon)
    ) {
      return "lucky"; // los minions no crítican
    }
    if (m.manaMax || m.manaCost) return "arcane";
    if (m.defense) return "warding";
    if (m.moveSpeed) return "quick";
  }

  if (item.role === "UTILIDAD") return classType === "MAGIC" ? "arcane" : "menacing";
  return "menacing";
}
