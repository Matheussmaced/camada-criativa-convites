import type { Metadata } from "next";
import { requireAdmin } from "@/app/lib/supabase/server";
import { mapSettings } from "@/app/lib/types";
import { PageHeader } from "../../ui";
import { PasswordForm, SettingsForm } from "./Forms";

export const metadata: Metadata = { title: "Configurações" };

export default async function SettingsPage() {
  const { supabase, user } = await requireAdmin();
  const { data } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
  return (
    <>
      <PageHeader title="Configurações" description="Contato exibido no site e dados da sua conta." />
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <SettingsForm settings={mapSettings(data)} />
        <PasswordForm email={user.email ?? ""} />
      </div>
    </>
  );
}
