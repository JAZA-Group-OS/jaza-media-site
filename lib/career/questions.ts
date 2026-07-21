export type AnswerKey =
  | 'location'
  | 'fullName'
  | 'email'
  | 'phone'
  | 'facebook'
  | 'position'
  | 'description'
  | 'resume'
  | 'portfolio';

/**
 * For file answers we store the upload result (public URL + metadata) rather
 * than the raw File. The file input component uploads on selection and writes
 * this object back to the funnel state.
 */
export type UploadedFile = {
  url: string;
  filename: string;
  size: number;
  type: string;
};

export type Answers = Partial<{
  location: 'luzon' | 'visayas' | 'mindanao';
  fullName: string;
  email: string;
  phone: string;
  facebook: string;
  position:
    | 'advertiser'
    | 'sales_closer'
    | 'social_media_manager'
    | 'graphic_artist'
    | 'video_editor'
    | 'other';
  description: string;
  resume: UploadedFile;
  portfolio: UploadedFile;
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

type FileQuestion<K extends AnswerKey> = {
  id: K;
  type: 'file';
  label: string;
  helper?: string;
  accept: string;
  maxSizeBytes: number;
  bucket: 'career_resumes' | 'career_portfolios';
};

export type Question =
  | RadioQuestion<'location', NonNullable<Answers['location']>>
  | TextQuestion<'fullName'>
  | TextQuestion<'email'>
  | TextQuestion<'phone'>
  | TextQuestion<'facebook'>
  | RadioQuestion<'position', NonNullable<Answers['position']>>
  | TextQuestion<'description'>
  | FileQuestion<'resume'>
  | FileQuestion<'portfolio'>;

export const QUESTIONS: Question[] = [
  {
    id: 'location',
    type: 'radio',
    label: 'Where are you located?',
    layout: 'card-grid',
    cols: 3,
    options: [
      { value: 'luzon', label: 'LUZON' },
      { value: 'visayas', label: 'VISAYAS' },
      { value: 'mindanao', label: 'MINDANAO' },
    ],
  },
  {
    id: 'fullName',
    type: 'text',
    label: 'What should we call you?',
    helper: 'Full name',
  },
  {
    id: 'email',
    type: 'text',
    label: 'What is your email?',
    helper: 'Provide Active Email',
  },
  {
    id: 'phone',
    type: 'text',
    label: 'What is your contact number?',
    helper: 'Provide Active Contact Number',
  },
  {
    id: 'facebook',
    type: 'text',
    label: 'What is your Facebook link?',
    helper: 'Provide an active Facebook account.',
  },
  {
    id: 'position',
    type: 'radio',
    label: 'Which position are you applying for?',
    layout: 'card-grid',
    cols: 2,
    options: [
      { value: 'advertiser', label: 'Advertiser' },
      { value: 'graphic_artist', label: 'Graphic Artist' },
      { value: 'sales_closer', label: 'Sales Closer' },
      { value: 'video_editor', label: 'Video Editor' },
      { value: 'social_media_manager', label: 'Social Media Manager' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'description',
    type: 'textarea',
    label: 'Please describe yourself in 1–3 sentences (max).',
    helper:
      'Ex: I have the knowledge when it comes to sales because I used to be a Customer Service in my past work.',
  },
  {
    id: 'resume',
    type: 'file',
    label: 'Please provide your resume / CV.',
    helper: 'Upload 1 supported file. Max 100 MB.',
    accept: '.pdf,.doc,.docx',
    maxSizeBytes: 100 * 1024 * 1024,
    bucket: 'career_resumes',
  },
  {
    id: 'portfolio',
    type: 'file',
    label: 'Please provide your Portfolio?',
    helper: 'Upload 1 supported file. Max 100 MB.',
    accept: '.pdf,.zip,.jpg,.jpeg,.png,.webp',
    maxSizeBytes: 100 * 1024 * 1024,
    bucket: 'career_portfolios',
  },
];

export const TOTAL_STEPS = QUESTIONS.length;

export const POSITION_LABELS: Record<NonNullable<Answers['position']>, string> = {
  advertiser: 'Advertiser',
  sales_closer: 'Sales Closer',
  social_media_manager: 'Social Media Manager',
  graphic_artist: 'Graphic Artist',
  video_editor: 'Video Editor',
  other: 'Other',
};

export const LOCATION_LABELS: Record<NonNullable<Answers['location']>, string> = {
  luzon: 'Luzon',
  visayas: 'Visayas',
  mindanao: 'Mindanao',
};
