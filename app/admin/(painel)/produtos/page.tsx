import type { Metadata } from "next";
import Link from "next/link";
import InviteArt from "@/app/components/InviteArt";
import { requireAdmin } from "@/app/lib/supabase/server";
import { mapProduct } from "@/app/lib/types";
import { PageHeader, btnPrimary } from "../../ui";
import ToggleActive from "./ToggleActive";

export const metadata: Metadata = { title: "Produtos" };

export default async function ProductsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("products").select("*").order("sort").order("created_at");
  const products = (data ?? []).map(mapProduct);

  return (
    <>
      <PageHeader
        title="Produtos"
        description={`${products.length} modelos · ${products.filter((p) => p.active).length} visíveis no site`}
        action={
          <Link href="/admin/produtos/novo" className={btnPrimary}>
            + Novo produto
          </Link>
        }
      />

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-lavender-deep bg-white p-12 text-center">
          <p className="font-display text-lg font-bold">Nenhum produto cadastrado</p>
          <Link href="/admin/produtos/novo" className={`${btnPrimary} mt-4`}>Criar o primeiro</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => (
            <article key={p.id} className={`flex gap-4 rounded-2xl border border-line bg-white p-4 ${p.active ? "" : "opacity-70"}`}>
              <Link href={`/admin/produtos/${p.id}`} className="w-20 shrink-0">
                {p.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.images[0]} alt="" className="aspect-[2/3] w-full rounded-md object-cover" />
                ) : (
                  <InviteArt
                    motif={p.motif}
                    palette={p.palette}
                    text={{ eventLine: p.sample.eventLine, name: p.sample.name, age: p.sample.age?.toString() }}
                  />
                )}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/admin/produtos/${p.id}`} className="font-display font-bold leading-snug hover:text-lilac">
                    {p.name}
                  </Link>
                  {p.badge && <span className="shrink-0 rounded-md bg-lavender px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-lilac-dark">{p.badge}</span>}
                </div>
                <p className="text-xs text-ink-soft">
                  {p.event} · {p.theme || "sem tema"}
                </p>
                <p className="mt-1 truncate text-xs text-ink-soft">/convite/{p.slug}</p>
                <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                  <ToggleActive id={p.id} active={p.active} />
                  <div className="flex gap-3 text-sm font-bold">
                    {p.active && (
                      <Link href={`/convite/${p.slug}`} target="_blank" className="text-ink-soft hover:text-lilac">
                        Ver
                      </Link>
                    )}
                    <Link href={`/admin/produtos/${p.id}`} className="text-lilac hover:text-lilac-dark">
                      Editar
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
