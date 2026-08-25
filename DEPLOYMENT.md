# Deploying All Nursing Exams Prep Hub

The app is a standard Next.js 16 (App Router) server application plus a PostgreSQL
database. Anything that can run Node 20+ and reach a Postgres instance will host it.

---

## ⚡ TL;DR — deploying for real

On any server (or your laptop) with Node 20+:

```bash
cp .env.example .env          # set DATABASE_URL
SEED_DEMO=false npm run deploy            # env check → schema → content → build
npm run admin -- you@example.com "Your Name" YourStrongPassword
npm run start                             # serves on :3000
```

`SEED_DEMO=false` is the important flag. It loads all 32,000 questions and 47
lessons **without** creating the public demo account. Never deploy publicly
without it — the demo login (`demo@nursingprep.app` / `demo1234`) is an
administrator and its password is documented everywhere.

`npm run deploy` is safe to re-run and stops with a clear message if
`DATABASE_URL` is missing or unreachable.

**No database yet?** Get a free one at [neon.tech](https://neon.tech) in ~2
minutes, copy the connection string into `.env`, then run the commands above.

Verified output:

```
▶ 1/5 Checking environment
  ✓ DATABASE_URL points at postgresql://***@…
  ✓ Payments: MTN Mobile Money to 0598872146 (no gateway keys needed)
  ✓ Production mode: demo accounts will NOT be seeded
▶ 2/5 Connecting to PostgreSQL      ✓ PostgreSQL 15.16
▶ 3/5 Applying database schema      ✓ Schema is up to date
▶ 4/5 Seeding content               ✓ 32,000 questions · 47 lessons
▶ 5/5 Building production bundle    ✅ ready to serve
```

---

## 1. Manual deploy (VPS: DigitalOcean / Hetzner / Contabo / AWS EC2)

```bash
# on the server
sudo apt update && sudo apt install -y nodejs npm postgresql nginx
git clone <your-repo> nclex && cd nclex

cp .env.example .env       # then set DATABASE_URL
chmod +x scripts/deploy.sh
./scripts/deploy.sh        # install → schema push → seed → build → start
```

### Keep it running with PM2

```bash
npm i -g pm2
pm2 start "npm run start" --name nursing-prep-hub
pm2 save && pm2 startup
```

### Or with systemd

```ini
# /etc/systemd/system/nclex.service
[Unit]
Description=All Nursing Exams Prep Hub
After=network.target postgresql.service

[Service]
WorkingDirectory=/home/ubuntu/nclex
EnvironmentFile=/home/ubuntu/nclex/.env
ExecStart=/usr/bin/npm run start
Restart=always
User=ubuntu

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now nclex
```

### Nginx reverse proxy + free HTTPS

```nginx
server {
  server_name nursingprep.example.com;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
  }
}
```

```bash
sudo certbot --nginx -d nursingprep.example.com
```

---

## 2. Docker / Docker Compose (easiest self-host)

Ships app + Postgres together:

```bash
docker compose up -d --build

# one-time: create the schema and load all content
docker compose exec app npx drizzle-kit push --force
docker compose exec app npx tsx src/db/seed.ts
```

App is then on `http://localhost:3000`, health check at `/api/health`.
The build uses Next.js `output: "standalone"`, so the runtime image is small.

To deploy that same image on Render, Fly.io, Railway or Coolify, just point them
at the `Dockerfile`.

---

## 3. Vercel + managed Postgres (zero-ops option)

1. Push the repo to GitHub.
2. Import it at vercel.com — the framework is auto-detected, no build config needed.
3. Create a Postgres database (Neon, Supabase or Vercel Postgres) and copy its
   pooled connection string.
4. In **Project → Settings → Environment Variables** add `DATABASE_URL`.
5. Deploy, then run the schema push and seed **once** from your laptop against the
   production database:

```bash
DATABASE_URL="postgresql://...neon.tech/db?sslmode=require" npx drizzle-kit push --force
DATABASE_URL="postgresql://...neon.tech/db?sslmode=require" npx tsx src/db/seed.ts
```

> Note: every page is `force-dynamic` and uses the Node runtime, so it works on
> Vercel without extra configuration.

---

## 4. Other one-click hosts

| Host | How |
|---|---|
| **Railway** | New Project → Deploy from repo → add Postgres plugin → `DATABASE_URL` is injected automatically. |
| **Render** | New Web Service → Build `npm ci && npm run build` → Start `npm run start` → attach Render Postgres. |
| **Fly.io** | `fly launch` (detects the Dockerfile) → `fly postgres create` → `fly postgres attach`. |
| **Coolify / Dokku** | Point at the repo; both read the `Dockerfile`. |

---

## 5. Post-deploy checklist

- [ ] `curl https://yourdomain/api/health` returns `{"ok":true}`
- [ ] `select count(*) from questions;` returns **32000** (20,000 NCLEX + 12,000 NMC)
- [ ] `select count(*) from lessons;` returns **47**
- [ ] **`select email from users where role='admin';` lists only YOU** —
      if `demo@nursingprep.app` appears, delete it:
      `delete from users where email='demo@nursingprep.app';`
- [ ] Sign in and open `/dashboard/admin` to confirm the payment queue loads
- [ ] Check the exchange rate in `src/lib/plans.ts` (`USD_TO_GHS`) is current —
      students are shown a cedi amount derived from it
- [ ] Confirm the MoMo number on the Billing page is correct (`0598872146`)
- [ ] Test the full payment loop with a real GHS 1 transfer before announcing
- [ ] Set up a nightly `pg_dump` backup
- [ ] Serve over HTTPS (session cookies are `secure` in production)

## 6. Re-deploying after code changes

```bash
git pull
npm ci
npx drizzle-kit push --force   # only if src/db/schema.ts changed
npm run build
pm2 restart nursing-prep-hub          # or: docker compose up -d --build
```

Re-running the seed is safe: questions and demo rows are only inserted when
missing, so existing student data is never overwritten.
