import type { Locale } from "@/lib/i18n";
import type { DataIndexes } from "@/lib/indexing";
import type { Build, BuildSlot, GameStage, Item, Mechanic, Stage } from "@/types/data";

/**
 * Contenido curado en inglés. Los textos que no estén aquí caen al español del
 * dataset (fallback), así que el idioma EN se puede completar de forma incremental.
 */

interface StageEn {
  title: string;
  short: string;
  description: string;
  boss: string;
  tips: string[];
}

export const STAGE_EN: Partial<Record<GameStage, StageEn>> = {
  PRE_BOSSES: {
    title: "Pre-Bosses",
    short: "Explore, mine and gear up",
    description:
      "Early exploration: copper/iron, first accessories and basic sets. The Eye of Cthulhu is optional, but it makes getting meteorite easier.",
    boss: "Eye of Cthulhu (optional)",
    tips: [
      "Arena: a long wooden platform with 3-4 levels, campfires and lanterns for regen.",
      "Bring Ironskin, Regeneration and Swiftness potions before each attempt.",
      "Use the grappling hook to reposition and leave a gap to dodge underneath.",
    ],
  },
  PRE_SKELETRON: {
    title: "Pre-Skeletron",
    short: "After the first bosses",
    description:
      "After the first bosses (Eye of Cthulhu, Eater of Worlds/Brain of Cthulhu): Shadow/Crimson armor, evil-biome weapons and better mobility. Get ready for the Dungeon.",
    boss: "Skeletron",
    tips: [
      "Arena: flatten the Dungeon roof or build a platform in front; leave room to fly in circles.",
      "Talk to the Old Man at night at the entrance; don't enter the Dungeon before beating him.",
      "Attack the arms first and avoid crossing above when the head starts spinning.",
    ],
  },
  PRE_HARDMODE: {
    title: "Pre-Hardmode",
    short: "All set for the Wall of Flesh",
    description:
      "Stock up on potions and finish your crafts. Defeat the Wall of Flesh to unlock Hardmode.",
    boss: "Wall of Flesh",
    tips: [
      "Build a long bridge (1-2 screens) over the Underworld lava with non-flammable blocks.",
      "Use Obsidian Skin and Water Walking; the Wall of Flesh speeds up as it loses health.",
      "Throw the Guide Voodoo Doll into the lava; the bridge keeps you from being cornered.",
    ],
  },
  PRE_MECH_BOSSES: {
    title: "Pre-Mechanical Bosses",
    short: "First Hardmode armor",
    description:
      "Hardmode just started: new ores (Adamantite/Titanium), armor and drop farming.",
    boss: "The Destroyer / The Twins / Skeletron Prime",
    tips: [
      "Arena: a 1-2 screen wide platform with 3 rows; a roof helps block the lasers.",
      "The Twins: kill Spazmatism (the green one) first, it deals more damage.",
      "The Destroyer: use piercing weapons and a raised arena; watch out for its projectiles.",
    ],
  },
  PRE_PLANTERA: {
    title: "Pre-Plantera",
    short: "Hallowed and fragment weapons",
    description:
      "After a mechanical boss: Hallowed/Chlorophyte armor and fragment weapons. Plantera opens the deep Jungle.",
    boss: "Plantera",
    tips: [
      "Arena: dig a wide room in the Underground Jungle (break the bulbs) with several platform layers.",
      "Remove the wall background to slow vines, and stay inside the Jungle or she enrages.",
      "Phase 2: keep your distance; her hooks and attack range increase.",
    ],
  },
  PRE_GOLEM: {
    title: "Pre-Golem",
    short: "Post-Plantera events",
    description:
      "You unlock the post-Plantera events (Solar Eclipse, Pumpkin/Frost Moon) and the best pre-Lunar weapons.",
    boss: "Golem",
    tips: [
      "Arena: expand the Lihzahrd Temple room by removing blocks and adding platforms.",
      "Temple blocks are indestructible until you beat Golem; use the Picksaw if you already have it.",
      "Phase 2: jump over its head to attack; dodge the fists and the fire.",
    ],
  },
  PRE_LUNAR_EVENTS: {
    title: "Pre-Lunar Events",
    short: "Max gear before the Cultist",
    description:
      "Maxed-out gear and special events. Defeat the Lunatic Cultist to summon the Celestial Pillars.",
    boss: "Lunatic Cultist",
    tips: [
      "Summon the Lunatic Cultist at the Dungeon entrance after the 3 mechs and Plantera.",
      "Dodge in circles and target the real clone: the fake one vanishes when hit.",
      "After the Cultist, prepare area weapons and good mobility for the Pillars.",
    ],
  },
  PRE_MOON_LORD: {
    title: "Pre-Moon Lord",
    short: "Celestial Pillars",
    description:
      "After the Lunatic Cultist: defeat the four Celestial Pillars and craft fragment weapons before facing the Moon Lord.",
    boss: "Celestial Pillars",
    tips: [
      "Defeat the 4 Pillars (Solar, Vortex, Nebula, Stardust) to gather fragments.",
      "Each Pillar has its own wave: clear the area, dodge and hit the core.",
      "Get the arena ready for the Moon Lord: wide space and potions.",
    ],
  },
  POST_MOON_LORD: {
    title: "Post-Moon Lord",
    short: "Definitive fragments and Luminite",
    description:
      "Definitive armor and weapons with fragments and Luminite. The final build for the class.",
    boss: "Moon Lord",
    tips: [
      "Arena: a large flat area with platforms and a solid roof to hide from the rays.",
      "The Phantasmal Deathray does not pass through blocks: use them to hide and strike back.",
      "Potions: Ironskin, Regeneration, Endurance, Lifeforce and Wrath/Rage.",
    ],
  },
};

export function stageTitle(locale: Locale, stage: Stage): string {
  return (locale === "en" && STAGE_EN[stage.id]?.title) || stage.title;
}

export function stageShort(locale: Locale, stage: Stage): string {
  return (locale === "en" && STAGE_EN[stage.id]?.short) || stage.short;
}

export function stageDescription(locale: Locale, stage: Stage): string {
  return (locale === "en" && STAGE_EN[stage.id]?.description) || stage.description;
}

export function stageBoss(locale: Locale, stage: Stage): string {
  return (locale === "en" && STAGE_EN[stage.id]?.boss) || stage.gate.boss;
}

export function stageTips(locale: Locale, stage: Stage): string[] {
  return (locale === "en" && STAGE_EN[stage.id]?.tips) || stage.tips || [];
}

/** Contenido EN de builds y mecánicas (se completa en la fase de datos). */
export const BUILD_EN: Partial<
  Record<string, { title?: string; intro?: string; startGuide?: string[] }>
> = {
  "melee-pre-bosses": {
    title: "Early Melee — Mine and boost health",
    intro: "Early swords and yoyos; boost health and mine ores.",
    startGuide: [
      "Start by mining iron/lead and building the anvil and basic weapons (iron sword, boomerang).",
      "Boost health with 5 Crystal Hearts from the caves (200 health).",
      "Get the Starfury from the Skyware chests on the floating islands (use Gravity Potions).",
      "Feral Claws come from Jungle Ivy Chests; Ironskin Potion drops from slimes or crates.",
    ],
  },
  "melee-pre-skeletron": {
    title: "Melee — Rush the Dungeon",
    intro: "Volcano and Underworld mobility for the Dungeon.",
    startGuide: [
      "Defeat Skeletron at night in front of the Dungeon (talk to the Old Man) to get in.",
      "Go down to the Underworld and mine Hellstone: 20 bars for the Volcano and 10 for the Molten Helmet.",
      "Craft the Stinger Necklace with a Honey Comb (Queen Bee) + Shark Tooth Necklace (Blood Moon).",
    ],
  },
  "melee-pre-hardmode": {
    title: "Pre-Hardmode Melee — Molten and Night's Edge",
    intro: "Molten and Night's Edge for the Wall of Flesh.",
    startGuide: [
      "Craft the Night's Edge by fusing Blade of Grass, Blood Butcherer (or Light's Bane), Muramasa and Volcano.",
      "Finish the Molten set with Hellstone Bars before killing the Wall of Flesh.",
      "Get Feral Claws from Jungle Ivy Chests (or crates).",
    ],
  },
  "melee-pre-mech-bosses": {
    title: "Melee — The Mechanical Bosses",
    intro: "Hardmode: Amarok and Mimic weapons against the mechs.",
    startGuide: [
      "On entering Hardmode, break altars and mine Adamantite/Titanium: 12 bars for the helmet.",
      "Get the Warrior Emblem from the Wall of Flesh (25%).",
      "Farm the Drippler Crippler from Blood Eels during the Blood Moon (12.5%).",
    ],
  },
  "melee-pre-plantera": {
    title: "Melee — Excalibur and Terra Blade",
    intro: "True Night's Edge and post-mech gloves for the Jungle.",
    startGuide: [
      "After the mechs, craft the True Night's Edge (Night's Edge + 20 Souls of Fright/Might/Sight).",
      "Craft Excalibur with 12 Hallowed Bars, then the True Excalibur with the Broken Hero Sword (Solar Eclipse).",
      "Get the Warrior Emblem from the Wall of Flesh (25%).",
    ],
  },
  "melee-pre-golem": {
    title: "Melee — Beetle and Terra Blade",
    intro: "Beetle and Terra Blade: the pre-Lunar melee peak.",
    startGuide: [
      "After Plantera, farm Beetle Husks from the Golem and craft the Beetle armor (Turtle Helmet + 4 Husks).",
      "Craft the Terra Blade (True Excalibur + True Night's Edge + Broken Hero Sword).",
      "Keep the Warrior Emblem from the Wall of Flesh.",
    ],
  },
  "melee-pre-lunar-events": {
    title: "Melee — Lunar Events",
    intro: "Flying Dragon and Influx Waver for the Pillars.",
    startGuide: [
      "Farm the Old One's Army up to Betsy for the Flying Dragon (25%).",
      "Craft the Destroyer Emblem (Avenger Emblem + Eye of the Golem).",
      "Finish the Beetle armor and get wings (Fishron or Steampunk) before the Pillars.",
    ],
  },
  "melee-post-moon-lord": {
    title: "Endgame Melee — Solar Flare",
    intro: "Solar Flare and Zenith: the ceiling of melee.",
    startGuide: [
      "Defeat the Moon Lord and craft the Solar Flare armor (Luminite Bars + Solar Fragments).",
      "Gather the swords for the Zenith: Terra Blade, Meowmere, Star Wrath, Influx Waver, Seedler, etc.",
      "The Destroyer Emblem (Avenger Emblem + Eye of the Golem) gives the best DPS.",
    ],
  },
  "melee-pre-moon-lord": {
    title: "Melee — Celestial Pillars",
    intro: "Beetle and Solar Pillar weapons for the Pillars and the Moon Lord.",
    startGuide: [
      "Defeat the Lunatic Cultist and then the 4 Celestial Pillars, collecting Solar Fragments.",
      "Craft the Solar Eruption with 18 Solar Fragments.",
      "Keep the Beetle armor and the Destroyer Emblem until you get Luminite.",
    ],
  },
  "ranged-pre-bosses": {
    title: "Early Ranged — Bow and arrows",
    intro: "Bows, shotguns and throwables to start.",
    startGuide: [
      "Craft a wooden bow and arrows, and boost health with Crystal Hearts.",
      "Get the Blood Rain Bow from the Zombie Merman/Wandering Eye Fish by fishing in a Blood Moon with rain.",
      "Craft the Harpy Charm (3 Amber + 5 silver/tungsten bars + 7 Feathers).",
    ],
  },
  "ranged-pre-skeletron": {
    title: "Ranged — Minishark",
    intro: "Molten Fury and Minishark for the Dungeon.",
    startGuide: [
      "Buy the Minishark from the Arms Dealer (35 gold) and craft the Fossil armor with Sturdy Fossils from the desert.",
      "Craft the Molten Fury with 15 Hellstone Bars in the Underworld.",
      "Get the Harpy Charm (Amber + silver/tungsten bars + Feathers).",
    ],
  },
  "ranged-pre-hardmode": {
    title: "Pre-Hardmode Ranged — Necro Armor",
    intro: "Necro armor and Star Cannon for the Wall of Flesh.",
    startGuide: [
      "Farm bones in the Dungeon and craft the Necro armor (includes the Ancient Necro Helmet).",
      "Craft the Star Cannon (5 Fallen Stars + 20 Meteorite Bars + Minishark).",
      "Craft the Sweet Barb (Honey Comb + Poison Barb from Jungle Hornets).",
    ],
  },
  "ranged-pre-mech-bosses": {
    title: "Ranged — Megashark",
    intro: "Daedalus Stormbow and Uzi against the mechs.",
    startGuide: [
      "On entering Hardmode, mine Titanium (or Adamantite): 13 bars for the helmet.",
      "Farm the Daedalus Stormbow from Hardmode Mimics (20%); use it with Holy Arrows.",
      "Get the Ranger Emblem from the Wall of Flesh (25%).",
    ],
  },
  "ranged-pre-plantera": {
    title: "Ranged — Shroomite",
    intro: "Shotbow and Flamethrower for the Jungle.",
    startGuide: [
      "After the mechs, craft the Chlorophyte Shotbow (12 Chlorophyte Bars).",
      "Grow Glowing Mushrooms and craft the Shroomite armor (Shroomite Bars).",
      "Get the Ranger Emblem from the Wall of Flesh.",
    ],
  },
  "ranged-pre-golem": {
    title: "Ranged — Tactical Shotgun",
    intro: "Shroomite and post-Plantera Dungeon weapons.",
    startGuide: [
      "Farm the Tactical Shotgun from the Dungeon's Tactical Skeletons (8.33%).",
      "Craft the Shroomite Headgear with 12 Shroomite Bars.",
      "Keep the Ranger Emblem from the Wall of Flesh.",
    ],
  },
  "ranged-pre-lunar-events": {
    title: "Ranged — Tsunami and events",
    intro: "Tsunami and Xenopopper for the Pillars.",
    startGuide: [
      "Defeat Duke Fishron for the Tsunami (14.29%) and the Fishron Wings.",
      "Farm the Martian event for the Xenopopper (Martian Saucer, 16.66%).",
      "Craft the Destroyer Emblem (Avenger Emblem + Eye of the Golem).",
    ],
  },
  "ranged-post-moon-lord": {
    title: "Endgame Ranged — Vortex and Phantasm",
    intro: "Vortex, Phantasm and S.D.M.G.: the ceiling of ranged.",
    startGuide: [
      "Defeat the Moon Lord and craft the Vortex armor (Luminite + Vortex Fragments).",
      "Craft the Phantasm with 18 Vortex Fragments.",
      "Get the S.D.M.G. from the Moon Lord (20%).",
    ],
  },
  "ranged-pre-moon-lord": {
    title: "Ranged — Celestial Pillars",
    intro: "Phantasm and Vortex Beater (fragments) against the Pillars and the Moon Lord.",
    startGuide: [
      "Defeat the 4 Celestial Pillars and collect Vortex Fragments.",
      "Craft the Phantasm with 18 Vortex Fragments.",
      "Keep the Shroomite armor and the Destroyer Emblem.",
    ],
  },
  "magic-pre-bosses": {
    title: "Early Magic — Gems and mana",
    intro: "Gem staves and Gem Robes reworked in 1.4.5.7, with mana potions for the first bosses.",
    startGuide: [
      "Craft the gem set (Diamond/Ruby Robe) and a gem staff to start.",
      "Boost health and mana with Crystal Hearts and Mana Crystals.",
      "Craft the Mana Regeneration Band (Band of Regeneration + Band of Starpower).",
      "Farm the Demon Scythe from Underworld Demons (2.86%).",
    ],
  },
  "magic-pre-skeletron": {
    title: "Magic — Jungle Armor",
    intro: "Jungle Armor and area weapons before the Dungeon.",
    startGuide: [
      "Farm Jungle Spores in the Jungle and craft the Jungle armor (Jungle Hat = 8 Spores).",
      "Craft the Mana Flower (Mana Potion + Nature's Gift).",
      "Get the Demon Scythe from Underworld Demons/Voodoo Demons (2.86%).",
    ],
  },
  "magic-pre-hardmode": {
    title: "Pre-Hardmode Magic — Demon Scythe",
    intro: "Demon Scythe and Water Bolt for the Wall of Flesh.",
    startGuide: [
      "Get the Demon Scythe in the Underworld and the Flower of Fire in Shadow Chests (or from Red Devils).",
      "Craft the Celestial Cuffs (Celestial Magnet + Magic Cuffs).",
      "Before Hardmode, prepare the Jungle set and mana potions.",
    ],
  },
  "magic-pre-mech-bosses": {
    title: "Magic — Sky Fracture",
    intro: "Titanium Headgear and fragment weapons for the mechanical bosses.",
    startGuide: [
      "On entering Hardmode, craft the Sky Fracture (2 Light Shards + Magic Missile + 16 Souls of Light).",
      "Buy the Orange Zapinator from the Traveling Merchant (50 gold).",
      "Get the Sorcerer Emblem from the Wall of Flesh (25%).",
    ],
  },
  "magic-pre-plantera": {
    title: "Magic — Chlorophyte and Plantera",
    intro: "Chlorophyte or the Hallowed + Apprentice mix for the Jungle.",
    startGuide: [
      "After the mechs, craft the Chlorophyte Headgear (12 Chlorophyte Bars).",
      "Farm the Unholy Trident from Underworld Red Devils (3.33%).",
      "Get the Sorcerer Emblem from the Wall of Flesh.",
    ],
  },
  "magic-pre-golem": {
    title: "Magic — Golden Shower and Chlorophyte",
    intro: "Spectre Armor and post-Plantera weapons before Golem.",
    startGuide: [
      "After Plantera, farm the Leaf Blower (Plantera, 12.5%) and the Golden Shower (Crimson Ichor).",
      "Craft the Celestial Emblem (Avenger Emblem + Celestial Magnet).",
      "Keep the Chlorophyte armor and the Sorcerer Emblem.",
    ],
  },
  "magic-pre-lunar-events": {
    title: "Magic — Spectre and Razorblade Typhoon",
    intro: "Spectre Armor (Mask) and event weapons for the Pillars.",
    startGuide: [
      "Craft the Spectre armor (Spectre Bars with Ectoplasm from the Hardmode Dungeon).",
      "Defeat Duke Fishron for the Razorblade Typhoon.",
      "Farm the Arc Surge from the Martian Saucer (2%) and craft the Destroyer Emblem.",
    ],
  },
  "magic-post-moon-lord": {
    title: "Endgame Magic — Nebula and Last Prism",
    intro: "Nebula Armor and Last Prism: the ceiling of magic.",
    startGuide: [
      "Defeat the Moon Lord and craft the Nebula armor (Luminite + Nebula Fragments).",
      "Get the Last Prism from the Moon Lord (20%).",
      "Craft the Nebula Blaze with 18 Nebula Fragments.",
    ],
  },
  "magic-pre-moon-lord": {
    title: "Magic — Celestial Pillars",
    intro: "Spectre and Nebula Pillar weapons for the Pillars and the Moon Lord.",
    startGuide: [
      "Defeat the 4 Celestial Pillars and collect Nebula Fragments.",
      "Craft the Nebula Blaze with 18 Nebula Fragments.",
      "Keep the Spectre armor and the Celestial Emblem.",
    ],
  },
  "summoner-pre-bosses": {
    title: "Early Summoner — Flinx and Finch",
    intro: "Flinx and Snapthorn to start.",
    startGuide: [
      "Craft the Flinx Staff (6 Flinx Fur from the snow + 10 Gold Bars).",
      "Craft the Snapthorn in the Jungle (12 Jungle Spores + 15 Stingers + 3 Vines).",
      "Get Feral Claws from Jungle Ivy Chests for whip speed.",
    ],
  },
  "summoner-pre-skeletron": {
    title: "Summoner — Bee Armor",
    intro: "Bee/Obsidian and tier 1 sentries.",
    startGuide: [
      "Defeat the Queen Bee in the Jungle for the Bee armor (Bee Hat, 11%) and bee weapons.",
      "Craft the Imp Staff with 17 Hellstone Bars in the Underworld.",
      "Buy the Pygmy Necklace from the Witch Doctor in the Jungle (20 gold).",
    ],
  },
  "summoner-pre-hardmode": {
    title: "Pre-Hardmode Summoner — Obsidian and Imp",
    intro: "Obsidian and Spinal Tap before the WoF.",
    startGuide: [
      "Craft the Obsidian armor set (Obsidian + Silk + Shadow Scales/Tissue Samples).",
      "Craft the Spinal Tap (90 Bones + 55 Cobwebs).",
      "Get the Silver Bracer from Dungeon Gold Chests.",
    ],
  },
  "summoner-pre-mech-bosses": {
    title: "Summoner — Spider Armor",
    intro: "Spider/Forbidden and 1.4.5.7 tag accessories.",
    startGuide: [
      "On entering Hardmode, farm Spider Fangs from the Black Recluses of the spider biome and craft the Spider armor.",
      "Defeat the Wall of Flesh for the Firecracker and the Summoner Emblem (25% each).",
      "Craft the Ruinous Staff (Dark Shard + 2 Forbidden Fragments from Sand Elementals + Light Shard + Souls).",
      "For whips (whip stacking): farm the Wicked Armlet (Cursed Hammer/Crimson Axe, 4%), the Silver Bracer (Dungeon chests) and the Snake Band (Lamia) to build the tag accessories.",
    ],
  },
  "summoner-pre-plantera": {
    title: "Summoner — Sanguine and Forbidden",
    intro: "Durendal and OOA tier 2 armor.",
    startGuide: [
      "After the mechs, craft the Durendal (12 Hallowed Bars).",
      "Farm Spider Fangs for the Spider Mask (8) and the Sanguine Staff from the Dreadnautilus (Blood Moon fishing).",
      "Craft the Avenger Emblem (Ranger Emblem + mech Souls).",
    ],
  },
  "summoner-pre-golem": {
    title: "Summoner — Tiki and Durendal",
    intro: "Tiki/Spooky and improved sentries.",
    startGuide: [
      "After Plantera, buy the Tiki Mask from the Witch Doctor (50 gold).",
      "Farm the Vulgar Display of Flower from Plantera (12.5%).",
      "Craft the Papyrus Scarab (Hercules Beetle + Necromantic Scroll).",
    ],
  },
  "summoner-pre-lunar-events": {
    title: "Summoner — Spooky and Kaleidoscope",
    intro: "Terraprisma, Kaleidoscope and Valhalla.",
    startGuide: [
      "Farm the Pumpkin Moon for Spooky Wood and craft the Spooky armor (200 Spooky Wood).",
      "Defeat the Empress of Light during the day for the Terraprisma (100%).",
      "Get the Kaleidoscope from the Empress of Light (25%).",
    ],
  },
  "summoner-post-moon-lord": {
    title: "Endgame Summoner — Stardust",
    intro: "Stardust: the ceiling of summoner.",
    startGuide: [
      "Defeat the Moon Lord and craft the Stardust armor (Luminite + Stardust Fragments).",
      "Craft the Stardust Dragon Staff with 18 Stardust Fragments.",
      "Get the Possession from the Moon Lord (20%).",
    ],
  },
  "summoner-pre-moon-lord": {
    title: "Summoner — Celestial Pillars",
    intro: "Stardust Dragon and Constellation (fragments) for the Pillars and the Moon Lord.",
    startGuide: [
      "Defeat the 4 Celestial Pillars and collect Stardust Fragments.",
      "Craft the Stardust Dragon Staff with 18 Stardust Fragments.",
      "Keep the Spooky armor and craft the Constellation (18 Stardust Fragments).",
    ],
  },
};

export const SLOT_WHY_EN: Partial<Record<string, string>> = {
  "ACCESSORY:amphibian-boots": "Mobility and jumping.",
  "ACCESSORY:ankh-shield": "Immunities + knockback immunity.",
  "ACCESSORY:apprentices-scarf": "+10% summon and +1 sentry.",
  "ACCESSORY:arcane-flower": "1.4.5.7: +5% damage and +5% magic crit (inherits Putrid Scent).",
  "ACCESSORY:armlet-of-ruin": "+1 tag and tag damage spikes.",
  "ACCESSORY:avenger-emblem": "+12% total damage (post-3-mechs).",
  "ACCESSORY:band-of-regeneration": "Passive regeneration.",
  "ACCESSORY:berserker-s-glove": "Autoswing, +12% speed, defense and aggro.",
  "ACCESSORY:bundle-of-horseshoe-balloons": "4 extra jumps, +30% jump and fall immunity (pre-Hardmode).",
  "ACCESSORY:celestial-cuffs": "Best early mana accessory: mana when hit, +40 mana and +2 defense (1.4.5.7). Needs the Celestial Magnet from a floating island.",
  "ACCESSORY:celestial-emblem": "+15% magic damage and extended pickup (post-3-mechs); stacks with the Sorcerer Emblem.",
  "ACCESSORY:celestial-shell": "+10% stats day and night.",
  "ACCESSORY:celestial-starboard": "The best wings (Moon Lord Expert).",
  "ACCESSORY:chaos-cylinder": "New in 1.4.5.7: +8% ranged damage.",
  "ACCESSORY:cloud-in-a-bottle": "Double jump.",
  "ACCESSORY:destroyer-emblem": "+10% damage and +8% crit (post-Golem).",
  "ACCESSORY:druidic-serpent-cloak": "Every 3 hits performs an extra hit with the next whip (applies another tag).",
  "ACCESSORY:fairy-wings": "Best early Hardmode wings.",
  "ACCESSORY:feral-claws": "+12% melee speed and autoswing.",
  "ACCESSORY:fire-gauntlet": "+12% melee damage/speed and Hellfire.",
  "ACCESSORY:fishron-wings": "3 s of flight (Duke Fishron).",
  "ACCESSORY:fledgling-wings": "Early flight (Sky Chests).",
  "ACCESSORY:frozen-turtle-shell": "-25% damage below 50% health.",
  "ACCESSORY:harpy-charm": "+5% ranged crit and redirects arrows.",
  "ACCESSORY:heavy-sling": "Lets you carry sentries (Ice Mimic).",
  "ACCESSORY:hercules-beetle": "+15% summon damage and knockback.",
  "ACCESSORY:huntresss-buckler": "+10% summon and +1 sentry.",
  "ACCESSORY:magic-quiver": "+10% bow and arrow damage, speed and arrow conservation.",
  "ACCESSORY:magnet-flower": "Mana Flower + extended star pickup; Mana Flower is the variant without a floating island.",
  "ACCESSORY:mana-cloak": "1.4.5.7 rework: mana stars → Mana Surge (+20% damage).",
  "ACCESSORY:mana-regeneration-band": "+30 mana/s and +1 HP/s (inherits Band of Regeneration).",
  "ACCESSORY:master-ninja-gear": "Dash and 10% dodge (post-Plantera).",
  "ACCESSORY:mechanical-glove": "+12% melee damage/speed and autoswing (post-mech).",
  "ACCESSORY:mobius-strip": "+1 tag and +10% range.",
  "ACCESSORY:monks-belt": "+10% summon and +1 sentry (Ogre).",
  "ACCESSORY:moon-charm": "At night grants a melee bonus (werewolf).",
  "ACCESSORY:mystic-arts-sash": "New in 1.4.5.7: +40 mana, +30 mana/s, +1 HP/s and 10% dodge.",
  "ACCESSORY:nature-s-gift": "-6% mana cost (Jungle); stacks with the Magnet Flower.",
  "ACCESSORY:necromantic-scroll": "+1 minion and +10% damage.",
  "ACCESSORY:ouroboros-ring": "+1 tag and every 3rd whip hits with the next one.",
  "ACCESSORY:papyrus-scarab": "+1 minion and +15% damage (post-Plantera).",
  "ACCESSORY:phoenix-quiver": "New in 1.4.5.7: redirects arrows with Hellfire.",
  "ACCESSORY:poison-barb": "Arrows inflict Poisoned.",
  "ACCESSORY:pygmy-necklace": "+1 minion (Witch Doctor at night).",
  "ACCESSORY:ranger-emblem": "+15% ranged damage (WoF).",
  "ACCESSORY:recon-scope": "Sniper Scope with -400 aggro.",
  "ACCESSORY:restoration-shield": "New in 1.4.5.7: knockback immunity, +40 mana and regeneration.",
  "ACCESSORY:rifle-scope": "Zoom (post-Plantera Dungeon).",
  "ACCESSORY:royal-guard-s-harness": "+1 defense, knockback immunity and carries sentries.",
  "ACCESSORY:scout-s-sling": "+5% damage, -400 aggro and carries sentries.",
  "ACCESSORY:shackle": "+1 defense.",
  "ACCESSORY:shark-tooth-necklace": "+5 armor penetration.",
  "ACCESSORY:shield-of-cthulhu": "Dash and +2 defense.",
  "ACCESSORY:silver-bracer": "New in 1.4.5.7: +1 tag and tripled duration.",
  "ACCESSORY:silver-shield": "+2 defense, knockback immunity and +1 tag.",
  "ACCESSORY:snapping-stone": "Ranged damage pulses.",
  "ACCESSORY:sniper-scope": "+10% ranged damage and crit; zoom for guns.",
  "ACCESSORY:sorcerer-emblem": "+15% magic damage (Wall of Flesh drop); the Avenger Emblem is only post-3-mechs.",
  "ACCESSORY:spectre-boots": "Sprint + Goblin boots; Lightning Boots as an upgrade.",
  "ACCESSORY:squires-shield": "+10% summon and +1 sentry.",
  "ACCESSORY:star-veil": "Extended immunity + stars.",
  "ACCESSORY:stinger-necklace": "+5 penetration and bees on hit.",
  "ACCESSORY:strung-counterweight": "Range and spin speed.",
  "ACCESSORY:summoner-emblem": "+15% summoner damage (WoF).",
  "ACCESSORY:sweet-barb": "Arrows with poison and bees.",
  "ACCESSORY:templar-s-sling": "+10% sentry crit and carries sentries (post-Golem).",
  "ACCESSORY:terraspark-boots": "Sprint, water, ice and lava.",
  "ACCESSORY:twilight-grasp": "+2 tags and tripled duration (1.4.5.7).",
  "ACCESSORY:warrior-emblem": "+15% melee damage (Wall of Flesh).",
  "ACCESSORY:wicked-claws": "+1 tag, knockback and autoswing.",
  "ACCESSORY:worm-scarf": "-17% damage taken (Expert EoW).",
  "ACCESSORY:yoyo-bag": "Two yoyos at once, more range and spin speed.",
  "AMMO:chlorophyte-bullet": "Homing bullets.",
  "AMMO:crystal-bullet": "Bullets with shards.",
  "AMMO:frostburn-arrow": "Cheap fire arrows.",
  "AMMO:hellfire-arrow": "Explosive Underworld arrows.",
  "AMMO:holy-arrow": "Stars on impact.",
  "AMMO:ichor-arrow": "Lowers enemy defense.",
  "AMMO:luminite-arrow": "Endgame arrows.",
  "AMMO:luminite-bullet": "Piercing bullets.",
  "AMMO:meteor-shot": "Bouncing bullets.",
  "AMMO:musket-ball": "Basic ammo.",
  "AMMO:rocket-iii": "High-damage rocket.",
  "AMMO:unholy-arrow": "Basic arrows for the rain.",
  "AMMO:venom-arrow": "Acid Venom + Potent Acid (1.4.5.7).",
  "BUFF:archery-potion": "+20% arrow damage and speed.",
  "BUFF:ironskin-potion": "Reduces damage taken.",
  "BUFF:lifeforce-potion": "+20% health.",
  "BUFF:magic-power-potion": "+20% magic damage.",
  "BUFF:mana-regeneration-potion": "Max mana regeneration even while attacking (1.4.5.7 rework).",
  "BUFF:regeneration-potion": "Regeneration.",
  "BUFF:summoning-potion": "+1 temporary minion.",
  "BUFF:swiftness-potion": "Speed for kiting.",
  "CHEST:adamantite-breastplate": "Solid defense.",
  "CHEST:bee-shirt": "+minions.",
  "CHEST:beetle-scale-mail": "Offensive variant.",
  "CHEST:chlorophyte-plate": "+5% damage and +7% overall crit; Hallowed Plate Mail (+7% crit) as an alternative.",
  "CHEST:diamond-robe": "Gem Robes reworked in 1.4.5.7: they enchant gem staves; the Diamond Robe has the best stats (+80 mana, -15% cost). With the matching gem staff it gains +4 damage and +1 knockback.",
  "CHEST:flinx-fur-coat": "The only piece of the Flinx set (+1 minion).",
  "CHEST:forbidden-robe": "+summon damage.",
  "CHEST:fossil-plate": "+ranged damage and crit.",
  "CHEST:hallowed-breastplate": "Defense and damage.",
  "CHEST:jungle-shirt": "+mana and damage.",
  "CHEST:molten-breastplate": "+melee damage.",
  "CHEST:nebula-breastplate": "Power orbs.",
  "CHEST:necro-shirt": "+15% ranged damage.",
  "CHEST:obsidian-shirt": "+whip damage.",
  "CHEST:platinum-chainmail": "Solid early defense.",
  "CHEST:shroomite-breastplate": "+25% ranged damage.",
  "CHEST:solar-flare-breastplate": "Maximum melee defense.",
  "CHEST:spectre-robe": "+7% damage and +7% magic crit; part of the Spectre set.",
  "CHEST:spider-breastplate": "+minions.",
  "CHEST:spooky-breastplate": "+minions.",
  "CHEST:squire-s-plating": "+defense and summon.",
  "CHEST:stardust-breastplate": "+minions.",
  "CHEST:tiki-shirt": "+minions.",
  "CHEST:titanium-breastplate": "Defense and shards when hit.",
  "CHEST:valhalla-knight-s-breastplate": "+defense and regeneration.",
  "CHEST:vortex-breastplate": "Ranged stealth.",
  "HELMET:adamantite-headgear": "Offensive mix: +12% damage, +12% crit and +80 mana; the Titanium Headgear (+16% damage, +100 mana) is the barrier alternative.",
  "HELMET:adamantite-helmet": "First-layer Hardmode melee set.",
  "HELMET:bee-hat": "Pre-HM summoner set.",
  "HELMET:beetle-helmet": "Post-Plantera melee set.",
  "HELMET:forbidden-mask": "Set with minions.",
  "HELMET:fossil-helmet": "Ranged set from the Underground Desert.",
  "HELMET:hallowed-headgear": "Offensive mix: +12% damage, +12% crit and +100 mana; the Chlorophyte Headgear (+16% damage, -17% cost) as an alternative.",
  "HELMET:hallowed-helmet": "Classic post-mech set.",
  "HELMET:hallowed-mask": "Hallowed melee helmet (the Hallowed Helmet is the ranged one).",
  "HELMET:jungle-hat": "Jungle magic set.",
  "HELMET:molten-helmet": "Offensive Underworld melee set.",
  "HELMET:nebula-helmet": "Definitive magic set.",
  "HELMET:necro-helmet": "Classic ranged set (post-Skeletron).",
  "HELMET:obsidian-helmet": "Whip set.",
  "HELMET:platinum-helmet": "Balanced starting set.",
  "HELMET:shroomite-headgear": "Bow/repeater helmet (Shroomite Mask for guns).",
  "HELMET:solar-flare-helmet": "Definitive melee set.",
  "HELMET:spectre-mask": "Spectre Mask (post-Plantera): +10% damage, +10% crit, +60 mana and damage orbs. Switch to the Hood for lifesteal.",
  "HELMET:spider-mask": "Hardmode summoner set.",
  "HELMET:spooky-helmet": "Offensive summoner set.",
  "HELMET:squire-helmet": "Old One's Army sentry set.",
  "HELMET:stardust-helmet": "Definitive summoner set.",
  "HELMET:tiki-mask": "Post-Plantera summoner set.",
  "HELMET:titanium-helmet": "Titanium ranged helmet (+16% damage).",
  "HELMET:valhalla-knight-s-helm": "Tier 3 sentry set.",
  "HELMET:vortex-helmet": "Definitive ranged set.",
  "HELMET:wizard-hat": "The Wizard Hat (+5% damage and +10% crit with any robe) is the best pre-boss magic helmet; the Magic Hat is an alternative with more mana.",
  "LEGS:adamantite-leggings": "Completes the set.",
  "LEGS:apprentice-s-trousers": "+20% magic crit: the best pre-Plantera legs for the offensive mix.",
  "LEGS:bee-pants": "Completes.",
  "LEGS:beetle-leggings": "Completes the set.",
  "LEGS:forbidden-treads": "+40 mana, +10% magic damage and +1 minion: the most offensive legs of the tier.",
  "LEGS:fossil-greaves": "Completes the set.",
  "LEGS:hallowed-greaves": "Completes the set.",
  "LEGS:jungle-pants": "Best pre-boss magic legs: +6 defense, +20 mana and +6% crit.",
  "LEGS:molten-greaves": "Completes the set.",
  "LEGS:nebula-leggings": "Completes.",
  "LEGS:necro-leggings": "Completes the set.",
  "LEGS:obsidian-pants": "Completes.",
  "LEGS:platinum-greaves": "Completes the set.",
  "LEGS:shroomite-legs": "Completes; stealth when standing still.",
  "LEGS:solar-flare-leggings": "Completes.",
  "LEGS:spectre-pants": "+8% magic damage and +8% movement speed.",
  "LEGS:spider-greaves": "Completes.",
  "LEGS:spooky-leggings": "Completes.",
  "LEGS:squire-s-greaves": "Completes.",
  "LEGS:stardust-leggings": "Completes.",
  "LEGS:tiki-pants": "Completes.",
  "LEGS:titanium-leggings": "Completes the set.",
  "LEGS:valhalla-knight-s-greaves": "Completes.",
  "LEGS:vortex-leggings": "Completes.",
  "MINION:blade-staff": "Ignores 25 defense; with the Morning Star.",
  "MINION:flinx-staff": "Best pre-boss minion.",
  "MINION:imp-staff": "Imp with fire and piercing.",
  "MINION:ruinous-staff": "AoE explosive projectiles (new in 1.4.5.7).",
  "MINION:spider-staff": "3 Spiders with Acid Venom.",
  "MINION:stardust-dragon-staff": "The best minion in the game.",
  "MINION:terraprisma": "90 damage and pierces blocks (daytime Empress).",
  "SET_BONUS:adamantite-armor": "+21% melee damage and attack speed.",
  "SET_BONUS:adamantite-magic": "Adamantite magic helmet; the mix favors damage/crit over the Titanium barrier.",
  "SET_BONUS:bee-armor": "+2 minions and damage.",
  "SET_BONUS:beetle-armor": "Damage scaling on hit.",
  "SET_BONUS:flinx-armor": "+1 minion.",
  "SET_BONUS:forbidden-armor": "+2 minions, damage and Ancient Storm.",
  "SET_BONUS:fossil-armor": "+5% damage and +8% ranged crit; saves ammo.",
  "SET_BONUS:hallowed-armor": "Holy Protection: dodge the next hit.",
  "SET_BONUS:hallowed-magic": "Hallowed magic helmet; the mix adds +39% total magic crit.",
  "SET_BONUS:jungle-armor": "+60 mana and magic damage.",
  "SET_BONUS:molten-armor": "+17% melee damage and On Fire! immunity.",
  "SET_BONUS:nebula-armor": "Nebula orbs of damage/speed/life.",
  "SET_BONUS:necro-armor": "+15% ranged damage and +10% crit.",
  "SET_BONUS:obsidian-armor": "+1 minion and +31% whip damage.",
  "SET_BONUS:platinum-armor": "Basic set with no special bonus.",
  "SET_BONUS:shroomite-armor": "+50% ranged damage in stealth (post-Plantera).",
  "SET_BONUS:solar-flare-armor": "Solar Blaze: a shield that reduces damage on hit.",
  "SET_BONUS:spectre-mask-armor": "Homing damage orbs (scale with crit); beats the Chlorophyte set at this stage.",
  "SET_BONUS:spider-armor": "+3 minions and damage.",
  "SET_BONUS:spooky-armor": "+30% damage and minions.",
  "SET_BONUS:squire-armor": "+2 sentries and improved Ballista.",
  "SET_BONUS:stardust-armor": "+5 minions and +66% damage.",
  "SET_BONUS:tiki-armor": "+4 minions and damage.",
  "SET_BONUS:titanium-armor": "Titanium barrier on attack.",
  "SET_BONUS:valhalla-knight-armor": "+3 sentries and regeneration.",
  "SET_BONUS:vortex-armor": "Infinite ammo in stealth mode.",
  "SET_BONUS:wizard-set": "+10% magic crit with any robe; no magic bonus on the platinum set.",
  "WEAPON:amarok": "Ice yoyo buffed in 1.4.5.7 (43→47).",
  "WEAPON:amazon": "Jungle yoyo with poison.",
  "WEAPON:arc-surge": "Arc Surge (new in 1.4.5.7: 180 damage, piercing bolt) is the best; Razorblade Typhoon and Bubble Gun are alternatives.",
  "WEAPON:ballista-cane": "Tier 2 sentry.",
  "WEAPON:ballista-rod": "Tavernkeep tier 1 sentry.",
  "WEAPON:ballista-staff": "Tier 3 sentry.",
  "WEAPON:beenade": "Releases bees (Queen Bee).",
  "WEAPON:blood-rain-bow": "Turns arrows into a blood rain.",
  "WEAPON:bone-javelin": "Sticks and deals damage (Dungeon).",
  "WEAPON:boomstick": "Jungle shotgun.",
  "WEAPON:cascade": "Best pre-Hardmode yoyo: explosion every 2 hits (1.4.5.7).",
  "WEAPON:celebration-mk2": "Ultra-fast Moon Lord rocket launcher.",
  "WEAPON:chlorophyte-shotbow": "Burst of 2-3 arrows.",
  "WEAPON:daedalus-stormbow": "Arrow rain from the Hallowed Mimic.",
  "WEAPON:demon-scythe": "Demon Scythe (Underworld) is the highest pre-boss DPS; Mystic Bloom (homing) and Daybloom are safer alternatives.",
  "WEAPON:drippler-crippler": "Blood Moon flail with huge damage; Bananarang and Fetid Baghnakhs are great alternatives.",
  "WEAPON:flamethrower": "Fire cone with Hellfire (post-Skeletron Prime).",
  "WEAPON:flying-dragon": "Best single-target post-Golem (Betsy).",
  "WEAPON:hive-five": "Bee Wax yoyo with homing bees.",
  "WEAPON:javelin": "Hoplite throwing spear.",
  "WEAPON:last-prism": "The Last Prism is the ceiling; Lunar Flare (Moon Lord) and Arc Surge are alternatives.",
  "WEAPON:leaf-blower": "Leaf Blower (buffed in 1.4.5.7: 3 leaves per burst) is the best; Shadowbeam Staff and Blood Thorn were also buffed.",
  "WEAPON:lunar-portal-staff": "Pierces endlessly (Moon Lord).",
  "WEAPON:minishark": "Early machine gun from the Arms Dealer.",
  "WEAPON:molten-fury": "Lights Wooden Arrows (Hellstone).",
  "WEAPON:nebula-blaze": "Nebula Pillar weapon; homing projectiles.",
  "WEAPON:night-s-edge": "The best pre-Hardmode sword.",
  "WEAPON:orange-zapinator": "The Orange Zapinator is the best of the stage; Sky Fracture/Crystal Serpent were buffed and Lightning Strike (1.4.5.7) is an alternative.",
  "WEAPON:phantasm": "The best bow in the game.",
  "WEAPON:queen-spider-staff": "Acid Venom and a homing projectile.",
  "WEAPON:s-d-m-g": "The best gun in the game.",
  "WEAPON:snowman-cannon": "Homing rockets (Frost Moon).",
  "WEAPON:solar-eruption": "Solar Pillar weapon; pierces and applies Daybroken.",
  "WEAPON:staff-of-the-frost-hydra": "100 damage and Frostbite.",
  "WEAPON:tactical-shotgun": "6 bullets in a fan (post-Plantera Dungeon).",
  "WEAPON:terra-blade": "Projectiles and massive damage.",
  "WEAPON:terrarian": "The best yoyo in the game.",
  "WEAPON:the-eye-of-cthulhu": "Summons the Eye every 7 hits (1.4.5.7).",
  "WEAPON:true-night-s-edge": "Sword with a projectile; Death Sickle and the reworked Chlorophyte swords are alternatives.",
  "WEAPON:tsunami": "5 parallel arrows (Duke Fishron).",
  "WEAPON:unholy-trident": "Unholy Trident (1.4.5.7 rework: 150 damage, piercing and Shadowflame) is the best; the Magical Harp was buffed.",
  "WEAPON:uzi": "Turns Musket Balls into High Velocity.",
  "WEAPON:volcano": "Volcano (Hellstone) is the best pre-Skeletron sword.",
  "WEAPON:vortex-beater": "Vortex Pillar machine gun.",
  "WEAPON:xenopopper": "Bubbles that fire bullets (Martian Saucer).",
  "WEAPON:yelets": "Jungle yoyo with Acid Venom (1.4.5.7).",
  "WEAPON:zenith": "The best weapon in the game.",
  "WEAPON_ALT:cool-whip": "Second whip for whip stacking (Frostbite + snowflake); the Druidic Serpent Cloak uses it for the extra hit.",
  "WHIP:constellation": "Stardust Pillar whip.",
  "WHIP:durendal": "Hallowed Bars whip.",
  "WHIP:firecracker": "Explodes the minion's damage (WoF).",
  "WHIP:kaleidoscope": "Best whip (Empress of Light).",
  "WHIP:possession": "25 tag damage (Moon Lord).",
  "WHIP:snap-thorn": "Jungle whip with poison.",
  "WHIP:spinal-tap": "Best pre-Hardmode whip.",
  "WHIP:vulgar-display-of-flower": "Petals at 2.25x (Plantera).",
};

export const MECHANIC_EN: Partial<
  Record<string, { title?: string; summary?: string; points?: string[] }>
> = {
  "whip-stacking": {
    title: "Whip stacking and tag slots",
    summary:
      "How to stack the tags of several whips at once and which accessories enable it (reintroduced in 1.4.5.7).",
    points: [
      "You start with 1 tag effect slot; the maximum reachable in normal play is 4.",
      "Only the effects of BASE accessories stack: Snake Band, Mobius Strip, Wicked Armlet and Silver Bracer.",
      "Upgrades sharing a base do NOT stack that component: e.g. Ouroboros Ring + Druidic Serpent Cloak counts Snake Band only once.",
      "Twilight Grasp grants +2 slots (Silver Bracer + Wicked Armlet) and triples the duration; Mobius Strip (+1) is only available after Golem.",
      "When you apply one tag too many, the oldest is removed; every application refreshes the order.",
    ],
  },
  "summon-tags": {
    title: "Summon tags",
    summary: "What whip tags do to minions and sentries.",
    points: [
      "Every whip applies a tag for 4 seconds (8 s with Constellation).",
      "The tag adds damage to minion and sentry hits, and is the only way they can crit.",
      "Tag damage from several whips stacks; crit chances are treated as independent events.",
      "Tags only affect minions, sentries and their projectiles, not whips or other summon damage sources.",
    ],
  },
  "whip-speed": {
    title: "Melee speed and whips",
    summary: "Which bonuses affect whip speed.",
    points: [
      "Whips benefit from melee speed, the autoswing from Feral Claws and its upgrades, and from flasks. No other melee bonus affects them.",
      "Use time = useAnimation / (1 + melee speed + whip speed buffs).",
      "The Obsidian set gives +15% whip speed multiplicatively (the only set with that bonus).",
      "The best modifier for a whip is Legendary.",
    ],
  },
  "feral-wicked": {
    title: "Feral Claws vs Wicked Claws",
    summary: "How they relate and whether to wear both.",
    points: [
      "Wicked Claws = Wicked Armlet + Feral Claws (Tinkerer's Workshop), so to wear both you need 2 Feral Claws.",
      "Melee speed DOES stack between them (+12% + 12% = +24%).",
      "Autoswing does not stack (both grant it) and the Wicked Armlet's +1 tag/knockback does not stack with its upgrades.",
    ],
  },
  "accessory-slots": {
    title: "Accessory slots by difficulty",
    summary: "How many accessories you can equip per mode.",
    points: [
      "Classic: 5 accessories.",
      "Expert: 5, and 6 after using the Demon Heart (obtained from the Wall of Flesh).",
      "Master: 6, and 7 after using the Demon Heart.",
      "The Demon Heart can only be used in Expert/Master and is consumed when equipped.",
    ],
  },
};

export const SET_EN: Partial<Record<string, { bonus?: string; note?: string }>> = {
  "platinum-armor": { bonus: "+4 defense.", note: "Alternative: Gold Armor (75 platinum bars)." },
  "shadow-armor": {
    bonus: "+75% acceleration/deceleration and ×1.15 max speed.",
    note: "Corruption (Demonite, 60 bars).",
  },
  "crimson-armor": {
    bonus: "+50% natural life regeneration and doubles its ramp-up speed.",
    note: "Crimson (Crimtane, 60 bars). Also +9% damage.",
  },
  "molten-armor": {
    bonus: "+10% melee damage. Immunity to fire blocks and the On Fire! debuff.",
    note: "Requires Hellstone (45 hellstone bars). Full set: +25 defense and +17% melee damage.",
  },
  "necro-armor": {
    bonus: "+10% ranged critical strike chance.",
    note: "Bones + Cobwebs (post-Skeletron). Also +15% ranged damage.",
  },
  "fossil-armor": {
    bonus: "20% chance to not consume ammo.",
    note: "Desert (Sturdy Fossil). Also +5% ranged damage and +8% crit.",
  },
  "meteor-armor": {
    bonus: "The Space Gun (and Laser Rifle/Zapinators) cost 0 mana. The classic early magic combo.",
    note: "Requires Meteorite Bars. Also +27% magic damage.",
  },
  "jungle-armor": {
    bonus: "-16% mana cost.",
    note: "Jungle Spores + materials. Also: +6% magic damage, +12% magic crit and +80 mana.",
  },
  "bee-armor": {
    bonus: "+10% summon damage (set bonus).",
    note: "Post Queen Bee (Bee Wax). Pieces add +23% summon damage and +2 minions.",
  },
  "obsidian-armor": {
    bonus: "+30% whip range and +15% whip speed; +15% summon damage. The pre-Hardmode whip set.",
    note: "Obsidian: ideal for whip summoner. Pieces add +31% summon damage and +1 minion.",
  },
  "spider-armor": {
    bonus: "+12% summon damage (set bonus).",
    note: "Spider Fangs. Pieces add +28% summon damage and +3 minions.",
  },
  "forbidden-armor": {
    bonus: "Double tap (set bonus key): summons an ancient storm under the cursor.",
    note: "Forbidden Fragments (Sandstorms). Pieces add +25% magic/summon damage and +2 minions.",
  },
  "adamantite-armor": {
    bonus: "+20% melee and movement speed (Helmet/melee variant).",
    note: "Adamantite Bars (54 with one head). Rival of Titanium. Other heads: Mask (ranged) +25% ammo conservation; Headgear (magic) -19% mana cost.",
  },
  "titanium-armor": {
    bonus: "Attacking grants a defensive shield of titanium shards.",
    note: "Titanium Bars (59 with one head). Requires a world with Titanium. Up to 7 shards of 50 damage.",
  },
  "hallowed-armor": {
    bonus: "You dodge the next attack after hitting an enemy (Holy Protection, 30 s cooldown).",
    note: "Hallowed Bars (after a Mechanical Boss). The Hood (summoner) variant adds +2 minions.",
  },
  "chlorophyte-armor": {
    bonus: "Summons a leaf crystal that shoots nearby enemies.",
    note: "Chlorophyte Bars (54 with one head). Class variants: Mask (melee) with -5% damage taken; Visor (summoner) with extra minions.",
  },
  "shroomite-armor": {
    bonus: "Standing still puts you in stealth: increases ranged capability and reduces the chance enemies target you.",
    note: "Shroomite Bars (Truffle). Helmets specialized by ammo type: bows, guns or special.",
  },
  "spectre-armor": {
    bonus: "Reduces magic damage by 40% and converts it into healing (lifesteal).",
    note: "Spectre Bars (post-Plantera). With the Spectre Mask, magic damage also hits extra nearby enemies.",
  },
  "beetle-armor": {
    bonus: "Beetles increase your melee damage and speed (Scale Mail variant).",
    note: "Beetle Husks (Golem). With Beetle Shell, beetles reduce damage taken by up to 45%.",
  },
  "tiki-armor": {
    bonus: "+1 minion slot and +20% whip range.",
    note: "Witch Doctor (jungle, post-Plantera). Pieces add +30% summon damage and +4 minions.",
  },
  "spooky-armor": {
    bonus: "+25% summon damage (set bonus). More offensive than Tiki.",
    note: "Spooky Wood (Pumpkin Moon). Pieces add +58% summon damage, +4 minions and +20% movement speed.",
  },
  "vortex-armor": {
    bonus: "Double tap ↓: stealth mode with more ranged capability and less aggro (reduces movement speed).",
    note: "Vortex Fragments + Luminite.",
  },
  "nebula-armor": {
    bonus: "Magic damage has a chance to spawn boosters; pick them up for stackable buffs. The definitive magic set.",
    note: "Nebula Fragments + Luminite. Stackable boosters: life (+3 HP/s), mana (+10/s) or damage (+15%).",
  },
  "solar-flare-armor": {
    bonus: "-12% damage taken and solar shields that charge over time to protect you and let you dash. The definitive post-Moon Lord melee set.",
    note: "Solar Fragments + Luminite. The Solar Blaze buff adds +20% extra damage reduction.",
  },
  "stardust-armor": {
    bonus: "A stardust guardian protects you from nearby enemies.",
    note: "Stardust Fragments + Luminite. Pieces add +66% summon damage, +5 minions and +1 sentry slot.",
  },
  "flinx-armor": {
    bonus: "+1 minion slot and +5% summon damage.",
    note: "Flinx Fur. Single piece (no set bonus of its own).",
  },
  "wizard-set": {
    bonus: "+10% magic crit when combining the Wizard Hat with any robe (Gem Robe or Mystic Robe).",
    note: "Pair it with a Gem Robe matching your gem staff to use the 1.4.5.7 enchantment.",
  },
  "spectre-mask-armor": {
    bonus: "Set (Mask): magic hits spawn homing orbs that deal damage (100% of the weapon damage, can crit).",
    note: "Switch to the Spectre Hood for the lifesteal set (-25% net magic damage).",
  },
  "adamantite-magic": {
    bonus: "Adamantite magic helmet: +12% magic damage, +12% crit and +80 mana; with the full set, -19% mana cost.",
    note: "Pre-mech offensive mix: Headgear + Adamantite Breastplate + Forbidden Treads.",
  },
  "hallowed-magic": {
    bonus: "Hallowed magic helmet: +12% magic damage, +12% crit and +100 mana.",
    note: "Pre-Plantera offensive mix: Headgear + Chlorophyte Plate Mail + Apprentice's Trousers (+39% magic crit).",
  },
  "squire-armor": {
    bonus: "+2 sentries and improved Ballista; +2 HP/s.",
    note: "Old One's Army tier 2 (after 1 mechanical boss).",
  },
  "valhalla-knight-armor": {
    bonus: "+3 sentries and life regeneration.",
    note: "Old One's Army tier 3 (post-Golem).",
  },
};

export const ITEM_OBTAIN_EN: Partial<Record<string, string>> = {};

export const VARIANT_EN: Partial<Record<string, { title?: string; intro?: string }>> = {
  "MELEE:YOYO": { title: "Yoyos", intro: "Yoyos and yoyo-specific accessories." },
  "RANGED:GUN": { title: "Guns" },
  "RANGED:LAUNCHER": { title: "Launchers" },
  "RANGED:THROWN": { title: "Throwables" },
  "SUMMONER:SENTRY": { title: "Sentries" },
  "SUMMONER:WHIP": { title: "Whips" },
};

export function variantText(
  locale: Locale,
  classType: string,
  subclass: string,
  fallback: { title?: string; intro?: string },
): { title?: string; intro?: string } {
  if (locale !== "en") return fallback;
  const en = VARIANT_EN[`${classType}:${subclass}`];
  return { title: en?.title ?? fallback.title, intro: en?.intro ?? fallback.intro };
}

export function itemObtain(locale: Locale, item: Item, indexes: DataIndexes): string {
  if (locale !== "en") return item.obtainDescription;
  const curated = ITEM_OBTAIN_EN[item.id];
  if (curated) return curated;

  // Genera el texto EN desde los datos estructurados (nombres ya en inglés).
  const recipes = indexes.recipesByResult.get(item.id);
  if (recipes && recipes.length > 0) {
    const r = recipes[0];
    const ing = r.ingredients
      .map((x) => `${x.qty}× ${indexes.items.get(x.item)?.name ?? x.item}`)
      .join(" + ");
    return r.station ? `Crafted at ${r.station}: ${ing}.` : `Crafted: ${ing}.`;
  }
  const drops = indexes.dropsByItem.get(item.id);
  if (drops && drops.length > 0) {
    const sources = [...new Set(drops.map((d) => d.from))].slice(0, 4).join(", ");
    return `Obtained from: ${sources}.`;
  }
  return item.obtainDescription;
}

export function setBonus(
  locale: Locale,
  set: { id: string; bonus: string },
): string {
  return (locale === "en" && SET_EN[set.id]?.bonus) || set.bonus;
}

/** Convierte el valor de venta (p. ej. "20 oro") al idioma actual. */
export function sellText(locale: Locale, sell: string): string {
  if (locale !== "en") return sell;
  return sell
    .replaceAll("oro", "gold")
    .replaceAll("plata", "silver")
    .replaceAll("cobre", "copper");
}

/** Fuentes de drops con texto en español. */
export const DROP_FROM_EN: Partial<Record<string, string>> = {
  "Bioma Cementerio": "Graveyard biome",
  "Comercio Goblin Tinkerer": "Goblin Tinkerer shop",
};

export function dropFrom(locale: Locale, from: string): string {
  return (locale === "en" && DROP_FROM_EN[from]) || from;
}

export function buildTitle(locale: Locale, build: Build): string {
  return (locale === "en" && BUILD_EN[build.id]?.title) || build.title;
}

export function buildIntro(locale: Locale, build: Build): string {
  return (locale === "en" && BUILD_EN[build.id]?.intro) || build.intro;
}

export function buildStartGuide(locale: Locale, build: Build): string[] {
  return (locale === "en" && BUILD_EN[build.id]?.startGuide) || build.startGuide || [];
}

export function slotWhy(locale: Locale, slot: BuildSlot): string {
  const key = `${slot.slot}:${slot.item ?? ""}`;
  return (locale === "en" && SLOT_WHY_EN[key]) || slot.why;
}

export function mechanicText(
  locale: Locale,
  mechanic: Mechanic,
): { title: string; summary: string; points: string[] } {
  const en = locale === "en" ? MECHANIC_EN[mechanic.id] : undefined;
  return {
    title: en?.title ?? mechanic.title,
    summary: en?.summary ?? mechanic.summary,
    points: en?.points ?? mechanic.points,
  };
}
