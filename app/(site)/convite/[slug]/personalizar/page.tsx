import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronIcon } from "@/app/components/Icons";
import PersonalizeForm from "@/app/components/PersonalizeForm";
import { getExtras, getFormats, getProduct, getProducts, getSettings } from "@/app/lib/catalog";

export async function generateStaticParams() {
  const products = await getProducts();
  if (products.length === 0) return [{ slug: "exemplo" }];
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/convite/[slug]/personalizar">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  return p ? { title: `Personalizar ${p.name}` } : {};
}

export default async function PersonalizePage({ params }: PageProps<"/convite/[slug]/personalizar">) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const [formats, extras, settings] = await Promise.all([getFormats(), getExtras(), getSettings()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="flex flex-wrap items-center gap-1 text-sm text-ink-soft" aria-label="Você está em">
        <Link href="/convites" className="hover:text-lilac">Convites</Link>
        <ChevronIcon className="h-3.5 w-3.5" />
        <Link href={`/convite/${p.slug}`} className="hover:text-lilac">{p.name}</Link>
        <ChevronIcon className="h-3.5 w-3.5" />
        <span className="font-semibold text-ink">Personalizar</span>
      </nav>
      <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Personalize seu convite</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Preencha os dados da festa e acompanhe a prévia ao lado. Ao finalizar, seu pedido fica registrado e você envia a confirmação pelo WhatsApp.
      </p>
      <div className="mt-8">
        <Suspense fallback={<div className="h-[600px] animate-pulse rounded-3xl bg-lavender/50" />}>
          <PersonalizeForm p={p} formats={formats} extras={extras} whatsapp={settings.whatsapp} />
        </Suspense>
      </div>
    </div>
  );
}
