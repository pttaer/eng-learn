const fs = require('fs');
const cp = require('child_process');

const originalContent = cp.execSync('git show HEAD:web/src/core/i18n.ts', { encoding: 'utf8' });
const applyContent = fs.readFileSync('web/scripts/apply-i18n-update.cjs', 'utf8');

const enMatch = applyContent.match(/const NEW_EN_KEYS = {([\s\S]*?)};/);
const lines = enMatch[1].split('\n');
const applyKeys = [];
lines.forEach(l => {
  const m = l.match(/'([^']+)'\s*:/);
  if (m) applyKeys.push(m[1]);
});

const duplicates = [];
applyKeys.forEach(k => {
  const needle = "'" + k + "':";
  if (originalContent.includes(needle)) {
    duplicates.push(k);
  }
});
console.log('Duplicates in NEW_EN_KEYS that exist in original i18n.ts:', duplicates);

