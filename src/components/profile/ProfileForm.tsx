"use client";

import { useActionState } from "react";

import type { ProfileFormState } from "@/app/(app)/settings/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { ACTIVITY_LEVELS, GOALS } from "@/lib/nutrition/plan";

type ProfileFormProps = {
  action: (state: ProfileFormState, formData: FormData) => Promise<ProfileFormState>;
  defaultValues?: Record<string, string>;
  submitLabel: string;
};

const SEXES = [
  { value: "male", label: "Man" },
  { value: "female", label: "Vrouw" },
];

export function ProfileForm({ action, defaultValues = {}, submitLabel }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const value = (field: string) => state.values?.[field] ?? defaultValues[field];

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-3 font-semibold">Over jou</legend>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Geslacht</span>
          <div className="grid grid-cols-2 gap-2 sm:max-w-xs">
            {SEXES.map((option) => (
              <ChoiceCard
                key={option.value}
                name="sex"
                value={option.value}
                label={option.label}
                defaultChecked={value("sex") === option.value}
              />
            ))}
          </div>
          <p className="text-xs text-zinc-500">Nodig voor de formule van je verbranding.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="birthDate">Geboortedatum</Label>
            <Input id="birthDate" name="birthDate" type="date" defaultValue={value("birthDate")} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="heightCm">Lengte (cm)</Label>
            <Input id="heightCm" name="heightCm" inputMode="decimal" defaultValue={value("heightCm")} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="weightKg">Gewicht (kg)</Label>
            <Input id="weightKg" name="weightKg" inputMode="decimal" defaultValue={value("weightKg")} required />
          </div>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-3 font-semibold">Hoe actief ben je?</legend>
        {ACTIVITY_LEVELS.map((level) => (
          <ChoiceCard
            key={level.value}
            name="activityLevel"
            value={level.value}
            label={level.label}
            description={level.description}
            defaultChecked={value("activityLevel") === level.value}
          />
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-3 font-semibold">Wat is je doel?</legend>
        {GOALS.map((goal) => (
          <ChoiceCard
            key={goal.value}
            name="goal"
            value={goal.value}
            label={goal.label}
            description={goal.description}
            defaultChecked={value("goal") === goal.value}
          />
        ))}
      </fieldset>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">
          {state.success}
        </p>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Bezig met opslaan..." : submitLabel}
      </Button>
    </form>
  );
}

type ChoiceCardProps = {
  name: string;
  value: string;
  label: string;
  description?: string;
  defaultChecked: boolean;
};

// A radio button styled as a card; the border turns green when selected.
function ChoiceCard({ name, value, label, description, defaultChecked }: ChoiceCardProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-300 p-3 hover:bg-zinc-50 has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50 dark:border-zinc-700 dark:hover:bg-zinc-900 dark:has-[:checked]:bg-emerald-950">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        required
        className="mt-1 accent-emerald-600"
      />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {description && <span className="block text-sm text-zinc-500">{description}</span>}
      </span>
    </label>
  );
}
