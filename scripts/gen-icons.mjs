import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { writeFileSync } from 'node:fs';

const path = (rel) => fileURLToPath(new URL(rel, import.meta.url));
const SRC = path('../public/logos/logo-icon.png'); // the real brand keyhole mark

// High-res app-router icons (Next auto-emits the <link> tags).
await sharp(SRC).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png().toFile(path('../src/app/icon.png'));
await sharp(SRC).resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png().toFile(path('../src/app/apple-icon.png'));

// favicon.ico — wrap PNGs (16/32/48) in a minimal ICO container.
const sizes = [16, 32, 48];
const pngs = await Promise.all(
  sizes.map((s) =>
    sharp(SRC).resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()
  )
);

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);            // reserved
header.writeUInt16LE(1, 2);            // type = icon
header.writeUInt16LE(sizes.length, 4); // image count

const entries = [];
let offset = 6 + sizes.length * 16;
sizes.forEach((s, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(s >= 256 ? 0 : s, 0);   // width
  e.writeUInt8(s >= 256 ? 0 : s, 1);   // height
  e.writeUInt8(0, 2);                  // palette
  e.writeUInt8(0, 3);                  // reserved
  e.writeUInt16LE(1, 4);               // color planes
  e.writeUInt16LE(32, 6);              // bits per pixel
  e.writeUInt32LE(pngs[i].length, 8);  // size of image data
  e.writeUInt32LE(offset, 12);         // offset
  offset += pngs[i].length;
  entries.push(e);
});

const ico = Buffer.concat([header, ...entries, ...pngs]);
writeFileSync(path('../src/app/favicon.ico'), ico);
console.log('Wrote icon.png, apple-icon.png, favicon.ico from logo-icon.png');
