import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "../../../ui";
import ProductForm from "../ProductForm";

export const metadata: Metadata = { title: "Novo produto" };

export default function NewProductPage() {
  return (
    <>
      <Link href="/admin/produtos" className="text-sm font-bold text-ink-soft hover:text-lilac">← Voltar para produtos</Link>
      <div className="mt-3">
        <PageHeader title="Novo produto" description="Preencha os dados e veja a prévia ao lado." />
      </div>
      <ProductForm />
    </>
  );
}
