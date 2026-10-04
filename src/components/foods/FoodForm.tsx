"use client";

import { useActionState } from "react";

import type { FoodFormState } from "@/app/(app)/foods/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

type FoodFormProps = {
  action: (state: FoodFormState, formData: FormData) => Promise<FoodFormState>;
  defaultValues?: Record<string, string>;
  submitLabel: string;
};

const nutrientFields = [
  { name: "kcal", label: "Calorieën (kcal)", required: true },
  { name: "protein", label: "Eiwit (g)", required: true },
  { name: "carbs", label: "Koolhydraten (g)", required: true },
  { name: "fat", label: "Vet (g)", required: true },
  { name: "fiber", label: "Vezels (g)", required: false },
];

export function FoodForm({ action, defaultValues = {}, submitLabel }: FoodFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const value = (field: string) => state.values?.[field] ?? defaultValues[field];

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Naam</Label>
          <Input id="name" name="name" maxLength={100} defaultValue={value("name")} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="brand">Merk (optioneel)</Label>
          <Input id="brand" name="brand" maxLength={100} defaultValue={value("brand")} />
        </div>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-medium">Voedingswaarden per 100 g</legend>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {nutrientFields.map((field) => (
            <div key={field.name} className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>{field.label}</Label>
              <Input
                id={field.name}
                name={field.name}
                inputMode="decimal"
                defaultValue={value(field.name)}
                required={field.required}
              />
            </div>
          ))}
        </div>
      </fieldset>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Bezig met opslaan..." : submitLabel}
      </Button>
    </form>
  );
}
