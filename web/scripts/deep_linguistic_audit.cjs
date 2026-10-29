const fs = require('fs');
const path = require('path');

const webDir = path.join(__dirname, '..');
const findings = [];

function record(file, loc, issue, detail) {
  findings.push({ file, loc, issue, detail });
}

// Function to check any text string
function checkText(text, file, loc) {
  if (typeof text !== 'string') return;

  // 1. Encoding artifacts (\ufffd replacement character)
  if (text.includes('\ufffd')) {
    record(file, loc, 'MOJIBAKE', 'Contains replacement character \\ufffd');
  }

  // 2. Double spaces
  if (/(\S)  (\S)/.test(text)) {
    // ignore intentional markdown spaces
    const match = text.match(/(\S)  (\S)/);
    record(file, loc, 'DOUBLE_SPACE', `"${match[0]}"`);
  }

  // 3. Space before punctuation
  const spaceBeforePunct = text.match(/\b\w+\s+([,.?!;:])/);
  if (spaceBeforePunct && !text.includes('? :') && !text.includes('e.g. ,')) {
    record(file, loc, 'SPACE_BEFORE_PUNCT', spaceBeforePunct[0]);
  }

  // 4. Missing space after comma
  const missingSpaceComma = text.match(/[a-zA-Z0-9],[a-zA-Z]/);
  if (missingSpaceComma && !text.includes('http') && !text.includes('data:')) {
    record(file, loc, 'MISSING_SPACE_AFTER_COMMA', missingSpaceComma[0]);
  }

  // 5. English article errors: 'a' before vowel, 'an' before consonant
  // Common vowels: a, e, i, o (excluding university, unique, etc.)
  const badA = text.match(/\ba\s+(apple|orange|egg|incident|accident|element|effect|outcome|alternative|individual|option|organism|error|unusual|important|immediate|academic|essential|accurate|unexpected|unforeseen)\b/i);
  if (badA) {
    record(file, loc, 'A_BEFORE_VOWEL', badA[0]);
  }

  const badAn = text.match(/\ban\s+(book|car|dog|person|student|system|process|method|problem|question|result|study|table|firm|large|small|major|significant|different|new|good|bad)\b/i);
  if (badAn) {
    record(file, loc, 'AN_BEFORE_CONSONANT', badAn[0]);
  }

  // 6. Repeated words
  const repeated = text.match(/\b(the|in|to|of|is|and|for|with|from|by|at|on|that)\s+\1\b/i);
  if (repeated && !['that that'].includes(repeated[0].toLowerCase())) {
    record(file, loc, 'REPEATED_WORD', repeated[0]);
  }

  // 7. Unmatched parens in prompt or explanation
  const openP = (text.match(/\(/g) || []).length;
  const closeP = (text.match(/\)/g) || []).length;
  if (openP !== closeP && Math.abs(openP - closeP) > 0 && !text.includes(':)') && !text.includes(':-(')) {
    // Only flag if not emoticons or markdown links
    if (!text.includes('](')) {
      record(file, loc, 'UNMATCHED_PARENS', `( count: ${openP}, ) count: ${closeP}`);
    }
  }

  // 8. Placeholders
  if (/\b(TODO|TBD|FIXME|untranslated)\b/i.test(text)) {
    record(file, loc, 'PLACEHOLDER', text);
  }
}

// Traverse objects
function traverse(obj, file, pathStr = '') {
  if (!obj) return;
  if (typeof obj === 'string') {
    checkText(obj, file, pathStr);
  } else if (Array.isArray(obj)) {
    obj.forEach((item, idx) => traverse(item, file, `${pathStr}[${idx}]`));
  } else if (typeof obj === 'object') {
    Object.keys(obj).forEach(k => traverse(obj[k], file, pathStr ? `${pathStr}.${k}` : k));
  }
}

// Audit files
const targetFiles = [
  'src/assets/data/tenses-bank.json',
  'src/assets/data/diagnostic-questions.json',
  'src/assets/data/collocations.json',
  'src/assets/data/drills.json',
  'src/assets/data/drill-sets.json',
  'src/assets/data/grammar.json',
  'src/assets/data/reading.json',
  'src/assets/data/listening.json',
  'src/assets/data/vocabulary.json',
  'src/assets/data/email-builder.json',
  'src/assets/data/habits.json',
  'src/assets/data/ielts-tips.json',
  'src/assets/data/strategy.json'
];

targetFiles.forEach(rel => {
  const p = path.join(webDir, rel);
  if (fs.existsSync(p)) {
    try {
      const data = JSON.parse(fs.readFileSync(p, 'utf8'));
      traverse(data, rel);
    } catch (e) {
      record(rel, '', 'JSON_PARSE', e.message);
    }
  }
});

// Parts files
const partsDir = path.join(webDir, 'src/ielts/data/parts');
if (fs.existsSync(partsDir)) {
  fs.readdirSync(partsDir).filter(f => f.endsWith('.json')).forEach(f => {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(partsDir, f), 'utf8'));
      traverse(data, `src/ielts/data/parts/${f}`);
    } catch (e) {
      record(`parts/${f}`, '', 'JSON_PARSE', e.message);
    }
  });
}

console.log(`Deep Linguistic Audit: ${findings.length} findings`);
const byIssue = {};
findings.forEach(f => {
  byIssue[f.issue] = (byIssue[f.issue] || 0) + 1;
});
console.log('Summary by issue type:', byIssue);

const nonTipsFindings = findings.filter(f => !f.file.includes('ielts-tips'));
console.log(`Non-Tips Findings: ${nonTipsFindings.length}`);
nonTipsFindings.forEach(f => {
  console.log(`[${f.issue}] ${f.file} (${f.loc}): ${f.detail}`);
});
