import type { Metadata } from "next";
import { ItemsExplorer } from "@/components/items/ItemsExplorer";
import { getDataset } from "@/lib/loadData";

export const metadata: Metadata = {
  title: "Base de datos de ítems",
  description:
    "Explora todos los ítems de Terraria 1.4.5.7 por clase, tipo, rol y rareza, con sus fuentes de obtención y recetas.",
};

export default function ItemsPage() {
  const dataset = getDataset();
  return (
    <ItemsExplorer
      dataset={{
        items: dataset.items,
        sets: dataset.sets,
        recipes: dataset.recipes,
        drops: dataset.drops,
      }}
    />
  );
}
