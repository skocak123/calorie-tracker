"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { mealSchema, uuidSchema } from "@/lib/validation/schemas";

export type MealInput = {
  name: string;
  items: { foodId: string; grams: number }[];
};

export type MealActionResult = { error?: string };

const SAVE_ERROR = "Opslaan is niet gelukt. Probeer het opnieuw.";

export async function createMeal(input: MealInput): Promise<MealActionResult> {
  const user = await requireUser();

  const parsed = mealSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data: meal, error } = await supabase
    .from("meals")
    .insert({ user_id: user.id, name: parsed.data.name })
    .select("id")
    .single();

  if (error) return { error: SAVE_ERROR };

  const { error: itemsError } = await supabase.from("meal_items").insert(toRows(meal.id, parsed.data.items));

  // Don't leave an empty meal behind when the items fail.
  if (itemsError) {
    await supabase.from("meals").delete().eq("id", meal.id);
    return { error: SAVE_ERROR };
  }

  revalidatePath("/meals");
  redirect("/meals");
}

export async function updateMeal(id: string, input: MealInput): Promise<MealActionResult> {
  await requireUser();

  const parsed = mealSchema.safeParse(input);
  if (!uuidSchema.safeParse(id).success || !parsed.success) {
    return { error: parsed.error?.issues[0].message ?? "Onbekende maaltijd." };
  }

  const supabase = await createClient();
  const { data: updated, error } = await supabase
    .from("meals")
    .update({ name: parsed.data.name })
    .eq("id", id)
    .select("id");

  // RLS returns no rows when the meal belongs to someone else.
  if (error || updated.length === 0) return { error: SAVE_ERROR };

  // Replace all ingredients with the new list.
  const { error: deleteError } = await supabase.from("meal_items").delete().eq("meal_id", id);
  if (deleteError) return { error: SAVE_ERROR };

  const { error: itemsError } = await supabase.from("meal_items").insert(toRows(id, parsed.data.items));
  if (itemsError) return { error: SAVE_ERROR };

  revalidatePath("/meals");
  redirect("/meals");
}

// Logged meals stay in the diary: their items were copied when logging.
export async function deleteMeal(id: string) {
  await requireUser();

  if (uuidSchema.safeParse(id).success) {
    const supabase = await createClient();
    await supabase.from("meals").delete().eq("id", id);
  }

  revalidatePath("/meals");
  redirect("/meals");
}

function toRows(mealId: string, items: MealInput["items"]) {
  return items.map((item) => ({ meal_id: mealId, food_id: item.foodId, grams: item.grams }));
}
