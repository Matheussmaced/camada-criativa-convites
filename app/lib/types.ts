export type FormatId = string;

export type Format = {
  id: FormatId;
  name: string;
  short: string;
  price: number;
  oldPrice: number | null;
  file: string;
  description: string;
  tag: string;
  active: boolean;
  sort: number;
};

export type Extra = {
  id: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
  sort: number;
};

export const MOTIFS = ["stars", "clouds", "balloons", "flowers", "waves", "rainbow", "hearts", "confetti"] as const;
export type Motif = (typeof MOTIFS)[number];

export const MOTIF_LABELS: Record<Motif, string> = {
  stars: "Estrelas e lua",
  clouds: "Nuvens",
  balloons: "Balões",
  flowers: "Flores",
  waves: "Ondas do mar",
  rainbow: "Arco-íris",
  hearts: "Corações",
  confetti: "Confetes",
};

export type Palette = { bg: string; soft: string; accent: string; ink: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  theme: string;
  event: string;
  motif: Motif;
  palette: Palette;
  badge: "Novo" | "Destaque" | null;
  rating: number;
  reviews: number;
  sold: number;
  sample: { name: string; age: number | null; eventLine: string };
  description: string;
  images: string[];
  active: boolean;
  sort: number;
};

export type Settings = {
  whatsapp: string;
  instagram: string;
  email: string;
  hours: string;
  deliveryDays: number;
};

export const EVENTS = ["Aniversário", "Chá Revelação", "Chá de Bebê", "Batizado", "15 Anos", "Casamento", "Outro"];

export const ORDER_STATUS = {
  novo: { label: "Novo", tone: "bg-lilac text-white" },
  em_producao: { label: "Em produção", tone: "bg-[#FFE9A8] text-[#6B5414]" },
  previa_enviada: { label: "Prévia enviada", tone: "bg-baby text-[#2E5F8A]" },
  aprovado: { label: "Aprovado", tone: "bg-mint text-[#24524C]" },
  entregue: { label: "Entregue", tone: "bg-mint-deep text-white" },
  cancelado: { label: "Cancelado", tone: "bg-[#F3D6DC] text-[#8A3346]" },
} as const;
export type OrderStatus = keyof typeof ORDER_STATUS;

export type Party = {
  evento?: string;
  nome?: string;
  idade?: string;
  data?: string;
  horario?: string;
  local?: string;
  endereco?: string;
  mensagem?: string;
  assinatura?: string;
  rsvp?: string;
  lista?: string;
};

export type Order = {
  id: string;
  code: number;
  created_at: string;
  status: OrderStatus;
  product_id: string | null;
  product_name: string;
  format_id: string;
  format_name: string;
  format_price: number;
  extras: { id: string; name: string; price: number }[];
  total: number;
  party: Party;
  customer_name: string;
  customer_whatsapp: string;
  customer_email: string | null;
  notes: string | null;
  has_photo: boolean;
  admin_notes: string | null;
};

/* ---------- utilitários ---------- */

export function brl(value: number) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function whatsappLink(number: string, message: string) {
  return `https://api.whatsapp.com/send?phone=${number.replace(/\D/g, "")}&text=${encodeURIComponent(message)}`;
}

export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapProduct(r: any): Product {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    theme: r.theme,
    event: r.event,
    motif: (MOTIFS as readonly string[]).includes(r.motif) ? r.motif : "stars",
    palette: r.palette,
    badge: r.badge,
    rating: Number(r.rating),
    reviews: r.reviews,
    sold: r.sold,
    sample: { name: r.sample_name, age: r.sample_age, eventLine: r.sample_event_line },
    description: r.description,
    images: r.images ?? [],
    active: r.active,
    sort: r.sort,
  };
}

export function mapFormat(r: any): Format {
  return {
    id: r.id,
    name: r.name,
    short: r.short,
    price: Number(r.price),
    oldPrice: r.old_price === null ? null : Number(r.old_price),
    file: r.file,
    description: r.description,
    tag: r.tag,
    active: r.active,
    sort: r.sort,
  };
}

export function mapExtra(r: any): Extra {
  return { id: r.id, name: r.name, description: r.description, price: Number(r.price), active: r.active, sort: r.sort };
}

export function mapSettings(r: any): Settings {
  return {
    whatsapp: r?.whatsapp ?? "",
    instagram: r?.instagram ?? "",
    email: r?.email ?? "",
    hours: r?.hours ?? "",
    deliveryDays: r?.delivery_days ?? 3,
  };
}
