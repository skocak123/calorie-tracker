"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validation/schemas";

export type ProfileFormState = {
  error?: string;
  success?: string;
  values?: Record<string, string>;
};

const FIELDS = ["sex", "birthDate", "heightCm", "weightKg", "activityLevel", "goal"];

// "onboarding" goes to the dashboard afterwards, "settings" stays on the page.
export async function saveProfile(
  mode: "onboarding" | "settings",
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const user = await requireUser();
  const values = Object.fromEntries(FIELDS.map((field) => [field, String(formData.get(field) ?? "")]));

  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, values };
  }

  const { sex, birthDate, heightCm, weightKg, activityLevel, goal } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      sex,
      birth_date: birthDate,
      height_cm: heightCm,
      weight_kg: weightKg,
      activity_level: activityLevel,
      goal,
    })
    .eq("id", user.id);

  if (error) {
    return { error: "Opslaan is niet gelukt. Probeer het opnieuw.", values };
  }

  revalidatePath("/", "layout");

  if (mode === "onboarding") {
    redirect("/dashboard");
  }
  return { success: "Je gegevens zijn opgeslagen. Je plan is opnieuw berekend." };
}
