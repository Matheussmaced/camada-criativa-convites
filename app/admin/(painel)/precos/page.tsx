import type { Metadata } from "next";
import { requireAdmin } from "@/app/lib/supabase/server";
import { mapExtra, mapFormat } from "@/app/lib/types";
import { PageHeader } from "../../ui";
import PricesForm from "./PricesForm";

export const metadata: Metadata = { title: "Preços" };

export default async function PricesPage() {
  const { supabase } = await requireAdmin();
  const [{ data: formats }, { data: extras }] = await Promise.all([
    supabase.from("formats").select("*").order("sort"),
    supabase.from("extras").select("*").order("sort"),
  ]);
  return (
    <>
      <PageHeader title="Preços" description="Os preços valem para todos os modelos. Ao salvar, o site é atualizado na hora." />
      <PricesForm formats={(formats ?? []).map(mapFormat)} extras={(extras ?? []).map(mapExtra)} />
    </>
  );
}
