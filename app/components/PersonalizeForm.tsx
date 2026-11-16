"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createOrder } from "@/app/(site)/convite/[slug]/personalizar/actions";
import { EVENTS, brl, whatsappLink, type Extra, type Format, type Product } from "@/app/lib/types";
import InviteArt from "./InviteArt";
import { CheckIcon, PhotoIcon, WhatsappIcon, formatIcon } from "./Icons";

/* ---------- utilitários ---------- */

const eventLines: Record<string, string> = {
  "Aniversário": "Aniversário de",
  "Chá Revelação": "Chá revelação de",
  "Chá de Bebê": "Chá de bebê de",
  "Batizado": "Batizado de",
  "15 Anos": "Os 15 anos de",
  "Outro": "Celebração de",
};

const weekdays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const months = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

function weekday(y: number, m: number, d: number) {
  const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  if (m < 3) y -= 1;
  return (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + t[m - 1] + d) % 7;
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "";
  return `${weekdays[weekday(y, m, d)]}, ${d} de ${months[m - 1]}`;
}

function formatTime(t: string) {
  if (!t) return "";
  const [h, min] = t.split(":");
  return `às ${Number(h)}h${min !== "00" ? min : ""}`;
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/* ---------- tipos ---------- */

type Data = {
  formato: string;
  evento: string;
  nome: string;
  idade: string;
  data: string;
  horario: string;
  local: string;
  endereco: string;
  mensagem: string;
  assinatura: string;
  rsvp: string;
  lista: string;
  extras: string[];
  clienteNome: string;
  clienteWhats: string;
  clienteEmail: string;
  observacoes: string;
  aceite: boolean;
};

type Errors = Partial<Record<keyof Data, string>>;

function validate(d: Data): Errors {
  const e: Errors = {};
  if (!d.nome.trim()) e.nome = "Informe o nome do homenageado.";
  if (!d.data) e.data = "Escolha a data da festa.";
  if (!d.horario) e.horario = "Informe o horário.";
  if (!d.endereco.trim()) e.endereco = "Informe o endereço da festa.";
  if (!d.clienteNome.trim()) e.clienteNome = "Informe seu nome.";
  if (d.clienteWhats.replace(/\D/g, "").length < 10) e.clienteWhats = "Informe um WhatsApp válido com DDD.";
  if (d.clienteEmail && !/^\S+@\S+\.\S+$/.test(d.clienteEmail)) e.clienteEmail = "E-mail inválido.";
  if (!d.aceite) e.aceite = "Confirme que os dados estão corretos.";
  return e;
}

/* ---------- componentes de campo ---------- */

const inputCls = (err?: string) =>
  `w-full rounded-xl border bg-white px-4 py-3 outline-none transition placeholder:text-ink-soft/50 focus:border-lilac focus:ring-4 focus:ring-lavender ${
    err ? "border-[#E07A8B]" : "border-line"
  }`;

function Field({ label, hint, error, required, children, className = "" }: { label: string; hint?: string; error?: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-bold">
        {label} {required && <span className="text-lilac">*</span>}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs font-semibold text-[#C4566A]">{error}</span> : hint && <span className="mt-1 block text-xs text-ink-soft">{hint}</span>}
    </label>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-white p-6 sm:p-8">
      <h2 className="flex items-center gap-3 font-display text-xl font-bold">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-lavender text-sm text-lilac-dark">{n}</span>
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/* ---------- formulário ---------- */

export default function PersonalizeForm({ p, formats, extras, whatsapp }: { p: Product; formats: Format[]; extras: Extra[]; whatsapp: string }) {
  const getFormat = (id: string | null) => formats.find((f) => f.id === id) ?? formats[0];
  const params = useSearchParams();
  const [d, setD] = useState<Data>({
    formato: getFormat(params.get("formato")).id,
    evento: p.event,
    nome: "",
    idade: "",
    data: "",
    horario: "",
    local: "",
    endereco: "",
    mensagem: "",
    assinatura: "",
    rsvp: "",
    lista: "",
    extras: [],
    clienteNome: "",
    clienteWhats: "",
    clienteEmail: "",
    observacoes: "",
    aceite: false,
  });
  const [photo, setPhoto] = useState<{ name: string; url: string } | null>(null);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [orderCode, setOrderCode] = useState<number | null>(null);

  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo.url); }, [photo]);

  const set = <K extends keyof Data>(k: K, v: Data[K]) => setD((prev) => ({ ...prev, [k]: v }));
  const errors = tried ? validate(d) : {};
  const format = getFormat(d.formato);
  const chosenExtras = extras.filter((e) => d.extras.includes(e.id));
  const total = format.price + chosenExtras.reduce((s, e) => s + e.price, 0);
  const showAge = d.evento === "Aniversário" || d.evento === "15 Anos";

  const previewText = {
    eventLine: eventLines[d.evento] ?? "Celebração de",
    name: d.nome || p.sample.name,
    age: showAge ? d.idade || (d.nome ? "" : p.sample.age?.toString()) : undefined,
    date: d.data ? formatDate(d.data) : "Sábado, 12 de dezembro",
    time: d.horario ? formatTime(d.horario) : "às 15h",
    place: d.local || d.endereco || "Local da festa",
    message: d.mensagem,
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setTried(true);
    const errs = validate(d);
    const first = Object.keys(errs)[0];
    if (first) {
      document.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setSending(true);
    setSendError("");
    const res = await createOrder({
      product_slug: p.slug,
      format_id: d.formato,
      extras: d.extras,
      party: {
        evento: d.evento,
        nome: d.nome,
        idade: showAge ? d.idade : "",
        data: d.data,
        horario: d.horario,
        local: d.local,
        endereco: d.endereco,
        mensagem: d.mensagem,
        assinatura: d.assinatura,
        rsvp: d.rsvp,
        lista: d.lista,
      },
      customer_name: d.clienteNome,
      customer_whatsapp: d.clienteWhats,
      customer_email: d.clienteEmail,
      notes: d.observacoes,
      has_photo: Boolean(photo),
    }).catch(() => ({ ok: false as const, error: "Falha de conexão." }));
    setSending(false);
    if (!res.ok) {
      setSendError(`Não conseguimos registrar o pedido (${res.error}). Tente de novo ou fale com a gente pelo WhatsApp.`);
      return;
    }
    setOrderCode(res.code);
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const message = [
    orderCode ? `Olá! Acabei de fazer o pedido *#${orderCode}* pelo site:` : `Olá! Quero fazer meu pedido pelo site:`,
    ``,
    `*${p.name}*`,
    `Formato: ${format.short} (${brl(format.price)})`,
    ...chosenExtras.map((e) => `+ ${e.name} (${brl(e.price)})`),
    `*Total: ${brl(total)}*`,
    ``,
    `*Dados da festa*`,
    `Evento: ${d.evento}`,
    `Homenageado: ${d.nome}`,
    showAge && d.idade ? `Idade: ${d.idade}` : "",
    `Data: ${d.data ? formatDate(d.data) : ""} ${formatTime(d.horario)}`,
    d.local ? `Local: ${d.local}` : "",
    `Endereço: ${d.endereco}`,
    d.mensagem ? `Mensagem: ${d.mensagem}` : "",
    d.assinatura ? `Assinatura: ${d.assinatura}` : "",
    d.rsvp ? `Confirmação de presença: ${d.rsvp}` : "",
    d.lista ? `Lista de presentes: ${d.lista}` : "",
    photo ? `Foto: vou enviar nesta conversa` : "",
    ``,
    `*Meus dados*`,
    `Nome: ${d.clienteNome}`,
    `WhatsApp: ${d.clienteWhats}`,
    d.clienteEmail ? `E-mail: ${d.clienteEmail}` : "",
    d.observacoes ? `\nObservações: ${d.observacoes}` : "",
  ]
    .filter((l, i, arr) => l !== "" || arr[i - 1] !== "")
    .join("\n");

  /* ---------- tela de confirmação ---------- */
  if (done) {
    return (
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 lg:grid-cols-[1fr_300px]">
        <div className="rounded-3xl border border-line bg-white p-8">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-mint text-mint-deep">
            <CheckIcon className="h-7 w-7" />
          </span>
          <p className="mt-5 text-sm font-extrabold uppercase tracking-wider text-lilac">Pedido #{orderCode}</p>
          <h1 className="mt-1 font-display text-3xl font-bold">Pedido registrado, {d.clienteNome.split(" ")[0]}!</h1>
          <p className="mt-2 text-ink-soft">
            Agora é só enviar a mensagem pelo WhatsApp para darmos andamento. Respondemos com a forma de pagamento e, em seguida, com a prévia do convite.
          </p>

          <dl className="mt-8 divide-y divide-line rounded-2xl border border-line text-sm">
            {[
              ["Convite", `${p.name} · ${format.short}`],
              ["Homenageado", `${d.nome}${showAge && d.idade ? `, ${d.idade} anos` : ""}`],
              ["Quando", `${formatDate(d.data)} ${formatTime(d.horario)}`],
              ["Onde", [d.local, d.endereco].filter(Boolean).join(" · ")],
              ["Complementos", chosenExtras.map((e) => e.name).join(", ") || "Nenhum"],
              ["Contato", `${d.clienteWhats}${d.clienteEmail ? ` · ${d.clienteEmail}` : ""}`],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[120px_1fr] gap-3 px-4 py-3">
                <dt className="font-bold">{k}</dt>
                <dd className="text-ink-soft">{v}</dd>
              </div>
            ))}
            <div className="grid grid-cols-[120px_1fr] gap-3 bg-lavender/50 px-4 py-3">
              <dt className="font-bold">Total</dt>
              <dd className="font-display text-lg font-bold">{brl(total)}</dd>
            </div>
          </dl>

          {photo && (
            <p className="mt-4 rounded-xl bg-peach/60 px-4 py-3 text-sm">
              Não esqueça de enviar a foto <strong>{photo.name}</strong> na conversa do WhatsApp.
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={whatsappLink(whatsapp, message)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-4 font-bold text-white transition hover:brightness-95"
            >
              <WhatsappIcon className="h-5 w-5" /> Enviar pedido pelo WhatsApp
            </a>
            <Link href="/convites" className="rounded-full border-2 border-line px-7 py-4 font-bold transition hover:border-lilac">
              Ver outros convites
            </Link>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[300px]">
          <InviteArt motif={p.motif} palette={p.palette} text={previewText} className="shadow-xl" />
        </div>
      </div>
    );
  }

  /* ---------- formulário ---------- */
  return (
    <form id="personalizar" onSubmit={submit} noValidate className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
      <div className="min-w-0 space-y-6">
        <Section n={1} title="Formato do convite">
          <div className="grid gap-3 sm:grid-cols-3">
            {formats.map((f) => {
              const Icon = formatIcon(f.id);
              const active = d.formato === f.id;
              return (
                <label key={f.id} className={`cursor-pointer rounded-2xl border-2 p-4 transition ${active ? "border-lilac bg-lavender/50" : "border-line hover:border-lavender-deep"}`}>
                  <input type="radio" name="formato" className="sr-only" checked={active} onChange={() => set("formato", f.id)} />
                  <span className="flex items-center justify-between">
                    <Icon className={`h-5 w-5 ${active ? "text-lilac-dark" : "text-ink-soft"}`} />
                    <span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${active ? "border-lilac bg-lilac text-white" : "border-line"}`}>
                      {active && <CheckIcon className="h-3 w-3" />}
                    </span>
                  </span>
                  <span className="mt-3 block font-display font-bold">{f.short}</span>
                  <span className="block text-xs text-ink-soft">{f.file}</span>
                  <span className="mt-2 block font-bold">{brl(f.price)}</span>
                </label>
              );
            })}
          </div>
        </Section>

        <Section n={2} title="Sobre a festa">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Tipo de evento" required>
              <select name="evento" value={d.evento} onChange={(e) => set("evento", e.target.value)} className={inputCls()}>
                {EVENTS.map((ev) => (
                  <option key={ev}>{ev}</option>
                ))}
              </select>
            </Field>
            <Field label="Nome do homenageado" required error={errors.nome} hint="Como deve aparecer no convite">
              <input name="nome" value={d.nome} onChange={(e) => set("nome", e.target.value)} maxLength={30} placeholder="Ex.: Theo" className={inputCls(errors.nome)} />
            </Field>
            {showAge && (
              <Field label="Idade que vai completar">
                <input name="idade" type="number" min={0} max={120} inputMode="numeric" value={d.idade} onChange={(e) => set("idade", e.target.value)} placeholder="Ex.: 4" className={inputCls()} />
              </Field>
            )}
            <Field label="Data" required error={errors.data}>
              <input name="data" type="date" value={d.data} onChange={(e) => set("data", e.target.value)} className={inputCls(errors.data)} />
            </Field>
            <Field label="Horário" required error={errors.horario}>
              <input name="horario" type="time" value={d.horario} onChange={(e) => set("horario", e.target.value)} className={inputCls(errors.horario)} />
            </Field>
          </div>
        </Section>

        <Section n={3} title="Local">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nome do local" hint="Buffet, salão, condomínio...">
              <input name="local" value={d.local} onChange={(e) => set("local", e.target.value)} maxLength={40} placeholder="Ex.: Buffet Lua Cheia" className={inputCls()} />
            </Field>
            <Field label="Endereço completo" required error={errors.endereco}>
              <input name="endereco" value={d.endereco} onChange={(e) => set("endereco", e.target.value)} placeholder="Rua, número, bairro, cidade" className={inputCls(errors.endereco)} />
            </Field>
          </div>
        </Section>

        <Section n={4} title="Detalhes do convite">
          <div className="grid gap-5">
            <Field label="Mensagem ou frase" hint={`${d.mensagem.length}/90 caracteres`}>
              <textarea name="mensagem" rows={2} maxLength={90} value={d.mensagem} onChange={(e) => set("mensagem", e.target.value)} placeholder="Ex.: Venha brincar comigo!" className={inputCls()} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Assinatura" hint="Quem está convidando">
                <input name="assinatura" value={d.assinatura} onChange={(e) => set("assinatura", e.target.value)} placeholder="Ex.: Papai e mamãe" className={inputCls()} />
              </Field>
              <Field label="WhatsApp para confirmar presença" hint={d.formato === "interativo" ? "Vira um botão no convite" : "Aparece no rodapé do convite"}>
                <input name="rsvp" inputMode="tel" value={d.rsvp} onChange={(e) => set("rsvp", maskPhone(e.target.value))} placeholder="(00) 00000-0000" className={inputCls()} />
              </Field>
            </div>
            {d.formato === "interativo" && (
              <Field label="Link da lista de presentes" hint="Opcional. Vira um botão clicável no PDF">
                <input name="lista" type="url" value={d.lista} onChange={(e) => set("lista", e.target.value)} placeholder="https://" className={inputCls()} />
              </Field>
            )}
            {d.formato === "video" && (
              <div>
                <span className="mb-1.5 block text-sm font-bold">Foto do homenageado</span>
                <label className="flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-lavender-deep bg-page p-4 transition hover:border-lilac">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo.url} alt="" className="h-16 w-16 rounded-xl object-cover" />
                  ) : (
                    <span className="grid h-16 w-16 place-items-center rounded-xl bg-lavender text-lilac">
                      <PhotoIcon className="h-6 w-6" />
                    </span>
                  )}
                  <span className="text-sm">
                    <span className="block font-bold">{photo ? photo.name : "Escolher foto (opcional)"}</span>
                    <span className="text-ink-soft">JPG ou PNG. Você envia a foto pelo WhatsApp ao finalizar.</span>
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setPhoto({ name: file.name, url: URL.createObjectURL(file) });
                    }}
                  />
                </label>
              </div>
            )}
          </div>
        </Section>

        <Section n={5} title="Complementos no mesmo tema">
          <div className="grid gap-3 sm:grid-cols-3">
            {extras.map((x) => {
              const on = d.extras.includes(x.id);
              return (
                <label key={x.id} className={`cursor-pointer rounded-2xl border-2 p-4 transition ${on ? "border-lilac bg-lavender/50" : "border-line hover:border-lavender-deep"}`}>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={on}
                    onChange={() => set("extras", on ? d.extras.filter((i) => i !== x.id) : [...d.extras, x.id])}
                  />
                  <span className="flex items-start justify-between gap-2">
                    <span className="font-display font-bold">{x.name}</span>
                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 ${on ? "border-lilac bg-lilac text-white" : "border-line"}`}>
                      {on && <CheckIcon className="h-3 w-3" />}
                    </span>
                  </span>
                  <span className="mt-1 block text-xs text-ink-soft">{x.description}</span>
                  <span className="mt-2 block text-sm font-bold">+ {brl(x.price)}</span>
                </label>
              );
            })}
          </div>
        </Section>

        <Section n={6} title="Seus dados">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Seu nome" required error={errors.clienteNome}>
              <input name="clienteNome" autoComplete="name" value={d.clienteNome} onChange={(e) => set("clienteNome", e.target.value)} className={inputCls(errors.clienteNome)} />
            </Field>
            <Field label="Seu WhatsApp" required error={errors.clienteWhats} hint="Enviaremos a prévia por aqui">
              <input name="clienteWhats" autoComplete="tel" inputMode="tel" value={d.clienteWhats} onChange={(e) => set("clienteWhats", maskPhone(e.target.value))} placeholder="(00) 00000-0000" className={inputCls(errors.clienteWhats)} />
            </Field>
            <Field label="E-mail" error={errors.clienteEmail} className="sm:col-span-2">
              <input name="clienteEmail" type="email" autoComplete="email" value={d.clienteEmail} onChange={(e) => set("clienteEmail", e.target.value)} placeholder="opcional" className={inputCls(errors.clienteEmail)} />
            </Field>
            <Field label="Observações" className="sm:col-span-2" hint="Troca de cores, música, dois homenageados...">
              <textarea name="observacoes" rows={3} value={d.observacoes} onChange={(e) => set("observacoes", e.target.value)} className={inputCls()} />
            </Field>
          </div>
          <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm">
            <input name="aceite" type="checkbox" checked={d.aceite} onChange={(e) => set("aceite", e.target.checked)} className="mt-0.5 h-5 w-5 accent-[#8B7FD6]" />
            <span>
              Conferi os dados acima. Entendo que o convite será produzido com essas informações e que posso pedir ajustes na prévia.
              {errors.aceite && <span className="mt-1 block text-xs font-semibold text-[#C4566A]">{errors.aceite}</span>}
            </span>
          </label>
        </Section>

        {sendError && <p role="alert" className="rounded-xl bg-[#F3D6DC] px-4 py-3 text-sm font-semibold text-[#8A3346] lg:hidden">{sendError}</p>}
        <button type="submit" disabled={sending} className="disabled:opacity-60 w-full rounded-full bg-lilac py-4 font-bold text-white shadow-lg shadow-lilac/30 transition hover:bg-lilac-dark lg:hidden">
          {sending ? "Enviando..." : `Finalizar pedido · ${brl(total)}`}
        </button>
      </div>

      {/* Prévia + resumo */}
      <aside className="min-w-0 order-first lg:order-none lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-line bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold uppercase tracking-wider text-lilac">Prévia ao vivo</span>
            <Link href={`/convite/${p.slug}`} className="text-xs font-bold text-ink-soft hover:text-lilac">Trocar modelo</Link>
          </div>
          <div className="mx-auto mt-4 w-[60%] max-w-[240px] lg:w-[78%]">
            <InviteArt motif={p.motif} palette={p.palette} text={previewText} className="shadow-lg" />
          </div>
          <p className="mt-3 text-center text-xs text-ink-soft">Ilustração da arte. A versão final é ajustada pela nossa equipe.</p>

          <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt>{format.short}</dt>
              <dd>{brl(format.price)}</dd>
            </div>
            {chosenExtras.map((e) => (
              <div key={e.id} className="flex justify-between text-ink-soft">
                <dt>{e.name}</dt>
                <dd>{brl(e.price)}</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <dt className="font-bold">Total</dt>
              <dd className="font-display text-2xl font-bold">{brl(total)}</dd>
            </div>
          </dl>
          {sendError && <p role="alert" className="mt-4 hidden rounded-xl bg-[#F3D6DC] px-4 py-3 text-sm font-semibold text-[#8A3346] lg:block">{sendError}</p>}
          <button type="submit" disabled={sending} className="disabled:opacity-60 mt-4 hidden w-full rounded-full bg-lilac py-4 font-bold text-white shadow-lg shadow-lilac/30 transition hover:bg-lilac-dark lg:block">
            {sending ? "Enviando..." : "Finalizar pedido"}
          </button>
        </div>
      </aside>
    </form>
  );
}
