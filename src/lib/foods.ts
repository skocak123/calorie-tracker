import "server-only";

import { createClient } from "@/lib/supabase/server";

export type Food = {
  id: string;
  name: string;
  brand: string | null;
  source: "custom" | "off" | "nevo";
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
  created_by: string | null;
  archived_at: string | null;
};

// The fields needed to show a food and calculate its macros.
export type FoodNutrition = Pick<
  Food,
  "id" | "name" | "brand" | "kcal" | "protein" | "carbs" | "fat" | "fiber"
>;

const FOOD_COLUMNS = "id, name, brand, source, kcal, protein, carbs, fat, fiber, created_by, archived_at";
export const FOODS_PAGE_SIZE = 30;

// Sorted by name; id as tiebreaker so pages never overlap.
export async function searchFoods(
  query: string,
  limit = FOODS_PAGE_SIZE,
  offset = 0,
): Promise<Food[]> {
  const supabase = await createClient();

  let request = supabase
    .from("foods")
    .select(FOOD_COLUMNS)
    .is("archived_at", null)
    .order("name")
    .order("id")
    .range(offset, offset + limit - 1);

  if (query) {
    request = request.ilike("name", `%${escapeLike(query)}%`);
  }

  const { data, error } = await request;
  if (error) throw error;

  return data;
}

export async function getFood(id: string): Promise<Food | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("foods").select(FOOD_COLUMNS).eq("id", id).maybeSingle();

  return data;
}

// Treat % and _ in the search text as normal characters.
function escapeLike(text: string) {
  return text.replace(/[\\%_]/g, (char) => `\\${char}`);
}
