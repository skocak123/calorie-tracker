import { z } from "zod";

import { todayISO } from "@/lib/dates";
import { ageOn } from "@/lib/nutrition/plan";

const email = z.email("Vul een geldig e-mailadres in.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Vul je wachtwoord in."),
});

export const registerSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Vul je naam in.")
    .max(50, "Je naam mag maximaal 50 tekens lang zijn."),
  email,
  password: z
    .string()
    .min(8, "Je wachtwoord moet minimaal 8 tekens lang zijn.")
    .max(72, "Je wachtwoord mag maximaal 72 tekens lang zijn."),
});

// Accepts both "2,5" and "2.5".
function amount(label: string, max: number) {
  return z
    .string()
    .trim()
    .min(1, `Vul ${label.toLowerCase()} in.`)
    .transform((value) => Number(value.replace(",", ".")))
    .pipe(
      z
        .number({ error: `${label} moet een getal zijn.` })
        .min(0, `${label} kan niet negatief zijn.`)
        .max(max, `${label} kan niet meer dan ${max} zijn.`),
    );
}

function optionalAmount(label: string, max: number) {
  return z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : Number(value.replace(",", "."))))
    .pipe(
      z
        .number({ error: `${label} moet een getal zijn.` })
        .min(0, `${label} kan niet negatief zijn.`)
        .max(max, `${label} kan niet meer dan ${max} zijn.`)
        .nullable(),
    );
}

export const foodSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Vul een naam in.")
      .max(100, "De naam mag maximaal 100 tekens lang zijn."),
    brand: z
      .string()
      .trim()
      .max(100, "Het merk mag maximaal 100 tekens lang zijn.")
      .transform((value) => value || null),
    kcal: amount("Calorieën", 1000),
    protein: amount("Eiwit", 100),
    carbs: amount("Koolhydraten", 100),
    fat: amount("Vet", 100),
    fiber: optionalAmount("Vezels", 100),
  })
  .refine((food) => food.protein + food.carbs + food.fat + (food.fiber ?? 0) <= 100, {
    message: "Eiwit, koolhydraten, vet en vezels samen kunnen niet meer zijn dan 100 g.",
  });

export const uuidSchema = z.uuid();

export const logEntrySchema = z.object({
  date: z.iso.date("Ongeldige datum."),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"], "Kies een maaltijdmoment."),
  foodId: z.uuid("Kies een product."),
  grams: z
    .string()
    .trim()
    .min(1, "Vul het aantal gram in.")
    .transform((value) => Number(value.replace(",", ".")))
    .pipe(
      z
        .number({ error: "Gram moet een getal zijn." })
        .gt(0, "Vul meer dan 0 gram in.")
        .max(5000, "Maximaal 5000 gram."),
    ),
});

function measurement(label: string, min: number, max: number, unit: string) {
  return z
    .string()
    .trim()
    .min(1, `Vul je ${label.toLowerCase()} in.`)
    .transform((value) => Number(value.replace(",", ".")))
    .pipe(
      z
        .number({ error: `${label} moet een getal zijn.` })
        .min(min, `${label} moet tussen ${min} en ${max} ${unit} liggen.`)
        .max(max, `${label} moet tussen ${min} en ${max} ${unit} liggen.`),
    );
}

export const profileSchema = z.object({
  sex: z.enum(["male", "female"], "Kies je geslacht."),
  birthDate: z.iso.date("Vul je geboortedatum in.").refine((date) => {
    const age = ageOn(date, todayISO());
    return age >= 16 && age <= 100;
  }, "Je moet tussen 16 en 100 jaar oud zijn."),
  heightCm: measurement("Lengte", 100, 250, "cm"),
  weightKg: measurement("Gewicht", 30, 300, "kg"),
  activityLevel: z.enum(
    ["sedentary", "light", "moderate", "active", "very_active"],
    "Kies hoe actief je bent.",
  ),
  goal: z.enum(["cut_fast", "cut_slow", "maintain", "bulk_slow", "bulk_fast"], "Kies je doel."),
});
