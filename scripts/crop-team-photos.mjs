// One-time script: trim uniform background and crop each team photo
// to a square focused on head + upper-torso. Outputs alongside the
// originals as <slug>-square.webp.
//
// Usage:  node scripts/crop-team-photos.mjs

import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const IMG_DIR = path.join(ROOT, "public", "images");

const PHOTOS = [
  "jaza.webp",
  "bela.webp",
  "manny.webp",
  "nica.webp",
  "omhar.webp",
  "jm.webp",
  "cristal.webp",
];

for (const filename of PHOTOS) {
  const src = path.join(IMG_DIR, filename);
  const dst = path.join(IMG_DIR, filename.replace(".webp", "-square.webp"));

  // Pass 1: trim uniform background pixels from edges. Sharp auto-detects
  // the background color from the corner pixels. Threshold of 25 is loose
  // enough to handle off-white / grey studio backgrounds.
  const trimmed = await sharp(src).trim({ threshold: 25 }).toBuffer();
  const { width, height } = await sharp(trimmed).metadata();

  // Pass 2: extract a square. For portrait photos (taller than wide), take
  // the top of the image so the face stays in frame. For landscape or
  // already-square inputs, center horizontally and take from the top.
  const size = Math.min(width, height);
  const left = Math.max(0, Math.floor((width - size) / 2));

  await sharp(trimmed)
    .extract({ left, top: 0, width: size, height: size })
    .webp({ quality: 90 })
    .toFile(dst);

  console.log(`${filename}  ${width}x${height}  ->  ${path.basename(dst)}  ${size}x${size}`);
}
