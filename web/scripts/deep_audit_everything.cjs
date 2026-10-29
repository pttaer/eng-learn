const fs = require('fs');
const path = require('path');

const webDir = path.join(__dirname, '..');

const findings = [];

function addFinding(category, file, id, message, severity = 'issue') {
  findings.push({ category, file, id, message, severity });
}

// 1. Audit Diagnostic Questions
function auditDiagnostic() {
  const file = 'src/assets/data/diagnostic-questions.json';
  const fullPath = path.join(webDir, file);
  if (!fs.existsSync(fullPath)) return;
  const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  data.forEach(q => {
    if (q.answer < 0 || q.answer >= q.options.length) {
      addFinding('diagnostic', file, q.id, `Answer index ${q.answer} out of bounds`);
    }
    const correctOpt = q.options[q.answer];
    if (q.context && q.context.includes('______')) {
      const filled = q.context.replace('______', correctOpt);
      // check double space or punctuation issues
      if (filled.includes('  ')) {
        addFinding('diagnostic', file, q.id, `Double space when filled: "${filled}"`);
      }
    }
    if (!q.explanation || q.explanation.length < 10) {
      addFinding('diagnostic', file, q.id, `Explanation missing or too short`);
    }
    if (!q.vietnamese || q.vietnamese.length < 10) {
      addFinding('diagnostic', file, q.id, `Vietnamese translation missing or too short`);
    }
  });
}

// 2. Audit Tenses Bank
function auditTenses() {
  const file = 'src/assets/data/tenses-bank.json';
  const fullPath = path.join(webDir, file);
  if (!fs.existsSync(fullPath)) return;
  const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  data.questions.forEach(q => {
    if (q.answer < 0 || q.answer >= q.options.length) {
      addFinding('tenses', file, q.id, `Answer index ${q.answer} out of bounds`);
    }
    if (q.options[q.answer] !== q.blankTarget) {
      addFinding('tenses', file, q.id, `Mismatch: options[answer]="${q.options[q.answer]}" vs blankTarget="${q.blankTarget}"`);
    }
    if (!q.explanation) addFinding('tenses', file, q.id, 'Missing explanation');
    if (!q.vietnameseExplanation) addFinding('tenses', file, q.id, 'Missing vietnameseExplanation');
  });
}

// 3. Audit Vocabulary
function auditVocabulary() {
  const file = 'src/assets/data/vocabulary.json';
  const fullPath = path.join(webDir, file);
  if (!fs.existsSync(fullPath)) return;
  const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  data.forEach(item => {
    if (!item.word || !item.vietnamese || !item.definition) {
      addFinding('vocabulary', file, item.word || 'unknown', 'Missing word, vietnamese or definition');
    }
    // Check if vietnamese translation has placeholder or English words
    if (/TODO|untranslated|null|undefined/i.test(item.vietnamese)) {
      addFinding('vocabulary', file, item.word, `Bad vietnamese translation: ${item.vietnamese}`);
    }
    if (item.collocations && Array.isArray(item.collocations)) {
      item.collocations.forEach((col, idx) => {
        if (!col.phrase || !col.meaning) {
          addFinding('vocabulary', file, `${item.word}-colloc-${idx}`, 'Collocation missing phrase or meaning');
        }
      });
    }
  });
}

// 4. Audit Collocations
function auditCollocations() {
  const file = 'src/assets/data/collocations.json';
  const fullPath = path.join(webDir, file);
  if (!fs.existsSync(fullPath)) return;
  const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  data.forEach((item, idx) => {
    if (!item.phrase || !item.meaning || !item.example) {
      addFinding('collocations', file, `colloc-${idx}`, `Missing phrase, meaning or example: ${JSON.stringify(item)}`);
    }
    if (/TODO|untranslated|null|undefined/i.test(item.meaning)) {
      addFinding('collocations', file, item.phrase, `Bad meaning: ${item.meaning}`);
    }
    if (item.exampleVi && /TODO|untranslated/i.test(item.exampleVi)) {
      addFinding('collocations', file, item.phrase, `Bad exampleVi: ${item.exampleVi}`);
    }
  });
}

// 5. Audit Grammar
function auditGrammar() {
  const file = 'src/assets/data/grammar.json';
  const fullPath = path.join(webDir, file);
  if (!fs.existsSync(fullPath)) return;
  const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  data.forEach(item => {
    if (!item.title || !item.explanation || !item.vietnameseExplanation) {
      addFinding('grammar', file, item.id, 'Missing title, explanation or vietnameseExplanation');
    }
    if (item.examples && Array.isArray(item.examples)) {
      item.examples.forEach((ex, idx) => {
        if (!ex.en || !ex.vi) {
          addFinding('grammar', file, `${item.id}-ex-${idx}`, `Example missing en or vi: ${JSON.stringify(ex)}`);
        }
      });
    }
    if (item.practice && item.practice.questions) {
      item.practice.questions.forEach((q, idx) => {
        if (q.answer < 0 || q.answer >= q.options.length) {
          addFinding('grammar', file, `${item.id}-q-${idx}`, `Question bad answer index: ${q.answer}`);
        }
        if (!q.explanation) {
          addFinding('grammar', file, `${item.id}-q-${idx}`, 'Practice question missing explanation');
        }
      });
    }
  });
}

// 6. Audit Drills
function auditDrills() {
  const file = 'src/assets/data/drills.json';
  const fullPath = path.join(webDir, file);
  if (!fs.existsSync(fullPath)) return;
  const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  ['speaking', 'writing', 'scenarios'].forEach(key => {
    if (data[key]) {
      data[key].forEach((d, idx) => {
        if (!d.prompt || !d.vietnamesePrompt) {
          addFinding('drills', file, `${key}-${d.id || idx}`, 'Drill missing prompt or vietnamesePrompt');
        }
      });
    }
  });
}

// 7. Audit IELTS Parts
function auditIeltsParts() {
  const partsDir = path.join(webDir, 'src/ielts/data/parts');
  if (!fs.existsSync(partsDir)) return;
  const files = fs.readdirSync(partsDir).filter(f => f.endsWith('.json'));

  files.forEach(f => {
    const filePath = path.join(partsDir, f);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Check Vocab files
    if (f.startsWith('vocab-')) {
      content.forEach(v => {
        if (!v.word || !v.meaning || !v.vietnamese) {
          addFinding('ielts-vocab', f, v.word || 'unknown', 'Missing word, meaning, or vietnamese');
        }
        if (/TODO|untranslated|null|undefined/i.test(v.vietnamese)) {
          addFinding('ielts-vocab', f, v.word, `Unfinished vietnamese: ${v.vietnamese}`);
        }
      });
    }

    // Check Reading files
    if (f.startsWith('reading-') || f.startsWith('originals-reading-')) {
      content.forEach(p => {
        const fullPassage = p.paragraphs.map(x => x.text).join(' ').toLowerCase();
        p.questions.forEach(q => {
          if (!q.prompt) addFinding('ielts-reading', f, q.id, 'Missing prompt');
          if (!q.why) addFinding('ielts-reading', f, q.id, 'Missing why explanation');
          if (q.type === 'mcq') {
            if (!q.options || q.options.length < 2) addFinding('ielts-reading', f, q.id, 'MCQ options missing or < 2');
            const validKeys = q.options.map(o => o.trim()[0]);
            if (!validKeys.includes(q.answer)) {
              addFinding('ielts-reading', f, q.id, `MCQ answer "${q.answer}" not in options [${validKeys.join(', ')}]`);
            }
          }
        });
      });
    }

    // Check Listening files
    if (f.startsWith('listening-')) {
      content.forEach(sec => {
        sec.questions.forEach(q => {
          if (!q.prompt) addFinding('ielts-listening', f, q.id, 'Missing prompt');
          if (!q.why) addFinding('ielts-listening', f, q.id, 'Missing why explanation');
          if (q.type === 'mcq') {
            const validKeys = q.options.map(o => o.trim()[0]);
            if (!validKeys.includes(q.answer)) {
              addFinding('ielts-listening', f, q.id, `MCQ answer "${q.answer}" not in options [${validKeys.join(', ')}]`);
            }
          }
        });
      });
    }

    // Check Speaking files
    if (f.startsWith('speaking-')) {
      content.forEach(card => {
        if (!card.topic || !card.questions && !card.cues) {
          addFinding('ielts-speaking', f, card.id || 'card', 'Missing topic, questions, or cues');
        }
        if (card.model && card.model.length < 50) {
          addFinding('ielts-speaking', f, card.id || 'card', 'Model answer suspiciously short');
        }
      });
    }

    // Check Writing files
    if (f.startsWith('writing1-') || f.startsWith('writing2-')) {
      content.forEach(task => {
        if (!task.prompt || !task.model) {
          addFinding('ielts-writing', f, task.id || 'task', 'Missing prompt or model');
        }
      });
    }
  });
}

// 8. Audit Email Builder, Habits, Strategy
function auditOtherData() {
  const files = ['email-builder.json', 'habits.json', 'ielts-tips.json'];
  files.forEach(f => {
    const fullPath = path.join(webDir, 'src/assets/data', f);
    if (!fs.existsSync(fullPath)) return;
    try {
      const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      // Basic sanity check
    } catch (e) {
      addFinding('other', f, 'json-parse', e.message);
    }
  });
}

auditDiagnostic();
auditTenses();
auditVocabulary();
auditCollocations();
auditGrammar();
auditDrills();
auditIeltsParts();
auditOtherData();

console.log(`TOTAL FINDINGS: ${findings.length}`);
findings.forEach(f => {
  console.log(`[${f.category}] ${f.file} (${f.id}): ${f.message}`);
});
