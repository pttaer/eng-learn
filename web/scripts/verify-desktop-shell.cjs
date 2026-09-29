const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[DESKTOP TEST 1] Verifying Desktop Shell & Icon Architecture...');

const mainPath = path.join(__dirname, '../electron/main.cjs');
assert(fs.existsSync(mainPath), 'electron/main.cjs must exist');

const icoPath = path.join(__dirname, '../public/icon.ico');
assert(fs.existsSync(icoPath), 'public/icon.ico must exist');

// Verify ICO header (0x00 0x00 0x01 0x00)
const icoBuf = fs.readFileSync(icoPath);
assert(icoBuf.readUInt16LE(0) === 0, 'ICO reserved field must be 0');
assert(icoBuf.readUInt16LE(2) === 1, 'ICO type field must be 1 (icon)');
const imageCount = icoBuf.readUInt16LE(4);
assert(imageCount >= 4, `ICO must contain at least 4 image resolutions, found ${imageCount}`);

const mainCode = fs.readFileSync(mainPath, 'utf-8');
assert(mainCode.includes('BrowserWindow'), 'main.cjs must create BrowserWindow');
assert(mainCode.includes('loadFile'), 'main.cjs must load local dist/index.html');
assert(mainCode.includes('icon.ico') || mainCode.includes('icon-512.png'), 'main.cjs must specify icon');

console.log('✅ [DESKTOP TEST 1 PASSED] Desktop shell and icon verified.');
