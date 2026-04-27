import type { Metadata } from 'next';
import { FunnelMount } from '@/components/partner/funnel-mount';

export const metadata: Metadata = {
  title: 'Partner With Us — JAZA Media',
  description:
    'Apply to work with JAZA Media. Tell us about your business and we will determine if we are a fit to scale you.',
};

export default function PartnerWithUsPage() {
  return <FunnelMount />;
}
