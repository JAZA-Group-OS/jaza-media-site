import type { Metadata } from 'next';
import { CareerFunnelMount } from '@/components/career/career-funnel-mount';

export const metadata: Metadata = {
  title: 'Apply — JAZA Media Careers',
  description:
    'Apply to join JAZA Media. Tell us about yourself and we will reach out within 24 hours.',
};

export default function CareersApplyPage() {
  return <CareerFunnelMount />;
}
