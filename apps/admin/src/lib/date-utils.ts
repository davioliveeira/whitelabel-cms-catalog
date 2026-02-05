// =============================================================================
// Date Utilities
// =============================================================================
// Simple date manipulation utilities (temporary until date-fns is installed)
// TODO: Replace with date-fns once installed: npm install date-fns
// =============================================================================

/**
 * Subtract days from a date
 * @param date - The date to subtract from
 * @param days - Number of days to subtract
 * @returns New date with days subtracted
 */
export function subDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

/**
 * Format date as ISO string (YYYY-MM-DD)
 * @param date - Date to format
 * @returns ISO date string
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get start of day (00:00:00)
 * @param date - Date to get start of
 * @returns Date at start of day
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day (23:59:59)
 * @param date - Date to get end of
 * @returns Date at end of day
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}
