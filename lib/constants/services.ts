// lib/constants/services.ts
import type { ServiceType } from '@/lib/types';

/**
 * Services offered by JAZA Media
 *
 * These are displayed as checkboxes in the booking form.
 * The user can select multiple services they're interested in.
 *
 * TO ADD A NEW SERVICE:
 * 1. Add the value to ServiceType in lib/types/database.ts
 * 2. Add the option to SERVICES array below
 * 3. (Optional) Update the database migration if needed
 */

export interface ServiceOption {
  value: ServiceType;
  label: string;
  description: string;
  icon?: string; // Optional: lucide icon name for UI
}

export const SERVICES: ServiceOption[] = [
  {
    value: 'tiktok_ads',
    label: 'TikTok Ads',
    description: 'Paid advertising campaigns on TikTok',
    icon: 'play-circle',
  },
  {
    value: 'tiktok_shop',
    label: 'TikTok Shop',
    description: 'E-commerce integration with TikTok Shop',
    icon: 'shopping-bag',
  },
  {
    value: 'live_selling',
    label: 'Live Selling',
    description: 'Live streaming sales and engagement',
    icon: 'video',
  },
  {
    value: 'facebook_ads',
    label: 'Facebook Ads',
    description: 'Paid advertising campaigns on Facebook & Instagram',
    icon: 'megaphone',
  },
  {
    value: 'shopify',
    label: 'Shopify',
    description: 'Shopify store setup and optimization',
    icon: 'store',
  },
  {
    value: 'software_system',
    label: 'Software System',
    description: 'Custom software and automation solutions',
    icon: 'code',
  },
  {
    value: 'branding',
    label: 'Branding',
    description: 'Brand identity, design, and strategy',
    icon: 'palette',
  },
];

/**
 * Get service label by value
 *
 * @param value - The service type value
 * @returns The human-readable label
 *
 * @example
 * getServiceLabel('tiktok_ads') // "TikTok Ads"
 */
export function getServiceLabel(value: ServiceType): string {
  return SERVICES.find((s) => s.value === value)?.label ?? value;
}

/**
 * Get service description by value
 *
 * @param value - The service type value
 * @returns The service description
 */
export function getServiceDescription(value: ServiceType): string {
  return SERVICES.find((s) => s.value === value)?.description ?? '';
}

/**
 * Get multiple service labels
 *
 * @param values - Array of service type values
 * @returns Array of human-readable labels
 *
 * @example
 * getServiceLabels(['tiktok_ads', 'branding']) // ["TikTok Ads", "Branding"]
 */
export function getServiceLabels(values: ServiceType[]): string[] {
  return values.map(getServiceLabel);
}

/**
 * Format services as a comma-separated string
 *
 * @param values - Array of service type values
 * @returns Formatted string like "TikTok Ads, Branding, and Live Selling"
 *
 * @example
 * formatServices(['tiktok_ads', 'branding', 'live_selling'])
 * // "TikTok Ads, Branding, and Live Selling"
 */
export function formatServices(values: ServiceType[]): string {
  const labels = getServiceLabels(values);

  if (labels.length === 0) return 'None selected';
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;

  const lastLabel = labels.pop();
  return `${labels.join(', ')}, and ${lastLabel}`;
}
