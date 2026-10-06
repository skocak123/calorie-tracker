"use client";

import { useState, useTransition } from "react";

import type { MealActionResult, MealInput } from "@/app/(app)/meals/actions";
import { FoodPicker, type FoodOption } from "@/components/log/FoodPicker";
import { MacroTotals } from "@/components/log/MacroTotals";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { macrosForAmount, totalMacros } from "@/lib/nutrition/calculate";

type Ingredient = { key: number; food: FoodOption; grams: string };

type MealBuilderProps = {
  action: (input: MealInput) => Promise<MealActionResult>;
  initialName?: string;
  initialItems?: { food: FoodOption; grams: number }[];
  submitLabel: string;
};

const DEFAULT_GRAMS = "100";

// Accepts "2,5" as well as "2.5"; invalid input counts as 0 g.
function parseGrams(value: string) {
  const grams = Number(value.replace(",", "."));
  return Number.isFinite(grams) && grams > 0 ? grams : 0;
}

export function MealBuilder({ action, initialName = "", initialItems = [], submitLabel }: MealBuilderProps) {
  const [name, setName] = useState(initialName);
  const [ingredients, setIngredients] = useState<Ingredient[]>(() =>
    initialItems.map((item, index) => ({ key: index, food: item.food, grams: String(item.grams) })),
  );
  const [nextKey, setNextKey] = useState(initialItems.length);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const total = totalMacros(
    ingredients.map((ingredient) => ({ food: ingredient.food, grams: parseGrams(ingredient.grams) })),
  );

  function addIngredient(food: FoodOption) {
    setIngredients((current) => [...current, { key: nextKey, food, grams: DEFAULT_GRAMS }]);
    // A new key also resets the search box.
    setNextKey((key) => key + 1);
  }

  function updateGrams(key: number, grams: string) {
    setIngredients((current) => current.map((item) => (item.key === key ? { ...item, grams } : item)));
  }

  function removeIngredient(key: number) {
    setIngredients((current) => current.filter((item) => item.key !== key));
  }

  function save() {
    setError(undefined);
    startTransition(async () => {
      const result = await action({
        name,
        items: ingredients.map((item) => ({ foodId: item.food.id, grams: parseGrams(item.grams) })),
      });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="mealName">Naam</Label>
        <Input
          id="mealName"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Bijvoorbeeld: Mijn wrap"
          maxLength={100}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Product toevoegen</span>
        <FoodPicker key={nextKey} onSelect={addIngredient} />
      </div>

      {ingredients.length > 0 && (
        <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {ingredients.map((item) => (
            <li key={item.key} className="flex flex-wrap items-center justify-between gap-3 p-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {item.food.name}
                  {item.food.brand && <span className="font-normal text-zinc-500"> · {item.food.brand}</span>}
                </p>
                <MacroTotals macros={macrosForAmount(item.food, parseGrams(item.grams))} />
              </div>

              <div className="flex items-center gap-2">
                <Input
                  value={item.grams}
                  onChange={(event) => updateGrams(item.key, event.target.value)}
                  inputMode="decimal"
                  aria-label={`Gram ${item.food.name}`}
                  className="w-24"
                />
                <span className="text-sm text-zinc-500">g</span>
                <button
                  type="button"
                  onClick={() => removeIngredient(item.key)}
                  className="px-2 text-sm text-zinc-500 hover:text-red-600"
                  aria-label={`${item.food.name} verwijderen`}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-1 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
        <span className="text-sm font-medium">Totaal per portie</span>
        <MacroTotals macros={total} />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <Button type="button" onClick={save} disabled={pending} className="self-start">
        {pending ? "Bezig met opslaan..." : submitLabel}
      </Button>
    </div>
  );
}
