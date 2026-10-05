export type Macros = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

export type NutritionPer100g = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
};

export const EMPTY_MACROS: Macros = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

// value = value per 100 g * grams / 100
export function macrosForAmount(food: NutritionPer100g, grams: number): Macros {
  const factor = grams / 100;

  return {
    kcal: food.kcal * factor,
    protein: food.protein * factor,
    carbs: food.carbs * factor,
    fat: food.fat * factor,
    fiber: (food.fiber ?? 0) * factor,
  };
}

export function sumMacros(list: Macros[]): Macros {
  return list.reduce(
    (total, macros) => ({
      kcal: total.kcal + macros.kcal,
      protein: total.protein + macros.protein,
      carbs: total.carbs + macros.carbs,
      fat: total.fat + macros.fat,
      fiber: total.fiber + macros.fiber,
    }),
    EMPTY_MACROS,
  );
}
