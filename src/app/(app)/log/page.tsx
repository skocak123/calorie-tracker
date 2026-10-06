import { AddEntryForm } from "@/components/log/AddEntryForm";
import { DayPicker } from "@/components/log/DayPicker";
import { MacroTotals } from "@/components/log/MacroTotals";
import { MealSection } from "@/components/log/MealSection";
import { Card } from "@/components/ui/Card";
import { requireUser } from "@/lib/auth";
import { todayISO } from "@/lib/dates";
import { getLogEntries } from "@/lib/log";
import { getMeals } from "@/lib/meals";
import { MEAL_TYPES } from "@/lib/meal-types";
import { totalMacros } from "@/lib/nutrition/calculate";
import { logEntrySchema } from "@/lib/validation/schemas";

const dateSchema = logEntrySchema.shape.date;

export default async function LogPage({ searchParams }: PageProps<"/log">) {
  const user = await requireUser();
  const today = todayISO();

  // ?date=2026-10-05, or today when missing or invalid.
  const { date: dateParam } = await searchParams;
  const parsedDate = dateSchema.safeParse(dateParam);
  const date = parsedDate.success ? parsedDate.data : today;

  const [entries, meals] = await Promise.all([getLogEntries(user.id, date), getMeals(user.id)]);
  const dayTotal = totalMacros(entries);

  const sections = MEAL_TYPES.map((meal) => ({
    ...meal,
    entries: entries.filter((entry) => entry.meal_type === meal.value),
  })).filter((section) => section.entries.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <DayPicker date={date} today={today} />

      {/* key resets the form when switching days */}
      <AddEntryForm key={date} date={date} meals={meals} />

      {sections.length === 0 && (
        <p className="text-sm text-zinc-500">Nog niets gelogd op deze dag.</p>
      )}

      {sections.map((section) => (
        <MealSection key={section.value} label={section.label} entries={section.entries} />
      ))}

      <Card className="flex flex-col gap-2 border-emerald-600/40">
        <h2 className="text-lg font-semibold">Dagtotaal</h2>
        <MacroTotals macros={dayTotal} />
      </Card>
    </div>
  );
}
