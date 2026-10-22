const path = require('path');
const fs = require('fs');

const D = n => require(path.resolve(__dirname, '../web/src/assets/data', n));

const vocab = D('vocabulary.json');
const colloc = D('collocations.json');
const reading = D('reading.json').articles;

console.log('--- VOCAB CHECK ---');
for (const v of vocab) {
  const def = (v.definition || '').toLowerCase();
  if (v.wordOrChunk.toLowerCase().split(/\s+/).some(t => t.length >= 4 && def.includes(t.slice(0, Math.max(4, t.length - 3))))) {
    console.log('def leaks word:', v.id, v.wordOrChunk, '|', v.definition);
  }
}

console.log('--- COLLOC CHECK ---');
const seen = {};
for (const c of colloc) {
  const k = c.phrase.toLowerCase();
  if (seen[k] && seen[k] !== c.vietnamese) {
    console.log('dup phrase:', c.phrase, '|', seen[k], '|', c.vietnamese);
  }
  seen[k] = c.vietnamese;
}

console.log('--- READING CLOZE CHECK ---');
for (const a of reading) {
  for (const m of a.fourPassProtocol?.pass3SentenceMining || []) {
    const escaped = m.targetWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (!new RegExp('\\b' + escaped + '\\b', 'i').test(m.contextSentence)) {
      console.log('cloze target missing in:', a.id, '| word:', m.targetWord, '| context:', m.contextSentence);
    }
  }
}

console.log('--- TASK 1: READING STEM COPY CHECK ---');
let badStems = 0;
for (const f of ['reading-1', 'reading-2']) {
  const p = path.resolve(__dirname, `../web/src/ielts/data/parts/${f}.json`);
  if (!fs.existsSync(p)) continue;
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const s of d) {
    const src = s.paragraphs.map(p => p.text).join(' ').toLowerCase();
    const w = src.replace(/[^a-z0-9 ]/g, ' ').split(/\s+/);
    const g = new Set();
    for (let i = 0; i + 6 <= w.length; i++) g.add(w.slice(i, i + 6).join(' '));
    for (const q of s.questions) {
      const pw = q.prompt.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
      let h = 0;
      for (let i = 0; i + 6 <= pw.length; i++) if (g.has(pw.slice(i, i + 6).join(' '))) h++;
      if (h >= 2) { badStems++; console.log('copied stem:', q.id); }
      const ans = [].concat(q.answer);
      if (['complete', 'short'].includes(q.type) && !ans.some(a => src.includes(String(a).toLowerCase()))) {
        badStems++; console.log('answer not in passage:', q.id, ans);
      }
    }
  }
}
console.log('Task 1 bad stems:', badStems);

console.log('--- TASK 3: TFNG / YNNG BALANCE CHECK ---');
for (const f of ['reading-1', 'reading-2']) {
  const p = path.resolve(__dirname, `../web/src/ielts/data/parts/${f}.json`);
  if (!fs.existsSync(p)) continue;
  for (const s of JSON.parse(fs.readFileSync(p, 'utf8'))) {
    const k = s.questions.filter(q => ['tfng', 'ynng'].includes(q.type)).map(q => q.answer);
    if (k.length > 0 && (new Set(k).size < 2 || !k.includes('NOT GIVEN'))) {
      console.log('TFNG imbalance in passage:', s.id, k.join(','));
    }
  }
}
