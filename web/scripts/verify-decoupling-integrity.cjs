const fs = require('fs');
const path = require('path');

const WEB_SRC = path.join(__dirname, '..', 'src');
const IELTS_DIR = path.join(WEB_SRC, 'ielts');
const MODULES_DIR = path.join(WEB_SRC, 'modules');

let violations = 0;

function fail(msg) { console.error(`[VIOLATION] ${msg}`); violations++; }

// --- Import boundary scan ---
function scanDir(dir, forbiddenPattern, label, excludeFiles = []) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory() && f.name !== 'node_modules') {
      scanDir(full, forbiddenPattern, label, excludeFiles);
    } else if (f.isFile() && /\.[tj]s$/.test(f.name) && !excludeFiles.includes(f.name)) {
      const matches = fs.readFileSync(full, 'utf8').match(forbiddenPattern);
      if (matches) fail(`${label} in ${path.relative(WEB_SRC, full)}: ${matches.join(', ')}`);
    }
  }
}

// 1. IELTS must not import Singularity dossiers (floating-note and exam-cockpit-dossier are shared, exempt)
scanDir(IELTS_DIR, /from\s+['"][^'"]*\/modules\/(?!floating-note|exam-cockpit-dossier)[^'"]+['"]/g, 'IELTS→Singularity');

// 2. Singularity modules must not import IELTS internals (exam-cockpit-dossier is bridge, exempt)
scanDir(MODULES_DIR, /from\s+['"][^'"]*\/ielts\/[^'"]+['"]/g, 'Singularity→IELTS', ['exam-cockpit-dossier.ts']);

// --- Hardcoded redirect check ---
for (const rel of ['modules/header-hud.ts', 'main.ts']) {
  const p = path.join(WEB_SRC, rel);
  if (!fs.existsSync(p)) continue;
  if (fs.readFileSync(p, 'utf8').includes("window.location.href = './ielts.html'"))
    fail(`Hardcoded ielts.html redirect in ${rel}`);
}

// --- IELTS manifest check (Phase 3 gate — skip if file doesn't exist yet) ---
const manifestIelts = path.join(__dirname, '../android/AndroidManifest-ielts.xml');
if (fs.existsSync(manifestIelts)) {
  const xml = fs.readFileSync(manifestIelts, 'utf8');
  if (!xml.includes('package="com.ielts.cockpit"'))
    fail('AndroidManifest-ielts.xml missing package="com.ielts.cockpit"');
  if (!xml.includes('android:label="IELTS Cockpit"'))
    fail('AndroidManifest-ielts.xml missing android:label="IELTS Cockpit"');
}

if (violations > 0) {
  console.error(`\nFailed with ${violations} boundary violations.`);
  process.exit(1);
} else {
  console.log('[PASS] Decoupling boundaries verified.');
  process.exit(0);
}
