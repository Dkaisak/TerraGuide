import Link from "next/link";
import type { ClassType, GameStage } from "@/types/data";
import { CLASS_LABEL, CLASS_ORDER } from "@/types/data";
import type { DataIndexes } from "@/lib/indexing";
import { classSlug, stageSlug } from "@/lib/indexing";

const CLASS_TAGLINE: Record<ClassType, string> = {
  MELEE: "Espadas, yoyos y martillos de cadena",
  RANGED: "Arcos, pistolas y lanzacohetes",
  MAGIC: "Bastones, tomos y pistolas mágicas",
  SUMMONER: "Miniones y látigos",
  GENERAL: "Ítems de utilidad general",
};

// Sprite representativo de cada clase (icono de la tarjeta).
const CLASS_ICON: Record<ClassType, string> = {
  MELEE: "terra-blade",
  RANGED: "phantasm",
  MAGIC: "last-prism",
  SUMMONER: "stardust-dragon-staff",
  GENERAL: "ankh-shield",
};

export function ClassPicker({
  indexes,
  selected,
  stage,
}: {
  indexes: DataIndexes;
  selected?: ClassType;
  stage?: GameStage;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-4">
      {CLASS_ORDER.map((classType) => {
        const active = selected === classType;
        const targetStage = stage ?? indexes.stages[0]?.id;
        if (!targetStage) return null;
        const href = `/${classSlug(classType)}/${stageSlug(targetStage)}`;
        const count = indexes.buildsByClass.get(classType)?.length ?? 0;
        return (
          <Link
            key={classType}
            href={href}
            className={`tg-surface group rounded-lg p-4 transition-colors hover:border-accent ${
              active ? "border-accent ring-1 ring-accent/40" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/items/${CLASS_ICON[classType]}.png`}
                  alt=""
                  draggable={false}
                  className="h-7 w-7 shrink-0 object-contain [image-rendering:pixelated]"
                />
                <span
                  className={`text-lg font-bold ${active ? "text-accent" : "text-foreground"}`}
                >
                  {CLASS_LABEL[classType]}
                </span>
              </span>
              <span className="font-mono text-[11px] text-zinc-500">{count} builds</span>
            </div>
            <p className="mt-1 text-sm text-zinc-400">{CLASS_TAGLINE[classType]}</p>
            <span className="mt-3 block text-xs font-medium text-accent-2 opacity-0 transition-opacity group-hover:opacity-100">
              Ver builds →
            </span>
          </Link>
        );
      })}
    </div>
  );
}