// Trim transparent padding from the hero cutout PNGs so the person's
// natural bottom edge aligns flush with the section line when rendered
// with object-bottom. Outputs sibling files with " trimmed" suffix.
//
// Usage:  node scripts/trim-hero-photos.mjs

import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const IMG_DIR = path.join(ROOT, "public", "about-the-form");

const SOURCES = ["Jaza no bg.png", "Bela no bg.png"];

for (const filename of SOURCES) {
  const inputPath = path.join(IMG_DIR, filename);
  const outputPath = path.join(IMG_DIR, filename.replace(".png", " trimmed.png"));

  const before = await sharp(inputPath).metadata();
  await sharp(inputPath).trim().toFile(outputPath);
  const after = await sharp(outputPath).metadata();

  console.log(
    `${filename}: ${before.width}x${before.height} → ${after.width}x${after.height}`,
  );
}
