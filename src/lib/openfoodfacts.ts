// Converts Open Food Facts products into rows for our foods table.
// Docs: https://openfoodfacts.github.io/openfoodfacts-server/api/

export type OffProduct = {
  code?: string;
  product_name?: string;
  product_name_nl?: string;
  lang?: string;
  brands?: string[] | string;
  nutriments?: Record<string, number | string | undefined>;
};

export type ImportedFood = {
  barcode: string;
  name: string;
  brand: string | null;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
};

const KJ_PER_KCAL = 4.184;

// Returns null when a product is incomplete or its values don't add up.
export function toFood(product: OffProduct): ImportedFood | null {
  const barcode = product.code?.trim() ?? "";
  if (!/^\d{8,14}$/.test(barcode)) return null;

  const name = dutchName(product);
  if (!name || name.length < 2 || name.length > 100) return null;

  const n = product.nutriments ?? {};
  const kcal = number(n["energy-kcal_100g"]) ?? kjToKcal(number(n["energy-kj_100g"]));
  const protein = number(n["proteins_100g"]);
  const carbs = number(n["carbohydrates_100g"]);
  const fat = number(n["fat_100g"]);
  const fiber = number(n["fiber_100g"]) ?? null;

  if (kcal === undefined || protein === undefined || carbs === undefined || fat === undefined) {
    return null;
  }

  const macros = [protein, carbs, fat, fiber ?? 0];
  if (kcal < 0 || kcal > 1000 || macros.some((value) => value < 0 || value > 100)) return null;
  if (protein + carbs + fat + (fiber ?? 0) > 100) return null;

  // Calories must roughly match the macros (4 kcal/g protein and carbs, 9 fat, 2 fiber).
  const estimate = 4 * protein + 4 * carbs + 9 * fat + 2 * (fiber ?? 0);
  if (Math.abs(kcal - estimate) > Math.max(20, kcal * 0.15)) return null;

  return {
    barcode,
    name,
    brand: firstBrand(product.brands),
    kcal: round(kcal),
    protein: round(protein),
    carbs: round(carbs),
    fat: round(fat),
    fiber: fiber === null ? null : round(fiber),
  };
}

function dutchName(product: OffProduct) {
  const name = product.product_name_nl?.trim() || (product.lang === "nl" ? product.product_name?.trim() : "");
  return name ? name.replace(/\s+/g, " ") : null;
}

function firstBrand(brands: OffProduct["brands"]) {
  const first = Array.isArray(brands) ? brands[0] : brands?.split(",")[0];
  const brand = first?.trim().slice(0, 100);
  return brand || null;
}

function number(value: number | string | undefined) {
  const parsed = typeof value === "string" ? Number(value) : value;
  return parsed !== undefined && Number.isFinite(parsed) ? parsed : undefined;
}

function kjToKcal(kj: number | undefined) {
  return kj === undefined ? undefined : kj / KJ_PER_KCAL;
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}
