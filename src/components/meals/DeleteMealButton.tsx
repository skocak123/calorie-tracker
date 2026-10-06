"use client";

import { deleteMeal } from "@/app/(app)/meals/actions";
import { Button } from "@/components/ui/Button";

export function DeleteMealButton({ mealId }: { mealId: string }) {
  return (
    <form
      action={deleteMeal.bind(null, mealId)}
      onSubmit={(event) => {
        if (!confirm("Maaltijd verwijderen? Wat je al gelogd hebt, blijft in je dagboek staan.")) {
          event.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="secondary">
        Verwijderen
      </Button>
    </form>
  );
}
