import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WhatsappIcon } from "@/app/components/Icons";
import { requireAdmin } from "@/app/lib/supabase/server";
import { ORDER_STATUS, brl, whatsappLink, type Order } from "@/app/lib/types";
import { Card, PageHeader, btnGhost, formatDateTime, formatPartyDate } from "../../../ui";
import OrderControls from "./OrderControls";

export const metadata: Metadata = { title: "Pedido" };

function customerWhatsapp(raw: string) {
  const d = raw.replace(/\D/g, "");
  return d.length <= 11 ? `55${d}` : d;
}

export default async function OrderPage({ params }: PageProps<"/admin/pedidos/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const o = data as Order;
  const p = o.party;

  const party: [string, string | undefined][] = [
    ["Evento", p.evento],
    ["Homenageado", p.nome],
    ["Idade", p.idade],
    ["Data", formatPartyDate(p.data)],
    ["Horário", p.horario],
    ["Local", p.local],
    ["Endereço", p.endereco],
    ["Mensagem", p.mensagem],
    ["Assinatura", p.assinatura],
    ["WhatsApp p/ confirmar", p.rsvp],
    ["Lista de presentes", p.lista],
  ];

  const greeting = `Oi, ${o.customer_name.split(" ")[0]}! Aqui é da Camada Criativa, sobre o seu pedido #${o.code} (${o.product_name}).`;

  return (
    <>
      <Link href="/admin" className="text-sm font-bold text-ink-soft hover:text-lilac">← Voltar para pedidos</Link>
      <div className="mt-3">
        <PageHeader
          title={`Pedido #${o.code}`}
          description={`Recebido em ${formatDateTime(o.created_at)}`}
          action={
            <span className={`rounded-lg px-3 py-1.5 text-sm font-bold ${ORDER_STATUS[o.status].tone}`}>{ORDER_STATUS[o.status].label}</span>
          }
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Card title="Convite">
            <dl className="divide-y divide-line text-sm">
              <div className="flex justify-between gap-4 py-2">
                <dt className="text-ink-soft">Modelo</dt>
                <dd className="text-right font-semibold">
                  {o.product_name}
                  {o.product_id && (
                    <Link href={`/admin/produtos/${o.product_id}`} className="ml-2 text-xs text-lilac hover:underline">ver produto</Link>
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-2">
                <dt className="text-ink-soft">{o.format_name}</dt>
                <dd>{brl(o.format_price)}</dd>
              </div>
              {o.extras.map((e) => (
                <div key={e.id} className="flex justify-between gap-4 py-2">
                  <dt className="text-ink-soft">+ {e.name}</dt>
                  <dd>{brl(e.price)}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 py-2 font-bold">
                <dt>Total</dt>
                <dd className="font-display text-lg">{brl(o.total)}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Dados da festa">
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {party
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className={k === "Endereço" || k === "Mensagem" ? "sm:col-span-2" : ""}>
                    <dt className="text-xs font-bold uppercase tracking-wide text-ink-soft">{k}</dt>
                    <dd className="mt-0.5 break-words">{v}</dd>
                  </div>
                ))}
            </dl>
            {o.has_photo && (
              <p className="mt-4 rounded-xl bg-peach/60 px-4 py-2.5 text-sm">O cliente escolheu enviar uma foto pelo WhatsApp.</p>
            )}
          </Card>

          {o.notes && (
            <Card title="Observações do cliente">
              <p className="whitespace-pre-wrap text-sm">{o.notes}</p>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          <Card title="Cliente">
            <p className="font-semibold">{o.customer_name}</p>
            <p className="text-sm text-ink-soft">{o.customer_whatsapp}</p>
            {o.customer_email && <p className="text-sm text-ink-soft">{o.customer_email}</p>}
            <a
              href={whatsappLink(customerWhatsapp(o.customer_whatsapp), greeting)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${btnGhost} mt-4 w-full`}
            >
              <WhatsappIcon className="h-4 w-4 text-[#25D366]" /> Conversar no WhatsApp
            </a>
          </Card>
          <OrderControls id={o.id} status={o.status} adminNotes={o.admin_notes ?? ""} />
        </div>
      </div>
    </>
  );
}
