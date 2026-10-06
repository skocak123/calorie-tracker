import "server-only";

import type { FoodNutrition } from "@/lib/foods";
import type { MealType } from "@/lib/meal-types";
import { createClient } from "@/lib/supabase/server";

export type LogEntry = {
  id: string;
  meal_type: MealType;
  grams: number;
  meal_name: string | null;
  group_id: string | null;
  food: FoodNutrition;
};

export async function getLogEntries(userId: string, date: string): Promise<LogEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("log_entries")
    .select("id, meal_type, grams, meal_name, group_id, food:foods(id, name, brand, kcal, protein, carbs, fat, fiber)")
    .eq("user_id", userId)
    .eq("date", date)
    .order("created_at");

  if (error) throw error;

  // Without generated types the joined food is typed as an array; it is a single row.
  return data as unknown as LogEntry[];
}
