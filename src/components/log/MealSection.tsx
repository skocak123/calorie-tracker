import { Card } from "@/components/ui/Card";
import type { LogEntry } from "@/lib/log";
import { macrosForAmount, sumMacros } from "@/lib/nutrition/calculate";

import { LogEntryRow } from "./LogEntryRow";
import { MacroTotals } from "./MacroTotals";

type MealSectionProps = {
  label: string;
  entries: LogEntry[];
};

export function MealSection({ label, entries }: MealSectionProps) {
  const subtotal = sumMacros(entries.map((entry) => macrosForAmount(entry.food, entry.grams)));

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">{label}</h2>
        <MacroTotals macros={subtotal} />
      </div>

      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {entries.map((entry) => (
          <LogEntryRow key={entry.id} entry={entry} />
        ))}
      </ul>
    </Card>
  );
}
