/**
 * Updates web/release/win-unpacked/resources/app.asar with current dist/ bundle.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== PACKING DESKTOP ASAR ARCHIVE ===');

const webDir = path.resolve(__dirname, '..');
const stagingDir = path.join(webDir, '.asar-staging');
const asarBin = path.join(webDir, 'node_modules/@electron/asar/bin/asar.js');
const targetAsar = path.join(webDir, 'release/win-unpacked/resources/app.asar');

if (!fs.existsSync(asarBin)) {
  console.error('[FAIL] @electron/asar binary not found at:', asarBin);
  process.exit(1);
}

// 1. Clean and prepare staging directory
if (fs.existsSync(stagingDir)) {
  fs.rmSync(stagingDir, { recursive: true, force: true });
}
fs.mkdirSync(stagingDir, { recursive: true });

// 2. Helper to copy directories recursively
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 3. Populate staging with dist, electron, package.json, public, and minimal runtime node_modules
console.log('- Copying dist/ bundle to staging...');
copyDirSync(path.join(webDir, 'dist'), path.join(stagingDir, 'dist'));

console.log('- Copying electron shell to staging...');
copyDirSync(path.join(webDir, 'electron'), path.join(stagingDir, 'electron'));

console.log('- Copying package.json to staging...');
fs.copyFileSync(path.join(webDir, 'package.json'), path.join(stagingDir, 'package.json'));

console.log('- Copying public assets to staging...');
copyDirSync(path.join(webDir, 'public'), path.join(stagingDir, 'public'));

console.log('- Copying runtime animejs module to staging...');
copyDirSync(path.join(webDir, 'node_modules/animejs'), path.join(stagingDir, 'node_modules/animejs'));

// 4. Pack staging directory into app.asar
console.log(`- Packing staging directory into ${targetAsar}...`);
execSync(`"${process.execPath}" "${asarBin}" pack "${stagingDir}" "${targetAsar}"`, {
  stdio: 'inherit'
});

// 5. Cleanup staging
fs.rmSync(stagingDir, { recursive: true, force: true });

const stats = fs.statSync(targetAsar);
console.log(`✓ [SUCCESS] Successfully packed app.asar (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
