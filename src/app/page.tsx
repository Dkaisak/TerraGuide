import { T } from "@/components/i18n/T";
import { HomeHero } from "@/components/layout/HomeHero";
import { ClassPicker } from "@/components/navigation/ClassPicker";
import { TimelineStages } from "@/components/navigation/TimelineStages";
import { buildIndexes } from "@/lib/indexing";
import { getDataset } from "@/lib/loadData";
import type { ClassType } from "@/types/data";
import { CLASS_ORDER } from "@/types/data";

export default function Home() {
  const dataset = getDataset();
  const indexes = buildIndexes(dataset);

  const classCounts: Partial<Record<ClassType, number>> = {};
  for (const c of CLASS_ORDER) classCounts[c] = indexes.buildsByClass.get(c)?.length ?? 0;

  return (
    <div className="flex flex-col gap-12">
      <HomeHero
        version={dataset.version.gameVersion}
        stages={indexes.stages.length}
        builds={indexes.buildsByClassStage.size}
        items={dataset.items.length}
        recipes={dataset.recipes.length}
        drops={dataset.drops.length}
      />

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          <T k="home.chooseClass" />
        </h2>
        <ClassPicker counts={classCounts} targetStage={indexes.stages[0].id} />
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          <T k="home.path" />
        </h2>
        <TimelineStages stages={indexes.stages} />
      </section>
    </div>
  );
}