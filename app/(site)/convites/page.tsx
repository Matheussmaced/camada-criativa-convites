import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Catalog from "@/app/components/Catalog";
import { ChevronIcon } from "@/app/components/Icons";
import { getFormats, getProducts, getSettings, minPrice } from "@/app/lib/catalog";

export const metadata: Metadata = {
  title: "Convites",
  description: "Todos os convites animados, digitais e interativos da Camada Criativa.",
};

export default async function ConvitesPage() {
  const [products, formats, settings] = await Promise.all([getProducts(), getFormats(), getSettings()]);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="flex items-center gap-1 text-sm text-ink-soft" aria-label="Você está em">
        <Link href="/" className="hover:text-lilac">Início</Link>
        <ChevronIcon className="h-3.5 w-3.5" />
        <span className="font-semibold text-ink">Convites</span>
      </nav>
      <h1 className="mt-4 font-display text-4xl font-bold">Todos os convites</h1>
      <p className="mt-2 text-ink-soft">Cada tema está disponível em todos os formatos.</p>
      <div className="mt-10">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-lavender/50" />}>
          <Catalog products={products} fromPrice={minPrice(formats)} deliveryDays={settings.deliveryDays} />
        </Suspense>
      </div>
    </div>
  );
}
