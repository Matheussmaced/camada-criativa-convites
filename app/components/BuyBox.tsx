"use client";

import Link from "next/link";
import { useState } from "react";
import { brl, whatsappLink, type Format, type Product } from "@/app/lib/types";
import { CardIcon, ClockIcon, EyeIcon, ShieldIcon, Stars, WhatsappIcon, formatIcon } from "./Icons";

export default function BuyBox({ p, formats, whatsapp, deliveryDays }: { p: Product; formats: Format[]; whatsapp: string; deliveryDays: number }) {
  const [formatId, setFormatId] = useState(formats[0]?.id ?? "");
  const f = formats.find((x) => x.id === formatId) ?? formats[0];
  if (!f) return null;
  const discount = f.oldPrice ? Math.round((1 - f.price / f.oldPrice) * 100) : 0;

  return (
    <div className="rounded-3xl border border-line bg-white p-6">
      <p className="text-sm text-ink-soft">
        {p.badge === "Novo" ? "Novo lançamento" : `+${p.sold} vendidos`} · {p.event}
      </p>
      <h1 className="mt-1 font-display text-2xl font-bold leading-tight sm:text-3xl">{p.name}</h1>
      <a href="#avaliacoes" className="mt-2 flex items-center gap-2 text-sm text-ink-soft hover:text-lilac">
        <span className="font-bold text-ink">{p.rating.toLocaleString("pt-BR")}</span>
        <Stars rating={p.rating} />
        <span>({p.reviews} avaliações)</span>
      </a>

      <div className="mt-5">
        {f.oldPrice && <span className="block text-sm text-ink-soft line-through">{brl(f.oldPrice)}</span>}
        <div className="flex items-baseline gap-3">
          <span className="font-display text-4xl font-bold">{brl(f.price)}</span>
          {discount > 0 && <span className="font-bold text-mint-deep">{discount}% OFF</span>}
        </div>
        <p className="mt-1 text-sm">
          em até <span className="font-bold text-mint-deep">3x de {brl(f.price / 3)} sem juros</span>
        </p>
        <p className="text-sm text-ink-soft">ou {brl(f.price * 0.95)} no Pix (5% off)</p>
      </div>

      <fieldset className="mt-6">
        <legend className="mb-2 text-sm font-bold">
          Formato: <span className="font-semibold text-ink-soft">{f.short}</span>
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {formats.map((x) => {
            const Icon = formatIcon(x.id);
            const active = x.id === formatId;
            return (
              <label
                key={x.id}
                className={`flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 px-2 py-3 text-center transition ${
                  active ? "border-lilac bg-lavender/60" : "border-line hover:border-lavender-deep"
                }`}
              >
                <input type="radio" name="formato" value={x.id} checked={active} onChange={() => setFormatId(x.id)} className="sr-only" />
                <Icon className={`h-5 w-5 ${active ? "text-lilac-dark" : "text-ink-soft"}`} />
                <span className="text-xs font-bold">{x.short}</span>
                <span className="text-xs text-ink-soft">{brl(x.price)}</span>
              </label>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-ink-soft">{f.file}. {f.description}</p>
      </fieldset>

      <div className="mt-6 space-y-3 rounded-2xl bg-page p-4 text-sm">
        <p className="flex gap-3">
          <ClockIcon className="h-5 w-5 shrink-0 text-mint-deep" />
          <span>
            <strong className="text-mint-deep">Entrega digital em até {deliveryDays} dias úteis</strong>
            <span className="block text-ink-soft">Direto no seu WhatsApp e e-mail</span>
          </span>
        </p>
        <p className="flex gap-3">
          <EyeIcon className="h-5 w-5 shrink-0 text-lilac" />
          <span>
            <strong>Prévia antes da versão final</strong>
            <span className="block text-ink-soft">Ajustes de texto e cores sem custo</span>
          </span>
        </p>
        <p className="flex gap-3">
          <CardIcon className="h-5 w-5 shrink-0 text-baby-deep" />
          <span>
            <strong>Pix ou cartão</strong>
            <span className="block text-ink-soft">Pagamento após conferência dos dados</span>
          </span>
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <Link
          href={`/convite/${p.slug}/personalizar?formato=${f.id}`}
          className="block rounded-full bg-lilac py-4 text-center font-bold text-white shadow-lg shadow-lilac/30 transition hover:bg-lilac-dark"
        >
          Personalizar convite
        </Link>
        <a
          href={whatsappLink(whatsapp, `Oi! Tenho uma dúvida sobre o ${p.name} (${f.short}).`)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-full bg-lavender py-4 font-bold text-lilac-dark transition hover:bg-lavender-deep"
        >
          <WhatsappIcon className="h-5 w-5" /> Tirar dúvida no WhatsApp
        </a>
      </div>

      <p className="mt-5 flex items-start gap-2 text-xs text-ink-soft">
        <ShieldIcon className="h-4 w-4 shrink-0" />
        Compra segura. Se o convite não ficar como combinado, refazemos sem custo.
      </p>
    </div>
  );
}
