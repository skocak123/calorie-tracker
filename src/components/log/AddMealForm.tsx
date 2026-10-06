"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { addMealToLog } from "@/app/(app)/log/actions";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import type { FoodNutrition } from "@/lib/foods";
import type { MealType } from "@/lib/meal-types";
import { totalMacros } from "@/lib/nutrition/calculate";

import { MacroTotals } from "./MacroTotals";
import { MealTypeSelect } from "./MealTypeSelect";

export type MealOption = {
  id: string;
  name: string;
  items: { grams: number; food: FoodNutrition }[];
};

type AddMealFormProps = {
  date: string;
  meals: MealOption[];
  mealType: MealType;
  onMealTypeChange: (value: MealType) => void;
  onDone: () => void;
};

const PORTIONS = [
  { value: "0.5", label: "½ portie" },
  { value: "1", label: "1 portie" },
  { value: "1.5", label: "1½ portie" },
  { value: "2", label: "2 porties" },
  { value: "3", label: "3 porties" },
];

export function AddMealForm({ date, meals, mealType, onMealTypeChange, onDone }: AddMealFormProps) {
  const [mealId, setMealId] = useState(meals[0]?.id ?? "");
  const [portions, setPortions] = useState("1");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  if (meals.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        Je hebt nog geen maaltijden.{" "}
        <Link href="/meals/new" className="text-emerald-700 hover:underline dark:text-emerald-400">
          Maak er een aan.
        </Link>
      </p>
    );
  }

  const meal = meals.find((item) => item.id === mealId) ?? meals[0];
  const preview = totalMacros(meal.items, Number(portions));

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await addMealToLog(formData);
      if (result.error) setError(result.error);
      else onDone();
    });
  }

  return (
    <form action={submit} className="flex flex-col gap-4">
      <input type="hidden" name="date" value={date} />

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="mealId">Maaltijd</Label>
          <Select id="mealId" name="mealId" value={meal.id} onChange={(event) => setMealId(event.target.value)}>
            {meals.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="portions">Hoeveel</Label>
          <Select id="portions" name="portions" value={portions} onChange={(event) => setPortions(event.target.value)}>
            {PORTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <MealTypeSelect value={mealType} onChange={onMealTypeChange} />
      </div>

      <p className="text-sm text-zinc-500">{meal.items.map((item) => item.food.name).join(", ")}</p>
      <MacroTotals macros={preview} />

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Bezig..." : "Toevoegen"}
      </Button>
    </form>
  );
}
