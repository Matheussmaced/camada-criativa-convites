"use client";

import { useActionState } from "react";
import { signIn } from "../actions";
import { Label, Notice, btnPrimary, input } from "../ui";

export default function LoginForm() {
  const [state, action, pending] = useActionState(signIn, null);
  return (
    <form action={action} className="mt-6 space-y-4">
      <Label text="E-mail">
        <input name="email" type="email" autoComplete="email" required className={input} />
      </Label>
      <Label text="Senha">
        <input name="password" type="password" autoComplete="current-password" required className={input} />
      </Label>
      <Notice result={state} />
      <button type="submit" disabled={pending} className={`${btnPrimary} w-full py-3`}>
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
