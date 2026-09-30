/**
 * Shared datetime formatting for the Administration Portal.
 *
 * All portal times are displayed in the BUSINESS timezone (East Africa Time)
 * with an explicit label, regardless of where the server or the viewing admin
 * is located. Previously the server-rendered dashboard formatted dates with
 * the server's local timezone (UTC), which showed times 3 hours off from the
 * client-rendered pages (browser timezone) — the "wrong time" bug.
 */

/** Business timezone — EternityCrm operates on East Africa Time. */
export const BUSINESS_TIME_ZONE = "Africa/Kampala";

const DATE_TIME_OPTS: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: BUSINESS_TIME_ZONE,
};

const DATE_OPTS: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: BUSINESS_TIME_ZONE,
};

/** "25 Sep 2026, 14:30 EAT" — null/undefined/invalid renders as an em dash. */
export function formatDateTime(value?: Date | string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  const text = new Intl.DateTimeFormat("en-GB", DATE_TIME_OPTS).format(d);
  return `${text} EAT`;
}

/** "25 Sep 2026" — for date-only displays. */
export function formatDate(value?: Date | string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", DATE_OPTS).format(d);
}
