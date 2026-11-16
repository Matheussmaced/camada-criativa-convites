import { cacheLife, cacheTag } from "next/cache";
import { publicClient } from "./supabase/clients";
import { mapExtra, mapFormat, mapProduct, mapSettings, type Extra, type Format, type Product, type Settings } from "./types";

/** Tag usada para atualizar o site quando o admin salva algo. */
export const CATALOG_TAG = "catalog";

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("days");
  const { data, error } = await publicClient()
    .from("products")
    .select("*")
    .eq("active", true)
    .order("sort")
    .order("created_at");
  if (error) throw new Error(`Erro ao carregar produtos: ${error.message}`);
  return data.map(mapProduct);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const all = await getProducts();
  return all.find((p) => p.slug === slug);
}

export async function getFormats(): Promise<Format[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("days");
  const { data, error } = await publicClient().from("formats").select("*").eq("active", true).order("sort");
  if (error) throw new Error(`Erro ao carregar formatos: ${error.message}`);
  return data.map(mapFormat);
}

export async function getExtras(): Promise<Extra[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("days");
  const { data, error } = await publicClient().from("extras").select("*").eq("active", true).order("sort");
  if (error) throw new Error(`Erro ao carregar complementos: ${error.message}`);
  return data.map(mapExtra);
}

export async function getSettings(): Promise<Settings> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("days");
  const { data } = await publicClient().from("settings").select("*").eq("id", 1).maybeSingle();
  return mapSettings(data);
}

export function minPrice(formats: Format[]) {
  return formats.length ? Math.min(...formats.map((f) => f.price)) : 0;
}

export function relatedProducts(all: Product[], p: Product, n = 4) {
  return all
    .filter((x) => x.slug !== p.slug)
    .sort((a, b) => Number(b.event === p.event) - Number(a.event === p.event))
    .slice(0, n);
}
