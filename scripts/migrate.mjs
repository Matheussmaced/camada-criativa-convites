// Aplica os arquivos de supabase/migrations em ordem.
// Uso: node --env-file=.env.local scripts/migrate.mjs
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

const url = process.env.SUPABASE_DB_URL;
if (!url) throw new Error("Defina SUPABASE_DB_URL no .env.local");

const dir = join(import.meta.dirname, "..", "supabase", "migrations");
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();
try {
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    process.stdout.write(`Aplicando ${file}... `);
    await client.query(readFileSync(join(dir, file), "utf8"));
    console.log("ok");
  }
} finally {
  await client.end();
}
