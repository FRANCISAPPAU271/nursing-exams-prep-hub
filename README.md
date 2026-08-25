# All Nursing Exams Prep Hub

**NMC exams and NCLEX — with a plan, not panic.**

A study task manager and question bank for student nurses and working staff
preparing for licensure. One platform covers two exam tracks: the UK **NMC Test
of Competence** (CBT + OSCE) and the US/Canada **NCLEX-RN/PN**.

_Package slug: `nursing-exams-prep-hub`_

---

## What's inside

| | |
|---|---|
| **32,000 practice questions** | 20,000 NCLEX + 12,000 NMC CBT, every item with a written rationale, tagged by category and difficulty |
| **Study task manager** | Full CRUD with priorities, due dates, question targets and optimistic updates |
| **Exam-accurate mock tests** | NCLEX 75 Q / 90 min · NMC CBT 120 Q / 4 hr — navigator, flagging, auto-submit, full review |
| **Learning library** | 47 video lessons: body systems, common conditions, care plans & nursing process, NMC UK registration, app orientation |
| **Progress analytics** | Accuracy by category and attempt history to drive targeted remediation |
| **Exam strategy playbook** | Prioritisation frameworks, distractor elimination, numeracy and test-day tactics |
| **Payments** | MTN Mobile Money to **0598872146** with manual verification and one-time activation codes |
| **Refer & Earn** | 10% of every referred paid plan, cashed out to mobile money |
| **Account security** | One active device per account, traceable watermark, copy/print blocking, audit log |

## Stack

Next.js 16 (App Router) · React 19 · Drizzle ORM · PostgreSQL · Tailwind CSS v4

## Quick start

```bash
npm install
cp .env.example .env      # set DATABASE_URL
npm run deploy            # schema → seed content → build
npm run dev
```

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Local development server |
| `npm run build` | Production build |
| `npm run start` | Start the built server |
| `npm run deploy` | One-shot: verify DB → push schema → seed → build |
| `npm run seed` | Seed questions, lessons and demo data |
| `npm run db:push` | Apply `src/db/schema.ts` to the database |
| `npm run admin -- <email> "<name>" "<password>"` | Create or promote an administrator |
| `npm run typecheck` | TypeScript check |

For full hosting instructions (VPS, Docker, Vercel, Railway) see
**[DEPLOYMENT.md](./DEPLOYMENT.md)**.

## Important before going public

Always seed with demo data disabled, otherwise the public `demo@nursingprep.app`
account — which holds administrator rights — is created with a documented
password:

```bash
SEED_DEMO=false npm run deploy
```

## Layout

```
src/
  app/
    (auth)/          login + register
    (marketing)/     site nav, hero task-board preview
    api/             auth, tasks, questions, quiz, payments,
                     activate, referrals, admin, security
    dashboard/       overview, tasks, questions, practice, mock,
                     library, progress, strategies, refer, faq,
                     billing, security, admin
  db/                schema.ts, seed.ts
  lib/               auth, plans, money, exams, content,
                     library, referrals, nmc-topics
```

## Data model

`users` · `sessions` · `security_events` · `questions` · `tasks` · `attempts` ·
`lessons` · `payments` · `activation_codes` · `referrals` · `payouts`

## Configuration

- `src/lib/plans.ts` — plan prices (USD), the MoMo number, and `USD_TO_GHS`
  which converts a dollar price into the cedi amount students are told to send.
  **Keep this rate current.**
- `src/lib/exams.ts` — exam tracks, categories and mock-exam formats.
- `src/lib/content.ts` — FAQ and exam-strategy copy.
- `src/lib/referrals.ts` — reward rate, payout minimum, bonus days.

## Disclaimer

Study content is for exam preparation only and is not a substitute for clinical
judgement, local protocols, or an accredited education programme.
