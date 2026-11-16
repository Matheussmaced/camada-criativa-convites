import Link from "next/link";
import InviteArt from "@/app/components/InviteArt";
import ProductCard from "@/app/components/ProductCard";
import { CheckIcon, ChevronIcon, Stars, formatIcon } from "@/app/components/Icons";
import { getFormats, getProducts, getSettings, minPrice } from "@/app/lib/catalog";
import { faqs, steps, testimonials } from "@/app/lib/content";
import { brl, whatsappLink, type Motif, type Palette } from "@/app/lib/types";

const heroSamples: { motif: Motif; palette: Palette }[] = [
  { motif: "stars", palette: { bg: "#E6E4FB", soft: "#F5F4FF", accent: "#8B7FD6", ink: "#3D3654" } },
  { motif: "flowers", palette: { bg: "#FFE4DA", soft: "#FFF5F0", accent: "#E8917A", ink: "#5A3B36" } },
  { motif: "clouds", palette: { bg: "#DCEEFB", soft: "#F2F9FF", accent: "#6FA8D8", ink: "#33465C" } },
];

function SectionTitle({ kicker, title, text, center = true }: { kicker: string; title: string; text?: string; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="text-sm font-extrabold uppercase tracking-[0.2em] text-lilac">{kicker}</span>
      <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">{title}</h2>
      {text && <p className="mt-3 text-lg text-ink-soft">{text}</p>}
    </div>
  );
}

function Dots() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.6" fill="#8B7FD6" opacity="0.18" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  );
}

export default async function Home() {
  const [products, formats, settings] = await Promise.all([getProducts(), getFormats(), getSettings()]);
  const events = Array.from(new Set(products.map((p) => p.event)));
  const fromPrice = minPrice(formats);
  const [a, b, c] = heroSamples;
  const featured = products.slice(0, 8);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-lavender to-page">
        <Dots />
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-baby blur-3xl" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-peach/70 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-lavender-deep bg-white/70 px-4 py-1.5 text-sm font-bold text-lilac-dark">
              <span className="h-2 w-2 rounded-full bg-mint-deep" />
              Entrega em até {settings.deliveryDays} dias úteis
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] sm:text-6xl">
              Convites delicados para{" "}
              <span className="relative whitespace-nowrap text-lilac">
                momentos únicos
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden>
                  <path d="M2 7C60 2 140 2 198 7" stroke="#DCEDFB" strokeWidth="6" strokeLinecap="round" fill="none" />
                </svg>
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-ink-soft">
              Escolha o tema, preencha os dados da festa e receba um convite animado, digital ou interativo pronto para enviar
              no WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/convites" className="rounded-full bg-lilac px-7 py-4 font-bold text-white shadow-lg shadow-lilac/30 transition hover:bg-lilac-dark">
                Ver convites
              </Link>
              <Link href="/#como-funciona" className="rounded-full border-2 border-lavender-deep bg-white px-7 py-4 font-bold text-ink transition hover:border-lilac">
                Como funciona
              </Link>
            </div>
            <ul className="mt-10 grid max-w-md gap-2 text-ink-soft sm:grid-cols-2">
              {["Prévia antes da versão final", "Ajustes de texto sem custo", "Pix ou cartão em até 3x", "Mais de 2 mil festas"].map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm font-semibold">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-mint text-mint-deep">
                    <CheckIcon className="h-3 w-3" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto h-[440px] w-full max-w-[420px] sm:h-[500px]">
            <div className="animate-drift absolute left-0 top-12 w-[46%] -rotate-6">
              <InviteArt motif={b.motif} palette={b.palette} text={{ eventLine: "Aniversário da", name: "Alice", age: "1", date: "Sábado, 12/12", time: "às 16h" }} className="shadow-xl" />
            </div>
            <div className="animate-drift absolute left-1/2 top-0 z-10 w-[52%] -translate-x-1/2" style={{ animationDelay: "1.2s" }}>
              <InviteArt motif={a.motif} palette={a.palette} text={{ eventLine: "Aniversário de", name: "Theo", age: "4", date: "Domingo, 20/12", time: "às 15h", place: "Buffet Lua Cheia" }} className="shadow-2xl" />
            </div>
            <div className="animate-drift absolute right-0 top-20 w-[44%] rotate-6" style={{ animationDelay: "2.4s" }}>
              <InviteArt motif={c.motif} palette={c.palette} text={{ eventLine: "Chá de bebê da", name: "Helena", date: "Sábado, 05/12", time: "às 14h" }} className="shadow-xl" />
            </div>
            <div className="absolute bottom-4 left-2 z-20 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-lg">
              <Stars rating={5} className="h-4 w-4" />
              <span className="text-sm font-bold">4,9 de 5</span>
            </div>
          </div>
        </div>
      </section>

      {/* EVENTOS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 py-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
          {events.map((e, i) => (
            <Link
              key={e}
              href={`/convites?evento=${encodeURIComponent(e)}`}
              className={`shrink-0 rounded-full px-6 py-3 font-display font-bold transition hover:-translate-y-0.5 ${
                ["bg-lavender", "bg-baby", "bg-peach", "bg-mint", "bg-[#FBEFF7]"][i % 5]
              }`}
            >
              {e}
            </Link>
          ))}
        </div>
      </section>

      {/* DESTAQUES */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle kicker="Coleção" title="Os queridinhos da temporada" center={false} />
          <Link href="/convites" className="inline-flex items-center gap-1 font-bold text-lilac hover:text-lilac-dark">
            Ver todos <ChevronIcon />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.slug} p={p} fromPrice={fromPrice} deliveryDays={settings.deliveryDays} />
          ))}
        </div>
      </section>

      {/* FORMATOS */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle kicker="Formatos" title="Escolha como quer convidar" text="Todo tema está disponível nos três formatos." />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {formats.map((f, i) => {
              const Icon = formatIcon(f.id);
              const tones = ["bg-lavender text-lilac-dark", "bg-baby text-baby-deep", "bg-peach text-peach-deep"][i % 3];
              return (
                <div key={f.id} className="rounded-3xl border border-line bg-page p-8">
                  <div className="flex items-center justify-between">
                    <span className={`grid h-14 w-14 place-items-center rounded-2xl ${tones}`}>
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-ink-soft">{f.tag}</span>
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-bold">{f.short}</h3>
                  <p className="mt-1 text-sm font-semibold text-ink-soft">{f.file}</p>
                  <p className="mt-3 text-ink-soft">{f.description}</p>
                  <p className="mt-6">
                    {f.oldPrice && <span className="mr-2 text-sm text-ink-soft line-through">{brl(f.oldPrice)}</span>}
                    <span className="font-display text-2xl font-bold">{brl(f.price)}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6">
        <SectionTitle kicker="Passo a passo" title="Do clique ao convite pronto" />
        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="relative rounded-3xl border border-line bg-white p-7">
              <span className="font-display text-5xl font-bold text-lavender-deep">0{i + 1}</span>
              <h3 className="mt-3 font-display text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-ink-soft">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* DEPOIMENTOS */}
      <section className="bg-lavender py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle kicker="Depoimentos" title="Quem já fez, recomenda" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="flex flex-col rounded-3xl bg-white p-7">
                <Stars rating={5} />
                <blockquote className="mt-4 flex-1 text-lg leading-relaxed">“{t.text}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-baby font-display font-bold text-baby-deep">
                    {t.name[0]}
                  </span>
                  <span>
                    <span className="block font-bold">{t.name}</span>
                    <span className="block text-xs text-ink-soft">{t.city}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="duvidas" className="mx-auto grid max-w-7xl scroll-mt-20 gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <SectionTitle kicker="Dúvidas" title="Perguntas frequentes" text="Não encontrou sua resposta? Fale com a gente." center={false} />
          <a
            href={whatsappLink(settings.whatsapp, "Oi! Tenho uma dúvida sobre os convites.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-full bg-ink px-6 py-3 font-bold text-white transition hover:bg-lilac"
          >
            Perguntar no WhatsApp
          </a>
        </div>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-line bg-white p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold">
                {f.q}
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lavender text-lilac transition group-open:rotate-45">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-lilac to-[#A99DF0] px-8 py-16 text-center text-white">
          <Dots />
          <h2 className="relative mx-auto max-w-2xl font-display text-3xl font-bold sm:text-5xl">Sua festa merece um convite à altura</h2>
          <p className="relative mx-auto mt-4 max-w-lg text-white/85">Escolha o tema, preencha o formulário e receba a prévia pelo WhatsApp.</p>
          <Link href="/convites" className="relative mt-8 inline-block rounded-full bg-white px-8 py-4 font-bold text-lilac-dark transition hover:bg-lavender">
            Escolher meu convite
          </Link>
        </div>
      </section>
    </>
  );
}
