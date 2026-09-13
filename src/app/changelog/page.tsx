import type { Metadata } from "next";
import { T } from "@/components/i18n/T";
import { getDataset } from "@/lib/loadData";

export const metadata: Metadata = {
  title: "Changelog de datos",
};

export default function ChangelogPage() {
  const version = getDataset().version;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-black tracking-tight">
          <T k="changelog.title" />
        </h1>
        <p className="text-sm text-zinc-400">
          <T k="changelog.intro" />
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Terraria {version.gameVersion}
          </h2>
          <span className="rounded border border-edge-2 bg-surface px-2 py-0.5 font-mono text-[11px] text-accent">
            <T k="changelog.updated" vars={{ date: version.updatedAt }} />
          </span>
        </div>
        <ol className="flex flex-col gap-2">
          {version.changelog.map((entry, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-lg border border-edge bg-surface px-4 py-3 text-sm text-zinc-300"
            >
              <span className="mt-0.5 font-mono text-xs text-accent">{i + 1}.</span>
              <span>{entry}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
