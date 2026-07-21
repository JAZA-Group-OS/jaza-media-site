// lib/utils/format.ts
/**
 * Formatting Utilities
 *
 * Common formatting functions for displaying data throughout the app.
 */

// ============================================================================
// CURRENCY FORMATTING
// ============================================================================

/**
 * Format a number as Philippine Peso
 *
 * @param amount - The amount to format
 * @param showDecimals - Whether to show decimal places (default: false)
 * @returns Formatted currency string
 *
 * @example
 * formatPeso(50000) // "₱50,000"
 * formatPeso(50000.50, true) // "₱50,000.50"
 */
export function formatPeso(
  amount: number,
  showDecimals: boolean = false,
): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
}

/**
 * Format a salary range
 *
 * @param min - Minimum salary
 * @param max - Maximum salary
 * @param currency - Currency code (default: PHP)
 * @returns Formatted salary range
 *
 * @example
 * formatSalaryRange(30000, 50000) // "₱30,000 - ₱50,000"
 * formatSalaryRange(30000, null) // "₱30,000+"
 */
export function formatSalaryRange(
  min: number | null,
  max: number | null,
  currency: string = 'PHP',
): string {
  if (min === null && max === null) return 'Salary not specified';
  if (min !== null && max === null) return `${formatPeso(min)}+`;
  if (min === null && max !== null) return `Up to ${formatPeso(max)}`;
  return `${formatPeso(min!)} - ${formatPeso(max!)}`;
}

// ============================================================================
// PHONE NUMBER FORMATTING
// ============================================================================

/**
 * Format a Philippine phone number
 *
 * @param phone - The phone number (can include country code)
 * @returns Formatted phone number
 *
 * @example
 * formatPhoneNumber('09171234567') // "0917 123 4567"
 * formatPhoneNumber('+639171234567') // "+63 917 123 4567"
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Philippine mobile number formats
  if (cleaned.startsWith('+63')) {
    // +63 format: +63 917 123 4567
    const number = cleaned.slice(3);
    return `+63 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
  }

  if (cleaned.startsWith('63')) {
    // 63 format: +63 917 123 4567
    const number = cleaned.slice(2);
    return `+63 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
  }

  if (cleaned.startsWith('0')) {
    // 0 format: 0917 123 4567
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }

  // Return as-is if doesn't match known formats
  return phone;
}

// ============================================================================
// NAME FORMATTING
// ============================================================================

/**
 * Get initials from a full name
 *
 * @param name - The full name
 * @param maxLength - Maximum number of initials (default: 2)
 * @returns Initials
 *
 * @example
 * getInitials('John Doe') // "JD"
 * getInitials('John Michael Doe') // "JM"
 * getInitials('John Michael Doe', 3) // "JMD"
 */
export function getInitials(name: string, maxLength: number = 2): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .slice(0, maxLength)
    .join('');
}

/**
 * Truncate a name to first name and last initial
 *
 * @param name - The full name
 * @returns Truncated name
 *
 * @example
 * truncateName('John Michael Doe') // "John D."
 */
export function truncateName(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

// ============================================================================
// TEXT FORMATTING
// ============================================================================

/**
 * Truncate text with ellipsis
 *
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 *
 * @example
 * truncateText('This is a very long text', 10) // "This is a..."
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Capitalize the first letter of each word
 *
 * @param text - The text to capitalize
 * @returns Title-cased text
 *
 * @example
 * titleCase('hello world') // "Hello World"
 */
export function titleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Convert a slug to a readable label
 *
 * @param slug - The slug (e.g., "tiktok_ads")
 * @returns Readable label (e.g., "Tiktok Ads")
 *
 * @example
 * slugToLabel('tiktok_ads') // "Tiktok Ads"
 * slugToLabel('live-selling') // "Live Selling"
 */
export function slugToLabel(slug: string): string {
  return titleCase(slug.replace(/[-_]/g, ' '));
}

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

/**
 * Format a number with thousand separators
 *
 * @param num - The number to format
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1234567) // "1,234,567"
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-PH').format(num);
}

/**
 * Format a number as a compact string
 *
 * @param num - The number to format
 * @returns Compact string (e.g., "1.2K", "3.4M")
 *
 * @example
 * formatCompactNumber(1234) // "1.2K"
 * formatCompactNumber(1234567) // "1.2M"
 */
export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
}

// ============================================================================
// STATUS FORMATTING
// ============================================================================

/**
 * Format a status value to a readable label
 *
 * @param status - The status value
 * @returns Human-readable status
 *
 * @example
 * formatStatus('no_show') // "No Show"
 * formatStatus('pending') // "Pending"
 */
export function formatStatus(status: string): string {
  return titleCase(status.replace(/_/g, ' '));
}

/**
 * Get a color class for a booking status (for UI badges)
 *
 * @param status - The booking status
 * @returns Tailwind color classes
 */
export function getBookingStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-500',
    confirmed: 'bg-blue-500/20 text-blue-500',
    completed: 'bg-green-500/20 text-green-500',
    cancelled: 'bg-red-500/20 text-red-500',
    no_show: 'bg-gray-500/20 text-gray-500',
  };
  return colors[status] ?? 'bg-gray-500/20 text-gray-500';
}

/**
 * Get a color class for an application status (for UI badges)
 *
 * @param status - The application status
 * @returns Tailwind color classes
 */
export function getApplicationStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: 'bg-blue-500/20 text-blue-500',
    reviewing: 'bg-yellow-500/20 text-yellow-500',
    interview: 'bg-purple-500/20 text-purple-500',
    offered: 'bg-cyan-500/20 text-cyan-500',
    hired: 'bg-green-500/20 text-green-500',
    rejected: 'bg-red-500/20 text-red-500',
  };
  return colors[status] ?? 'bg-gray-500/20 text-gray-500';
}
