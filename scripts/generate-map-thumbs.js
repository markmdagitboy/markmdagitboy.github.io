/*
Simple thumbnail generator using sharp + SVG.
This produces images/maps/<id>-thumb.png for each map id used in the TS map manager.
It uses inline SVG so it doesn't require a headless browser.
*/
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outDir = path.join(__dirname, '..', 'images', 'maps');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const maps = [
  { id: 'quanta', name: 'Quanta Computer' },
  { id: 'compal', name: 'Compal Electronics' },
  { id: 'wistron', name: 'Wistron' },
  { id: 'foxconn', name: 'Foxconn' }
];

(async () => {
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
    }
  }
})();
