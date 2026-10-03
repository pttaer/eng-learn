const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1));
    table[i] = c;
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(width, height, getPixel) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = makeChunk('IHDR', ihdrData);

  const rowSize = 1 + width * 4;
  const raw = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    raw[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      const pxOffset = rowOffset + 1 + x * 4;
      raw[pxOffset] = r;
      raw[pxOffset + 1] = g;
      raw[pxOffset + 2] = b;
      raw[pxOffset + 3] = a;
    }
  }
  const idat = makeChunk('IDAT', zlib.deflateSync(raw));
  const iend = makeChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([sig, ihdr, idat, iend]);
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function renderHudIconPng(size) {
  const scale = size / 512;
  const cx = size / 2;
  const cy = size / 2;

  const rCore = 52 * scale;
  const rAperture = 16 * scale;
  const rDot = 5 * scale;
  const rInner = 116 * scale;
  const rMid = 168 * scale;
  const rOuter = 212 * scale;

  const spineCount = 24;
  const spines = [];
  for (let i = 0; i < spineCount; i++) {
    const angle = (i / spineCount) * Math.PI * 2 - Math.PI / 2;
    const isMajor = (i % 4 === 0);
    const len = (isMajor ? 140 : (85 + Math.sin(angle * 3) * 25)) * scale;
    const width = (isMajor ? 2.8 : 1.6) * scale;
    const x1 = cx + Math.cos(angle) * rCore;
    const y1 = cy + Math.sin(angle) * rCore;
    const x2 = cx + Math.cos(angle) * (rCore + len);
    const y2 = cy + Math.sin(angle) * (rCore + len);
    const dotR = isMajor ? (3.5 * scale) : 0;
    spines.push({ x1, y1, x2, y2, width, isMajor, dotR });
  }

  const bPad = 28 * scale;
  const bLen = 40 * scale;
  const bThick = 3.5 * scale;

  return createPng(size, size, (x, y) => {
    // 1. Dark charcoal rounded background #111111
    const bgCorner = 48 * scale;
    const inBg = (
      (x >= bgCorner && x < size - bgCorner && y >= 0 && y < size) ||
      (x >= 0 && x < size && y >= bgCorner && y < size - bgCorner) ||
      Math.hypot(x - bgCorner, y - bgCorner) <= bgCorner ||
      Math.hypot(x - (size - bgCorner), y - bgCorner) <= bgCorner ||
      Math.hypot(x - bgCorner, y - (size - bgCorner)) <= bgCorner ||
      Math.hypot(x - (size - bgCorner), y - (size - bgCorner)) <= bgCorner
    );

    if (!inBg) return [0, 0, 0, 0];

    const dCenter = Math.hypot(x - cx, y - cy);

    // Center Accent Core
    if (dCenter <= rCore) {
      if (dCenter <= rDot) return [250, 250, 249, 255];
      if (dCenter <= rAperture) return [17, 17, 17, 255];
      return [165, 180, 252, 255]; // #a5b4fc
    }

    // Rings
    if (Math.abs(dCenter - rInner) < 1.0 * scale) return [250, 250, 249, 100];
    if (Math.abs(dCenter - rMid) < 1.0 * scale) return [165, 180, 252, 180];
    if (Math.abs(dCenter - rOuter) < 1.2 * scale) return [250, 250, 249, 80];

    // Spines
    for (const s of spines) {
      if (s.dotR > 0 && Math.hypot(x - s.x2, y - s.y2) <= s.dotR) {
        return [165, 180, 252, 255];
      }
      if (distToSegment(x, y, s.x1, s.y1, s.x2, s.y2) <= s.width / 2) {
        return s.isMajor ? [165, 180, 252, 220] : [250, 250, 249, 140];
      }
    }

    // Corner brackets
    const nearLeft = x >= bPad && x <= bPad + bThick;
    const nearRight = x >= size - bPad - bThick && x <= size - bPad;
    const nearTop = y >= bPad && y <= bPad + bThick;
    const nearBottom = y >= size - bPad - bThick && y <= size - bPad;

    const inTL = (nearLeft && y >= bPad && y <= bPad + bLen) || (nearTop && x >= bPad && x <= bPad + bLen);
    const inTR = (nearRight && y >= bPad && y <= bPad + bLen) || (nearTop && x >= size - bPad - bLen && x <= size - bPad);
    const inBL = (nearLeft && y >= size - bPad - bLen && y <= size - bPad) || (nearBottom && x >= bPad && x <= bPad + bLen);
    const inBR = (nearRight && y >= size - bPad - bLen && y <= size - bPad) || (nearBottom && x >= size - bPad - bLen && x <= size - bPad);

    if (inTL || inTR || inBL || inBR) {
      return [165, 180, 252, 255];
    }

    return [17, 17, 17, 255];
  });
}

function buildIcoFile(resolutions) {
  const images = [];
  for (const res of resolutions) {
    console.log(`- Generating ${res}x${res} PNG frame...`);
    const pngBuf = renderHudIconPng(res);
    images.push({ size: res, data: pngBuf });
  }

  const count = images.length;
  const headerSize = 6;
  const entrySize = 16;
  let currentOffset = headerSize + (count * entrySize);

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type = 1 (ico)
  header.writeUInt16LE(count, 4); // count

  const entries = [];
  for (const img of images) {
    const entry = Buffer.alloc(entrySize);
    entry.writeUInt8(img.size === 256 ? 0 : img.size, 0); // width
    entry.writeUInt8(img.size === 256 ? 0 : img.size, 1); // height
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bit count
    entry.writeUInt32LE(img.data.length, 8); // bytes in res
    entry.writeUInt32LE(currentOffset, 12); // image offset
    entries.push(entry);
    currentOffset += img.data.length;
  }

  const allBuffers = [header, ...entries, ...images.map(img => img.data)];
  return Buffer.concat(allBuffers);
}

const outputPath = path.join(__dirname, '../public/icon.ico');
console.log('[ICO GENERATOR] Generating multi-resolution icon.ico...');
const icoBuffer = buildIcoFile([256, 128, 64, 48, 32, 16]);
fs.writeFileSync(outputPath, icoBuffer);
console.log(`✅ [ICO GENERATOR COMPLETE] Successfully generated ${outputPath} (${(icoBuffer.length / 1024).toFixed(1)} KB)`);
