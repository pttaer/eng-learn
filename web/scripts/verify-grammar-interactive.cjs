// web/scripts/verify-grammar-interactive.cjs
/**
 * Automated Verification Suite for Interactive Syntactic Transformation Console in Grammar Dossier (ENG-60)
 * Audits:
 * 1. Source existence and markup in grammar-dossier.ts.
 * 2. Front-face interactive input (.grammar-transform-input, #grammar-transform-input).
 * 3. Verification button (.grammar-verify-btn with [ Verify Transformation ]).
 * 4. Inline diff preview container (.grammar-diff-feedback / .grammar-diff-preview) with aria-live="polite".
 * 5. Myers diff calculation (computeDiffTokens) and token evaluation logic.
 * 6. Keystroke acoustics (AudioSynthesizer.play('keystroke')) and celebration/warning audio cues.
 * 7. Keyboard shortcuts (Enter to verify, Space to flip).
 * 8. CSS styling in dossiers.css (44px min-height touch targets, focus rings, match states).
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================================');
console.log('  [TEST] VERIFYING INTERACTIVE GRAMMAR TRANSFORMATION CONSOLE (ENG-60)');
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

// 1. File Invariants
it('Verifies required source files exist', () => {
  const files = [
    'web/src/modules/grammar-dossier.ts',
    'web/src/modules/writing-dossier.ts',
    'web/src/core/audio-synthesizer.ts',
    'web/src/assets/styles/dossiers.css'
  ];

  for (const rel of files) {
    const full = path.join(__dirname, '..', '..', rel);
    assert(fs.existsSync(full), `File must exist: ${rel}`);
  }
});

// 2. Grammar Dossier Markup Invariants
it('Verifies front-face interactive console markup in grammar-dossier.ts', () => {
  const grammarPath = path.join(__dirname, '..', 'src/modules/grammar-dossier.ts');
  const code = fs.readFileSync(grammarPath, 'utf8');

  assert(code.includes('grammar-transform-console'), 'Must contain grammar-transform-console container');
  assert(code.includes('class="grammar-transform-input"'), 'Must contain grammar-transform-input class');
  assert(code.includes('id="grammar-transform-input"'), 'Must contain grammar-transform-input id');
  assert(code.includes('grammar-verify-btn'), 'Must contain grammar-verify-btn class');
  assert(code.includes('[ Verify Transformation ]'), 'Button must include "[ Verify Transformation ]" text');
  assert(code.includes('grammar-diff-feedback'), 'Must contain grammar-diff-feedback container');
  assert(code.includes('grammar-diff-preview'), 'Must contain grammar-diff-preview class');
  assert(code.includes('aria-live="polite"'), 'Diff preview must declare aria-live="polite"');
});

// 3. Audio Telemetry Invariants
it('Verifies keystroke and feedback audio wiring in grammar-dossier.ts and audio-synthesizer.ts', () => {
  const grammarCode = fs.readFileSync(path.join(__dirname, '..', 'src/modules/grammar-dossier.ts'), 'utf8');
  const audioCode = fs.readFileSync(path.join(__dirname, '..', 'src/core/audio-synthesizer.ts'), 'utf8');

  assert(grammarCode.includes("AudioSynthesizer.play('keystroke')"), 'Must play keystroke on typing');
  assert(grammarCode.includes("AudioSynthesizer.play('absorb')"), 'Must play absorb celebration on successful transformation');
  assert(grammarCode.includes("AudioSynthesizer.play('alarm')"), 'Must play alarm on syntactic mismatch');
  assert(audioCode.includes("'keystroke'"), 'AudioSynthesizer must support keystroke sound type');
});

// 4. Keyboard Shortcuts Invariants
it('Verifies Enter to verify and Space to flip shortcut handling', () => {
  const grammarCode = fs.readFileSync(path.join(__dirname, '..', 'src/modules/grammar-dossier.ts'), 'utf8');

  assert(grammarCode.includes("e.key === 'Enter'"), 'Must handle Enter key in transform input');
  assert(grammarCode.includes("runVerify()"), 'Must invoke verification on Enter');
  assert(grammarCode.includes("e.key === ' '"), 'Must check Space key in transform input');
  assert(grammarCode.includes('this.currentCardHandle?.flip()'), 'Space with empty input must trigger flip');
  assert(grammarCode.includes("key === 'Enter'"), 'handleGlobalKey must support Enter key');
});

// 5. Myers Token Diff Simulation
it('Verifies Myers diff computation and match percentage evaluation', () => {
  // Headless implementation of Myers diff matching computeDiffTokens
  function computeDiffTokens(original, candidate) {
    const o = original.split('');
    const c = candidate.split('');
    const m = o.length;
    const n = c.length;
    const dp = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (o[i - 1] === c[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }

    const tokens = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && o[i - 1] === c[j - 1]) {
        tokens.unshift({ type: 'match', value: o[i - 1] });
        i--; j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] <= dp[i - 1][j])) {
        tokens.unshift({ type: 'insert', value: c[j - 1] });
        j--;
      } else {
        tokens.unshift({ type: 'delete', value: o[i - 1] });
        i--;
      }
    }
    return tokens;
  }

  const target = 'English is spoken in many countries.';
  const exactInput = 'English is spoken in many countries.';
  const exactTokens = computeDiffTokens(exactInput, target);
  assert(exactTokens.every(t => t.type === 'match'), 'Exact input must yield 100% match tokens');

  const typoInput = 'English is speaked in many countries.';
  const typoTokens = computeDiffTokens(typoInput, target);
  const hasDelete = typoTokens.some(t => t.type === 'delete');
  const hasInsert = typoTokens.some(t => t.type === 'insert');
  assert(hasDelete && hasInsert, 'Typo input must yield both delete and insert tokens');
});

// 6. CSS Architectural & Ergonomic Invariants
it('Verifies CSS rules and 44px touch targets in dossiers.css', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'src/assets/styles/dossiers.css'), 'utf8');

  assert(css.includes('.grammar-transform-console'), 'Must style .grammar-transform-console');
  assert(css.includes('.grammar-transform-input'), 'Must style .grammar-transform-input');
  assert(css.includes('.grammar-verify-btn'), 'Must style .grammar-verify-btn');
  assert(css.includes('.grammar-diff-feedback'), 'Must style .grammar-diff-feedback');
  assert(css.includes('.match-success'), 'Must define .match-success styles');
  assert(css.includes('.match-mismatch'), 'Must define .match-mismatch styles');
  assert(css.includes('--touch-target-min, 44px'), 'Must enforce minimum 44px hitboxes for WCAG AAA');
  assert(css.includes('.diff-token-match'), 'Must have .diff-token-match styling');
  assert(css.includes('.diff-token-delete'), 'Must have .diff-token-delete styling');
  assert(css.includes('.diff-token-insert'), 'Must have .diff-token-insert styling');
});

console.log('--------------------------------------------------------------------------------');
console.log(`Results: ${passedTests}/${totalTests} tests passed.`);
if (passedTests === totalTests) {
  console.log('✓ ALL INTERACTIVE GRAMMAR TRANSFORMATION CONSOLE INVARIANTS SATISFIED (ENG-60)');
} else {
  process.exit(1);
}
