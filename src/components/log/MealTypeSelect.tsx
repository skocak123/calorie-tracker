import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { MEAL_TYPES, type MealType } from "@/lib/meal-types";

type MealTypeSelectProps = {
  value: MealType;
  onChange: (value: MealType) => void;
};

// Pre-filled from the time of day by the parent; the user can still change it.
export function MealTypeSelect({ value, onChange }: MealTypeSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="mealType">Maaltijdmoment</Label>
      <Select
        id="mealType"
        name="mealType"
        value={value}
        onChange={(event) => onChange(event.target.value as MealType)}
      >
        {MEAL_TYPES.map((meal) => (
          <option key={meal.value} value={meal.value}>
            {meal.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
