export const MEAL_TYPES = [
  { value: "breakfast", label: "Ontbijt" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Avondeten" },
  { value: "snack", label: "Tussendoor" },
] as const;

export type MealType = (typeof MEAL_TYPES)[number]["value"];

// [start time in minutes since midnight, meal type], in order.
const SCHEDULE: [number, MealType][] = [
  [4 * 60, "breakfast"], // 04:00
  [10 * 60, "snack"], // 10:00
  [11 * 60 + 30, "lunch"], // 11:30
  [14 * 60, "snack"], // 14:00
  [17 * 60, "dinner"], // 17:00
  [20 * 60 + 30, "snack"], // 20:30
];

// Guesses the meal type from the time of day, e.g. 12:15 -> lunch.
export function mealTypeForTime(time: Date): MealType {
  const minutes = time.getHours() * 60 + time.getMinutes();
  const current = SCHEDULE.findLast(([start]) => minutes >= start);

  // Before 04:00 counts as a late-night snack.
  return current ? current[1] : "snack";
}
