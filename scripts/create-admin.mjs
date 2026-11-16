// Cria (ou promove) o usuário administrador.
// Uso: node --env-file=.env.local scripts/create-admin.mjs email senha
import { createClient } from "@supabase/supabase-js";
import pg from "pg";

const [email, password] = process.argv.slice(2);
if (!email || !password) throw new Error("Uso: create-admin.mjs <email> <senha>");

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } });
const { error } = await sb.auth.signUp({ email, password });
if (error && !/already/i.test(error.message)) throw error;

const db = new pg.Client({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await db.connect();
const { rows } = await db.query(
  "update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now()) where email = $1 returning id",
  [email.toLowerCase()],
);
if (!rows[0]) throw new Error("Usuário não encontrado");
await db.query("delete from public.admins where user_id <> $1", [rows[0].id]); // só um admin
await db.query("insert into public.admins (user_id) values ($1) on conflict do nothing", [rows[0].id]);
await db.end();
console.log("Admin pronto:", email);
