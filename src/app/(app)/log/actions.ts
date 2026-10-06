"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { formatNumber } from "@/lib/format";
import { getMeal } from "@/lib/meals";
import { createClient } from "@/lib/supabase/server";
import { logEntrySchema, logMealSchema, uuidSchema } from "@/lib/validation/schemas";

export type AddLogEntryResult = { error?: string };

const ADD_ERROR = "Toevoegen is niet gelukt. Probeer het opnieuw.";

export async function addLogEntry(formData: FormData): Promise<AddLogEntryResult> {
  const user = await requireUser();

  const parsed = logEntrySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { date, mealType, foodId, grams } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("log_entries").insert({
    user_id: user.id,
    date,
    meal_type: mealType,
    food_id: foodId,
    grams,
  });

  if (error) return { error: ADD_ERROR };

  revalidatePath("/log");
  return {};
}

// Copies the meal's ingredients into the diary, so later changes to the
// meal don't change days that are already logged.
export async function addMealToLog(formData: FormData): Promise<AddLogEntryResult> {
  const user = await requireUser();

  const parsed = logMealSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { date, mealType, mealId, portions } = parsed.data;
  const meal = await getMeal(mealId);
  if (!meal || meal.items.length === 0) {
    return { error: "Deze maaltijd bestaat niet (meer)." };
  }
  if (meal.items.some((item) => item.food.archived_at)) {
    return { error: "Een product in deze maaltijd is niet meer beschikbaar. Pas de maaltijd aan." };
  }

  const groupId = crypto.randomUUID();
  const mealName = portions === 1 ? meal.name : `${meal.name} (${formatNumber(portions)}×)`;

  const supabase = await createClient();
  const { error } = await supabase.from("log_entries").insert(
    meal.items.map((item) => ({
      user_id: user.id,
      date,
      meal_type: mealType,
      food_id: item.food.id,
      grams: Math.round(item.grams * portions * 10) / 10,
      meal_name: mealName,
      group_id: groupId,
    })),
  );

  if (error) return { error: ADD_ERROR };

  revalidatePath("/log");
  return {};
}

export async function deleteLogEntry(id: string) {
  await requireUser();

  if (uuidSchema.safeParse(id).success) {
    const supabase = await createClient();
    await supabase.from("log_entries").delete().eq("id", id);
  }

  revalidatePath("/log");
}

// Removes all lines of one logged meal at once.
export async function deleteLogGroup(groupId: string) {
  await requireUser();

  if (uuidSchema.safeParse(groupId).success) {
    const supabase = await createClient();
    await supabase.from("log_entries").delete().eq("group_id", groupId);
  }

  revalidatePath("/log");
}
