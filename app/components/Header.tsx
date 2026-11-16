"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SearchIcon } from "./Icons";

const links = [
  { href: "/", label: "Início" },
  { href: "/convites", label: "Convites" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#duvidas", label: "Dúvidas" },
];

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Camada Criativa Convites, página inicial">
      <svg viewBox="0 0 40 40" className="h-10 w-10" aria-hidden>
        <rect x="2" y="6" width="30" height="30" rx="9" fill="#DCEDFB" />
        <rect x="8" y="2" width="30" height="30" rx="9" fill="#8B7FD6" />
        <path d="M15 24V15a8 8 0 0 1 16 0v9" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="23" cy="15" r="2.4" fill="#FFE9A8" />
      </svg>
      <span className="leading-none">
        <span className="block font-display text-lg font-bold text-ink">Camada Criativa</span>
        <span className="block text-[10px] font-extrabold uppercase tracking-[0.3em] text-lilac">convites</span>
      </span>
    </Link>
  );
}

function SearchBox({ onDone }: { onDone?: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(q.trim() ? `/convites?q=${encodeURIComponent(q.trim())}` : "/convites");
        onDone?.();
      }}
      className="flex w-full items-center rounded-full border border-line bg-white pl-4 focus-within:border-lilac"
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar tema, evento..."
        aria-label="Buscar convites"
        className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-ink-soft/60"
      />
      <button type="submit" className="m-1 grid h-8 w-8 place-items-center rounded-full bg-lavender text-lilac-dark" aria-label="Buscar">
        <SearchIcon className="h-4 w-4" />
      </button>
    </form>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6">
        <Logo />
        <div className="hidden max-w-sm flex-1 md:block">
          <SearchBox />
        </div>
        <nav className="ml-auto hidden items-center gap-6 lg:flex" aria-label="Principal">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-[15px] font-bold text-ink-soft transition hover:text-lilac">
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="ml-auto grid h-11 w-11 place-items-center rounded-full border border-line bg-white lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          <span className="relative block h-3.5 w-5">
            <span className={`absolute left-0 h-0.5 w-5 rounded bg-ink transition ${open ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 top-1.5 h-0.5 w-5 rounded bg-ink transition ${open ? "opacity-0" : ""}`} />
            <span className={`absolute left-0 h-0.5 w-5 rounded bg-ink transition ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
          </span>
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-line bg-page px-4 pb-6 pt-4 lg:hidden">
          <div className="md:hidden">
            <SearchBox onDone={() => setOpen(false)} />
          </div>
          <nav className="mt-2" aria-label="Menu móvel">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block border-b border-line py-3 font-display text-lg font-semibold">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
