import type { Metadata } from "next";
import { T } from "@/components/i18n/T";
import { MechanicsList } from "@/components/mechanics/MechanicsList";
import { getDataset } from "@/lib/loadData";

export const metadata: Metadata = {
  title: "Notas de mecánicas",
  description:
    "Notas sobre mecánicas de Terraria 1.4.5.8: whip stacking, tags de invocación, velocidad de látigos, huecos de accesorio y más.",
};

export default function MechanicsPage() {
  const { mechanics } = getDataset();
  return (
    <div className="flex flex-col gap-4">
      <header className="border-b border-edge pb-3">
        <h1 className="tg-title text-2xl font-bold">
          <T k="mechanics.title" />
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-zinc-400">
          <T k="mechanics.intro" />
        </p>
      </header>

      <MechanicsList mechanics={mechanics} />
    </div>
  );
}
