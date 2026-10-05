import { formatNumber } from "@/lib/format";
import type { Macros } from "@/lib/nutrition/calculate";

export function MacroTotals({ macros }: { macros: Macros }) {
  const grams = [
    { label: "Eiwit", value: macros.protein },
    { label: "Koolh.", value: macros.carbs },
    { label: "Vet", value: macros.fat },
  ];

  return (
    <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
      <span className="font-medium">{formatNumber(Math.round(macros.kcal))} kcal</span>
      {grams.map((item) => (
        <span key={item.label} className="text-zinc-600 dark:text-zinc-400">
          {item.label} {formatNumber(item.value)} g
        </span>
      ))}
    </p>
  );
}
