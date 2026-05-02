/**
 * Magic-byte verification for uploaded files.
 *
 * The browser-supplied `file.type` is attacker-controllable — checking the
 * first bytes of the buffer against known signatures defends against
 * "shell.sh sent as application/pdf" attacks.
 *
 * Only covers the MIME types accepted by /api/career-upload. Add to
 * SIGNATURES if a new bucket/type is added.
 */

type ByteSig = number[];

interface Signature {
  mime: string;
  // Optional offset; defaults to 0. WEBP needs `RIFF` at 0 and `WEBP` at 8.
  bytes: ByteSig;
  offset?: number;
}

const SIGNATURES: Signature[] = [
  // PDF — "%PDF-"
  { mime: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46, 0x2d] },

  // DOC — Compound File Binary Format (D0 CF 11 E0 A1 B1 1A E1)
  {
    mime: 'application/msword',
    bytes: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1],
  },

  // DOCX / ZIP — "PK\x03\x04". Both share the ZIP container format; the
  // upload route's MIME allowlist still differentiates intent per bucket.
  {
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    bytes: [0x50, 0x4b, 0x03, 0x04],
  },
  { mime: 'application/zip', bytes: [0x50, 0x4b, 0x03, 0x04] },
  { mime: 'application/x-zip-compressed', bytes: [0x50, 0x4b, 0x03, 0x04] },

  // JPEG — FF D8 FF
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },

  // PNG — 89 50 4E 47 0D 0A 1A 0A
  {
    mime: 'image/png',
    bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  },

  // WEBP — "RIFF....WEBP"
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 },
];

function startsWith(buf: Uint8Array, sig: ByteSig, offset = 0): boolean {
  if (buf.length < offset + sig.length) return false;
  for (let i = 0; i < sig.length; i++) {
    if (buf[offset + i] !== sig[i]) return false;
  }
  return true;
}

/**
 * Verify the buffer's magic bytes match a signature compatible with the
 * claimed MIME type. Returns true only if a matching signature is found.
 */
export function verifyMagicBytes(buffer: Buffer, claimedMime: string): boolean {
  const head = new Uint8Array(buffer.subarray(0, 16));

  // For WEBP, also verify the "WEBP" tag at offset 8.
  if (claimedMime === 'image/webp') {
    return (
      startsWith(head, [0x52, 0x49, 0x46, 0x46]) &&
      startsWith(head, [0x57, 0x45, 0x42, 0x50], 8)
    );
  }

  return SIGNATURES.some(
    (sig) =>
      sig.mime === claimedMime && startsWith(head, sig.bytes, sig.offset ?? 0),
  );
}
