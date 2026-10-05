// Dates are plain "YYYY-MM-DD" strings in Dutch time, so a day never shifts by timezone.
const TIME_ZONE = "Europe/Amsterdam";

export function todayISO(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);
}

export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// "Vandaag", "Gisteren", "Morgen" or e.g. "maandag 5 oktober"
export function formatDayLabel(isoDate: string, today: string): string {
  if (isoDate === today) return "Vandaag";
  if (isoDate === addDays(today, -1)) return "Gisteren";
  if (isoDate === addDays(today, 1)) return "Morgen";

  return new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}
