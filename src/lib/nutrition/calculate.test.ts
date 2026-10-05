import { describe, expect, it } from "vitest";

import { EMPTY_MACROS, macrosForAmount, sumMacros } from "./calculate";

const chicken = { kcal: 107, protein: 23.5, carbs: 0, fat: 1.4, fiber: null };
const oats = { kcal: 372, protein: 13.5, carbs: 58.7, fat: 7, fiber: 10.1 };

describe("macrosForAmount", () => {
  it("returns the values per 100 g for 100 g", () => {
    expect(macrosForAmount(chicken, 100)).toEqual({ ...chicken, fiber: 0 });
  });

  it("scales linearly with the amount", () => {
    expect(macrosForAmount({ ...chicken, protein: 20 }, 150).protein).toBe(30);
    expect(macrosForAmount({ ...chicken, protein: 20 }, 50).protein).toBe(10);
  });

  it("handles decimals", () => {
    const result = macrosForAmount(oats, 45);
    expect(result.kcal).toBeCloseTo(167.4);
    expect(result.fiber).toBeCloseTo(4.545);
  });

  it("treats missing fiber as 0", () => {
    expect(macrosForAmount(chicken, 200).fiber).toBe(0);
  });

  it("returns 0 for 0 g", () => {
    expect(macrosForAmount(oats, 0)).toEqual(EMPTY_MACROS);
  });
});

describe("sumMacros", () => {
  it("returns 0 for an empty list", () => {
    expect(sumMacros([])).toEqual(EMPTY_MACROS);
  });

  it("adds up all values", () => {
    const total = sumMacros([macrosForAmount(chicken, 150), macrosForAmount(oats, 50)]);
    expect(total.kcal).toBeCloseTo(160.5 + 186);
    expect(total.protein).toBeCloseTo(35.25 + 6.75);
  });
});
