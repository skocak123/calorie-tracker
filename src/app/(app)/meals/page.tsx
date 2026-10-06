import Link from "next/link";

import { MealCard } from "@/components/meals/MealCard";
import { buttonStyles } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth";
import { getMeals } from "@/lib/meals";

export default async function MealsPage() {
  const user = await requireUser();
  const meals = await getMeals(user.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Maaltijden</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Combineer producten tot een vaste maaltijd en log hem in één keer.
          </p>
        </div>
        <Link href="/meals/new" className={buttonStyles("primary")}>
          Nieuwe maaltijd
        </Link>
      </div>

      {meals.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Je hebt nog geen maaltijden.{" "}
          <Link href="/meals/new" className="text-emerald-700 hover:underline dark:text-emerald-400">
            Maak je eerste maaltijd.
          </Link>
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      )}
    </div>
  );
}
