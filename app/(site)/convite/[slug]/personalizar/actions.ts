"use server";

import { publicClient } from "@/app/lib/supabase/clients";

export type OrderPayload = {
  product_slug: string;
  format_id: string;
  extras: string[];
  party: Record<string, string>;
  customer_name: string;
  customer_whatsapp: string;
  customer_email: string;
  notes: string;
  has_photo: boolean;
};

export type OrderResult = { ok: true; code: number; total: number } | { ok: false; error: string };

/** Registra o pedido. Os preços são calculados no banco (função create_order). */
export async function createOrder(payload: OrderPayload): Promise<OrderResult> {
  const party = Object.fromEntries(
    Object.entries(payload.party ?? {}).map(([k, v]) => [k, String(v ?? "").slice(0, 300)]),
  );
  const { data, error } = await publicClient().rpc("create_order", {
    payload: {
      product_slug: String(payload.product_slug),
      format_id: String(payload.format_id),
      extras: Array.isArray(payload.extras) ? payload.extras.map(String).slice(0, 20) : [],
      party,
      customer_name: String(payload.customer_name ?? ""),
      customer_whatsapp: String(payload.customer_whatsapp ?? ""),
      customer_email: String(payload.customer_email ?? ""),
      notes: String(payload.notes ?? "").slice(0, 1000),
      has_photo: Boolean(payload.has_photo),
    },
  });
  if (error || !data?.[0]) return { ok: false, error: error?.message ?? "erro desconhecido" };
  return { ok: true, code: Number(data[0].code), total: Number(data[0].total) };
}
