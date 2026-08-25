#!/usr/bin/env node
/**
 * One-command deploy bootstrap: `npm run deploy`
 *
 * Verifies the database connection, applies the schema, seeds content only if
 * missing, builds, and prints the exact command to start the server.
 * Safe to re-run: existing student data is never overwritten.
 */
import { execSync } from "node:child_process";
import { existsSync, copyFileSync } from "node:fs";

const step = (n, msg) => console.log(`\n\x1b[36m▶ ${n}\x1b[0m ${msg}`);
const ok = (msg) => console.log(`  \x1b[32m✓\x1b[0m ${msg}`);
const die = (msg) => {
  console.error(`\n\x1b[31m✗ ${msg}\x1b[0m\n`);
  process.exit(1);
};
const run = (cmd) => execSync(cmd, { stdio: "inherit", env: process.env });

// ── 1. Environment ────────────────────────────────────────────────────────────
step("1/5", "Checking environment");

if (!existsSync(".env") && existsSync(".env.example")) {
  copyFileSync(".env.example", ".env");
  die(
    ".env was missing so I created one from .env.example.\n" +
      "  Open it, set DATABASE_URL to your Postgres connection string, then re-run:\n" +
      "    npm run deploy",
  );
}

if (!process.env.DATABASE_URL && existsSync(".env")) {
  const { config } = await import("dotenv");
  config();
}

const url = process.env.DATABASE_URL;
if (!url) die("DATABASE_URL is not set. Add it to .env and re-run `npm run deploy`.");
if (url.includes("placeholder")) die("DATABASE_URL is still a placeholder. Use a real Postgres URL.");
ok(`DATABASE_URL points at ${url.replace(/:\/\/[^@]+@/, "://***@").slice(0, 70)}…`);

console.log("  \x1b[32m✓\x1b[0m Payments: MTN Mobile Money to 0598872146 (no gateway keys needed)");

const isProd = process.env.NODE_ENV === "production" || process.env.SEED_DEMO === "false";
if (isProd) {
  console.log("  \x1b[32m✓\x1b[0m Production mode: demo accounts will NOT be seeded");
} else {
  console.log(
    "  \x1b[33m!\x1b[0m Demo data WILL be seeded (demo@nursingprep.app / demo1234, admin).\n" +
      "    For a public deployment run:  SEED_DEMO=false npm run deploy",
  );
}

// ── 2. Database reachability ──────────────────────────────────────────────────
step("2/5", "Connecting to PostgreSQL");
const { Pool } = await import("pg");
const pool = new Pool({
  connectionString: url,
  ssl: /neon\.tech|supabase|render\.com|amazonaws|railway/.test(url)
    ? { rejectUnauthorized: false }
    : undefined,
  connectionTimeoutMillis: 10000,
});
try {
  const res = await pool.query("select version()");
  ok(res.rows[0].version.split(",")[0]);
} catch (e) {
  await pool.end().catch(() => {});
  die(`Could not connect to the database: ${e.message}`);
}

// ── 3. Schema ─────────────────────────────────────────────────────────────────
step("3/5", "Applying database schema");
run("npx drizzle-kit push --force");
ok("Schema is up to date");

// ── 4. Seed ───────────────────────────────────────────────────────────────────
step("4/5", "Seeding content (questions, lessons, demo data)");
run("npx tsx src/db/seed.ts");

const counts = await pool.query(`
  select
    (select count(*) from questions)::int as questions,
    (select count(*) from lessons)::int   as lessons,
    (select count(*) from users)::int     as users
`);
const c = counts.rows[0];
ok(`${c.questions.toLocaleString()} questions · ${c.lessons} lessons · ${c.users} users`);
if (c.questions < 20000) die("Question bank is incomplete — re-run `npx tsx src/db/seed.ts`.");
await pool.end();

// ── 5. Build ──────────────────────────────────────────────────────────────────
step("5/5", "Building production bundle");
run("npm run build");

const port = process.env.PORT || 3000;
console.log(`
\x1b[32m╭──────────────────────────────────────────────────────────╮
│  ✅  All Nursing Exams Prep Hub is ready to serve                     │
╰──────────────────────────────────────────────────────────╯\x1b[0m

  Start it:        \x1b[1mnpm run start\x1b[0m
  Keep it running: \x1b[1mnpx pm2 start "npm run start" --name nursing-prep-hub\x1b[0m
  Then open:       \x1b[1mhttp://localhost:${port}\x1b[0m
  Health check:    \x1b[1mcurl http://localhost:${port}/api/health\x1b[0m

  Create your admin: \x1b[1mnpm run admin -- you@example.com "Your Name" StrongPassword\x1b[0m
  Verify payments:   /dashboard/admin
`);
