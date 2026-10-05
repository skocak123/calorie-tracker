import { describe, expect, it } from "vitest";

import {
  ageOn,
  bmiCategory,
  calculateBmi,
  calculateBmr,
  nutritionPlan,
  type BodyStats,
} from "./plan";

const TODAY = "2026-10-05";

// Man, 20 years old, 180 cm, 75 kg, sports 3-5 times a week.
const man: BodyStats = {
  sex: "male",
  birthDate: "2006-01-15",
  heightCm: 180,
  weightKg: 75,
  activityLevel: "moderate",
  goal: "maintain",
};

describe("ageOn", () => {
  it("counts full years", () => {
    expect(ageOn("2006-01-15", TODAY)).toBe(20);
  });

  it("subtracts a year before the birthday", () => {
    expect(ageOn("2006-10-06", TODAY)).toBe(19);
    expect(ageOn("2006-10-05", TODAY)).toBe(20);
  });
});

describe("BMI", () => {
  it("is weight divided by height squared", () => {
    expect(calculateBmi(75, 180)).toBeCloseTo(23.15, 2);
  });

  it("uses the WHO categories", () => {
    expect(bmiCategory(18.4)).toBe("Ondergewicht");
    expect(bmiCategory(18.5)).toBe("Gezond gewicht");
    expect(bmiCategory(25)).toBe("Overgewicht");
    expect(bmiCategory(30)).toBe("Obesitas");
  });
});

describe("calculateBmr (Mifflin-St Jeor)", () => {
  it("matches the formula for men", () => {
    // 10*75 + 6.25*180 - 5*20 + 5
    expect(calculateBmr("male", 75, 180, 20)).toBe(1780);
  });

  it("matches the formula for women", () => {
    // 10*60 + 6.25*165 - 5*30 - 161
    expect(calculateBmr("female", 60, 165, 30)).toBeCloseTo(1320.25);
  });
});

describe("nutritionPlan", () => {
  it("multiplies BMR by the activity factor", () => {
    expect(nutritionPlan(man, TODAY).tdee).toBeCloseTo(1780 * 1.55);
  });

  it("adjusts calories for the goal", () => {
    const tdee = 1780 * 1.55;
    const kcalFor = (goal: BodyStats["goal"]) => nutritionPlan({ ...man, goal }, TODAY).targets.kcal;

    expect(kcalFor("maintain")).toBe(Math.round(tdee / 10) * 10);
    expect(kcalFor("cut_fast")).toBe(Math.round((tdee * 0.75) / 10) * 10);
    expect(kcalFor("cut_slow")).toBe(Math.round((tdee * 0.85) / 10) * 10);
    expect(kcalFor("bulk_slow")).toBe(Math.round((tdee * 1.05) / 10) * 10);
    expect(kcalFor("bulk_fast")).toBe(Math.round((tdee * 1.15) / 10) * 10);
  });

  it("uses more protein when cutting", () => {
    expect(nutritionPlan(man, TODAY).targets.protein).toBe(135); // 1.8 g/kg
    expect(nutritionPlan({ ...man, goal: "cut_slow" }, TODAY).targets.protein).toBe(165); // 2.2 g/kg
  });

  it("gets 25% of calories from fat and the rest from carbs", () => {
    const { targets } = nutritionPlan(man, TODAY);
    const kcalFromMacros = targets.protein * 4 + targets.carbs * 4 + targets.fat * 9;

    expect((targets.fat * 9) / targets.kcal).toBeCloseTo(0.25, 1);
    expect(Math.abs(kcalFromMacros - targets.kcal)).toBeLessThan(15);
  });

  it("never goes below the safety minimum", () => {
    const small: BodyStats = {
      sex: "female",
      birthDate: "1986-01-01",
      heightCm: 155,
      weightKg: 48,
      activityLevel: "sedentary",
      goal: "cut_fast",
    };
    const plan = nutritionPlan(small, TODAY);

    expect(plan.targets.kcal).toBe(1200);
    expect(plan.hitMinimum).toBe(true);
  });

  it("bases protein on the weight at BMI 25 with obesity", () => {
    const heavy = { ...man, weightKg: 130 }; // BMI 40
    // 1.8 g/kg * (25 * 1.8 m * 1.8 m = 81 kg) = 145.8 g instead of 234 g
    expect(nutritionPlan(heavy, TODAY).targets.protein).toBe(146);
  });
});
