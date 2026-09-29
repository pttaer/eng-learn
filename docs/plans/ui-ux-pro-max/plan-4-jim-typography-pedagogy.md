# UI/UX Pro Max Architecture Plan 4: Information Architecture, Typographic Hierarchy & High-Density Pedagogical Scaffolding

**Assignee:** `jim-mul1meuh` (Jim — Curriculum Architect, Information Architecture & Pedagogical Pacing Specialist)  
**Ticket ID:** `ENG-25`  
**Target Module:** [`web/src/modules/reading-dossier.ts`](file:///E:/Eng/web/src/modules/reading-dossier.ts), [`web/src/modules/writing-dossier.ts`](file:///E:/Eng/web/src/modules/writing-dossier.ts), [`web/src/modules/grammar-dossier.ts`](file:///E:/Eng/web/src/modules/grammar-dossier.ts), [`web/src/modules/vocabulary-dossier.ts`](file:///E:/Eng/web/src/modules/vocabulary-dossier.ts), [`web/src/assets/styles/dossiers.css`](file:///E:/Eng/web/src/assets/styles/dossiers.css)  
**Design Standard:** Strict Binary Monochrome (`#000000` / `#ffffff`), Typographic Ratio Grid, 55–75 Character Measure, Tabular Telemetry, Cognitive Progressive Disclosure.  
**Word Count Target:** $\ge 2,000$ words of concrete, executable code and architectural blueprints.

---

## 1. Executive Summary & Pedagogical Foundations

In advanced language acquisition, visual clarity is not merely cosmetic; it directly governs cognitive throughput. According to **Cognitive Load Theory (John Sweller)**, human working memory has a strictly finite capacity. When an educational interface presents excessive extraneous cognitive load—such as unformatted walls of text, jarring font variations, inconsistent numeric tables, or chaotic layout density—germane cognitive processing (the formation of permanent linguistic schemas in long-term memory) is severely suppressed.

An evaluation of our 7 learning dossiers against the **`ui-ux-pro-max`** typography and information architecture guidelines highlights four critical structural deficits:
1. **Unconstrained Measure & Eyestrain in 4-Pass Reading:** In `reading-dossier.ts`, long-form authentic reading passages span the full width of widescreen desktop viewports ($> 1200\text{px}$), yielding line lengths exceeding $140$ characters per line. Ergonomic readability studies prove that lines exceeding $75-80$ characters cause severe saccadic regression (the reader loses their place when sweeping back to the left margin).
2. **Sub-optimal Franklin Copywork Feedback in Writing:** In `writing-dossier.ts`, the user's re-creation of model prose is compared using a basic line diff. Students lack character-by-character token alignment, instant typing velocity telemetry (Words Per Minute), real-time accuracy scoring, and typographic strike-through markers that replicate traditional editorial proofreading.
3. **Missing Progressive Disclosure Pacing in Reading & Grammar:** Complex C1/C2 grammar structures and 4-pass reading articles present all information at once, violating the principle of progressive disclosure. Students need step-by-step cognitive scaffolding (e.g. Pass 1 Skim $\rightarrow$ Pass 2 Argument $\rightarrow$ Pass 3 Lexicon $\rightarrow$ Pass 4 Synthesis).
4. **Non-Tabular Numeral Telemetry & Layout Jitter:** In high-speed countdown timers, word counters, and SRS intervals, standard proportional numerals (`0`, `1`, `2`) possess variable glyph widths. As timers tick, parent containers and surrounding text jitter horizontally by $1-3\text{px}$, causing visual annoyance.

Jim will execute a comprehensive typographic and pedagogical overhaul across all dossier modules: establishing a strict **65-Character Reading Measure**, an advanced **Character-Level Split-Diff Proofreading Console**, **Step-by-Step Cognitive Scaffolding**, and universal **Tabular Numeral Alignment** (`font-variant-numeric: tabular-nums;`).

---

## 2. Mathematical Models & Typographic Formulations

### 2.1 The Typographic Golden Measure & Line Height Ratio
The optimal reading measure $L_c$ (characters per line) for cognitive comprehension of dense technical or literary English is governed by:

$$55 \le L_c \le 75 \text{ characters}$$

To mathematically guarantee this line length regardless of screen size, the container max-width must be calculated from the font's average character advance ($1\text{ch}$):

$$W_{\text{reading}} = 68\text{ch} \approx 680\text{px} \text{ (at } 16\text{px base font)}$$

For vertical line-height (leading) $\lambda$, dense technical prose requires a proportional scaling with line length:
$$\lambda = 1.45 + 0.15 \cdot \left(\frac{W_{\text{container}}}{W_{\text{max}}}\right) \approx 1.58$$

Jim will apply CSS modern text-balancing properties:
- `text-wrap: balance;` on all card prompt headings (preventing single-word typographic "orphans").
- `text-wrap: pretty;` on body copy (preventing dangling words on the final line of paragraphs).

### 2.2 Character-Level Levenshtein Difference Alignment
For the Benjamin Franklin Copywork drill (`writing-dossier.ts`), simple line diffs fail when a single typo offsets the entire sentence. Jim will implement a **Token & Character Alignment Engine** using the Hirschberg-Myers linear-space longest common subsequence (LCS) algorithm:

Given original target string $T$ and student input string $S$:
$$D[i, j] = \begin{cases}
D[i-1, j-1], & \text{if } T[i] = S[j] \\
1 + \min(D[i-1, j], D[i, j-1], D[i-1, j-1]), & \text{otherwise}
\end{cases}$$

Rendered visual proofreading output:
- Identical characters: Standard ink (`var(--ink-primary)`).
- Omissions: Inverted strike-through badge `[del: word]`.
- Insertions: High-contrast underline `[ins: word]`.

### 2.3 Typing Velocity (WPM) & Cognitive Fluency Score
During active Franklin copywork, real-time typing velocity tracks cognitive fluency:

$$\text{Gross WPM} = \frac{\text{Total Characters Typed} / 5}{\text{Time Elapsed in Minutes}}$$
$$\text{Net WPM} = \max\left(0, \text{Gross WPM} - \frac{\text{Uncorrected Errors}}{\text{Time Elapsed in Minutes}}\right)$$
$$\text{Accuracy \%} = \left(\frac{\text{Matched Characters}}{\text{Total Target Characters}}\right) \times 100$$

---

## 3. Detailed Component Architecture & TypeScript Interfaces

Jim will modify and deliver:
1. `web/src/modules/writing-dossier.ts` (Major upgrade: Real-time split-diff proofreading console, live WPM / accuracy telemetry, MEAL structure checklist).
2. `web/src/modules/reading-dossier.ts` (Major upgrade: 68ch reading measure, stepped 4-pass cognitive disclosure state machine, vocabulary inline extraction).
3. `web/src/modules/grammar-dossier.ts` (Syntactic formula callout boxes, Vietnamese comparative syntax drawer, inversion/condensation repair diffs).
4. `web/src/assets/styles/dossiers.css` (Reading container widths, proofreading diff tokens, tabular typography rules).
5. `web/scripts/verify-typographic-pedagogy.cjs` (Automated text measurement, WPM algorithm verification, and diff accuracy tests).

```typescript
// web/src/modules/writing-dossier.ts (Enhanced Interface Contracts)
export interface ProofreadDiffToken {
  type: 'match' | 'insert' | 'delete';
  value: string;
}

export interface WritingTelemetry {
  grossWpm: number;
  netWpm: number;
  accuracyPct: number;
  elapsedSec: number;
  errorCount: number;
  completed: boolean;
}
```

---

## 4. Step-by-Step Implementation Blueprint

### Step 4.1: Automated Headless Pedagogical & Diff Test Suite
Jim will create `web/scripts/verify-typographic-pedagogy.cjs` to validate the diff algorithm, WPM calculation, and CSS measure constraints:

```javascript
// web/scripts/verify-typographic-pedagogy.cjs
const assert = require('assert');

console.log('[PEDAGOGY TEST] Validating typographic formulas and diff alignment algorithms...');

// 1. Character-Level LCS Diff Implementation Verification
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

  // Backtrack to generate tokens
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

const originalText = "The quick brown fox";
const studentText = "The quik brown fox!";
const diff = computeDiffTokens(originalText, studentText);

console.log('- Diff Tokens Generated:', diff.map(t => `${t.type}:${t.value}`).join(' '));
assert(diff.some(t => t.type === 'delete' && t.value === 'c'), 'Failed to detect deleted letter "c"');
assert(diff.some(t => t.type === 'insert' && t.value === '!'), 'Failed to detect inserted character "!"');

// 2. Net WPM and Accuracy Calculation
function calculateWritingMetrics(targetStr, typedStr, elapsedSec) {
  const charsTyped = typedStr.length;
  const minutes = Math.max(0.016, elapsedSec / 60);
  const grossWpm = Math.round((charsTyped / 5) / minutes);

  let errors = 0;
  const minLen = Math.min(targetStr.length, typedStr.length);
  for (let i = 0; i < minLen; i++) {
    if (targetStr[i] !== typedStr[i]) errors++;
  }
  errors += Math.abs(targetStr.length - typedStr.length);

  const netWpm = Math.max(0, Math.round(((charsTyped / 5) - errors) / minutes));
  const accuracyPct = Math.max(0, Math.min(100, Math.round(((charsTyped - errors) / targetStr.length) * 100)));

  return { grossWpm, netWpm, accuracyPct, errors };
}

const metrics = calculateWritingMetrics(originalText, studentText, 10);
console.log(`- Metrics: Gross=${metrics.grossWpm} WPM, Net=${metrics.netWpm} WPM, Accuracy=${metrics.accuracyPct}%`);
assert(metrics.accuracyPct > 80 && metrics.accuracyPct < 100, 'Accuracy score miscalculated');

console.log('✓ All Pedagogical and Diff mathematical assertions passed cleanly.');
```

### Step 4.2: Engineering Franklin Copywork Split-Diff Console in `writing-dossier.ts`
Jim will replace the basic input area with a professional dual-pane proofreading console:

```typescript
// web/src/modules/writing-dossier.ts (Core Enhancements)
private renderFranklinSplitConsole(frontEl: HTMLElement, item: any): void {
  const splitConsole = document.createElement('div');
  splitConsole.className = 'franklin-split-console';
  splitConsole.innerHTML = `
    <!-- Top Pane: Original Master Exemplar -->
    <div class="franklin-master-pane">
      <div class="pane-header">
        <span class="telemetry-label">[BENJAMIN FRANKLIN COPYWORK // ORIGINAL MODEL]</span>
        <button class="hud-btn btn-toggle-model" style="padding: 2px 8px; font-size: 10px;">[ HIDE MODEL (BLIND PASS) ]</button>
      </div>
      <div class="model-text-content" style="max-width: 68ch; line-height: 1.6; font-size: 15px; margin: 8px 0;">
        ${item.prompt}
      </div>
    </div>

    <!-- Live Telemetry Strip -->
    <div class="franklin-telemetry-strip" style="display: flex; gap: 16px; border-top: 1px dashed var(--border-hairline); border-bottom: 1px dashed var(--border-hairline); padding: 6px 0; margin: 8px 0; font-family: var(--font-mono); font-size: 11px;">
      <div>VELOCITY: <span class="val-wpm" style="font-weight: 700;">0 WPM</span></div>
      <div>ACCURACY: <span class="val-accuracy" style="font-weight: 700;">100%</span></div>
      <div>ERRORS: <span class="val-errors" style="font-weight: 700;">0</span></div>
      <div>TIME: <span class="val-time" style="font-weight: 700;">00:00</span></div>
    </div>

    <!-- Bottom Pane: Interactive Student Re-creation -->
    <div class="franklin-editor-pane">
      <textarea class="franklin-input-textarea" placeholder="Type the model text from memory..." rows="4" style="width: 100%; border: 1px solid var(--border-solid); padding: 12px; font-family: var(--font-sans); font-size: 15px; line-height: 1.6; resize: vertical; box-sizing: border-box;"></textarea>
      
      <!-- Real-Time Proofreading Diff Output -->
      <div class="franklin-diff-output" style="display: none; border: 1px solid var(--border-solid); padding: 12px; margin-top: 8px; font-family: var(--font-mono); font-size: 13px; line-height: 1.7; background: #ffffff;"></div>
    </div>

    <!-- Action Toolbar -->
    <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
      <button class="hud-btn btn-evaluate-diff">[ EVALUATE EDITORIAL DIFF ]</button>
      <button class="hud-btn btn-reset-copywork">[ ↺ RESET ]</button>
    </div>
  `;

  frontEl.appendChild(splitConsole);
  this.bindFranklinEvents(splitConsole, item);
}
```

### Step 4.3: Engineering 4-Pass Stepped Cognitive Scaffolding in `reading-dossier.ts`
Jim will structure authentic articles into four sequential progressive disclosure passes:
1. **Pass 1: Skimming (60s Countdown Timer):** Blurs fine detail, highlights structural headers and thesis statements. Trains high-speed cognitive gist extraction.
2. **Pass 2: Argument Skeleton:** Renders an interactive outline tree diagram showing Premises $\rightarrow$ Evidence $\rightarrow$ Rebuttal $\rightarrow$ Conclusion.
3. **Pass 3: Intensive Lexical Mining:** Highlights C1/C2 collocations, phrasal verbs, and discourse markers. Clicking any phrase pops up an inline lexical dossier card.
4. **Pass 4: Critical Synthesis & Comprehension:** Evaluates reader comprehension through 3 forensic inference questions.

```typescript
// Stepped pass state machine in reading-dossier.ts
export type ReadingPass = 1 | 2 | 3 | 4;

export interface ArticlePassConfig {
  pass: ReadingPass;
  title: string;
  instruction: string;
  allocatedSeconds?: number;
}

export const READING_PASSES: ArticlePassConfig[] = [
  {
    pass: 1,
    title: 'PASS 1: GIST SKIM',
    instruction: 'Scan the macro-structure within 60 seconds. Formulate the overarching thesis statement before details distract your cognitive bandwidth.',
    allocatedSeconds: 60
  },
  {
    pass: 2,
    title: 'PASS 2: ARGUMENT SKELETON',
    instruction: 'Identify the structural pillars: Topic Sentence -> Evidentiary Anchor -> Antithesis -> Synthesis.',
  },
  {
    pass: 3,
    title: 'PASS 3: INTENSIVE LEXICAL MINING',
    instruction: 'Extract target C1/C2 collocations, syntactic inversions, and academic transition markers directly into your personal Anki review queue.',
  },
  {
    pass: 4,
    title: 'PASS 4: CRITICAL SYNTHESIS',
    instruction: 'Answer 3 forensic inference questions evaluating rhetorical stance, latent bias, and logical validity.',
  }
];

export class ReadingPassController {
  private currentPass: ReadingPass = 1;
  private onPassChangeCb?: (pass: ReadingPass) => void;

  constructor(onPassChange?: (pass: ReadingPass) => void) {
    this.onPassChangeCb = onPassChange;
  }

  public setPass(pass: ReadingPass): void {
    this.currentPass = pass;
    if (this.onPassChangeCb) this.onPassChangeCb(this.currentPass);
  }

  public nextPass(): void {
    if (this.currentPass < 4) {
      this.currentPass = (this.currentPass + 1) as ReadingPass;
      if (this.onPassChangeCb) this.onPassChangeCb(this.currentPass);
    }
  }

  public getActivePass(): ReadingPass {
    return this.currentPass;
  }
}
```

### Step 4.4: Engineering Syntactic Repair & Formula Highlights in `grammar-dossier.ts`
For Pillar 07 (Grammar), advanced C1/C2 sentence repair drills must visually communicate grammatical transformations with laser clarity:
- **Formula Bar:** Mathematical syntactic formula (e.g. `[Not only + Aux + S + V..., but also + S + V]`) highlighted in bold monospace font with dedicated parameter brackets.
- **Repair Diff View:** Compares the erroneous or colloquial baseline sentence against the forensic C1/C2 master construction. Errors are presented with inverted strikethrough badges, while advanced inverted verbs are underlined.
- **Vietnamese Comparative Analysis Callout:** Clarifies why Vietnamese L1 learners frequently default to literal syntactic translation errors (e.g., omitting subject-auxiliary inversion after negative adverbials).

```css
/* Reading measure and typography rules in web/src/assets/styles/dossiers.css */

.reading-article-body {
  max-width: 68ch;
  margin: 0 auto;
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.62;
  color: var(--ink-primary);
  text-wrap: pretty;
}

.reading-article-body h2,
.reading-article-body h3 {
  font-family: var(--font-sans);
  font-weight: 700;
  text-wrap: balance;
  margin-top: 24px;
  margin-bottom: 8px;
  line-height: 1.3;
}

/* Grammar Matrix Formula Card */
.grammar-formula-bar {
  display: block;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  background: #000000;
  color: #ffffff;
  padding: 8px 12px;
  margin: 10px 0;
  letter-spacing: -0.01em;
}

.grammar-vietnamese-callout {
  border-left: 3px solid #000000;
  background: rgba(0, 0, 0, 0.02);
  padding: 8px 12px;
  margin: 10px 0;
  font-family: var(--font-sans);
  font-size: 13px;
  line-height: 1.5;
}

.grammar-vietnamese-callout strong {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  display: block;
  margin-bottom: 4px;
}

/* Tabular Numerals across all HUD and Telemetry Readouts */
.telemetry-value,
.card-counter,
.timer-display-text,
.compression-table td,
.val-wpm,
.val-accuracy,
.val-time {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

/* Proofreading Diff Tokens */
.diff-token-match {
  color: #000000;
}

.diff-token-delete {
  background: #000000;
  color: #ffffff;
  text-decoration: line-through;
  padding: 0 3px;
  margin: 0 1px;
}

.diff-token-insert {
  border-bottom: 2px solid #000000;
  font-weight: 700;
  padding: 0 2px;
  margin: 0 1px;
}
```

---

## 5. Defensive Boundaries & Failure Modes

1. **Typographic Reflow on Input Keypresses**:
   - Running live character-level LCS diff calculations on every keystroke during $80\text{WPM}$ typing can cause micro-stutter if input text exceeds 1,000 characters.
   - **Defense:** Debounce live diff computation to $120\text{ms}$ or compute diff solely on blur / button trigger, while computing WPM immediately from raw character counts.
2. **Vietnamese Glyph Diacritics Clipping in Monospace**:
   - Vietnamese translation strings feature stacked diacritics (e.g., `ệ`, `ở`, `ữ`). If CSS `line-height` is too tight ($< 1.3$), top tone marks can be clipped by `overflow: hidden` boundaries.
   - **Defense:** Enforce `line-height: 1.45` minimum on all bilingual text containers and apply `padding-top: 2px; padding-bottom: 2px;`.
3. **Pasting Massive Text Blocks into Copywork**:
   - Pasting a 5,000-word essay into the copywork editor will freeze the browser tab if an $O(M \times N)$ diff matrix is calculated synchronously.
   - **Defense:** Impose a strict character ceiling ($1,500$ characters) on the copywork textarea and truncate pasted content with a non-blocking HUD notice.

---

## 6. Verification & Acceptance Criteria

1. **Automated Test Suite**:
   - `node web/scripts/verify-typographic-pedagogy.cjs` executes with 100% assertions passing.
2. **Typographic Rhythm Audit**:
   - Line lengths across `reading-dossier.ts` strictly conform to $65-72\text{ch}$.
   - All numbers across tables and HUDs render with `font-variant-numeric: tabular-nums`.
3. **Copywork Precision**:
   - Split-diff console accurately detects single-character typos, missing punctuation, and extraneous words without misaligning surrounding text.
4. **Build Integrity**:
   - `npm run build` compiles cleanly with zero TypeScript errors.
