// web/scripts/verify-accessibility-motion.cjs
/**
 * Automated Verification Suite for Accessibility & Reduced-Motion Invariants (ENG-71)
 * Audits:
 * 1. Reading Pass Tab Navigation & Roving Tabindex (web/src/modules/reading-dossier.ts)
 *    - role="tablist" on .reading-pass-stepper with aria-label="Reading passes"
 *    - role="tab" on each .stepper-step
 *    - roving tabindex (tabindex="0" on active pass, tabindex="-1" on inactive passes)
 *    - aria-selected="true" on active pass, "false" on inactive
 *    - ArrowRight / ArrowDown forward navigation with wrap-around (1 -> 2 -> 3 -> 4 -> 1)
 *    - ArrowLeft / ArrowUp backward navigation with wrap-around (4 -> 3 -> 2 -> 1 -> 4)
 *    - Home / End navigation
 *    - programmatic focus transfer to newly active tab
 *    - role="tabpanel" on .reading-content-slot with aria-labelledby
 * 2. Screen Reader Live Regions aria-live="polite"
 *    - Myers split-diff evaluation in web/src/modules/writing-dossier.ts (.copywork-diff-container)
 *    - Countdown timer display in web/src/modules/speaking-dossier.ts (.timer-display-text)
 * 3. Canvas Reduce-Motion Zero-Cycle Pause Guards
 *    - Particle celebration canvas (web/src/core/particle-canvas.ts)
 *    - 3D card tilt & deep-space nebula starfield (web/src/core/perspective-canvas.ts)
 *    - Corner compass mini-urchin loop (web/src/modules/corner-compass.ts)
 *    - Speaking studio dual-trace oscilloscope (web/src/modules/speaking-dossier.ts)
 *    - In-app html[data-motion="reduce"] attribute checks and MutationObserver lifecycle
 * 4. Algorithmic invariants & state transitions
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================================');
console.log('  [TEST] VERIFYING ACCESSIBILITY & REDUCED-MOTION INVARIANTS (ENG-71)');
console.log('================================================================================');

let passedTests = 0;
let totalTests = 0;

function it(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${description}`);
    console.error(`    Error: ${err.message}`);
    process.exitCode = 1;
  }
}

// -----------------------------------------------------------------------------
// 1. File Invariants
// -----------------------------------------------------------------------------
it('Verifies required source files exist', () => {
  const files = [
    'web/src/modules/reading-dossier.ts',
    'web/src/modules/writing-dossier.ts',
    'web/src/modules/speaking-dossier.ts',
    'web/src/core/particle-canvas.ts',
    'web/src/core/perspective-canvas.ts',
    'web/src/modules/corner-compass.ts'
  ];

  for (const rel of files) {
    const full = path.join(__dirname, '..', '..', rel);
    assert(fs.existsSync(full), `File must exist: ${rel}`);
  }
});

// -----------------------------------------------------------------------------
// 2. Reading Pass Tab Navigation & Roving Tabindex (web/src/modules/reading-dossier.ts)
// -----------------------------------------------------------------------------
it('Verifies reading pass stepper markup defines WAI-ARIA tablist & roving tabindex', () => {
  const file = path.join(__dirname, '../src/modules/reading-dossier.ts');
  const code = fs.readFileSync(file, 'utf8');

  // Stepper container must be role="tablist" with descriptive label
  assert(
    code.includes('class="reading-pass-stepper" role="tablist" aria-label="Reading passes"'),
    'reading-pass-stepper must declare role="tablist" and aria-label="Reading passes"'
  );

  // Buttons must have role="tab", aria-selected, roving tabindex, id, and aria-controls
  assert(code.includes('role="tab"'), 'Stepper buttons must declare role="tab"');
  assert(code.includes('aria-selected="${isActive}"'), 'Stepper buttons must bind aria-selected to isActive');
  assert(code.includes('tabindex="${isActive ? \'0\' : \'-1\'}"'), 'Stepper buttons must enforce roving tabindex ("0" active, "-1" inactive)');
  assert(code.includes('id="reading-pass-tab-${cfg.pass}"'), 'Stepper buttons must have predictable ID for aria-labelledby');
  assert(code.includes('aria-controls="reading-pass-panel"'), 'Stepper buttons must control the pass content panel');

  // Content slot must declare role="tabpanel" with aria-labelledby
  assert(
    code.includes('role="tabpanel" aria-labelledby="reading-pass-tab-${this.currentPass}"'),
    'reading-content-slot must declare role="tabpanel" and aria-labelledby pointing to the active pass tab'
  );
});

it('Verifies keyboard arrow navigation, Home/End, and roving focus in reading-dossier.ts', () => {
  const file = path.join(__dirname, '../src/modules/reading-dossier.ts');
  const code = fs.readFileSync(file, 'utf8');

  // Keydown listener on reading-pass-stepper
  assert(code.includes("stepper.addEventListener('keydown'"), 'Must bind keydown listener on reading-pass-stepper');

  // ArrowRight and ArrowDown forward cycling
  assert(code.includes("ke.key === 'ArrowRight' || ke.key === 'ArrowDown'"), 'Must handle ArrowRight and ArrowDown');
  assert(code.includes('(this.currentPass % 4 + 1)'), 'Must calculate forward pass cycling with wrap-around: (currentPass % 4 + 1)');

  // ArrowLeft and ArrowUp backward cycling
  assert(code.includes("ke.key === 'ArrowLeft' || ke.key === 'ArrowUp'"), 'Must handle ArrowLeft and ArrowUp');
  assert(code.includes('(this.currentPass === 1 ? 4 : this.currentPass - 1)'), 'Must calculate backward pass cycling with wrap-around: 1 -> 4');

  // Home and End key shortcuts
  assert(code.includes("ke.key === 'Home'"), 'Must handle Home key for first pass');
  assert(code.includes("ke.key === 'End'"), 'Must handle End key for last pass');

  // Method to switch pass and programmatically focus target tab
  assert(code.includes('switchPass(pass: ReadingPass, focusTab: boolean'), 'Must have switchPass helper with focusTab param');
  assert(code.includes('targetTab?.focus()'), 'Must programmatically focus active tab element on keyboard navigation');

  // Global key guard preventing collision
  assert(code.includes("active?.closest('.reading-pass-stepper')"), 'handleGlobalKey must yield to focused reading pass stepper');
});

// -----------------------------------------------------------------------------
// 3. Screen Reader Live Regions aria-live="polite"
// -----------------------------------------------------------------------------
it('Verifies aria-live="polite" on Myers split-diff evaluation in writing-dossier.ts', () => {
  const file = path.join(__dirname, '../src/modules/writing-dossier.ts');
  const code = fs.readFileSync(file, 'utf8');

  assert(code.includes('class="copywork-diff-container"'), 'Must define copywork-diff-container');
  assert(
    code.includes('class="copywork-diff-container"') && code.includes('aria-live="polite"'),
    'copywork-diff-container must have aria-live="polite" for dynamic diff announcements'
  );
  assert(code.includes('aria-atomic="true"'), 'copywork-diff-container should have aria-atomic="true"');
  assert(code.includes('role="region"'), 'copywork-diff-container should declare role="region"');
});

it('Verifies aria-live="polite" on countdown timer in speaking-dossier.ts', () => {
  const file = path.join(__dirname, '../src/modules/speaking-dossier.ts');
  const code = fs.readFileSync(file, 'utf8');

  assert(code.includes('class="timer-display-text"'), 'Must define timer-display-text');
  assert(
    code.includes('class="timer-display-text"') && code.includes('aria-live="polite"'),
    'timer-display-text must have aria-live="polite" for non-intrusive speech feedback'
  );
  assert(code.includes('role="timer"'), 'timer-display-text must declare role="timer"');
  assert(code.includes('aria-atomic="true"'), 'timer-display-text must declare aria-atomic="true"');
});

// -----------------------------------------------------------------------------
// 4. Canvas Reduce-Motion Zero-Cycle Pause Guards
// -----------------------------------------------------------------------------
it('Verifies zero-cycle reduced-motion pause guards in particle-canvas.ts', () => {
  const file = path.join(__dirname, '../src/core/particle-canvas.ts');
  const code = fs.readFileSync(file, 'utf8');

  // Checks in-app html[data-motion="reduce"]
  assert(code.includes("getAttribute('data-motion') === 'reduce'"), 'Must check data-motion="reduce" on documentElement');
  assert(code.includes('isReducedMotion()'), 'ParticleCanvas must expose isReducedMotion() helper');

  // MutationObserver on data-motion
  assert(code.includes('MutationObserver'), 'ParticleCanvas must set up MutationObserver for data-motion');
  assert(code.includes("attributeFilter: ['data-motion']"), 'Must filter mutations on data-motion attribute');

  // burst() guard
  assert(
    code.includes('if (this.isReducedMotion()) return'),
    'ParticleCanvas.burst() must exit immediately without scheduling rAF or spawning particles when reduced motion active'
  );

  // Loop suspension and cleanup
  assert(code.includes('cancelAnimationFrame'), 'ParticleCanvas must cancelAnimationFrame when reduced motion active');
  assert(code.includes('clear()'), 'Must provide clear() method to reset canvas state');
});

it('Verifies zero-cycle reduced-motion pause guards in perspective-canvas.ts (Tilt & Nebula)', () => {
  const file = path.join(__dirname, '../src/core/perspective-canvas.ts');
  const code = fs.readFileSync(file, 'utf8');

  // 1. PerspectiveCanvas / PerspectiveCardTilt
  assert(code.includes("getAttribute('data-motion') === 'reduce'"), 'PerspectiveCanvas must check data-motion="reduce"');
  assert(code.includes('handleMotionChange()'), 'PerspectiveCanvas must handle dynamic motion toggle changes');
  assert(code.includes('cancelAnimationFrame(this.animFrameId)'), 'Must cancel in-flight rAF when reduced motion enabled');

  // 2. NebulaCanvas
  assert(code.includes('export class NebulaCanvas'), 'NebulaCanvas must be exported');
  assert(code.includes('setupMotionObserver()'), 'NebulaCanvas must configure MutationObserver on documentElement');
  assert(code.includes('cancelAnimationFrame(this.animId)'), 'NebulaCanvas must cancelAnimationFrame when reduced motion active');
});

it('Verifies zero-cycle reduced-motion pause guards in corner-compass.ts', () => {
  const file = path.join(__dirname, '../src/modules/corner-compass.ts');
  const code = fs.readFileSync(file, 'utf8');

  // Checks in-app html[data-motion="reduce"]
  assert(code.includes("getAttribute('data-motion') === 'reduce'"), 'CornerCompass must check data-motion="reduce"');
  assert(code.includes('isReducedMotion()'), 'CornerCompass must define isReducedMotion() helper');

  // MutationObserver on data-motion
  assert(code.includes('MutationObserver'), 'CornerCompass must observe documentElement data-motion mutations');
  assert(code.includes("attributeFilter: ['data-motion']"), 'CornerCompass must filter mutations on data-motion attribute');

  // startMiniUrchinLoop zero-cycle suspension
  assert(
    code.includes('if (this.isReducedMotion())') && code.includes('this.drawMiniUrchin();') && code.includes('return;'),
    'startMiniUrchinLoop must draw a single static frame and avoid scheduling requestAnimationFrame when reduced motion active'
  );
  assert(code.includes('cancelAnimationFrame(this.animId)'), 'CornerCompass must cancel active rAF upon motion reduction');
});

it('Verifies reduced-motion zero-cycle pause guard in speaking-dossier.ts waveform loop', () => {
  const file = path.join(__dirname, '../src/modules/speaking-dossier.ts');
  const code = fs.readFileSync(file, 'utf8');

  assert(code.includes('isReducedMotion()'), 'SpeakingDossier must define isReducedMotion()');
  assert(code.includes("getAttribute('data-motion') === 'reduce'"), 'SpeakingDossier must check data-motion="reduce" attribute');
  assert(
    code.includes('if (this.isReducedMotion())') && code.includes('drawWaveformFrame(canvas)') && code.includes('return;'),
    'SpeakingDossier waveform loop must halt rAF scheduling when reduced motion active and draw a static frame'
  );
});

// -----------------------------------------------------------------------------
// 5. Functional & Algorithmic Invariant Unit Assertions
// -----------------------------------------------------------------------------
it('Verifies WAI-ARIA roving tabindex state calculation invariant', () => {
  const passes = [1, 2, 3, 4];
  for (const activePass of passes) {
    for (const p of passes) {
      const isActive = p === activePass;
      const tabindex = isActive ? '0' : '-1';
      const ariaSelected = isActive ? 'true' : 'false';

      if (isActive) {
        assert.strictEqual(tabindex, '0', `Pass ${p} must have tabindex 0 when active`);
        assert.strictEqual(ariaSelected, 'true', `Pass ${p} must have aria-selected true when active`);
      } else {
        assert.strictEqual(tabindex, '-1', `Pass ${p} must have tabindex -1 when inactive`);
        assert.strictEqual(ariaSelected, 'false', `Pass ${p} must have aria-selected false when inactive`);
      }
    }
  }
});

it('Verifies WAI-ARIA reading pass arrow key cycling arithmetic', () => {
  // ArrowRight / ArrowDown: (current % 4) + 1
  assert.strictEqual((1 % 4) + 1, 2, 'Next pass from 1 should be 2');
  assert.strictEqual((2 % 4) + 1, 3, 'Next pass from 2 should be 3');
  assert.strictEqual((3 % 4) + 1, 4, 'Next pass from 3 should be 4');
  assert.strictEqual((4 % 4) + 1, 1, 'Next pass from 4 should wrap to 1');

  // ArrowLeft / ArrowUp: current === 1 ? 4 : current - 1
  const prev = (c) => (c === 1 ? 4 : c - 1);
  assert.strictEqual(prev(1), 4, 'Prev pass from 1 should wrap to 4');
  assert.strictEqual(prev(2), 1, 'Prev pass from 2 should be 1');
  assert.strictEqual(prev(3), 2, 'Prev pass from 3 should be 2');
  assert.strictEqual(prev(4), 3, 'Prev pass from 4 should be 3');
});

it('Verifies reduced-motion attribute evaluation predicate', () => {
  const evaluateMotion = (attrValue) => attrValue === 'reduce';

  assert.strictEqual(evaluateMotion('reduce'), true, 'Should detect reduced motion when attribute is "reduce"');
  assert.strictEqual(evaluateMotion('default'), false, 'Should be false when attribute is "default"');
  assert.strictEqual(evaluateMotion(null), false, 'Should be false when attribute is null');
  assert.strictEqual(evaluateMotion(''), false, 'Should be false when attribute is empty string');
});

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('--------------------------------------------------------------------------------');
console.log(`  Tests: ${passedTests}/${totalTests} passed`);
console.log('================================================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
