# TerraGuide — Información completa del proyecto

> Documento generado a partir de `plan.md`, `terraguide.md` y el código fuente completo del repo.
> Versión base de datos del juego: **Terraria 1.4.5.7**.

## 1. Visión general

Aplicación web de **guía interactiva de builds de Terraria**. El jugador elige una
**clase** (Melee, Ranged, Magic, Summoner) y una **fase de la partida** (9 hitos
progresivos), y la app muestra la build óptima para ese momento: armadura, arma,
accesorios, buffs y munición, con el **porqué de cada ítem**, sus **estadísticas**,
su fuente de obtención (drop / tienda / crafteo con estación y cantidades), un
**árbol de crafteo** recursivo y una **lista de materiales** agregada.

- **UI en español**; nombres de ítems en inglés (fuente Wiki.gg).
- **Desktop-first** (UI densa, responsive mínimo).
- **Sin backend**: JSON estáticos versionados en el repo + SSG. Cero infraestructura.
- **Fuera de alcance v1**: mods/tModLoader (Calamity, etc.), login, API server, scraper.

## 2. Stack tecnológico

| Capa          | Tecnología                                              |
|---------------|---------------------------------------------------------|
| Framework     | Next.js **16.3.5** (App Router, Turbopack, SSG)         |
| Lenguaje      | TypeScript estricto (tsconfig `strict: true`)           |
| UI            | React **19.2.8**                                        |
| Estilos       | Tailwind CSS **v4** (tema oscuro, toques retro-gaming)  |
| Datos         | JSON curados en `data/` + tipos TS derivados            |
| Validación    | zod **4.6.2** (schemas del dataset + integridad en CI)  |
| Búsqueda      | **MiniSearch 7.2.0** client-side con índice precomputado (`public/search-index.json`) |
| Estado local  | localStorage vía hooks propios (`usePersistedState`), sin Zustand |

### Dependencias (`package.json`)

- Producción: `minisearch`, `next`, `react`, `react-dom`, `zod`.
- Desarrollo: `@tailwindcss/postcss`, `@types/node`, `@types/react`, `@types/react-dom`,
  `eslint`, `eslint-config-next`, `tailwindcss`, `tsx`, `typescript`.

## 3. Estructura del repositorio

```
TerraGuide/
├── data/                        # dataset JSON curado (los "datos del juego")
│   ├── version.json             # gameVersion + updatedAt + changelog
│   ├── stages.json              # 9 fases con orden, título y hitos ("gate")
│   ├── items.json               # 873 ítems (armas, armaduras, accesorios, materiales, pociones) + stats
│   ├── sets.json                # 32 sets de armadura (head/chest/legs + bonus)
│   ├── recipes.json             # 672 recetas (resultado, cantidad, ingredientes, estación)
│   ├── drops.json               # 1.199 fuentes de obtención (drops + tiendas de NPC)
│   └── builds.json              # 36 builds (4 clases × 9 fases) + variantes de subclase
├── scripts/
│   ├── validate-data.ts         # validación zod + integridad referencial (CI)
│   ├── generate-search-index.ts # genera public/search-index.json (predev/prebuild)
│   ├── fetch-item-images.ts     # descarga sprites de ítems → public/items/ (npm run images)
│   ├── fetch-set-images.ts      # descarga imágenes de sets → public/sets/ (npm run sets)
│   └── fetch-wiki-details.ts    # drops + recetas + stats + tiendas desde la API Cargo (npm run details)
├── public/
│   ├── search-index.json        # índice precomputado para la búsqueda
│   ├── items/                   # sprites de ítems (873 .png) + manifest.json
│   └── sets/                    # imágenes de sets completos (32 .png) + manifest.json
├── src/
│   ├── app/
│   │   ├── layout.tsx           # shell global (header, footer, CommandPalette)
│   │   ├── page.tsx             # Home: clase + timeline + contadores
│   │   ├── changelog/page.tsx   # changelog de datos (versión del juego)
│   │   └── [classType]/[stage]/page.tsx  # dashboard estático por clase/fase
│   ├── components/
│   │   ├── build/{BuildDashboard,ItemCard,ItemModal,CraftingTree,SubclassPicker}.tsx
│   │   ├── build/subclassTone.ts          # colores por subclase
│   │   ├── navigation/{ClassPicker,TimelineStages,DifficultySelector}.tsx
│   │   └── ui/{Badge,ProgressBar,CommandPalette,DifficultyToggle,ItemSprite,SetSprite}.tsx
│   ├── hooks/
│   │   ├── useChecklist.ts       # checklist de ítems obtenidos (localStorage)
│   │   └── usePersistedState.ts  # estado síncrono con localStorage (+ storage event)
│   ├── lib/
│   │   ├── loadData.ts           # carga síncrona de JSON + caché (server-only)
│   │   ├── indexing.ts           # índices en memoria, helpers de slug/refs y computeMaterials
│   │   ├── schemas.ts            # esquemas zod (source of truth de la forma de datos)
│   │   └── storage.ts            # claves de localStorage
│   └── types/data.ts             # tipos TS + labels (CLASE, FASE, SLOT, SUBCLASE)
├── plan.md                       # plan de trabajo original
├── terraguide.md                 # "resumen del proyecto" vivo (qué falta)
├── project.md                    # este documento
├── next.config.ts · postcss.config.mjs · tsconfig.json · eslint.config.mjs
└── package.json · package-lock.json
```

## 4. El dataset (`data/`) — volúmenes verificados

Conteo devuelto por `npm run validate`:

- **Versión del juego:** `1.4.5.7`.
- **Fases:** 9 (`PRE_BOSSES` … `POST_MOON_LORD`).
- **Ítems:** 873.
- **Sets de armadura:** 32.
- **Recetas:** 672.
- **Fuentes de obtención (drops):** 1.199 (1.109 drops de botín + 90 tiendas de NPC).
- **Builds:** 36 (4 clases × 9 fases) + variantes de subclase anidadas (`subclassSlots`).

Los IDs son **kebab-case** (p.ej. `crimson-helmet`, `wooden-yoyo`, `ironskin-potion`)
y **deben existir en `items.json`**; todo ítem citado en una build debe tener su
registro. Nada se inventa.

> El conteo oficial es el de `npm run validate`.

### Las 9 fases (`stages.json`)

| order | id                  | título                | hitos (`gate`)                              |
|-------|---------------------|-----------------------|---------------------------------------------|
| 0     | `PRE_BOSSES`        | Pre-Bosses            | Iron/Lead → Gold/Platinum; Eye of Cthulhu   |
| 1     | `PRE_EVIL_BOSS`     | Pre-Evil Boss         | Gold/Platinum, Demonite/Crimtane; EoW / BoC  |
| 2     | `PRE_SKELETRON`     | Pre-Esqueleto         | Hellstone (Molten); Skeletron               |
| 3     | `PRE_HARDMODE`      | Pre-Modo Difícil      | Hellstone, Obsidian; Wall of Flesh          |
| 4     | `PRE_MECH_BOSSES`   | Pre-Bosses Mecánicos  | Adamantite/Titanium; Destroyer/Twins/Prime  |
| 5     | `PRE_PLANTERA`      | Pre-Plantera          | Hallowed, Chlorophyte; Plantera             |
| 6     | `PRE_GOLEM`         | Pre-Gólem             | Chlorophyte, Shroomite, Spectre, Beetle, Tiki/Spooky; Golem |
| 7     | `PRE_LUNAR_EVENTS`  | Pre-Eventos Lunares   | Luminite; Lunatic Cultist → Pilares         |
| 8     | `POST_MOON_LORD`    | Post-Moon Lord        | Luminite, Fragmentos; Moon Lord             |

### Variantes de subclase (en `builds.json`)

- **Melee:** base **SWORD** (no-yoyo) + variante **YOYO** en las 9 fases.
- **Ranged:** base **BOW** + variante **GUN** (9 fases); **LAUNCHER** en
  pre-golem/pre-lunar/post-Moon-Lord; **THROWN** en pre-bosses/pre-evil/pre-skeletron/pre-hardmode.
- **Magic:** sin variantes (subclase base por fase: STAFF/TOME/MAGIC_GUN).
- **Summoner:** base **MINION** + variante **WHIP** (9 fases); **SENTRY** desde pre-skeletron.

### Contenido temático del dataset

- **Armas por clase y subclase** (espadas, yoyos, flails, lanzas, boomerangs,
  arcos, armas de fuego, lanzadores, arrojadizos, varitas, tomos, magic-guns,
  minions, látigos y sentries), con las mejores opciones por fase en 1.4.5.7.
- **Sets clave:** Platinum, Shadow/Crimson, Molten, Necro, Fossil, Meteor, Jungle,
  Bee, Obsidian, Spider, Forbidden, Adamantite/Titanium, Hallowed, Chlorophyte,
  Shroomite, Spectre, Beetle, Tiki, Spooky, Vortex, Nebula, Solar Flare, Stardust,
  Flinx, Squire, Valhalla Knight, y sets parciales custom (`wizard-set`,
  `adamantite-magic`, `hallowed-magic`, `spectre-mask-armor`).
- **Recetas emblemáticas:** Night's Edge → True Night's Edge → Terra Blade, Zenith,
  Megashark, boots (Spectre → Frostspark → Lava Waders → Terraspark), Ankh Shield,
  Celestial Shell, emblemas (Avenger → Destroyer), whips, staffs de minion y yoyos.
- **Estadísticas por ítem** (`stats`): daño + tipo, defensa, crítico, uso,
  knockback, maná, velocidad, rareza, autoswing, tooltip y valor de venta.

## 5. Modelo de tipos (`src/types/data.ts`)

```ts
type ItemType  = "WEAPON" | "ARMOR" | "ACCESSORY" | "AMMO" | "BUFF" | "MATERIAL";
type ClassType = "MELEE" | "RANGED" | "MAGIC" | "SUMMONER" | "GENERAL";
type Difficulty = "CLASSIC" | "EXPERT" | "MASTER";
type GameStage = "PRE_BOSSES" | "PRE_EVIL_BOSS" | "PRE_SKELETRON" | "PRE_HARDMODE"
               | "PRE_MECH_BOSSES" | "PRE_PLANTERA" | "PRE_GOLEM"
               | "PRE_LUNAR_EVENTS" | "POST_MOON_LORD";

type Subclass =
  | "SWORD" | "YOYO" | "FLAIL" | "SPEAR" | "BOOMERANG"   // MELEE
  | "BOW" | "GUN" | "LAUNCHER" | "THROWN"                // RANGED
  | "STAFF" | "TOME" | "MAGIC_GUN"                       // MAGIC
  | "MINION" | "WHIP" | "SENTRY";                        // SUMMONER
```

`CLASS_SUBCLASSES`: Melee → SWORD/YOYO/FLAIL/SPEAR/BOOMERANG;
Ranged → BOW/GUN/LAUNCHER/THROWN; Magic → STAFF/TOME/MAGIC_GUN;
Summoner → MINION/WHIP/SENTRY.

Interfaces principales: `Item` (+ `ItemStats`), `ArmorSet`, `Recipe`
(+`RecipeIngredient`), `Drop` (+`price`), `Build`, `BuildSlot`,
`BuildSubclassVariant`, `Dataset`, `SlimDataset`.

Slots de build (`BuildSlotType`): `HELMET`, `CHEST`, `LEGS`, `SET_BONUS`,
`WEAPON`, `WEAPON_ALT`, `MINION`, `WHIP`, `ACCESSORY`, `ACCESSORY_ALT`, `BUFF`,
`AMMO`.

Constantes de UI: `CLASS_ORDER`, `CLASS_LABEL`, `STAGE_LABEL`, `SLOT_LABEL`,
`SUB_CLASS_LABEL`, `DIFFICULTY_LABEL`, `DIFFICULTY_ORDER`.

## 6. Esquemas zod (`src/lib/schemas.ts`)

Single source of truth de la forma de los datos. Esquemas:

- `classTypeSchema`, `subclassSchema`, `itemTypeSchema`, `gameStageSchema`,
  `buildSlotTypeSchema`.
- `gameVersionSchema`, `stageSchema`, `itemSchema` (id kebab-case + `stats`
  opcional vía `itemStatsSchema`), `armorSetSchema`, `recipeSchema`,
  `dropSchema` (+ `price` opcional), `buildSlotSchema`,
  `buildSubclassVariantSchema`, `buildSchema` (+ `superRefine`: las builds no
  pueden ser de clase `GENERAL`).
- `datasetSchema` (envuelve los 7 archivos).

## 7. Arquitectura de la app

### Rutas (SSG)

- **`/`** — Home: selector de clase (`ClassPicker`), timeline de 9 fases
  (`TimelineStages`) y contadores del dataset.
- **`/[classType]/[stage]`** — dashboard de build generado con
  `generateStaticParams` desde `builds.json` (`dynamicParams = false` → 404 para
  todo combo no existente). Navegación prev/next por fase y `ClassPicker`
  resaltando la clase/fase actual.
- **`/changelog`** — página de changelog de datos.

Los slugs se derivan: `classSlug` = lowerCase; `stageSlug` = lowerCase con `_` → `-`.

### Carga de datos

- `loadData.ts` es **server-only** (`import "server-only"`): lee los JSON de
  `data/` con `readFileSync`, los parsea con zod y los cachea (`getDataset()`).
- `indexing.ts` construye mapas en memoria: `items`, `itemsByClass`, `sets`,
  `setByPiece`, `recipesByResult`, `recipesByIngredient`, `dropsByItem`,
  `buildsByClassStage` (key `clase::fase`), `buildsByClass`, `stages`(ordenadas),
  `stagesById`, `classBySlug`, `stageBySlug`.
- Helpers: `getBuild`, `mergeSlots`, `resolveRef`, `refName`, `wikiUrl`,
  `isExpertOrMasterOnly` (todas las fuentes Expert-only) y `computeMaterials`
  (agrega ingredientes recursivos de una lista de ítems).

### Componentes

**Navegación**
- `ClassPicker` — tarjetas de las 4 clases, enlace a fase actual o primera fase.
- `TimelineStages` — timeline horizontal con estados completado/actual/bloqueado.
- `DifficultySelector` — toggle global de dificultad (client, persistido).

**Build**
- `BuildDashboard` (client) — loadout del jugador:
  - Progreso de checklist (%), badge "siguiente objetivo", `orderHint`.
  - Barra de **marcadores de dificultad**: huecos de accesorio (Clásico 5,
    Experto 5/6, Maestro 6/7) e ítems Expert/Master-only ("Ocultos en Clásico" /
    "Solo Expert/Master").
  - Secciones Armadura/Armas/Accesorios/Utilidad. Marcar un slot de set alterna
    todas sus piezas.
  - **Lista de materiales** (recursiva) con sprite + nombre + ×cantidad.
  - **Cambios desde la fase anterior** ("Nuevo" / "Ya no se usa").
  - Filtra slots/ítems según la dificultad (en Clásico quita Expert-only y
    promueve una alternativa no-Expert si existe; limita los accesorios al cupo).
- `SubclassPicker` — selector de subclase; ordena las opciones por
  `CLASS_SUBCLASSES` (p.ej. arco primero en Ranged).
- `ItemCard` — tarjeta de ítem/set: avatar con **sprite de la wiki** (fallback a
  la letra inicial), badges (subclase, **rol**, set, ×qty, Expert+, **daño/defensa**),
  descripción de obtención, nota "por qué", variantes clicables y link Wiki ↗.
  Los slots de set usan `SetSprite` (imagen del set completo).
- `ItemModal` (client) — "¿Cómo conseguirlo?": obtención, **Estadísticas** (chips
  + tooltip), **fuentes de obtención** (drops con % por dificultad, **tasas por
  bioma separadas**, y **tiendas con precio**), árbol de crafteo y botón marcar
  obtenido + Wiki ↗.
- `CraftingTree` (client) — árbol de crafteo recursivo (hasta 3 niveles),
  detección de ciclos, cantidad, estación y sección "Se usa en".
- `subclassTone.ts` — clases de color Tailwind por subclase.

**UI primitivas**: `Badge`, `ProgressBar`, `DifficultyToggle`, `ItemSprite`,
`SetSprite`, `CommandPalette`.

### Búsqueda (CommandPalette)

- Abre con **Ctrl/⌘+K** (botón flotante si no). Carga `public/search-index.json`.
- Índice MiniSearch sobre ítems y builds. Resultado de ítem → abre Wiki ↗;
  resultado de build → navega a su ruta.
- **Filtros**: por clase (Todas + 4 clases), por tipo (Todo + Armas/Armadura/
  Accesorios/Munición/Pociones/Materiales) y **"Ocultar Expert+"** (se activa por
  defecto si la dificultad guardada es Clásico).

### Estado persistente

- `usePersistedState` — estado síncrono con localStorage + evento `storage`.
- `useChecklist` — ids obtenidos (persistida): `has/toggle/setMany/clear`.
- Claves: `terraguide:difficulty:v1`, `terraguide:checklist:v1`.
- El checklist es **compartido entre todas las builds**.

## 8. Styling (`globals.css`, Tailwind v4)

Tema oscuro custom vía `@theme`:

- `background #0c1014`, `foreground #e9e4da`, `surface #141a22`, `surface-2 #1c2430`,
  `edge #2b3542`, `edge-2 #3a4657`, `accent #f5a524` (naranja), `accent-2 #34d399` (verde).
- Fuentes: Geist (sans) + Geist Mono vía `next/font/google`.
- `color-scheme: dark`, selección con tint de accent.

## 9. Comandos útiles

```bash
npm run dev        # dev server (predev: genera search-index.json)
npm run prebuild   # regenera el índice de búsqueda
npm run build      # compilación Next + SSG de todas las páginas
npm run start      # (nunca usar en CI; build estático es lo esperado)
npm run lint       # eslint
npm run validate   # valida datos vs esquemas zod + integridad referencial
npm run images     # descarga sprites de ítems → public/items/
npm run sets       # descarga imágenes de sets → public/sets/
npm run details    # sincroniza drops + recetas + stats + tiendas desde la wiki
```

### `scripts/validate-data.ts` — qué comprueba

1. `datasetSchema.parse` de los 7 archivos (error → exit 1).
2. IDs de ítem duplicados.
3. `subclass` compatible con `classType` (nada de subclase en `GENERAL`).
4. Sets: cada pieza existe en `items` y apunta a su set (`set`).
5. Recetas: `result` e ingredientes existen.
6. Drops: `item` existe.
7. Builds: clase válida, fase conocida, subclase compatible, slots y
   `orderHint` existen (ítems o sets), slots con item o alternativa,
   variantes de subclase sin duplicados.
8. Combos `clase/fase` duplicados; aviso si faltan combinaciones.
9. Imprime conteo final del dataset.

### Scripts de sincronización con la wiki (API Cargo)

- `fetch-wiki-details.ts` (`npm run details`): consulta las tablas Cargo
  `Drops`, `Recipes` e `Items` de `terraria.wiki.gg` y fusiona con los datos
  locales: drops (fuente + % clásico/experto/master, separando tasas por bioma),
  recetas (ingredientes + cantidades + estación), stats por ítem y tiendas de NPC
  (vía `tag: vendor:X` + precio de `buy`). Añade como materiales los ingredientes
  que falten.
- `fetch-item-images.ts` (`npm run images`) y `fetch-set-images.ts` (`npm run sets`).

## 10. Estado del proyecto (roadmap)

- **Fase A — Esquemas y datos base** ✅.
- **Fase B — Ampliación de datos** ✅.
- **Fase C — Subclases** ✅ — variantes por subclase en las 4 clases; selector en
  el front (`SubclassPicker` + `mergeSlots`).
- **Revisión por clase (1.4.5.7)** ✅ — builds de las 4 clases reescritas con las
  mejores opciones por fase, disponibilidad verificada, armaduras/accesorios por
  subclase y `orderHint` coherentes.
- **Mejoras de datos y UI** ✅:
  - Stats de ítems, lista de materiales, fuentes de tienda, marcadores de
    dificultad, comparación de fases y filtros de búsqueda.
  - Imágenes de sets completos (`public/sets/`).
  - Dificultad afecta a la build: cupos de accesorio (5/6/7) y filtrado Expert-only.
- **Fase D (cierre, no iniciada):** pulido visual final (paleta de colores de
  Terraria), deploy (Vercel) y flujo de update de datos.

## 11. Estado de git

- Repo con un único commit base ("Initial commit from Create Next App").
- Sin commit de los datos ni del código de la app todavía: `data/`, `scripts/`,
  `public/`, `src/`, `plan.md`, `terraguide.md`, `project.md` y el scaffold
  modificado están **sin commitear**.

## 12. Criterios de éxito (v1)

- 4 clases × 9 fases con loadouts curados y evidencia de "por qué" cada ítem.
- El dashboard responde al checklist guardado (el reload no pierde progreso).
- Árboles de crafteo correctos para ítems derivados (Ankh Shield, Terraspark Boots…).
- `npm run validate && npm run build` en verde.
- Desplegado como sitio estático apuntando a `gameVersion: 1.4.5.7`.

## 13. Notas y decisiones

- El **conteo de ítems cambia con las sincronizaciones**; el número que cuenta es
  el de `npm run validate` (873 ítems al corte actual).
- Cuando un ítem citado no está en `items.json`, suele ser un id mal escrito o un
  set de armadura cuyo id difiere del de sus piezas. No inventar ids.
- Toda variante de subclase debe **reutilizar ítems existentes**.
- PowerShell 5.1 (entorno Windows): no usar `if()` inline en pipelines ni
  operador ternario con objetos; preferir `node -e` con comillas simples o un
  script `.mjs` temporal.
