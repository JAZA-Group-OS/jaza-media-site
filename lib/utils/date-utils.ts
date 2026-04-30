// lib/utils/date-utils.ts
import {
  format,
  parseISO,
  isAfter,
  isBefore,
  isToday,
  addDays,
  startOfDay,
} from 'date-fns';

/**
 * Date and Time Utilities for JAZA Media
 *
 * IMPORTANT: All dates and times are handled in Philippine Standard Time (PHT)
 * PHT is UTC+8 and does not observe daylight saving time.
 *
 * This file provides utilities for:
 * - Formatting dates and times for display
 * - Converting between formats
 * - Validating booking dates (no past dates)
 * - Working with time slots
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Philippine timezone identifier
 */
export const TIMEZONE = 'Asia/Manila';

/**
 * Days of the week (0 = Sunday, 6 = Saturday)
 */
export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

/**
 * Short day names
 */
export const DAYS_OF_WEEK_SHORT = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
] as const;

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Format a date for display
 *
 * @param date - Date object, ISO string, or date string
 * @param formatStr - date-fns format string (default: "MMMM d, yyyy")
 * @returns Formatted date string
 *
 * @example
 * formatDate('2025-01-15') // "January 15, 2025"
 * formatDate(new Date(), 'MMM d') // "Jan 23"
 */
export function formatDate(
  date: Date | string,
  formatStr: string = 'MMMM d, yyyy',
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format a date for database storage (YYYY-MM-DD)
 *
 * @param date - Date object
 * @returns Date string in YYYY-MM-DD format
 *
 * @example
 * formatDateForDB(new Date(2025, 0, 15)) // "2025-01-15"
 */
export function formatDateForDB(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Format a date for display in booking context
 *
 * @param date - Date string in YYYY-MM-DD format
 * @returns Formatted string like "Wednesday, January 15, 2025"
 */
export function formatBookingDate(date: string): string {
  return format(parseISO(date), 'EEEE, MMMM d, yyyy');
}

// ============================================================================
// TIME FORMATTING
// ============================================================================

/**
 * Format a time for display (12-hour format with AM/PM)
 *
 * @param time - Time string in HH:MM:SS or HH:MM format
 * @returns Formatted time like "9:00 AM" or "5:30 PM"
 *
 * @example
 * formatTime('09:00:00') // "9:00 AM"
 * formatTime('17:30:00') // "5:30 PM"
 */
export function formatTime(time: string): string {
  // Handle both HH:MM:SS and HH:MM formats
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Format a time for database storage (HH:MM:SS)
 *
 * @param hours - Hours (0-23)
 * @param minutes - Minutes (0-59)
 * @returns Time string in HH:MM:SS format
 *
 * @example
 * formatTimeForDB(9, 0) // "09:00:00"
 * formatTimeForDB(17, 30) // "17:30:00"
 */
export function formatTimeForDB(hours: number, minutes: number = 0): string {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
}

/**
 * Parse a time string into hours and minutes
 *
 * @param time - Time string in HH:MM:SS or HH:MM format
 * @returns Object with hours and minutes
 *
 * @example
 * parseTime('09:30:00') // { hours: 9, minutes: 30 }
 */
export function parseTime(time: string): { hours: number; minutes: number } {
  const [hours, minutes] = time.split(':').map(Number);
  return { hours, minutes };
}

// ============================================================================
// BOOKING VALIDATION
// ============================================================================

/**
 * Check if a date is in the past (cannot be booked)
 *
 * @param date - Date to check (Date object or YYYY-MM-DD string)
 * @returns true if the date is in the past
 *
 * @example
 * isPastDate('2020-01-01') // true
 * isPastDate(new Date(2030, 0, 1)) // false
 */
export function isPastDate(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = startOfDay(new Date());
  return isBefore(startOfDay(dateObj), today);
}

/**
 * Check if a date is today
 *
 * @param date - Date to check
 * @returns true if the date is today
 */
export function isDateToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isToday(dateObj);
}

/**
 * Check if a date is bookable (today or in the future)
 *
 * @param date - Date to check
 * @returns true if the date can be booked
 */
export function isBookableDate(date: Date | string): boolean {
  return !isPastDate(date);
}

/**
 * Check if a time slot is in the past for today's date
 * This is used to disable past time slots on the current day
 *
 * @param time - Time string in HH:MM:SS format
 * @returns true if the time has already passed today
 *
 * @example
 * // If current time is 2:00 PM
 * isPastTimeToday('09:00:00') // true
 * isPastTimeToday('17:00:00') // false
 */
export function isPastTimeToday(time: string): boolean {
  const now = new Date();
  const { hours, minutes } = parseTime(time);

  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  if (hours < currentHours) return true;
  if (hours === currentHours && minutes <= currentMinutes) return true;

  return false;
}

// ============================================================================
// TIME SLOT GENERATION
// ============================================================================

/**
 * Generate time slots between start and end times
 *
 * @param startTime - Start time in HH:MM:SS format
 * @param endTime - End time in HH:MM:SS format
 * @param slotDuration - Duration of each slot in minutes (30 or 60)
 * @returns Array of time strings in HH:MM:SS format
 *
 * @example
 * generateTimeSlots('09:00:00', '12:00:00', 30)
 * // ['09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00', '11:30:00']
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  slotDuration: 30 | 60,
): string[] {
  const slots: string[] = [];

  const start = parseTime(startTime);
  const end = parseTime(endTime);

  let currentHours = start.hours;
  let currentMinutes = start.minutes;

  while (
    currentHours < end.hours ||
    (currentHours === end.hours && currentMinutes < end.minutes)
  ) {
    slots.push(formatTimeForDB(currentHours, currentMinutes));

    // Add slot duration
    currentMinutes += slotDuration;
    if (currentMinutes >= 60) {
      currentHours += Math.floor(currentMinutes / 60);
      currentMinutes = currentMinutes % 60;
    }
  }

  return slots;
}

/**
 * Get the day of week (0-6) for a date
 *
 * @param date - Date object or YYYY-MM-DD string
 * @returns Day of week (0 = Sunday, 6 = Saturday)
 */
export function getDayOfWeek(date: Date | string): number {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj.getDay();
}

/**
 * Get the day name for a date
 *
 * @param date - Date object or YYYY-MM-DD string
 * @returns Day name like "Monday"
 */
export function getDayName(date: Date | string): string {
  const dayOfWeek = getDayOfWeek(date);
  return DAYS_OF_WEEK[dayOfWeek];
}

// ============================================================================
// DATE RANGE UTILITIES
// ============================================================================

/**
 * Get an array of dates for the next N days
 *
 * @param days - Number of days to generate
 * @param startDate - Starting date (defaults to today)
 * @returns Array of Date objects
 *
 * @example
 * getNextDays(7) // Array of next 7 days starting from today
 */
export function getNextDays(
  days: number,
  startDate: Date = new Date(),
): Date[] {
  const dates: Date[] = [];

  for (let i = 0; i < days; i++) {
    dates.push(addDays(startOfDay(startDate), i));
  }

  return dates;
}

/**
 * Format a date range for display
 *
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Formatted range like "Jan 15 - Jan 22, 2025"
 */
export function formatDateRange(
  startDate: Date | string,
  endDate: Date | string,
): string {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

  // If same month and year
  if (format(start, 'MMMM yyyy') === format(end, 'MMMM yyyy')) {
    return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
  }

  // If same year but different month
  if (format(start, 'yyyy') === format(end, 'yyyy')) {
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  }

  // Different years
  return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
}
