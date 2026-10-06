import { notFound } from "next/navigation";

import { DeleteMealButton } from "@/components/meals/DeleteMealButton";
import { MealBuilder } from "@/components/meals/MealBuilder";
import { Card } from "@/components/ui/Card";
import { requireUser } from "@/lib/auth";
import { getMeal } from "@/lib/meals";
import { uuidSchema } from "@/lib/validation/schemas";

import { updateMeal } from "../actions";

export default async function EditMealPage({ params }: PageProps<"/meals/[id]">) {
  await requireUser();
  const { id } = await params;

  // RLS returns nothing for someone else's meal, so this is also a 404.
  const meal = uuidSchema.safeParse(id).success ? await getMeal(id) : null;
  if (!meal) notFound();

  const hasArchivedFood = meal.items.some((item) => item.food.archived_at);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Maaltijd bewerken</h1>
        <DeleteMealButton mealId={meal.id} />
      </div>

      {hasArchivedFood && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Een product in deze maaltijd is niet meer beschikbaar. Haal het weg of kies een ander
          product.
        </p>
      )}

      <Card>
        <MealBuilder
          action={updateMeal.bind(null, meal.id)}
          initialName={meal.name}
          initialItems={meal.items.map((item) => ({ food: item.food, grams: item.grams }))}
          submitLabel="Wijzigingen opslaan"
        />
      </Card>
    </div>
  );
}
