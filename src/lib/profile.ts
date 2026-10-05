import "server-only";

import { cache } from "react";

import type { ActivityLevel, BodyStats, Goal, Sex } from "@/lib/nutrition/plan";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  display_name: string;
  sex: Sex | null;
  birth_date: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  activity_level: ActivityLevel | null;
  goal: Goal | null;
};

// cache(): the layout and the page can both call this with one database query.
export const getProfile = cache(async (userId: string): Promise<Profile> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, sex, birth_date, height_cm, weight_kg, activity_level, goal")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
});

// Returns null until the user has filled in all body stats.
export function toBodyStats(profile: Profile): BodyStats | null {
  const { sex, birth_date, height_cm, weight_kg, activity_level, goal } = profile;
  if (!sex || !birth_date || !height_cm || !weight_kg || !activity_level || !goal) return null;

  return {
    sex,
    birthDate: birth_date,
    heightCm: height_cm,
    weightKg: weight_kg,
    activityLevel: activity_level,
    goal,
  };
}
