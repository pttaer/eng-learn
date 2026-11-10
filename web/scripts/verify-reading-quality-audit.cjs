/**
 * verify-reading-quality-audit.cjs
 * Comprehensive verification of all reading items across:
 * - web/content/reading.md (21 intensive reading articles)
 * - web/src/ielts/data/parts/reading-*.json (30 passages, 400 questions)
 * - web/src/ielts/views/reading-drills.ts (14 attack drills)
 * - web/src/modules/exam-cockpit-dossier.ts (40 CD-IELTS reading questions)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== VERIFYING READING QUALITY & PEDAGOGICAL AUDIT ===');

const repoRoot = path.resolve(__dirname, '..', '..');
const webDir = path.join(repoRoot, 'web');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`    Error: ${err.message}`);
    process.exitCode = 1;
  }
}

// 1. Audit reading.md (Intensive Reading Articles)
test('Verify web/content/reading.md articles and 4-pass structure', () => {
  const mdPath = path.join(webDir, 'content', 'reading.md');
  assert(fs.existsSync(mdPath), 'reading.md must exist');
  const text = fs.readFileSync(mdPath, 'utf8');
  const rawArticles = text.split('<!-- ARTICLE:');
  assert(rawArticles.length >= 22, `Expected at least 21 articles, found ${rawArticles.length - 1}`);

  for (let i = 1; i < rawArticles.length; i++) {
    const art = rawArticles[i];
    const idMatch = art.match(/id:\s*([^\r\n]+)/);
    const cefrMatch = art.match(/cefrLevel:\s*([A-Z0-9]+)/);
    assert(idMatch, `Article ${i} missing id`);
    assert(cefrMatch, `Article ${i} missing cefrLevel`);
    const id = idMatch[1].trim();

    // Comprehension checks
    const compSection = art.match(/### Comprehension Checks([\s\S]*?)(## Syntax Dissection|$)/);
    assert(compSection, `Article ${id} missing Comprehension Checks`);
    const qMatches = [...compSection[1].matchAll(/- Q:\s*([^\r\n]+)\r?\n\s*A:\s*([^\r\n]+)/g)];
    assert(qMatches.length >= 2, `Article ${id} must have at least 2 comprehension checks`);
    for (const qm of qMatches) {
      assert(qm[1].trim().length > 5, `Article ${id} question too short: "${qm[1]}"`);
      assert(qm[2].trim().length > 2, `Article ${id} answer too short: "${qm[2]}"`);
    }

    // Syntax dissection with Vietnamese guidance
    const syntaxSection = art.match(/## Syntax Dissection([\s\S]*?)(## Sentence Mining|$)/);
    assert(syntaxSection, `Article ${id} missing Syntax Dissection`);
    assert(syntaxSection[1].includes('(') && syntaxSection[1].includes(')'), `Article ${id} syntax analysis should include Vietnamese translation/guidance`);

    // Sentence mining targets in context sentence
    const miningSection = art.match(/## Sentence Mining([\s\S]*?)(<!-- ARTICLE:|$)/);
    if (miningSection) {
      const mBlocks = miningSection[1].split(/###\s+/).filter(Boolean);
      for (const b of mBlocks) {
        const targetWord = b.trim().split('\n')[0].trim();
        const sentenceMatch = b.match(/- \*\*Sentence\*\*:\s*([^\r\n]+)/);
        if (sentenceMatch) {
          const sent = sentenceMatch[1].trim();
          const wordRegex = new RegExp('\\b' + targetWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
          assert(wordRegex.test(sent), `Article ${id}: target word "${targetWord}" must appear in sentence: "${sent}"`);
        }
      }
    }
  }
});

// 2. Audit IELTS Reading Parts 1-7
test('Verify IELTS reading parts (30 passages, 400 questions)', () => {
  const partsDir = path.join(webDir, 'src', 'ielts', 'data', 'parts');
  const partFiles = fs.readdirSync(partsDir).filter(f => f.startsWith('reading-') && f.endsWith('.json'));
  assert.strictEqual(partFiles.length, 7, 'Expected 7 reading part files');

  let totalPassages = 0;
  let totalQuestions = 0;

  for (const pf of partFiles) {
    const passages = JSON.parse(fs.readFileSync(path.join(partsDir, pf), 'utf8'));
    for (const p of passages) {
      totalPassages++;
      assert(p.id && p.title && p.band && Array.isArray(p.paragraphs), `Passage missing core fields in ${pf}`);
      const fullText = p.paragraphs.map(x => x.text).join(' ');
      const lowerText = fullText.toLowerCase();

      // Word n-grams for stem copy detection
      const words = lowerText.replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
      const ngrams = new Set();
      for (let i = 0; i + 6 <= words.length; i++) {
        ngrams.add(words.slice(i, i + 6).join(' '));
      }

      const tfngKeys = [];
      for (const q of p.questions) {
        totalQuestions++;
        assert(q.id && q.prompt && q.type, `Question ${q.id} in ${pf} missing id, prompt, or type`);
        assert(q.why && q.why.trim().length > 10, `Question ${q.id} in ${pf} missing detailed why explanation`);

        // Check stem copying
        const pw = q.prompt.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
        let hits = 0;
        for (let i = 0; i + 6 <= pw.length; i++) {
          if (ngrams.has(pw.slice(i, i + 6).join(' '))) hits++;
        }
        assert(hits < 2, `Question ${q.id} prompt appears copied from passage without paraphrasing`);

        // Check TFNG / YNNG
        if (['tfng', 'ynng'].includes(q.type)) {
          const valid = q.type === 'tfng' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : ['YES', 'NO', 'NOT GIVEN'];
          assert(valid.includes(q.answer), `Question ${q.id} has invalid key ${q.answer}`);
          tfngKeys.push(q.answer);

          if (q.answer !== 'NOT GIVEN') {
            assert(q.evidence, `Question ${q.id} has answer ${q.answer} but missing evidence anchor`);
            const para = p.paragraphs[q.evidence.paraIndex];
            assert(para, `Question ${q.id} invalid paraIndex ${q.evidence.paraIndex}`);
            const slice = para.text.slice(q.evidence.start, q.evidence.end);
            assert.strictEqual(slice, q.evidence.evidenceText, `Question ${q.id} evidenceText mismatch with paragraph slice`);
          }
        }

        // Check MCQ
        if (q.type === 'mcq' && q.options) {
          assert(q.options.length >= 3 && q.options.length <= 5, `Question ${q.id} invalid options count: ${q.options.length}`);
          const cleanOpts = q.options.map(o => o.replace(/^[A-E]\.\s*/, '').trim());
          const uniqueOpts = new Set(cleanOpts);
          assert.strictEqual(uniqueOpts.size, q.options.length, `Question ${q.id} has duplicate options: ${JSON.stringify(q.options)}`);

          const letters = ['A', 'B', 'C', 'D', 'E'];
          if (typeof q.answer === 'string' && letters.includes(q.answer)) {
            const idx = letters.indexOf(q.answer);
            assert(q.options[idx], `Question ${q.id} answer letter ${q.answer} out of bounds`);
          } else {
            const hasMatch = q.options.some(o => o.includes(String(q.answer)));
            assert(hasMatch, `Question ${q.id} answer ${q.answer} not found in options`);
          }
        }

        // Check completion answers
        if (['complete', 'sentence', 'summary', 'table', 'short'].includes(q.type)) {
          const answers = Array.isArray(q.answer) ? q.answer : [q.answer];
          const hasPassageMatch = answers.some(ans => lowerText.includes(String(ans).toLowerCase()));
          assert(hasPassageMatch, `Question ${q.id} completion answer ${JSON.stringify(q.answer)} has no substring in passage`);
        }
      }

      // Check TFNG balance
      if (tfngKeys.length > 0) {
        const uniqueKeys = new Set(tfngKeys);
        assert(uniqueKeys.size >= 2, `Passage ${p.id} has monolithic TFNG keys: ${tfngKeys.join(',')}`);
        assert(tfngKeys.includes('NOT GIVEN'), `Passage ${p.id} missing NOT GIVEN key`);
      }
    }
  }

  assert.strictEqual(totalPassages, 30, 'Expected exactly 30 reading passages');
  assert.strictEqual(totalQuestions, 400, 'Expected exactly 400 reading questions');
});

// 3. Audit IELTS Reading Attack Drills (14 Question Types)
test('Verify IELTS reading attack drills (14 question types)', () => {
  const drillsPath = path.join(webDir, 'src', 'ielts', 'views', 'reading-drills.ts');
  assert(fs.existsSync(drillsPath), 'reading-drills.ts must exist');
  const code = fs.readFileSync(drillsPath, 'utf8');

  // Verify all 14 drill IDs are present
  const requiredDrills = [
    'drill-01-tfng',
    'drill-02-ynng',
    'drill-03-short-answer',
    'drill-04-sentence-completion',
    'drill-05-summary-completion',
    'drill-06-table-completion',
    'drill-07-flow-chart',
    'drill-08-diagram-labelling',
    'drill-09-mcq-single',
    'drill-10-pick-multiple',
    'drill-11-matching-headings',
    'drill-12-matching-info',
    'drill-13-matching-features',
    'drill-14-matching-endings'
  ];

  for (const dId of requiredDrills) {
    assert(code.includes(dId), `Missing drill definition for ${dId}`);
  }

  assert(code.includes('trapExplanation:'), 'Drills must include trapExplanation');
  assert(code.includes('rationale:'), 'Drills must include rationale');
  assert(code.includes('synonymPairs:'), 'Drills must include synonym mapping pairs');
});

// 4. Audit CD-IELTS Reading Mock Questions in Exam Cockpit
test('Verify Exam Cockpit 40 authentic reading questions', () => {
  const cockpitPath = path.join(webDir, 'src', 'modules', 'exam-cockpit-dossier.ts');
  assert(fs.existsSync(cockpitPath), 'exam-cockpit-dossier.ts must exist');
  const code = fs.readFileSync(cockpitPath, 'utf8');

  // Check 40 questions data structure
  assert(code.includes('// Q1-13: TRUE / FALSE / NOT GIVEN on Passage 1 (The Falkirk Wheel)'), 'Passage 1 questions present');
  assert(code.includes('// Q14-26: Multiple choice on Passage 2 (Collecting)'), 'Passage 2 questions present');
  assert(code.includes('// Q27-40: Sentence completion on Passage 3 (Language)'), 'Passage 3 questions present');

  // Check key distribution
  assert(code.includes("correctAnswer: 'TRUE'"), 'Contains TRUE keys');
  assert(code.includes("correctAnswer: 'FALSE'"), 'Contains FALSE keys');
  assert(code.includes("correctAnswer: 'NOT GIVEN'"), 'Contains NOT GIVEN keys');
  assert(code.includes("correctAnswer: 'vocal grooming'"), 'Contains exact gap fill answers');
});

console.log(`\nResults: ${passedTests}/${totalTests} reading quality test suites passed cleanly.`);
if (process.exitCode) {
  process.exit(process.exitCode);
}

