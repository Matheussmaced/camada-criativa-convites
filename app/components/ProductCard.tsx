import Link from "next/link";
import { brl, type Product } from "@/app/lib/types";
import InviteArt from "./InviteArt";
import { Stars } from "./Icons";

export default function ProductCard({ p, fromPrice, deliveryDays = 3 }: { p: Product; fromPrice: number; deliveryDays?: number }) {
  const cover = p.images[0];
  return (
    <Link
      href={`/convite/${p.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-white transition hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(61,54,84,0.35)]"
    >
      <div className="relative p-5 pb-0" style={{ background: p.palette.soft }}>
        {p.badge && (
          <span
            className={`absolute left-4 top-4 z-10 rounded-md px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide ${
              p.badge === "Novo" ? "bg-mint-deep text-white" : "bg-lilac text-white"
            }`}
          >
            {p.badge}
          </span>
        )}
        <div className="mx-auto w-[72%] translate-y-3 transition duration-500 group-hover:translate-y-0">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" loading="lazy" className="aspect-[2/3] w-full rounded-[2.5%] object-cover shadow-lg" />
          ) : (
            <InviteArt
              motif={p.motif}
              palette={p.palette}
              text={{ eventLine: p.sample.eventLine, name: p.sample.name, age: p.sample.age?.toString(), date: "Sábado, 12/12", time: "às 15h" }}
              className="shadow-lg"
            />
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col border-t border-line p-5">
        <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">{p.event}</span>
        <h3 className="mt-1 font-display text-lg font-bold leading-snug text-ink group-hover:text-lilac-dark">{p.name}</h3>
        {p.reviews > 0 && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-soft">
            <Stars rating={p.rating} className="h-3.5 w-3.5" />
            <span>({p.reviews})</span>
          </div>
        )}
        <div className="mt-auto pt-4">
          <span className="block text-xs text-ink-soft">a partir de</span>
          <span className="font-display text-2xl font-bold text-ink">{brl(fromPrice)}</span>
          <span className="block text-xs font-semibold text-mint-deep">Entrega digital em até {deliveryDays} dias úteis</span>
        </div>
      </div>
    </Link>
  );
}
