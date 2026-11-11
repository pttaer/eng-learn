// scripts/verify-goap-adversary.cjs
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== [TEST] Starting Verification of Cognitive Adversary & GOAP Planner ===');

// Setup mock localStorage in Node.js environment
global.localStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

// Helper to compile and evaluate TS module in Node
const ts = require(path.resolve(__dirname, '../web/node_modules/typescript'));
const moduleCache = new Map();

function loadTsModule(filePath) {
  const resolved = path.resolve(filePath);
  if (moduleCache.has(resolved)) {
    return moduleCache.get(resolved);
  }

  const dir = path.dirname(resolved);
  const code = fs.readFileSync(resolved, 'utf8');
  const transpiled = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText;
  const m = { exports: {} };
  moduleCache.set(resolved, m.exports);

  const customRequire = (id) => {
    if (id.startsWith('.')) {
      const targetTs = path.resolve(dir, id + '.ts');
      if (fs.existsSync(targetTs)) return loadTsModule(targetTs);
      const targetJs = path.resolve(dir, id + '.js');
      if (fs.existsSync(targetJs)) return require(targetJs);
      const targetIndex = path.resolve(dir, id, 'index.ts');
      if (fs.existsSync(targetIndex)) return loadTsModule(targetIndex);
    }
    return require(id);
  };
  const fn = new Function('require', 'module', 'exports', 'localStorage', transpiled);
  fn(customRequire, m, m.exports, global.localStorage);
  return m.exports;
}

function testTask1Types() {
  console.log('\n[Task 1] Checking Core Domain Types...');
  const adversaryPath = path.resolve(__dirname, '../web/src/core/adversary/types.ts');
  const goapPath = path.resolve(__dirname, '../web/src/core/goap/types.ts');

  assert.ok(fs.existsSync(adversaryPath), 'web/src/core/adversary/types.ts must exist');
  assert.ok(fs.existsSync(goapPath), 'web/src/core/goap/types.ts must exist');

  const adversarySrc = fs.readFileSync(adversaryPath, 'utf8');
  assert.ok(adversarySrc.includes('export interface CognitiveBottleneck'), 'CognitiveBottleneck must be defined');
  assert.ok(adversarySrc.includes('export type BottleneckMutationStage'), 'BottleneckMutationStage must be defined');

  const goapSrc = fs.readFileSync(goapPath, 'utf8');
  assert.ok(goapSrc.includes('export interface LearnerWorldState'), 'LearnerWorldState must be defined');
  assert.ok(goapSrc.includes('export interface GoapAction'), 'GoapAction must be defined');
  assert.ok(goapSrc.includes('export interface GoapGoal'), 'GoapGoal must be defined');

  console.log('✓ Task 1: Type definitions verified successfully.');
}

function testTask2AdversaryRegistry() {
  console.log('\n[Task 2] Checking Cognitive Adversary Registry & Telemetry Ledger...');
  const registryPath = path.resolve(__dirname, '../web/src/core/adversary/adversary-registry.ts');
  assert.ok(fs.existsSync(registryPath), 'web/src/core/adversary/adversary-registry.ts must exist');

  global.localStorage.clear();
  const { AdversaryRegistry } = loadTsModule(registryPath);
  assert.ok(AdversaryRegistry, 'AdversaryRegistry class must be exported');

  // Test 1: Record initial lapse (passed: false)
  const b1 = AdversaryRegistry.recordEncounter({
    sourceModule: 'grammar',
    category: 'SYNTACTIC',
    academicTitle: 'Preposition Calque: discuss about',
    cefrLevel: 'B2',
    prompt: 'The board met to discuss about the budget.',
    userResponse: 'discuss about',
    expectedAnswer: 'discuss',
    passed: false,
    linguisticExplanation: 'Discuss takes a direct object without preposition about.',
    l1VietnameseTip: 'Tiếng Việt: "thảo luận về" dẫn tới thói quen thêm about.'
  });

  assert.strictEqual(b1.failCount, 1, 'failCount should be 1');
  assert.strictEqual(b1.passStreak, 0, 'passStreak should be 0');
  assert.strictEqual(b1.threatLevel, 1, 'Initial threatLevel should be 1');
  assert.strictEqual(b1.mutationStage, 'isolation', 'Initial mutation stage should be isolation');
  assert.strictEqual(b1.status, 'active', 'Status should be active');

  // Test 2: Second lapse on the same pattern escalates threat level
  const b2 = AdversaryRegistry.recordEncounter({
    sourceModule: 'ielts_writing',
    category: 'SYNTACTIC',
    academicTitle: 'Preposition Calque: discuss about',
    cefrLevel: 'B2',
    prompt: 'The board met to discuss about the budget.',
    userResponse: 'discuss about',
    expectedAnswer: 'discuss',
    passed: false,
    linguisticExplanation: 'Discuss takes a direct object without preposition about.'
  });

  assert.strictEqual(b2.failCount, 2, 'failCount should be 2');
  assert.strictEqual(b2.threatLevel, 2, 'threatLevel should escalate to 2');

  // Test 3: 3 consecutive passes advance mutationStage to 'permutation'
  for (let i = 0; i < 3; i++) {
    AdversaryRegistry.recordEncounter({
      sourceModule: 'serl_gauntlet',
      category: 'SYNTACTIC',
      academicTitle: 'Preposition Calque: discuss about',
      cefrLevel: 'B2',
      prompt: 'The board met to discuss about the budget.',
      userResponse: 'discuss',
      expectedAnswer: 'discuss',
      passed: true,
      linguisticExplanation: 'Discuss takes a direct object without preposition about.'
    });
  }

  const active = AdversaryRegistry.getActiveBottlenecks();
  assert.strictEqual(active.length, 1, 'Should have 1 active bottleneck');
  assert.strictEqual(active[0].mutationStage, 'permutation', 'Mutation stage should advance to permutation after 3 passes');

  // Test 4: Highest threat selection
  const highest = AdversaryRegistry.getHighestThreat();
  assert.ok(highest, 'Highest threat bottleneck should be returned');
  assert.strictEqual(highest.id, b1.id, 'Should match recorded bottleneck ID');

  console.log('✓ Task 2: AdversaryRegistry encounter recording & mutation progression verified.');
}

function testTask3MutationEngine() {
  console.log('\n[Task 3] Checking Mutation Engine for Contextual Permutations...');
  const mutationPath = path.resolve(__dirname, '../web/src/core/adversary/mutation-engine.ts');
  assert.ok(fs.existsSync(mutationPath), 'web/src/core/adversary/mutation-engine.ts must exist');

  const { MutationEngine } = loadTsModule(mutationPath);
  assert.ok(MutationEngine, 'MutationEngine class must be exported');

  const mockBottleneck = {
    id: 'btnk_test_1',
    category: 'SYNTACTIC',
    academicTitle: 'Preposition Calque: discuss [Ø]',
    cefrLevel: 'B2',
    threatLevel: 2,
    failCount: 2,
    passStreak: 0,
    mutationStage: 'isolation',
    traits: ['recognition_deficit'],
    status: 'active',
    history: [],
    basePrompt: 'The board met to discuss about the budget.',
    expectedAnswer: 'discuss',
    linguisticExplanation: 'Discuss takes direct object.',
    createdAt: Date.now()
  };

  // Test stage 1: isolation
  const c1 = MutationEngine.generateChallenge(mockBottleneck);
  assert.strictEqual(c1.stage, 'isolation');
  assert.strictEqual(c1.timeLimitSec, 15);
  assert.ok(c1.socraticContext.includes('2 slips'));

  // Test stage 2: permutation
  mockBottleneck.mutationStage = 'permutation';
  const c2 = MutationEngine.generateChallenge(mockBottleneck);
  assert.strictEqual(c2.stage, 'permutation');
  assert.strictEqual(c2.timeLimitSec, 20);

  // Test stage 3: cross_skill
  mockBottleneck.mutationStage = 'cross_skill';
  const c3 = MutationEngine.generateChallenge(mockBottleneck);
  assert.strictEqual(c3.stage, 'cross_skill');
  assert.strictEqual(c3.timeLimitSec, 10);

  console.log('✓ Task 3: MutationEngine challenge generation verified.');
}

function testTask4AmbushController() {
  console.log('\n[Task 4] Checking Ambush Controller & Interception Rules...');
  const ambushPath = path.resolve(__dirname, '../web/src/core/adversary/ambush-controller.ts');
  assert.ok(fs.existsSync(ambushPath), 'web/src/core/adversary/ambush-controller.ts must exist');

  const { AmbushController } = loadTsModule(ambushPath);
  assert.ok(AmbushController, 'AmbushController class must be exported');

  const registryPath = path.resolve(__dirname, '../web/src/core/adversary/adversary-registry.ts');
  const { AdversaryRegistry } = loadTsModule(registryPath);
  global.localStorage.clear();
  AdversaryRegistry.clearCache();

  // Test 1: No bottlenecks -> cannot intercept
  assert.strictEqual(AmbushController.canIntercept(), false, 'Should not intercept with no active bottlenecks');

  // Test 2: Add bottleneck with threatLevel 1 -> should not intercept (requires >= 2)
  AdversaryRegistry.recordEncounter({
    sourceModule: 'grammar',
    category: 'SYNTACTIC',
    academicTitle: 'Preposition Calque',
    cefrLevel: 'B2',
    prompt: 'discuss about policy',
    userResponse: 'discuss about',
    expectedAnswer: 'discuss',
    passed: false,
    linguisticExplanation: 'Discuss takes direct object.'
  });

  // Threat level is 1
  assert.strictEqual(AmbushController.canIntercept(), false, 'Should not intercept with threat level 1');

  // Second lapse makes threat level 2
  AdversaryRegistry.recordEncounter({
    sourceModule: 'writing',
    category: 'SYNTACTIC',
    academicTitle: 'Preposition Calque',
    cefrLevel: 'B2',
    prompt: 'discuss about policy',
    userResponse: 'discuss about',
    expectedAnswer: 'discuss',
    passed: false,
    linguisticExplanation: 'Discuss takes direct object.'
  });

  assert.strictEqual(AmbushController.canIntercept(), true, 'Should allow interception with threat level 2');

  // Test 3: After recording an interception, cooldown kicks in
  AmbushController.recordInterception();
  assert.strictEqual(AmbushController.canIntercept(), false, 'Should be throttled during cooldown');

  console.log('✓ Task 4: AmbushController cooldown & threat thresholds verified.');
}

function testTask5GoapPlanner() {
  console.log('\n[Task 5] Checking GOAP Pedagogical Planner (A* Search)...');
  const plannerPath = path.resolve(__dirname, '../web/src/core/goap/planner.ts');
  const actionsPath = path.resolve(__dirname, '../web/src/core/goap/action-bank.ts');
  const goalsPath = path.resolve(__dirname, '../web/src/core/goap/goal-arbiter.ts');

  assert.ok(fs.existsSync(plannerPath), 'web/src/core/goap/planner.ts must exist');
  assert.ok(fs.existsSync(actionsPath), 'web/src/core/goap/action-bank.ts must exist');
  assert.ok(fs.existsSync(goalsPath), 'web/src/core/goap/goal-arbiter.ts must exist');

  const { GoapPlanner } = loadTsModule(plannerPath);
  const { DEFAULT_GOAP_ACTIONS } = loadTsModule(actionsPath);
  const { GoalArbiter, GOAL_CLEAR_DEBT } = loadTsModule(goalsPath);

  assert.ok(GoapPlanner, 'GoapPlanner must be exported');
  assert.ok(DEFAULT_GOAP_ACTIONS.length > 0, 'Actions must be defined');

  // Test: Start state with cognitive debt (activeBottlenecks=2, srsDue=15, time=20)
  const startState = {
    timeBudgetMin: 20,
    hasAudioInput: true,
    hasAudioOutput: true,
    activeBottlenecksCount: 2,
    srsDueCount: 15,
    weakestSkill: 'listening',
    cognitiveEnergy: 'fresh',
    consecutiveErrors: 0,
    dailyQuestsPending: 3,
    isExamApproaching: false,
    retentionRatePct: 80
  };

  const selectedGoal = GoalArbiter.selectGoal(startState);
  assert.strictEqual(selectedGoal.id, GOAL_CLEAR_DEBT.id, 'Should prioritize Clear Debt goal when bottlenecks and SRS due exist');

  const startMs = Date.now();
  const plan = GoapPlanner.plan(startState, selectedGoal, DEFAULT_GOAP_ACTIONS);
  const durationMs = Date.now() - startMs;

  assert.ok(plan, 'A valid plan must be found');
  assert.ok(plan.actions.length >= 2, 'Plan should contain at least 2 actions to clear both debts');
  assert.ok(plan.totalDurationMin <= 20, 'Plan duration must not exceed time budget of 20m');
  assert.ok(durationMs < 20, `A* Planner should execute in < 20ms (took ${durationMs}ms)`);

  console.log(`✓ Task 5: GOAP A* Planner synthesized plan with ${plan.actions.length} actions in ${durationMs}ms.`);
}

function testTask6ProgressionIntegration() {
  console.log('\n[Task 6] Checking Progression Engine & IELTS Roadmap Integration...');

  // 1. Check IELTS Roadmap is dynamic
  const pathViewFile = path.resolve(__dirname, '../web/src/ielts/views/path.ts');
  const pathViewSrc = fs.readFileSync(pathViewFile, 'utf8');
  assert.ok(
    pathViewSrc.includes('const targetWeakest = weakestSkill(placement);'),
    'IELTS path view must compute targetWeakest dynamically using weakestSkill(placement)'
  );
  assert.ok(
    !pathViewSrc.includes('extendedRoadmap(weeks, FOCUS, done)'),
    'IELTS path view must NOT hardcode FOCUS in extendedRoadmap'
  );

  // 2. Check Progression Engine uses dynamic GOAP quest generation
  const progressionFile = path.resolve(__dirname, '../web/src/core/progression-engine.ts');
  const progressionSrc = fs.readFileSync(progressionFile, 'utf8');
  assert.ok(
    progressionSrc.includes('generateDynamicQuests()'),
    'ProgressionEngine must call generateDynamicQuests()'
  );

  console.log('✓ Task 6: IELTS Roadmap dynamic weakest skill & GOAP dynamic quest generation verified.');
}

testTask1Types();
testTask2AdversaryRegistry();
testTask3MutationEngine();
testTask4AmbushController();
testTask5GoapPlanner();
testTask6ProgressionIntegration();
console.log('\n=== All verified tests passed! ===');
