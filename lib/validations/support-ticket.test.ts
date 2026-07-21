import { describe, it, expect } from 'vitest';
import { SupportTicketSchema } from './support-ticket';

const VALID = {
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  phone: '+1 555 0100',
  topic: 'general',
  subject: 'Need help with my course access',
  message: 'I cannot log in to the Rule of 10X portal. Help.',
  _hp: '',
} as const;

describe('SupportTicketSchema', () => {
  it('accepts a fully valid payload', () => {
    const result = SupportTicketSchema.safeParse(VALID);
    expect(result.success).toBe(true);
  });

  it('accepts a payload without phone (optional)', () => {
    const { phone: _phone, ...rest } = VALID;
    const result = SupportTicketSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });

  it('accepts a payload without _hp (honeypot field is optional)', () => {
    const { _hp: _hp2, ...rest } = VALID;
    const result = SupportTicketSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });

  it('does NOT reject when _hp has a non-empty value (handler enforces honeypot, not schema)', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, _hp: 'spam' });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing full name', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, fullName: '' });
    expect(result.success).toBe(false);
  });

  it('rejects whitespace-only full name (trim then min)', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, fullName: '    ' });
    expect(result.success).toBe(false);
  });

  it('rejects a name 1 char (boundary)', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, fullName: 'X' });
    expect(result.success).toBe(false);
  });

  it('accepts a name exactly 2 chars (boundary)', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, fullName: 'Xy' });
    expect(result.success).toBe(true);
  });

  it('accepts a name exactly 80 chars (boundary)', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, fullName: 'a'.repeat(80) });
    expect(result.success).toBe(true);
  });

  it('rejects a name 81 chars (boundary)', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, fullName: 'a'.repeat(81) });
    expect(result.success).toBe(false);
  });

  it('accepts an email exactly 254 chars (boundary)', () => {
    const local = 'a';
    const domain = 'b'.repeat(248) + '.com';
    const email = `${local}@${domain}`;
    expect(email.length).toBe(254);
    const result = SupportTicketSchema.safeParse({ ...VALID, email });
    expect(result.success).toBe(true);
  });

  it('rejects an email 255 chars (boundary)', () => {
    const email = 'a@' + 'b'.repeat(249) + '.com';
    expect(email.length).toBe(255);
    const result = SupportTicketSchema.safeParse({ ...VALID, email });
    expect(result.success).toBe(false);
  });

  it('rejects a phone 6 chars (boundary)', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, phone: '123456' });
    expect(result.success).toBe(false);
  });

  it('accepts a phone 7 chars (boundary)', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, phone: '1234567' });
    expect(result.success).toBe(true);
  });

  it('accepts a phone 20 chars (boundary)', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, phone: '+1 234 567 890 12345' });
    expect(result.success).toBe(true);
  });

  it('rejects a phone 21 chars (boundary)', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, phone: '12345678901234567890X' });
    expect(result.success).toBe(false);
  });

  it('rejects a phone with HTML/JS chars (regex format)', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, phone: '<script>1234567' });
    expect(result.success).toBe(false);
  });

  it('accepts a phone with brackets, plus, dashes (regex format)', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, phone: '+1 (555) 010-0100' });
    expect(result.success).toBe(true);
  });

  it('rejects an unknown topic value', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, topic: 'unknown_topic' });
    expect(result.success).toBe(false);
  });

  it('rejects the deprecated application_status topic value (post-revision)', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, topic: 'application_status' });
    expect(result.success).toBe(false);
  });

  it('accepts every defined topic value (incl. split career/partnership)', () => {
    const topics = [
      'general',
      'course_rule_of_10x',
      'course_marketing_templates',
      'career_application_status',
      'partnership_followup',
      'billing',
      'other',
    ];
    for (const topic of topics) {
      const result = SupportTicketSchema.safeParse({ ...VALID, topic });
      expect(result.success, `topic=${topic}`).toBe(true);
    }
  });

  it('rejects a subject 3 chars (boundary)', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, subject: 'hi!' });
    expect(result.success).toBe(false);
  });

  it('accepts a subject 4 chars (boundary)', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, subject: 'help' });
    expect(result.success).toBe(true);
  });

  it('accepts a subject 120 chars (boundary)', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, subject: 'a'.repeat(120) });
    expect(result.success).toBe(true);
  });

  it('rejects a subject 121 chars (boundary)', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, subject: 'a'.repeat(121) });
    expect(result.success).toBe(false);
  });

  it('rejects a message 9 chars (boundary)', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, message: 'a'.repeat(9) });
    expect(result.success).toBe(false);
  });

  it('accepts a message 10 chars (boundary)', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, message: 'a'.repeat(10) });
    expect(result.success).toBe(true);
  });

  it('accepts a message 2000 chars (boundary)', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, message: 'a'.repeat(2000) });
    expect(result.success).toBe(true);
  });

  it('rejects a message 2001 chars (boundary)', () => {
    const result = SupportTicketSchema.safeParse({ ...VALID, message: 'a'.repeat(2001) });
    expect(result.success).toBe(false);
  });

  it('accepts Unicode characters in name, subject, message', () => {
    const result = SupportTicketSchema.safeParse({
      ...VALID,
      fullName: 'José Rizal — Nación',
      subject: '紧急：Course access issue 🆘',
      message: 'Cannot log in to the portal. — JR ✉️',
    });
    expect(result.success).toBe(true);
  });

  it('trims whitespace on string fields', () => {
    const result = SupportTicketSchema.safeParse({
      ...VALID,
      fullName: '  Jane Doe  ',
      email: '  jane@example.com  ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fullName).toBe('Jane Doe');
      expect(result.data.email).toBe('jane@example.com');
    }
  });
});
