# TerraGuide — Resumen del proyecto

> Documento vivo. Qué es, qué hay hecho, qué está pendiente, y cómo validar.
> Conversación en español. Precisión ante invento: **verificable > rápido**.
> Versión base de datos del juego: **Terraria 1.4.5.8**.

## 1. Qué es
Guía interactiva de **builds de Terraria** con Next.js 16 (App Router + Turbopack),
TypeScript, Tailwind v4 y generación estática (SSG). El usuario elige una **clase**
(Melee / Ranged / Magic / Summoner) y una **fase de la partida** (9 hitos) y la app
muestra la build óptima de ese momento: armadura, arma, accesorios, buffs y munición,
con el porqué de cada ítem, sus stats, su obtención (drop/tienda/crafteo) y una lista
de materiales.

## 2. Stack y herramienta
- **Framework:** Next.js 16.x (App Router, Turbopack), TypeScript estricto.
- **Estilos:** Tailwind CSS v4.
- **Datos:** ficheros JSON en `data/`, validados con zod.
- **Búsqueda:** MiniSearch con índice precomputado (`public/search-index.json`).

## 3. Estructura del repo
```
data/            ← JSON fuente (los "datos del juego")
  items.json     ← 873 ítems + stats + modifiers
  recipes.json   ← 672 recetas (con cantidades y estación)
  drops.json     ← 1.199 fuentes (drops con % por dificultad + tiendas de NPC)
  builds.json    ← 36 builds por clase/fase + startGuide + variantes de subclase
  stages.json    ← 9 fases (pre-bosses → post-moon-lord) + tips de arena
  sets.json      ← 32 sets de armadura (+ modifiers)
  mechanics.json ← 5 notas de mecánicas (whip stacking, tags, huecos…)
  version.json   ← gameVersion + changelog
scripts/
  validate-data.ts · generate-search-index.ts (search-index.json + dataset.json)
  fetch-item-images.ts (npm run images)
  fetch-set-images.ts  (npm run sets)
  fetch-wiki-details.ts (npm run details)
  parse-modifiers.ts    (npm run modifiers)
src/             ← app (guía, /items, /mechanics, /builder), componentes, hooks, lib, schemas, types
public/          ← search-index.json, dataset.json, items/ (sprites), sets/ (imágenes de set)
```

Rutas: `/` (home), `/[classType]/[stage]` (build), `/items` (base de datos),
`/mechanics` (notas), `/builder` (Build Tester), `/changelog`.

## 4. Los datos (conteo verificado en validación)
9 fases / **873 ítems** / **672 recetas** / **1.199 drops** / **36 builds** (más
variantes de subclase) / **32 sets** / **5 mecánicas**.

- **Variantes de subclase:** Melee (SWORD + YOYO), Ranged (BOW + GUN/LAUNCHER/THROWN),
  Summoner (MINION + WHIP/SENTRY); Magic sin variantes.
- **Stats por ítem:** daño + tipo, defensa, crítico, uso, knockback, maná, velocidad,
  rareza, autoswing, tooltip y valor de venta. Además `modifiers` (bonus numéricos).
- **Por fase:** `startGuide` en cada build ("cómo empezar") y `tips` de arena/estrategia.
- Los IDs son kebab-case y **deben existir en `items.json`**. Nada se inventa.

## 5. Validación (siempre en este orden)
```
npm run validate   # valida datos contra los esquemas zod (quédate aquí si falla)
npm run lint       # eslint
npm run build      # compilación Next + SSG de todas las páginas
```
- Nunca `npm start`. Nunca editar con scripts a ciegas sin verificar cada id primero.
- PowerShell 5.1: no usar `if()` inline en pipelines ni operador ternario con objetos;
  preferir `node -e` con comillas simples o un script `.mjs` temporal.

## 6. Estado de fases
### Fase A — Esquemas y datos base ✅
Schema zod, 9 fases, dataset completo y validado; front leyendo los datos.

### Fase B — Ampliación de datos ✅
Armas de nuevas subclases, recetas y drops; `validate`/`lint`/`build` verdes.

### Fase C — Subclases ✅
- Schema con `subclass` + `subclassSlots`; selector en el front
  (`SubclassPicker` + `mergeSlots`).
- Variantes por subclase en las 4 clases (ver §4), con accesorios específicos.
- `validate` + `lint` + `build` verdes.

### Revisión por clase (1.4.5.7) ✅
- Builds de Melee, Ranged, Magic y Summoner reescritas con las **mejores opciones por
  fase** (armas/armaduras/accesorios/armas por subclase) y **disponibilidad
  verificada** en la wiki.
- Correcciones de disponibilidad (p.ej. Shroomite es post-Plantera; Avenger Emblem
  exige los 3 mechs; Hallowed Mask = melee, Hallowed Helmet = ranged).
- Accesorios diferenciados por subclase (p.ej. los quivers solo sirven a arcos).

### Mejoras de datos y UI ✅
- **Stats de ítems** desde la wiki (`stats`).
- **Lista de materiales por build** (recursiva, `computeMaterials`).
- **Fuentes de obtención**: drops con % por dificultad + **90 tiendas de NPC** con
  precio; tasas por bioma separadas.
- **Filtrado por dificultad**: cupos de accesorio (Clásico 5, Experto 5/6,
  Maestro 6/7) e ítems Expert/Master-only aplicados a la build.
- **Comparar fases**: "Cambios desde <fase anterior>" (nuevo / ya no se usa).
- **Imágenes de sets completos** (`public/sets/`, 32).
- **Paleta de Terraria**, rareza por color, UI compacta y árbol de crafteo con
  sprites e ingredientes clicables.

### Build Tester ✅
- `/builder`: paper-doll, stats en vivo (defensa, daño, crítico, uso, DPS),
  reforges recomendados (`reforge.ts` + `modifiers.ts` + `weaponModifiers.ts`),
  clases mixtas, compartir por URL, guardar/favoritos y **comparación A/B**
  (curadas, guardadas o una build B personalizada).

### Contenido y secciones nuevas ✅
- **Mini-guía "Cómo empezar esta fase"** (`startGuide`) en las 36 builds.
- **Tips de arena y estrategia** (`tips`) en las 9 fases.
- **Ruta de farmeo por zona** (`zones.ts`) en cada build.
- **Base de datos de ítems** (`/items`): filtros por clase/tipo/rol/rareza.
- **Notas de mecánicas** (`/mechanics` + `mechanics.json`) con enlaces a la wiki.

### Búsqueda ✅
- Input fijo en la cabecera (`HeaderSearch`) + paleta global **Ctrl/⌘+K**.
- Al elegir un ítem se abre la **ficha dentro de la app** (`ItemDetailProvider`
  carga `public/dataset.json` bajo demanda); las builds navegan a su ruta.
- ⚠️ MiniSearch: no poner `"id"` en `storeFields` (rompe el lookup de resultados).

### Pendiente / siguiente
- Deploy (Vercel) y flujo de update de datos.

## 7. Comandos útiles
```
npm run validate    # ¿los datos cumplen los esquemas?
npm run lint        # ¿código limpio?
npm run build       # ¿SSG completa?
npm run images      # descarga sprites de ítems
npm run sets        # descarga imágenes de sets
npm run details     # sincroniza drops/recetas/stats/tiendas desde la wiki
npm run modifiers   # parsea modificadores de los tooltips → items.json
```

## 8. Notas y decisiones
- El **conteo de ítems cambia con las sincronizaciones**; el número que cuenta es el
  de `npm run validate` (873 ítems al corte actual).
- Cuando un item citado no aparece en `items.json`, suele ser un id mal escrito o un
  set de armadura con id distinto al de sus piezas. No "inventar" el id.
- Toda variante de subclase debe reutilizar **items ya existentes**, no crear ids.
- Los datos de la wiki se sincronizan con la API Cargo (tablas `Drops`, `Recipes`,
  `Items`); `npm run details` es idempotente (fusiona y no duplica).
