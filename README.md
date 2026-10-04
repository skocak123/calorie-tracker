# Calorie Tracker

Web-app om calorieën en macro's bij te houden. Zoek producten (NEVO + Open Food Facts), stel maaltijden samen en log per dag wat je eet ten opzichte van je eigen doelen.

> 🚧 In ontwikkeling

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres + Auth) · Drizzle ORM · Vitest

## Lokaal draaien

Vereist Node.js 24 en een [Supabase](https://supabase.com)-project.

```bash
npm install
cp .env.example .env.local   # vul de waarden in
npm run db:migrate
npm run dev
```

| Variabele                       | Bron (Supabase-dashboard)                    |
| ------------------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Project Settings → Data API                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API Keys (publishable)    |
| `SUPABASE_SERVICE_ROLE_KEY`     | Project Settings → API Keys (secret)         |
| `DATABASE_URL`                  | Connect → Session pooler                     |
| `OFF_USER_AGENT`                | `CalorieTracker/0.1 (jouw@email.nl)`         |

## Scripts

| Script                | |
| --------------------- | ------------------------------------- |
| `npm run dev`         | Development server                    |
| `npm run build`       | Production build                      |
| `npm run lint`        | ESLint                                |
| `npm test`            | Vitest                                |
| `npm run db:generate` | Migratie genereren uit `src/lib/db/schema.ts` |
| `npm run db:migrate`  | Migraties uitvoeren                   |

## NEVO-data

De NEVO-tabel (RIVM) zit niet in de repo. Download het CSV-bestand zelf, zet het in `data/` en draai `npm run import:nevo`.

## Security

- Gebruikersdata wordt altijd opgehaald als de ingelogde gebruiker, zodat Row Level Security geldt.
- De service role key wordt alleen server-side gebruikt (`src/lib/supabase/admin.ts`, `server-only`) en in scripts.
