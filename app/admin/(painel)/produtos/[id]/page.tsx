import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/app/lib/supabase/server";
import { mapProduct } from "@/app/lib/types";
import { PageHeader } from "../../../ui";
import ProductForm from "../ProductForm";

export const metadata: Metadata = { title: "Editar produto" };

export default async function EditProductPage({ params }: PageProps<"/admin/produtos/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const product = mapProduct(data);

  return (
    <>
      <Link href="/admin/produtos" className="text-sm font-bold text-ink-soft hover:text-lilac">← Voltar para produtos</Link>
      <div className="mt-3">
        <PageHeader title={product.name} description="As alterações aparecem no site assim que você salvar." />
      </div>
      <ProductForm product={product} />
    </>
  );
}
