"use client";

import { useState } from "react";
import type { Product } from "@/app/lib/types";
import InviteArt, { PhoneFrame, type InviteText } from "./InviteArt";

type View = { kind: "image"; src: string; label: string } | { kind: "front" | "phone" | "detail" | "palette"; label: string };

export default function ProductGallery({ p }: { p: Product }) {
  const views: View[] = [
    ...p.images.map((src, i) => ({ kind: "image" as const, src, label: `Foto ${i + 1}` })),
    { kind: "front", label: "Frente" },
    { kind: "phone", label: "No celular" },
    { kind: "detail", label: "Detalhe" },
    { kind: "palette", label: "Paleta" },
  ];
  const [index, setIndex] = useState(0);
  const view = views[Math.min(index, views.length - 1)];

  const text: InviteText = {
    eventLine: p.sample.eventLine,
    name: p.sample.name,
    age: p.sample.age?.toString(),
    date: "Sábado, 12 de dezembro",
    time: "às 15h",
    place: "Espaço Jardim Encantado",
  };

  function render(v: View, thumb = false) {
    switch (v.kind) {
      case "image":
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={v.src} alt={thumb ? "" : p.name} className={`w-full rounded-[2.5%] object-contain ${thumb ? "aspect-[2/3] object-cover" : "max-h-[640px] shadow-xl"}`} />
        );
      case "front":
        return <InviteArt motif={p.motif} palette={p.palette} text={text} className={thumb ? "" : "shadow-xl"} />;
      case "phone":
        return (
          <PhoneFrame screen={p.palette.soft}>
            <InviteArt motif={p.motif} palette={p.palette} text={text} className="rounded-none" />
          </PhoneFrame>
        );
      case "detail":
        return (
          <div className="aspect-[2/3] w-full overflow-hidden rounded-[2.5%]">
            <div className="origin-[50%_35%] scale-[1.9]">
              <InviteArt motif={p.motif} palette={p.palette} text={text} />
            </div>
          </div>
        );
      case "palette":
        return (
          <div className="@container flex aspect-[2/3] w-full flex-col overflow-hidden rounded-[2.5%] border border-line bg-white">
            {[p.palette.soft, p.palette.bg, p.palette.accent, p.palette.ink].map((c, i) => (
              <div key={i} className="flex flex-1 items-end p-[6cqw]" style={{ background: c }}>
                {!thumb && <span className="rounded-md bg-white/85 px-2 py-0.5 font-mono text-xs font-bold text-ink">{c.toUpperCase()}</span>}
              </div>
            ))}
          </div>
        );
    }
  }

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      <div className="no-scrollbar flex gap-3 overflow-x-auto sm:max-h-[640px] sm:w-20 sm:flex-col sm:overflow-y-auto" role="tablist" aria-label="Imagens do convite">
        {views.map((v, i) => (
          <button
            key={v.label}
            type="button"
            role="tab"
            aria-selected={index === i}
            aria-label={v.label}
            onMouseEnter={() => setIndex(i)}
            onClick={() => setIndex(i)}
            className={`w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white p-1 transition sm:w-20 ${
              index === i ? "border-lilac" : "border-line hover:border-lavender-deep"
            }`}
          >
            <div className="pointer-events-none">{render(v, true)}</div>
          </button>
        ))}
      </div>
      <div className="flex flex-1 items-center justify-center rounded-3xl p-6 sm:p-10" style={{ background: p.palette.soft }}>
        <div className={view.kind === "phone" ? "w-[62%] max-w-[300px]" : view.kind === "image" ? "w-full max-w-[440px]" : "w-[78%] max-w-[380px]"}>
          {render(view)}
        </div>
      </div>
    </div>
  );
}
