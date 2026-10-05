# Calorie Tracker

Web-app om calorieën en macro's bij te houden. Gebruikers bouwen samen een productendatabase op en loggen per dag wat ze eten.

> 🚧 In ontwikkeling

## Features

- Registreren, e-mailbevestiging, inloggen en uitloggen (Supabase Auth)
- Onboarding: geslacht, geboortedatum, lengte, gewicht, activiteit en doel (rustig/snel cutten, onderhouden, rustig/snel bulken)
- Persoonlijk plan: BMI, rustverbranding (Mifflin-St Jeor), dagverbruik en dagdoelen voor kcal, eiwit, koolhydraten en vet
- Dashboard met voortgangsbalken voor vandaag
- Gedeelde productendatabase: iedereen kan producten toevoegen en zoeken, alleen de maker kan ze bewerken
- 1000 populaire Nederlandse producten geïmporteerd uit Open Food Facts
- Infinite scroll met skeleton-loaders
- Voedingswaarden per 100 g (kcal, eiwit, koolhydraten, vet, vezels)
- Dagboek per dag: product kiezen, grammen invullen en de macro's live zien; het maaltijdmoment wordt op basis van de tijd voorgesteld
- Totalen worden nooit opgeslagen maar berekend: waarde per 100 g × gram ÷ 100

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
| `npm run import:off`  | Producten importeren uit Open Food Facts (standaard 1000) |

## Security

- Gebruikersdata wordt altijd opgehaald als de ingelogde gebruiker, zodat Row Level Security geldt.
- De service role key wordt alleen server-side gebruikt (`src/lib/supabase/admin.ts`, `server-only`) en in scripts.
- Gebruikers mogen in `foods` alleen naam, merk en voedingswaarden schrijven (kolomrechten). Verwijderen kan niet.

## Open Food Facts

`npm run import:off` haalt de populairste producten in Nederland op via de [Open Food Facts](https://world.openfoodfacts.org)-API. Alleen producten met een Nederlandse naam, volledige voedingswaarden en kloppende kcal worden opgeslagen. Het script kan opnieuw gedraaid worden; bestaande producten worden op barcode bijgewerkt.

Gegevens van Open Food Facts vallen onder de [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/1-0/).

## Beheer

Producten worden nooit echt verwijderd, zodat bestaande dagboeken blijven kloppen. Een beheerder archiveert een product door in Supabase (Table Editor → `foods`) `archived_at` in te vullen. Het verdwijnt dan uit de app.
