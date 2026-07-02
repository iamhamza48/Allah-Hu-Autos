import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const logoPath = join(publicDir, 'logo.webp');
const BRAND_BLUE = { r: 11, g: 77, b: 174, alpha: 1 };

const buildIcon = async (size, iconScale = 0.76) => {
  const meta = await sharp(logoPath).metadata();
  const iconHeight = Math.round(meta.height * 0.42);
  const icon = await sharp(logoPath)
    .extract({ left: 0, top: 0, width: meta.width, height: iconHeight })
    .png()
    .toBuffer();

  const inner = Math.round(size * iconScale);
  const logoBuf = await sharp(icon)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BRAND_BLUE,
    },
  })
    .composite([{ input: logoBuf, gravity: 'center' }])
    .png()
    .toBuffer();
};

const pngTargets = [
  { name: 'site-icon-48.png', size: 48 },
  { name: 'site-icon-192.png', size: 192 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'favicon-192x192.png', size: 192 },
  { name: 'logo.png', size: 512, iconScale: 0.7 },
];

for (const { name, size, iconScale } of pngTargets) {
  const png = await buildIcon(size, iconScale ?? 0.76);
  writeFileSync(join(publicDir, name), png);
}

const icoSizes = [16, 32, 48];
const icoImages = await Promise.all(icoSizes.map((size) => buildIcon(size)));

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(icoSizes.length, 4);

const entries = [];
let offset = 6 + icoSizes.length * 16;

for (let index = 0; index < icoSizes.length; index += 1) {
  const size = icoSizes[index];
  const image = icoImages[index];
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size === 256 ? 0 : size, 0);
  entry.writeUInt8(size === 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(image.length, 8);
  entry.writeUInt32LE(offset, 12);
  entries.push(entry);
  offset += image.length;
}

const ico = Buffer.concat([header, ...entries, ...icoImages]);
writeFileSync(join(publicDir, 'favicon.ico'), ico);
writeFileSync(join(publicDir, 'site-icon.ico'), ico);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <rect width="48" height="48" rx="10" fill="#0B4DAE"/>
  <image href="/logo.webp" x="7" y="4" width="34" height="34" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
writeFileSync(join(publicDir, 'favicon.svg'), svg);

console.log('Generated blue brand favicons in public/');
