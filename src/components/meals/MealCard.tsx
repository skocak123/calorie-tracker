import Link from "next/link";

import { MacroTotals } from "@/components/log/MacroTotals";
import { Card } from "@/components/ui/Card";
import type { Meal } from "@/lib/meals";
import { totalMacros } from "@/lib/nutrition/calculate";

export function MealCard({ meal }: { meal: Meal }) {
  const count = meal.items.length;

  return (
    <Link href={`/meals/${meal.id}`} className="block">
      <Card className="flex flex-col gap-2 p-4 transition-colors hover:border-emerald-600">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-semibold">{meal.name}</h2>
          <span className="text-sm text-zinc-500">
            {count} {count === 1 ? "product" : "producten"}
          </span>
        </div>
        <p className="truncate text-sm text-zinc-500">
          {meal.items.map((item) => item.food.name).join(", ")}
        </p>
        <MacroTotals macros={totalMacros(meal.items)} />
      </Card>
    </Link>
  );
}
