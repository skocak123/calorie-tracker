import { describe, expect, it } from "vitest";

import { addDays, formatDayLabel, todayISO } from "./dates";

describe("todayISO", () => {
  it("uses Dutch time, not UTC", () => {
    // 23:30 UTC on 4 October is already 5 October in Amsterdam (UTC+2).
    expect(todayISO(new Date("2026-10-04T23:30:00Z"))).toBe("2026-10-05");
  });
});

describe("addDays", () => {
  it("moves across month and year boundaries", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2027-01-01", -1)).toBe("2026-12-31");
  });

  it("handles the switch to winter time", () => {
    expect(addDays("2026-10-25", 1)).toBe("2026-10-26");
  });
});

describe("formatDayLabel", () => {
  const today = "2026-10-05";

  it("uses relative names around today", () => {
    expect(formatDayLabel("2026-10-05", today)).toBe("Vandaag");
    expect(formatDayLabel("2026-10-04", today)).toBe("Gisteren");
    expect(formatDayLabel("2026-10-06", today)).toBe("Morgen");
  });

  it("shows weekday and date for other days", () => {
    expect(formatDayLabel("2026-10-01", today)).toBe("donderdag 1 oktober");
  });
});
