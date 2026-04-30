// lib/utils/index.ts
/**
 * Utility Exports
 *
 * Central export point for all utility functions.
 */

// Class name merging (existing utility)
export { cn } from '../utils';

// Date and time utilities
export {
  TIMEZONE,
  DAYS_OF_WEEK,
  DAYS_OF_WEEK_SHORT,
  formatDate,
  formatDateForDB,
  formatBookingDate,
  formatTime,
  formatTimeForDB,
  parseTime,
  isPastDate,
  isDateToday,
  isBookableDate,
  isPastTimeToday,
  generateTimeSlots,
  getDayOfWeek,
  getDayName,
  getNextDays,
  formatDateRange,
} from './date-utils';

// Formatting utilities
export {
  formatPeso,
  formatSalaryRange,
  formatPhoneNumber,
  getInitials,
  truncateName,
  truncateText,
  titleCase,
  slugToLabel,
  formatNumber,
  formatCompactNumber,
  formatStatus,
  getBookingStatusColor,
  getApplicationStatusColor,
} from './format';
