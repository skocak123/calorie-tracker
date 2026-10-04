import { describe, expect, it } from "vitest";

import { foodSchema, loginSchema, registerSchema } from "./schemas";

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({ email: "test@voorbeeld.nl", password: "geheim" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "geen-email", password: "geheim" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const valid = { displayName: "Selim", email: "test@voorbeeld.nl", password: "12345678" };

  it("accepts valid input", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("trims the display name", () => {
    const result = registerSchema.parse({ ...valid, displayName: "  Selim  " });
    expect(result.displayName).toBe("Selim");
  });

  it("rejects passwords shorter than 8 characters", () => {
    expect(registerSchema.safeParse({ ...valid, password: "1234567" }).success).toBe(false);
  });

  it("rejects empty names and names over 50 characters", () => {
    expect(registerSchema.safeParse({ ...valid, displayName: "   " }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valid, displayName: "a".repeat(51) }).success).toBe(false);
  });
});

describe("foodSchema", () => {
  const valid = {
    name: "Kipfilet",
    brand: "",
    kcal: "110",
    protein: "23,5",
    carbs: "0",
    fat: "1.5",
    fiber: "",
  };

  it("parses comma and dot decimals", () => {
    const food = foodSchema.parse(valid);
    expect(food.protein).toBe(23.5);
    expect(food.fat).toBe(1.5);
  });

  it("turns empty brand and fiber into null", () => {
    const food = foodSchema.parse(valid);
    expect(food.brand).toBeNull();
    expect(food.fiber).toBeNull();
  });

  it("rejects missing, negative or non-numeric values", () => {
    expect(foodSchema.safeParse({ ...valid, kcal: "" }).success).toBe(false);
    expect(foodSchema.safeParse({ ...valid, protein: "-1" }).success).toBe(false);
    expect(foodSchema.safeParse({ ...valid, fat: "abc" }).success).toBe(false);
  });

  it("rejects macros that add up to more than 100 g", () => {
    const result = foodSchema.safeParse({ ...valid, protein: "60", carbs: "30", fat: "20" });
    expect(result.success).toBe(false);
  });
});
