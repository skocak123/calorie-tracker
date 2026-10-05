import { describe, expect, it } from "vitest";

import { toFood, type OffProduct } from "./openfoodfacts";

const kwark: OffProduct = {
  code: "8710400000000",
  product_name_nl: "Magere kwark",
  product_name: "Low fat quark",
  lang: "nl",
  brands: ["AH", "Albert Heijn"],
  nutriments: {
    "energy-kcal_100g": 59,
    proteins_100g: 10.2,
    carbohydrates_100g: 4,
    fat_100g: 0.2,
  },
};

describe("toFood", () => {
  it("converts a complete product", () => {
    expect(toFood(kwark)).toEqual({
      barcode: "8710400000000",
      name: "Magere kwark",
      brand: "AH",
      kcal: 59,
      protein: 10.2,
      carbs: 4,
      fat: 0.2,
      fiber: null,
    });
  });

  it("uses product_name only when the product language is Dutch", () => {
    const withoutDutchName = { ...kwark, product_name_nl: undefined, product_name: "Kwark" };
    expect(toFood({ ...withoutDutchName, lang: "nl" })?.name).toBe("Kwark");
    expect(toFood({ ...withoutDutchName, lang: "fr" })).toBeNull();
  });

  it("calculates kcal from kJ when kcal is missing", () => {
    const nutriments = { ...kwark.nutriments, "energy-kcal_100g": undefined, "energy-kj_100g": 247 };
    expect(toFood({ ...kwark, nutriments })?.kcal).toBe(59);
  });

  it("accepts comma-separated brands", () => {
    expect(toFood({ ...kwark, brands: "Jumbo, Jumbo Supermarkten" })?.brand).toBe("Jumbo");
  });

  it("rejects products with missing values or an invalid barcode", () => {
    expect(toFood({ ...kwark, nutriments: { ...kwark.nutriments, fat_100g: undefined } })).toBeNull();
    expect(toFood({ ...kwark, code: "abc" })).toBeNull();
  });

  it("rejects products whose calories don't match the macros", () => {
    const nutriments = { ...kwark.nutriments, "energy-kcal_100g": 400 };
    expect(toFood({ ...kwark, nutriments })).toBeNull();
  });

  it("rejects impossible values", () => {
    const nutriments = { ...kwark.nutriments, proteins_100g: 80, carbohydrates_100g: 40 };
    expect(toFood({ ...kwark, nutriments })).toBeNull();
  });
});
