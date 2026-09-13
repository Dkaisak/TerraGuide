import type {
  AccessoryRole,
  ClassType,
  Difficulty,
  GameStage,
  ItemType,
  Subclass,
} from "@/types/data";

export type Locale = "es" | "en";

export const LOCALES: Locale[] = ["es", "en"];
export const DEFAULT_LOCALE: Locale = "es";

export const LOCALE_NAME: Record<Locale, string> = {
  es: "Español",
  en: "English",
};

export const LOCALE_SHORT: Record<Locale, string> = {
  es: "ES",
  en: "EN",
};

/** Diccionario de la interfaz (no incluye el contenido curado de los datos). */
export const MESSAGES = {
  es: {
    // Navegación / chrome
    "nav.tagline": "Builds de Terraria",
    "nav.items": "Ítems",
    "nav.mechanics": "Mecánicas",
    "nav.builder": "Builder",
    "nav.builderCta": "Crea tu build",
    "nav.builderCtaTitle": "Abre el Build Tester y crea builds personalizadas",
    "nav.changelog": "Changelog",
    "nav.dataAligned": "Datos alineados a Terraria {version}.",
    "nav.disclaimer": "No afiliado a Re-Logic. Ítems y sprites © Re-Logic.",
    "nav.searchPlaceholder": "Buscar ítem…",
    "nav.searchAria": "Buscar ítem o build",
    "nav.language": "Idioma",
    // Comunes
    "common.difficulty": "Dificultad",
    "common.wiki": "Wiki",
    "common.clear": "Limpiar",
    "common.share": "Compartir",
    "common.copied": "¡Copiado!",
    "common.loading": "Cargando ficha…",
    "common.expertPlus": "Expert+",
    "common.noResults": "Sin resultados",
    "common.view": "Ver {name}",
    "common.markObtained": "Marcar como obtenido",
    "common.markedObtained": "Marcado como obtenido",
    "common.markPending": "Marcar como pendiente",
    "common.buildsCount": "{n} builds",
    "common.current": "Actual",
    "common.boss": "Jefe",
    "common.yes": "Sí",
    // Home
    "home.titleA": "Builds óptimas",
    "home.titleB": "en cada fase del juego",
    "home.intro":
      "Elige tu clase y recorre las 9 fases de Terraria {version} con el loadout más eficiente de cada momento: armadura, armas, accesorios y buffs, con el porqué de cada ítem.",
    "home.statStages": "{n} fases",
    "home.statBuilds": "{n} builds",
    "home.statItems": "{n} ítems",
    "home.statRecipes": "{n} recetas",
    "home.statDrops": "{n} drops",
    "home.chooseClass": "Elige tu clase",
    "home.path": "El camino por fases",
    // Página de build
    "page.navigate": "Navega",
    "page.recorriendo":
      "Recorriendo todas las clases. El timeline marca la fase actual.",
    "page.classStart": "← Inicio de la clase",
    "page.classEnd": "Final de la clase",
    // Build dashboard
    "build.chooseItems": "Elegir ítems",
    "build.allClasses": "Todas las clases (mixto)",
    "build.noWeapon": "— Sin arma —",
    "build.none": "— Ninguno —",
    "build.weapon": "Arma",
    "build.weaponMod": "Modificador del arma",
    "build.accessoryN": "Accesorio {n}",
    "build.accessoryModN": "Modificador del accesorio {n}",
    "build.startGuideTitle": "Cómo empezar esta fase",
    "build.arenaTitle": "Arena y estrategia",
    "build.subclassTitle": "Subclase",
    "build.orderTitle": "Orden recomendado",
    "build.materialsTitle": "Lista de materiales",
    "build.materialsIntro":
      "Materiales e ingredientes necesarios para craftear los ítems de esta build (incluye ingredientes que se obtienen por botín).",
    "build.farmTitle": "Ruta de farmeo",
    "build.farmIntro":
      "Dónde conseguir los ítems de esta build, agrupado por zona. Los ítems crafteados aparecen como sus materiales base.",
    "build.changesTitle": "Cambios desde {stage}",
    "build.changesFallback": "la fase anterior",
    "build.new": "Nuevo",
    "build.removed": "Ya no se usa",
    "build.setBonus": "Set {name}:",
    "build.group.armor": "Armadura",
    "build.group.weapons": "Armas",
    "build.group.accessories": "Accesorios",
    "build.group.utility": "Utilidad",
    // Ítems
    "item.notFound": "Ítem no encontrado en el dataset (id: {id}).",
    "item.armorSet": "Set de armadura",
    "item.pieces": "Piezas:",
    "item.piecesMark": "Marcar piezas como conseguidas",
    "item.piecesDone": "✓ Piezas conseguidas",
    "item.howToGet": "Cómo conseguirlo",
    "item.stats": "Estadísticas",
    "item.sources": "Fuentes de obtención",
    "item.crafting": "Crafteo",
    "item.variants": "Variantes:",
    "item.expertOnly": "Solo Expert/Master",
    "item.setBadge": "Set",
    "stat.damage": "Daño",
    "stat.defense": "Defensa",
    "stat.critical": "Crítico",
    "stat.useTime": "Uso",
    "stat.knockback": "Knockback",
    "stat.mana": "Maná",
    "stat.velocity": "Velocidad",
    "stat.rarity": "Rareza",
    "stat.autoswing": "Autoswing",
    "stat.sell": "Venta",
    "stat.damageShort": "{n} daño",
    "stat.defenseShort": "{n} def",
    // Crafteo
    "craft.none": "No tiene receta registrada en el dataset.",
    "craft.requires": "Requiere",
    "craft.at": "En {station}",
    "craft.usedIn": "Se usa en",
    "craft.cycle": "{name} (ciclo)",
    // Buscadores
    "search.placeholder": "Buscar ítem o build…",
    "search.open": "Buscar (Ctrl/⌘+K)",
    "search.noResults": "Sin resultados para “{query}”.",
    "search.footer": "↑↓ navegar · Enter abrir · Esc cerrar · Cmd/Ctrl+K para alternar",
    "search.allClasses": "Todas",
    "search.allTypes": "Todo",
    "search.hideExpert": "Ocultar Expert+",
    "search.close": "esc",
    // Base de datos de ítems
    "items.title": "Base de datos de ítems",
    "items.intro":
      "Explora los {n} ítems del dataset. Filtra por clase, tipo, rol y rareza, y haz clic en cualquiera para ver sus fuentes de obtención, recetas y estadísticas.",
    "items.search": "Buscar por nombre…",
    "items.allClasses": "Todas las clases",
    "items.allTypes": "Todos los tipos",
    "items.allRoles": "Todos los roles",
    "items.allRarities": "Toda rareza",
    "items.rarityN": "Rareza {n}",
    "items.sortName": "Ordenar: nombre",
    "items.sortRarity": "Ordenar: rareza",
    "items.results": "{n} resultado(s)",
    "items.showMore": "Mostrar más ({n} restantes)",
    "items.empty": "No hay ítems que coincidan con los filtros.",
    // Mecánicas
    "mechanics.title": "Notas de mecánicas",
    "mechanics.intro":
      "Detalles que no se ven en las builds: apilado de tags, velocidad de látigos, huecos de accesorio y otras reglas verificadas en la wiki.",
    "mechanics.wikiTitle": "Abrir {page} en Wiki.gg",
    // Changelog
    "changelog.title": "Changelog de datos",
    "changelog.intro":
      "El dataset de TerraGuide se mantiene a mano y se versiona: cada cambio en los JSON es un diff revisable. Esta página lista las actualizaciones alineadas a la versión del juego.",
    "changelog.updated": "actualizado {date}",
    // Build Tester
    "tester.title": "Build Tester",
    "tester.intro":
      "Viste a tu personaje con armas, armaduras y accesorios y compara las estadísticas en vivo. El DPS es una estimación con los bonus porcentuales de accesorios/armadura (daño × golpes/s, crítico como doble daño); no incluye efectos especiales ni set bonuses no numéricos.",
    "tester.compare": "Comparar con…",
    "tester.compareCustom": "Personalizada (editar abajo)",
    "tester.curated": "Builds curadas",
    "tester.saved": "Guardadas",
    "tester.loadBuild": "Cargar una build…",
    "tester.optimalReforge": "Reforjar óptimo",
    "tester.optimalReforgeTitle":
      "Aplica el mejor modificador a cada accesorio (según su rol) y al arma (según su clase)",
    "tester.clear": "Limpiar",
    "tester.share": "Compartir",
    "tester.stats": "Estadísticas",
    "tester.comparison": "Comparación",
    "tester.current": "Actual",
    "tester.buildB": "Build B (personalizada)",
    "tester.save": "Guardar",
    "tester.saveName": "Nombre…",
    "tester.colStat": "Stat",
    "tester.colCurrent": "Actual",
    "tester.equipped": "Equipado ({n})",
    "tester.stat.defenseTotal": "Defensa total",
    "tester.stat.effDamage": "Daño efectivo",
    "tester.stat.dmgBonus": "Bonus de daño",
    "tester.stat.crit": "Crítico",
    "tester.stat.critBonus": "Bonus de crítico",
    "tester.stat.use": "Uso",
    "tester.stat.hitsPerSec": "Golpes/s",
    "tester.stat.dps": "DPS estimado",
    "tester.stat.manaMax": "Maná máx.",
    "tester.stat.manaCost": "Coste de maná",
    "tester.stat.dmgReduction": "Reducción daño",
    "tester.stat.ammoSave": "Ahorro munición",
    "tester.stat.defense": "Defensa",
    "common.delete": "Eliminar",
  },
  en: {
    "nav.tagline": "Terraria builds",
    "nav.items": "Items",
    "nav.mechanics": "Mechanics",
    "nav.builder": "Builder",
    "nav.builderCta": "Build your own",
    "nav.builderCtaTitle": "Open the Build Tester and create custom builds",
    "nav.changelog": "Changelog",
    "nav.dataAligned": "Data aligned with Terraria {version}.",
    "nav.disclaimer": "Not affiliated with Re-Logic. Items and sprites © Re-Logic.",
    "nav.searchPlaceholder": "Search item…",
    "nav.searchAria": "Search item or build",
    "nav.language": "Language",
    "common.difficulty": "Difficulty",
    "common.wiki": "Wiki",
    "common.clear": "Clear",
    "common.share": "Share",
    "common.copied": "Copied!",
    "common.loading": "Loading item…",
    "common.expertPlus": "Expert+",
    "common.noResults": "No results",
    "common.view": "View {name}",
    "common.markObtained": "Mark as obtained",
    "common.markedObtained": "Marked as obtained",
    "common.markPending": "Mark as pending",
    "common.buildsCount": "{n} builds",
    "common.current": "Current",
    "common.boss": "Boss",
    "common.yes": "Yes",
    "home.titleA": "Optimal builds",
    "home.titleB": "for every stage of the game",
    "home.intro":
      "Pick your class and walk through the 9 stages of Terraria {version} with the most efficient loadout at each point: armor, weapons, accessories and buffs, with the reasoning behind every item.",
    "home.statStages": "{n} stages",
    "home.statBuilds": "{n} builds",
    "home.statItems": "{n} items",
    "home.statRecipes": "{n} recipes",
    "home.statDrops": "{n} drops",
    "home.chooseClass": "Choose your class",
    "home.path": "The stage path",
    "page.navigate": "Navigate",
    "page.recorriendo":
      "Browsing all classes. The timeline marks the current stage.",
    "page.classStart": "← Start of class",
    "page.classEnd": "End of class",
    "build.chooseItems": "Choose items",
    "build.allClasses": "All classes (mixed)",
    "build.noWeapon": "— No weapon —",
    "build.none": "— None —",
    "build.weapon": "Weapon",
    "build.weaponMod": "Weapon modifier",
    "build.accessoryN": "Accessory {n}",
    "build.accessoryModN": "Accessory {n} modifier",
    "build.startGuideTitle": "How to start this stage",
    "build.arenaTitle": "Arena & strategy",
    "build.subclassTitle": "Subclass",
    "build.orderTitle": "Recommended order",
    "build.materialsTitle": "Material list",
    "build.materialsIntro":
      "Materials and ingredients needed to craft this build's items (includes ingredients obtained as loot).",
    "build.farmTitle": "Farming route",
    "build.farmIntro":
      "Where to get this build's items, grouped by zone. Crafted items appear as their base materials.",
    "build.changesTitle": "Changes since {stage}",
    "build.changesFallback": "the previous stage",
    "build.new": "New",
    "build.removed": "No longer used",
    "build.setBonus": "Set {name}:",
    "build.group.armor": "Armor",
    "build.group.weapons": "Weapons",
    "build.group.accessories": "Accessories",
    "build.group.utility": "Utility",
    "item.notFound": "Item not found in the dataset (id: {id}).",
    "item.armorSet": "Armor set",
    "item.pieces": "Pieces:",
    "item.piecesMark": "Mark pieces as obtained",
    "item.piecesDone": "✓ Pieces obtained",
    "item.howToGet": "How to get it",
    "item.stats": "Stats",
    "item.sources": "Drop sources",
    "item.crafting": "Crafting",
    "item.variants": "Variants:",
    "item.expertOnly": "Expert/Master only",
    "item.setBadge": "Set",
    "stat.damage": "Damage",
    "stat.defense": "Defense",
    "stat.critical": "Crit",
    "stat.useTime": "Use",
    "stat.knockback": "Knockback",
    "stat.mana": "Mana",
    "stat.velocity": "Velocity",
    "stat.rarity": "Rarity",
    "stat.autoswing": "Autoswing",
    "stat.sell": "Sell",
    "stat.damageShort": "{n} dmg",
    "stat.defenseShort": "{n} def",
    "craft.none": "No recipe registered in the dataset.",
    "craft.requires": "Requires",
    "craft.at": "At {station}",
    "craft.usedIn": "Used in",
    "craft.cycle": "{name} (cycle)",
    "search.placeholder": "Search item or build…",
    "search.open": "Search (Ctrl/⌘+K)",
    "search.noResults": "No results for “{query}”.",
    "search.footer": "↑↓ navigate · Enter open · Esc close · Cmd/Ctrl+K to toggle",
    "search.allClasses": "All",
    "search.allTypes": "All",
    "search.hideExpert": "Hide Expert+",
    "search.close": "esc",
    "items.title": "Item database",
    "items.intro":
      "Browse the {n} items in the dataset. Filter by class, type, role and rarity, and click any of them to see its drop sources, recipes and stats.",
    "items.search": "Search by name…",
    "items.allClasses": "All classes",
    "items.allTypes": "All types",
    "items.allRoles": "All roles",
    "items.allRarities": "All rarities",
    "items.rarityN": "Rarity {n}",
    "items.sortName": "Sort: name",
    "items.sortRarity": "Sort: rarity",
    "items.results": "{n} result(s)",
    "items.showMore": "Show more ({n} left)",
    "items.empty": "No items match the filters.",
    "mechanics.title": "Mechanics notes",
    "mechanics.intro":
      "Details you won't see in the builds: tag stacking, whip speed, accessory slots and other rules verified on the wiki.",
    "mechanics.wikiTitle": "Open {page} on Wiki.gg",
    "changelog.title": "Data changelog",
    "changelog.intro":
      "TerraGuide's dataset is hand-maintained and versioned: every change to the JSON is a reviewable diff. This page lists the updates aligned with the game version.",
    "changelog.updated": "updated {date}",
    "tester.title": "Build Tester",
    "tester.intro":
      "Dress your character with weapons, armor and accessories and compare the stats live. DPS is an estimate using the percentage bonuses from accessories/armor (damage × hits/s, crit as double damage); it does not include special effects or non-numeric set bonuses.",
    "tester.compare": "Compare with…",
    "tester.compareCustom": "Custom (edit below)",
    "tester.curated": "Curated builds",
    "tester.saved": "Saved",
    "tester.loadBuild": "Load a build…",
    "tester.optimalReforge": "Optimal reforge",
    "tester.optimalReforgeTitle":
      "Applies the best modifier to each accessory (by role) and to the weapon (by class)",
    "tester.clear": "Clear",
    "tester.share": "Share",
    "tester.stats": "Stats",
    "tester.comparison": "Comparison",
    "tester.current": "Current",
    "tester.buildB": "Build B (custom)",
    "tester.save": "Save",
    "tester.saveName": "Name…",
    "tester.colStat": "Stat",
    "tester.colCurrent": "Current",
    "tester.equipped": "Equipped ({n})",
    "tester.stat.defenseTotal": "Total defense",
    "tester.stat.effDamage": "Effective damage",
    "tester.stat.dmgBonus": "Damage bonus",
    "tester.stat.crit": "Crit",
    "tester.stat.critBonus": "Crit bonus",
    "tester.stat.use": "Use",
    "tester.stat.hitsPerSec": "Hits/s",
    "tester.stat.dps": "Estimated DPS",
    "tester.stat.manaMax": "Max mana",
    "tester.stat.manaCost": "Mana cost",
    "tester.stat.dmgReduction": "Damage reduction",
    "tester.stat.ammoSave": "Ammo save",
    "tester.stat.defense": "Defense",
    "common.delete": "Delete",
  },
} as const;

export type MessageKey = keyof typeof MESSAGES.es;

/** Traduce una clave de la interfaz, con interpolación `{var}`. */
export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  const dict = MESSAGES[locale] as Record<string, string>;
  let out = dict[key] ?? (MESSAGES.es as Record<string, string>)[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.replaceAll(`{${k}}`, String(v));
    }
  }
  return out;
}

export const CLASS_LABEL_I18N: Record<Locale, Record<ClassType, string>> = {
  es: { MELEE: "Melé", RANGED: "Distancia", MAGIC: "Magia", SUMMONER: "Invocador", GENERAL: "General" },
  en: { MELEE: "Melee", RANGED: "Ranged", MAGIC: "Magic", SUMMONER: "Summoner", GENERAL: "General" },
};

export const CLASS_TAGLINE_I18N: Record<Locale, Record<ClassType, string>> = {
  es: {
    MELEE: "Espadas, yoyos y martillos de cadena",
    RANGED: "Arcos, pistolas y lanzacohetes",
    MAGIC: "Bastones, tomos y pistolas mágicas",
    SUMMONER: "Miniones y látigos",
    GENERAL: "Ítems de utilidad general",
  },
  en: {
    MELEE: "Swords, yoyos and chain flails",
    RANGED: "Bows, guns and launchers",
    MAGIC: "Staves, tomes and magic guns",
    SUMMONER: "Minions and whips",
    GENERAL: "General utility items",
  },
};

export const DIFFICULTY_LABEL_I18N: Record<Locale, Record<Difficulty, string>> = {
  es: { CLASSIC: "Normal", EXPERT: "Experto", MASTER: "Maestro" },
  en: { CLASSIC: "Classic", EXPERT: "Expert", MASTER: "Master" },
};

export const ITEM_TYPE_LABEL_I18N: Record<Locale, Record<ItemType, string>> = {
  es: {
    WEAPON: "Arma", ARMOR: "Armadura", ACCESSORY: "Accesorio",
    AMMO: "Munición", BUFF: "Buff", MATERIAL: "Material",
  },
  en: {
    WEAPON: "Weapon", ARMOR: "Armor", ACCESSORY: "Accessory",
    AMMO: "Ammo", BUFF: "Buff", MATERIAL: "Material",
  },
};

export const ACCESSORY_ROLE_LABEL_I18N: Record<Locale, Record<AccessoryRole, string>> = {
  es: { OFENSIVO: "ofensivo", DEFENSIVO: "defensivo", MOVILIDAD: "movilidad", UTILIDAD: "utilidad" },
  en: { OFENSIVO: "offensive", DEFENSIVO: "defensive", MOVILIDAD: "mobility", UTILIDAD: "utility" },
};

export const SUB_CLASS_LABEL_I18N: Record<Locale, Record<Subclass, string>> = {
  es: {
    SWORD: "Espada", YOYO: "Yoyo", FLAIL: "Mayal", SPEAR: "Lanza", BOOMERANG: "Bumerán",
    BOW: "Arco", GUN: "Pistola", LAUNCHER: "Lanzador", THROWN: "Arrojadizo",
    STAFF: "Varita", TOME: "Tomo", MAGIC_GUN: "Pistola mágica",
    MINION: "Minión", WHIP: "Látigo", SENTRY: "Torreta",
  },
  en: {
    SWORD: "Sword", YOYO: "Yoyo", FLAIL: "Flail", SPEAR: "Spear", BOOMERANG: "Boomerang",
    BOW: "Bow", GUN: "Gun", LAUNCHER: "Launcher", THROWN: "Thrown",
    STAFF: "Staff", TOME: "Tome", MAGIC_GUN: "Magic gun",
    MINION: "Minion", WHIP: "Whip", SENTRY: "Sentry",
  },
};

export const STAGE_LABEL_I18N: Record<Locale, Record<GameStage, string>> = {
  es: {
    PRE_BOSSES: "Pre-Bosses",
    PRE_SKELETRON: "Pre-Esqueleto",
    PRE_HARDMODE: "Pre-Modo Difícil",
    PRE_MECH_BOSSES: "Pre-Bosses Mecánicos",
    PRE_PLANTERA: "Pre-Plantera",
    PRE_GOLEM: "Pre-Gólem",
    PRE_LUNAR_EVENTS: "Pre-Eventos Lunares",
    PRE_MOON_LORD: "Pre-Moon Lord",
    POST_MOON_LORD: "Post-Moon Lord",
  },
  en: {
    PRE_BOSSES: "Pre-Bosses",
    PRE_SKELETRON: "Pre-Skeletron",
    PRE_HARDMODE: "Pre-Hardmode",
    PRE_MECH_BOSSES: "Pre-Mechanical Bosses",
    PRE_PLANTERA: "Pre-Plantera",
    PRE_GOLEM: "Pre-Golem",
    PRE_LUNAR_EVENTS: "Pre-Lunar Events",
    PRE_MOON_LORD: "Pre-Moon Lord",
    POST_MOON_LORD: "Post-Moon Lord",
  },
};

export const SLOT_LABEL_I18N: Record<Locale, Record<string, string>> = {
  es: {
    HELMET: "Casco", CHEST: "Pecho", LEGS: "Piernas", SET_BONUS: "Set bonus",
    WEAPON: "Arma", WEAPON_ALT: "Arma alt.", MINION: "Minión", WHIP: "Látigo",
    ACCESSORY: "Accesorio", ACCESSORY_ALT: "Accesorio alt.", BUFF: "Buff", AMMO: "Munición",
  },
  en: {
    HELMET: "Helmet", CHEST: "Chest", LEGS: "Legs", SET_BONUS: "Set bonus",
    WEAPON: "Weapon", WEAPON_ALT: "Alt weapon", MINION: "Minion", WHIP: "Whip",
    ACCESSORY: "Accessory", ACCESSORY_ALT: "Alt accessory", BUFF: "Buff", AMMO: "Ammo",
  },
};

export const DAMAGE_TYPE_LABEL_I18N: Record<Locale, Record<string, string>> = {
  es: { MELEE: "Melee", RANGED: "Ranged", MAGIC: "Magia", SUMMON: "Invocación" },
  en: { MELEE: "Melee", RANGED: "Ranged", MAGIC: "Magic", SUMMON: "Summon" },
};

export const MOD_LABEL_I18N: Record<Locale, Record<string, string>> = {
  es: {
    damageAll: "daño", damageMelee: "daño melee", damageRanged: "daño ranged",
    damageMagic: "daño mágico", damageSummon: "daño summon",
    critAll: "crítico", critMelee: "crítico melee", critRanged: "crítico ranged",
    critMagic: "crítico mágico", critSummon: "crítico summon",
    defense: "defensa", meleeSpeed: "vel. melee", moveSpeed: "vel. mov.",
    manaMax: "maná", manaCost: "-coste maná", lifeRegen: "vida/s",
    damageReduction: "red. daño", ammoSave: "ahorro munición",
  },
  en: {
    damageAll: "damage", damageMelee: "melee damage", damageRanged: "ranged damage",
    damageMagic: "magic damage", damageSummon: "summon damage",
    critAll: "crit", critMelee: "melee crit", critRanged: "ranged crit",
    critMagic: "magic crit", critSummon: "summon crit",
    defense: "defense", meleeSpeed: "melee speed", moveSpeed: "move speed",
    manaMax: "mana", manaCost: "-mana cost", lifeRegen: "life/s",
    damageReduction: "dmg reduction", ammoSave: "ammo save",
  },
};
