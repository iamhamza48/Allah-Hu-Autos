import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const svg = readFileSync(join(publicDir, 'favicon.svg'));

const sizes = [
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-192x192.png', size: 192 },
];

for (const { name, size } of sizes) {
  const png = await sharp(svg).resize(size, size).png().toBuffer();
  writeFileSync(join(publicDir, name), png);
}

const icoSizes = [16, 32, 48];
const icoImages = await Promise.all(
  icoSizes.map((size) => sharp(svg).resize(size, size).png().toBuffer()),
);

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

writeFileSync(join(publicDir, 'favicon.ico'), Buffer.concat([header, ...entries, ...icoImages]));

console.log('Generated favicon PNG and ICO assets in public/');
