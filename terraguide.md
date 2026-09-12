# TerraGuide — Resumen del proyecto

> Documento vivo. Qué es, qué hay hecho, qué está pendiente, y cómo validar.
> Conversación en español. Precisión ante invento: **verificable > rápido**.
> Versión base de datos del juego: **Terraria 1.4.5.7**.

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
  items.json     ← 873 ítems + stats
  recipes.json   ← 672 recetas (con cantidades y estación)
  drops.json     ← 1.199 fuentes (drops con % por dificultad + tiendas de NPC)
  builds.json    ← 36 builds por clase/fase + variantes de subclase
  stages.json    ← 9 fases (pre-bosses → post-moon-lord)
  sets.json      ← 32 sets de armadura
  version.json   ← gameVersion + changelog
scripts/
  validate-data.ts · generate-search-index.ts
  fetch-item-images.ts (npm run images)
  fetch-set-images.ts  (npm run sets)
  fetch-wiki-details.ts (npm run details)
src/             ← app, componentes, hooks, lib, schemas, types
public/          ← search-index.json, items/ (sprites), sets/ (imágenes de set)
```

## 4. Los datos (conteo verificado en validación)
9 fases / **873 ítems** / **672 recetas** / **1.199 drops** / **36 builds** (más
variantes de subclase) / **32 sets**.

- **Variantes de subclase:** Melee (SWORD + YOYO), Ranged (BOW + GUN/LAUNCHER/THROWN),
  Summoner (MINION + WHIP/SENTRY); Magic sin variantes.
- **Stats por ítem:** daño + tipo, defensa, crítico, uso, knockback, maná, velocidad,
  rareza, autoswing, tooltip y valor de venta.
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
- **Marcadores de dificultad**: cupos de accesorio (Clásico 5, Experto 5/6,
  Maestro 6/7) e ítems Expert/Master-only; filtrado real de la build.
- **Comparar fases**: "Cambios desde <fase anterior>" (nuevo / ya no se usa).
- **Búsqueda con filtros**: clase, tipo y "Ocultar Expert+".
- **Imágenes de sets completos** (`public/sets/`, 32).

### Pendiente / siguiente
- **Pulido visual final** y **paleta de colores de Terraria**.
- Deploy (Vercel) y flujo de update de datos.

## 7. Comandos útiles
```
npm run validate    # ¿los datos cumplen los esquemas?
npm run lint        # ¿código limpio?
npm run build       # ¿SSG completa?
npm run images      # descarga sprites de ítems
npm run sets        # descarga imágenes de sets
npm run details     # sincroniza drops/recetas/stats/tiendas desde la wiki
```

## 8. Notas y decisiones
- El **conteo de ítems cambia con las sincronizaciones**; el número que cuenta es el
  de `npm run validate` (873 ítems al corte actual).
- Cuando un item citado no aparece en `items.json`, suele ser un id mal escrito o un
  set de armadura con id distinto al de sus piezas. No "inventar" el id.
- Toda variante de subclase debe reutilizar **items ya existentes**, no crear ids.
- Los datos de la wiki se sincronizan con la API Cargo (tablas `Drops`, `Recipes`,
  `Items`); `npm run details` es idempotente (fusiona y no duplica).
