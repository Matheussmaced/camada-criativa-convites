"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CATALOG_TAG } from "@/app/lib/catalog";
import { sessionClient, requireAdmin } from "@/app/lib/supabase/server";
import { MOTIFS, ORDER_STATUS } from "@/app/lib/types";

export type ActionResult = { ok: true; message?: string; id?: string } | { ok: false; error: string };

const hex = /^#[0-9a-fA-F]{6}$/;
const slugRe = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function fail(error: string): ActionResult {
  return { ok: false, error };
}

function money(v: unknown) {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : NaN;
}

/* ---------------- Sessão ---------------- */

export async function signIn(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return fail("Informe e-mail e senha.");
  const supabase = await sessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return fail("E-mail ou senha incorretos.");
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    await supabase.auth.signOut();
    return fail("Este usuário não tem acesso ao painel.");
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await sessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function changePassword(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  if (password.length < 8) return fail("A senha precisa ter pelo menos 8 caracteres.");
  if (password !== confirm) return fail("As senhas não conferem.");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return fail(error.message);
  return { ok: true, message: "Senha alterada." };
}

/* ---------------- Pedidos ---------------- */

export async function updateOrder(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");
  if (!(status in ORDER_STATUS)) return fail("Status inválido.");
  const { error } = await supabase
    .from("orders")
    .update({ status, admin_notes: String(form.get("admin_notes") ?? "").slice(0, 4000) || null })
    .eq("id", id);
  if (error) return fail(error.message);
  refresh();
  return { ok: true, message: "Pedido atualizado." };
}

export async function deleteOrder(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("orders").delete().eq("id", id);
  redirect("/admin");
}

/* ---------------- Produtos ---------------- */

export type ProductInput = {
  id?: string;
  slug: string;
  name: string;
  theme: string;
  event: string;
  motif: string;
  palette: { bg: string; soft: string; accent: string; ink: string };
  badge: string;
  rating: number;
  reviews: number;
  sold: number;
  sample_name: string;
  sample_age: string;
  sample_event_line: string;
  description: string;
  images: string[];
  active: boolean;
  sort: number;
};

export async function saveProduct(input: ProductInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const name = String(input.name ?? "").trim();
  const slug = String(input.slug ?? "").trim();
  if (!name) return fail("Informe o nome do produto.");
  if (!slugRe.test(slug)) return fail("O endereço (slug) deve ter só letras minúsculas, números e hífens.");
  if (!(MOTIFS as readonly string[]).includes(input.motif)) return fail("Ilustração inválida.");
  const pal = input.palette ?? {};
  if (![pal.bg, pal.soft, pal.accent, pal.ink].every((c) => hex.test(String(c)))) return fail("Cores inválidas.");
  const rating = Number(input.rating);
  if (!(rating >= 0 && rating <= 5)) return fail("A nota deve ficar entre 0 e 5.");
  const age = String(input.sample_age ?? "").trim();

  const row = {
    slug,
    name: name.slice(0, 120),
    theme: String(input.theme ?? "").slice(0, 80),
    event: String(input.event ?? "").slice(0, 60) || "Aniversário",
    motif: input.motif,
    palette: { bg: pal.bg, soft: pal.soft, accent: pal.accent, ink: pal.ink },
    badge: input.badge === "Novo" || input.badge === "Destaque" ? input.badge : null,
    rating: Math.round(rating * 10) / 10,
    reviews: Math.max(0, Math.floor(Number(input.reviews) || 0)),
    sold: Math.max(0, Math.floor(Number(input.sold) || 0)),
    sample_name: String(input.sample_name ?? "").slice(0, 40) || "Nome",
    sample_age: age === "" ? null : Math.max(0, Math.floor(Number(age) || 0)),
    sample_event_line: String(input.sample_event_line ?? "").slice(0, 40) || "Aniversário de",
    description: String(input.description ?? "").slice(0, 3000),
    images: (Array.isArray(input.images) ? input.images : []).map(String).filter((u) => u.startsWith("https://")).slice(0, 12),
    active: Boolean(input.active),
    sort: Math.floor(Number(input.sort) || 0),
  };

  const previous = input.id ? (await supabase.from("products").select("images").eq("id", input.id).single()).data?.images ?? [] : [];

  const query = input.id
    ? supabase.from("products").update(row).eq("id", input.id).select("id").single()
    : supabase.from("products").insert(row).select("id").single();
  const { data, error } = await query;
  if (error) {
    if (error.code === "23505") return fail("Já existe um produto com esse endereço (slug).");
    return fail(error.message);
  }
  // apaga do Storage as imagens que foram removidas do produto
  const removed = (previous as string[])
    .filter((u) => !row.images.includes(u))
    .map((u) => u.split("/product-images/")[1])
    .filter(Boolean);
  if (removed.length) await supabase.storage.from("product-images").remove(removed);
  updateTag(CATALOG_TAG);
  return { ok: true, id: data.id, message: "Produto salvo." };
}

export async function toggleProduct(id: string, active: boolean) {
  const { supabase } = await requireAdmin();
  await supabase.from("products").update({ active }).eq("id", id);
  updateTag(CATALOG_TAG);
  refresh();
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("products").select("images").eq("id", id).single();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return fail(error.message);
  const paths = (data?.images ?? [])
    .map((u: string) => u.split("/product-images/")[1])
    .filter(Boolean);
  if (paths.length) await supabase.storage.from("product-images").remove(paths);
  updateTag(CATALOG_TAG);
  return { ok: true };
}

/* ---------------- Preços ---------------- */

export type PricesInput = {
  formats: { id: string; name: string; short: string; price: string; old_price: string; file: string; description: string; tag: string; active: boolean; sort: number }[];
  extras: { id: string; isNew?: boolean; name: string; description: string; price: string; active: boolean; sort: number }[];
};

export async function savePrices(input: PricesInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  for (const f of input.formats ?? []) {
    const price = money(f.price);
    const old = String(f.old_price ?? "").trim() === "" ? null : money(f.old_price);
    if (Number.isNaN(price) || (old !== null && Number.isNaN(old))) return fail(`Preço inválido em "${f.short}".`);
    if (!String(f.short).trim()) return fail("Todo formato precisa de um nome curto.");
    const { error } = await supabase
      .from("formats")
      .update({
        name: String(f.name).slice(0, 120) || f.short,
        short: String(f.short).slice(0, 40),
        price,
        old_price: old,
        file: String(f.file ?? "").slice(0, 120),
        description: String(f.description ?? "").slice(0, 400),
        tag: String(f.tag ?? "").slice(0, 40),
        active: Boolean(f.active),
        sort: Math.floor(Number(f.sort) || 0),
      })
      .eq("id", f.id);
    if (error) return fail(error.message);
  }

  const keep: string[] = [];
  for (const e of input.extras ?? []) {
    const price = money(e.price);
    const name = String(e.name ?? "").trim();
    if (!name) return fail("Todo complemento precisa de um nome.");
    if (Number.isNaN(price)) return fail(`Preço inválido em "${name}".`);
    const id = e.isNew ? `${name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}` : e.id;
    keep.push(id);
    const { error } = await supabase.from("extras").upsert({
      id,
      name: name.slice(0, 80),
      description: String(e.description ?? "").slice(0, 300),
      price,
      active: Boolean(e.active),
      sort: Math.floor(Number(e.sort) || 0),
    });
    if (error) return fail(error.message);
  }
  const { data: existing } = await supabase.from("extras").select("id");
  const remove = (existing ?? []).map((r) => r.id).filter((id) => !keep.includes(id));
  if (remove.length) await supabase.from("extras").delete().in("id", remove);

  updateTag(CATALOG_TAG);
  return { ok: true, message: "Preços salvos. O site já está atualizado." };
}

/* ---------------- Configurações ---------------- */

export async function saveSettings(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const whatsapp = String(form.get("whatsapp") ?? "").replace(/\D/g, "");
  if (whatsapp.length < 12) return fail("Informe o WhatsApp com DDI e DDD, por exemplo 5511999998888.");
  const delivery = Math.floor(Number(form.get("delivery_days")));
  if (!(delivery >= 1 && delivery <= 60)) return fail("Prazo de entrega inválido.");
  const { error } = await supabase
    .from("settings")
    .update({
      whatsapp,
      instagram: String(form.get("instagram") ?? "").trim().slice(0, 60),
      email: String(form.get("email") ?? "").trim().slice(0, 120),
      hours: String(form.get("hours") ?? "").trim().slice(0, 80),
      delivery_days: delivery,
    })
    .eq("id", 1);
  if (error) return fail(error.message);
  updateTag(CATALOG_TAG);
  return { ok: true, message: "Configurações salvas." };
}
