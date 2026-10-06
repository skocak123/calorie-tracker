"use client";

import { useState, useTransition } from "react";

import { addLogEntry } from "@/app/(app)/log/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import type { MealType } from "@/lib/meal-types";
import { macrosForAmount } from "@/lib/nutrition/calculate";

import { FoodPicker, type FoodOption } from "./FoodPicker";
import { MacroTotals } from "./MacroTotals";
import { MealTypeSelect } from "./MealTypeSelect";

type AddFoodFormProps = {
  date: string;
  mealType: MealType;
  onMealTypeChange: (value: MealType) => void;
  onDone: () => void;
};

export function AddFoodForm({ date, mealType, onMealTypeChange, onDone }: AddFoodFormProps) {
  const [food, setFood] = useState<FoodOption | null>(null);
  const [grams, setGrams] = useState("100");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  // Live preview while typing, e.g. 50 g of 20 g protein per 100 g -> 10 g protein.
  const amount = Number(grams.replace(",", "."));
  const preview = food && amount > 0 ? macrosForAmount(food, amount) : null;

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await addLogEntry(formData);
      if (result.error) setError(result.error);
      else onDone();
    });
  }

  if (!food) {
    return <FoodPicker onSelect={setFood} />;
  }

  return (
    <form action={submit} className="flex flex-col gap-4">
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="foodId" value={food.id} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">
          {food.name}
          {food.brand && <span className="font-normal text-zinc-500"> · {food.brand}</span>}
        </p>
        <button
          type="button"
          onClick={() => setFood(null)}
          className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
        >
          Ander product
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="grams">Hoeveelheid (gram)</Label>
          <Input
            id="grams"
            name="grams"
            inputMode="decimal"
            value={grams}
            onChange={(event) => setGrams(event.target.value)}
            className="w-32"
            autoFocus
            required
          />
        </div>
        <MealTypeSelect value={mealType} onChange={onMealTypeChange} />
      </div>

      {preview && <MacroTotals macros={preview} />}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending || !preview} className="self-start">
        {pending ? "Bezig..." : "Toevoegen"}
      </Button>
    </form>
  );
}
