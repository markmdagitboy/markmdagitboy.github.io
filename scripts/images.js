#!/usr/bin/env node
/*
  images.js

  Consolidated image utilities for the repo:
  - generate thumbnails for maps (previously generate-map-thumbs.js)
  - convert profile headshot to multiple WebP/PNG variants (previously convert-to-webp.js)

  Usage:
    node scripts/images.js thumbs      # generate map thumbnails
    node scripts/images.js convert     # convert headshot to webp/png variants
    node scripts/images.js all         # run both
    node scripts/images.js --help      # print help

*/
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateMapThumbs() {
  const outDir = path.join(__dirname, '..', 'images', 'maps');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const maps = [
    { id: 'quanta', name: 'Quanta Computer' },
    { id: 'compal', name: 'Compal Electronics' },
    { id: 'wistron', name: 'Wistron' },
    { id: 'foxconn', name: 'Foxconn' }
  ];

  for (const m of maps) {
    const svg = `
      <svg width="1200" height="675" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6" />
        <rect x="20" y="20" width="1160" height="635" rx="8" fill="#ffffff" stroke="#e5e7eb" />
        <text x="50%" y="45%" font-size="48" text-anchor="middle" fill="#111827" font-family="Arial, sans-serif">${m.name}</text>
        <text x="50%" y="60%" font-size="20" text-anchor="middle" fill="#6b7280" font-family="Arial, sans-serif">Map thumbnail</text>
      </svg>
    `;
    const outPath = path.join(outDir, `${m.id}-thumb.png`);
    try {
      const buffer = Buffer.from(svg);
      await sharp(buffer).resize(600, 338).png({ compressionLevel: 8 }).toFile(outPath);
      console.log('Wrote', outPath);
    } catch (err) {
      console.error('Failed to write', outPath, err);
      // continue with next
    }
  }
}

async function convertHeadshot() {
  const input = path.resolve(__dirname, '..', 'images', 'profile', 'headshot.png');
  const sizes = [400, 800, 1600];

  if (!fs.existsSync(input)) {
    console.error('Input file not found:', input);
    return process.exitCode = 1;
  }

  // Generate WebP variants (width-based)
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
      process.exitCode = 2;
      // continue trying other sizes
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
      process.exitCode = 2;
      // continue
    }
  }
}

function printHelp() {
  console.log(`Usage: node scripts/images.js [thumbs|convert|all]

Options:
  thumbs     Generate map thumbnails
  convert    Convert headshot to WebP and PNG density variants
  all        Run both tasks
  --help     Show this message
`);
}

(async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    printHelp();
    return;
  }
  const cmd = argv[0].toLowerCase();
  if (cmd === 'thumbs' || cmd === '--thumbs') {
    await generateMapThumbs();
    return;
  }
  if (cmd === 'convert' || cmd === '--convert') {
    await convertHeadshot();
    return;
  }
  if (cmd === 'all' || cmd === '--all') {
    await generateMapThumbs();
    await convertHeadshot();
    return;
  }
  if (cmd === '--help' || cmd === '-h' || cmd === 'help') {
    printHelp();
    return;
  }
  console.error('Unknown command:', cmd);
  printHelp();
  process.exitCode = 3;
})();
