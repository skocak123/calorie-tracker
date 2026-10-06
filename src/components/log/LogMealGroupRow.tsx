import { deleteLogGroup } from "@/app/(app)/log/actions";
import { formatNumber } from "@/lib/format";
import type { LogEntry } from "@/lib/log";
import { macrosForAmount, totalMacros } from "@/lib/nutrition/calculate";

import { MacroTotals } from "./MacroTotals";

type LogMealGroupRowProps = {
  groupId: string;
  name: string;
  entries: LogEntry[];
};

// A logged meal shown as one line; click to see its ingredients.
export function LogMealGroupRow({ groupId, name, entries }: LogMealGroupRowProps) {
  return (
    <li className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1 py-3">
      <details className="group min-w-0 flex-1">
        <summary className="cursor-pointer list-none">
          <p className="font-medium">
            <span className="mr-1 inline-block text-zinc-400 transition-transform group-open:rotate-90">›</span>
            {name}
            <span className="font-normal text-zinc-500"> · {entries.length} producten</span>
          </p>
          <MacroTotals macros={totalMacros(entries)} />
        </summary>

        <ul className="mt-2 flex flex-col gap-1 border-l-2 border-zinc-200 pl-3 text-sm dark:border-zinc-800">
          {entries.map((entry) => (
            <li key={entry.id} className="text-zinc-600 dark:text-zinc-400">
              {entry.food.name} · {formatNumber(entry.grams)} g ·{" "}
              {formatNumber(Math.round(macrosForAmount(entry.food, entry.grams).kcal))} kcal
            </li>
          ))}
        </ul>
      </details>

      <form action={deleteLogGroup.bind(null, groupId)}>
        <button type="submit" className="text-sm text-zinc-500 hover:text-red-600 hover:underline">
          Verwijderen
        </button>
      </form>
    </li>
  );
}
