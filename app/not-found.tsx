import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-display text-7xl font-bold text-lavender-deep">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold">Página não encontrada</h1>
      <p className="mt-2 text-ink-soft">Esse convite pode ter saído da coleção. Que tal ver os outros modelos?</p>
      <Link href="/convites" className="mt-8 inline-block rounded-full bg-lilac px-7 py-4 font-bold text-white hover:bg-lilac-dark">
        Ver convites
      </Link>
    </div>
  );
}
