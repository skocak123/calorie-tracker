import { MealBuilder } from "@/components/meals/MealBuilder";
import { Card } from "@/components/ui/Card";

import { createMeal } from "../actions";

export default function NewMealPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Nieuwe maaltijd</h1>
      <Card>
        <MealBuilder action={createMeal} submitLabel="Maaltijd opslaan" />
      </Card>
    </div>
  );
}
