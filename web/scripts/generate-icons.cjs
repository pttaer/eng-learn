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
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = makeChunk('IHDR', ihdrData);

  const rowSize = 1 + width * 4;
  const raw = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    raw[rowOffset] = 0; // Filter: None
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

// Distance from point (px, py) to line segment (x1, y1) - (x2, y2)
function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function renderHudIcon(size, outputPath) {
  const scale = size / 512;
  const cx = size / 2;
  const cy = size / 2;

  // Pre-calculate geometry in pixel coordinates
  const rCore = 52 * scale;
  const rAperture = 16 * scale;
  const rDot = 5 * scale;
  const rInner = 116 * scale;
  const rMid = 168 * scale;
  const rOuter = 212 * scale;

  // Spines
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

  // Corner brackets
  const bPad = 28 * scale;
  const bLen = 40 * scale;
  const bThick = 3.5 * scale;
  const bracketSegments = [
    // TL
    { x1: bPad, y1: bPad + bLen, x2: bPad, y2: bPad },
    { x1: bPad, y1: bPad, x2: bPad + bLen, y2: bPad },
    // TR
    { x1: size - bPad - bLen, y1: bPad, x2: size - bPad, y2: bPad },
    { x1: size - bPad, y1: bPad, x2: size - bPad, y2: bPad + bLen },
    // BL
    { x1: bPad, y1: size - bPad - bLen, x2: bPad, y2: size - bPad },
    { x1: bPad, y1: size - bPad, x2: bPad + bLen, y2: size - bPad },
    // BR
    { x1: size - bPad - bLen, y1: size - bPad, x2: size - bPad, y2: size - bPad },
    { x1: size - bPad, y1: size - bPad, x2: size - bPad, y2: size - bPad - bLen }
  ];

  // Cardinal crosshair ticks
  const t1 = 36 * scale;
  const t2 = 52 * scale;
  const tickThick = 2.2 * scale;
  const tickSegments = [
    { x1: cx, y1: t1, x2: cx, y2: t2 },
    { x1: cx, y1: size - t2, x2: cx, y2: size - t1 },
    { x1: t1, y1: cy, x2: t2, y2: cy },
    { x1: size - t2, y1: cy, x2: size - t1, y2: cy }
  ];

  // Check if point (px, py) is black
  function isBlackSample(px, py) {
    const distToCenter = Math.hypot(px - cx, py - cy);

    // Singularity center dot
    if (distToCenter <= rDot) return true;
    // Aperture ring (white void)
    if (distToCenter <= rAperture) return false;
    // Central core disc
    if (distToCenter <= rCore) return true;

    // Terminal dots on major spines
    for (let i = 0; i < spines.length; i++) {
      const s = spines[i];
      if (s.dotR > 0) {
        if (Math.hypot(px - s.x2, py - s.y2) <= s.dotR) return true;
      }
    }

    // Spines
    for (let i = 0; i < spines.length; i++) {
      const s = spines[i];
      if (distToSegment(px, py, s.x1, s.y1, s.x2, s.y2) <= s.width / 2) {
        return true;
      }
    }

    // Concentric rings (thin strokes)
    const ringInnerDist = Math.abs(distToCenter - rInner);
    if (ringInnerDist <= (1.2 * scale)) return true;

    const ringMidDist = Math.abs(distToCenter - rMid);
    if (ringMidDist <= (1.2 * scale)) return true;

    const ringOuterDist = Math.abs(distToCenter - rOuter);
    if (ringOuterDist <= (1.0 * scale)) {
      // Dashed ring: check angle
      const angle = (Math.atan2(py - cy, px - cx) + Math.PI * 2) % (Math.PI * 2);
      const dashStep = Math.PI / 24;
      if ((angle % dashStep) < (dashStep * 0.55)) return true;
    }

    // Corner brackets
    for (let i = 0; i < bracketSegments.length; i++) {
      const seg = bracketSegments[i];
      if (distToSegment(px, py, seg.x1, seg.y1, seg.x2, seg.y2) <= bThick / 2) {
        return true;
      }
    }

    // Cardinal ticks
    for (let i = 0; i < tickSegments.length; i++) {
      const seg = tickSegments[i];
      if (distToSegment(px, py, seg.x1, seg.y1, seg.x2, seg.y2) <= tickThick / 2) {
        return true;
      }
    }

    return false;
  }

  // Render with 2x2 supersampling (4 samples per pixel for anti-aliasing)
  const pngBuffer = createPng(size, size, (x, y) => {
    let blackCount = 0;
    const offsets = [0.25, 0.75];
    for (let ox of offsets) {
      for (let oy of offsets) {
        if (isBlackSample(x + ox, y + oy)) {
          blackCount++;
        }
      }
    }

    if (blackCount === 0) {
      return [255, 255, 255, 255]; // Pure white
    } else if (blackCount === 4) {
      return [0, 0, 0, 255]; // Pure black
    } else {
      // Smooth antialiased gray
      const gray = Math.round(255 * (1 - blackCount / 4));
      return [gray, gray, gray, 255];
    }
  });

  fs.writeFileSync(outputPath, pngBuffer);
  console.log(`[PWA ICON] Successfully generated ${outputPath} (${size}x${size}, ${pngBuffer.length} bytes)`);
}

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

renderHudIcon(192, path.join(publicDir, 'icon-192.png'));
renderHudIcon(512, path.join(publicDir, 'icon-512.png'));
