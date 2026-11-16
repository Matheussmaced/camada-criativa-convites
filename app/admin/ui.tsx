// Peças visuais compartilhadas do painel (sem estado).

export const input =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-ink-soft/50 focus:border-lilac focus:ring-4 focus:ring-lavender disabled:bg-page";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-lilac px-5 py-2.5 text-sm font-bold text-white transition hover:bg-lilac-dark disabled:opacity-60";

export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink transition hover:border-lilac disabled:opacity-60";

export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#F0C4CD] bg-white px-4 py-2.5 text-sm font-bold text-[#B03A52] transition hover:bg-[#FDF1F3] disabled:opacity-60";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-line bg-white p-5 sm:p-6 ${className}`}>
      {title && <h2 className="mb-4 font-display text-lg font-bold">{title}</h2>}
      {children}
    </section>
  );
}

export function Label({ text, hint, children, className = "" }: { text: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-soft">{text}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-soft">{hint}</span>}
    </label>
  );
}

export function Notice({ result }: { result: { ok: boolean; message?: string; error?: string } | null }) {
  if (!result) return null;
  if (result.ok && !result.message) return null;
  return (
    <p
      role={result.ok ? "status" : "alert"}
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${result.ok ? "bg-mint text-[#24524C]" : "bg-[#F3D6DC] text-[#8A3346]"}`}
    >
      {result.ok ? result.message : result.error}
    </p>
  );
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
}

export function formatPartyDate(iso?: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}/${m}/${y}` : iso;
}
