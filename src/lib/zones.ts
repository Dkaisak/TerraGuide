/**
 * Agrupa las fuentes de drops (`drop.from`) en zonas/biomas para la "Ruta de
 * farmeo". La mayoría de fuentes se mapean explícitamente; el resto cae en
 * heurísticas por palabra clave (crates, slimes, cofres…).
 */

export const ZONE_ORDER = [
  "Superficie y cielo",
  "Cuevas y cavernas",
  "Inframundo",
  "Jungla",
  "Desierto",
  "Nieve / Tundra",
  "Océano",
  "Corrupción",
  "Carmesí",
  "Hallow",
  "Dungeon",
  "Granito y mármol",
  "Bioma de arañas",
  "Jefes",
  "Eventos",
  "NPCs y tiendas",
  "Pesca (crates)",
  "Otros",
] as const;

const ZONE_BY_SOURCE: Record<string, string> = {
  // Superficie y cielo
  "Angry Dandelion": "Superficie y cielo",
  "Demon Eye": "Superficie y cielo",
  Zombie: "Superficie y cielo",
  "Raincoat Zombie": "Superficie y cielo",
  "Wandering Eye": "Superficie y cielo",
  Werewolf: "Superficie y cielo",
  Harpy: "Superficie y cielo",
  Wyvern: "Superficie y cielo",
  "Forest tree_": "Superficie y cielo",
  "Living Wood Chest": "Superficie y cielo",
  "Frozen Zombie": "Nieve / Tundra",

  // Cuevas y cavernas
  "Gold Chest": "Cuevas y cavernas",
  Chest: "Cuevas y cavernas",
  "Skeleton Archer": "Cuevas y cavernas",
  "Meteor Head": "Cuevas y cavernas",
  "Tomb Crawler": "Cuevas y cavernas",
  "Crystal Slime": "Cuevas y cavernas",
  "Toxic Sludge": "Cuevas y cavernas",

  // Inframundo
  "Fire Imp": "Inframundo",
  Demon: "Inframundo",
  Voodoo: "Inframundo",
  "Shadow Chest": "Inframundo",
  "Hellstone Crate": "Inframundo",

  // Jungla
  "Man Eater": "Jungla",
  Hornet: "Jungla",
  "Moss Hornet": "Jungla",
  "Giant Tortoise": "Jungla",
  "Spiked Jungle Slime": "Jungla",
  "Ivy Chest": "Jungla",

  // Desierto
  Ghouls: "Desierto",
  Mummies: "Desierto",
  Lamia: "Desierto",
  Basilisk: "Desierto",
  "Sand Elemental": "Desierto",
  "Sand Sharks": "Desierto",
  "Sandstone Chest": "Desierto",
  "Sand Slime": "Desierto",

  // Nieve / Tundra
  "Snow Flinx": "Nieve / Tundra",
  "Ice Golem": "Nieve / Tundra",
  "Ice Tortoise": "Nieve / Tundra",
  "Spiked Ice Slime": "Nieve / Tundra",
  "Frozen Chest": "Nieve / Tundra",

  // Océano
  "Creature from the Deep": "Océano",
  Shark: "Océano",
  Orca: "Océano",
  "Water Chest": "Océano",

  // Corrupción
  "Corrupt Slime": "Corrupción",
  "World Feeder": "Corrupción",
  Clinger: "Corrupción",
  "Shadow Orb": "Corrupción",

  // Carmesí
  Crimera: "Carmesí",
  "Face Monster": "Carmesí",
  "Floaty Gross": "Carmesí",
  "Ichor Sticker": "Carmesí",
  "Blood Crawler": "Carmesí",
  "Crimson Heart": "Carmesí",
  "Crimson Axe": "Carmesí",
  "Cursed Hammer": "Corrupción",

  // Hallow
  Pixie: "Hallow",
  Unicorn: "Hallow",
  Gastropod: "Hallow",
  "Illuminant Slime": "Hallow",
  "Rainbow Slime": "Hallow",

  // Dungeon
  "Skeleton Sniper": "Dungeon",
  "Bone Lee": "Dungeon",
  Paladin: "Dungeon",
  "Dungeon Spirit": "Dungeon",
  "Blue Armored Bones": "Dungeon",
  "Rusty Armored Bones": "Dungeon",
  "Gold Chest (Dungeon)": "Dungeon",
  "Golden Lock Box": "Dungeon",

  // Granito y mármol
  "Granite Elemental": "Granito y mármol",
  "Granite Golem": "Granito y mármol",

  // Bioma de arañas
  "Black Recluse": "Bioma de arañas",

  // Jefes
  "Queen Bee": "Jefes",
  "Skeletron Prime": "Jefes",
  "The Destroyer": "Jefes",
  "The Twins": "Jefes",
  Plantera: "Jefes",
  Golem: "Jefes",
  "Moon Lord": "Jefes",
  "Duke Fishron": "Jefes",
  "Eye of Cthulhu": "Jefes",
  "Eater of Worlds": "Jefes",
  "Brain of Cthulhu": "Jefes",
  Skeletron: "Jefes",
  "King Slime": "Jefes",
  "Wall of Flesh": "Jefes",
  "Lunatic Cultist": "Jefes",
  "Empress of Light": "Jefes",
  Betsy: "Eventos",

  // Eventos
  "Martian Saucer": "Eventos",
  Pumpking: "Eventos",
  "Mourning Wood": "Eventos",
  Mothron: "Eventos",
  Vampire: "Eventos",
  Present: "Eventos",

  // NPCs y tiendas
  "Arms Dealer": "NPCs y tiendas",
  Merchant: "NPCs y tiendas",
  Demolitionist: "NPCs y tiendas",
  "Goblin Tinkerer": "NPCs y tiendas",
  "Comercio Goblin Tinkerer": "NPCs y tiendas",
  "Witch Doctor": "NPCs y tiendas",
  Wizard: "NPCs y tiendas",
  "Skeleton Merchant": "NPCs y tiendas",
  "Traveling Merchant": "NPCs y tiendas",
  Cyborg: "NPCs y tiendas",
  Tavernkeep: "NPCs y tiendas",
  Nurse: "NPCs y tiendas",
  "Dye Trader": "NPCs y tiendas",
  Angler: "NPCs y tiendas",
  "Party Girl": "NPCs y tiendas",
  "Zoologist": "NPCs y tiendas",
  "Goblin Tinkerer ": "NPCs y tiendas",

  // Pesca
  "Herb Bag": "Pesca (crates)",
};

export function sourceZone(from: string): string {
  const exact = ZONE_BY_SOURCE[from];
  if (exact) return exact;
  if (/crate/i.test(from)) return "Pesca (crates)";
  if (/slime/i.test(from)) return "Cuevas y cavernas";
  if (/zombie/i.test(from)) return "Superficie y cielo";
  if (/chest|lock box|orb|heart/i.test(from)) return "Cuevas y cavernas";
  return "Otros";
}

export function zoneRank(zone: string): number {
  const i = (ZONE_ORDER as readonly string[]).indexOf(zone);
  return i === -1 ? ZONE_ORDER.length : i;
}
