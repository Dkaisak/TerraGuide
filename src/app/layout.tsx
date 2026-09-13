import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { ItemDetailProvider } from "@/components/items/ItemDetailProvider";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
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
        <LocaleProvider>
          <ItemDetailProvider>
            <SiteHeader version={version.gameVersion} />
            <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-5">{children}</main>
            <CommandPalette />
            <SiteFooter version={version.gameVersion} />
          </ItemDetailProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
