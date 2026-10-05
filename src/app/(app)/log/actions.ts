"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { logEntrySchema, uuidSchema } from "@/lib/validation/schemas";

export type AddLogEntryResult = { error?: string };

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

  if (error) {
    return { error: "Toevoegen is niet gelukt. Probeer het opnieuw." };
  }

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
