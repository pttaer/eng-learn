// IELTS provenance gate: no app item may share a 12-word run with the scraped third-party corpus.
// Corpus: IELTS_SCRAPE_DIR, default <repo>/data/scraped-ielts. Fails if the corpus is missing.
const fs = require('fs');
const path = require('path');

const SCRAPE = process.env.IELTS_SCRAPE_DIR || path.join(__dirname, '..', '..', 'data', 'scraped-ielts');
const DATA = path.join(__dirname, '..', 'src', 'ielts', 'data');
const RUN = 12;
const BOILERPLATE_FILES = 10; // a run in more scraped files than this is standard IELTS instruction wording

const walk = (dir, ext) => fs.readdirSync(dir, { withFileTypes: true })
  .flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name), ext) : e.name.endsWith(ext) ? [path.join(dir, e.name)] : []);
const strings = v => typeof v === 'string' ? [v]
  : Array.isArray(v) ? v.flatMap(strings)
  : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : [];
const runs = text => {
  const w = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const out = new Set();
  for (let i = 0; i + RUN <= w.length; i++) out.add(w.slice(i, i + RUN).join(' '));
  return out;
};
const load = f => JSON.parse(fs.readFileSync(f, 'utf8'));

if (!fs.existsSync(SCRAPE)) {
  console.error(`[provenance] FAIL: corpus not found at ${SCRAPE}`);
  process.exit(1);
}

const filesIn = new Map(); // run -> number of scraped files containing it
const corpus = walk(SCRAPE, '.json').filter(f => !f.endsWith('catalog.json'));
for (const f of corpus) {
  const seen = new Set(strings(load(f)).flatMap(s => [...runs(s)]));
  for (const r of seen) filesIn.set(r, (filesIn.get(r) || 0) + 1);
}

const hits = [];
for (const f of walk(DATA, '.json')) {
  const mine = new Set(strings(load(f)).flatMap(s => [...runs(s)]));
  for (const r of mine) {
    const n = filesIn.get(r) || 0;
    if (n > 0 && n <= BOILERPLATE_FILES) hits.push(`${path.relative(DATA, f)}: "${r}"`);
  }
}

if (hits.length) {
  console.error(`[provenance] FAIL: ${hits.length} shared ${RUN}-word runs, e.g.\n  ${hits.slice(0, 5).join('\n  ')}`);
  process.exit(1);
}
console.log(`[provenance] OK: no shared ${RUN}-word run with ${corpus.length} scraped files`);
