import { Card } from "@/components/ui/Card";
import type { LogEntry } from "@/lib/log";
import { totalMacros } from "@/lib/nutrition/calculate";

import { LogEntryRow } from "./LogEntryRow";
import { LogMealGroupRow } from "./LogMealGroupRow";
import { MacroTotals } from "./MacroTotals";

type MealSectionProps = {
  label: string;
  entries: LogEntry[];
};

type Row =
  | { kind: "food"; entry: LogEntry }
  | { kind: "meal"; groupId: string; name: string; entries: LogEntry[] };

// Lines logged as one meal (same group_id) become a single row.
function toRows(entries: LogEntry[]): Row[] {
  const rows: Row[] = [];
  const meals = new Map<string, Extract<Row, { kind: "meal" }>>();

  for (const entry of entries) {
    if (!entry.group_id) {
      rows.push({ kind: "food", entry });
      continue;
    }

    let meal = meals.get(entry.group_id);
    if (!meal) {
      meal = { kind: "meal", groupId: entry.group_id, name: entry.meal_name ?? "Maaltijd", entries: [] };
      meals.set(entry.group_id, meal);
      rows.push(meal);
    }
    meal.entries.push(entry);
  }

  return rows;
}

export function MealSection({ label, entries }: MealSectionProps) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">{label}</h2>
        <MacroTotals macros={totalMacros(entries)} />
      </div>

      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {toRows(entries).map((row) =>
          row.kind === "food" ? (
            <LogEntryRow key={row.entry.id} entry={row.entry} />
          ) : (
            <LogMealGroupRow key={row.groupId} groupId={row.groupId} name={row.name} entries={row.entries} />
          ),
        )}
      </ul>
    </Card>
  );
}
