const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[DESKTOP TEST 2] Verifying Installer Configuration...');

const pkgPath = path.join(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

assert(pkg.main === 'electron/main.cjs', "package.json 'main' must point to 'electron/main.cjs'");
assert(pkg.scripts && pkg.scripts['dist:win'], "package.json must contain 'dist:win' script");
assert(pkg.build, "package.json must contain 'build' configuration for electron-builder");
assert(pkg.build.win && pkg.build.win.target.includes('nsis'), "win.target must include 'nsis'");
assert(pkg.build.nsis && pkg.build.nsis.createDesktopShortcut === true, 'nsis must create desktop shortcut');
assert(pkg.build.nsis && pkg.build.nsis.createStartMenuShortcut === true, 'nsis must create start menu shortcut');

console.log('✅ [DESKTOP TEST 2 PASSED] Installer configuration verified.');
