const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[DESKTOP TEST 3] Verifying Installer Artifact...');

const releaseDir = path.join(__dirname, '../release');
assert(fs.existsSync(releaseDir), 'release/ directory must exist');

const files = fs.readdirSync(releaseDir);
const exeFile = files.find(f => f.endsWith('.exe') && f.toLowerCase().includes('setup'));
assert(exeFile, `Expected Setup .exe in release/, found: ${files.join(', ')}`);

const exePath = path.join(releaseDir, exeFile);
const stats = fs.statSync(exePath);
console.log(`- Found installer executable: ${exeFile} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);
assert(stats.size > 40 * 1024 * 1024, 'Installer executable must be > 40 MB');

// Verify PE binary header ('MZ')
const fd = fs.openSync(exePath, 'r');
const header = Buffer.alloc(2);
fs.readSync(fd, header, 0, 2, 0);
fs.closeSync(fd);
assert(header.toString('ascii') === 'MZ', 'File must be a valid Windows PE executable (MZ header)');

console.log('✅ [DESKTOP TEST 3 PASSED] Windows Installer .exe verified.');
