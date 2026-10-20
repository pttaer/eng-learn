// IELTS provenance gate: no app text may share a 12-word run with the scraped third-party corpus.
// Corpus: IELTS_SCRAPE_DIR, default <repo>/data/scraped-ielts. Fails if the corpus is missing.
// Standard instruction sentences are listed in BOILERPLATE and removed before runs are built, so
// a fixed instruction cannot match just because the words next to it differ. Digits become one
// token for the same reason. Nothing else is exempt.
const fs = require('fs');
const path = require('path');

const SCRAPE = process.env.IELTS_SCRAPE_DIR || path.join(__dirname, '..', '..', 'data', 'scraped-ielts');
const DATA = path.join(__dirname, '..', 'src', 'ielts', 'data');
const RUN = 12;

const norm = s => s.toLowerCase().replace(/\d+/g, ' # ').replace(/[^a-z#\s]/g, ' ').replace(/\s+/g, ' ').trim();
const BOILERPLATE = new Set([
  'summarise the information by selecting and reporting the main features and make comparisons where relevant',
  'give reasons for your answer and include any relevant examples from your own knowledge or experience',
].map(norm));

const walk = (dir, ext) => fs.readdirSync(dir, { withFileTypes: true })
  .flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name), ext) : e.name.endsWith(ext) ? [path.join(dir, e.name)] : []);
const strings = v => typeof v === 'string' ? [v]
  : Array.isArray(v) ? v.flatMap(strings)
  : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : [];
const load = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const stream = text => {
  let s = norm(text);
  for (const b of BOILERPLATE) s = s.split(b).join(' ');
  return s.replace(/\s+/g, ' ').trim();
};
const runsOf = text => {
  const w = stream(text).split(' ');
  const out = new Set();
  for (let i = 0; i + RUN <= w.length; i++) out.add(w.slice(i, i + RUN).join(' '));
  return out;
};

if (!fs.existsSync(SCRAPE)) {
  console.error(`[provenance] FAIL: corpus not found at ${SCRAPE}`);
  process.exit(1);
}

const corpus = walk(SCRAPE, '.json').filter(f => !f.endsWith('catalog.json'));
const runFiles = new Map(); // run -> number of scraped files containing it
for (const f of corpus) {
  const seen = new Set(strings(load(f)).flatMap(t => [...runsOf(t)]));
  for (const r of seen) runFiles.set(r, (runFiles.get(r) || 0) + 1);
}

const hits = [];
for (const f of walk(DATA, '.json')) {
  for (const r of new Set(strings(load(f)).flatMap(t => [...runsOf(t)]))) {
    if (runFiles.has(r)) hits.push(`${path.relative(DATA, f)}: "${r}" (in ${runFiles.get(r)} scraped files)`);
  }
}

if (hits.length) {
  console.error(`[provenance] FAIL: ${hits.length} shared ${RUN}-word runs, e.g.\n  ${hits.slice(0, 5).join('\n  ')}`);
  process.exit(1);
}
console.log(`[provenance] OK: no shared ${RUN}-word run with ${corpus.length} scraped files (${BOILERPLATE.size} instruction sentences excluded)`);
