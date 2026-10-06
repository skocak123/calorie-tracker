"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { mealTypeForTime, type MealType } from "@/lib/meal-types";

import { AddFoodForm } from "./AddFoodForm";
import { AddMealForm, type MealOption } from "./AddMealForm";

type Tab = "food" | "meal";

const TABS: { value: Tab; label: string }[] = [
  { value: "food", label: "Product" },
  { value: "meal", label: "Maaltijd" },
];

export function AddEntryForm({ date, meals }: { date: string; meals: MealOption[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("food");
  const [mealType, setMealType] = useState<MealType>("snack");

  function open() {
    setMealType(mealTypeForTime(new Date()));
    setTab("food");
    setIsOpen(true);
  }

  if (!isOpen) {
    return (
      <Button type="button" onClick={open} className="self-start">
        + Toevoegen
      </Button>
    );
  }

  const formProps = { date, mealType, onMealTypeChange: setMealType, onDone: () => setIsOpen(false) };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div role="tablist" className="flex gap-1 self-start rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={tab === item.value}
            onClick={() => setTab(item.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              tab === item.value
                ? "bg-white shadow-sm dark:bg-zinc-800"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "food" ? <AddFoodForm {...formProps} /> : <AddMealForm {...formProps} meals={meals} />}

      <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} className="self-start">
        Annuleren
      </Button>
    </div>
  );
}
