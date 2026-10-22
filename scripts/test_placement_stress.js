const fs = require('fs');
const path = require('path');
const ts = require(path.join(__dirname, '..', 'web', 'node_modules', 'typescript'));

const SRC = path.join(__dirname, '..', 'web', 'src');

function load(rel, deps = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(SRC, rel), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS }
  }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', code)(mod, mod.exports, name => deps[name] || require(name));
  return mod.exports;
}

const cefr = load('core/cefr.ts');
const decoys = load('core/decoys.ts');
const placement = load('core/placement.ts', { './cefr': cefr, './decoys': decoys });

const DATA = path.join(SRC, 'assets', 'data');
const loadData = f => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));

const vocab = loadData('vocabulary.json');
const collocations = loadData('collocations.json');
const grammar = loadData('diagnostic-questions.json').filter(q => q.skill === 'grammar');
const reading = loadData('reading.json');

console.log('Running 200 random simulations of buildQuestions...');
let problems = 0;

for (let seed = 1; seed <= 200; seed++) {
  let s = seed;
  const rng = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const qs = placement.buildQuestions(vocab, collocations, grammar, reading, rng);

  if (qs.length !== 24) {
    console.error(`Seed ${seed}: Expected 24 questions, got ${qs.length}`);
    problems++;
  }

  for (const q of qs) {
    // Check 1: 4 options
    if (!q.options || q.options.length !== 4) {
      console.error(`Seed ${seed}: Item ${q.level} ${q.kind} has ${q.options?.length} options`);
      problems++;
    }
    // Check 2: Unique options
    const unique = new Set(q.options.map(o => o.trim().toLowerCase()));
    if (unique.size !== 4) {
      console.error(`Seed ${seed}: Duplicate option in ${q.level} ${q.kind}: ${JSON.stringify(q.options)}`);
      problems++;
    }
    // Check 3: Valid answer index
    if (q.answer < 0 || q.answer >= 4) {
      console.error(`Seed ${seed}: Invalid answer index ${q.answer}`);
      problems++;
    }
    // Check 4: Correct answer in prompt
    const correct = q.options[q.answer];
    if (q.kind === 'reading' && q.prompt.toLowerCase().includes(correct.toLowerCase())) {
      console.error(`Seed ${seed}: Reading cloze prompt contains answer: "${correct}" in "${q.prompt}"`);
      problems++;
    }
    // Check 5: Decoys overlap meaning
    for (let i = 0; i < q.options.length; i++) {
      if (i !== q.answer) {
        if (decoys.meaningsOverlap(q.options[i], correct)) {
          console.warn(`Seed ${seed}: Warning: possible meaning overlap between "${q.options[i]}" and answer "${correct}" in ${q.level} ${q.kind}`);
        }
      }
    }
  }
}

console.log(`Simulation complete: ${problems} critical problems found.`);
