import { notFound } from "next/navigation";

import { FoodForm } from "@/components/foods/FoodForm";
import { Card } from "@/components/ui/Card";
import { requireUser } from "@/lib/auth";
import { getFood } from "@/lib/foods";
import { uuidSchema } from "@/lib/validation/schemas";

import { updateFood } from "../actions";

export default async function EditFoodPage({ params }: PageProps<"/foods/[id]">) {
  const user = await requireUser();
  const { id } = await params;

  const food = uuidSchema.safeParse(id).success ? await getFood(id) : null;

  // Only the creator may edit a food, and archived foods can't be edited.
  if (!food || food.created_by !== user.id || food.archived_at) {
    notFound();
  }

  const defaultValues = {
    name: food.name,
    brand: food.brand ?? "",
    kcal: String(food.kcal),
    protein: String(food.protein),
    carbs: String(food.carbs),
    fat: String(food.fat),
    fiber: food.fiber === null ? "" : String(food.fiber),
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Product bewerken</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Wijzigingen gelden voor iedereen die dit product gebruikt. Verwijderen kan alleen via
          support.
        </p>
      </div>

      <Card>
        <FoodForm
          action={updateFood.bind(null, food.id)}
          defaultValues={defaultValues}
          submitLabel="Wijzigingen opslaan"
        />
      </Card>
    </div>
  );
}
