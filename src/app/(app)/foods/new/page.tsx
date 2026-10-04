import { FoodForm } from "@/components/foods/FoodForm";
import { Card } from "@/components/ui/Card";

import { createFood } from "../actions";

export default function NewFoodPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Product toevoegen</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Je product wordt zichtbaar voor alle gebruikers. Alleen jij kunt het wijzigen.
        </p>
      </div>

      <Card>
        <FoodForm action={createFood} submitLabel="Product opslaan" />
      </Card>
    </div>
  );
}
