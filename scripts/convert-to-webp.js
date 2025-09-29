const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const input = path.resolve(__dirname, '..', 'images', 'profile', 'headshot.png');
const sizes = [400, 800, 1600];

async function convertAll() {
  if (!fs.existsSync(input)) {
    console.error('Input file not found:', input);
    process.exit(1);
  }
  // Generate WebP variants (width-based) and PNG retina variants
  for (const w of sizes) {
    const outWebp = path.resolve(__dirname, '..', 'images', 'profile', `headshot-${w}.webp`);
    try {
      await sharp(input)
        .resize({ width: w })
        .webp({ quality: 85 })
        .toFile(outWebp);
      console.log(`Converted to ${outWebp}`);
    } catch (err) {
      console.error(`Conversion failed for ${w}:`, err);
      process.exit(2);
    }
  }

  // Generate density-based PNG fallbacks: 1x (original), 2x, 3x
  const density = [1, 2, 3];
  const baseWidth = 400; // baseline width for 1x
  for (const d of density) {
    const w = baseWidth * d;
    const outPng = path.resolve(__dirname, '..', 'images', 'profile', `headshot@${d}x.png`);
    try {
      await sharp(input)
        .resize({ width: w })
        .png({ quality: 90 })
        .toFile(outPng);
      console.log(`Converted PNG density ${d}x to ${outPng}`);
    } catch (err) {
      console.error(`PNG conversion failed for ${d}x:`, err);
      process.exit(2);
    }
  }
}

convertAll();
