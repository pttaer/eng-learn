const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ts = require('typescript');

console.log('=== RUNNING DEEP WRITING HEURISTICS VERIFICATION ===\n');

const SRC = path.join(__dirname, '..', 'src', 'ielts');
const code = ts.transpileModule(
  fs.readFileSync(path.join(SRC, 'writing-heuristics.ts'), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }
).outputText;
const mod = { exports: {} };
new Function('module', 'exports', 'require', code)(mod, mod.exports, require);

const { diagnoseArgumentStructure, diagnoseStyleUpgrades, evaluateParagraphCohesion, analyse } = mod.exports;

// --- Task 1: Argument Structure Diagnostic ---
console.log('1. Testing diagnoseArgumentStructure...');
assert(typeof diagnoseArgumentStructure === 'function', 'diagnoseArgumentStructure must be exported');

const intro = 'In recent years, the impact of technology on education has triggered extensive debate. I agree that digital devices improve learning outcomes.';
const body1 = 'One primary advantage of digital tools is their capacity to foster active learning. This is because interactive software enables students to absorb abstract concepts at their own pace. However, there is no study or data mentioned here.';
const body2 = 'Another compelling factor relates to information access. Because online databases update instantaneously, pupils can verify facts efficiently. For instance, research conducted by Cambridge University demonstrated a 30% increase in retention rates when learners utilized digital archives.';
const conclusion = 'In conclusion, digital tools enhance academic performance. Consequently, schools should integrate them into their curricula.';

const paras = [intro, body1, body2, conclusion];
const report = diagnoseArgumentStructure(paras, 2);

assert.strictEqual(report.totalBodyParagraphs, 2, 'Should detect exactly 2 body paragraphs');
assert.strictEqual(report.bodyParagraphs[0].hasTopicSentence, true, 'Body 1 should have topic sentence');
assert.strictEqual(report.bodyParagraphs[0].hasCausalExplanation, true, 'Body 1 should have causal explanation');
assert.strictEqual(report.bodyParagraphs[0].hasConcreteEvidence, false, 'Body 1 should be missing concrete evidence');
assert(report.bodyParagraphs[0].missingElements.includes('evidence'), 'Body 1 missing elements must include evidence');

assert.strictEqual(report.bodyParagraphs[1].hasTopicSentence, true, 'Body 2 should have topic sentence');
assert.strictEqual(report.bodyParagraphs[1].hasCausalExplanation, true, 'Body 2 should have causal explanation');
assert.strictEqual(report.bodyParagraphs[1].hasConcreteEvidence, true, 'Body 2 should have concrete evidence');
assert.strictEqual(report.bodyParagraphs[1].missingElements.length, 0, 'Body 2 should have no missing elements');

assert.strictEqual(report.fullyDevelopedParagraphs, 1, 'Exactly 1 paragraph fully developed');
assert(report.summaryFlags.some(f => /Body Paragraph 1.*evidence/i.test(f)), 'Summary flags must cite missing evidence in Body 1');
console.log('   ✓ Task 1 tests passed successfully.\n');

// --- Task 2: Manchester Phrasebank Style Upgrader ---
console.log('2. Testing diagnoseStyleUpgrades...');
assert(typeof diagnoseStyleUpgrades === 'function', 'diagnoseStyleUpgrades must be exported');

const informalEssay = `In my opinion, pollution is a big problem nowadays. A lot of cars produce bad effect on the environment. I think governments must deal with this issue and get rid of old vehicles so kids can breathe clean air.`;
const styleReport = diagnoseStyleUpgrades(informalEssay);
assert(styleReport.detectedPhrases.length >= 5, 'Should detect at least 5 informal markers');
const phrases = styleReport.detectedPhrases.map(p => p.original.toLowerCase());

assert(phrases.includes('in my opinion'), 'Must detect "in my opinion"');
assert(phrases.includes('a lot of'), 'Must detect "a lot of"');
assert(phrases.includes('bad effect'), 'Must detect "bad effect"');
assert(phrases.includes('big problem'), 'Must detect "big problem"');
assert(phrases.includes('deal with'), 'Must detect "deal with"');
assert(phrases.includes('kids'), 'Must detect "kids"');

const opinionItem = styleReport.detectedPhrases.find(p => p.original.toLowerCase() === 'in my opinion');
assert(opinionItem.phrasebankStems.length >= 2, 'Must provide 2+ phrasebank stems');
assert(opinionItem.phrasebankStems.some(s => /widely contended|arguable|evidence suggests/i.test(s)), 'Must suggest academic hedging stems');

const badEffectItem = styleReport.detectedPhrases.find(p => p.original.toLowerCase() === 'bad effect');
assert(badEffectItem.phrasebankStems.some(s => /adverse impact|detrimental ramifications/i.test(s)), 'Must suggest academic causality/impact stems');

const academicText = 'It is widely contended that vehicular emissions exert an adverse impact on atmospheric conditions. A substantial proportion of urban centers experience elevated particulate concentrations. Consequently, targeted policy interventions should be instituted to mitigate environmental degradation.';
const academicReport = diagnoseStyleUpgrades(academicText);
assert.strictEqual(academicReport.detectedPhrases.length, 0, 'Academic text should trigger 0 weak phrases');
assert.strictEqual(academicReport.academicToneScore, 100, 'Academic tone score should be 100');
console.log('   ✓ Task 2 tests passed successfully.\n');

// --- Task 3: Paragraph Cohesion & Enriched Analysis ---
console.log('3. Testing evaluateParagraphCohesion & enriched analyse()...');
assert(typeof evaluateParagraphCohesion === 'function', 'evaluateParagraphCohesion must be exported');

const abruptEssay = [
  'Technology affects learning in many ways. I believe computers are beneficial.',
  'Computers help people study fast. Students can look up things.',
  'Books are still good for some people. Libraries provide quiet spaces.',
  'Technology is good overall.'
];
const abruptCohesion = evaluateParagraphCohesion(abruptEssay, 2);
assert.strictEqual(abruptCohesion.hasAbruptTransitions, true, 'Abrupt essay must flag abrupt transitions');
assert(abruptCohesion.cohesionScore < 60, 'Abrupt essay must score low on cohesion');

const cohesiveEssay = [
  'In the contemporary era, technological integration has transformed educational methodology. I contend that digital platforms substantially elevate academic outcomes.',
  'To begin with, interactive interfaces actively foster conceptual comprehension. Because learners engage directly with simulations, complex principles become transparent.',
  'On the other hand, traditional print media retains demonstrable utility for sustained cognitive concentration. Furthermore, structured textbooks minimize peripheral digital distractions.',
  'In conclusion, whilst conventional resources remain valuable, digital systems offer unparalleled educational agility.'
];
const cohesiveResult = evaluateParagraphCohesion(cohesiveEssay, 2);
assert.strictEqual(cohesiveResult.hasAbruptTransitions, false, 'Cohesive essay should have no abrupt transitions');
assert(cohesiveResult.cohesionScore >= 80, 'Cohesive essay should score >= 80');
assert.strictEqual(cohesiveResult.cohesionBandEstimate, 'Band 8.5', 'Cohesive essay should achieve Band 8.5 estimate');

const fullAnalysis = analyse(cohesiveEssay.join('\n\n'), 2);
assert(fullAnalysis.argumentStructure, 'analyse() must return argumentStructure');
assert(fullAnalysis.styleUpgrades, 'analyse() must return styleUpgrades');
assert(fullAnalysis.cohesion, 'analyse() must return cohesion');
assert(Array.isArray(fullAnalysis.flags), 'analyse() must preserve existing flags');
console.log('   ✓ Task 3 tests passed successfully.\n');

// --- Task 4 & 5: Performance Budget (< 15ms) ---
console.log('4. Testing execution time performance budget (< 15ms)...');
const longEssay = `Over the past several decades, the exponential acceleration of digital technology has transformed nearly every facet of contemporary education. While some commentators argue that screens and personal computers fragment human attention, I firmly contend that digital learning tools yield substantial cognitive advantages when properly structured within an academic curriculum.

To begin with, interactive digital platforms significantly elevate conceptual understanding by rendering abstract phenomena tangible. This occurs because computational models allow students to manipulate experimental variables in real time, thereby observing immediate causal relationships. For instance, a longitudinal study conducted by Cambridge University in 2023 demonstrated that secondary pupils utilizing dynamic physics simulations scored 28% higher on mechanistic reasoning assessments than peers restricted to standard textbooks. Consequently, experiential computer modeling serves as an indispensable catalyst for deeper intellectual retention.

On the other hand, skeptics contend that widespread classroom digitization encourages passive consumption and superficial skimming. Furthermore, unrestricted internet access may expose younger individuals to digital distractions that compromise study habits. Specifically, recent observational studies indicate that unmonitored tablet use diminishes task persistence. Nevertheless, these drawbacks stem not from technological tools themselves, but from inadequate institutional oversight and the absence of disciplined digital hygiene. Effective pedagogical guidelines and guided classroom environments can readily mitigate these risks while preserving exploratory learning.

In conclusion, although the proliferation of electronic devices requires mindful supervision, their ability to democratize knowledge and illuminate complex topics remains unparalleled. Educational institutions should therefore invest in structured digital integration rather than succumbing to nostalgic prohibition.`;

const t0 = performance.now();
const perfResult = analyse(longEssay, 2);
const elapsed = performance.now() - t0;

console.log(`   Writing Heuristics Analysis executed in ${elapsed.toFixed(2)}ms`);
assert(elapsed < 15, `Analysis took ${elapsed.toFixed(2)}ms, exceeding 15ms budget`);
assert.strictEqual(perfResult.argumentStructure.fullyDevelopedParagraphs, 2, 'Both body paragraphs must be fully developed');
assert(perfResult.argumentStructure.score >= 90, 'High quality essay should score >= 90 in structure');
assert(perfResult.cohesion.cohesionScore >= 80, 'High quality essay should score >= 80 in cohesion');

console.log('\n=== ALL DEEP WRITING HEURISTICS VERIFICATIONS PASSED ===');
