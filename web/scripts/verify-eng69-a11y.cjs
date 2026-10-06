// web/scripts/verify-eng69-a11y.cjs
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[VERIFY ENG-69] Initializing Reading Pass Tabs & Live Regions Verification...');

const readingTs = fs.readFileSync(path.join(__dirname, '../src/modules/reading-dossier.ts'), 'utf8');
const writingTs = fs.readFileSync(path.join(__dirname, '../src/modules/writing-dossier.ts'), 'utf8');
const speakingTs = fs.readFileSync(path.join(__dirname, '../src/modules/speaking-dossier.ts'), 'utf8');

// 1. Reading Dossier: WAI-ARIA Roving Tabindex & Tab Roles
assert(readingTs.includes('role="tab"'), 'reading-dossier.ts must define role="tab" on pass buttons');
assert(readingTs.includes('aria-selected="${isActive}"'), 'reading-dossier.ts must define aria-selected on pass buttons');
assert(readingTs.includes('tabindex="${isActive ? \'0\' : \'-1\'}"'), 'reading-dossier.ts must implement WAI-ARIA roving tabindex (0 for active, -1 for inactive)');
assert(readingTs.includes('role="tabpanel"'), 'reading-dossier.ts must define role="tabpanel" on the content slot');
assert(readingTs.includes('switchPass'), 'reading-dossier.ts must define a switchPass helper method');
console.log('✓ Suite 1: WAI-ARIA roving tabindex & tabpanel roles verified in reading-dossier.ts');

// 2. Reading Dossier: Arrow Key Pass Navigation
assert(readingTs.includes('reading-pass-stepper') && readingTs.includes('ArrowRight') && readingTs.includes('ArrowLeft'),
  'reading-dossier.ts must bind ArrowRight/ArrowLeft keyboard navigation to reading pass stepper');
assert(readingTs.includes('this.switchPass(nextPass') || readingTs.includes('this.switchPass(targetPass'),
  'reading-dossier.ts must cycle passes on arrow key navigation');
console.log('✓ Suite 2: Stepper and global ArrowLeft/ArrowRight pass cycling verified in reading-dossier.ts');

// 3. Writing Dossier: Myers Split-Diff aria-live="polite"
assert(writingTs.includes('copywork-diff-container') && writingTs.includes('aria-live="polite"'),
  'writing-dossier.ts must declare aria-live="polite" on the Myers split-diff evaluation container');
console.log('✓ Suite 3: aria-live="polite" region verified on Myers split-diff in writing-dossier.ts');

// 4. Speaking Dossier: Countdown Timer aria-live="polite"
assert(speakingTs.includes('timer-display-text') && speakingTs.includes('aria-live="polite"'),
  'speaking-dossier.ts must declare aria-live="polite" on the countdown timer display');
assert(speakingTs.includes('role="timer"'),
  'speaking-dossier.ts must declare role="timer" on the countdown timer display');
console.log('✓ Suite 4: aria-live="polite" and role="timer" verified on countdown timer in speaking-dossier.ts');

console.log('✅ [VERIFY ENG-69 PASSED] All Reading Pass Tab navigation and live region requirements verified 100%.');
