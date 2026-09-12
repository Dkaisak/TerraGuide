import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { DifficultySelector } from "@/components/navigation/DifficultySelector";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { getDataset } from "@/lib/loadData";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TerraGuide — Builds de Terraria 1.4.5.7",
    template: "%s · TerraGuide",
  },
  description:
    "Guía interactiva de builds de Terraria por clase y fase del juego: armaduras, armas, accesorios y buffs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const version = getDataset().version;
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-background text-foreground">
        <header
          className="border-b border-edge"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--color-surface) 80%, transparent), transparent)",
          }}
        >
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="tg-title text-xl font-black tracking-tight">
                Terra<span className="text-accent">Guide</span>
              </span>
              <span className="hidden text-xs text-zinc-500 sm:inline">
                Builds de Terraria
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/builder"
                className="tg-btn rounded-md px-2.5 py-1 text-xs font-medium text-zinc-300"
              >
                Builder
              </Link>
              <DifficultySelector />
              <span className="tg-slot rounded px-2 py-0.5 font-mono text-[11px] text-accent">
                v{version.gameVersion}
              </span>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">{children}</main>
        <CommandPalette />
        <footer className="border-t border-edge">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-6 py-4 text-xs text-zinc-600">
            <div className="flex flex-wrap items-center gap-3">
              <span>Datos alineados a Terraria {version.gameVersion}.</span>
              <Link
                href="/changelog"
                className="text-zinc-500 transition-colors hover:text-accent"
              >
                Changelog →
              </Link>
            </div>
            <span>No afiliado a Re-Logic. Ítems y sprites © Re-Logic.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}