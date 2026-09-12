# TerraGuide

Guía interactiva de **builds de Terraria (1.4.5.7)**. Elige una **clase** (Melee /
Ranged / Magic / Summoner) y una **fase de la partida** (9 hitos progresivos) y la
app te muestra la build óptima para ese momento: armadura, armas, accesorios
(con variantes de subclase y alternativas), buffs y munición, con el **porqué** de
cada ítem y su árbol de crafteo.

- UI en español; nombres de ítems en inglés (fuente Wiki.gg).
- Sin backend: JSON curados en `data/` + generación estática (SSG).
- Sprites de ítems: Official Terraria Wiki (© Re-Logic, CC BY-NC-SA).

## Stack

Next.js 16 (App Router, Turbopack, SSG) · TypeScript estricto · Tailwind v4 ·
zod · MiniSearch.

## Comandos

```bash
npm run dev        # dev server (predev regenera public/search-index.json)
npm run validate   # valida data/ contra los esquemas zod + integridad referencial
npm run lint       # eslint
npm run build      # compilación Next + SSG (prebuild regenera el índice)
npm run images     # descarga los sprites de los ítems de la Wiki → public/items/ (idempotente)
```

## Estructura

```
data/      dataset fuente: items.json, builds.json, stages.json, sets.json,
           recipes.json, drops.json, version.json
scripts/   validate-data.ts · generate-search-index.ts · fetch-item-images.ts
src/       app (páginas SSG), components, hooks, lib (schemas zod), types
public/    estáticos + search-index.json + items/ (sprites de ítems)
```

## Documentación

- `project.md` — información completa del proyecto (stack, dataset, arquitectura).
- `terraguide.md` — resumen vivo (qué está hecho y pendiente, cómo validar).