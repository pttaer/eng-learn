/**
 * web/scripts/verify-human-voice-free-enhancements.cjs
 *
 * Automated verification suite for the 6 High-Value Human-Voice-Free System Enhancements:
 * 1. Semantic Evaluation & Paraphrase Flexibility in Writing
 * 2. Interactive Branching & Surprise Examiner Follow-ups in Conversation
 * 3. Actionable Articulatory Biomechanical Hints & Pitch Trajectory Guidance for Pronunciation
 * 4. Extensive Reading & Listening Module (Comprehensible Input)
 * 5. L1 Transfer & Error Taxonomy Diagnostic (Vietnamese EFL Focus)
 * 6. Cognitive Load Scaffolding (Gentle Student Mode vs. Tactical Cockpit Mode)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ts = require('typescript');

console.log('================================================================');
console.log('[VERIFICATION] 6 High-Value Human-Voice-Free System Enhancements');
console.log('================================================================\n');

const CORE = path.join(__dirname, '..', 'src', 'core');
const MODULES = path.join(__dirname, '..', 'src', 'modules');

function loadModule(filePath, deps = {}) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const code = ts.transpileModule(raw, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText;
  const mod = { exports: {} };
  const customRequire = (id) => {
    if (deps[id]) return deps[id];
    if (id.startsWith('./') || id.startsWith('../')) {
      const resolved = path.resolve(path.dirname(filePath), id);
      const candidates = [resolved, resolved + '.ts', resolved + '.js', path.join(resolved, 'index.ts')];
      for (const c of candidates) {
        if (fs.existsSync(c)) return loadModule(c, deps);
      }
    }
    return require(id);
  };
  new Function('module', 'exports', 'require', code)(mod, mod.exports, customRequire);
  return mod.exports;
}

// ---------------------------------------------------------------------------
// 1. SEMANTIC EVALUATION & PARAPHRASE FLEXIBILITY IN WRITING
// ---------------------------------------------------------------------------
console.log('--- 1. Testing SemanticParaphraseEvaluator ---');
const { SemanticParaphraseEvaluator } = loadModule(path.join(CORE, 'semantic-paraphrase-evaluator.ts'));
assert.ok(SemanticParaphraseEvaluator, 'SemanticParaphraseEvaluator must be exported');

// Test 1.1: Exact match gives high overallScore and 100% concept recall
const exactTarget = 'The rapid advancement of artificial intelligence fundamentally revolutionizes education.';
const exactResult = SemanticParaphraseEvaluator.evaluate(exactTarget, exactTarget);
assert.strictEqual(exactResult.conceptCoveragePct, 100, 'Exact match must have 100% recall');
assert.ok(exactResult.overallScore >= 85, `Exact match score should be >= 85, got ${exactResult.overallScore}`);
assert.strictEqual(exactResult.isAcceptableParaphrase, true, 'Exact match must be acceptable paraphrase');

// Test 1.2: Valid academic synonym replacement
const synonymTarget = 'The government must solve economic problems to improve society.';
const synonymInput = 'The government must tackle economic problems to enhance society.';
const synResult = SemanticParaphraseEvaluator.evaluate(synonymTarget, synonymInput);
assert.ok(synResult.overallScore >= 75, `Synonym paraphrase score should be high, got: ${synResult.overallScore}`);
assert.ok(synResult.detectedSynonyms.length >= 1, 'Should detect synonym replacements (solve->tackle, improve->enhance)');
assert.ok(synResult.conceptCoveragePct >= 80, 'Core concept recall should remain high with synonyms');
assert.strictEqual(synResult.isAcceptableParaphrase, true, 'High synonym match should be acceptable');

// Test 1.3: Passive to active structural shift detection (strict verification)
const passiveTarget = 'A novel vaccine was discovered by scientists during the pandemic.';
const activeInput = 'Scientists discovered a novel vaccine during the pandemic.';
const passResult = SemanticParaphraseEvaluator.evaluate(passiveTarget, activeInput);
assert.ok(
  passResult.detectedSyntacticShifts.includes('Passive to Active Voice Conversion'),
  'Should strictly recognize canonical passive/active shift token'
);
assert.ok(passResult.syntacticSophisticationScore >= 70, 'Shift should raise syntactic sophistication');

// Test 1.4: Stemming with derivational variations (e.g. demonstrate vs demonstration)
assert.strictEqual(
  SemanticParaphraseEvaluator.isEquivalentWord('demonstrate', 'demonstration'),
  true,
  'Stemmer should recognize verb/noun derivational family'
);

// Test 1.5: Edge cases (empty string, completely unrelated sentence)
const emptyResult = SemanticParaphraseEvaluator.evaluate(exactTarget, '');
assert.strictEqual(emptyResult.overallScore, 0, 'Empty input must give 0 score');
assert.strictEqual(emptyResult.conceptCoveragePct, 0, 'Empty input concept recall must be 0');
assert.strictEqual(emptyResult.isAcceptableParaphrase, false, 'Empty input must not be acceptable');

const gibberishResult = SemanticParaphraseEvaluator.evaluate(exactTarget, 'Banana elephant airplane blue sky.');
assert.ok(gibberishResult.overallScore <= 45, 'Gibberish/unrelated input must score low');
assert.strictEqual(gibberishResult.isAcceptableParaphrase, false, 'Gibberish input must not be acceptable');

console.log('✓ SemanticParaphraseEvaluator passed all tests.\n');

// ---------------------------------------------------------------------------
// 2. ARTICULATORY BIOMECHANICS & PITCH CONTOURS
// ---------------------------------------------------------------------------
console.log('--- 2. Testing ArticulatoryBiomechanics ---');
const { ArticulatoryBiomechanics } = loadModule(path.join(CORE, 'articulatory-biomechanics.ts'));
assert.ok(ArticulatoryBiomechanics, 'ArticulatoryBiomechanics must be exported');

// Test 2.1: Known phoneme lookup specs
const eeSpec = ArticulatoryBiomechanics.getProfile('iː');
assert.ok(eeSpec, 'Profile for iː must exist');
assert.strictEqual(eeSpec.symbol, 'iː');
assert.strictEqual(eeSpec.jawApertureMm, 3);
assert.strictEqual(eeSpec.lipPosture, 'spread');
assert.strictEqual(eeSpec.targetFormants.f1, 280);
assert.strictEqual(eeSpec.targetFormants.f2, 2250);
assert.ok(eeSpec.vietnameseL1Contrast && eeSpec.vietnameseL1Contrast.length > 10, 'Must have detailed Vietnamese L1 guidance note');

const thSpec = ArticulatoryBiomechanics.getProfile('θ');
assert.ok(thSpec, 'Profile for θ must exist');
assert.strictEqual(thSpec.kind, 'consonant');
assert.ok(thSpec.tonguePosition.includes('interdental') || thSpec.tonguePosition.includes('teeth'), 'Must indicate interdental position');

// Test 2.2: Formant delta to mm physical adjustments
const deltaDiag = ArticulatoryBiomechanics.diagnoseFormants('iː', 460, 1800);
assert.ok(deltaDiag, 'Formant diagnosis must not be null');
assert.ok(deltaDiag.jawAdjustment.includes('jaw is dropped too low'), `Jaw adjustment should recommend closing jaw: ${deltaDiag.jawAdjustment}`);
assert.ok(deltaDiag.tongueAdjustment.includes('tongue blade forward'), `Tongue adjustment should recommend pushing forward: ${deltaDiag.tongueAdjustment}`);
assert.strictEqual(deltaDiag.deltaF1, 180);
assert.strictEqual(deltaDiag.deltaF2, -450);

// Test 2.3: Pitch trajectory contour SVG generator
const fallingSvg = ArticulatoryBiomechanics.generatePitchContourSvg('fall', 240, 60);
assert.ok(fallingSvg.includes('<svg') && fallingSvg.includes('</svg>'), 'Must produce valid SVG tags');
assert.ok(fallingSvg.includes('<path') && fallingSvg.includes('<circle'), 'Must contain path and circle elements');

const riseFallSvg = ArticulatoryBiomechanics.generatePitchContourSvg('rise-fall');
assert.ok(riseFallSvg.includes('viewBox="0 0 200 50"'), 'Must render with default dimensions');

// Test 2.4: Minimal pairs
const minPairs = ArticulatoryBiomechanics.getMinimalPairs();
assert.ok(minPairs.length >= 3, 'Must provide at least 3 minimal pairs');
assert.ok(minPairs.some(p => p.pairId === 'sheep-ship'), 'Must include sheep-ship minimal pair');

console.log('✓ ArticulatoryBiomechanics passed all tests.\n');

// ---------------------------------------------------------------------------
// 3. EXTENSIVE READING DOSSIER LIBRARY & LOGIC
// ---------------------------------------------------------------------------
console.log('--- 3. Testing ExtensiveReaderDossier Library ---');
const extSrc = fs.readFileSync(path.join(MODULES, 'extensive-reader-dossier.ts'), 'utf8');
assert.ok(extSrc.includes('export class ExtensiveReaderDossier'), 'Must export ExtensiveReaderDossier class');
assert.ok(extSrc.includes('ExtensiveArticle'), 'Must export ExtensiveArticle interface');
assert.ok(extSrc.includes('readingData'), 'Must bind to reading database');
assert.ok(extSrc.includes('lexiconData'), 'Must bind to lexicon dictionary for real definitions & Vietnamese gloss');
assert.ok(extSrc.includes('AcousticHaptics') && extSrc.includes('SRSEngine'), 'Must integrate with AcousticHaptics and SRSEngine');
assert.ok(extSrc.includes('speechSynthesis'), 'Must use offline browser SpeechSynthesis');
assert.ok(extSrc.includes('Nghĩa:'), 'Must render Vietnamese gloss in word lookup popover');

console.log('✓ ExtensiveReaderDossier source contracts verified.\n');

// ---------------------------------------------------------------------------
// 4. L1 VIETNAMESE DIAGNOSTIC & REMEDIATION LOOPS
// ---------------------------------------------------------------------------
console.log('--- 4. Testing L1VietnameseDiagnosticEngine ---');
// Mock StorageManager for Node test environment
const mockStorage = {
  getLearnerProfile: () => ({ errorLedger: {} }),
  saveLearnerProfile: () => {},
  recordError: () => {},
  getErrorRecords: () => []
};
const { L1VietnameseDiagnosticEngine } = loadModule(path.join(CORE, 'l1-vietnamese-diagnostic.ts'), {
  '../utils/storage': { StorageManager: mockStorage }
});
assert.ok(L1VietnameseDiagnosticEngine, 'L1VietnameseDiagnosticEngine must be exported');

// Test 4.1: Suffix deletion
const r1 = L1VietnameseDiagnosticEngine.analyzeSentence('She work hard every day.');
const s1 = r1.find(x => x.type === 'FINAL_CONSONANT_DELETION');
assert.ok(s1, 'Must detect 3rd person suffix deletion');
assert.ok(s1.vietnameseContrast.includes('không biến hình'), 'Must explain non-inflection root cause');

// Test 4.2: Dual conjunctions
const r2 = L1VietnameseDiagnosticEngine.analyzeSentence('Although it was raining heavily, but we decided to go out.');
const s2 = r2.find(x => x.type === 'TOPIC_COMMENT_DUAL_CONJUNCTIONS');
assert.ok(s2, 'Must detect Vietnamese calque "Although... but"');

// Test 4.3: Zero copula
const r3 = L1VietnameseDiagnosticEngine.analyzeSentence('She very beautiful today.');
const s3 = r3.find(x => x.type === 'ZERO_COPULA_ADJECTIVE');
assert.ok(s3, 'Must detect zero copula with predicative adjective');

// Test 4.4: Existential "have"
const r4 = L1VietnameseDiagnosticEngine.analyzeSentence('In my city have many tall buildings.');
const s4 = r4.find(x => x.type === 'THERE_HAVE_EXISTENTIAL');
assert.ok(s4, 'Must detect existential have calqued from "Ở... có..."');

// Test 4.5: Mass noun pluralization
const r5 = L1VietnameseDiagnosticEngine.analyzeSentence('We received many important informations.');
const s5 = r5.find(x => x.type === 'PLURAL_MASS_COUNT');
assert.ok(s5, 'Must detect mass noun pluralization (-s)');

// Test 4.6: Preposition calque
const r6 = L1VietnameseDiagnosticEngine.analyzeSentence('I like to listen music while studying.');
const s6 = r6.find(x => x.type === 'PREPOSITION_CALQUE');
assert.ok(s6, 'Must detect preposition calque "listen music"');

// Test 4.7: Pristine grammar returns empty array
const clean = L1VietnameseDiagnosticEngine.analyzeSentence('Although it was raining, we attended the conference.');
assert.strictEqual(clean.length, 0, 'Clean sentence must produce zero false positive diagnoses');

// Test 4.8: Contrastive remediation drills
const drills = L1VietnameseDiagnosticEngine.getRemediationDrills();
assert.ok(drills.length >= 6, 'Must provide at least 6 contrastive remediation drills');
assert.ok(drills.every(d => d.contrastiveAnalysis && d.expectedCorrection), 'Drills must have contrastive analysis and expected correction');

console.log('✓ L1VietnameseDiagnosticEngine passed all tests.\n');

// ---------------------------------------------------------------------------
// 5. COGNITIVE SCAFFOLDING ENGINE
// ---------------------------------------------------------------------------
console.log('--- 5. Testing CognitiveScaffoldingEngine ---');
// Mock localStorage for Node test environment
let storedMode = null;
global.localStorage = {
  getItem: () => storedMode,
  setItem: (k, v) => { storedMode = v; }
};
global.document = {
  documentElement: {
    dataset: {},
    setAttribute: () => {}
  }
};
const eventListeners = new Map();
global.window = {
  addEventListener: (event, handler) => {
    if (!eventListeners.has(event)) eventListeners.set(event, []);
    eventListeners.get(event).push(handler);
  },
  removeEventListener: (event, handler) => {
    if (eventListeners.has(event)) {
      eventListeners.set(event, eventListeners.get(event).filter(h => h !== handler));
    }
  },
  dispatchEvent: (event) => {
    const handlers = eventListeners.get(event.type) || [];
    for (const h of handlers) h(event);
    return true;
  }
};

const { CognitiveScaffoldingEngine } = loadModule(path.join(CORE, 'cognitive-scaffolding-mode.ts'));
assert.ok(CognitiveScaffoldingEngine, 'CognitiveScaffoldingEngine must be exported');

let notifiedMode = null;
const unsub = CognitiveScaffoldingEngine.subscribe((m) => { notifiedMode = m; });

CognitiveScaffoldingEngine.setMode('gentle');
assert.strictEqual(CognitiveScaffoldingEngine.getMode(), 'gentle');
assert.strictEqual(CognitiveScaffoldingEngine.isGentle(), true);
assert.strictEqual(CognitiveScaffoldingEngine.isCockpit(), false);
assert.strictEqual(notifiedMode, 'gentle', 'Subscriber should receive mode update on setMode');

CognitiveScaffoldingEngine.toggle();
assert.strictEqual(CognitiveScaffoldingEngine.getMode(), 'cockpit');
assert.strictEqual(CognitiveScaffoldingEngine.isCockpit(), true);
assert.strictEqual(notifiedMode, 'cockpit', 'Subscriber should receive mode update on toggle');

unsub();
CognitiveScaffoldingEngine.setMode('gentle');
assert.strictEqual(notifiedMode, 'cockpit', 'Unsubscribed listener should not receive further updates');

const meta = CognitiveScaffoldingEngine.getModeMeta();
assert.ok(meta.label.includes('Gentle Student'), 'Gentle metadata label expected');

console.log('✓ CognitiveScaffoldingEngine passed all tests.\n');

// ---------------------------------------------------------------------------
// 6. CONVERSATION PARTNER ENGINE BRANCHING & SURPRISE FOLLOW-UP EXECUTION
// ---------------------------------------------------------------------------
console.log('--- 6. Testing ConversationPartnerEngine Branching & Execution ---');
const { ConversationPartnerEngine, BUILTIN_SCENARIOS } = loadModule(path.join(CORE, 'conversation-partner-engine.ts'));
assert.ok(ConversationPartnerEngine, 'Must export ConversationPartnerEngine');
assert.ok(BUILTIN_SCENARIOS.length >= 6, 'Must have at least 6 roleplay scenarios across A1-C2');

// Test 6.1: Verify B1 baggage claims branching and surprise challenge
const b1Engine = new ConversationPartnerEngine('b1-luggage');
assert.strictEqual(b1Engine.getScenario().id, 'b1-luggage');

// Turn 0: Learner submits response matching fragile priority branch
const turn0Res = b1Engine.processLearnerTurn('My navy blue bag has fragile medication inside.');
assert.ok(turn0Res.learnerMessage.branchTaken, 'Branch must be recorded');
assert.ok(turn0Res.partnerMessage.text.includes('fragile') || turn0Res.partnerMessage.text.includes('identification'), 'Partner must branch response');

// Turn 1: Examiner triggers surprise follow-up challenge
const turn1Res = b1Engine.processLearnerTurn('I am staying at the Grand Hotel on 5th Avenue.');
assert.strictEqual(turn1Res.partnerMessage.isSurpriseChallenge, true, 'Turn 1 must trigger surprise challenge');
assert.ok(turn1Res.partnerMessage.text.includes('barcode routing slip') || turn1Res.partnerMessage.text.includes('receipt'), 'Must inject unexpected follow-up');

// Test 6.2: Verify C1 deadline negotiation branching and surprise follow-up
const c1Engine = new ConversationPartnerEngine('c1-deadline');
const c1Turn0 = c1Engine.processLearnerTurn('I propose decoupling the ingestion module to prevent database deadlock.');
assert.ok(c1Turn0.learnerMessage.branchTaken, 'C1 branch must be recorded');
const c1Turn1 = c1Engine.processLearnerTurn('We ran load testing up to ten thousand concurrent transactions.');
assert.strictEqual(c1Turn1.partnerMessage.isSurpriseChallenge, true, 'C1 Turn 1 must trigger surprise challenge');

console.log('✓ ConversationPartnerEngine branching & surprise follow-up verified in execution.\n');

// ---------------------------------------------------------------------------
// 7. DESIGN SYSTEM & ACCESSIBILITY INVARIANTS
// ---------------------------------------------------------------------------
console.log('--- 7. Verifying Design System Invariants ---');
const uxC = fs.readFileSync(path.join(__dirname, '..', 'src', 'assets', 'styles', 'ux-c.css'), 'utf8');
assert.ok(uxC.includes('html[data-cognitive-mode="gentle"]'), 'CSS must declare data-cognitive-mode="gentle" rules');
assert.ok(uxC.includes('html[data-cognitive-mode="cockpit"]'), 'CSS must declare data-cognitive-mode="cockpit" rules');

const headerHud = fs.readFileSync(path.join(MODULES, 'header-hud.ts'), 'utf8');
assert.ok(
  headerHud.includes('btn-cognitive-mode-toggle') && headerHud.includes('<span class="btn-label">'),
  'Header HUD must wrap cognitive toggle label in btn-label for mobile compactness'
);

console.log('✓ Design system invariants verified.\n');

console.log('================================================================');
console.log('✅ ALL 6 HUMAN-VOICE-FREE SYSTEM ENHANCEMENTS VERIFIED CLEANLY!');
console.log('================================================================');
process.exit(0);
