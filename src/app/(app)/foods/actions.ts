"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { foodSchema, uuidSchema } from "@/lib/validation/schemas";

export type FoodFormState = {
  error?: string;
  values?: Record<string, string>;
};

export async function createFood(
  _prevState: FoodFormState,
  formData: FormData,
): Promise<FoodFormState> {
  const user = await requireUser();
  const values = readValues(formData);

  const parsed = foodSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, values };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("foods").insert({ ...parsed.data, created_by: user.id });

  if (error) {
    return { error: "Opslaan is niet gelukt. Probeer het opnieuw.", values };
  }

  revalidatePath("/foods");
  redirect("/foods");
}

export async function updateFood(
  id: string,
  _prevState: FoodFormState,
  formData: FormData,
): Promise<FoodFormState> {
  await requireUser();
  const values = readValues(formData);

  const parsed = foodSchema.safeParse(values);
  if (!uuidSchema.safeParse(id).success || !parsed.success) {
    return { error: parsed.error?.issues[0].message ?? "Onbekend product.", values };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("foods")
    .update(parsed.data)
    .eq("id", id)
    .is("archived_at", null)
    .select("id");

  // RLS returns no rows when the food belongs to someone else.
  if (error || data.length === 0) {
    return { error: "Je kunt alleen je eigen producten wijzigen.", values };
  }

  revalidatePath("/foods");
  redirect("/foods");
}

function readValues(formData: FormData) {
  const fields = ["name", "brand", "kcal", "protein", "carbs", "fat", "fiber"];
  return Object.fromEntries(fields.map((field) => [field, String(formData.get(field) ?? "")]));
}
