#!/usr/bin/env bash
# One-shot manual deployment helper for All Nursing Exams Prep Hub.
#
#   chmod +x scripts/deploy.sh
#   DATABASE_URL="postgresql://user:pass@host:5432/db" ./scripts/deploy.sh
#
# Steps: install deps -> apply schema -> seed content -> build -> start.
set -euo pipefail

# Load .env safely. Do NOT `source` it: connection strings contain `&`
# (e.g. ?sslmode=require&channel_binding=require) which bash treats as a
# background operator and silently blanks DATABASE_URL.
if [ -f .env ]; then
  eval "$(node -r dotenv/config -e '
    const keys = ["DATABASE_URL","PAYSTACK_SECRET_KEY","SEED_DEMO","NODE_ENV","PORT"];
    for (const k of keys) {
      if (process.env[k] !== undefined) console.log(`export ${k}=${JSON.stringify(process.env[k])}`);
    }
  ' 2>/dev/null)"
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ DATABASE_URL is not set. Copy .env.example to .env and fill it in."
  exit 1
fi

echo "▶ 1/5 Installing dependencies…"
npm ci

echo "▶ 2/5 Applying database schema…"
npx drizzle-kit push --force

echo "▶ 3/5 Seeding 20,000 questions + learning library + demo data…"
npx tsx src/db/seed.ts

echo "▶ 4/5 Building production bundle…"
npm run build

echo "▶ 5/5 Starting server on port ${PORT:-3000}…"
npm run start
