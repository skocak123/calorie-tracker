import { describe, expect, it } from "vitest";

import { mealTypeForTime } from "./meal-types";

const at = (time: string) => new Date(`2026-10-05T${time}:00`);

describe("mealTypeForTime", () => {
  it.each([
    ["04:00", "breakfast"],
    ["08:15", "breakfast"],
    ["09:59", "breakfast"],
    ["10:00", "snack"],
    ["11:29", "snack"],
    ["11:30", "lunch"],
    ["13:59", "lunch"],
    ["14:00", "snack"],
    ["16:59", "snack"],
    ["17:00", "dinner"],
    ["20:29", "dinner"],
    ["20:30", "snack"],
    ["23:45", "snack"],
    ["00:30", "snack"],
    ["03:59", "snack"],
  ])("%s -> %s", (time, expected) => {
    expect(mealTypeForTime(at(time))).toBe(expected);
  });
});
