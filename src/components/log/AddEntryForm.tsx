"use client";

import { useState, useTransition } from "react";

import { addLogEntry } from "@/app/(app)/log/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { MEAL_TYPES, mealTypeForTime, type MealType } from "@/lib/meal-types";
import { macrosForAmount } from "@/lib/nutrition/calculate";

import { FoodPicker, type FoodOption } from "./FoodPicker";
import { MacroTotals } from "./MacroTotals";

const DEFAULT_GRAMS = "100";

export function AddEntryForm({ date }: { date: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mealType, setMealType] = useState<MealType>("snack");
  const [food, setFood] = useState<FoodOption | null>(null);
  const [grams, setGrams] = useState(DEFAULT_GRAMS);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  // Live preview while typing, e.g. 50 g of 20 g protein per 100 g -> 10 g protein.
  const amount = Number(grams.replace(",", "."));
  const preview = food && amount > 0 ? macrosForAmount(food, amount) : null;

  function open() {
    setMealType(mealTypeForTime(new Date()));
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
    setFood(null);
    setGrams(DEFAULT_GRAMS);
    setError(undefined);
  }

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await addLogEntry(formData);
      if (result.error) {
        setError(result.error);
      } else {
        close();
      }
    });
  }

  if (!isOpen) {
    return (
      <Button type="button" onClick={open} className="self-start">
        + Toevoegen
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      {food ? (
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

            {/* Pre-filled from the time of day; the user can still change it. */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mealType">Maaltijdmoment</Label>
              <Select
                id="mealType"
                name="mealType"
                value={mealType}
                onChange={(event) => setMealType(event.target.value as MealType)}
              >
                {MEAL_TYPES.map((meal) => (
                  <option key={meal.value} value={meal.value}>
                    {meal.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {preview && <MacroTotals macros={preview} />}

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={pending || !preview}>
              {pending ? "Bezig..." : "Toevoegen"}
            </Button>
            <Button type="button" variant="secondary" onClick={close}>
              Annuleren
            </Button>
          </div>
        </form>
      ) : (
        <>
          <FoodPicker onSelect={setFood} />
          <Button type="button" variant="secondary" onClick={close} className="self-start">
            Annuleren
          </Button>
        </>
      )}
    </div>
  );
}
