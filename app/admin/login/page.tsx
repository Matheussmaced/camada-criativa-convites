import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm rounded-3xl border border-line bg-white p-8 shadow-[0_20px_50px_-25px_rgba(61,54,84,0.35)]">
        <svg viewBox="0 0 40 40" className="h-11 w-11" aria-hidden>
          <rect x="2" y="6" width="30" height="30" rx="9" fill="#DCEDFB" />
          <rect x="8" y="2" width="30" height="30" rx="9" fill="#8B7FD6" />
          <path d="M15 24V15a8 8 0 0 1 16 0v9" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
        <h1 className="mt-5 font-display text-2xl font-bold">Painel administrativo</h1>
        <p className="mt-1 text-sm text-ink-soft">Entre com seu e-mail e senha.</p>
        <LoginForm />
      </div>
    </div>
  );
}
