// Imports popular Dutch products from Open Food Facts into the foods table.
// Usage: npm run import:off            (1000 products)
//        npm run import:off -- 2000    (custom amount)
// Safe to run again: existing products are updated by barcode.

import { loadEnvConfig } from "@next/env";
import { sql } from "drizzle-orm";

import { createDb } from "@/lib/db";
import { foods } from "@/lib/db/schema";
import { requireEnv } from "@/lib/env";
import { toFood, type ImportedFood, type OffProduct } from "@/lib/openfoodfacts";

loadEnvConfig(process.cwd());

const TARGET = Number(process.argv[2] ?? 1000);
const PAGE_SIZE = 100;
const MAX_PAGES = 50;
const DELAY_MS = 1000;
const SEARCH_URL = "https://search.openfoodfacts.org/search";
const FIELDS = "code,product_name,product_name_nl,lang,brands,nutriments";

async function main() {
  const userAgent = requireEnv("OFF_USER_AGENT", process.env.OFF_USER_AGENT);
  const found = new Map<string, ImportedFood>();
  let checked = 0;

  for (let page = 1; page <= MAX_PAGES && found.size < TARGET; page++) {
    const products = await fetchPage(page, userAgent);
    if (products.length === 0) break;

    for (const product of products) {
      checked++;
      const food = toFood(product);
      if (food && found.size < TARGET) found.set(food.barcode, food);
    }

    console.log(`Pagina ${page}: ${found.size} bruikbare producten van ${checked} bekeken`);
    await sleep(DELAY_MS);
  }

  const db = createDb();
  const rows = [...found.values()].map((food) => ({ ...food, source: "off", createdBy: null }));

  await db
    .insert(foods)
    .values(rows)
    .onConflictDoUpdate({
      target: foods.barcode,
      set: {
        name: sql`excluded.name`,
        brand: sql`excluded.brand`,
        kcal: sql`excluded.kcal`,
        protein: sql`excluded.protein`,
        carbs: sql`excluded.carbs`,
        fat: sql`excluded.fat`,
        fiber: sql`excluded.fiber`,
      },
    });

  await db.$client.end();
  console.log(`Klaar: ${rows.length} producten toegevoegd of bijgewerkt.`);
}

async function fetchPage(page: number, userAgent: string): Promise<OffProduct[]> {
  const params = new URLSearchParams({
    q: 'countries_tags:"en:netherlands"',
    sort_by: "-unique_scans_n",
    page_size: String(PAGE_SIZE),
    page: String(page),
    fields: FIELDS,
  });

  const response = await fetch(`${SEARCH_URL}?${params}`, {
    headers: { "User-Agent": userAgent },
  });
  if (!response.ok) {
    throw new Error(`Open Food Facts gaf HTTP ${response.status} op pagina ${page}`);
  }

  const body: { hits?: OffProduct[] } = await response.json();
  return body.hits ?? [];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
