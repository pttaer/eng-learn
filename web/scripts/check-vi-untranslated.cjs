const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const i18nPath = path.join(rootDir, 'src', 'core', 'i18n.ts');
const i18nContent = fs.readFileSync(i18nPath, 'utf8');

function extractDictionary(source, dictName) {
  const marker = `export const ${dictName}: TranslationDictionary = {`;
  const startIdx = source.indexOf(marker);
  const openBrace = source.indexOf('{', startIdx);
  let braceCount = 1;
  let endIdx = openBrace + 1;
  while (braceCount > 0 && endIdx < source.length) {
    if (source[endIdx] === '{') braceCount++;
    else if (source[endIdx] === '}') braceCount--;
    endIdx++;
  }
  const dictCode = source.slice(openBrace, endIdx);
  const regex = /'([^']+)'\s*:\s*(?:'((?:\\'|[^'])*)'|"((?:\\"|[^"]*)"))/g;
  const dict = {};
  let match;
  while ((match = regex.exec(dictCode)) !== null) {
    dict[match[1]] = (match[2] !== undefined ? match[2] : match[3]).replace(/\\'/g, "'").replace(/\\"/g, '"');
  }
  return dict;
}

const en = extractDictionary(i18nContent, 'EN_DICTIONARY');
const vi = extractDictionary(i18nContent, 'VI_DICTIONARY');

// Check for values in VI that are still 100% English where they shouldn't be
console.log('--- Checking for untranslated VI dictionary entries ---');
const suspiciousVi = [];
for (const [k, v] of Object.entries(vi)) {
  const enVal = en[k];
  if (enVal && v === enVal && v.length > 5 && !/^[A-Z0-9_\-\.\s:]+$/.test(v) && !k.startsWith('chart.') && !k.startsWith('ielts.task')) {
    // Some proper names or codes might be same, but phrases shouldn't be
    if (/[a-z]/.test(v) && v.includes(' ')) {
      suspiciousVi.push({ key: k, en: enVal, vi: v });
    }
  }
}
console.log(`Found ${suspiciousVi.length} identical multi-word entries between EN and VI:`);
suspiciousVi.slice(0, 30).forEach(s => console.log(`  ${s.key}: "${s.en}"`));

