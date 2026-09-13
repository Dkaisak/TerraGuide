import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuildDashboard } from "@/components/build/BuildDashboard";
import { T } from "@/components/i18n/T";
import { ClassPicker } from "@/components/navigation/ClassPicker";
import { StageTitle } from "@/components/navigation/StageTitle";
import { TimelineStages } from "@/components/navigation/TimelineStages";
import { buildIndexes, classSlug, getBuild, stageSlug } from "@/lib/indexing";
import { getDataset } from "@/lib/loadData";
import type { ClassType } from "@/types/data";
import { CLASS_ORDER } from "@/types/data";

type RouteParams = Promise<{ classType: string; stage: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  const dataset = getDataset();
  const params: { classType: string; stage: string }[] = [];
  for (const build of dataset.builds) {
    params.push({
      classType: classSlug(build.classType),
      stage: stageSlug(build.stage),
    });
  }
  return params;
}

async function resolveBuild(params: Awaited<RouteParams>) {
  const dataset = getDataset();
  const indexes = buildIndexes(dataset);
  const classType = indexes.classBySlug.get(params.classType);
  const stage = indexes.stageBySlug.get(params.stage);
  const build = classType && stage ? getBuild(indexes, classType, stage) : undefined;
  return { dataset, indexes, classType, stage, build };
}

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const { build } = await resolveBuild(await params);
  if (!build) {
    return { title: "Build no encontrada" };
  }
  return {
    title: build.title,
    description: build.intro,
  };
}

export default async function BuildPage({ params }: { params: RouteParams }) {
  const { dataset, indexes, classType, stage, build } = await resolveBuild(await params);
  if (!classType || !stage || !build) {
    notFound();
  }

  const stageIndex = indexes.stages.findIndex((s) => s.id === stage);
  const prevStage = stageIndex > 0 ? indexes.stages[stageIndex - 1] : undefined;
  const nextStage =
    stageIndex >= 0 && stageIndex < indexes.stages.length - 1
      ? indexes.stages[stageIndex + 1]
      : undefined;

  const classCounts: Partial<Record<ClassType, number>> = {};
  for (const c of CLASS_ORDER) classCounts[c] = indexes.buildsByClass.get(c)?.length ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-2 border-b border-edge pb-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          <T k="page.navigate" />
        </h2>
        <ClassPicker counts={classCounts} targetStage={stage} selected={classType} />
        <p className="text-[11px] text-zinc-500">
          <T k="page.recorriendo" />
        </p>
      </section>

      <TimelineStages stages={indexes.stages} classType={classType} currentStage={stage} />

      <BuildDashboard
        key={build.id}
        build={build}
        previousBuild={prevStage ? getBuild(indexes, classType, prevStage.id) : undefined}
        previousStage={prevStage}
        stage={indexes.stagesById.get(stage)}
        dataset={{
          items: dataset.items,
          sets: dataset.sets,
          recipes: dataset.recipes,
          drops: dataset.drops,
        }}
      />

      <nav className="mt-1 flex items-center justify-between border-t border-edge pt-3 text-sm">
        {prevStage ? (
          <Link
            href={`/${classSlug(classType)}/${stageSlug(prevStage.id)}`}
            className="text-zinc-400 transition-colors hover:text-accent"
          >
            ← <StageTitle stage={prevStage} />
          </Link>
        ) : (
          <span className="text-zinc-700">
            <T k="page.classStart" />
          </span>
        )}
        {nextStage ? (
          <Link
            href={`/${classSlug(classType)}/${stageSlug(nextStage.id)}`}
            className="text-zinc-400 transition-colors hover:text-accent"
          >
            <StageTitle stage={nextStage} /> →
          </Link>
        ) : (
          <span className="text-zinc-700">
            <T k="page.classEnd" />
          </span>
        )}
      </nav>
    </div>
  );
}
