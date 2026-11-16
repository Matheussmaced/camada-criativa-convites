import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BuyBox from "@/app/components/BuyBox";
import ProductCard from "@/app/components/ProductCard";
import ProductGallery from "@/app/components/ProductGallery";
import { CheckIcon, ChevronIcon, Stars } from "@/app/components/Icons";
import { getExtras, getFormats, getProduct, getProducts, getSettings, relatedProducts } from "@/app/lib/catalog";
import { questionsSample, reviewsSample } from "@/app/lib/content";
import { brl } from "@/app/lib/types";

export async function generateStaticParams() {
  const products = await getProducts();
  if (products.length === 0) return [{ slug: "exemplo" }];
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/convite/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  return p ? { title: p.name, description: p.description } : {};
}

export default async function ProductPage({ params }: PageProps<"/convite/[slug]">) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const [all, formats, extras, settings] = await Promise.all([getProducts(), getFormats(), getExtras(), getSettings()]);

  const specs = [
    ["Tema", p.theme],
    ["Indicado para", p.event],
    ["Formatos", formats.map((f) => f.short).join(", ")],
    ["Resolução", "1080 × 1920 px (tela de celular)"],
    ["Personalização", "Nome, idade, data, horário, local e mensagem"],
    ["Prazo de entrega", `Até ${settings.deliveryDays} dias úteis`],
    ["Alterações", "Ajustes de texto e cores inclusos"],
  ];

  const breakdown = [5, 4, 3, 2, 1].map((n) => ({ n, pct: n === 5 ? 88 : n === 4 ? 10 : n === 3 ? 2 : 0 }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="flex flex-wrap items-center gap-1 text-sm text-ink-soft" aria-label="Você está em">
        <Link href="/" className="hover:text-lilac">Início</Link>
        <ChevronIcon className="h-3.5 w-3.5" />
        <Link href="/convites" className="hover:text-lilac">Convites</Link>
        <ChevronIcon className="h-3.5 w-3.5" />
        <Link href={`/convites?evento=${encodeURIComponent(p.event)}`} className="hover:text-lilac">{p.event}</Link>
        <ChevronIcon className="h-3.5 w-3.5" />
        <span className="font-semibold text-ink">{p.name}</span>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
        <div className="min-w-0 lg:col-start-1">
          <ProductGallery p={p} />
        </div>

        {/* Caixa de compra */}
        <aside className="min-w-0 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <BuyBox p={p} formats={formats} whatsapp={settings.whatsapp} deliveryDays={settings.deliveryDays} />
        </aside>

        {/* Detalhes */}
        <div className="min-w-0 space-y-12 lg:col-start-1">

          <section>
            <h2 className="font-display text-2xl font-bold">Descrição</h2>
            <p className="mt-3 text-lg leading-relaxed text-ink-soft">{p.description}</p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {["Personalizado com os dados da sua festa", "Pronto para WhatsApp, Instagram e e-mail", "Prévia para aprovação antes da entrega", "Pode ser impresso em casa (imagem e PDF)"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mint text-mint-deep">
                    <CheckIcon className="h-3 w-3" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Características</h2>
            <table className="mt-4 w-full overflow-hidden rounded-2xl text-left text-sm">
              <tbody>
                {specs.map(([k, v], i) => (
                  <tr key={k} className={i % 2 ? "bg-white" : "bg-lavender/50"}>
                    <th scope="row" className="w-2/5 px-4 py-3 font-bold">{k}</th>
                    <td className="px-4 py-3 text-ink-soft">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Complete o kit</h2>
            <p className="mt-1 text-ink-soft">Adicione no formulário de personalização, no mesmo tema.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {extras.map((e) => (
                <div key={e.id} className="rounded-2xl border border-line bg-white p-4">
                  <p className="font-display font-bold">{e.name}</p>
                  <p className="mt-1 text-sm text-ink-soft">{e.description}</p>
                  <p className="mt-2 font-bold">+ {brl(e.price)}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Perguntas e respostas</h2>
            <div className="mt-4 space-y-5">
              {questionsSample.map((x) => (
                <div key={x.q}>
                  <p className="font-semibold">{x.q}</p>
                  <p className="mt-1 border-l-2 border-lavender-deep pl-3 text-ink-soft">{x.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="avaliacoes" className="scroll-mt-24">
            <h2 className="font-display text-2xl font-bold">Opiniões sobre o convite</h2>
            <div className="mt-5 grid gap-8 sm:grid-cols-[200px_1fr]">
              <div>
                <p className="font-display text-5xl font-bold text-lilac">{p.rating.toLocaleString("pt-BR")}</p>
                <Stars rating={p.rating} className="h-5 w-5" />
                <p className="mt-1 text-sm text-ink-soft">{p.reviews} avaliações</p>
                <div className="mt-4 space-y-1.5">
                  {breakdown.map((b) => (
                    <div key={b.n} className="flex items-center gap-2 text-xs text-ink-soft">
                      <span className="w-3">{b.n}</span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-lavender">
                        <span className="block h-full rounded-full bg-lilac" style={{ width: `${b.pct}%` }} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                {reviewsSample.map((r) => (
                  <article key={r.name} className="border-b border-line pb-5 last:border-0">
                    <div className="flex items-center justify-between gap-2">
                      <Stars rating={r.rating} />
                      <span className="text-xs text-ink-soft">{r.date}</span>
                    </div>
                    <p className="mt-2">{r.text}</p>
                    <p className="mt-1 text-sm font-semibold text-ink-soft">{r.name}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="mt-20">
        <h2 className="font-display text-2xl font-bold">Você também pode gostar</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {relatedProducts(all, p).map((x) => (
            <ProductCard key={x.slug} p={x} fromPrice={Math.min(...formats.map((f) => f.price))} deliveryDays={settings.deliveryDays} />
          ))}
        </div>
      </section>
    </div>
  );
}
