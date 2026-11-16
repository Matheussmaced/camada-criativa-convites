import Link from "next/link";
import { getSettings } from "@/app/lib/catalog";
import { whatsappLink } from "@/app/lib/types";
import { Logo } from "./Header";
import { WhatsappIcon } from "./Icons";

export default async function Footer() {
  const s = await getSettings();
  return (
    <>
      <footer className="mt-auto border-t border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-ink-soft">
              Convites digitais delicados para aniversários, chás e batizados. Feitos com carinho, entregues no seu WhatsApp.
            </p>
          </div>
          <div>
            <h3 className="font-display text-lg font-bold">Navegue</h3>
            <ul className="mt-3 space-y-2 text-ink-soft">
              <li><Link href="/convites" className="hover:text-lilac">Todos os convites</Link></li>
              <li><Link href="/#como-funciona" className="hover:text-lilac">Como funciona</Link></li>
              <li><Link href="/#duvidas" className="hover:text-lilac">Perguntas frequentes</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-display text-lg font-bold">Atendimento</h3>
            <ul className="mt-3 space-y-2 text-ink-soft">
              {s.hours && <li>{s.hours}</li>}
              <li>
                <a href={whatsappLink(s.whatsapp, "Oi! Vim pelo site.")} target="_blank" rel="noopener noreferrer" className="hover:text-lilac">
                  WhatsApp
                </a>
              </li>
              {s.email && <li>{s.email}</li>}
              {s.instagram && (
                <li>
                  <a href={`https://instagram.com/${s.instagram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="hover:text-lilac">
                    {s.instagram}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="border-t border-line py-5 text-center text-sm text-ink-soft">
          © 2026 Camada Criativa Convites. Todos os direitos reservados.
        </div>
      </footer>

      <a
        href={whatsappLink(s.whatsapp, "Oi! Vim pelo site e quero fazer um convite.")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-110"
      >
        <WhatsappIcon className="h-7 w-7" />
      </a>
    </>
  );
}
