"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import InviteArt from "@/app/components/InviteArt";
import { browserClient } from "@/app/lib/supabase/browser";
import { EVENTS, MOTIFS, MOTIF_LABELS, slugify, type Motif, type Palette, type Product } from "@/app/lib/types";
import { deleteProduct, saveProduct, type ActionResult, type ProductInput } from "../../actions";
import { Card, Label, Notice, btnDanger, btnGhost, btnPrimary, input } from "../../ui";

const PRESETS: { name: string; palette: Palette }[] = [
  { name: "Lilás", palette: { bg: "#E6E4FB", soft: "#F5F4FF", accent: "#8B7FD6", ink: "#3D3654" } },
  { name: "Azul-bebê", palette: { bg: "#DCEEFB", soft: "#F2F9FF", accent: "#6FA8D8", ink: "#33465C" } },
  { name: "Pêssego", palette: { bg: "#FFE4DA", soft: "#FFF5F0", accent: "#E8917A", ink: "#5A3B36" } },
  { name: "Mel", palette: { bg: "#FFF1D6", soft: "#FFFAEF", accent: "#E9A84F", ink: "#5B4630" } },
  { name: "Verde-água", palette: { bg: "#D7F1EE", soft: "#F0FBF9", accent: "#4FB3A6", ink: "#24524C" } },
  { name: "Rosa", palette: { bg: "#FBEFF7", soft: "#FFF8FC", accent: "#C98BB9", ink: "#4E3550" } },
  { name: "Cinza-azulado", palette: { bg: "#EEF1F6", soft: "#F9FAFC", accent: "#8FA6C8", ink: "#36425A" } },
];

const COLOR_LABELS: Record<keyof Palette, string> = { soft: "Fundo claro", bg: "Fundo", accent: "Destaque", ink: "Texto" };

type State = Omit<ProductInput, "rating" | "reviews" | "sold" | "sort" | "motif"> & {
  motif: Motif;
  rating: string;
  reviews: string;
  sold: string;
  sort: string;
};

function fromProduct(p?: Product): State {
  return {
    id: p?.id,
    slug: p?.slug ?? "",
    name: p?.name ?? "",
    theme: p?.theme ?? "",
    event: p?.event ?? "Aniversário",
    motif: p?.motif ?? "stars",
    palette: p?.palette ?? PRESETS[0].palette,
    badge: p?.badge ?? "",
    rating: String(p?.rating ?? 5),
    reviews: String(p?.reviews ?? 0),
    sold: String(p?.sold ?? 0),
    sample_name: p?.sample.name ?? "",
    sample_age: p?.sample.age?.toString() ?? "",
    sample_event_line: p?.sample.eventLine ?? "Aniversário de",
    description: p?.description ?? "",
    images: p?.images ?? [],
    active: p?.active ?? true,
    sort: String(p?.sort ?? 0),
  };
}

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [s, setS] = useState<State>(() => fromProduct(product));
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [result, setResult] = useState<ActionResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, startSave] = useTransition();
  const [deleting, startDelete] = useTransition();

  const set = <K extends keyof State>(k: K, v: State[K]) => setS((prev) => ({ ...prev, [k]: v }));

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setResult(null);
    const supabase = browserClient();
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 8 * 1024 * 1024) {
        setResult({ ok: false, error: `${file.name} passa de 8 MB.` });
        continue;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `products/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { cacheControl: "31536000", contentType: file.type });
      if (error) {
        setResult({ ok: false, error: `Falha ao enviar ${file.name}: ${error.message}` });
        continue;
      }
      urls.push(supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl);
    }
    setS((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    setUploading(false);
  }

  function moveImage(i: number, dir: -1 | 1) {
    const next = [...s.images];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    set("images", next);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startSave(async () => {
      const res = await saveProduct({
        ...s,
        rating: Number(s.rating.replace(",", ".")),
        reviews: Number(s.reviews),
        sold: Number(s.sold),
        sort: Number(s.sort),
      });
      setResult(res);
      if (res.ok && !product && res.id) router.replace(`/admin/produtos/${res.id}`);
      else if (res.ok) router.refresh();
    });
  }

  const previewText = {
    eventLine: s.sample_event_line || "Aniversário de",
    name: s.sample_name || "Nome",
    age: s.sample_age || undefined,
    date: "Sábado, 12 de dezembro",
    time: "às 15h",
    place: "Local da festa",
  };

  return (
    <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_300px]">
      <div className="min-w-0 space-y-5">
        <Card title="Informações">
          <div className="grid gap-4 sm:grid-cols-2">
            <Label text="Nome do produto" className="sm:col-span-2">
              <input
                required
                value={s.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setS((prev) => ({ ...prev, name, slug: slugTouched ? prev.slug : slugify(name.replace(/^convite\s+/i, "")) }));
                }}
                placeholder="Ex.: Convite Safari Baby"
                className={input}
              />
            </Label>
            <Label text="Endereço no site" hint={`camadacriativa.com.br/convite/${s.slug || "..."}`}>
              <input
                required
                value={s.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value));
                }}
                className={input}
              />
            </Label>
            <Label text="Tema">
              <input value={s.theme} onChange={(e) => set("theme", e.target.value)} placeholder="Ex.: Safari" className={input} />
            </Label>
            <Label text="Evento">
              <select value={s.event} onChange={(e) => set("event", e.target.value)} className={input}>
                {(EVENTS.includes(s.event) ? EVENTS : [s.event, ...EVENTS]).map((ev) => (
                  <option key={ev}>{ev}</option>
                ))}
              </select>
            </Label>
            <Label text="Selo">
              <select value={s.badge} onChange={(e) => set("badge", e.target.value)} className={input}>
                <option value="">Nenhum</option>
                <option>Novo</option>
                <option>Destaque</option>
              </select>
            </Label>
            <Label text="Descrição" className="sm:col-span-2">
              <textarea rows={4} value={s.description} onChange={(e) => set("description", e.target.value)} className={input} />
            </Label>
          </div>
        </Card>

        <Card title="Imagens do convite">
          <p className="-mt-2 mb-4 text-sm text-ink-soft">
            Envie as artes reais (JPG, PNG ou WEBP, até 8 MB). A primeira imagem vira a capa. Sem imagens, o site mostra a ilustração gerada abaixo.
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {s.images.map((url, i) => (
              <div key={url} className="group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="aspect-[2/3] w-full rounded-lg border border-line object-cover" />
                {i === 0 && <span className="absolute left-1 top-1 rounded bg-lilac px-1.5 py-0.5 text-[10px] font-bold text-white">Capa</span>}
                <div className="absolute inset-x-1 bottom-1 flex justify-between gap-1">
                  <button type="button" onClick={() => moveImage(i, -1)} className="rounded bg-white/90 px-1.5 text-xs font-bold shadow" aria-label="Mover para a esquerda">‹</button>
                  <button type="button" onClick={() => set("images", s.images.filter((u) => u !== url))} className="rounded bg-white/90 px-1.5 text-xs font-bold text-[#B03A52] shadow">
                    Remover
                  </button>
                  <button type="button" onClick={() => moveImage(i, 1)} className="rounded bg-white/90 px-1.5 text-xs font-bold shadow" aria-label="Mover para a direita">›</button>
                </div>
              </div>
            ))}
            <label className="grid aspect-[2/3] cursor-pointer place-items-center rounded-lg border-2 border-dashed border-lavender-deep bg-page text-center text-xs font-bold text-lilac transition hover:border-lilac">
              {uploading ? "Enviando..." : "+ Adicionar"}
              <input type="file" accept="image/*" multiple className="sr-only" disabled={uploading} onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
            </label>
          </div>
        </Card>

        <Card title="Ilustração e cores">
          <Label text="Ilustração">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {MOTIFS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => set("motif", m)}
                  className={`rounded-xl border-2 px-3 py-2 text-sm font-bold transition ${s.motif === m ? "border-lilac bg-lavender/60 text-lilac-dark" : "border-line text-ink-soft hover:border-lavender-deep"}`}
                >
                  {MOTIF_LABELS[m]}
                </button>
              ))}
            </div>
          </Label>
          <div className="mt-5">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-soft">Paletas prontas</span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((pr) => (
                <button key={pr.name} type="button" onClick={() => set("palette", pr.palette)} className="flex items-center gap-2 rounded-lg border border-line px-2.5 py-1.5 text-xs font-bold hover:border-lilac">
                  <span className="flex">
                    {[pr.palette.bg, pr.palette.accent, pr.palette.ink].map((c) => (
                      <span key={c} className="-ml-1 h-4 w-4 rounded-full border-2 border-white first:ml-0" style={{ background: c }} />
                    ))}
                  </span>
                  {pr.name}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(Object.keys(COLOR_LABELS) as (keyof Palette)[]).map((k) => (
              <Label key={k} text={COLOR_LABELS[k]}>
                <span className="flex items-center gap-2 rounded-xl border border-line bg-white p-1.5">
                  <input type="color" value={s.palette[k]} onChange={(e) => set("palette", { ...s.palette, [k]: e.target.value.toUpperCase() })} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent" />
                  <span className="font-mono text-xs">{s.palette[k].toUpperCase()}</span>
                </span>
              </Label>
            ))}
          </div>
        </Card>

        <Card title="Texto de exemplo da prévia">
          <div className="grid gap-4 sm:grid-cols-3">
            <Label text="Linha do evento">
              <input value={s.sample_event_line} onChange={(e) => set("sample_event_line", e.target.value)} placeholder="Aniversário de" className={input} />
            </Label>
            <Label text="Nome">
              <input value={s.sample_name} onChange={(e) => set("sample_name", e.target.value)} placeholder="Theo" className={input} />
            </Label>
            <Label text="Idade" hint="Deixe vazio para não mostrar">
              <input type="number" min={0} value={s.sample_age} onChange={(e) => set("sample_age", e.target.value)} className={input} />
            </Label>
          </div>
        </Card>

        <Card title="Vitrine">
          <div className="grid gap-4 sm:grid-cols-4">
            <Label text="Nota (0 a 5)">
              <input inputMode="decimal" value={s.rating} onChange={(e) => set("rating", e.target.value)} className={input} />
            </Label>
            <Label text="Nº de avaliações">
              <input type="number" min={0} value={s.reviews} onChange={(e) => set("reviews", e.target.value)} className={input} />
            </Label>
            <Label text="Vendidos">
              <input type="number" min={0} value={s.sold} onChange={(e) => set("sold", e.target.value)} className={input} />
            </Label>
            <Label text="Ordem" hint="Menor aparece primeiro">
              <input type="number" value={s.sort} onChange={(e) => set("sort", e.target.value)} className={input} />
            </Label>
          </div>
        </Card>
      </div>

      <aside className="min-w-0 space-y-4 lg:sticky lg:top-6 lg:self-start">
        <Card>
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-soft">Prévia</p>
          <div className="mx-auto w-[70%] lg:w-full">
            {s.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.images[0]} alt="" className="aspect-[2/3] w-full rounded-lg object-cover shadow-lg" />
            ) : (
              <InviteArt motif={s.motif} palette={s.palette} text={previewText} className="shadow-lg" />
            )}
          </div>
          <label className="mt-5 flex cursor-pointer items-center justify-between rounded-xl bg-page px-3 py-2.5 text-sm font-bold">
            Visível no site
            <input type="checkbox" checked={s.active} onChange={(e) => set("active", e.target.checked)} className="h-5 w-5 accent-[#8B7FD6]" />
          </label>
          <div className="mt-4 space-y-3">
            <Notice result={result} />
            <button type="submit" disabled={saving || uploading} className={`${btnPrimary} w-full py-3`}>
              {saving ? "Salvando..." : product ? "Salvar alterações" : "Criar produto"}
            </button>
            {product && (
              <a href={`/convite/${product.slug}`} target="_blank" className={`${btnGhost} w-full`}>
                Ver no site
              </a>
            )}
          </div>
        </Card>
        {product && (
          <button
            type="button"
            disabled={deleting}
            onClick={() => {
              if (!confirm(`Excluir "${product.name}"? As imagens também serão apagadas.`)) return;
              startDelete(async () => {
                const res = await deleteProduct(product.id);
                if (res.ok) router.replace("/admin/produtos");
                else setResult(res);
              });
            }}
            className={`${btnDanger} w-full`}
          >
            {deleting ? "Excluindo..." : "Excluir produto"}
          </button>
        )}
      </aside>
    </form>
  );
}
