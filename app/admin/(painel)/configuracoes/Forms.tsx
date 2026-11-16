"use client";

import { useActionState } from "react";
import type { Settings } from "@/app/lib/types";
import { changePassword, saveSettings } from "../../actions";
import { Card, Label, Notice, btnPrimary, input } from "../../ui";

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action, pending] = useActionState(saveSettings, null);
  return (
    <Card title="Contato e entrega">
      <form action={action} className="grid gap-4 sm:grid-cols-2">
        <Label text="WhatsApp que recebe os pedidos" hint="Só números, com DDI e DDD. Ex.: 5511999998888" className="sm:col-span-2">
          <input name="whatsapp" inputMode="numeric" defaultValue={settings.whatsapp} required className={input} />
        </Label>
        <Label text="Instagram">
          <input name="instagram" defaultValue={settings.instagram} placeholder="@camadacriativa" className={input} />
        </Label>
        <Label text="E-mail">
          <input name="email" type="email" defaultValue={settings.email} className={input} />
        </Label>
        <Label text="Horário de atendimento">
          <input name="hours" defaultValue={settings.hours} className={input} />
        </Label>
        <Label text="Prazo de entrega (dias úteis)">
          <input name="delivery_days" type="number" min={1} max={60} defaultValue={settings.deliveryDays} required className={input} />
        </Label>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <button type="submit" disabled={pending} className={btnPrimary}>
            {pending ? "Salvando..." : "Salvar"}
          </button>
          <Notice result={state} />
        </div>
      </form>
    </Card>
  );
}

export function PasswordForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(changePassword, null);
  return (
    <Card title="Sua conta">
      <p className="-mt-2 mb-4 text-sm text-ink-soft">{email}</p>
      <form action={action} className="space-y-4">
        <Label text="Nova senha" hint="Mínimo de 8 caracteres">
          <input name="password" type="password" autoComplete="new-password" minLength={8} required className={input} />
        </Label>
        <Label text="Confirmar nova senha">
          <input name="confirm" type="password" autoComplete="new-password" minLength={8} required className={input} />
        </Label>
        <Notice result={state} />
        <button type="submit" disabled={pending} className={`${btnPrimary} w-full`}>
          {pending ? "Alterando..." : "Alterar senha"}
        </button>
      </form>
    </Card>
  );
}
