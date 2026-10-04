# Calorie Tracker

Web-app om calorieën en macro's bij te houden. Gebruikers bouwen samen een productendatabase op en loggen per dag wat ze eten.

> 🚧 In ontwikkeling

## Features

- Registreren, e-mailbevestiging, inloggen en uitloggen (Supabase Auth)
- Gedeelde productendatabase: iedereen kan producten toevoegen en zoeken, alleen de maker kan ze bewerken
- Voedingswaarden per 100 g (kcal, eiwit, koolhydraten, vet, vezels)

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
| `OFF_USER_AGENT`                | Nog niet in gebruik (Open Food Facts)        |

## Scripts

| Script                | |
| --------------------- | ------------------------------------- |
| `npm run dev`         | Development server                    |
| `npm run build`       | Production build                      |
| `npm run lint`        | ESLint                                |
| `npm test`            | Vitest                                |
| `npm run db:generate` | Migratie genereren uit `src/lib/db/schema.ts` |
| `npm run db:migrate`  | Migraties uitvoeren                   |

## Security

- Gebruikersdata wordt altijd opgehaald als de ingelogde gebruiker, zodat Row Level Security geldt.
- De service role key wordt alleen server-side gebruikt (`src/lib/supabase/admin.ts`, `server-only`) en in scripts.
- Gebruikers mogen in `foods` alleen naam, merk en voedingswaarden schrijven (kolomrechten). Verwijderen kan niet.

## Beheer

Producten worden nooit echt verwijderd, zodat bestaande dagboeken blijven kloppen. Een beheerder archiveert een product door in Supabase (Table Editor → `foods`) `archived_at` in te vullen. Het verdwijnt dan uit de app.
