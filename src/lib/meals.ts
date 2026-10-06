import "server-only";

import type { FoodNutrition } from "@/lib/foods";
import { createClient } from "@/lib/supabase/server";

export type MealItem = {
  id: string;
  grams: number;
  food: FoodNutrition & { archived_at: string | null };
};

export type Meal = {
  id: string;
  name: string;
  items: MealItem[];
};

const MEAL_COLUMNS =
  "id, name, items:meal_items(id, grams, food:foods(id, name, brand, kcal, protein, carbs, fat, fiber, archived_at))";

// RLS only returns the user's own meals.
export async function getMeals(userId: string): Promise<Meal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meals")
    .select(MEAL_COLUMNS)
    .eq("user_id", userId)
    .order("name");

  if (error) throw error;
  // Without generated types the joined food is typed as an array; it is a single row.
  return data as unknown as Meal[];
}

export async function getMeal(id: string): Promise<Meal | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("meals").select(MEAL_COLUMNS).eq("id", id).maybeSingle();

  return data as unknown as Meal | null;
}
