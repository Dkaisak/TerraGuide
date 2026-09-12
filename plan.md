# TERRAGUIDE — Plan de Trabajo

Guía interactiva de builds para Terraria por clases y fases del juego.

Versión base de datos del juego: **Terraria 1.4.5.7**

---

## 1. Visión General

Aplicación web que guía paso a paso al jugador según su **clase** (Melee,
Ranged, Magic, Summoner) y su **fase de la partida** (9 hitos progresivos),
mostrando la build más óptima en cada momento: armadura, armas, accesorios,
buffs y ammo, con su fuente de obtención (drop/crafteo) y un árbol de crafteo
interactivo.

## 2. Decisiones de Scope (confirmadas)

- **Arquitectura de datos:** JSON estático versionado en el repo + SSG.
  Sin PostgreSQL ni API server en producción. Cero infraestructura.
- **Fuente de datos v1:** dataset curado a mano en `data/` (subconjunto
  relevante a builds, no ingestión total de la wiki).
- **Plataforma:** Desktop-first (UI densa, responsive mínimo).
- **Versión objetivo:** 1.4.5.7. El dato se versiona y se actualiza con cada
  parche del juego vía workflow de actualización (PR, no scraper).
- **idioma de UI:** español; nombres de ítems en inglés (fuente: Wiki.gg).
- **Fuera de alcance v1:** tModLoader/Mods (Calamity, etc.), login de
  usuarios, backend.

## 3. Stack Tecnológico

| Capa        | Tecnología                                             |
|-------------|--------------------------------------------------------|
| Framework   | Next.js (App Router) — SSG via `generateStaticParams`  |
| Lenguaje    | TypeScript                                             |
| Estilos     | Tailwind CSS v4 (tema oscuro, toques retro-gaming)     |
| Datos       | JSON curado en `data/` + tipos TS derivados            |
| Validación  | zod (schemas del dataset + checks referenciales en CI) |
| Búsqueda    | client-side (Minisearch) con índice precomputado       |
| Estado local| localStorage con hook propio (sin Zustand en v1)       |

## 4. Estructura de Datos (carpeta `data/`)

```
data/
├── version.json        # { gameVersion: "1.4.5.7", updatedAt: ... }
├── stages.json         # 9 fases: orden, título, hitos ("gate") de progreso
├── items.json          # ~600-800 ítems relevantes a builds
├── sets.json           # sets de armadura (head/chest/legs + bonificaciones)
├── recipes.json        # recetas: ingredientes, cantidades, estación
├── drops.json          # fuente (enemigo/boss), bioma, % por dificultad
└── builds.json         # CURACIÓN: build óptima por clase x fase
```

Cada archivo es validado por un schema zod. Los JSON viven en el repo para
que cualquier cambio sea un diff revisable (git).

## 5. Modelo de Tipos (referencia)

```ts
type ItemType  = "WEAPON" | "ARMOR" | "ACCESSORY" | "AMMO" | "BUFF";
type ClassType = "MELEE" | "RANGED" | "MAGIC" | "SUMMONER" | "GENERAL";
type GameStage = "PRE_BOSSES" | "PRE_EVIL_BOSS" | "PRE_SKELETRON" |
                 "PRE_HARDMODE" | "PRE_MECH_BOSSES" | "PRE_PLANTERA" |
                 "PRE_GOLEM" | "PRE_LUNAR_EVENTS" | "POST_MOON_LORD";

interface Item {
  id: string; name: string; type: ItemType;
  classType: ClassType;      // clase a la que sirve o GENERAL
  subclass?: Subclass;       // subclase específica (arma/accesorio) o ausente = toda la clase
  sprite: string;            // asset local / CDN
  wikiUrl: string;
  set?: string;              // id del set de armadura si es pieza
}
```

### 5.1 Subclases (decidido)

Cada clase se divide en subclases con accesorios propios (un melee de yoyos
necesita yoyo gear, uno de espadas guantes, un ranged de arcos quivers, etc.):

```ts
type Subclass =
  | "SWORD" | "YOYO" | "FLAIL" | "SPEAR" | "BOOMERANG"   // MELEE
  | "BOW" | "GUN" | "LAUNCHER" | "THROWN"                // RANGED
  | "STAFF" | "TOME" | "MAGIC_GUN"                       // MAGIC
  | "MINION" | "WHIP" | "SENTRY";                        // SUMMONER
```

- `Item.subclass` (opcional): solo armas, munición y accesorios específicos
  de subclase (magic-quiver=BOW, crystal-bullet=GUN). Si un item no lo
  define, vale para toda su clase.
- `Build.subclass` (opcional): subclase a la que está afinada la build
  actual. La UI lo mostrará y resaltará los accesorios compatibles.
- La validación comprueba que `subclass` sea compatible con `classType`
  (ej. `SWORD` solo en `MELEE`), tanto en items como en builds.
- Alcance acordado: **tag ágil**; las builds siguen siendo por clase x fase
  (no se multiplican por subclase todavía).

interface Recipe {
  result: string; qty: number;
  ingredients: { item: string; qty: number }[];
  station: string;           // "Iron Anvil", "Mythril Anvil", ...
}

interface Drop {
  item: string; from: string; biomes: string[];
  chance: { classic?: string; expert?: string; master?: string };
}

interface BuildSlot {
  slot: "HELMET" | "CHEST" | "LEGS" | "SET_BONUS" | "WEAPON" |
        "WEAPON_ALT" | "ACCESSORY" | "ACCESSORY_ALT" | "BUFF" | "AMMO";
  item?: string;             // id
  alternatives?: string[];   // sustitutos opcionales
  qty?: number;              // cantidad (p.ej. x2 accesorios)
  why: string;               // 1 línea: por qué este ítem aquí
}

interface Build {
  id: string; stage: string; classType: ClassType;
  title: string; intro: string;
  slots: BuildSlot[];        // loadout ordenado ("siguiente paso" = primero)
  orderHint: string[];       // qué conseguir primero → guiado paso a paso
}
```

## 6. Arquitectura de la App

- Rutas estáticas `/[classType]/[stage]` generadas con `generateStaticParams`
  a partir de `builds.json` (carga instantánea, sin servidor).
- Home (`/`): selector de clase + timeline de fases + acceso a todo.
- Búsqueda global Cmd+K client-side sobre un índice precomputado de
  `items.json` (Minisearch).
- Persistencia: `useChecklist` hook sobre localStorage (checklist de ítems
  obtenidos por el jugador).
- Server Components para carga de datos; componentes interactivos
  ("use client") solo donde hace falta.

### Componentes principales (`src/components/`)
- `navigation/ClassPicker.tsx` — selector visual de clase.
- `navigation/TimelineStages.tsx` — timeline horizontal de 9 fases con
  estado completado/actual/bloqueado.
- `build/BuildDashboard.tsx` — loadout del jugador (slots, % completado,
  badge "siguiente objetivo").
- `build/ItemCard.tsx` — tarjeta de ítem, estado obtenido/pendiente.
- `build/ItemModal.tsx` — "¿Cómo conseguirlo?" (drop, % por dificultad,
  bioma, enemigo/boss, link wiki).
- `build/CraftingTree.tsx` — árbol de crafteo recursivo (BFS, límite ~3
  niveles, detección de ciclos, dirección inversa "en qué se usa").
- `ui/` — primitivas (Badge, ProgressBar, Modal, CommandPalette).

## 7. Flujo de Usuario (UX Core)

1. Seleccionar **clase** → seleccionar **fase** en el timeline.
2. Dashboard muestra el loadout ordenado: el primer ítem es el
   **"siguiente objetivo"**.
3. Marcar ítems obtenidos → % de loadout completado y badge del siguiente.
4. Click en cualquier ítem → modal con obtención y árbol de crafteo.
5. Toggle de dificultad Normal/Expert/Master (afecta drops y nº de slots,
   p.ej. Demon Heart).

## 8. Workflow de Actualización de Datos

Terraria se actualiza con poca frecuencia; se mantiene el dataset a mano:

1. **Versionado**: `data/version.json` guarda `gameVersion` (base 1.4.5.7).
2. **Update = PR**: tras un parche se crea un branch, se revisan los cambios
   (nuevos ítems, drops, balances) y se editan los JSON. Historial revisable.
3. **CI como red de seguridad**: `npm run validate` corre los schemas zod y
   checks de integridad referencial (IDs huérfanos, recetas incompletas,
   builds sin ítems, duplicados).
4. **Changelog visible**: página o banner "Datos alineados a 1.4.5.7".
5. **Futuro (fuera de v1)**: mini-script `npm run update:dl` que extraiga de
   Wiki.gg *solo* la lista de ítems nuevos/drops y deje un diff a medias.
   Asistido, nunca automático.

## 9. Roadmap

### Fase 1 — Fundación
- Scaffold Next.js 16 + TS + Tailwind (ya hecho).
- Tipos zod + validación (`scripts/validate-data.ts`, `npm run validate`).
- Seed de `items.json`, `sets.json`, `recipes.json`, `drops.json`,
  `stages.json` para el recorrido Pre-Bosses → Hardmode.

### Fase 2 — Núcleo de UI
- `ClassPicker`, `TimelineStages`, `BuildDashboard`.
- Build completa de **Melee** al 100% en `builds.json` para validar la UX.

### Fase 3 — Interacción
- `useChecklist` + % de loadout + "siguiente objetivo".
- `ItemModal` con drop por dificultad.
- `CraftingTree` (BFS con límite y ciclos).
- Toggle de dificultad.

### Fase 4 — Cierre
- Builds de Ranged / Magic / Summoner.
- Búsqueda Cmd+K con Minisearch.
- Deploy estático (Vercel) + página changelog + pulido visual.
- (Opcional) `git diff`-friendly flujo de update 1.4.6.

## 10. Estructura de Carpetas

```
TerraGuide/
├── data/                        # dataset JSON curado + version.json
├── scripts/
│   └── validate-data.ts         # validación zod + integridad (CI)
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx             # Home: clase + timeline
│   │   └── [classType]/[stage]/page.tsx   # dashboard estático
│   ├── components/
│   │   ├── navigation/{ClassPicker,TimelineStages}.tsx
│   │   ├── build/{BuildDashboard,ItemCard,ItemModal,CraftingTree}.tsx
│   │   └── ui/
│   ├── hooks/useChecklist.ts
│   ├── lib/{loadData, indexing}.ts
│   └── types/data.ts
├── next.config.ts
└── package.json
```

## 11. Criterios de Éxito (v1)

- 4 clases × 9 fases con loadouts curados y evidencia de "por qué" cada ítem.
- El dashboard responde al checklist almacenado (reload no pierde progreso).
- Árboles de crafteo correctos para ítems derivados (ej. Ankh Shield,
  Terraspark Boots).
- `npm run validate && npm run build` en verde.
- Desplegado como sitio estático apuntando a dato `gameVersion: 1.4.5.7`.