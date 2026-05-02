/**
 * Sends the "Here's your free [asset]" email to people who claim something
 * from the course/template funnel. Mirrors lib/email/career-thank-you.ts.
 *
 * Requires the following env vars at runtime:
 *   RESEND_API_KEY        — your Resend API key
 *   RESEND_FROM_EMAIL     — verified sender address
 *                            (COURSES_FROM_EMAIL also accepted as override)
 *
 * The asset URL is resolved from the catalog (per selected_asset, with env
 * overrides). Until the client provides real download links, placeholders
 * are used — the email still sends so the funnel can be tested end-to-end.
 *
 * The send is best-effort: API route callers should `await` this but treat
 * a thrown error as non-fatal (we'd rather save the request than block on
 * email delivery).
 */

import {
  resolveAssetUrl,
  type AssetOption,
  type CourseDetails,
} from '@/lib/courses/catalog';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

type SendArgs = {
  toEmail: string;
  toName: string;
  course: CourseDetails;
  asset: AssetOption;
};

export type CourseDeliveryResult =
  | { sent: true }
  | { sent: false; reason: 'missing_config' | 'send_failed'; detail?: string };

export function buildCourseDeliveryEmail({
  toName,
  course,
  asset,
  assetUrl,
}: {
  toName: string;
  course: CourseDetails;
  asset: AssetOption;
  assetUrl: string;
}) {
  const isTemplates = course.slug === 'marketing-templates';
  const noun = isTemplates ? 'template' : 'course';
  const subject = `Your free ${asset.label} is here`;
  const heading = `Your free ${noun} is ready`;
  const buttonLabel = isTemplates ? 'Open my template' : 'Open my course';
  const intro = `Thanks for claiming ${asset.label}. You can open your ${noun} using the button below.`;

  const text = [
    `Hi ${toName},`,
    '',
    intro,
    '',
    'Open it here:',
    assetUrl,
    '',
    'If the link does not open, copy and paste it into your browser.',
    '',
    'Make the most of it — and reach out any time if you want a hand applying it to your business.',
    '',
    '— The JAZA Media Team',
  ].join('\n');

  const safeName = escapeHtml(toName);
  const safeIntro = escapeHtml(intro);
  const safeHeading = escapeHtml(heading);
  const safeButtonLabel = escapeHtml(buttonLabel);
  const safeUrl = escapeHtml(assetUrl);

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
                  ${safeHeading}
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 0 32px;">
                <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333333;">
                  Hi ${safeName},
                </p>
                <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333333;">
                  ${safeIntro}
                </p>
                <p style="margin:24px 0;text-align:center;">
                  <a href="${safeUrl}"
                     style="display:inline-block;background:#FFC400;color:#181818;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:999px;font-size:16px;">
                    ${safeButtonLabel}
                  </a>
                </p>
                <p style="margin:0 0 16px 0;font-size:13px;line-height:1.6;color:#666666;">
                  Or paste this link into your browser:<br />
                  <span style="color:#181818;word-break:break-all;">${safeUrl}</span>
                </p>
                <p style="margin:24px 0 0 0;font-size:16px;line-height:1.6;color:#333333;">
                  Make the most of it — and reach out any time if you want a hand applying it to your business.
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
            You received this email because you requested this from JAZA Media. If this wasn&rsquo;t you, please disregard.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}

export async function sendCourseDeliveryEmail({
  toEmail,
  toName,
  course,
  asset,
}: SendArgs): Promise<CourseDeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.COURSES_FROM_EMAIL ?? process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    console.warn(
      '[email/course-delivery] RESEND_API_KEY or RESEND_FROM_EMAIL not set; skipping email send.',
    );
    return { sent: false, reason: 'missing_config' };
  }

  const assetUrl = resolveAssetUrl(asset.value) ?? asset.defaultAssetUrl;
  const { subject, html, text } = buildCourseDeliveryEmail({
    toName,
    course,
    asset,
    assetUrl,
  });

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
    const detail = body.slice(0, 500);
    console.error(
      '[email/course-delivery] Resend send failed:',
      res.status,
      detail,
    );
    return { sent: false, reason: 'send_failed', detail };
  }

  return { sent: true };
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
