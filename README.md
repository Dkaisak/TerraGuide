# TerraGuide

Guía interactiva de **builds de Terraria (1.4.5.8)**. Elige una **clase** (Melee /
Ranged / Magic / Summoner) y una **fase de la partida** (9 hitos progresivos) y la
app te muestra la build óptima para ese momento: armadura, armas, accesorios
(con variantes de subclase y alternativas), buffs y munición, con el **porqué** de
cada ítem y su árbol de crafteo.

Incluye además:

- **Mini-guía "Cómo empezar esta fase"** y **tips de arena/estrategia** por fase.
- **Ruta de farmeo por zona/bioma** en cada build.
- **Base de datos de ítems** (`/items`) con filtros por clase, tipo, rol y rareza.
- **Notas de mecánicas** (`/mechanics`) con enlaces a la wiki.
- **Build Tester** (`/builder`): stats en vivo, reforges, compartir/guardar y
  comparación A/B.
- **Búsqueda global** (cabecera + Ctrl/⌘+K) que abre la ficha del ítem en la app.

- UI en español; nombres de ítems en inglés (fuente Wiki.gg).
- Sin backend: JSON curados en `data/` + generación estática (SSG).
- Sprites de ítems: Official Terraria Wiki (© Re-Logic, CC BY-NC-SA).

## Stack

Next.js 16 (App Router, Turbopack, SSG) · TypeScript estricto · Tailwind v4 ·
zod · MiniSearch.

## Comandos

```bash
npm run dev        # dev server (predev regenera search-index.json + dataset.json)
npm run validate   # valida data/ contra los esquemas zod + integridad referencial
npm run lint       # eslint
npm run build      # compilación Next + SSG (prebuild regenera el índice)
npm run images     # descarga los sprites de los ítems de la Wiki → public/items/
npm run sets       # descarga las imágenes de sets → public/sets/
npm run details    # sincroniza drops + recetas + stats + tiendas desde la wiki
npm run modifiers  # parsea modificadores de los tooltips → items.json
```

## Estructura

```
data/      dataset fuente: items.json, builds.json, stages.json, sets.json,
           recipes.json, drops.json, mechanics.json, version.json
scripts/   validate-data.ts · generate-search-index.ts · fetch-item-images.ts
           fetch-set-images.ts · fetch-wiki-details.ts · parse-modifiers.ts
src/       app (guía, /items, /mechanics, /builder), components, hooks, lib, types
public/    estáticos + search-index.json + dataset.json + items/ + sets/
```

## Documentación

- `project.md` — información completa del proyecto (stack, dataset, arquitectura).
- `terraguide.md` — resumen vivo (qué está hecho y pendiente, cómo validar).