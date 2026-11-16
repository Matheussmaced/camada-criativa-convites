"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL } from "./clients";

/** Cliente no navegador com a sessão do admin (usado para enviar imagens). */
export function browserClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
}
