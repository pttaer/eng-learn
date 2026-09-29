// web/scripts/verify-collocation-spotter.cjs
const assert = require('assert');

function levenshtein(a, b) {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const matrix = Array.from({ length: al + 1 }, () => new Int32Array(bl + 1));
  for (let i = 0; i <= al; i++) matrix[i][0] = i;
  for (let j = 0; j <= bl; j++) matrix[0][j] = j;

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[al][bl];
}

function cleanTokens(str) {
  if (!str) return [];
  return str
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function fuzzyMatchPhrase(spokenText, targetPhrase) {
  const spokenTokens = cleanTokens(spokenText);
  const targetTokens = cleanTokens(targetPhrase);
  if (targetTokens.length === 0 || spokenTokens.length === 0) return false;
  if (targetTokens.length > spokenTokens.length) return false;

  const n = targetTokens.length;
  for (let i = 0; i <= spokenTokens.length - n; i++) {
    let allMatched = true;
    for (let j = 0; j < n; j++) {
      const sTok = spokenTokens[i + j];
      const tTok = targetTokens[j];

      if (sTok === tTok) continue;
      // Allow plural or past tense inflection if root matches
      if (sTok.startsWith(tTok) || tTok.startsWith(sTok)) continue;
      // Silent 'e' drop before -ing (e.g. raise -> raising, take -> taking, make -> making)
      if (sTok.endsWith('ing') && tTok.endsWith('e') && sTok.slice(0, -3) === tTok.slice(0, -1)) continue;
      if (tTok.endsWith('ing') && sTok.endsWith('e') && tTok.slice(0, -3) === sTok.slice(0, -1)) continue;
      // 'y' to 'ies'/'ied' inflection (e.g. apply -> applied/applies, supply -> supplied)
      if ((sTok.endsWith('ied') || sTok.endsWith('ies')) && tTok.endsWith('y') && sTok.slice(0, -3) === tTok.slice(0, -1)) continue;
      if ((tTok.endsWith('ied') || tTok.endsWith('ies')) && sTok.endsWith('y') && tTok.slice(0, -3) === sTok.slice(0, -1)) continue;
      // Levenshtein distance <= 1 for single-letter speech recognition noise
      if (levenshtein(sTok, tTok) <= 1) continue;

      allMatched = false;
      break;
    }
    if (allMatched) return true;
  }
  return false;
}

console.log('[TEST] Starting Collocation Spotter Fuzzy Match Verification...');

// 1. Exact match
assert(fuzzyMatchPhrase('we need to raise concerns immediately', 'raise concerns') === true, 'Exact match failed');
assert(fuzzyMatchPhrase('we must conduct research into this domain', 'conduct research') === true, 'Exact match 2 failed');

// 2. Inflected match (past tense 'raised concerns', plural 'make decisions', '-ing')
assert(fuzzyMatchPhrase('he raised concerns regarding safety', 'raise concerns') === true, 'Inflected match failed');
assert(fuzzyMatchPhrase('they make decisions quickly', 'make decision') === true, 'Plural inflection match failed');
assert(fuzzyMatchPhrase('she is raising concerns about the budget', 'raise concerns') === true, 'Gerund inflection match failed');
assert(fuzzyMatchPhrase('scientists applied pressure to the structure', 'apply pressure') === true, 'Past tense y->ied match failed');

// 3. Multi-word collocation ('take into account', 'single point of failure')
assert(fuzzyMatchPhrase('we must take into account all factors', 'take into account') === true, 'Multi-word match failed');
assert(fuzzyMatchPhrase('this avoids a single point of failure in our architecture', 'single point of failure') === true, '4-word collocation failed');

// 4. Levenshtein typo / recognition noise ('he took into acount', single char tolerance <= 1)
assert(fuzzyMatchPhrase('he took into acount the risks', 'take into account') === false); // 'took' != 'take' prefix
assert(fuzzyMatchPhrase('we take into acount the risks', 'take into account') === true, 'Fuzzy typo match failed');
assert(fuzzyMatchPhrase('vital role in the firm', 'vitel role') === true, 'Single substitution typo failed');

// 5. Negative cases & boundaries
assert(fuzzyMatchPhrase('we decided to lower the cost', 'raise concerns') === false, 'Negative match failed');
assert(fuzzyMatchPhrase('we raise taxes every single year', 'raise concerns') === false, 'Partial 1-word match should fail');
assert(fuzzyMatchPhrase('', 'raise concerns') === false, 'Empty spoken text should fail');
assert(fuzzyMatchPhrase('we talk', '') === false, 'Empty target phrase should fail');
assert(fuzzyMatchPhrase('short text', 'a very long multi word collocation phrase') === false, 'Target longer than spoken should fail');

console.log('✓ All Collocation Spotter fuzzy matching tests passed cleanly.');
