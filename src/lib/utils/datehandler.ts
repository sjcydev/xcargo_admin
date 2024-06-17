import { DateTime, Settings } from "luxon";

Settings.defaultZone = "America/Panama";

export function getToday() {
  return DateTime.now().setZone("America/Panama");
}

export function dateToLocaleString(date: DateTime) {
  return date.setLocale("en-GB").toLocaleString();
}

export function getDateFromISO(iso: string) {
  return DateTime.fromISO(iso, { zone: "America/Panama" });
}
