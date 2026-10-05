import Link from "next/link";

import { formatNumber } from "@/lib/format";
import type { Food } from "@/lib/foods";

type FoodListItemProps = {
  food: Food;
  isOwner: boolean;
};

export function FoodListItem({ food, isOwner }: FoodListItemProps) {
  const macros = [
    { label: "Eiwit", value: food.protein },
    { label: "Koolh.", value: food.carbs },
    { label: "Vet", value: food.fat },
  ];

  return (
    <li className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
      <div className="min-w-0">
        <p className="font-medium">{food.name}</p>
        <p className="text-sm text-zinc-500">
          {food.brand}
          {food.brand && food.source === "off" && " · "}
          {food.source === "off" && <span className="text-xs">Open Food Facts</span>}
        </p>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <span className="font-medium">{formatNumber(food.kcal)} kcal</span>
        {macros.map((macro) => (
          <span key={macro.label} className="text-zinc-600 dark:text-zinc-400">
            {macro.label} {formatNumber(macro.value)} g
          </span>
        ))}
        {isOwner && (
          <Link
            href={`/foods/${food.id}`}
            className="font-medium text-emerald-700 hover:underline dark:text-emerald-400"
          >
            Bewerken
          </Link>
        )}
      </div>
    </li>
  );
}
