import "server-only";

import { createClient } from "@/lib/supabase/server";

export type Food = {
  id: string;
  name: string;
  brand: string | null;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
  created_by: string | null;
  archived_at: string | null;
};

const FOOD_COLUMNS = "id, name, brand, kcal, protein, carbs, fat, fiber, created_by, archived_at";
const SEARCH_LIMIT = 50;

export async function searchFoods(query: string): Promise<Food[]> {
  const supabase = await createClient();

  let request = supabase
    .from("foods")
    .select(FOOD_COLUMNS)
    .is("archived_at", null)
    .order("name")
    .limit(SEARCH_LIMIT);

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
