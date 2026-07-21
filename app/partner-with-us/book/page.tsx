import type { Metadata } from 'next';
import { StepTwoBooking } from '@/components/partner/step-two-booking';

export const metadata: Metadata = {
  title: 'Book Your Call — JAZA Media',
  description:
    'Step 2: pick a time on the JAZA Media discovery-call calendar. We will follow up with a calendar invite and Google Meet link.',
};

export default function BookPage() {
  return <StepTwoBooking />;
}
