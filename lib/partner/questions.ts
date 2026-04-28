export type AnswerKey =
  | 'location'
  | 'fullName'
  | 'businessType'
  | 'description'
  | 'helpType'
  | 'monthlyRevenue'
  | 'willingToInvest'
  | 'budget'
  | 'challenge'
  | 'timeline'
  | 'phone'
  | 'email';

export type Answers = Partial<{
  location: 'philippines' | 'australia' | 'others';
  fullName: string;
  businessType: 'service' | 'brick_and_mortar' | 'ecommerce' | 'software' | 'e_learning' | 'other';
  description: string;
  helpType: 'advertising' | 'media_content' | 'marketing_mgmt' | 'branding' | 'web_dev' | 'audit_growth';
  monthlyRevenue: '0' | '10k_50k' | '50k_150k' | '150k_500k' | '500k_1m' | '1m_3m';
  willingToInvest: 'yes' | 'if_proven' | 'no';
  budget: '30k_50k' | '50k_80k' | '80k_150k' | '150k_200k' | '200k_500k' | '500k_plus';
  challenge: string;
  timeline: 'asap' | 'next_month' | 'just_exploring';
  phone: string;
  email: string;
}>;

type Option<V extends string> = { value: V; label: string };

type RadioQuestion<K extends AnswerKey, V extends string> = {
  id: K;
  type: 'radio';
  label: string;
  helper?: string;
  layout: 'card-grid' | 'row-stack' | 'flag-card';
  cols: 1 | 2 | 3;
  options: Option<V>[];
};

type TextQuestion<K extends AnswerKey> = {
  id: K;
  type: 'text' | 'textarea';
  label: string;
  helper?: string;
  placeholder?: string;
};

export type Question =
  | RadioQuestion<'location', 'philippines' | 'australia' | 'others'>
  | TextQuestion<'fullName'>
  | RadioQuestion<'businessType', NonNullable<Answers['businessType']>>
  | TextQuestion<'description'>
  | RadioQuestion<'helpType', NonNullable<Answers['helpType']>>
  | RadioQuestion<'monthlyRevenue', NonNullable<Answers['monthlyRevenue']>>
  | RadioQuestion<'willingToInvest', NonNullable<Answers['willingToInvest']>>
  | RadioQuestion<'budget', NonNullable<Answers['budget']>>
  | TextQuestion<'challenge'>
  | RadioQuestion<'timeline', NonNullable<Answers['timeline']>>
  | TextQuestion<'phone'>
  | TextQuestion<'email'>;

export const QUESTIONS: Question[] = [
  {
    id: 'location',
    type: 'radio',
    label: 'Where is your business based?',
    layout: 'flag-card',
    cols: 3,
    options: [
      { value: 'philippines', label: 'PHILIPPINES' },
      { value: 'australia', label: 'AUSTRALIA' },
      { value: 'others', label: 'OTHERS' },
    ],
  },
  {
    id: 'fullName',
    type: 'text',
    label: 'What should we call you?',
    placeholder: 'Full name',
  },
  {
    id: 'businessType',
    type: 'radio',
    label: 'What type of business do you have?',
    layout: 'card-grid',
    cols: 2,
    options: [
      { value: 'service', label: 'Service' },
      { value: 'brick_and_mortar', label: 'Brick & Mortar' },
      { value: 'ecommerce', label: 'Ecommerce' },
      { value: 'software', label: 'Software' },
      { value: 'e_learning', label: 'E-Learning' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'description',
    type: 'textarea',
    label: 'Please describe your business in 1-3 sentences MAX?',
    helper: 'Ex: I help dentists get more patients using facebook ads for ₱2000 per month.',
  },
  {
    id: 'helpType',
    type: 'radio',
    label: 'How are we going to help your business?',
    layout: 'card-grid',
    cols: 2,
    options: [
      { value: 'advertising', label: 'Advertising Management' },
      { value: 'media_content', label: 'Media Content & ADs' },
      { value: 'marketing_mgmt', label: 'Marketing Management' },
      { value: 'branding', label: 'Branding & Strategy' },
      { value: 'web_dev', label: 'Web Development' },
      { value: 'audit_growth', label: 'Business Audit & Growth Plan' },
    ],
  },
  {
    id: 'monthlyRevenue',
    type: 'radio',
    label: "What's your average monthly revenue?",
    layout: 'card-grid',
    cols: 2,
    options: [
      { value: '0', label: '₱0' },
      { value: '10k_50k', label: '₱10k – ₱50k' },
      { value: '50k_150k', label: '₱50k – ₱150k' },
      { value: '150k_500k', label: '₱150k – ₱500k' },
      { value: '500k_1m', label: '₱500k – ₱1M' },
      { value: '1m_3m', label: '₱1M – ₱3M' },
    ],
  },
  {
    id: 'willingToInvest',
    type: 'radio',
    label: 'Are you willing to invest in marketing to grow your business?',
    layout: 'row-stack',
    cols: 1,
    options: [
      { value: 'yes', label: 'Yes, I have a marketing budget' },
      { value: 'if_proven', label: "I'm willing if the strategy is proven" },
      { value: 'no', label: "No, I'm not ready to invest yet" },
    ],
  },
  {
    id: 'budget',
    type: 'radio',
    label: "What budget range do you currently have available to invest if we determine that we're a good fit?",
    layout: 'card-grid',
    cols: 2,
    options: [
      { value: '30k_50k', label: '₱30,000 – ₱50,000' },
      { value: '50k_80k', label: '₱50,000 – ₱80,000' },
      { value: '80k_150k', label: '₱80,000 – ₱150,000' },
      { value: '150k_200k', label: '₱150,000 – ₱200,000' },
      { value: '200k_500k', label: '₱200,000 – ₱500,000' },
      { value: '500k_plus', label: '₱500,000+' },
    ],
  },
  {
    id: 'challenge',
    type: 'textarea',
    label: "What's your biggest business challenge right now?",
    helper: 'We want to understand your current situation',
  },
  {
    id: 'timeline',
    type: 'radio',
    label: 'How soon do you want to start working on your growth strategy?',
    layout: 'row-stack',
    cols: 1,
    options: [
      { value: 'asap', label: 'ASAP (within 1-2 weeks)' },
      { value: 'next_month', label: 'Within the next month' },
      { value: 'just_exploring', label: 'Just exploring' },
    ],
  },
  {
    id: 'phone',
    type: 'text',
    label: 'Best Contact Number',
    helper: 'In case we need to reach you',
  },
  {
    id: 'email',
    type: 'text',
    label: 'Email Address',
    helper: 'For sending your audit & updates',
  },
];

export const TOTAL_STEPS = QUESTIONS.length;
