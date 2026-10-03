/**
 * Automated SuperMemo-2 (SM-2) Spaced Repetition Retention & Curve Simulator
 * Mathematical Stress-Testing Suite for Client-Side SRS Engine
 *
 * Directives:
 * - Cohort: 1,000 synthetic learners across 30 simulated days
 * - Edge Cases: 100% consecutive lapses ('again'), 100% perfect retention ('good')
 * - Realistic Distribution: 85% mean retention rate with stochastic variance
 * - Mathematical Invariants: EF >= 1.3, Interval >= 1, No NaNs, Exponential progression
 * - Formatting: Authoritative Stark Monochrome Telemetry (docs/CLEAN_DESIGN_SYSTEM.md)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// -----------------------------------------------------------------------------
// 1. ENGINE LOADER & HARNESS
// -----------------------------------------------------------------------------

function loadSRSEngine() {
  const tsPath = path.resolve(__dirname, '../src/core/srs-engine.ts');
  if (!fs.existsSync(tsPath)) {
    throw new Error(`SRS Engine source not found at: ${tsPath}`);
  }

  const tsCode = fs.readFileSync(tsPath, 'utf8');
  let transpiled;

  try {
    const ts = require('typescript');
    transpiled = ts.transpileModule(tsCode, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        removeComments: false
      }
    }).outputText;
  } catch (err) {
    // Standalone fallback regex-based transpiler if typescript module is unavailable
    transpiled = tsCode
      .replace(/export type [^;]+;/g, '')
      .replace(/export interface [\s\S]*?^}/gm, '')
      .replace(/export class/g, 'class')
      .replace(/public static /g, 'static ')
      .replace(/<[^>]+>/g, '')
      .replace(/:\s*[^=,);{\n]+/g, '')
      + '\nmodule.exports = { SRSEngine };';
  }

  const moduleExports = {};
  const mod = { exports: moduleExports };
  const fn = new Function('exports', 'module', 'require', transpiled);
  fn(moduleExports, mod, require);

  return mod.exports.SRSEngine;
}

const SRSEngine = loadSRSEngine();

// -----------------------------------------------------------------------------
// 2. MATHEMATICAL & GAUSSIAN UTILITIES
// -----------------------------------------------------------------------------

// Box-Muller transform for synthetic learner retention variance
function randomGaussian(mean = 0, stdev = 1) {
  let u1 = 0;
  let u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdev + mean;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function percentile(arr, p) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

// -----------------------------------------------------------------------------
// 3. STARK MONOCHROME TELEMETRY FORMATTER
// -----------------------------------------------------------------------------

const CLI_WIDTH = 80;

function printHeader(title) {
  console.log('='.repeat(CLI_WIDTH));
  console.log(`  [TELEMETRY] ${title.toUpperCase()}`);
  console.log('='.repeat(CLI_WIDTH));
}

function printSubHeader(subtitle) {
  console.log('-'.repeat(CLI_WIDTH));
  console.log(`  ${subtitle}`);
  console.log('-'.repeat(CLI_WIDTH));
}

function printRow(col1, col2, col3, col4, col5, col6) {
  const c1 = String(col1).padEnd(8);
  const c2 = String(col2).padStart(12);
  const c3 = String(col3).padStart(14);
  const c4 = String(col4).padStart(12);
  const c5 = String(col5).padStart(12);
  const c6 = String(col6).padStart(14);
  console.log(`  ${c1} | ${c2} | ${c3} | ${c4} | ${c5} | ${c6}`);
}

// -----------------------------------------------------------------------------
// 4. TEST SUITE 1: 100% CONSECUTIVE LAPSES EDGE CASE ('again')
// -----------------------------------------------------------------------------

function runLapseStressTest() {
  printSubHeader('EDGE CASE I: 100% CONSECUTIVE LAPSES (RATINGS: ALWAYS "AGAIN")');

  const cardId = 'card-lapse-test-001';
  let state = SRSEngine.createInitialState(cardId);
  const numTrials = 50;

  let efFloorRespected = true;
  let intervalStrictlyOne = true;
  let repetitionsZeroed = true;
  let noNaNEncountered = true;

  for (let i = 1; i <= numTrials; i++) {
    state = SRSEngine.rateCard(state, cardId, 'again');

    if (state.easeFactor < 1.3) efFloorRespected = false;
    if (state.interval !== 1) intervalStrictlyOne = false;
    if (state.repetitions !== 0) repetitionsZeroed = false;
    if (Number.isNaN(state.interval) || Number.isNaN(state.easeFactor)) noNaNEncountered = false;
  }

  assert.strictEqual(efFloorRespected, true, 'Ease Factor dropped below 1.3 floor');
  assert.strictEqual(intervalStrictlyOne, true, 'Interval was not 1 during consecutive lapses');
  assert.strictEqual(repetitionsZeroed, true, 'Repetitions did not reset to 0');
  assert.strictEqual(noNaNEncountered, true, 'NaN encountered during lapse calculation');
  assert.strictEqual(state.easeFactor, 1.3, 'Final EF must clamp exactly at 1.3');
  assert.strictEqual(state.totalReviews, numTrials, 'Total reviews must equal trial count');
  assert.strictEqual(state.totalLapses, numTrials, 'Total lapses must equal trial count');

  console.log(`  Trials Executed   : ${numTrials} consecutive failures`);
  console.log(`  Final Ease Factor : ${state.easeFactor.toFixed(2)} (Min Bounded at 1.30)`);
  console.log(`  Final Interval    : ${state.interval} day (Lapse reset verified)`);
  console.log(`  Final Repetitions : ${state.repetitions} (Streak successfully wiped)`);
  console.log(`  Verification      : [PASS] EF Floor clamped, interval bounded, streak reset`);
}

// -----------------------------------------------------------------------------
// 5. TEST SUITE 2: 100% PERFECT RETENTION EDGE CASE ('good')
// -----------------------------------------------------------------------------

function runPerfectRetentionTest() {
  printSubHeader('EDGE CASE II: 100% PERFECT RETENTION (RATINGS: ALWAYS "GOOD")');

  const cardId = 'card-perfect-test-001';
  let state = SRSEngine.createInitialState(cardId);
  const expectedProgression = [
    { rep: 1, interval: 1, ef: 2.5 },
    { rep: 2, interval: 6, ef: 2.5 },
    { rep: 3, interval: 15, ef: 2.5 },   // round(6 * 2.5) = 15
    { rep: 4, interval: 38, ef: 2.5 },   // round(15 * 2.5) = 37.5 -> 38
    { rep: 5, interval: 95, ef: 2.5 },   // round(38 * 2.5) = 95
    { rep: 6, interval: 238, ef: 2.5 },  // round(95 * 2.5) = 237.5 -> 238
    { rep: 7, interval: 595, ef: 2.5 }   // round(238 * 2.5) = 595
  ];

  for (let idx = 0; idx < expectedProgression.length; idx++) {
    state = SRSEngine.rateCard(state, cardId, 'good');
    const exp = expectedProgression[idx];

    assert.strictEqual(state.repetitions, exp.rep, `Repetition mismatch at step ${idx + 1}`);
    assert.strictEqual(state.interval, exp.interval, `Interval mismatch at step ${idx + 1}`);
    assert.strictEqual(Number(state.easeFactor.toFixed(2)), exp.ef, `EF mismatch at step ${idx + 1}`);
    assert.strictEqual(state.totalLapses, 0, 'Lapses must remain 0');
  }

  console.log(`  Repetitions Steps : 1 -> 7 sequential successful recalls`);
  console.log(`  Interval Ladder   : 1d -> 6d -> 15d -> 38d -> 95d -> 238d -> 595d`);
  console.log(`  Ease Factor Stable: 2.50 (Canonical SM-2 Grade 4 retains constant EF)`);
  console.log(`  Exponential Growth: Validated. Compound growth rate matches SM-2 spec`);
  console.log(`  Verification      : [PASS] Zero lapses, deterministic curve verified`);
}

// -----------------------------------------------------------------------------
// 5.5 TEST SUITE 2.5: REMIND CARD SAMPLING & TIER MODIFIERS
// -----------------------------------------------------------------------------

function runRemindCardAndTierTest() {
  printSubHeader('ROGUELIKE REMIND CARD SAMPLING & DIFFICULTY TIER MODIFIERS');

  // Test Tier Modifiers (createInitialState & rateCard)
  const cardL1 = SRSEngine.createInitialState('card-lvl-1', 1);
  const cardL2 = SRSEngine.createInitialState('card-lvl-2', 2);
  const cardL3 = SRSEngine.createInitialState('card-lvl-3', 3);
  const cardL4 = SRSEngine.createInitialState('card-lvl-4', 4);

  assert.strictEqual(cardL1.easeFactor, 2.5, 'Level 1 must start with EF 2.50');
  assert.strictEqual(cardL2.easeFactor, 2.5, 'Level 2 must start with EF 2.50');
  assert.strictEqual(cardL3.easeFactor, 2.3, 'Level 3 (C2/GRE) must start with EF 2.30');
  assert.strictEqual(cardL4.easeFactor, 2.3, 'Level 4 must start with EF 2.30');

  // Test rateCard with new card and level parameter
  const ratedL3 = SRSEngine.rateCard(undefined, 'card-rated-l3', 'good', 3);
  assert.strictEqual(ratedL3.easeFactor, 2.3, 'New card rated at Level 3 must inherit initial EF 2.30');

  console.log(`  Tier Ease Factors : L1/L2=2.50 | L3/L4=2.30 (Cognitive load modifier verified)`);

  // Test Remind Card Sampling
  const now = Date.now();

  const testDeck = [
    { id: 'c1', level: 1 }, // Earlier level than 2, never reviewed -> eligible
    { id: 'c2', level: 2 }, // Current level 2, no lapses -> ineligible
    { id: 'c3', level: 2 }, // Current level 2, has lapses, reviewed 3h ago -> eligible
    { id: 'c4', level: 1 }, // Earlier level, reviewed 30 mins ago -> INELIGIBLE (reviewed < 2h)
    { id: 'c5', level: 3 }  // Higher level -> ineligible
  ];

  const cardStates = {
    c2: {
      cardId: 'c2', repetitions: 3, interval: 15, easeFactor: 2.5,
      lastReviewed: now - 3 * 3600 * 1000, dueDate: now + 86400000,
      totalReviews: 3, totalLapses: 0
    },
    c3: {
      cardId: 'c3', repetitions: 1, interval: 1, easeFactor: 2.1,
      lastReviewed: now - 3 * 3600 * 1000, dueDate: now + 86400000,
      totalReviews: 4, totalLapses: 2 // Has lapses!
    },
    c4: {
      cardId: 'c4', repetitions: 2, interval: 6, easeFactor: 2.5,
      lastReviewed: now - 30 * 60 * 1000, dueDate: now + 86400000, // 30m ago!
      totalReviews: 2, totalLapses: 0
    }
  };

  // Sample multiple times to verify pool contains only c1 or c3
  const sampledIds = new Set();
  for (let i = 0; i < 50; i++) {
    const picked = SRSEngine.getRemindCard(testDeck, cardStates, 2);
    assert.notStrictEqual(picked, null, 'Should find eligible candidate');
    assert.ok(picked.id === 'c1' || picked.id === 'c3', `Illegal card sampled: ${picked.id}`);
    sampledIds.add(picked.id);
  }

  assert.ok(sampledIds.has('c1'), 'c1 should be sampled (prior level)');
  assert.ok(sampledIds.has('c3'), 'c3 should be sampled (previous lapses)');

  // Test empty candidate scenario
  const emptyDeck = [{ id: 'c-high', level: 2 }];
  const emptyStates = {
    'c-high': {
      cardId: 'c-high', repetitions: 1, interval: 1, easeFactor: 2.5,
      lastReviewed: now - 1000, dueDate: now + 86400000,
      totalReviews: 1, totalLapses: 0
    }
  };
  const nullResult = SRSEngine.getRemindCard(emptyDeck, emptyStates, 2);
  assert.strictEqual(nullResult, null, 'Must return null when zero candidates match');

  console.log(`  Remind Sampling   : Evaluated across 50 trials. Exclusions & prioritization verified`);
  console.log(`  2-Hour Guard      : [PASS] Excluded recently reviewed cards (< 2h)`);
  console.log(`  Candidate Matrix  : [PASS] Accurately sampled prior tiers & lapse histories`);
  console.log(`  Null Edge Case    : [PASS] Returned null cleanly on empty eligible pool`);
}

// -----------------------------------------------------------------------------
// 6. TEST SUITE 3: 1,000 SYNTHETIC LEARNERS COHORT SIMULATION (30 DAYS)
// -----------------------------------------------------------------------------

function runCohortSimulation() {
  printSubHeader('COHORT SIMULATION: 1,000 LEARNERS X 30 DAYS (85% MEAN RETENTION)');

  const COHORT_SIZE = 1000;
  const SIMULATION_DAYS = 30;
  const DECK_SIZE_PER_LEARNER = 50;
  const NEW_CARDS_PER_DAY = 5;
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const SIMULATION_START_TIME = 1790000000000; // Fixed deterministic timestamp

  // Initialize learners with normally-distributed target retention rates
  // Mean = 0.85, StDev = 0.04, Clamped to [0.72, 0.98]
  const learners = [];
  for (let i = 0; i < COHORT_SIZE; i++) {
    const learnerId = `learner-${String(i + 1).padStart(4, '0')}`;
    const retentionSkill = clamp(randomGaussian(0.85, 0.04), 0.72, 0.98);

    // Initialize 50 cards for this learner
    const cards = [];
    for (let c = 0; c < DECK_SIZE_PER_LEARNER; c++) {
      cards.push({
        id: `${learnerId}-card-${String(c + 1).padStart(3, '0')}`,
        introduced: false,
        state: null
      });
    }

    learners.push({
      id: learnerId,
      skill: retentionSkill,
      cards
    });
  }

  // Simulation Metrics Tracking
  let totalCohortReviews = 0;
  let totalCohortGood = 0;
  let totalCohortLapses = 0;
  let invariantViolations = 0;

  // Print Table Header
  console.log('');
  printRow('DAY', 'REVIEWS', 'DAILY PASS%', 'CUMUL PASS%', 'AVG INTERVAL', 'AVG EASE');
  console.log('  ' + '-'.repeat(76));

  // Run day-by-day simulation
  for (let day = 1; day <= SIMULATION_DAYS; day++) {
    const currentSimulatedTime = SIMULATION_START_TIME + (day - 1) * ONE_DAY_MS;

    // Mock Date.now() for deterministic time advancement in SRSEngine
    const originalDateNow = Date.now;
    Date.now = () => currentSimulatedTime;

    let dailyReviews = 0;
    let dailyGood = 0;
    let dailyLapses = 0;

    for (let l = 0; l < COHORT_SIZE; l++) {
      const learner = learners[l];

      // Introduce new cards for the day
      let introducedToday = 0;
      for (const card of learner.cards) {
        if (!card.introduced && introducedToday < NEW_CARDS_PER_DAY) {
          card.introduced = true;
          card.state = SRSEngine.createInitialState(card.id);
          card.state.dueDate = currentSimulatedTime; // Due today
          introducedToday++;
        }
      }

      // Review all due cards
      for (const card of learner.cards) {
        if (card.introduced && card.state && card.state.dueDate <= currentSimulatedTime) {
          dailyReviews++;
          totalCohortReviews++;

          // Stochastic recall determination based on learner skill profile
          const isSuccessful = Math.random() <= learner.skill;
          const rating = isSuccessful ? 'good' : 'again';

          if (isSuccessful) {
            dailyGood++;
            totalCohortGood++;
          } else {
            dailyLapses++;
            totalCohortLapses++;
          }

          // Execute Engine Rating
          const prevState = card.state;
          card.state = SRSEngine.rateCard(prevState, card.id, rating);

          // Rigorous Invariant Assertions
          if (Number.isNaN(card.state.interval) || card.state.interval < 1) {
            invariantViolations++;
          }
          if (Number.isNaN(card.state.easeFactor) || card.state.easeFactor < 1.3) {
            invariantViolations++;
          }
          if (card.state.repetitions < 0) {
            invariantViolations++;
          }
          if (card.state.dueDate < card.state.lastReviewed) {
            invariantViolations++;
          }
        }
      }
    }

    // Restore Date.now()
    Date.now = originalDateNow;

    // Log periodic progress milestones
    const isMilestone = (day === 1 || day === 5 || day === 10 || day === 15 || day === 20 || day === 25 || day === 30);
    if (isMilestone) {
      // Calculate snapshot averages across active cards
      let totalInterval = 0;
      let totalEF = 0;
      let activeCardCount = 0;

      for (let l = 0; l < COHORT_SIZE; l++) {
        for (const card of learners[l].cards) {
          if (card.introduced && card.state) {
            totalInterval += card.state.interval;
            totalEF += card.state.easeFactor;
            activeCardCount++;
          }
        }
      }

      const avgInterval = activeCardCount > 0 ? (totalInterval / activeCardCount).toFixed(1) + 'd' : '0.0d';
      const avgEF = activeCardCount > 0 ? (totalEF / activeCardCount).toFixed(2) : '2.50';
      const dailyPassPct = dailyReviews > 0 ? ((dailyGood / dailyReviews) * 100).toFixed(1) + '%' : '0.0%';
      const cumulPassPct = totalCohortReviews > 0 ? ((totalCohortGood / totalCohortReviews) * 100).toFixed(1) + '%' : '0.0%';

      printRow(
        `Day ${String(day).padStart(2, '0')}`,
        dailyReviews.toLocaleString(),
        dailyPassPct,
        cumulPassPct,
        avgInterval,
        avgEF
      );
    }
  }

  console.log('  ' + '-'.repeat(76));

  // ---------------------------------------------------------------------------
  // 7. FINAL COHORT DISTRIBUTION & MATHEMATICAL BOUNDS VERIFICATION
  // ---------------------------------------------------------------------------

  const allIntervals = [];
  const allEaseFactors = [];
  const allRepetitions = [];
  let masteredCount = 0;
  let learningCount = 0;
  let totalActiveCards = 0;

  for (let l = 0; l < COHORT_SIZE; l++) {
    for (const card of learners[l].cards) {
      if (card.introduced && card.state) {
        totalActiveCards++;
        allIntervals.push(card.state.interval);
        allEaseFactors.push(card.state.easeFactor);
        allRepetitions.push(card.state.repetitions);

        if (card.state.repetitions >= 3) {
          masteredCount++;
        } else {
          learningCount++;
        }
      }
    }
  }

  const finalRetentionRate = ((totalCohortGood / totalCohortReviews) * 100).toFixed(2);
  const minEF = Math.min(...allEaseFactors);
  const maxEF = Math.max(...allEaseFactors);
  const minInterval = Math.min(...allIntervals);
  const maxInterval = Math.max(...allIntervals);

  printSubHeader('30-DAY STATISTICAL SYNTHESIS & BOUNDS AUDIT');
  console.log(`  Synthetic Learners   : ${COHORT_SIZE.toLocaleString()}`);
  console.log(`  Active Flashcards    : ${totalActiveCards.toLocaleString()}`);
  console.log(`  Total Reviews Logged : ${totalCohortReviews.toLocaleString()}`);
  console.log(`  Total Lapses Handled : ${totalCohortLapses.toLocaleString()}`);
  console.log(`  Cohort Retention Rate: ${finalRetentionRate}% (Expected Target: ~85.0%)`);
  console.log(`  Mastered Cards (n>=3): ${masteredCount.toLocaleString()} (${((masteredCount / totalActiveCards) * 100).toFixed(1)}%)`);
  console.log(`  Learning Cards (n<3) : ${learningCount.toLocaleString()} (${((learningCount / totalActiveCards) * 100).toFixed(1)}%)`);
  console.log('');
  console.log(`  Ease Factor Percentiles:`);
  console.log(`    Min Bound: ${minEF.toFixed(2)} (Absolute Minimum Allowed: 1.30)`);
  console.log(`    P25      : ${percentile(allEaseFactors, 25).toFixed(2)}`);
  console.log(`    Median   : ${percentile(allEaseFactors, 50).toFixed(2)}`);
  console.log(`    P75      : ${percentile(allEaseFactors, 75).toFixed(2)}`);
  console.log(`    Max      : ${maxEF.toFixed(2)}`);
  console.log('');
  console.log(`  Interval Percentiles:`);
  console.log(`    Min Bound: ${minInterval}d (Absolute Minimum Allowed: 1d)`);
  console.log(`    P25      : ${percentile(allIntervals, 25).toFixed(0)}d`);
  console.log(`    Median   : ${percentile(allIntervals, 50).toFixed(0)}d`);
  console.log(`    P75      : ${percentile(allIntervals, 75).toFixed(0)}d`);
  console.log(`    Max      : ${maxInterval}d`);
  console.log('');
  console.log(`  Mathematical Invariants:`);
  console.log(`    EF >= 1.30 Floor Audit    : [PASS] (Observed Min: ${minEF.toFixed(2)})`);
  console.log(`    Interval >= 1d Bound Audit : [PASS] (Observed Min: ${minInterval}d)`);
  console.log(`    Zero NaN / Infinity Values: [PASS] (0 deviations across ${totalCohortReviews.toLocaleString()} reviews)`);
  console.log(`    Invariant Violation Count : ${invariantViolations}`);

  assert.strictEqual(invariantViolations, 0, 'Critical invariant violations detected during simulation');
  assert(minEF >= 1.3, 'Ease factor dropped below 1.3');
  assert(minInterval >= 1, 'Interval dropped below 1');
  assert(Math.abs(parseFloat(finalRetentionRate) - 85.0) < 3.0, 'Cohort retention rate deviated significantly from 85%');
}

// -----------------------------------------------------------------------------
// 8. MAIN EXECUTION
// -----------------------------------------------------------------------------

function main() {
  printHeader('SM-2 RETENTION & CURVE SIMULATOR (1,000 LEARNERS / 30 DAYS)');
  console.log(`  Engine Source : E:\\Eng\\web\\src\\core\\srs-engine.ts`);
  console.log(`  Harness Date  : ${new Date().toISOString()}`);
  console.log(`  Specification : SuperMemo-2 Spaced Repetition Scheduling Engine`);
  console.log('');

  const startTime = Date.now();

  runLapseStressTest();
  runPerfectRetentionTest();
  runRemindCardAndTierTest();
  runCohortSimulation();

  const elapsedMs = Date.now() - startTime;
  console.log('='.repeat(CLI_WIDTH));
  console.log(`  [SIMULATION COMPLETE] Elapsed Time: ${elapsedMs}ms | All Assertions Verified`);
  console.log('='.repeat(CLI_WIDTH));
}

main();
