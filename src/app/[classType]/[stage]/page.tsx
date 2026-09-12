import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuildDashboard } from "@/components/build/BuildDashboard";
import { ClassPicker } from "@/components/navigation/ClassPicker";
import { TimelineStages } from "@/components/navigation/TimelineStages";
import { buildIndexes, classSlug, getBuild, stageSlug } from "@/lib/indexing";
import { getDataset } from "@/lib/loadData";

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

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4 border-b border-edge pb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Navega
        </h2>
        <ClassPicker indexes={indexes} selected={classType} stage={stage} />
        <p className="text-xs text-zinc-500">
          Recorriendo <span className="font-semibold text-zinc-300">todas las clases</span>.
          El timeline marca la fase actual.
        </p>
      </section>

      <TimelineStages indexes={indexes} classType={classType} currentStage={stage} />

      <BuildDashboard
        key={build.id}
        build={build}
        previousBuild={prevStage ? getBuild(indexes, classType, prevStage.id) : undefined}
        previousStageTitle={prevStage?.title}
        dataset={{
          items: dataset.items,
          sets: dataset.sets,
          recipes: dataset.recipes,
          drops: dataset.drops,
        }}
      />

      <nav className="mt-2 flex items-center justify-between border-t border-edge pt-4 text-sm">
        {prevStage ? (
          <Link
            href={`/${classSlug(classType)}/${stageSlug(prevStage.id)}`}
            className="text-zinc-400 transition-colors hover:text-accent"
          >
            ← {prevStage.title}
          </Link>
        ) : (
          <span className="text-zinc-700">← Inicio de la clase</span>
        )}
        {nextStage ? (
          <Link
            href={`/${classSlug(classType)}/${stageSlug(nextStage.id)}`}
            className="text-zinc-400 transition-colors hover:text-accent"
          >
            {nextStage.title} →
          </Link>
        ) : (
          <span className="text-zinc-700">Final de la clase</span>
        )}
      </nav>
    </div>
  );
}