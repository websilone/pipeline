const PARIS = "Europe/Paris";

/** The current day in Paris, as "YYYY-MM-DD". */
export function todayInParis(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: PARIS }).format(now);
}

const DISPLAY_FORMAT = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** Formats a "YYYY-MM-DD" day for display, e.g. "1 déc. 2026". */
export function formatDate(date: string): string {
  return DISPLAY_FORMAT.format(new Date(`${date}T00:00:00Z`));
}
