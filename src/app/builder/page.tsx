import type { Metadata } from "next";
import { BuildTester } from "@/components/build/BuildTester";
import { getDataset } from "@/lib/loadData";

export const metadata: Metadata = {
  title: "Build Tester",
  description:
    "Prueba combinaciones de armas, armaduras y accesorios y compara sus estadísticas en vivo.",
};

export default function BuilderPage() {
  const dataset = getDataset();
  return (
    <BuildTester
      dataset={{
        items: dataset.items,
        sets: dataset.sets,
        recipes: dataset.recipes,
        drops: dataset.drops,
      }}
      builds={dataset.builds}
    />
  );
}
