// web/scripts/verify-aes-engine.cjs
// Verification suite for Automated Essay Scoring (AES) & Clausal Complexity Engine (ENG-105)

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ts = require('typescript');

const SRC = path.join(__dirname, '..', 'src');

function load(rel, deps = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(SRC, rel), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS }
  }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', code)(mod, mod.exports, name => deps[name] || require(name));
  return mod.exports;
}

// Mock localStorage for storage testing
const mockStorage = {};
global.localStorage = {
  getItem: key => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: key => { delete mockStorage[key]; },
  clear: () => { for (const k in mockStorage) delete mockStorage[k]; }
};

const cefr = load('core/cefr.ts');
const treeData = load('core/skill-tree-data.ts');
const storageMod = load('utils/storage.ts', {
  '../core/cefr': cefr,
  '../core/skill-tree-data': treeData
});
const { StorageManager } = storageMod;

const aesMod = load('core/aes-scoring-engine.ts', {
  '../utils/storage': storageMod
});
const { AesScoringEngine } = aesMod;

console.log('=== TEST 1: Execution Latency & Zero-Dependency Performance (<50ms) ===');

const sampleAcademicEssay = `
In contemporary discourse, the proliferation of digital communication platforms has fundamentally reshaped social interactions. While proponents contend that ubiquitous connectivity fosters global collaboration, critics emphasize the attendant erosion of interpersonal intimacy. This essay will examine both perspectives before articulating a balanced appraisal.

On the one hand, digital networks facilitate unprecedented intellectual exchange. Academic institutions and commercial enterprises now leverage virtual infrastructures to coordinate complex initiatives across disparate time zones. Consequently, geographical impediments no longer constrain scholarly dissemination. Furthermore, empirical research demonstrates that collaborative tools enhance operational productivity by approximately thirty percent.

On the other hand, the psychological repercussions of continuous screen exposure cannot be overlooked. Sociological investigations indicate that excessive reliance on digital mediation precipitates communicative isolation and diminished empathy among young adults. When human exchanges are reduced to textual transmissions, subtle prosodic cues and paralinguistic nuances are inevitably lost.

In conclusion, although digital communication platforms undoubtedly accelerate globalization and technical efficiency, deliberate boundaries must be maintained to preserve genuine interpersonal cohesion. Societies should therefore integrate digital literacy into educational curricula to cultivate mindful technological engagement.
`.trim();

const t0 = Date.now();
const result = AesScoringEngine.evaluate(sampleAcademicEssay, 'task2');
const latency = Date.now() - t0;

console.log(`Execution time: ${latency}ms (Engine recorded: ${result.metrics.executionTimeMs}ms), wordCount: ${result.metrics.wordCount}`);
assert.ok(latency < 50, `Execution latency ${latency}ms must be strictly < 50ms`);
assert.ok(result.metrics.wordCount >= 170, 'Word count accurately tallied');
assert.ok(result.metrics.tUnitCount > 0, 'T-Unit count accurately tallied');
assert.ok(!isNaN(result.overallBand), 'Overall band is a valid number');
assert.ok(!isNaN(result.metrics.clausalDensity), 'Clausal density is a valid number');
assert.ok(!isNaN(result.metrics.guiraudIndex), 'Guiraud index is a valid number');
console.log('PASSED: Performance ceiling and metric integrity verified.\n');

console.log('=== TEST 2: Hunt (1965) T-Unit Segmentation & Clausal Complexity ===');

// 2.1 Single simple sentence
const resSimple = AesScoringEngine.evaluate('The government implemented a new economic policy.', 'task2');
assert.strictEqual(resSimple.sentences[0].tUnits.length, 1, 'Simple sentence has 1 T-Unit');
assert.strictEqual(resSimple.sentences[0].clauseCount, 1, 'Simple sentence has 1 clause');
assert.strictEqual(resSimple.metrics.clausalDensity, 1.0, 'Clausal density is 1.0');

// 2.2 Coordinate compound sentence split into 2 T-Units
const resCompound = AesScoringEngine.evaluate('The policy reduced emissions, and local businesses reported higher profits.', 'task2');
assert.strictEqual(resCompound.sentences[0].tUnits.length, 2, 'Compound sentence split into 2 T-Units');
assert.strictEqual(resCompound.sentences[0].clauseCount, 2, 'Total clause count is 2');
assert.strictEqual(resCompound.metrics.clausalDensity, 1.0, 'Clausal density for coordinate T-units is 1.0');

// 2.3 Complex sentence with subordination
const resComplex = AesScoringEngine.evaluate('Although the policy was controversial, the administration refused to retreat.', 'task2');
assert.strictEqual(resComplex.sentences[0].tUnits.length, 1, 'Subordinate clause attaches to main clause in 1 T-Unit');
assert.strictEqual(resComplex.sentences[0].clauseCount, 2, '1 main clause + 1 dependent clause = 2 clauses');
assert.strictEqual(resComplex.metrics.clausalDensity, 2.0, 'Clausal density is 2.0 (2 clauses / 1 T-unit)');
assert.strictEqual(resComplex.metrics.subordinationIndex, 0.5, 'Subordination index is 0.5 (1 dep / 2 clauses)');

// 2.4 Passive Voice & Nominalization Detection
const resPassiveNom = AesScoringEngine.evaluate('The comprehensive evaluation was conducted by the international committee.', 'task2');
assert.strictEqual(resPassiveNom.sentences[0].hasPassive, true, 'Passive voice detected (was conducted)');
assert.ok(resPassiveNom.metrics.nominalizationDensity > 0, 'Nominalizations detected (evaluation)');
console.log('PASSED: Hunt (1965) T-Unit segmentation and clausal ratios verified.\n');

console.log('=== TEST 3: Coh-Metrix Lexical Diversity & AWL 500 Metrics ===');

const words = sampleAcademicEssay.split(/\s+/).filter(Boolean);
const expectedGuiraud = new Set(words.map(w => w.toLowerCase())).size / Math.sqrt(words.length);
assert.ok(Math.abs(result.metrics.guiraudIndex - expectedGuiraud) < 0.2, 'Guiraud Index mathematically matches V / sqrt(N)');

// High academic vocabulary text
assert.ok(result.metrics.awlDensity >= 7.0, `AWL density ${result.metrics.awlDensity}% reflects academic vocabulary`);
assert.ok(result.metrics.cefrProfile.C1 > 0 || result.metrics.cefrProfile.B2 > 0, 'CEFR profile categorizes academic lexis');
assert.ok(result.metrics.maasIndex > 0 && result.metrics.maasIndex < 0.5, 'Maas index calculated within expected bounds');
console.log('PASSED: Coh-Metrix lexical diversity and AWL penetration verified.\n');

console.log('=== TEST 4: Cambridge IELTS Half-Band Rounding Invariants ===');

assert.strictEqual(AesScoringEngine.roundIeltsBand(6.0), 6.0);
assert.strictEqual(AesScoringEngine.roundIeltsBand(6.125), 6.0, '6.125 rounds down to 6.0 (< 0.25)');
assert.strictEqual(AesScoringEngine.roundIeltsBand(6.25), 6.5, '6.25 rounds to 6.5 (>= 0.25)');
assert.strictEqual(AesScoringEngine.roundIeltsBand(6.375), 6.5, '6.375 rounds to 6.5');
assert.strictEqual(AesScoringEngine.roundIeltsBand(6.625), 6.5, '6.625 rounds to 6.5 (< 0.75)');
assert.strictEqual(AesScoringEngine.roundIeltsBand(6.75), 7.0, '6.75 rounds up to 7.0 (>= 0.75)');
assert.strictEqual(AesScoringEngine.roundIeltsBand(6.875), 7.0, '6.875 rounds up to 7.0');
assert.strictEqual(AesScoringEngine.roundIeltsBand(7.25), 7.5);
assert.strictEqual(AesScoringEngine.roundIeltsBand(7.75), 8.0);
assert.strictEqual(AesScoringEngine.roundIeltsBand(8.25), 8.5);
assert.strictEqual(AesScoringEngine.roundIeltsBand(8.75), 9.0);
console.log('PASSED: Cambridge IELTS half-band rounding invariants verified.\n');

console.log('=== TEST 5: Real-World IELTS Benchmarks (Band 5.5 vs Band 8.0) ===');

// 5.1 Band 5.5 Essay (Short, repetitive, coordinate and-chains, limited lexis)
const band55Essay = `
In my opinion I think that cars should be banned from city centers. Many people drive cars every day and they make a lot of traffic. Cars are very noisy and they produce smoke. This is bad for people.
Firstly, pollution is bad for children and older people. When cars drive in cities, the air becomes dirty. People can get sick easily.
Secondly, buses and trains are good. People can take buses and they can walk. It is cheaper and it is healthy.
In conclusion, cars make bad air and traffic. Governments should stop cars in cities.
`.trim();

const res55 = AesScoringEngine.evaluate(band55Essay, 'task2');
console.log(`Band 5.5 Test => Raw: ${res55.rawAverage}, Band: ${res55.overallBand}, WordCount: ${res55.metrics.wordCount}`);
assert.ok(res55.overallBand <= 6.0, `Band ${res55.overallBand} must be <= 6.0 for repetitive simplistic essay`);
assert.ok(res55.diagnostics.some(d => d.level === 'critical' || d.level === 'warning'), 'Identified critical diagnostics (word count shortfall)');

// 5.2 Band 8.0 Essay (Full 270+ words, multi-clausal, sophisticated lexis, passive voice, nominalization)
const band80Essay = `
The accelerating pace of urban industrialization has ignited an intense debate regarding whether private vehicular access should be restricted within metropolitan epicenters. Although opponents argue that such prohibitions infringe upon personal mobility and disrupt commercial transit, this essay will demonstrate that urban vehicle bans yield indispensable environmental and socio-economic dividends.

To begin with, the exclusion of fossil-fueled automobiles dramatically mitigates ambient atmospheric degradation. In major global capitals, automotive combustion constitutes the predominant contributor to particulate matter and nitrogen dioxide emissions. When private vehicles are substituted with zero-emission electrified public transit, urban air quality improves substantially. Empirical epidemiological research conducted in European municipalities confirms that pedestrianized zones correlate with a twenty-five percent reduction in pediatric respiratory hospitalizations. Furthermore, acoustic pollution is drastically curtailed, creating serene public spaces conducive to civic commerce and community well-being. Simultaneously, mitigating carbon emissions assists national governments in meeting stringent climate change targets established by international environmental treaties.

Additionally, automobile-free urban centers catalyze economic vitality. Traditional retail districts frequently suffer from vehicular congestion, which deters prospective patrons and degrades street-level walkability. By reallocating multi-lane roadways toward expansive pedestrian corridors and dedicated cycling infrastructure, city administrations foster vibrant commercial ecosystems where outdoor hospitality and artisanal enterprise flourish. Consequently, local commercial revenues invariably escalate following comprehensive pedestrianization initiatives. Furthermore, pedestrian hubs consistently attract international tourism and stimulate cultural activity across diverse neighborhoods.

In conclusion, while the transition toward car-free urban centers necessitates initial infrastructural recalibration and enhanced public transport capacity, the long-term public health and commercial benefits are overwhelmingly compelling. Metropolitan authorities should therefore progressively restrict private vehicular access to establish sustainable, human-centric cities.
`.trim();

const res80 = AesScoringEngine.evaluate(band80Essay, 'task2');
console.log(`Band 8.0 Test => Raw: ${res80.rawAverage}, Band: ${res80.overallBand}, WordCount: ${res80.metrics.wordCount}, C/T: ${res80.metrics.clausalDensity}`);
console.log('Subscores:', JSON.stringify(res80.subScores));
assert.ok(res80.overallBand >= 7.5, `Band ${res80.overallBand} must be >= 7.5 for sophisticated academic essay`);
assert.ok(res80.metrics.wordCount >= 250, 'Word count exceeds Task 2 minimum');
assert.ok(res80.metrics.clausalDensity >= 1.6, 'Clausal density reflects multi-clausal maturity');
assert.ok(res80.metrics.awlDensity >= 7.0, 'AWL density demonstrates academic register');
console.log('PASSED: Real-world IELTS score calibration across Band 5.5 and Band 8.0 verified.\n');

console.log('=== TEST 6: Dynamic Band 6-to-8 Rewrite Generator & Myers Diff ===');

const rewriteSample = `
In my opinion I think that governments should act quickly.
The population expanded rapidly and it caused severe traffic congestion.
Because the government invested more in public transport, commute times decreased.
`.trim();

const resRewrite = AesScoringEngine.evaluate(rewriteSample, 'task2');
assert.ok(resRewrite.rewrites.length >= 2, 'Generated multiple Band 6-to-8 rewrite suggestions');

const firstRw = resRewrite.rewrites[0];
assert.ok(firstRw.originalSentence.length > 0);
assert.ok(firstRw.upgradedSentence.length > 0);
assert.ok(firstRw.rationale.length > 0);
assert.ok(firstRw.diffOps.length > 0, 'Word-level diff generated');

// Verify Myers diff reconstruction
const reconstructedOriginal = firstRw.diffOps
  .filter(op => op.op === 'equal' || op.op === 'delete')
  .map(op => op.text.toLowerCase())
  .join(' ');

const origWords = firstRw.originalSentence.toLowerCase().split(/\s+/).filter(Boolean).join(' ');
assert.strictEqual(reconstructedOriginal, origWords, 'Myers diff accurately reconstructs original sentence');
console.log('PASSED: Band 6-to-8 rewrites and Myers word-level diff verified.\n');

console.log('=== TEST 7: StorageManager v4 Pre-Flight Checklist Integration ===');

localStorage.clear();
StorageManager.clearCache();

const flawedEssay = `
In my opinion I think that cars make bad air.
People drive cars every day and it caused traffic.
`.trim();

const resStorage = AesScoringEngine.evaluate(flawedEssay, 'task2');
assert.ok(resStorage.preFlightChecklistMounts.length > 0, 'Error items mounted to StorageManager');

const checklist = StorageManager.getPreFlightChecklist();
assert.ok(checklist.length > 0, 'Pre-flight checklist rules generated in StorageManager v4');
console.log('PASSED: StorageManager v4 Pre-Flight Checklist bridge verified.\n');

console.log('======================================================');
console.log('ALL ASSERTIONS PASSED: ENG-105 Automated Essay Scoring (AES) Engine');
console.log('======================================================');
