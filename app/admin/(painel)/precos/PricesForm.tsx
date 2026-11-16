"use client";

import { useState, useTransition } from "react";
import { formatIcon } from "@/app/components/Icons";
import type { Extra, Format } from "@/app/lib/types";
import { savePrices, type ActionResult, type PricesInput } from "../../actions";
import { Card, Label, Notice, btnGhost, btnPrimary, input } from "../../ui";

const toStr = (n: number | null) => (n === null ? "" : String(n).replace(".", ","));

function MoneyInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <span className="flex items-center rounded-xl border border-line bg-white focus-within:border-lilac focus-within:ring-4 focus-within:ring-lavender">
      <span className="pl-3 text-sm text-ink-soft">R$</span>
      <input
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value.replace(/[^\d,.]/g, ""))}
        className="w-full bg-transparent px-2 py-2.5 text-sm outline-none"
      />
    </span>
  );
}

export default function PricesForm({ formats, extras }: { formats: Format[]; extras: Extra[] }) {
  const [f, setF] = useState<PricesInput["formats"]>(() =>
    formats.map((x) => ({ id: x.id, name: x.name, short: x.short, price: toStr(x.price), old_price: toStr(x.oldPrice), file: x.file, description: x.description, tag: x.tag, active: x.active, sort: x.sort })),
  );
  const [e, setE] = useState<PricesInput["extras"]>(() =>
    extras.map((x) => ({ id: x.id, name: x.name, description: x.description, price: toStr(x.price), active: x.active, sort: x.sort })),
  );
  const [result, setResult] = useState<ActionResult | null>(null);
  const [saving, start] = useTransition();

  const upF = (i: number, patch: Partial<PricesInput["formats"][number]>) => setF((prev) => prev.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const upE = (i: number, patch: Partial<PricesInput["extras"][number]>) => setE((prev) => prev.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    start(async () => {
      const res = await savePrices({ formats: f, extras: e.map((x, i) => ({ ...x, sort: i + 1 })) });
      setResult(res);
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Card title="Formatos do convite">
        <div className="space-y-4">
          {f.map((x, i) => {
            const Icon = formatIcon(x.id);
            return (
              <div key={x.id} className={`rounded-xl border border-line p-4 ${x.active ? "" : "bg-page opacity-75"}`}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 font-display font-bold">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-lavender text-lilac-dark">
                      <Icon className="h-4 w-4" />
                    </span>
                    {x.short || x.id}
                  </span>
                  <label className="flex items-center gap-2 text-sm font-bold text-ink-soft">
                    <input type="checkbox" checked={x.active} onChange={(ev) => upF(i, { active: ev.target.checked })} className="h-4 w-4 accent-[#8B7FD6]" />
                    Disponível
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  <Label text="Preço">
                    <MoneyInput value={x.price} onChange={(v) => upF(i, { price: v })} />
                  </Label>
                  <Label text="Preço “de” (riscado)" hint="Vazio = sem promoção">
                    <MoneyInput value={x.old_price} onChange={(v) => upF(i, { old_price: v })} placeholder="opcional" />
                  </Label>
                  <Label text="Nome curto">
                    <input value={x.short} onChange={(ev) => upF(i, { short: ev.target.value })} className={input} />
                  </Label>
                  <Label text="Selo">
                    <input value={x.tag} onChange={(ev) => upF(i, { tag: ev.target.value })} placeholder="Mais pedido" className={input} />
                  </Label>
                  <Label text="Arquivo entregue" className="sm:col-span-2">
                    <input value={x.file} onChange={(ev) => upF(i, { file: ev.target.value })} className={input} />
                  </Label>
                  <Label text="Descrição" className="sm:col-span-2">
                    <input value={x.description} onChange={(ev) => upF(i, { description: ev.target.value })} className={input} />
                  </Label>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Complementos">
        <div className="space-y-3">
          {e.map((x, i) => (
            <div key={x.id} className="grid items-end gap-3 rounded-xl border border-line p-4 sm:grid-cols-[1fr_140px_1.4fr_auto]">
              <Label text="Nome">
                <input value={x.name} onChange={(ev) => upE(i, { name: ev.target.value })} className={input} />
              </Label>
              <Label text="Preço">
                <MoneyInput value={x.price} onChange={(v) => upE(i, { price: v })} />
              </Label>
              <Label text="Descrição">
                <input value={x.description} onChange={(ev) => upE(i, { description: ev.target.value })} className={input} />
              </Label>
              <div className="flex items-center gap-3 pb-2">
                <label className="flex items-center gap-1.5 text-sm font-bold text-ink-soft">
                  <input type="checkbox" checked={x.active} onChange={(ev) => upE(i, { active: ev.target.checked })} className="h-4 w-4 accent-[#8B7FD6]" />
                  Ativo
                </label>
                <button type="button" onClick={() => setE((prev) => prev.filter((_, j) => j !== i))} className="text-sm font-bold text-[#B03A52] hover:underline">
                  Remover
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setE((prev) => [...prev, { id: `novo-${prev.length}-${Date.now()}`, isNew: true, name: "", description: "", price: "", active: true, sort: prev.length + 1 }])}
            className={btnGhost}
          >
            + Adicionar complemento
          </button>
        </div>
      </Card>

      <div className="sticky bottom-4 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-line bg-white/95 p-3 shadow-lg backdrop-blur">
        <div className="mr-auto">
          <Notice result={result} />
        </div>
        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving ? "Salvando..." : "Salvar preços"}
        </button>
      </div>
    </form>
  );
}
