import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/app/lib/supabase/server";
import { ORDER_STATUS, brl, type Order, type OrderStatus } from "@/app/lib/types";
import { PageHeader, formatDateTime, formatPartyDate, input } from "../ui";

export const metadata: Metadata = { title: "Pedidos" };

export default async function OrdersPage({ searchParams }: PageProps<"/admin">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" && sp.status in ORDER_STATUS ? (sp.status as OrderStatus) : "";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const { supabase } = await requireAdmin();

  let query = supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
  if (status) query = query.eq("status", status);
  if (q) {
    const term = q.replace(/[%,()]/g, " ");
    const code = Number(q.replace(/\D/g, ""));
    query = query.or(
      [`customer_name.ilike.%${term}%`, `customer_whatsapp.ilike.%${term}%`, `product_name.ilike.%${term}%`, code ? `code.eq.${code}` : ""]
        .filter(Boolean)
        .join(","),
    );
  }
  const [{ data, error }, { data: all }] = await Promise.all([query, supabase.from("orders").select("status")]);
  const orders = (data ?? []) as Order[];

  const counts = (all ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
  const total = all?.length ?? 0;
  const tab = (s: string) => {
    const params = new URLSearchParams();
    if (s) params.set("status", s);
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `/admin?${qs}` : "/admin";
  };

  return (
    <>
      <PageHeader title="Pedidos" description="Todos os pedidos feitos pelo formulário do site." />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Novos", counts.novo ?? 0, "text-lilac"],
          ["Em produção", (counts.em_producao ?? 0) + (counts.previa_enviada ?? 0) + (counts.aprovado ?? 0), "text-[#B08A1F]"],
          ["Entregues", counts.entregue ?? 0, "text-mint-deep"],
          ["Total", total, "text-ink"],
        ].map(([label, n, tone]) => (
          <div key={label as string} className="rounded-2xl border border-line bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">{label}</p>
            <p className={`mt-1 font-display text-3xl font-bold ${tone}`}>{n}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          {[["", "Todos"], ...Object.entries(ORDER_STATUS).map(([k, v]) => [k, v.label])].map(([k, label]) => (
            <Link
              key={k}
              href={tab(k)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-bold transition ${status === k ? "bg-ink text-white" : "text-ink-soft hover:bg-white"}`}
            >
              {label}
              {k && counts[k] ? <span className="ml-1.5 opacity-60">{counts[k]}</span> : null}
            </Link>
          ))}
        </div>
        <form className="flex gap-2" action="/admin">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q} placeholder="Buscar cliente, nº, WhatsApp..." className={`${input} lg:w-72`} />
        </form>
      </div>

      {error && <p className="mb-4 rounded-xl bg-[#F3D6DC] px-4 py-3 text-sm text-[#8A3346]">Erro ao carregar pedidos: {error.message}</p>}

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-lavender-deep bg-white p-12 text-center">
          <p className="font-display text-lg font-bold">Nenhum pedido por aqui</p>
          <p className="mt-1 text-sm text-ink-soft">Os pedidos feitos no site aparecem nesta lista.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-line bg-page text-xs uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-4 py-3">Pedido</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Convite</th>
                  <th className="px-4 py-3">Festa</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((o) => (
                  <tr key={o.id} className="group relative hover:bg-page">
                    <td className="px-4 py-3">
                      <Link href={`/admin/pedidos/${o.id}`} className="font-bold after:absolute after:inset-0">
                        #{o.code}
                      </Link>
                      <span className="block text-xs text-ink-soft">{formatDateTime(o.created_at)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block font-semibold">{o.customer_name}</span>
                      <span className="text-xs text-ink-soft">{o.customer_whatsapp}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block">{o.product_name}</span>
                      <span className="text-xs text-ink-soft">
                        {o.format_name}
                        {o.extras.length > 0 && ` + ${o.extras.length} complemento${o.extras.length > 1 ? "s" : ""}`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block">{o.party.nome}</span>
                      <span className="text-xs text-ink-soft">{formatPartyDate(o.party.data)}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold">{brl(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-md px-2 py-1 text-xs font-bold ${ORDER_STATUS[o.status].tone}`}>{ORDER_STATUS[o.status].label}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
