// lib/types/database.ts
/**
 * Database Types for Supabase
 *
 * These types are manually created to match our database schema.
 * They provide full TypeScript intellisense when working with Supabase.
 *
 * IMPORTANT: If you change the database schema, update these types to match!
 *
 * In the future, you can auto-generate these using:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/types/database.ts
 */

// ============================================================================
// ENUMS - Matching database CHECK constraints
// ============================================================================

export type AdminRole = 'owner' | 'admin' | 'va';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type EmploymentType =
  | 'full_time'
  | 'part_time'
  | 'contract'
  | 'internship';

export type ApplicationStatus =
  | 'new'
  | 'reviewing'
  | 'interview'
  | 'offered'
  | 'hired'
  | 'rejected';

export type SlotDuration = 30 | 60;

// BANT Options
export type BantBudget = 'under_50k' | '50k_100k' | '100k_500k' | 'over_500k';

export type BantAuthority =
  | 'owner_ceo'
  | 'manager_director'
  | 'employee'
  | 'other';

export type BantNeed =
  | 'critical'
  | 'important'
  | 'nice_to_have'
  | 'just_researching';

export type BantTimeline =
  | 'immediately'
  | 'within_1_month'
  | 'within_3_months'
  | 'no_timeline';

// Services
export type ServiceType =
  | 'tiktok_ads'
  | 'tiktok_shop'
  | 'live_selling'
  | 'facebook_ads'
  | 'shopify'
  | 'software_system'
  | 'branding';

// ============================================================================
// TABLE ROW TYPES
// ============================================================================

export interface AdminProfile {
  id: string; // UUID, references auth.users
  full_name: string;
  role: AdminRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingSetting {
  id: string; // UUID
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string; // TIME as string "HH:MM:SS"
  end_time: string; // TIME as string "HH:MM:SS"
  slot_duration: SlotDuration;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlockedSlot {
  id: string; // UUID
  blocked_date: string; // DATE as string "YYYY-MM-DD"
  blocked_time: string | null; // TIME as string "HH:MM:SS" or null for whole day
  reason: string | null;
  created_by: string | null; // UUID, references admin_profiles
  created_at: string;
}

export interface Booking {
  id: string; // UUID
  // Contact information
  full_name: string;
  email: string;
  phone: string;
  company_name: string | null;
  website: string | null;
  // Business details
  business_duration: string | null;
  monthly_sales: string | null;
  challenges: string | null;
  services_needed: ServiceType[];
  // BANT qualification data
  bant_budget: BantBudget;
  bant_authority: BantAuthority;
  bant_need: BantNeed;
  bant_timeline: BantTimeline;
  bant_score: number; // 0-4
  // Booking details
  booking_date: string; // DATE as string "YYYY-MM-DD"
  booking_time: string; // TIME as string "HH:MM:SS"
  duration_minutes: SlotDuration;
  timezone: string;
  // Status tracking
  status: BookingStatus;
  admin_notes: string | null;
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface JobPosting {
  id: string; // UUID
  title: string;
  department: string;
  location: string;
  employment_type: EmploymentType;
  description: string;
  requirements: string | null;
  benefits: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  show_salary: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string; // UUID
  job_id: string; // UUID, references job_postings
  full_name: string;
  email: string;
  phone: string;
  address: string | null;
  age: number | null;
  years_experience: number;
  resume_url: string;
  resume_filename: string;
  cover_letter: string | null;
  status: ApplicationStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// partner_inquiries — submissions from the marketing site's qualification funnel
// ============================================================================

export type InquiryOutcome = 'qualified' | 'not_qualified';
export type FollowUpStatus = 'new' | 'contacted' | 'closed';

export interface PartnerInquiry {
  id: string; // UUID
  full_name: string;
  email: string;
  phone: string;
  location: string | null;
  business_type: string | null;
  business_description: string | null;
  help_type: string | null;
  monthly_revenue: string | null;
  challenge: string | null;
  willing_to_invest: string | null;
  budget: string | null;
  timeline: string | null;
  outcome: InquiryOutcome;
  follow_up_status: FollowUpStatus;
  admin_notes: string | null;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface PartnerInquiryInsert {
  full_name: string;
  email: string;
  phone: string;
  location?: string | null;
  business_type?: string | null;
  business_description?: string | null;
  help_type?: string | null;
  monthly_revenue?: string | null;
  challenge?: string | null;
  willing_to_invest?: string | null;
  budget?: string | null;
  timeline?: string | null;
  outcome: InquiryOutcome;
  follow_up_status?: FollowUpStatus;
  admin_notes?: string | null;
  source?: string;
}

export interface PartnerInquiryUpdate {
  follow_up_status?: FollowUpStatus;
  admin_notes?: string | null;
}

// ============================================================================
// career_applications — submissions from the /careers/apply funnel
// ============================================================================

export type CareerLocation = 'luzon' | 'visayas' | 'mindanao';
export type CareerPosition =
  | 'advertiser'
  | 'sales_closer'
  | 'social_media_manager'
  | 'graphic_artist'
  | 'video_editor'
  | 'other';

export interface CareerApplication {
  id: string; // UUID
  full_name: string;
  email: string;
  phone: string;
  facebook: string | null;
  location: CareerLocation;
  position: CareerPosition;
  description: string;
  resume_url: string;
  resume_filename: string;
  resume_size_bytes: number;
  resume_mime_type: string;
  portfolio_url: string;
  portfolio_filename: string;
  portfolio_size_bytes: number;
  portfolio_mime_type: string;
  follow_up_status: FollowUpStatus;
  admin_notes: string | null;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface CareerApplicationInsert {
  full_name: string;
  email: string;
  phone: string;
  facebook?: string | null;
  location: CareerLocation;
  position: CareerPosition;
  description: string;
  resume_url: string;
  resume_filename: string;
  resume_size_bytes: number;
  resume_mime_type: string;
  portfolio_url: string;
  portfolio_filename: string;
  portfolio_size_bytes: number;
  portfolio_mime_type: string;
  follow_up_status?: FollowUpStatus;
  admin_notes?: string | null;
  source?: string;
}

export interface CareerApplicationUpdate {
  follow_up_status?: FollowUpStatus;
  admin_notes?: string | null;
}

// ============================================================================
// course_requests — claim submissions from /courses/[slug]
// ============================================================================

export type CourseSlug = 'rule-of-10x' | 'marketing-templates';

export type SelectedAsset =
  | 'rule_of_10x_marketing'
  | 'rule_of_10x_advertising'
  | 'sales_call_script'
  | 'ai_prompt';

export interface CourseRequest {
  id: string; // UUID
  course_slug: CourseSlug;
  first_name: string;
  last_name: string;
  email: string;
  // Nullable for any rows captured before the phone column was added.
  phone: string | null;
  shipping_street: string;
  shipping_city: string;
  shipping_state: string;
  shipping_country: string;
  shipping_postal: string;
  selected_asset: SelectedAsset;
  email_sent_at: string | null;
  email_error: string | null;
  follow_up_status: FollowUpStatus;
  admin_notes: string | null;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface CourseRequestInsert {
  course_slug: CourseSlug;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  shipping_street: string;
  shipping_city: string;
  shipping_state: string;
  shipping_country: string;
  shipping_postal: string;
  selected_asset: SelectedAsset;
  email_sent_at?: string | null;
  email_error?: string | null;
  follow_up_status?: FollowUpStatus;
  admin_notes?: string | null;
  source?: string;
}

export interface CourseRequestUpdate {
  email_sent_at?: string | null;
  email_error?: string | null;
  follow_up_status?: FollowUpStatus;
  admin_notes?: string | null;
}

// ============================================================================
// support_tickets — submissions from /support
// ============================================================================

export type SupportTopic =
  | 'general'
  | 'course_rule_of_10x'
  | 'course_marketing_templates'
  | 'career_application_status'
  | 'partnership_followup'
  | 'billing'
  | 'other';

export type SupportTicketStatus =
  | 'new'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export interface SupportTicket {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  topic: SupportTopic;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  admin_notes: string | null;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketInsert {
  full_name: string;
  email: string;
  phone?: string | null;
  topic: SupportTopic;
  subject: string;
  message: string;
  status?: SupportTicketStatus;
  admin_notes?: string | null;
  source?: string;
}

export interface SupportTicketUpdate {
  status?: SupportTicketStatus;
  admin_notes?: string | null;
}

// ============================================================================
// INSERT TYPES (for creating new records)
// ============================================================================

export interface AdminProfileInsert {
  id: string; // Must match auth.users id
  full_name: string;
  role?: AdminRole;
  avatar_url?: string | null;
}

export interface BookingSettingInsert {
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration?: SlotDuration;
  is_available?: boolean;
}

export interface BlockedSlotInsert {
  blocked_date: string;
  blocked_time?: string | null;
  reason?: string | null;
  created_by?: string | null;
}

export interface BookingInsert {
  full_name: string;
  email: string;
  phone: string;
  company_name?: string | null;
  website?: string | null;
  business_duration?: string | null;
  monthly_sales?: string | null;
  challenges?: string | null;
  services_needed?: ServiceType[];
  bant_budget: BantBudget;
  bant_authority: BantAuthority;
  bant_need: BantNeed;
  bant_timeline: BantTimeline;
  bant_score: number;
  booking_date: string;
  booking_time: string;
  duration_minutes?: SlotDuration;
  timezone?: string;
  status?: BookingStatus;
  admin_notes?: string | null;
}

export interface JobPostingInsert {
  title: string;
  department: string;
  location?: string;
  employment_type?: EmploymentType;
  description: string;
  requirements?: string | null;
  benefits?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string;
  show_salary?: boolean;
  is_active?: boolean;
  display_order?: number;
}

export interface ApplicationInsert {
  job_id: string;
  full_name: string;
  email: string;
  phone: string;
  address?: string | null;
  age?: number | null;
  years_experience?: number;
  resume_url: string;
  resume_filename: string;
  cover_letter?: string | null;
  status?: ApplicationStatus;
  admin_notes?: string | null;
}

// ============================================================================
// UPDATE TYPES (for modifying existing records)
// ============================================================================

export interface AdminProfileUpdate {
  full_name?: string;
  role?: AdminRole;
  avatar_url?: string | null;
  updated_at?: string;
}

export interface BookingSettingUpdate {
  start_time?: string;
  end_time?: string;
  slot_duration?: SlotDuration;
  is_available?: boolean;
  updated_at?: string;
}

export interface BookingUpdate {
  status?: BookingStatus;
  admin_notes?: string | null;
  booking_date?: string;
  booking_time?: string;
  duration_minutes?: SlotDuration;
  updated_at?: string;
}

export interface JobPostingUpdate {
  title?: string;
  department?: string;
  location?: string;
  employment_type?: EmploymentType;
  description?: string;
  requirements?: string | null;
  benefits?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string;
  show_salary?: boolean;
  is_active?: boolean;
  display_order?: number;
  updated_at?: string;
}

export interface ApplicationUpdate {
  status?: ApplicationStatus;
  admin_notes?: string | null;
  updated_at?: string;
}

// ============================================================================
// DATABASE INTERFACE (for Supabase client typing)
// ============================================================================

export type Database = {
  // Required by @supabase/supabase-js v2.100+ for proper type inference.
  __InternalSupabase: {
    PostgrestVersion: '12';
  };
  public: {
    Tables: {
      admin_profiles: {
        Row: AdminProfile;
        Insert: AdminProfileInsert;
        Update: AdminProfileUpdate;
        Relationships: [];
      };
      booking_settings: {
        Row: BookingSetting;
        Insert: BookingSettingInsert;
        Update: BookingSettingUpdate;
        Relationships: [];
      };
      blocked_slots: {
        Row: BlockedSlot;
        Insert: BlockedSlotInsert;
        Update: Record<string, never>; // No updates allowed
        Relationships: [];
      };
      bookings: {
        Row: Booking;
        Insert: BookingInsert;
        Update: BookingUpdate;
        Relationships: [];
      };
      job_postings: {
        Row: JobPosting;
        Insert: JobPostingInsert;
        Update: JobPostingUpdate;
        Relationships: [];
      };
      applications: {
        Row: Application;
        Insert: ApplicationInsert;
        Update: ApplicationUpdate;
        Relationships: [];
      };
      partner_inquiries: {
        Row: PartnerInquiry;
        Insert: PartnerInquiryInsert;
        Update: PartnerInquiryUpdate;
        Relationships: [];
      };
      career_applications: {
        Row: CareerApplication;
        Insert: CareerApplicationInsert;
        Update: CareerApplicationUpdate;
        Relationships: [];
      };
      course_requests: {
        Row: CourseRequest;
        Insert: CourseRequestInsert;
        Update: CourseRequestUpdate;
        Relationships: [];
      };
      support_tickets: {
        Row: SupportTicket;
        Insert: SupportTicketInsert;
        Update: SupportTicketUpdate;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
    Enums: {
      admin_role: AdminRole;
      booking_status: BookingStatus;
      employment_type: EmploymentType;
      application_status: ApplicationStatus;
      bant_budget: BantBudget;
      bant_authority: BantAuthority;
      bant_need: BantNeed;
      bant_timeline: BantTimeline;
      service_type: ServiceType;
    };
  };
};

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Extract the Row type from a table name
 * @example type BookingRow = TableRow<'bookings'>
 */
export type TableRow<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

/**
 * Extract the Insert type from a table name
 * @example type BookingInsertType = TableInsert<'bookings'>
 */
export type TableInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

/**
 * Extract the Update type from a table name
 * @example type BookingUpdateType = TableUpdate<'bookings'>
 */
export type TableUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
