/**
 * Sends the "Thank you for applying" email to careers applicants via Resend.
 *
 * Requires the following env vars at runtime:
 *   RESEND_API_KEY        — your Resend API key
 *   RESEND_FROM_EMAIL     — verified sender address (CAREERS_FROM_EMAIL also accepted as override)
 *
 * The send is best-effort: API route callers should `await` this but treat a
 * thrown error as non-fatal (we'd rather save the application than block on
 * email delivery). Logs the response body to server console on failure.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

type SendArgs = {
  toEmail: string;
  toName: string;
  positionLabel: string;
};

export function buildThankYouEmail({ toName, positionLabel }: { toName: string; positionLabel: string }) {
  const subject = 'Thank you for applying to JAZA Media';

  const text = [
    `Hi ${toName},`,
    '',
    'Thank you for your interest in becoming part of JAZA Media.',
    '',
    `We've received your application for the ${positionLabel} role. After reviewing your submission, we're pleased to inform you that you have successfully moved forward to the next step of the process.`,
    '',
    'Please allow up to 24 hours for one of our team members to reach out and schedule your final interview call with the assigned JAZA Media specialist.',
    '',
    'We look forward to speaking with you soon!',
    '',
    '— The JAZA Media Team',
  ].join('\n');

  // Inline-styled HTML — most major email clients strip <style> blocks and
  // external CSS, so each element carries its own styling.
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#181818;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.06);">
            <tr>
              <td style="padding:40px 32px 24px 32px;text-align:center;">
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:32px;letter-spacing:6px;color:#181818;">JAZA</div>
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:8px;color:#FFC400;margin-top:4px;">MEDIA</div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 8px 32px;">
                <h1 style="margin:0;font-size:28px;font-weight:900;line-height:1.2;color:#181818;text-align:center;">
                  Thank you for <span style="color:#FFC400;">Applying</span>
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 0 32px;">
                <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333333;">
                  Hi ${escapeHtml(toName)},
                </p>
                <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333333;">
                  Thank you for your interest in becoming part of JAZA Media.
                </p>
                <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333333;">
                  We&rsquo;ve received your application for the <strong>${escapeHtml(positionLabel)}</strong> role. After reviewing your submission, we&rsquo;re pleased to inform you that you have successfully moved forward to the next step of the process.
                </p>
                <p style="margin:0 0 24px 0;font-size:16px;line-height:1.6;color:#333333;">
                  Please allow up to <strong>24 hours</strong> for one of our team members to reach out and schedule your final interview call with the assigned JAZA Media specialist.
                </p>
                <p style="margin:0 0 8px 0;font-size:18px;font-weight:700;color:#181818;text-align:center;">
                  We look forward to speaking with you soon!
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 32px 40px 32px;text-align:center;">
                <p style="margin:0;font-size:14px;color:#666666;">— The JAZA Media Team</p>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0 0;font-size:12px;color:#999999;text-align:center;max-width:600px;">
            You received this email because you submitted an application at JAZA Media. If this wasn&rsquo;t you, please disregard.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}

export async function sendCareerThankYouEmail({
  toEmail,
  toName,
  positionLabel,
}: SendArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CAREERS_FROM_EMAIL ?? process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    console.warn(
      '[email/career-thank-you] RESEND_API_KEY or RESEND_FROM_EMAIL not set; skipping email send.',
    );
    return;
  }

  const { subject, html, text } = buildThankYouEmail({ toName, positionLabel });

  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: [toEmail],
      subject,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error(
      '[email/career-thank-you] Resend send failed:',
      res.status,
      body.slice(0, 500),
    );
    return;
  }
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
