// Verification script for SM-2 logic
const assert = require('assert');

function rateCard(state, rating) {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const MIN_EASE_FACTOR = 1.3;
  const DEFAULT_EASE_FACTOR = 2.5;

  let s = state ? { ...state } : {
    repetitions: 0,
    interval: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    totalReviews: 0,
    totalLapses: 0
  };

  s.totalReviews += 1;

  if (rating === 'again') {
    s.repetitions = 0;
    s.interval = 1;
    s.totalLapses += 1;
    s.easeFactor = Math.max(MIN_EASE_FACTOR, Number((s.easeFactor - 0.2).toFixed(2)));
  } else {
    if (s.repetitions === 0) {
      s.interval = 1;
    } else if (s.repetitions === 1) {
      s.interval = 6;
    } else {
      s.interval = Math.round(s.interval * s.easeFactor);
    }
    s.repetitions += 1;
    s.easeFactor = Number((s.easeFactor + 0.1).toFixed(2));
  }
  return s;
}

console.log('[TEST] Running SM-2 engine test sequence...');

// Step 1: Initial review - Good
let card = rateCard(null, 'good');
console.log('Pass 1 (good):', card);
assert.strictEqual(card.repetitions, 1);
assert.strictEqual(card.interval, 1);
assert.strictEqual(card.easeFactor, 2.6);

// Step 2: Second review - Good
card = rateCard(card, 'good');
console.log('Pass 2 (good):', card);
assert.strictEqual(card.repetitions, 2);
assert.strictEqual(card.interval, 6);
assert.strictEqual(card.easeFactor, 2.7);

// Step 3: Third review - Good
card = rateCard(card, 'good');
console.log('Pass 3 (good):', card);
assert.strictEqual(card.repetitions, 3);
// 6 * 2.7 = 16.2 -> 16
assert.strictEqual(card.interval, 16);
assert.strictEqual(card.easeFactor, 2.8);

// Step 4: Lapse - Again
card = rateCard(card, 'again');
console.log('Pass 4 (again):', card);
assert.strictEqual(card.repetitions, 0);
assert.strictEqual(card.interval, 1);
assert.strictEqual(card.easeFactor, 2.6);
assert.strictEqual(card.totalLapses, 1);

console.log('[TEST] SM-2 mathematical verification PASSED!');
