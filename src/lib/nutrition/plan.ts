// Calculates BMI, energy needs and daily targets from a user's body stats.
// Sources: Mifflin-St Jeor (1990), ISSN protein position stand (2017),
// Helms et al. JISSN (2014), Iraki et al. (2019), EFSA fat reference intake.

export type Sex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Goal = "cut_fast" | "cut_slow" | "maintain" | "bulk_slow" | "bulk_fast";

export const ACTIVITY_LEVELS: {
  value: ActivityLevel;
  label: string;
  description: string;
  factor: number;
}[] = [
  { value: "sedentary", label: "Zittend", description: "Weinig beweging, (bijna) niet sporten", factor: 1.2 },
  { value: "light", label: "Licht actief", description: "1–3 keer per week sporten", factor: 1.375 },
  { value: "moderate", label: "Gemiddeld actief", description: "3–5 keer per week sporten", factor: 1.55 },
  { value: "active", label: "Zeer actief", description: "6–7 keer per week sporten", factor: 1.725 },
  { value: "very_active", label: "Extreem actief", description: "Zwaar fysiek werk én dagelijks trainen", factor: 1.9 },
];

export const GOALS: { value: Goal; label: string; description: string; adjustment: number }[] = [
  { value: "cut_fast", label: "Snel afvallen", description: "Cutten, ongeveer 1% van je gewicht per week", adjustment: -0.25 },
  { value: "cut_slow", label: "Rustig afvallen", description: "Cutten, ongeveer 0,5% per week, beste voor spierbehoud", adjustment: -0.15 },
  { value: "maintain", label: "Gewicht behouden", description: "Evenveel eten als je verbruikt", adjustment: 0 },
  { value: "bulk_slow", label: "Rustig aankomen", description: "Lean bulk, weinig vetopbouw, voor gevorderden", adjustment: 0.05 },
  { value: "bulk_fast", label: "Snel aankomen", description: "Bulken, snellere groei, voor beginners", adjustment: 0.15 },
];

export type BodyStats = {
  sex: Sex;
  birthDate: string;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
};

export type NutritionPlan = {
  age: number;
  bmi: number;
  bmiCategory: string;
  bmr: number;
  tdee: number;
  targets: { kcal: number; protein: number; carbs: number; fat: number };
  hitMinimum: boolean;
};

// Common safety floor for self-guided diets.
const MIN_KCAL: Record<Sex, number> = { male: 1500, female: 1200 };
const FAT_SHARE = 0.25;

export function ageOn(birthDate: string, today: string): number {
  const [birthYear, birthMonth, birthDay] = birthDate.split("-").map(Number);
  const [year, month, day] = today.split("-").map(Number);
  const hadBirthday = month > birthMonth || (month === birthMonth && day >= birthDay);

  return year - birthYear - (hadBirthday ? 0 : 1);
}

export function calculateBmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

// WHO categories.
export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Ondergewicht";
  if (bmi < 25) return "Gezond gewicht";
  if (bmi < 30) return "Overgewicht";
  return "Obesitas";
}

// Mifflin-St Jeor: resting energy use in kcal per day.
export function calculateBmr(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

export function nutritionPlan(stats: BodyStats, today: string): NutritionPlan {
  const age = ageOn(stats.birthDate, today);
  const bmi = calculateBmi(stats.weightKg, stats.heightCm);
  const bmr = calculateBmr(stats.sex, stats.weightKg, stats.heightCm, age);
  const tdee = bmr * activityFactor(stats.activityLevel);

  const adjusted = tdee * (1 + goalAdjustment(stats.goal));
  const kcal = Math.max(adjusted, MIN_KCAL[stats.sex]);

  // Protein per kg: higher in a deficit to keep muscle (ISSN, Helms).
  // With obesity, use the weight at BMI 25 to avoid unrealistic targets.
  const proteinPerKg = stats.goal.startsWith("cut") ? 2.2 : 1.8;
  const heightM = stats.heightCm / 100;
  const proteinWeight = bmi >= 30 ? 25 * heightM * heightM : stats.weightKg;
  const protein = proteinPerKg * proteinWeight;

  const fat = (kcal * FAT_SHARE) / 9;
  const carbs = Math.max(0, (kcal - protein * 4 - fat * 9) / 4);

  return {
    age,
    bmi,
    bmiCategory: bmiCategory(bmi),
    bmr,
    tdee,
    targets: {
      kcal: Math.round(kcal / 10) * 10,
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
    },
    hitMinimum: adjusted < MIN_KCAL[stats.sex],
  };
}

function activityFactor(level: ActivityLevel) {
  return ACTIVITY_LEVELS.find((item) => item.value === level)!.factor;
}

function goalAdjustment(goal: Goal) {
  return GOALS.find((item) => item.value === goal)!.adjustment;
}
