// lib/types/index.ts
/**
 * Type Exports
 *
 * Central export point for all TypeScript types used in the application.
 */

// Database types
export type {
  // Enums
  AdminRole,
  BookingStatus,
  EmploymentType,
  ApplicationStatus,
  SlotDuration,
  BantBudget,
  BantAuthority,
  BantNeed,
  BantTimeline,
  ServiceType,
  // Row types (full records from database)
  AdminProfile,
  BookingSetting,
  BlockedSlot,
  Booking,
  JobPosting,
  Application,
  // Insert types (for creating records)
  AdminProfileInsert,
  BookingSettingInsert,
  BlockedSlotInsert,
  BookingInsert,
  JobPostingInsert,
  ApplicationInsert,
  // Update types (for modifying records)
  AdminProfileUpdate,
  BookingSettingUpdate,
  BookingUpdate,
  JobPostingUpdate,
  ApplicationUpdate,
  // Database interface
  Database,
  // Helper types
  TableRow,
  TableInsert,
  TableUpdate,
} from './database';
