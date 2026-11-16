"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/app/lib/types";
import ProductCard from "./ProductCard";


const sorts = [
  { id: "relevancia", label: "Mais relevantes" },
  { id: "vendidos", label: "Mais vendidos" },
  { id: "avaliados", label: "Melhor avaliados" },
] as const;

function normalize(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export default function Catalog({ products, fromPrice, deliveryDays }: { products: Product[]; fromPrice: number; deliveryDays: number }) {
  const themes = Array.from(new Set(products.map((p) => p.theme))).filter(Boolean);
  const events = Array.from(new Set(products.map((p) => p.event)));
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const q = params.get("q") ?? "";
  const evento = params.get("evento") ?? "";
  const tema = params.get("tema") ?? "";
  const ordem = params.get("ordem") ?? "relevancia";

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  let list = products.filter((p) => {
    if (evento && p.event !== evento) return false;
    if (tema && p.theme !== tema) return false;
    if (q) {
      const hay = normalize(`${p.name} ${p.theme} ${p.event} ${p.description}`);
      if (!normalize(q).split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    return true;
  });
  if (ordem === "vendidos") list = [...list].sort((a, b) => b.sold - a.sold);
  if (ordem === "avaliados") list = [...list].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);

  const chip = (active: boolean) =>
    `block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
      active ? "bg-lavender text-lilac-dark" : "text-ink-soft hover:bg-white"
    }`;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[230px_1fr]">
      {/* Filtros */}
      <aside className="min-w-0 space-y-6 lg:sticky lg:top-24 lg:self-start">
        {(q || evento || tema) && (
          <button type="button" onClick={() => router.replace(pathname, { scroll: false })} className="text-sm font-bold text-lilac underline">
            Limpar filtros
          </button>
        )}
        <div>
          <h2 className="mb-2 font-display font-bold">Evento</h2>
          <div className="no-scrollbar flex gap-1 overflow-x-auto lg:block lg:space-y-1">
            <button type="button" className={`${chip(!evento)} shrink-0 lg:w-full`} onClick={() => setParam("evento", "")}>
              Todos
            </button>
            {events.map((e) => (
              <button key={e} type="button" className={`${chip(evento === e)} shrink-0 whitespace-nowrap lg:w-full`} onClick={() => setParam("evento", e)}>
                {e}
              </button>
            ))}
          </div>
        </div>
        <div className="hidden lg:block">
          <h2 className="mb-2 font-display font-bold">Tema</h2>
          <div className="space-y-1">
            <button type="button" className={chip(!tema)} onClick={() => setParam("tema", "")}>
              Todos
            </button>
            {themes.map((t) => (
              <button key={t} type="button" className={chip(tema === t)} onClick={() => setParam("tema", t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Resultados */}
      <div className="min-w-0">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-ink-soft">
            {q && (
              <>
                Resultados para <strong className="text-ink">“{q}”</strong> ·{" "}
              </>
            )}
            {list.length} {list.length === 1 ? "convite" : "convites"}
          </p>
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            Ordenar por
            <select
              value={ordem}
              onChange={(e) => setParam("ordem", e.target.value === "relevancia" ? "" : e.target.value)}
              className="rounded-full border border-line bg-white px-4 py-2 font-semibold text-ink outline-none focus:border-lilac"
            >
              {sorts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {list.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-lavender-deep bg-white p-12 text-center">
            <p className="font-display text-xl font-bold">Nenhum convite encontrado</p>
            <p className="mt-2 text-ink-soft">Tente outro termo ou fale com a gente: criamos temas sob encomenda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 xl:grid-cols-3">
            {list.map((p) => (
              <ProductCard key={p.slug} p={p} fromPrice={fromPrice} deliveryDays={deliveryDays} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
