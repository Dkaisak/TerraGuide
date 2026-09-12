import { ClassPicker } from "@/components/navigation/ClassPicker";
import { TimelineStages } from "@/components/navigation/TimelineStages";
import { buildIndexes } from "@/lib/indexing";
import { getDataset } from "@/lib/loadData";

export default function Home() {
  const dataset = getDataset();
  const indexes = buildIndexes(dataset);

  return (
    <div className="flex flex-col gap-12">
      <section className="max-w-3xl">
        <h1 className="text-4xl font-black leading-tight tracking-tight">
          <span className="text-accent">Builds óptimas</span> en cada fase del juego
        </h1>
        <p className="mt-3 text-lg text-zinc-400">
          Elige tu clase y recorre las 9 fases de Terraria {dataset.version.gameVersion}
          con el loadout más eficiente de cada momento: armadura, armas, accesorios y
          buffs, con el porqué de cada ítem.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 font-mono text-xs text-zinc-500">
          <span className="rounded border border-edge bg-surface px-2 py-1">
            {indexes.stages.length} fases
          </span>
          <span className="rounded border border-edge bg-surface px-2 py-1">
            {indexes.buildsByClassStage.size} builds
          </span>
          <span className="rounded border border-edge bg-surface px-2 py-1">
            {dataset.items.length} ítems
          </span>
          <span className="rounded border border-edge bg-surface px-2 py-1">
            {dataset.recipes.length} recetas
          </span>
          <span className="rounded border border-edge bg-surface px-2 py-1">
            {dataset.drops.length} drops
          </span>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Elige tu clase
        </h2>
        <ClassPicker indexes={indexes} />
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          El camino por fases
        </h2>
        <TimelineStages indexes={indexes} />
      </section>
    </div>
  );
}