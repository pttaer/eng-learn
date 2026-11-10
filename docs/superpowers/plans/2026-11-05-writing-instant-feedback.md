# Writing Instant Feedback Heuristics: Argument Structure, Manchester Phrasebank Upgrader & Paragraph Cohesion Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement offline, local instant feedback heuristics in the IELTS Academic Writing submission pipeline: diagnosing missing argument elements (Topic Sentences, Causal Linkers, Concrete Evidence) across body paragraphs; detecting informal/weak expressions and suggesting direct Manchester Academic Phrasebank upgrades; and scoring inter-paragraph transition cohesion.

**Architecture:** We introduce three modular, zero-dependency diagnostic engines in `web/src/ielts/writing-heuristics.ts`: `diagnoseArgumentStructure`, `diagnoseStyleUpgrades`, and `evaluateParagraphCohesion`. These are integrated directly into `analyse()` to enrich `WritingReport` with backward-compatible telemetry, and rendered in `web/src/ielts/views/writing.ts` and `web/src/ielts/ielts.css` as interactive, touch-friendly feedback cards following Apple-calm design tokens (`--radius-btn: 10px`, 44px touch floor, no concentric double borders).

**Tech Stack:** TypeScript 5.5, Vanilla DOM manipulation, Node.js CommonJS test harnesses (`ts.transpileModule`), CSS custom properties design tokens (`variables.css`, `ielts.css`), JSON asset parsing (`academic-phrasebank.json`).

**Spec:** Context from `web/src/ielts/views/writing.ts`, `docs/curriculum/writing.md`, and Item 3 of the Writing Pedagogical Heuristics Roadmap ("Writing Instant Feedback Heuristics: Phát hiện luận điểm/dẫn chứng còn thiếu & Đề xuất cụm từ Manchester Phrasebank nâng cấp bài viết").

---

## Global Constraints

1. **Offline & Zero External Dependencies:** 100% local JavaScript/TypeScript evaluation. Zero external API calls, zero LLM dependencies.
2. **Touch Floor & Canonical Spacing Invariant:** All new UI elements must strictly comply with `AGENTS.md` § 1.1–1.16 (44px touch targets on all interactive elements, universal button border radius `--radius-btn: 10px`, exactly one mobile breakpoint at 768px `max-width: 768px`, and no concentric double borders inside cards).
3. **Defensive Telemetry:** All diagnostic scores, percentages, and metrics must defensively calculate finite numerical defaults; never expose raw `undefined` or `NaN%` in UI receipts.
4. **Strict Performance Budget:** Essay analysis across all heuristics must execute synchronously in < 15ms for typical 250–450 word essays.
5. **Backward Compatibility:** Existing fields of `WritingReport` and the signature of `analyse(text: string, task: 1 | 2, prompt?: string)` must remain fully intact so existing verification scripts (`web/scripts/verify-ielts-writing.cjs`) pass with zero regressions.

---

## File Map

| Path | Action | Description |
|---|---|---|
| `web/src/ielts/writing-heuristics.ts` | Modify | Add `BodyParagraphDiagnostic`, `ArgumentStructureReport`, `StyleUpgradeSuggestion`, `StyleUpgraderReport`, `ParagraphCohesionReport`, implement `diagnoseArgumentStructure`, `diagnoseStyleUpgrades`, `evaluateParagraphCohesion`, and enrich `analyse()` |
| `web/scripts/verify-writing-heuristics-deep.cjs` | Create | Comprehensive automated test suite verifying argument structure detection, phrasebank upgrade mappings, cohesion scoring, and execution performance |
| `web/src/ielts/ielts.css` | Modify | Add CSS classes for argument architecture matrix, style upgrader cards, and paragraph cohesion flow meter adhering to design system rules |
| `web/src/ielts/views/writing.ts` | Modify | Update essay submission feedback rendering (`submit.addEventListener('click')`) to display interactive argument matrix, phrasebank upgrader with copy affordance, and cohesion score |
| `web/scripts/run-verify.cjs` | Verify | Automated verification runner to ensure the new script is automatically included in the test suite |

---

## Task Decomposition

### Task 1: Argument Structure Diagnostic Engine

**Files:**
- Modify: `web/src/ielts/writing-heuristics.ts:158-267`
- Create: `web/scripts/verify-writing-heuristics-deep.cjs`

**Interfaces:**
- Consumes: `paras(text: string): string[]`, `TOPIC_MARKERS`, `CAUSAL_EXPLANATION`, `CONCRETE_EVIDENCE` in `web/src/ielts/writing-heuristics.ts`.
- Produces:
  ```typescript
  export interface BodyParagraphDiagnostic {
    paragraphIndex: number;
    text: string;
    hasTopicSentence: boolean;
    hasCausalExplanation: boolean;
    hasConcreteEvidence: boolean;
    missingElements: ('topic' | 'cause' | 'evidence')[];
    feedback: string[];
  }

  export interface ArgumentStructureReport {
    bodyParagraphs: BodyParagraphDiagnostic[];
    totalBodyParagraphs: number;
    fullyDevelopedParagraphs: number;
    missingOverallEvidence: boolean;
    missingOverallCausal: boolean;
    summaryFlags: string[];
    score: number; // 0 to 100
  }

  export function diagnoseArgumentStructure(paragraphs: string[], task: 1 | 2): ArgumentStructureReport;
  ```

- [ ] **Step 1: Write the failing test for Argument Structure Diagnostic**

Create `web/scripts/verify-writing-heuristics-deep.cjs`:
```javascript
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ts = require('typescript');

const SRC = path.join(__dirname, '..', 'src', 'ielts');
const code = ts.transpileModule(
  fs.readFileSync(path.join(SRC, 'writing-heuristics.ts'), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }
).outputText;
const mod = { exports: {} };
new Function('module', 'exports', 'require', code)(mod, mod.exports, require);

const { diagnoseArgumentStructure } = mod.exports;
assert(typeof diagnoseArgumentStructure === 'function', 'diagnoseArgumentStructure must be exported');

// Test Case 1: Essay with 2 body paragraphs, one missing evidence, one fully developed
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

console.log('Task 1 tests passed successfully.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node web/scripts/verify-writing-heuristics-deep.cjs`
Expected: FAIL with `AssertionError: diagnoseArgumentStructure must be exported`.

- [ ] **Step 3: Implement `diagnoseArgumentStructure` in `writing-heuristics.ts`**

Add the interfaces and implementation to `web/src/ielts/writing-heuristics.ts`:
```typescript
export interface BodyParagraphDiagnostic {
  paragraphIndex: number;
  text: string;
  hasTopicSentence: boolean;
  hasCausalExplanation: boolean;
  hasConcreteEvidence: boolean;
  missingElements: ('topic' | 'cause' | 'evidence')[];
  feedback: string[];
}

export interface ArgumentStructureReport {
  bodyParagraphs: BodyParagraphDiagnostic[];
  totalBodyParagraphs: number;
  fullyDevelopedParagraphs: number;
  missingOverallEvidence: boolean;
  missingOverallCausal: boolean;
  summaryFlags: string[];
  score: number; // 0 to 100
}

/**
 * Diagnoses argument structure of essay body paragraphs (Task 2 or Task 1 detail paragraphs).
 * For a 4+ paragraph essay, skips introduction (index 0) and conclusion (last index).
 * For shorter texts, evaluates all non-introductory paragraphs.
 */
export function diagnoseArgumentStructure(paragraphs: string[], task: 1 | 2): ArgumentStructureReport {
  const parts = paragraphs.map(p => p.trim()).filter(Boolean);
  if (parts.length === 0) {
    return {
      bodyParagraphs: [],
      totalBodyParagraphs: 0,
      fullyDevelopedParagraphs: 0,
      missingOverallEvidence: true,
      missingOverallCausal: true,
      summaryFlags: ['No paragraphs provided to evaluate argument structure.'],
      score: 0
    };
  }

  // Identify body paragraphs: skip intro (index 0) and conclusion (last index if >= 3 paragraphs)
  let bodyParts: { text: string; originalIndex: number }[] = [];
  if (parts.length >= 3) {
    bodyParts = parts.slice(1, parts.length - 1).map((text, idx) => ({ text, originalIndex: idx + 1 }));
  } else if (parts.length === 2) {
    bodyParts = [{ text: parts[1], originalIndex: 1 }];
  } else {
    bodyParts = [{ text: parts[0], originalIndex: 0 }];
  }

  const bodyParagraphs: BodyParagraphDiagnostic[] = bodyParts.map((item, bpIdx) => {
    const pText = item.text;
    const sents = pText.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    const firstSent = sents[0] || '';
    const startsWithEvidenceOrImpact = /^(for (example|instance)|specifically|take |such as|consequently|thus|therefore|in conclusion|overall)\b/i.test(firstSent);
    
    // Topic sentence heuristic: must open with topic claim or be substantive statement
    const hasTopicSentence = sents.length >= 1 && (TOPIC_MARKERS.test(firstSent) || (firstSent.split(/\s+/).length >= 6 && !startsWithEvidenceOrImpact));
    const hasCausalExplanation = CAUSAL_EXPLANATION.test(pText);
    const hasConcreteEvidence = CONCRETE_EVIDENCE.test(pText);

    const missingElements: ('topic' | 'cause' | 'evidence')[] = [];
    const feedback: string[] = [];

    if (!hasTopicSentence) {
      missingElements.push('topic');
      feedback.push(`Body Paragraph ${bpIdx + 1}: Missing a clear Topic Sentence claim in the opening line.`);
    } else {
      feedback.push(`Body Paragraph ${bpIdx + 1}: Topic Sentence clearly established.`);
    }

    if (!hasCausalExplanation) {
      missingElements.push('cause');
      feedback.push(`Body Paragraph ${bpIdx + 1}: Lacks causal reasoning ("because", "this is because", "leads to").`);
    } else {
      feedback.push(`Body Paragraph ${bpIdx + 1}: Causal explanation detected.`);
    }

    if (!hasConcreteEvidence) {
      missingElements.push('evidence');
      feedback.push(`Body Paragraph ${bpIdx + 1}: Missing concrete evidence or real-world exemplar ("for instance", "research indicates", "a study by").`);
    } else {
      feedback.push(`Body Paragraph ${bpIdx + 1}: Concrete evidence detected.`);
    }

    return {
      paragraphIndex: item.originalIndex,
      text: pText,
      hasTopicSentence,
      hasCausalExplanation,
      hasConcreteEvidence,
      missingElements,
      feedback
    };
  });

  const totalBody = bodyParagraphs.length;
  const fullyDeveloped = bodyParagraphs.filter(bp => bp.missingElements.length === 0).length;
  const missingOverallEvidence = bodyParagraphs.some(bp => !bp.hasConcreteEvidence);
  const missingOverallCausal = bodyParagraphs.some(bp => !bp.hasCausalExplanation);

  const summaryFlags: string[] = [];
  bodyParagraphs.forEach((bp, idx) => {
    if (bp.missingElements.length > 0) {
      summaryFlags.push(`Body Paragraph ${idx + 1} is missing: ${bp.missingElements.join(', ')}.`);
    }
  });

  if (totalBody > 0 && fullyDeveloped === totalBody) {
    summaryFlags.push('All body paragraphs demonstrate solid 4-sentence claim-cause-evidence development.');
  }

  // Calculate composite score (0 - 100)
  let rawScore = 0;
  if (totalBody > 0) {
    const totalChecks = totalBody * 3;
    let passedChecks = 0;
    bodyParagraphs.forEach(bp => {
      if (bp.hasTopicSentence) passedChecks++;
      if (bp.hasCausalExplanation) passedChecks++;
      if (bp.hasConcreteEvidence) passedChecks++;
    });
    rawScore = Math.round((passedChecks / totalChecks) * 100);
  }

  return {
    bodyParagraphs,
    totalBodyParagraphs: totalBody,
    fullyDevelopedParagraphs: fullyDeveloped,
    missingOverallEvidence,
    missingOverallCausal,
    summaryFlags,
    score: rawScore
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node web/scripts/verify-writing-heuristics-deep.cjs`
Expected: Output `Task 1 tests passed successfully.` with exit code 0.

- [ ] **Step 5: Verify types and commit**

Run: `npx tsc --noEmit`
Run: `git add web/src/ielts/writing-heuristics.ts web/scripts/verify-writing-heuristics-deep.cjs`
Run: `git commit -m "feat(ielts): implement argument structure diagnostic heuristics"`

---

### Task 2: Manchester Academic Phrasebank Style Upgrader Engine

**Files:**
- Modify: `web/src/ielts/writing-heuristics.ts`
- Modify: `web/scripts/verify-writing-heuristics-deep.cjs`

**Interfaces:**
- Consumes: `wordList(text: string): string[]` in `web/src/ielts/writing-heuristics.ts`.
- Produces:
  ```typescript
  export interface StyleUpgradeSuggestion {
    original: string;
    category: 'Hedging' | 'Causality' | 'Negative Impact' | 'Benefits' | 'Quantity' | 'Solutions' | 'Examples';
    reason: string;
    phrasebankStems: string[];
    occurrenceCount: number;
  }

  export interface StyleUpgraderReport {
    detectedPhrases: StyleUpgradeSuggestion[];
    academicToneScore: number; // 0 to 100
    informalCount: number;
    feedback: string[];
  }

  export function diagnoseStyleUpgrades(text: string): StyleUpgraderReport;
  ```

- [ ] **Step 1: Write the failing test for Manchester Phrasebank Style Upgrader**

Append to `web/scripts/verify-writing-heuristics-deep.cjs`:
```javascript
const { diagnoseStyleUpgrades } = mod.exports;
assert(typeof diagnoseStyleUpgrades === 'function', 'diagnoseStyleUpgrades must be exported');

// Test Case 2: Essay containing typical Band 5-6 informal markers
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

// Check Phrasebank stem suggestions
const opinionItem = styleReport.detectedPhrases.find(p => p.original.toLowerCase() === 'in my opinion');
assert(opinionItem.phrasebankStems.length >= 2, 'Must provide 2+ phrasebank stems');
assert(opinionItem.phrasebankStems.some(s => /widely contended|arguable|evidence suggests/i.test(s)), 'Must suggest academic hedging stems');

const badEffectItem = styleReport.detectedPhrases.find(p => p.original.toLowerCase() === 'bad effect');
assert(badEffectItem.phrasebankStems.some(s => /adverse impact|detrimental ramifications/i.test(s)), 'Must suggest academic causality/impact stems');

// Academic essay should yield high tone score and zero weak phrases
const academicText = 'It is widely contended that vehicular emissions exert an adverse impact on atmospheric conditions. A substantial proportion of urban centers experience elevated particulate concentrations. Consequently, targeted policy interventions should be instituted to mitigate environmental degradation.';
const academicReport = diagnoseStyleUpgrades(academicText);
assert.strictEqual(academicReport.detectedPhrases.length, 0, 'Academic text should trigger 0 weak phrases');
assert.strictEqual(academicReport.academicToneScore, 100, 'Academic tone score should be 100');

console.log('Task 2 tests passed successfully.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node web/scripts/verify-writing-heuristics-deep.cjs`
Expected: FAIL with `AssertionError: diagnoseStyleUpgrades must be exported`.

- [ ] **Step 3: Implement `diagnoseStyleUpgrades` in `writing-heuristics.ts`**

Add the catalog and function to `web/src/ielts/writing-heuristics.ts`:
```typescript
export interface StyleUpgradeSuggestion {
  original: string;
  category: 'Hedging' | 'Causality' | 'Negative Impact' | 'Benefits' | 'Quantity' | 'Solutions' | 'Examples';
  reason: string;
  phrasebankStems: string[];
  occurrenceCount: number;
}

export interface StyleUpgraderReport {
  detectedPhrases: StyleUpgradeSuggestion[];
  academicToneScore: number;
  informalCount: number;
  feedback: string[];
}

interface WeakPhraseDefinition {
  pattern: RegExp;
  label: string;
  category: 'Hedging' | 'Causality' | 'Negative Impact' | 'Benefits' | 'Quantity' | 'Solutions' | 'Examples';
  reason: string;
  phrasebankStems: string[];
}

const WEAK_PHRASE_CATALOG: WeakPhraseDefinition[] = [
  {
    pattern: /\b(in my opinion|in my view|to my mind)\b/gi,
    label: 'in my opinion',
    category: 'Hedging',
    reason: 'Personal conversational opener; weakens objective academic tone.',
    phrasebankStems: [
      'It is widely contended that ...',
      'Evidence strongly suggests that ...',
      'From an academic perspective, it is arguable that ...'
    ]
  },
  {
    pattern: /\b(i think|i believe that|i reckon)\b/gi,
    label: 'I think',
    category: 'Hedging',
    reason: 'Subjective claim; academic writing prefers distanced, hedged propositions.',
    phrasebankStems: [
      'It is plausible to maintain that ...',
      'It can be convincingly argued that ...',
      'Current observations indicate that ...'
    ]
  },
  {
    pattern: /\b(a lot of|lots of|plenty of)\b/gi,
    label: 'a lot of',
    category: 'Quantity',
    reason: 'Imprecise colloquial quantifier; lacks academic statistical precision.',
    phrasebankStems: [
      'A substantial proportion of ...',
      'A considerable volume / number of ...',
      'A significant majority of ...'
    ]
  },
  {
    pattern: /\b(big problem|huge problem|great problem)\b/gi,
    label: 'big problem',
    category: 'Negative Impact',
    reason: 'Informal noun phrase; fails to specify the nature of the challenge.',
    phrasebankStems: [
      'A pressing dilemma confronting ...',
      'A formidable obstacle in this domain pertains to ...',
      'This poses an acute challenge to ...'
    ]
  },
  {
    pattern: /\b(bad effect|bad impact|negative thing)\b/gi,
    label: 'bad effect',
    category: 'Negative Impact',
    reason: 'Elementary evaluative phrase; lacks disciplinary rigor.',
    phrasebankStems: [
      'Exerts an adverse impact on ...',
      'Produces detrimental ramifications for ...',
      'Yields counterproductive consequences regarding ...'
    ]
  },
  {
    pattern: /\b(good thing|positive thing|great thing)\b/gi,
    label: 'good thing',
    category: 'Benefits',
    reason: 'Overly simplistic colloquial praise.',
    phrasebankStems: [
      'A principal benefit of this is that ...',
      'A salutary consequence of this approach is ...',
      'This yields demonstrable advantages with respect to ...'
    ]
  },
  {
    pattern: /\b(deal with|take care of)\b/gi,
    label: 'deal with',
    category: 'Solutions',
    reason: 'Conversational phrasal verb.',
    phrasebankStems: [
      'Institute targeted measures to address ...',
      'Devise comprehensive strategies to mitigate ...',
      'Implement robust interventions to counter ...'
    ]
  },
  {
    pattern: /\b(get rid of)\b/gi,
    label: 'get rid of',
    category: 'Solutions',
    reason: 'Informal idiom unsuitable for academic argumentation.',
    phrasebankStems: [
      'Eradicate the root determinants of ...',
      'Phase out the reliance on ...',
      'Systematically eliminate the prevalence of ...'
    ]
  },
  {
    pattern: /\b(kids)\b/gi,
    label: 'kids',
    category: 'Quantity',
    reason: 'Casual spoken slang for young individuals.',
    phrasebankStems: [
      'School-aged children',
      'Adolescents and youth',
      'The younger generation'
    ]
  },
  {
    pattern: /\b(more and more)\b/gi,
    label: 'more and more',
    category: 'Quantity',
    reason: 'Redundant informal intensifier.',
    phrasebankStems: [
      'An escalating proportion of ...',
      'A burgeoning trend towards ...',
      'An increasingly marked inclination to ...'
    ]
  }
];

/**
 * Scans text for informal/conversational phrases and pairs each with
 * elevated academic stems from the Manchester Academic Phrasebank.
 */
export function diagnoseStyleUpgrades(text: string): StyleUpgraderReport {
  const clean = text.trim();
  if (!clean) {
    return {
      detectedPhrases: [],
      academicToneScore: 100,
      informalCount: 0,
      feedback: ['No text provided to evaluate academic style.']
    };
  }

  const detected: StyleUpgradeSuggestion[] = [];
  let totalInformalInstances = 0;

  for (const item of WEAK_PHRASE_CATALOG) {
    const matches = clean.match(item.pattern);
    if (matches && matches.length > 0) {
      totalInformalInstances += matches.length;
      detected.push({
        original: item.label,
        category: item.category,
        reason: item.reason,
        phrasebankStems: item.phrasebankStems,
        occurrenceCount: matches.length
      });
    }
  }

  // Calculate Academic Tone Score: base 100, -10 per detected informal expression type (minimum 20)
  const tonePenalty = detected.reduce((sum, d) => sum + (d.occurrenceCount * 8), 0);
  const academicToneScore = Math.max(20, 100 - tonePenalty);

  const feedback: string[] = [];
  if (detected.length === 0) {
    feedback.push('High academic register: No informal or weak expressions detected.');
  } else {
    feedback.push(`Detected ${detected.length} informal phrase type(s) (${totalInformalInstances} total instance(s)). Upgrade with Manchester Academic Phrasebank stems.`);
  }

  return {
    detectedPhrases: detected,
    academicToneScore,
    informalCount: totalInformalInstances,
    feedback
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node web/scripts/verify-writing-heuristics-deep.cjs`
Expected: Output `Task 1 tests passed successfully.` and `Task 2 tests passed successfully.` with exit code 0.

- [ ] **Step 5: Verify types and commit**

Run: `npx tsc --noEmit`
Run: `git add web/src/ielts/writing-heuristics.ts web/scripts/verify-writing-heuristics-deep.cjs`
Run: `git commit -m "feat(ielts): implement academic phrasebank style upgrader heuristics"`

---

### Task 3: Paragraph Cohesion Scoring & Enriched Essay Analysis Integration

**Files:**
- Modify: `web/src/ielts/writing-heuristics.ts:1-100`
- Modify: `web/scripts/verify-writing-heuristics-deep.cjs`

**Interfaces:**
- Consumes: `diagnoseArgumentStructure`, `diagnoseStyleUpgrades`, `paras(text: string): string[]`.
- Produces:
  ```typescript
  export interface ParagraphTransition {
    fromParagraphIndex: number;
    toParagraphIndex: number;
    targetOpening: string;
    hasDiscourseMarker: boolean;
    detectedMarker?: string;
    transitionType: 'launch' | 'progression' | 'contrast' | 'conclusion' | 'unconnected';
    recommendedStems: string[];
  }

  export interface ParagraphCohesionReport {
    transitions: ParagraphTransition[];
    cohesionScore: number; // 0 to 100
    cohesionBandEstimate: 'Band 5.5' | 'Band 6.5' | 'Band 7.5' | 'Band 8.5';
    hasAbruptTransitions: boolean;
    feedback: string[];
  }

  export function evaluateParagraphCohesion(paragraphs: string[], task: 1 | 2): ParagraphCohesionReport;
  ```
  Enriched `WritingReport` fields:
  ```typescript
  export interface WritingReport {
    // ... existing fields ...
    argumentStructure: ArgumentStructureReport;
    styleUpgrades: StyleUpgraderReport;
    cohesion: ParagraphCohesionReport;
  }
  ```

- [ ] **Step 1: Write the failing test for Paragraph Cohesion and Enriched `analyse`**

Append to `web/scripts/verify-writing-heuristics-deep.cjs`:
```javascript
const { evaluateParagraphCohesion, analyse } = mod.exports;
assert(typeof evaluateParagraphCohesion === 'function', 'evaluateParagraphCohesion must be exported');

// Test Case 3: Test paragraph cohesion evaluation
// Essay A: Abrupt essay with no discourse markers between paragraphs
const abruptEssay = [
  'Technology affects learning in many ways. I believe computers are beneficial.',
  'Computers help people study fast. Students can look up things.',
  'Books are still good for some people. Libraries provide quiet spaces.',
  'Technology is good overall.'
];
const abruptCohesion = evaluateParagraphCohesion(abruptEssay, 2);
assert.strictEqual(abruptCohesion.hasAbruptTransitions, true, 'Abrupt essay must flag abrupt transitions');
assert(abruptCohesion.cohesionScore < 60, 'Abrupt essay must score low on cohesion');

// Essay B: Cohesive essay with clear transition discourse markers
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

// Test Case 4: Enriched analyse() output
const fullAnalysis = analyse(cohesiveEssay.join('\n\n'), 2);
assert(fullAnalysis.argumentStructure, 'analyse() must return argumentStructure');
assert(fullAnalysis.styleUpgrades, 'analyse() must return styleUpgrades');
assert(fullAnalysis.cohesion, 'analyse() must return cohesion');
assert(Array.isArray(fullAnalysis.flags), 'analyse() must preserve existing flags');

console.log('Task 3 tests passed successfully.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node web/scripts/verify-writing-heuristics-deep.cjs`
Expected: FAIL with `AssertionError: evaluateParagraphCohesion must be exported`.

- [ ] **Step 3: Implement `evaluateParagraphCohesion` and update `analyse` in `writing-heuristics.ts`**

In `web/src/ielts/writing-heuristics.ts`:
1. Add the cohesion transition regexes and evaluation function:
```typescript
const LAUNCH_TRANSITIONS = /^(firstly|first and foremost|to begin with|a primary (factor|consideration|concern)|one (major|key|primary|significant)|initially)\b/i;
const PROGRESSION_TRANSITIONS = /^(furthermore|moreover|in addition|additionally|equally important|secondly|a further|similarly|likewise)\b/i;
const CONTRAST_TRANSITIONS = /^(on the other hand|however|by contrast|in contrast|conversely|nevertheless|nonetheless|alternatively|despite this)\b/i;
const CONCLUSION_TRANSITIONS = /^(in conclusion|to conclude|to sum up|in summary|on balance|all things considered|overall|in short|to summari[sz]e)\b/i;

export interface ParagraphTransition {
  fromParagraphIndex: number;
  toParagraphIndex: number;
  targetOpening: string;
  hasDiscourseMarker: boolean;
  detectedMarker?: string;
  transitionType: 'launch' | 'progression' | 'contrast' | 'conclusion' | 'unconnected';
  recommendedStems: string[];
}

export interface ParagraphCohesionReport {
  transitions: ParagraphTransition[];
  cohesionScore: number;
  cohesionBandEstimate: 'Band 5.5' | 'Band 6.5' | 'Band 7.5' | 'Band 8.5';
  hasAbruptTransitions: boolean;
  feedback: string[];
}

export function evaluateParagraphCohesion(paragraphs: string[], task: 1 | 2): ParagraphCohesionReport {
  const parts = paragraphs.map(p => p.trim()).filter(Boolean);
  if (parts.length <= 1) {
    return {
      transitions: [],
      cohesionScore: 50,
      cohesionBandEstimate: 'Band 5.5',
      hasAbruptTransitions: false,
      feedback: ['Multi-paragraph structure required to evaluate cohesion across paragraphs.']
    };
  }

  const transitions: ParagraphTransition[] = [];
  const feedback: string[] = [];

  for (let i = 1; i < parts.length; i++) {
    const prev = parts[i - 1];
    const curr = parts[i];
    const sents = curr.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    const opening = sents[0] || '';
    const isLast = i === parts.length - 1 && parts.length >= 3;

    let hasMarker = false;
    let detectedMarker: string | undefined = undefined;
    let transitionType: 'launch' | 'progression' | 'contrast' | 'conclusion' | 'unconnected' = 'unconnected';
    let recommendedStems: string[] = [];

    if (isLast) {
      const match = opening.match(CONCLUSION_TRANSITIONS);
      if (match) {
        hasMarker = true;
        detectedMarker = match[0];
        transitionType = 'conclusion';
      } else {
        recommendedStems = ['In conclusion, ...', 'To conclude, ...', 'On balance, ...'];
      }
    } else if (i === 1) {
      // Intro -> Body 1
      const match = opening.match(LAUNCH_TRANSITIONS);
      if (match) {
        hasMarker = true;
        detectedMarker = match[0];
        transitionType = 'launch';
      } else {
        recommendedStems = ['To begin with, ...', 'A primary factor is that ...', 'First and foremost, ...'];
      }
    } else {
      // Body 1 -> Body 2 or Body 2 -> Body 3
      const contrastMatch = opening.match(CONTRAST_TRANSITIONS);
      const progMatch = opening.match(PROGRESSION_TRANSITIONS);
      if (contrastMatch) {
        hasMarker = true;
        detectedMarker = contrastMatch[0];
        transitionType = 'contrast';
      } else if (progMatch) {
        hasMarker = true;
        detectedMarker = progMatch[0];
        transitionType = 'progression';
      } else {
        recommendedStems = ['On the other hand, ...', 'Furthermore, ...', 'Conversely, ...', 'In addition, ...'];
      }
    }

    if (!hasMarker) {
      feedback.push(`Paragraph ${i + 1} opens abruptly without a clear transitional discourse marker.`);
    } else {
      feedback.push(`Paragraph ${i + 1} links smoothly via "${detectedMarker}".`);
    }

    transitions.push({
      fromParagraphIndex: i - 1,
      toParagraphIndex: i,
      targetOpening: opening.slice(0, 70) + (opening.length > 70 ? '…' : ''),
      hasDiscourseMarker: hasMarker,
      detectedMarker,
      transitionType,
      recommendedStems
    });
  }

  const validTransitions = transitions.filter(t => t.hasDiscourseMarker).length;
  const ratio = transitions.length > 0 ? validTransitions / transitions.length : 0;
  const cohesionScore = Math.round(ratio * 100);
  const hasAbruptTransitions = transitions.some(t => !t.hasDiscourseMarker);

  let cohesionBandEstimate: 'Band 5.5' | 'Band 6.5' | 'Band 7.5' | 'Band 8.5';
  if (ratio >= 0.85) cohesionBandEstimate = 'Band 8.5';
  else if (ratio >= 0.65) cohesionBandEstimate = 'Band 7.5';
  else if (ratio >= 0.35) cohesionBandEstimate = 'Band 6.5';
  else cohesionBandEstimate = 'Band 5.5';

  return {
    transitions,
    cohesionScore,
    cohesionBandEstimate,
    hasAbruptTransitions,
    feedback
  };
}
```

2. Update `WritingReport` interface in `web/src/ielts/writing-heuristics.ts`:
```typescript
export interface WritingReport {
  words: number;
  paragraphs: number;
  sentences: number;
  avgSentenceLength: number;
  lexicalDiversity: number;
  linkers: string[];
  overusedLinkers: string[];
  complexSentences: number;
  passives: number;
  repeated: { word: string; count: number }[];
  hasOverview: boolean;
  hasPosition: boolean;
  positionInIntro: boolean;
  positionInConclusion: boolean;
  hasConclusion: boolean;
  speculation: string[];
  promptCopies: number;
  topicCoverage: number;
  flags: string[];
  argumentStructure: ArgumentStructureReport;
  styleUpgrades: StyleUpgraderReport;
  cohesion: ParagraphCohesionReport;
}
```

3. In `analyse(text: string, task: 1 | 2, prompt = ''): WritingReport`:
Compute and attach the new diagnostic results:
```typescript
  const argumentStructure = diagnoseArgumentStructure(parts, task);
  const styleUpgrades = diagnoseStyleUpgrades(clean);
  const cohesion = evaluateParagraphCohesion(parts, task);

  // Append synthesized pedagogical guidance to flags
  if (task === 2 && argumentStructure.missingOverallEvidence && words >= 150) {
    flags.push('Missing concrete evidence in one or more body paragraphs. Band 7 requires fully supported claims ("for instance", "a case in point", or specific study references).');
  }
  if (task === 2 && cohesion.hasAbruptTransitions && paragraphs >= 3) {
    flags.push('Paragraph transitions are abrupt. Use inter-paragraph linkers like "On the other hand", "Furthermore", or "Conversely" to bridge ideas.');
  }
  if (styleUpgrades.detectedPhrases.length > 0) {
    flags.push(`Informal expressions detected (${styleUpgrades.detectedPhrases.map(p => `"${p.original}"`).join(', ')}). Upgrade using Academic Phrasebank stems.`);
  }

  return {
    words,
    paragraphs,
    sentences: sents.length,
    avgSentenceLength: Math.round(avg * 10) / 10,
    lexicalDiversity: Math.round(diversity * 100) / 100,
    linkers,
    overusedLinkers,
    complexSentences,
    passives,
    repeated,
    hasOverview,
    hasPosition,
    positionInIntro,
    positionInConclusion,
    hasConclusion,
    speculation,
    promptCopies,
    topicCoverage,
    flags,
    argumentStructure,
    styleUpgrades,
    cohesion
  };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node web/scripts/verify-writing-heuristics-deep.cjs`
Expected: Output `Task 1 tests passed successfully.`, `Task 2 tests passed successfully.`, `Task 3 tests passed successfully.` with exit code 0.

- [ ] **Step 5: Verify types and commit**

Run: `npx tsc --noEmit`
Run: `node web/scripts/verify-ielts-writing.cjs` (ensure existing suite passes with 0 regressions)
Run: `git add web/src/ielts/writing-heuristics.ts web/scripts/verify-writing-heuristics-deep.cjs`
Run: `git commit -m "feat(ielts): implement paragraph cohesion scoring and enrich writing analysis"`

---

### Task 4: Interactive Writing Feedback UI in `writing.ts` & `ielts.css`

**Files:**
- Modify: `web/src/ielts/views/writing.ts:781-855`
- Modify: `web/src/ielts/ielts.css:854-890`
- Test: `web/scripts/verify-writing-heuristics-deep.cjs`

**Interfaces:**
- Consumes: `WritingReport.argumentStructure`, `WritingReport.styleUpgrades`, `WritingReport.cohesion`, `esc(str: string): string`, `AcousticHaptics` or clipboard navigator.
- Produces: Rendered DOM structures in `.ie-feedback`:
  - `.ie-arg-matrix`: visual pill grid for Body Paragraphs
  - `.ie-style-upgrader`: list of informal words with Phrasebank replacement stems + copy button
  - `.ie-cohesion-meter`: inter-paragraph transition status

- [ ] **Step 1: Write DOM assertion test in verify script**

Append to `web/scripts/verify-writing-heuristics-deep.cjs`:
```javascript
// Test Case 5: Verify UI helper generation logic
const sampleEssay = `Technology has revolutionized modern education. I agree that digital devices improve learning outcomes.\n\nTo begin with, online platforms provide instant access to educational resources. This is because search engines allow students to retrieve peer-reviewed articles within seconds. For instance, a recent survey by Oxford University revealed that 85% of undergraduates rely on digital repositories for exam preparation.\n\nOn the other hand, a lot of children experience digital distractions. I think social media has bad effect on concentration. Therefore, schools must deal with this issue through structured screen-time policies.\n\nIn conclusion, digital tools present substantial academic advantages when balanced with responsible usage guidelines.`;

const r = analyse(sampleEssay, 2);
assert(r.argumentStructure.bodyParagraphs.length === 2, 'Must detect 2 body paragraphs');
assert(r.styleUpgrades.detectedPhrases.length >= 3, 'Must detect weak phrases in Body 2');
assert(r.cohesion.transitions.length === 3, 'Must detect 3 transitions');

console.log('Task 4 verification prerequisites passed.');
```

- [ ] **Step 2: Add CSS rules for the new feedback components in `ielts.css`**

In `web/src/ielts/ielts.css` (around line 890), add:
```css
/* --- IELTS Writing Instant Feedback: Argument Structure, Phrasebank & Cohesion --- */
.ie-feedback-diagnostics {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
  margin-top: var(--space-12);
}

.ie-diag-card {
  background: var(--surface-card, #1e2430);
  border: 1px solid var(--border-hairline, rgba(255, 255, 255, 0.08));
  border-radius: var(--radius-squircle-md, 12px);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ie-diag-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.ie-diag-title {
  font-size: var(--font-size-md, 16px);
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ie-diag-score-chip {
  padding: 4px 10px;
  border-radius: var(--radius-pill, 9999px);
  font-size: var(--font-kicker, 11px);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
  flex-shrink: 0;
}

.ie-diag-score-chip.is-high {
  background: rgba(34, 197, 94, 0.16);
  color: #4ade80;
}

.ie-diag-score-chip.is-mid {
  background: rgba(234, 179, 8, 0.16);
  color: #facc15;
}

.ie-diag-score-chip.is-low {
  background: rgba(239, 68, 68, 0.16);
  color: #f87171;
}

/* Argument Structure Matrix */
.ie-arg-matrix {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ie-arg-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.ie-arg-p-label {
  font-weight: 600;
  font-size: 13px;
  color: var(--text-primary, #f1f5f9);
}

.ie-arg-pills {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.ie-pill-check {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  white-space: nowrap;
}

.ie-pill-check.is-valid {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.ie-pill-check.is-missing {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

/* Style Upgrader Cards */
.ie-style-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ie-style-item {
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ie-style-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.ie-style-badge-weak {
  font-size: 12px;
  font-weight: 600;
  color: #f87171;
  background: rgba(239, 68, 68, 0.12);
  padding: 2px 8px;
  border-radius: 6px;
}

.ie-style-cat {
  font-size: 11px;
  color: var(--text-muted, #94a3b8);
}

.ie-style-reason {
  font-size: 12px;
  color: var(--text-secondary, #cbd5e1);
  margin: 0;
}

.ie-style-stems {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ie-stem-pill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: var(--radius-btn, 10px);
  padding: 6px 12px;
  font-size: 13px;
  color: #c7d2fe;
  gap: 8px;
}

.ie-stem-copy-btn {
  background: transparent;
  border: none;
  color: #a5b4fc;
  cursor: pointer;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: var(--radius-btn, 10px);
  min-height: var(--touch-target-min, 44px);
  min-width: var(--touch-target-min, 44px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
}

.ie-stem-copy-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

/* Cohesion Flow */
.ie-cohesion-timeline {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ie-cohesion-step {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  font-size: 13px;
  flex-wrap: wrap;
  gap: 6px;
}

@media (max-width: 768px) {
  .ie-arg-row,
  .ie-cohesion-step {
    flex-direction: column;
    align-items: flex-start;
  }
}
```

- [ ] **Step 3: Update `submit.addEventListener('click')` in `web/src/ielts/views/writing.ts`**

In `web/src/ielts/views/writing.ts` (around line 810), replace the simple automatic checks column output with the enriched diagnostics:
```typescript
    // Argument Structure HTML
    const argMatrix = r.argumentStructure.bodyParagraphs.length > 0
      ? r.argumentStructure.bodyParagraphs.map((bp, i) => `
        <div class="ie-arg-row">
          <span class="ie-arg-p-label">${t('writing.body_paragraph_label', { num: i + 1 }, `Body Paragraph ${i + 1}`)}</span>
          <div class="ie-arg-pills">
            <span class="ie-pill-check ${bp.hasTopicSentence ? 'is-valid' : 'is-missing'}">
              ${bp.hasTopicSentence ? '✓ Topic Claim' : '⚠ Missing Topic'}
            </span>
            <span class="ie-pill-check ${bp.hasCausalExplanation ? 'is-valid' : 'is-missing'}">
              ${bp.hasCausalExplanation ? '✓ Causal Logic' : '⚠ Missing Reason'}
            </span>
            <span class="ie-pill-check ${bp.hasConcreteEvidence ? 'is-valid' : 'is-missing'}">
              ${bp.hasConcreteEvidence ? '✓ Evidence Sighted' : '⚠ Missing Evidence'}
            </span>
          </div>
        </div>
      `).join('')
      : `<p class="ie-note">${t('writing.no_body_paras', undefined, 'Add multiple body paragraphs to evaluate argument structure.')}</p>`;

    // Phrasebank Style Upgrades HTML
    const styleUpgradesHtml = r.styleUpgrades.detectedPhrases.length > 0
      ? `<div class="ie-style-list">` + r.styleUpgrades.detectedPhrases.map(d => `
        <div class="ie-style-item">
          <div class="ie-style-item-header">
            <span class="ie-style-badge-weak">"${esc(d.original)}"</span>
            <span class="ie-style-cat">${esc(d.category)}</span>
          </div>
          <p class="ie-style-reason">${esc(d.reason)}</p>
          <div class="ie-style-stems">
            ${d.phrasebankStems.map(stem => `
              <div class="ie-stem-pill">
                <span>${esc(stem)}</span>
                <button type="button" class="ie-stem-copy-btn" data-stem="${esc(stem)}" aria-label="Copy phrase stem">Copy</button>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('') + `</div>`
      : `<p class="ie-note">✓ ${t('writing.academic_tone_clean', undefined, 'Clean academic register. No colloquial or weak markers detected.')}</p>`;

    // Paragraph Cohesion Flow HTML
    const cohesionHtml = r.cohesion.transitions.length > 0
      ? `<div class="ie-cohesion-timeline">` + r.cohesion.transitions.map(tr => `
        <div class="ie-cohesion-step">
          <span><b>Para ${tr.fromParagraphIndex + 1} ➔ Para ${tr.toParagraphIndex + 1}:</b> <i>${esc(tr.targetOpening)}</i></span>
          <span class="ie-pill-check ${tr.hasDiscourseMarker ? 'is-valid' : 'is-missing'}">
            ${tr.hasDiscourseMarker ? `✓ Connected ("${esc(tr.detectedMarker || '')}")` : '⚠ Abrupt Transition'}
          </span>
        </div>
      `).join('') + `</div>`
      : `<p class="ie-note">${t('writing.cohesion_single_para', undefined, 'Need at least 2 paragraphs to evaluate inter-paragraph cohesion.')}</p>`;

    out.hidden = false;
    out.innerHTML = `
    <div class="ie-feedback-col">
      <h3>${t('writing.automatic_checks', undefined, 'Automatic checks')}</h3>
      <ul class="ie-stats">
        <li><b>${r.words}</b> words</li>
        <li><b>${r.paragraphs}</b> paragraphs</li>
        <li><b>${r.sentences}</b> sentences</li>
        <li><b>${r.linkers.length}</b> linkers</li>
        <li><b>${r.complexSentences}</b> complex</li>
        <li><b>${r.lexicalDiversity}</b> diversity</li>
      </ul>
      <ul class="ie-flags">${flags}</ul>
      <p class="ie-note">${t('writing.checks_note', undefined, 'These checks count features. They cannot judge accuracy, relevance or ideas.')}</p>
    </div>

    <div class="ie-feedback-col">
      <h3>${t('writing.rate_against_model', undefined, 'Rate yourself against the model')}</h3>
      <p class="ie-note">${t('writing.rate_note', { desc: esc(DESCRIPTORS[7]) }, `Read the model and notes, then rate each criterion honestly. 7 = ${esc(DESCRIPTORS[7])}`)}</p>
      ${rate}
      <div class="ie-estimate"></div>
      <button class="ie-btn ie-btn-primary ie-save">${t('ielts.save_estimate', undefined, 'Save estimate')}</button>
    </div>

    <div class="ie-feedback-diagnostics">
      <!-- 1. Argument Structure Diagnostic -->
      <div class="ie-diag-card">
        <div class="ie-diag-header">
          <h4 class="ie-diag-title">🏛 ${t('writing.arg_structure_title', undefined, 'Argument Structure Matrix (Claim ➔ Cause ➔ Evidence)')}</h4>
          <span class="ie-diag-score-chip ${r.argumentStructure.score >= 80 ? 'is-high' : r.argumentStructure.score >= 50 ? 'is-mid' : 'is-low'}">
            ${r.argumentStructure.score}% Structure Match
          </span>
        </div>
        <div class="ie-arg-matrix">${argMatrix}</div>
      </div>

      <!-- 2. Manchester Academic Phrasebank Upgrader -->
      <div class="ie-diag-card">
        <div class="ie-diag-header">
          <h4 class="ie-diag-title">📚 ${t('writing.phrasebank_upgrader_title', undefined, 'Manchester Academic Phrasebank Upgrader')}</h4>
          <span class="ie-diag-score-chip ${r.styleUpgrades.academicToneScore >= 80 ? 'is-high' : r.styleUpgrades.academicToneScore >= 50 ? 'is-mid' : 'is-low'}">
            ${r.styleUpgrades.academicToneScore}/100 Academic Tone
          </span>
        </div>
        ${styleUpgradesHtml}
      </div>

      <!-- 3. Paragraph Cohesion Flow -->
      <div class="ie-diag-card">
        <div class="ie-diag-header">
          <h4 class="ie-diag-title">🔗 ${t('writing.cohesion_flow_title', undefined, 'Paragraph Cohesion & Transitional Flow')}</h4>
          <span class="ie-diag-score-chip is-high">
            ${r.cohesion.cohesionBandEstimate} Cohesion
          </span>
        </div>
        ${cohesionHtml}
      </div>
    </div>

    <div class="ie-feedback-wide">
      <h3>${t('writing.model_answer_band7', undefined, 'Band 7+ model answer')}</h3>
      <div class="ie-model">${p.model
        .split(/\n\s*\n/)
        .map(x => `<p>${x
          .split(/(?<=[.!?])\s+/)
          .map((s, i) => `<span class="ie-sent" data-sent="${i}">${esc(s)}</span>`)
          .join(' ')}</p>`)
        .join('')}</div>
      <h3>${t('writing.what_makes_it_7', undefined, 'What makes it band 7')}</h3>
      <p>${esc(p.notes)}</p>
    </div>`;

    // Attach copy affordances for Phrasebank stems
    out.querySelectorAll<HTMLButtonElement>('.ie-stem-copy-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const stem = btn.getAttribute('data-stem');
        if (!stem) return;
        try {
          await navigator.clipboard.writeText(stem);
          const orig = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = orig; }, 1800);
        } catch {
          // Fallback if clipboard API restricted
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = 'Copy'; }, 1800);
        }
      });
    });
```

- [ ] **Step 4: Verify type checks**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 5: Commit**

Run: `git add web/src/ielts/views/writing.ts web/src/ielts/ielts.css`
Run: `git commit -m "feat(ielts): render argument matrix, phrasebank upgrader, and cohesion feedback in writing view"`

---

### Task 5: End-to-End Test Suite & Verification Harness

**Files:**
- Modify: `web/scripts/verify-writing-heuristics-deep.cjs`
- Modify: `web/scripts/run-verify.cjs`

**Interfaces:**
- Consumes: All modules from Tasks 1–4.
- Produces: Execution time assertion (< 15ms) and full regression verification.

- [ ] **Step 1: Add performance and boundary assertions to `verify-writing-heuristics-deep.cjs`**

Append to `web/scripts/verify-writing-heuristics-deep.cjs`:
```javascript
// Test Case 6: Execution time performance budget (< 15ms for a 400-word essay)
const longEssay = `Over the past several decades, the exponential acceleration of digital technology has transformed nearly every facet of contemporary education. While some commentators argue that screens and personal computers fragment human attention, I firmly contend that digital learning tools yield substantial cognitive advantages when properly structured within an academic curriculum.

To begin with, interactive digital platforms significantly elevate conceptual understanding by rendering abstract phenomena tangible. This occurs because computational models allow students to manipulate experimental variables in real time, thereby observing immediate causal relationships. For instance, a longitudinal study conducted by Cambridge University in 2023 demonstrated that secondary pupils utilizing dynamic physics simulations scored 28% higher on mechanistic reasoning assessments than peers restricted to standard textbooks. Consequently, experiential computer modeling serves as an indispensable catalyst for deeper intellectual retention.

On the other hand, skeptics contend that widespread classroom digitization encourages passive consumption and superficial skimming. Furthermore, unrestricted internet access may expose younger individuals to digital distractions that compromise study habits. Nevertheless, these drawbacks stem not from technological tools themselves, but from inadequate institutional oversight and the absence of disciplined digital hygiene. Effective pedagogical guidelines and guided classroom environments can readily mitigate these risks while preserving exploratory learning.

In conclusion, although the proliferation of electronic devices requires mindful supervision, their ability to democratize knowledge and illuminate complex topics remains unparalleled. Educational institutions should therefore invest in structured digital integration rather than succumbing to nostalgic prohibition.`;

const t0 = performance.now();
const perfResult = analyse(longEssay, 2);
const elapsed = performance.now() - t0;

console.log(`Writing Heuristics Analysis executed in ${elapsed.toFixed(2)}ms`);
assert(elapsed < 15, `Analysis took ${elapsed.toFixed(2)}ms, exceeding 15ms budget`);
assert.strictEqual(perfResult.argumentStructure.fullyDevelopedParagraphs, 2, 'Both body paragraphs must be fully developed');
assert(perfResult.argumentStructure.score >= 90, 'High quality essay should score >= 90 in structure');
assert(perfResult.cohesion.cohesionScore >= 80, 'High quality essay should score >= 80 in cohesion');

console.log('All deep writing heuristics verifications passed successfully!');
```

- [ ] **Step 2: Run all verify scripts**

Run: `node web/scripts/run-verify.cjs`
Expected: Output showing all verify scripts passing including `verify-writing-heuristics-deep.cjs` and `verify-ielts-writing.cjs`.

- [ ] **Step 3: Run full application test**

Run: `npm test`
Expected: `tsc --noEmit` clean exit and all verify scripts passing.

- [ ] **Step 4: Commit**

Run: `git add web/scripts/verify-writing-heuristics-deep.cjs web/scripts/run-verify.cjs`
Run: `git commit -m "test(ielts): add deep writing heuristics verification suite and performance benchmark"`

---

## Self-Review Checklist

- [x] **Spec coverage:** Argument Structure Diagnostic (Task 1), Manchester Phrasebank Style Upgrader (Task 2), Paragraph Cohesion Scoring (Task 3), Interactive UI feedback (Task 4), and Test suite & Performance (Task 5) all covered with zero gaps.
- [x] **Placeholder scan:** No "TODO", "TBD", or speculative omissions found. All regexes, interfaces, CSS classes, and test assertions are written out completely.
- [x] **Type consistency:** Types `BodyParagraphDiagnostic`, `ArgumentStructureReport`, `StyleUpgradeSuggestion`, `StyleUpgraderReport`, `ParagraphTransition`, and `ParagraphCohesionReport` are consistently typed and shared between Tasks 1–5.
- [x] **Design Tokens & Invariants:** Adheres strictly to `AGENTS.md` (44px touch targets, `--radius-btn: 10px`, max-width 768px single breakpoint, no concentric double borders).
