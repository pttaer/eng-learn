// Verifies drill-sets.json, phonemes.json and email-builder.json: schema, answer keys, balance, banned terms.
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'src', 'assets', 'data');
const failures = [];
const fail = msg => failures.push(msg);

const read = name => JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8'));
const drills = read('drill-sets.json');
const phonemes = read('phonemes.json').phonemes;
const email = read('email-builder.json');

const SKILLS = ['grammar', 'vocabulary', 'listening', 'pronunciation', 'reading', 'writing'];
// Same terms as verify-learning-materials-safety.cjs (kept in sync by hand).
const BANNED = /\b(fuck|shit|bitch|bastard|asshole|damn|crap|dick|pussy|cock|cunt|slut|whore)\b|\b(get drunk|drunk driving|beer|vodka|whiskey|liquor|tobacco|cigarette|cocaine|heroin)\b|\b(porn|nude|naked|erotic|hooker|brothel|condom)\b/i;
const ITEM_TYPES = ['choice', 'gap', 'truefalse', 'match', 'stress'];

function textsOf(obj) {
  return JSON.stringify(obj);
}

if (drills.version !== 1) fail('drill-sets.json version must be 1');
const sets = drills.sets;
if (sets.length !== 36) fail(`expected 36 sets, found ${sets.length}`);

const setIds = new Set();
const itemIds = new Set();
const skillCount = Object.fromEntries(SKILLS.map(s => [s, 0]));

for (const set of sets) {
  const where = `set ${set.id}`;
  if (setIds.has(set.id)) fail(`${where}: duplicate set id`);
  setIds.add(set.id);
  if (!SKILLS.includes(set.skill)) fail(`${where}: unknown skill "${set.skill}"`);
  else skillCount[set.skill]++;
  if (set.cefrLevel !== 'C1' && set.cefrLevel !== 'C2') fail(`${where}: cefrLevel must be C1 or C2`);
  if (!(set.minutes > 0)) fail(`${where}: minutes must be positive`);
  if (!set.title || !set.objective) fail(`${where}: title and objective required`);
  if (!Array.isArray(set.items) || set.items.length < 4 || set.items.length > 5) {
    fail(`${where}: needs 4 or 5 items, has ${set.items && set.items.length}`);
    continue;
  }
  if (new Set(set.items.map(i => i.type)).size < 2) fail(`${where}: needs at least two item types`);
  if (set.passage !== undefined && BANNED.test(set.passage)) fail(`${where}: banned term in passage`);
  if (set.passage !== undefined && !['reading', 'writing'].includes(set.skill)) fail(`${where}: passage only allowed for reading/writing`);

  const indexAnswers = [];
  for (const item of set.items) {
    const iw = `${where} item ${item.id}`;
    if (!item.id || itemIds.has(item.id)) fail(`${iw}: missing or duplicate item id`);
    itemIds.add(item.id);
    if (!ITEM_TYPES.includes(item.type)) fail(`${iw}: unknown type "${item.type}"`);
    if (typeof item.why !== 'string' || item.why.length < 20 || item.why.length > 240) fail(`${iw}: why must be 20-240 chars`);
    if (item.speak !== undefined && (typeof item.speak !== 'string' || !item.speak.trim())) fail(`${iw}: speak must be non-empty text`);
    if (item.accent !== undefined && !['us', 'uk'].includes(item.accent)) fail(`${iw}: accent must be us or uk`);
    if (BANNED.test(textsOf(item))) fail(`${iw}: banned term`);

    switch (item.type) {
      case 'choice':
      case 'stress':
        if (!Array.isArray(item.options) || item.options.length < 2 || item.options.length > 4) fail(`${iw}: options must be 2-4`);
        else if (!Number.isInteger(item.answer) || item.answer < 0 || item.answer >= item.options.length) fail(`${iw}: answer index out of range`);
        else indexAnswers.push(item.answer);
        if (item.type === 'stress' && !item.options.every(o => /^[Oo]+$/.test(o) && /O/.test(o))) fail(`${iw}: stress options must be O/o patterns`);
        break;
      case 'gap':
        if (typeof item.prompt !== 'string' || !item.prompt.includes('___')) fail(`${iw}: gap prompt needs ___`);
        if (!Array.isArray(item.answers) || item.answers.length < 1 || item.answers.some(a => typeof a !== 'string' || !a.trim())) fail(`${iw}: gap answers must be non-empty strings`);
        break;
      case 'truefalse':
        if (typeof item.answer !== 'boolean') fail(`${iw}: truefalse answer must be boolean`);
        break;
      case 'match': {
        if (!Array.isArray(item.pairs) || item.pairs.length < 2 || item.pairs.length > 4) fail(`${iw}: match needs 2-4 pairs`);
        else if (new Set(item.pairs.map(p => p.right)).size !== item.pairs.length) fail(`${iw}: match rights must be distinct`);
        break;
      }
    }
  }
  if (indexAnswers.length >= 2 && new Set(indexAnswers).size === 1) {
    fail(`${where}: every answer index is ${indexAnswers[0]} (balance)`);
  }
  if (set.skill === 'listening' && !set.items.some(i => i.speak)) fail(`${where}: listening set needs speak text`);
}

for (const skill of SKILLS) {
  if (skillCount[skill] === 0) fail(`no sets for skill ${skill}`);
}

if (phonemes.length !== 44) fail(`expected 44 phonemes, found ${phonemes.length}`);
const kindCount = { monophthong: 0, diphthong: 0, consonant: 0 };
for (const p of phonemes) {
  if (!(p.kind in kindCount)) fail(`phoneme ${p.symbol}: unknown kind`);
  else kindCount[p.kind]++;
  if (!Array.isArray(p.examples) || p.examples.length !== 3) fail(`phoneme ${p.symbol}: needs 3 examples`);
  if (p.kind === 'consonant' && !['voiced', 'voiceless'].includes(p.voicing)) fail(`phoneme ${p.symbol}: consonant needs voicing`);
}
if (kindCount.monophthong !== 12 || kindCount.diphthong !== 8 || kindCount.consonant !== 24) {
  fail(`phoneme counts must be 12/8/24, found ${JSON.stringify(kindCount)}`);
}
if (BANNED.test(textsOf(phonemes))) fail('banned term in phonemes.json');

const CATEGORIES = ['Opening', 'Context', 'The ask', 'Softening', 'Sign-off'];
const REGISTERS = ['informal', 'neutral', 'formal'];
for (const cat of CATEGORIES) {
  const n = email.tiles.filter(t => t.category === cat).length;
  if (n !== 5) fail(`email tiles: category "${cat}" needs 5, has ${n}`);
}
for (const t of email.tiles) {
  if (!REGISTERS.includes(t.register)) fail(`email tile "${t.phrase}": bad register`);
}
if (email.scenarios.length !== 3) fail(`expected 3 email scenarios, found ${email.scenarios.length}`);
for (const s of email.scenarios) {
  for (const r of REGISTERS) {
    const words = (s.registers[r] || '').trim().split(/\s+/).length;
    if (words < 20) fail(`email scenario ${s.id} ${r}: too short (${words} words)`);
  }
}
if (BANNED.test(textsOf(email))) fail('banned term in email-builder.json');

if (failures.length) {
  console.error('verify-drill-sets: FAIL');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log(`verify-drill-sets: OK (${sets.length} sets, ${itemIds.size} items, ${phonemes.length} phonemes, ${email.tiles.length} tiles)`);
