/**
 * Adds `days` to a date-only or ISO datetime string using UTC-safe arithmetic and
 * returns a date-only string ("YYYY-MM-DD"). Avoids the local-timezone shift that
 * `Date.setDate()` + TypeORM's `date`-column serializer introduce (see feed_records
 * and subscription_payments fixes for the same bug class). The `as unknown as Date`
 * cast matches the existing convention of typing date-only fields as `Date` while
 * actually carrying a plain string end to end (e.g. RegisterFeedRecordDto.feedDate).
 */
export function addDaysToDateOnlyString(
  dateOnly: Date | string,
  days: number,
): Date {
  const [year, month, day] = String(dateOnly)
    .slice(0, 10)
    .split('-')
    .map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + days));
  return result.toISOString().slice(0, 10) as unknown as Date;
}
