// Runs every scripts/verify-*.cjs. verify-installer-artifact needs a built release/, so it runs via `npm run test:installer` after dist:win.
// verify-ielts-content needs fully merged IELTS parts data.
const { readdirSync } = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');

const skip = new Set(['verify-installer-artifact.cjs', 'verify-ielts-content.cjs']);
const files = readdirSync(__dirname).filter(f => /^verify-.*\.cjs$/.test(f) && !skip.has(f));
const failed = files.filter(f => spawnSync(process.execPath, [path.join(__dirname, f)], { stdio: 'ignore', timeout: 60000 }).status !== 0);
console.log(`${files.length - failed.length}/${files.length} verify scripts passed`);
if (failed.length) {
  console.error('FAILED:\n  ' + failed.join('\n  '));
  process.exit(1);
}
