# Markdown-First Content Architecture & Compilation Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the educational content storage of English Singularity into a 100% Markdown-First architecture under `web/content/`, backed by a lightweight, zero-dependency Node compiler (`compile-content.cjs`) integrated into the Vite build lifecycle with zero runtime overhead or UI regressions.

**Architecture:** A zero-dependency Node.js compiler script (`web/scripts/compile-content.cjs`) reads Markdown files from `web/content/` (using frontmatter, tables, and structured markdown sections), validates schema integrity (CEFR levels, unique IDs, required fields), and emits deterministic JSON files to `web/src/assets/data/` for Vite compilation. An automated test harness (`web/scripts/verify-content-pipeline.cjs`) validates roundtrip schema parity and item counts.

**Tech Stack:** Node.js (native `fs`, `path`), Vite, TypeScript, Markdown (GFM tables, YAML-style frontmatter).

**Spec:** [`docs/superpowers/specs/2026-09-30-markdown-content-architecture-design.md`](file:///E:/Eng/docs/superpowers/specs/2026-09-30-markdown-content-architecture-design.md)

## Global Constraints

- Zero external npm dependencies added to `package.json` for compilation (use native Node.js APIs).
- Compilation of all 7 content domains must execute in under 150ms.
- 100% schema parity with existing JSON consumers: `reading-dossier.ts`, `collocations-dossier.ts`, `vocabulary-dossier.ts`, `grammar-dossier.ts`, `speaking-dossier.ts`, `writing-dossier.ts`, and `mission-log.ts`.
- Zero UI code modifications to existing dossier components.
- Verification must confirm exact counts: 1,000 collocations, 60 grammar rules, 120 vocabulary items, 30 speaking drills, 30 writing drills, 3 multi-pass reading articles, and listening phonetics.

---

### Task 1: Pipeline Verification Test Harness & NPM Scripts Setup

**Files:**
- Create: `web/scripts/verify-content-pipeline.cjs`
- Modify: `web/package.json`

**Interfaces:**
- Consumes: `web/content/` markdown files and compiled output in `web/src/assets/data/`.
- Produces: Exit code 0 if all schemas, counts, and invariants pass; exit code 1 with descriptive error diagnostics otherwise.

- [ ] **Step 1: Write the failing verification test harness**

Create `web/scripts/verify-content-pipeline.cjs` asserting the existence and validity of compiled content:

```javascript
// web/scripts/verify-content-pipeline.cjs
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const DATA_DIR = path.join(__dirname, '..', 'src', 'assets', 'data');
const CONTENT_DIR = path.join(__dirname, '..', 'content');

console.log('[TEST] Starting Content Pipeline Verification...');

// 1. Verify content source directory exists
assert(fs.existsSync(CONTENT_DIR), `Content directory missing: ${CONTENT_DIR}`);

// 2. Validate collocations.json
const collocations = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'collocations.json'), 'utf8'));
assert(Array.isArray(collocations), 'collocations must be an array');
assert.strictEqual(collocations.length, 1000, `Expected 1000 collocations, got ${collocations.length}`);
assert(collocations[0].id && collocations[0].phrase && collocations[0].vietnamese && collocations[0].category, 'Collocation item schema mismatch');

// 3. Validate grammar.json
const grammar = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'grammar.json'), 'utf8'));
assert(Array.isArray(grammar), 'grammar must be an array');
assert.strictEqual(grammar.length, 60, `Expected 60 grammar rules, got ${grammar.length}`);
assert(grammar[0].id && grammar[0].promptSentence && grammar[0].targetTransformation && grammar[0].formula, 'Grammar item schema mismatch');

// 4. Validate vocabulary.json
const vocab = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'vocabulary.json'), 'utf8'));
assert(Array.isArray(vocab), 'vocabulary must be an array');
assert.strictEqual(vocab.length, 120, `Expected 120 vocabulary items, got ${vocab.length}`);
assert(vocab[0].id && vocab[0].wordOrChunk && vocab[0].definition && vocab[0].breakdown, 'Vocabulary item schema mismatch');

// 5. Validate drills.json
const drills = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'drills.json'), 'utf8'));
assert(Array.isArray(drills.speaking), 'drills.speaking must be an array');
assert.strictEqual(drills.speaking.length, 30, `Expected 30 speaking drills, got ${drills.speaking.length}`);
assert(Array.isArray(drills.writing), 'drills.writing must be an array');
assert.strictEqual(drills.writing.length, 30, `Expected 30 writing drills, got ${drills.writing.length}`);

// 6. Validate reading.json
const reading = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'reading.json'), 'utf8'));
assert(Array.isArray(reading.articles), 'reading.articles must be an array');
assert(reading.articles.length >= 3, `Expected at least 3 reading articles, got ${reading.articles.length}`);
assert(reading.articles[0].fourPassProtocol.pass1ColdRead.comprehensionChecks.length > 0, 'Pass 1 checks missing');
assert(reading.articles[0].fourPassProtocol.pass2SyntaxDissection.length > 0, 'Pass 2 syntax dissection missing');
assert(reading.articles[0].fourPassProtocol.pass3SentenceMining.length > 0, 'Pass 3 sentence mining missing');

// 7. Validate listening.json
const listening = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'listening.json'), 'utf8'));
assert(Array.isArray(listening.rules), 'listening.rules must be an array');
assert(Array.isArray(listening.samplePassages), 'listening.samplePassages must be an array');
assert(listening.samplePassages.length >= 3, `Expected at least 3 listening passages, got ${listening.samplePassages.length}`);

console.log('[TEST] PASSED: All 7 content datasets satisfy production schema and count invariants.');
```

- [ ] **Step 2: Run verification test to verify failure**

Run: `node web/scripts/verify-content-pipeline.cjs`  
Expected: FAIL with `AssertionError: Content directory missing: ...\web\content`

- [ ] **Step 3: Update `web/package.json` with content compilation scripts**

Add `content:compile`, `content:watch`, and `prebuild` hooks:

```json
"scripts": {
  "content:compile": "node scripts/compile-content.cjs",
  "content:watch": "node scripts/compile-content.cjs --watch",
  "prebuild": "node scripts/compile-content.cjs",
  "test:content": "node scripts/verify-content-pipeline.cjs"
}
```

- [ ] **Step 4: Commit Task 1 setup**

```bash
git add web/scripts/verify-content-pipeline.cjs web/package.json
git commit -m "test: add content pipeline verification harness and npm scripts"
```

---

### Task 2: Core Markdown Compiler Engine (`compile-content.cjs`)

**Files:**
- Create: `web/scripts/compile-content.cjs`

**Interfaces:**
- Consumes: Markdown files in `web/content/{collocations,grammar,vocabulary,drills,reading,listening,habits}`.
- Produces: Emits validated JSON files to `web/src/assets/data/*.json`.

- [ ] **Step 1: Write the compiler engine implementation**

Create `web/scripts/compile-content.cjs` with modular parsers for frontmatter, markdown tables, bullet sections, and file watching:

```javascript
// web/scripts/compile-content.cjs
const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const DATA_DIR = path.join(__dirname, '..', 'src', 'assets', 'data');

if (!fs.existsSync(CONTENT_DIR)) {
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper: Parse YAML frontmatter
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  match[1].split(/\r?\n/).forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      let val = line.slice(colonIdx + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      else if (!isNaN(Number(val)) && val !== '') val = Number(val);
      meta[key] = val;
    }
  });
  return { meta, body: match[2] };
}

// 1. Collocations Compiler
function compileCollocations() {
  const dir = path.join(CONTENT_DIR, 'collocations');
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  const allItems = [];
  
  files.forEach(file => {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed.startsWith('|') || trimmed.includes('Index') || trimmed.includes(':---')) return;
      const parts = trimmed.split('|').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 4) {
        const index = parseInt(parts[0], 10);
        allItems.push({
          id: `colloc-${index}`,
          index: index,
          phrase: parts[1],
          vietnamese: parts[2],
          category: parts[3]
        });
      }
    });
  });

  if (allItems.length > 0) {
    allItems.sort((a, b) => a.index - b.index);
    fs.writeFileSync(path.join(DATA_DIR, 'collocations.json'), JSON.stringify(allItems, null, 2), 'utf8');
    console.log(`[COMPILE] collocations.json: ${allItems.length} items`);
  }
}

// 2. Grammar Compiler
function compileGrammar() {
  const dir = path.join(CONTENT_DIR, 'grammar');
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  const allRules = [];

  files.forEach(file => {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    const sections = content.split(/^##\s+/m).slice(1);
    
    sections.forEach(sec => {
      const lines = sec.split(/\r?\n/);
      const title = lines[0].trim();
      const item = { title };
      
      lines.slice(1).forEach(l => {
        const m = l.match(/^-\s+\*\*([^*]+)\*\*:\s*(.*)$/);
        if (m) {
          const key = m[1].trim();
          let val = m[2].trim();
          if (val.startsWith('`') && val.endsWith('`')) val = val.slice(1, -1);
          if (key === 'ID') item.id = val;
          else if (key === 'Mode') item.mode = val;
          else if (key === 'Level') item.level = parseInt(val, 10);
          else if (key === 'Prompt') item.promptSentence = val;
          else if (key === 'Transformation') item.targetTransformation = val;
          else if (key === 'Grammatical Cue') item.grammaticalCue = val;
          else if (key === 'Vietnamese') item.vietnamese = val;
          else if (key === 'Formula') item.formula = val;
          else if (key === 'Analysis') item.analysis = val;
          else if (key === 'Exemplar') item.exemplarContext = val;
        }
      });
      if (item.id && item.promptSentence) allRules.push(item);
    });
  });

  if (allRules.length > 0) {
    fs.writeFileSync(path.join(DATA_DIR, 'grammar.json'), JSON.stringify(allRules, null, 2), 'utf8');
    console.log(`[COMPILE] grammar.json: ${allRules.length} rules`);
  }
}

// 3. Vocabulary Compiler
function compileVocabulary() {
  const dir = path.join(CONTENT_DIR, 'vocabulary');
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  const allItems = [];

  files.forEach(file => {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    const sections = content.split(/^##\s+/m).slice(1);

    sections.forEach(sec => {
      const lines = sec.split(/\r?\n/);
      const wordOrChunk = lines[0].trim();
      const item = { wordOrChunk, breakdown: {} };

      lines.slice(1).forEach(l => {
        const m = l.match(/^-\s+\*\*([^*]+)\*\*:\s*(.*)$/);
        if (m) {
          const key = m[1].trim();
          let val = m[2].trim();
          if (key === 'ID') item.id = val;
          else if (key === 'Mode') item.mode = val;
          else if (key === 'Level') item.level = parseInt(val, 10);
          else if (key === 'IPA') item.ipa = val;
          else if (key === 'Definition') item.definition = val;
          else if (key === 'Vietnamese') item.vietnamese = val;
          else if (key === 'Context') item.contextSentence = val;
          else if (key === 'Prefix') item.breakdown.prefix = val;
          else if (key === 'Root') item.breakdown.root = val;
          else if (key === 'Suffix') item.breakdown.suffix = val;
          else if (key === 'Derivatives') item.breakdown.derivationalFamily = val.split(',').map(s => s.trim());
          else if (key === 'Morphology') item.breakdown.morphologyAnalysis = val;
          else if (key === 'Remind Candidate') item.isRemindCandidate = (val.toLowerCase() === 'true');
        }
      });
      if (item.id && item.wordOrChunk) allItems.push(item);
    });
  });

  if (allItems.length > 0) {
    fs.writeFileSync(path.join(DATA_DIR, 'vocabulary.json'), JSON.stringify(allItems, null, 2), 'utf8');
    console.log(`[COMPILE] vocabulary.json: ${allItems.length} items`);
  }
}

// 4. Drills Compiler (Speaking & Writing)
function compileDrills() {
  const dir = path.join(CONTENT_DIR, 'drills');
  if (!fs.existsSync(dir)) return;
  const drills = { speaking: [], writing: [], rubricSummary: {} };

  const speakFile = path.join(dir, 'speaking-prompts.md');
  if (fs.existsSync(speakFile)) {
    const content = fs.readFileSync(speakFile, 'utf8');
    content.split(/^##\s+/m).slice(1).forEach(sec => {
      const lines = sec.split(/\r?\n/);
      const title = lines[0].trim();
      const item = { title };
      lines.slice(1).forEach(l => {
        const m = l.match(/^-\s+\*\*([^*]+)\*\*:\s*(.*)$/);
        if (m) {
          const key = m[1].trim();
          const val = m[2].trim();
          if (key === 'ID') item.id = val;
          else if (key === 'Index') item.index = parseInt(val, 10);
          else if (key === 'Mode') item.mode = val;
          else if (key === 'Prompt') item.prompt = val;
          else if (key === 'Anchor') item.anchor = val;
          else if (key === 'Collocations') item.collocations = val;
          else if (key === 'Phonetic') item.phonetic = val;
        }
      });
      if (item.id && item.prompt) drills.speaking.push(item);
    });
  }

  const writeFile = path.join(dir, 'writing-prompts.md');
  if (fs.existsSync(writeFile)) {
    const content = fs.readFileSync(writeFile, 'utf8');
    content.split(/^##\s+/m).slice(1).forEach(sec => {
      const lines = sec.split(/\r?\n/);
      const title = lines[0].trim();
      const item = { title, meal: {} };
      lines.slice(1).forEach(l => {
        const m = l.match(/^-\s+\*\*([^*]+)\*\*:\s*(.*)$/);
        if (m) {
          const key = m[1].trim();
          const val = m[2].trim();
          if (key === 'ID') item.id = val;
          else if (key === 'Index') item.index = parseInt(val, 10);
          else if (key === 'Mode') item.mode = val;
          else if (key === 'Question') item.question = val;
          else if (key === 'Register') item.register = val;
          else if (key === 'Master Sentence') item.masterSentence = val;
          else if (key === 'M') item.meal.m = val;
          else if (key === 'E') item.meal.e = val;
          else if (key === 'A') item.meal.a = val;
          else if (key === 'L') item.meal.l = val;
          else if (key === 'Stylistic') item.stylistic = val;
        }
      });
      if (item.id && item.question) drills.writing.push(item);
    });
  }

  // Preserve existing rubricSummary if present
  const existingPath = path.join(DATA_DIR, 'drills.json');
  if (fs.existsSync(existingPath)) {
    const prev = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
    drills.rubricSummary = prev.rubricSummary || {};
  }

  if (drills.speaking.length > 0 || drills.writing.length > 0) {
    fs.writeFileSync(path.join(DATA_DIR, 'drills.json'), JSON.stringify(drills, null, 2), 'utf8');
    console.log(`[COMPILE] drills.json: ${drills.speaking.length} speaking, ${drills.writing.length} writing`);
  }
}

// 5. Reading Compiler
function compileReading() {
  const dir = path.join(CONTENT_DIR, 'reading');
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  const readingData = {
    title: "Intensive Reading & Contextual Sentence Mining Dossier",
    pedagogy: "4-Pass Intensive Deconstruction & i+1 Spaced Repetition Mining",
    articles: []
  };

  files.forEach(file => {
    const raw = fs.readFileSync(path.join(dir, file), 'utf8');
    const { meta, body } = parseFrontmatter(raw);
    
    // Extract passage
    const passageMatch = body.match(/#\s+Passage\r?\n([\s\S]*?)(?=\r?\n##\s+|$)/);
    const content = passageMatch ? passageMatch[1].trim() : '';

    const article = {
      ...meta,
      content,
      fourPassProtocol: {
        pass1ColdRead: { thesisGist: '', markedLexicalTargets: [], comprehensionChecks: [] },
        pass2SyntaxDissection: [],
        pass3SentenceMining: []
      }
    };

    // Extract Cold Read
    const coldMatch = body.match(/##\s+Cold Read\r?\n([\s\S]*?)(?=\r?\n##\s+Syntax|$)/);
    if (coldMatch) {
      const cBody = coldMatch[1];
      const thesisM = cBody.match(/-\s+\*\*Thesis\*\*:\s*(.*)/);
      if (thesisM) article.fourPassProtocol.pass1ColdRead.thesisGist = thesisM[1].trim();
      const targetsM = cBody.match(/-\s+\*\*Targets\*\*:\s*(.*)/);
      if (targetsM) {
        article.fourPassProtocol.pass1ColdRead.markedLexicalTargets = targetsM[1].split(',').map(s => s.trim());
      }
      const qMatches = [...cBody.matchAll(/-\s+Q:\s*(.*?)\r?\n\s+A:\s*(.*?)(?=\r?\n-\s+Q:|$)/gs)];
      qMatches.forEach(qm => {
        article.fourPassProtocol.pass1ColdRead.comprehensionChecks.push({
          question: qm[1].trim(),
          answer: qm[2].trim()
        });
      });
    }

    // Extract Syntax Dissection
    const syntaxMatch = body.match(/##\s+Syntax Dissection\r?\n([\s\S]*?)(?=\r?\n##\s+Sentence Mining|$)/);
    if (syntaxMatch) {
      const sBody = syntaxMatch[1];
      const sentences = sBody.split(/###\s+Sentence\s+\d+/).slice(1);
      sentences.forEach((sText, idx) => {
        const sObj = {
          sentenceIndex: idx + 1,
          sentence: '',
          coreSVO: { subject: '', verb: '', objectOrComplement: '' },
          subordinateClauses: [],
          syntacticAnalysis: ''
        };
        const sm = sText.match(/-\s+\*\*Sentence\*\*:\s*(.*)/);
        if (sm) sObj.sentence = sm[1].trim();
        const subjM = sText.match(/-\s+\*\*Subject\*\*:\s*(.*)/);
        if (subjM) sObj.coreSVO.subject = subjM[1].trim();
        const verbM = sText.match(/-\s+\*\*Verb\*\*:\s*(.*)/);
        if (verbM) sObj.coreSVO.verb = verbM[1].trim();
        const objM = sText.match(/-\s+\*\*Object\*\*:\s*(.*)/);
        if (objM) sObj.coreSVO.objectOrComplement = objM[1].trim();
        const anaM = sText.match(/-\s+\*\*Analysis\*\*:\s*(.*)/);
        if (anaM) sObj.syntacticAnalysis = anaM[1].trim();

        // Subordinate clauses
        const clauseMatches = [...sText.matchAll(/-\s+\[(.*?)\]:\s*(.*?)\s+\|\s*(.*)/g)];
        clauseMatches.forEach(cm => {
          sObj.subordinateClauses.push({
            type: cm[1].trim(),
            clause: cm[2].trim(),
            function: cm[3].trim()
          });
        });
        if (sObj.sentence) article.fourPassProtocol.pass2SyntaxDissection.push(sObj);
      });
    }

    // Extract Sentence Mining
    const mineMatch = body.match(/##\s+Sentence Mining\r?\n([\s\S]*)$/);
    if (mineMatch) {
      const mBody = mineMatch[1];
      const cards = mBody.split(/###\s+/).slice(1);
      cards.forEach((cText, idx) => {
        const lines = cText.split(/\r?\n/);
        const targetWord = lines[0].trim();
        const cObj = {
          id: `mine-${article.id || 'art'}-${idx + 1}`,
          targetWord,
          partOfSpeech: '',
          ipa: '',
          definition: '',
          vietnamese: '',
          contextSentence: '',
          collocations: [],
          etymology: ''
        };
        lines.slice(1).forEach(l => {
          const m = l.match(/^-\s+\*\*([^*]+)\*\*:\s*(.*)$/);
          if (m) {
            const key = m[1].trim();
            const val = m[2].trim();
            if (key === 'Part of Speech') cObj.partOfSpeech = val;
            else if (key === 'IPA') cObj.ipa = val;
            else if (key === 'Definition') cObj.definition = val;
            else if (key === 'Vietnamese') cObj.vietnamese = val;
            else if (key === 'Context') cObj.contextSentence = val;
            else if (key === 'Collocations') cObj.collocations = val.split(',').map(s => s.trim());
            else if (key === 'Etymology') cObj.etymology = val;
          }
        });
        if (cObj.targetWord && cObj.definition) article.fourPassProtocol.pass3SentenceMining.push(cObj);
      });
    }

    readingData.articles.push(article);
  });

  if (readingData.articles.length > 0) {
    fs.writeFileSync(path.join(DATA_DIR, 'reading.json'), JSON.stringify(readingData, null, 2), 'utf8');
    console.log(`[COMPILE] reading.json: ${readingData.articles.length} articles`);
  }
}

// 6. Listening & Habits Compilers
function compileListening() {
  const filePath = path.join(CONTENT_DIR, 'listening', 'phonetics-passages.md');
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, 'utf8');
  // If json block provided or parsed structured format:
  const jsonMatch = raw.match(/```json\r?\n([\s\S]*?)\r?\n```/);
  if (jsonMatch) {
    const data = JSON.parse(jsonMatch[1]);
    fs.writeFileSync(path.join(DATA_DIR, 'listening.json'), JSON.stringify(data, null, 2), 'utf8');
    console.log(`[COMPILE] listening.json compiled.`);
  }
}

function compileHabits() {
  const filePath = path.join(CONTENT_DIR, 'habits', 'daily-plan.md');
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, 'utf8');
  const jsonMatch = raw.match(/```json\r?\n([\s\S]*?)\r?\n```/);
  if (jsonMatch) {
    const data = JSON.parse(jsonMatch[1]);
    fs.writeFileSync(path.join(DATA_DIR, 'habits.json'), JSON.stringify(data, null, 2), 'utf8');
    console.log(`[COMPILE] habits.json compiled.`);
  }
}

function compileAll() {
  const start = Date.now();
  console.log('[COMPILE] Compiling Markdown content into JSON...');
  compileCollocations();
  compileGrammar();
  compileVocabulary();
  compileDrills();
  compileReading();
  compileListening();
  compileHabits();
  console.log(`[COMPILE] Finished in ${Date.now() - start}ms.`);
}

compileAll();

if (process.argv.includes('--watch')) {
  console.log('[WATCH] Watching web/content for changes...');
  fs.watch(CONTENT_DIR, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.md')) {
      console.log(`[WATCH] Change detected: ${filename}`);
      try { compileAll(); } catch (err) { console.error('[WATCH ERROR]', err.message); }
    }
  });
}
```

- [ ] **Step 2: Verify compiler execution**

Run: `node web/scripts/compile-content.cjs`  
Expected: Success log completing in <50ms without crashing.

- [ ] **Step 3: Commit Task 2 compiler engine**

```bash
git add web/scripts/compile-content.cjs
git commit -m "feat: implement high-performance markdown content compiler engine"
```

---

### Task 3: Collocations & Habits Content Migration

**Files:**
- Create: `web/content/collocations/01-everyday.md`
- Create: `web/content/collocations/02-business-law.md`
- Create: `web/content/collocations/03-academic-science.md`
- Create: `web/content/collocations/04-emotions-idioms.md`
- Create: `web/content/habits/daily-plan.md`

**Interfaces:**
- Consumes: `E:\Eng\collocations.md` and `E:\Eng\web\src\assets\data\habits.json`.
- Produces: Standard Markdown tables with all 1,000 items (1-250, 251-500, 501-750, 751-1000) and daily habits plan.

- [ ] **Step 1: Write conversion script to extract 1,000 collocations from existing data to Markdown**

Run a temporary node script to generate the 4 clean markdown files in `web/content/collocations/`:
- `01-everyday.md` (Items 1-250)
- `02-business-law.md` (Items 251-500)
- `03-academic-science.md` (Items 501-750)
- `04-emotions-idioms.md` (Items 751-1000)
- `web/content/habits/daily-plan.md` (30-day habits curriculum)

- [ ] **Step 2: Run compiler to test collocations generation**

Run: `node web/scripts/compile-content.cjs`  
Expected: Output `[COMPILE] collocations.json: 1000 items`

- [ ] **Step 3: Verify row count and formatting**

Check `web/src/assets/data/collocations.json` length is exactly 1,000.

- [ ] **Step 4: Commit Task 3 collocations & habits**

```bash
git add web/content/collocations/ web/content/habits/
git commit -m "content: migrate 1,000 collocations and habits into markdown"
```

---

### Task 4: Grammar & Drills Content Migration

**Files:**
- Create: `web/content/grammar/01-inversion.md`
- Create: `web/content/grammar/02-subjunctive.md`
- Create: `web/content/grammar/03-condensation.md`
- Create: `web/content/grammar/04-syntactic-repair.md`
- Create: `web/content/drills/speaking-prompts.md`
- Create: `web/content/drills/writing-prompts.md`

**Interfaces:**
- Consumes: `web/src/assets/data/grammar.json` and `web/src/assets/data/drills.json`.
- Produces: 60 Markdown grammar rules across 4 modes, 30 speaking prompts, and 30 writing prompts in Markdown.

- [ ] **Step 1: Export existing grammar and drills into structured Markdown**

Generate Markdown files matching Section 3 schemas for all 60 grammar rules and 60 drills.

- [ ] **Step 2: Run compiler to verify grammar and drills**

Run: `node web/scripts/compile-content.cjs`  
Expected: Output `[COMPILE] grammar.json: 60 rules` and `[COMPILE] drills.json: 30 speaking, 30 writing`.

- [ ] **Step 3: Commit Task 4 grammar & drills**

```bash
git add web/content/grammar/ web/content/drills/
git commit -m "content: migrate 60 grammar rules and 60 drills into markdown"
```

---

### Task 5: Vocabulary, Reading & Listening Content Migration

**Files:**
- Create: `web/content/vocabulary/root-forge.md`
- Create: `web/content/vocabulary/cefr-ascent.md`
- Create: `web/content/vocabulary/particle-lab.md`
- Create: `web/content/reading/epistemic-commons.md`
- Create: `web/content/reading/cognitive-bandwidth.md`
- Create: `web/content/reading/architecture-solitude.md`
- Create: `web/content/listening/phonetics-passages.md`

**Interfaces:**
- Consumes: `web/src/assets/data/vocabulary.json`, `reading.json`, and `listening.json`.
- Produces: 120 vocabulary items, 3 multi-pass reading articles, and listening phonetics in clean Markdown.

- [ ] **Step 1: Export vocabulary, reading, and listening into Markdown files**

Convert the 120 vocabulary items, the 3 reading dossiers, and the listening phonetics dataset into Markdown files.

- [ ] **Step 2: Run compiler to compile all 7 pillars**

Run: `node web/scripts/compile-content.cjs`  
Expected: All 7 datasets compiled without errors in <100ms.

- [ ] **Step 3: Commit Task 5 content**

```bash
git add web/content/vocabulary/ web/content/reading/ web/content/listening/
git commit -m "content: migrate vocabulary, reading, and listening dossiers into markdown"
```

---

### Task 6: Full Pipeline Roundtrip Verification & Production Build

**Files:**
- Test: `web/scripts/verify-content-pipeline.cjs`
- Output: `web/dist/`

**Interfaces:**
- Consumes: All `web/content/**/*.md` sources.
- Produces: Passing test suite and clean Vite production bundle in `web/dist/`.

- [ ] **Step 1: Run complete content compilation**

Run: `npm run content:compile` in `web/`  
Expected: All 7 files compiled with 1,000 collocations, 60 grammar rules, 120 vocabulary items, 60 drills, 3 reading articles, listening, and habits.

- [ ] **Step 2: Run automated pipeline verification test**

Run: `node web/scripts/verify-content-pipeline.cjs`  
Expected: `[TEST] PASSED: All 7 content datasets satisfy production schema and count invariants.` with exit code 0.

- [ ] **Step 3: Run full production Vite build**

Run: `npm run build` in `web/`  
Expected: `prebuild` automatically triggers `content:compile`, compiles 42+ modules, and outputs clean bundle into `dist/` with 0 errors.

- [ ] **Step 4: Commit and sign off Task 6**

```bash
git add .
git commit -m "feat(content): complete markdown-first content pipeline and verify 100% roundtrip"
```
