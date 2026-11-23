import { expect, test } from "vitest";
import { formatDate, todayInParis } from "@/lib/dates";

test.each([
  ["2026-11-23T10:00:00.000Z", "2026-11-23"],
  ["2026-11-23T23:30:00.000Z", "2026-11-24"],
  ["2026-07-01T21:59:00.000Z", "2026-07-01"],
  ["2026-07-01T22:00:00.000Z", "2026-07-02"],
])("today in Paris at %s is %s", (now, expected) => {
  expect(todayInParis(new Date(now))).toBe(expected);
});

test.each([
  ["2026-12-01", "1 déc. 2026"],
  ["2027-01-15", "15 janv. 2027"],
])("formats %s as « %s »", (date, expected) => {
  expect(formatDate(date)).toBe(expected);
});
