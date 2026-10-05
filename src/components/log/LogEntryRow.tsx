import { deleteLogEntry } from "@/app/(app)/log/actions";
import { formatNumber } from "@/lib/format";
import type { LogEntry } from "@/lib/log";
import { macrosForAmount } from "@/lib/nutrition/calculate";

import { MacroTotals } from "./MacroTotals";

export function LogEntryRow({ entry }: { entry: LogEntry }) {
  const macros = macrosForAmount(entry.food, entry.grams);

  return (
    <li className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1 py-3">
      <div className="min-w-0">
        <p className="font-medium">
          {entry.food.name}
          {entry.food.brand && <span className="font-normal text-zinc-500"> · {entry.food.brand}</span>}
          <span className="font-normal text-zinc-500"> · {formatNumber(entry.grams)} g</span>
        </p>
        <MacroTotals macros={macros} />
      </div>

      <form action={deleteLogEntry.bind(null, entry.id)}>
        <button type="submit" className="text-sm text-zinc-500 hover:text-red-600 hover:underline">
          Verwijderen
        </button>
      </form>
    </li>
  );
}
