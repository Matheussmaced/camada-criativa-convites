"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "../actions";

const items = [
  { href: "/admin", label: "Pedidos", match: (p: string) => p === "/admin" || p.startsWith("/admin/pedidos") },
  { href: "/admin/produtos", label: "Produtos", match: (p: string) => p.startsWith("/admin/produtos") },
  { href: "/admin/precos", label: "Preços", match: (p: string) => p.startsWith("/admin/precos") },
  { href: "/admin/configuracoes", label: "Configurações", match: (p: string) => p.startsWith("/admin/configuracoes") },
];

const icons: Record<string, React.ReactNode> = {
  Pedidos: <path d="M6 3h12l2 4v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7zM4 7h16M9 11h6" />,
  Produtos: <path d="M4 5h7v7H4zM13 5h7v7h-7zM4 14h7v6H4zM13 14h7v6h-7z" />,
  "Preços": <path d="M3 12V4h8l10 10-8 8zM7.5 7.5h.01" />,
  "Configurações": <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.5 15H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9.6 4V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />,
};

export default function AdminNav() {
  return <NavShell pathname={usePathname()} />;
}

export function NavShell({ pathname }: { pathname: string }) {
  return (
    <aside className="border-b border-line bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-60 lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between gap-3 px-4 py-4 lg:block lg:px-5 lg:py-6">
        <Link href="/admin" className="flex items-center gap-2.5">
          <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden>
            <rect x="2" y="6" width="30" height="30" rx="9" fill="#DCEDFB" />
            <rect x="8" y="2" width="30" height="30" rx="9" fill="#8B7FD6" />
            <path d="M15 24V15a8 8 0 0 1 16 0v9" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
          <span className="leading-tight">
            <span className="block font-display font-bold">Camada Criativa</span>
            <span className="block text-[11px] font-bold uppercase tracking-widest text-lilac">Painel</span>
          </span>
        </Link>
        <form action={signOut} className="lg:hidden">
          <button className="text-sm font-bold text-ink-soft hover:text-lilac">Sair</button>
        </form>
      </div>
      <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:px-3" aria-label="Painel">
        {items.map((it) => {
          const active = it.match(pathname);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                active ? "bg-lavender text-lilac-dark" : "text-ink-soft hover:bg-page hover:text-ink"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                {icons[it.label]}
              </svg>
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="hidden px-3 lg:absolute lg:inset-x-0 lg:bottom-5 lg:block">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-soft hover:bg-page hover:text-ink">
          Ver site
        </Link>
        <form action={signOut}>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-soft hover:bg-page hover:text-[#B03A52]">Sair</button>
        </form>
      </div>
    </aside>
  );
}
