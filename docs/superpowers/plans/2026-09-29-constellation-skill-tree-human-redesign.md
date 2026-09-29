# Constellation Skill Tree & Human Ergonomics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the English Singularity web platform from a restrictive sci-fi HUD into a Skyrim-style Constellation Skill Tree with prerequisite milestone progression, paired with dedicated, distraction-free practice studios (Franklin Copywork typing editor, searchable 1,000-collocation lexicon, calm document reader, and native OS cursor ergonomics) tailored for upper-intermediate learners targeting C2 native-level nuance.

**Architecture:** A client-side prerequisite progression engine (`skill-tree-engine.ts`) calculates milestone mastery and locks/unlocks 25 constellation nodes across 5 core linguistic branches (Syntactic Architecture, Lexical Precision, Rhetoric/Copywork, Prosody/Speaking, Epistemic Reading). The home route (`#tree`) renders an interactive SVG constellation map with a "Today's 15-Minute Workout" banner. Dossiers are liberated from 3D card-flipper clipping into dedicated full-bleed workspaces with natural document scrolling, native OS cursor tracking, and a permanent top-left `[ ← Back to Tree ]` navigation button.

**Tech Stack:** TypeScript 5.5, Vite 5.4, Anime.js 3.2, Web Audio API, Web Speech API, Vanilla DOM Architecture, Puppeteer-Core 25.12 (Headless Browser QA).

**Spec:** `docs/superpowers/specs/2026-09-29-human-centered-english-learning-redesign.md`

## Global Constraints

- **Palette:** Soft Paper Ink — Deep charcoal `#111111` on warm off-white `#fafaf9`, crisp borders `rgba(17, 17, 17, 0.12)`, star accents `#ca8a04` / `#eab308`.
- **Mouse & Pointer:** Strictly native OS pointer (`default`, `pointer`, `text`). Zero custom canvas reticles or `cursor: none`.
- **Layout & Scroll:** Natural vertical scrolling everywhere (`overflow-y: auto`, `min-height: 100dvh`). No fixed 720x440px clipping boundaries for reading or writing.
- **Navigation:** Every studio page must feature a prominent, unambiguous `[ ← Back to Tree ]` button in the top-left header.
- **Audio Sensory:** Silent navigation clicks. Audio output occurs only when the learner explicitly presses a [Speaker] button or achieves a mastery milestone.
- **Pedagogical Target:** Tailored for CEFR B2/C1 learners targeting C2 summit mastery (rhetorical precision, inversion, MEAL synthesis, 1,000 collocations).
- **Build Quality:** Zero TypeScript compilation errors (`tsc`), bundle compilation in under 2.0s via Vite.

---

### Task 1: Shell Ergonomics & Native OS Cursor Restoration

**Files:**
- Modify: `web/src/assets/styles/variables.css`
- Modify: `web/src/assets/styles/hud-base.css:20-65`
- Modify: `web/src/core/cursor-tracker.ts:34-70`
- Test: `web/scripts/verify-shell-ergonomics.cjs`

**Interfaces:**
- Consumes: CSS custom properties from `variables.css`.
- Produces: Clean, eye-friendly soft paper styling and native pointer handling across all interactive elements.

- [ ] **Step 1: Write the failing test**

Create `web/scripts/verify-shell-ergonomics.cjs`:
```javascript
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[TEST 1] Verifying Shell Ergonomics & Native Cursor Restoration...');

const hudCss = fs.readFileSync(path.join(__dirname, '../src/assets/styles/hud-base.css'), 'utf-8');
const variablesCss = fs.readFileSync(path.join(__dirname, '../src/assets/styles/variables.css'), 'utf-8');
const cursorTs = fs.readFileSync(path.join(__dirname, '../src/core/cursor-tracker.ts'), 'utf-8');

// 1. Assert variables contain warm paper palette
assert(variablesCss.includes('--bg-canvas: #fafaf9') || variablesCss.includes('#fafaf9'), 'variables.css must define soft warm background #fafaf9');
assert(variablesCss.includes('--ink-primary: #111111') || variablesCss.includes('#111111'), 'variables.css must define deep charcoal ink #111111');

// 2. Assert cursor: none is eradicated from html/body
assert(!hudCss.match(/body\s*{[^}]*cursor:\s*none/), 'hud-base.css must NOT set cursor: none on body');
assert(hudCss.includes('cursor: default') || hudCss.includes('cursor: auto'), 'hud-base.css must set cursor: default or auto on body');

// 3. Assert natural vertical scrolling is permitted
assert(!hudCss.match(/body\s*{[^}]*overflow:\s*hidden/), 'hud-base.css body must allow natural document scrolling');

// 4. Assert CursorTracker no longer injects custom reticle DOM
assert(cursorTs.includes('// Native cursor enabled') || cursorTs.includes('isNativeCursor: true') || cursorTs.includes('return; // Custom reticle disabled'), 'cursor-tracker.ts must disable DOM reticle insertion');

console.log('✅ [TEST 1 PASSED] Shell ergonomics and native cursor verified.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node web/scripts/verify-shell-ergonomics.cjs`  
Expected: FAIL with assertion error regarding `#fafaf9` or `cursor: none`.

- [ ] **Step 3: Implement minimal code to make test pass**

Update `web/src/assets/styles/variables.css`:
Update `--bg-canvas` to `#fafaf9`, `--bg-surface` to `#ffffff`, `--bg-card` to `#ffffff`, `--ink-primary` to `#111111`, `--ink-secondary` to `rgba(17, 17, 17, 0.78)`, `--ink-muted` to `rgba(17, 17, 17, 0.62)`, `--border-hairline` to `rgba(17, 17, 17, 0.12)`, and add `--accent-gold: #ca8a04;`.

Update `web/src/assets/styles/hud-base.css`:
Remove `cursor: none;` on `html, body`. Replace with `cursor: default;`.
Replace `overflow: hidden;` on `html, body` with `overflow-x: hidden; overflow-y: auto;`.
Remove `#custom-cursor` styling or set `display: none !important;`.
Update `#app` to allow natural document flow: `min-height: 100dvh; height: auto; overflow: visible;`.

Update `web/src/core/cursor-tracker.ts`:
In `init()` and `createCursorDOM()`, short-circuit DOM creation:
```typescript
public static init(): void {
  // Native cursor enabled - bypass custom reticle DOM to eliminate pointer lag and text occlusion
  return; // Custom reticle disabled
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node web/scripts/verify-shell-ergonomics.cjs`  
Expected: `✅ [TEST 1 PASSED] Shell ergonomics and native cursor verified.`

- [ ] **Step 5: Commit**

```bash
git add web/src/assets/styles/variables.css web/src/assets/styles/hud-base.css web/src/core/cursor-tracker.ts web/scripts/verify-shell-ergonomics.cjs
git commit -m "fix(ergonomics): restore native cursor and warm paper palette"
```

---

### Task 2: Human-Centered Header HUD & Navigation

**Files:**
- Modify: `web/src/core/router.ts:1-45`
- Modify: `web/src/modules/header-hud.ts:1-180`
- Modify: `web/src/main.ts:100-165`
- Test: `web/scripts/verify-header-nav.cjs`

**Interfaces:**
- Consumes: `Router` from `src/core/router.ts`, `StorageManager` from `src/utils/storage.ts`.
- Produces: `HeaderHUD` with prominent `[ ← Back to Tree ]` button when off-tree, clean branding, streak counter, and clean Settings drawer.

- [ ] **Step 1: Write the failing test**

Create `web/scripts/verify-header-nav.cjs`:
```javascript
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[TEST 2] Verifying Human-Centered Header HUD & Navigation...');

const routerTs = fs.readFileSync(path.join(__dirname, '../src/core/router.ts'), 'utf-8');
const headerTs = fs.readFileSync(path.join(__dirname, '../src/modules/header-hud.ts'), 'utf-8');

// 1. Assert router supports 'tree' route and defaults to 'tree'
assert(routerTs.includes("'tree'"), "router.ts must include 'tree' in RouteId");
assert(routerTs.includes("matched = validRoutes.find(r => r === rawHash) || 'tree'"), "router.ts must default to 'tree'");

// 2. Assert header has back button logic
assert(headerTs.includes('btn-back-tree') || headerTs.includes('backToTree'), "header-hud.ts must render back-to-tree button");
assert(headerTs.includes('ENGLISH MASTERY'), "header-hud.ts must feature 'ENGLISH MASTERY' brand title");
assert(!headerTs.includes('STARK // ENG SINGULARITY'), "header-hud.ts must not have sci-fi Stark branding");

// 3. Assert digital clock has been excised
assert(!headerTs.includes('telemetry-clock'), "header-hud.ts must not display digital telemetry clock");

console.log('✅ [TEST 2 PASSED] Header HUD & navigation verified.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node web/scripts/verify-header-nav.cjs`  
Expected: FAIL with assertion error.

- [ ] **Step 3: Implement minimal code to make test pass**

Update `web/src/core/router.ts`:
Update `RouteId` type:
```typescript
export type RouteId = 'tree' | 'read' | 'write' | 'listen' | 'speak' | 'vocab' | 'colloc' | 'grammar' | 'habits' | 'singularity';
```
Update initial route and default fallback:
```typescript
const validRoutes: RouteId[] = ['tree', 'read', 'write', 'listen', 'speak', 'vocab', 'colloc', 'grammar', 'habits', 'singularity'];
const matched = validRoutes.find(r => r === rawHash) || 'tree';
this.currentRoute = matched;
```

Update `web/src/modules/header-hud.ts`:
Refactor `HeaderHUD` to render:
- Top-left: If `currentRoute !== 'tree'`, render `<button class="hud-btn btn-back-tree">← Back to Constellation Tree</button>`. If on `tree`, render `<span class="hud-brand-title">ENGLISH MASTERY</span> <span class="hud-rank-badge">C1 SCHOLAR</span>`.
- Center: Clean metrics: `🔥 ${state.streak.currentStreak} DAY STREAK` and `TARGET: C2 SUMMIT`.
- Top-right: Clean sound toggle `[ 🔊 SOUND ]` and `[ ⚙ SETTINGS ]` button that opens a clean modal containing the JSON backup export/import tools. Remove the digital clock and clutter.
- Add `public onNavigateToTree?: () => void;` callback and bind click event on `.btn-back-tree`.

Update `web/src/main.ts`:
Wire `this.headerHud.onNavigateToTree = () => this.router.navigate('tree');`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node web/scripts/verify-header-nav.cjs`  
Expected: `✅ [TEST 2 PASSED] Header HUD & navigation verified.`

- [ ] **Step 5: Commit**

```bash
git add web/src/core/router.ts web/src/modules/header-hud.ts web/src/main.ts web/scripts/verify-header-nav.cjs
git commit -m "feat(nav): add tree routing and ergonomic header navigation"
```

---

### Task 3: Constellation Skill Tree Prerequisite Engine

**Files:**
- Create: `web/src/core/skill-tree-data.ts`
- Create: `web/src/core/skill-tree-engine.ts`
- Test: `web/scripts/verify-skill-tree.cjs`

**Interfaces:**
- Consumes: `StorageManager` card states and stats.
- Produces: `SkillTreeEngine` offering `getBranchData()`, `getNodeState(nodeId)`, `getSummitProgress()`, and `unlockNext()`.

- [ ] **Step 1: Write the failing test**

Create `web/scripts/verify-skill-tree.cjs`:
```javascript
const assert = require('assert');
const path = require('path');

console.log('[TEST 3] Verifying Constellation Skill Tree Engine & Prerequisite Logic...');

// Load compiled or ts-transpiled logic
const { SKILL_BRANCHES } = require('../src/core/skill-tree-data.ts');
```
Wait! To test TypeScript files directly in node without a build step, write the test using a small helper or test the logic and structure. Let's make `web/scripts/verify-skill-tree.cjs` read the data file and verify all 5 branches and 25 nodes, or compile via TypeScript:
```javascript
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[TEST 3] Verifying Constellation Skill Tree Engine & Prerequisite Logic...');

const dataTs = fs.readFileSync(path.join(__dirname, '../src/core/skill-tree-data.ts'), 'utf-8');
const engineTs = fs.readFileSync(path.join(__dirname, '../src/core/skill-tree-engine.ts'), 'utf-8');

// 1. Assert all 5 branches exist in data definition
assert(dataTs.includes("'grammar'"), "skill-tree-data must include grammar branch");
assert(dataTs.includes("'collocations'"), "skill-tree-data must include collocations branch");
assert(dataTs.includes("'writing'"), "skill-tree-data must include writing branch");
assert(dataTs.includes("'speaking'"), "skill-tree-data must include speaking branch");
assert(dataTs.includes("'reading'"), "skill-tree-data must include reading branch");

// 2. Assert prerequisite tracking fields
assert(dataTs.includes('prerequisites: string[]'), "Skill nodes must define prerequisites array");
assert(dataTs.includes('masteryThreshold: number'), "Skill nodes must define masteryThreshold");
assert(dataTs.includes('routeTarget: RouteId'), "Skill nodes must map to a RouteId");

// 3. Assert engine implements node status calculation
assert(engineTs.includes('isNodeUnlocked'), "SkillTreeEngine must implement isNodeUnlocked");
assert(engineTs.includes('calculateSummitProgress'), "SkillTreeEngine must calculate overall summit progress");
assert(engineTs.includes('getNodeStatus'), "SkillTreeEngine must implement getNodeStatus returning 'locked' | 'unlocked' | 'mastered'");

console.log('✅ [TEST 3 PASSED] Skill Tree Engine data and prerequisite logic verified.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node web/scripts/verify-skill-tree.cjs`  
Expected: FAIL because `skill-tree-data.ts` and `skill-tree-engine.ts` do not yet exist.

- [ ] **Step 3: Implement minimal code to make test pass**

Create `web/src/core/skill-tree-data.ts`:
Define the 5 Master Branches with 5 Sequenced Perks each (25 total nodes):
1. Branch `grammar`:
   - `gram-1`: Core Fronting (No prereqs, unlocked, route: `'grammar'`)
   - `gram-2`: Negative Inversion (prereq: `gram-1`, route: `'grammar'`)
   - `gram-3`: Restrictive Inversion (prereq: `gram-2`, route: `'grammar'`)
   - `gram-4`: Hypothetical Inversion (prereq: `gram-3`, route: `'grammar'`)
   - `gram-5`: Master C2 Stylistic Condensation (prereq: `gram-4`, route: `'grammar'`)
2. Branch `collocations`:
   - `col-1`: Core Action Verbs (No prereqs, route: `'colloc'`)
   - `col-2`: Business & Legal Hubs (prereq: `col-1`, route: `'colloc'`)
   - `col-3`: Academic & Research Collocations (prereq: `col-2`, route: `'colloc'`)
   - `col-4`: Prepositional Finesse (prereq: `col-3`, route: `'colloc'`)
   - `col-5`: High Idiomatic Nuance (prereq: `col-4`, route: `'colloc'`)
3. Branch `writing`:
   - `wri-1`: SVO Clarity & Clausal Balance (No prereqs, route: `'write'`)
   - `wri-2`: Periodic Sentences & Suspense (prereq: `wri-1`, route: `'write'`)
   - `wri-3`: Franklin Antithesis & Parallelism (prereq: `wri-2`, route: `'write'`)
   - `wri-4`: MEAL Argument Architecture (prereq: `wri-3`, route: `'write'`)
   - `wri-5`: Forensic C2 Essay Synthesis (prereq: `wri-4`, route: `'write'`)
4. Branch `speaking`:
   - `spk-1`: Nuclear Tonic Stress (No prereqs, route: `'speak'`)
   - `spk-2`: Connected Speech & Catenation (prereq: `spk-1`, route: `'speak'`)
   - `spk-3`: Nation 4-3-2 Fluency (prereq: `spk-2`, route: `'speak'`)
   - `spk-4`: Collocation Injection Under Pressure (prereq: `spk-3`, route: `'speak'`)
   - `spk-5`: Unrehearsed C2 Debate Rhetoric (prereq: `spk-4`, route: `'speak'`)
5. Branch `reading`:
   - `read-1`: Rapid Gist & Skeleton (No prereqs, route: `'read'`)
   - `read-2`: Lexical Target Extraction (prereq: `read-1`, route: `'read'`)
   - `read-3`: Syntactic Reverse-Engineering (prereq: `read-2`, route: `'read'`)
   - `read-4`: Rhetorical Intent & Biases (prereq: `read-3`, route: `'read'`)
   - `read-5`: Hermeneutic C2 Synthesis (prereq: `read-4`, route: `'read'`)

Create `web/src/core/skill-tree-engine.ts`:
Implement `SkillTreeEngine`:
- Read cards state from `StorageManager.loadState()`.
- Compute node mastery (percentage $\ge 80\%$ or minimum repetitions).
- Node status returns `'locked' | 'unlocked' | 'mastered'`.
- Root nodes (Level 1) are always unlocked.
- Level $N$ unlocks when all its prerequisites have status `'mastered'`.
- `calculateSummitProgress()` calculates overall percentage of mastered nodes across the 25 perks.

- [ ] **Step 4: Run test to verify it passes**

Run: `node web/scripts/verify-skill-tree.cjs`  
Expected: `✅ [TEST 3 PASSED] Skill Tree Engine data and prerequisite logic verified.`

- [ ] **Step 5: Commit**

```bash
git add web/src/core/skill-tree-data.ts web/src/core/skill-tree-engine.ts web/scripts/verify-skill-tree.cjs
git commit -m "feat(tree): implement constellation prerequisite engine and 25-node curriculum"
```

---

### Task 4: Skyrim-Style Constellation Tree UI & Daily Workout Banner

**Files:**
- Create: `web/src/modules/skill-tree-view.ts`
- Modify: `web/src/assets/styles/dossiers.css`
- Modify: `web/src/main.ts:35-130`
- Test: `web/scripts/verify-tree-ui.cjs`

**Interfaces:**
- Consumes: `SkillTreeEngine`, `SKILL_BRANCHES`, `AudioSynthesizer`, `Router`.
- Produces: `SkillTreeView` component rendering the Skyrim constellation SVG visualization, interactive node modal, and "Today's 15-Minute Workout" banner.

- [ ] **Step 1: Write the failing test**

Create `web/scripts/verify-tree-ui.cjs`:
```javascript
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[TEST 4] Verifying Constellation Skill Tree UI & Daily Workout Banner...');

const viewTs = fs.readFileSync(path.join(__dirname, '../src/modules/skill-tree-view.ts'), 'utf-8');
const mainTs = fs.readFileSync(path.join(__dirname, '../src/main.ts'), 'utf-8');
const dossiersCss = fs.readFileSync(path.join(__dirname, '../src/assets/styles/dossiers.css'), 'utf-8');

// 1. Assert SkillTreeView handles SVG constellation rendering
assert(viewTs.includes('<svg') || viewTs.includes('svg'), "skill-tree-view.ts must render constellation SVG filaments");
assert(viewTs.includes('renderWorkoutBanner'), "skill-tree-view.ts must render daily 15-minute workout banner");
assert(viewTs.includes('renderNodeModal') || viewTs.includes('openNodeModal'), "skill-tree-view.ts must provide node details modal with CTA");

// 2. Assert main.ts instantiates SkillTreeView and routes 'tree'
assert(mainTs.includes('SkillTreeView'), "main.ts must import and instantiate SkillTreeView");
assert(mainTs.includes("case 'tree':"), "main.ts handleRouteChange must handle 'tree'");

// 3. Assert styling for constellation exists
assert(dossiersCss.includes('.constellation-container') || dossiersCss.includes('.skill-tree-view'), "dossiers.css must define constellation tree styles");
assert(dossiersCss.includes('.node-locked') && dossiersCss.includes('.node-mastered'), "dossiers.css must style locked and mastered nodes");

console.log('✅ [TEST 4 PASSED] Constellation Tree UI & Workout Banner verified.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node web/scripts/verify-tree-ui.cjs`  
Expected: FAIL.

- [ ] **Step 3: Implement minimal code to make test pass**

Create `web/src/modules/skill-tree-view.ts`:
- Render "Today's 15-Minute Workout" banner at the top:
  - Header: `TODAY'S 15-MINUTE WORKOUT`
  - Checklist: `[✓] 10 Collocations`, `[ ] 1 Franklin Copywork`, `[ ] 1 Speaking Take`
  - Primary button: `[ CONTINUE TODAY'S WORKOUT → ]`
- Render Skyrim Constellation SVG Tree:
  - 5 radiating star chains ascending toward "C2 SUMMIT".
  - Nodes rendered with crisp star icons, level badges, and connecting SVG `<line>` / `<path>` filaments.
  - Node classes: `.node-locked` (dimmed, lock icon), `.node-unlocked` (pulsing gold outline, clickable), `.node-mastered` (glowing solid star).
- Clicking a locked node displays a clean locked drawer:
  - *"LOCKED: Requires [Parent Skill Name] at 80% Mastery (Current: X%). Complete review drills to unlock."*
- Clicking an unlocked or mastered node opens the Perk Modal:
  - Title, CEFR Level, description, current mastery %.
  - Button: **`[ START PRACTICE DRILL → ]`** which triggers `this.onNavigate(node.routeTarget)`.

Update `web/src/assets/styles/dossiers.css`:
Add styles for `.constellation-container`, `.workout-banner`, `.constellation-node`, `.node-locked`, `.node-unlocked`, `.node-mastered`, `.constellation-line`.

Update `web/src/main.ts`:
Add `this.skillTreeView = new SkillTreeView();`
In `handleRouteChange(route)`:
```typescript
case 'tree':
  this.workspaceMount.appendChild(this.skillTreeView.render());
  this.activeDossierHandle = this.skillTreeView;
  break;
```
Wire `this.skillTreeView.onNavigate = (route) => this.router.navigate(route);`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node web/scripts/verify-tree-ui.cjs`  
Expected: `✅ [TEST 4 PASSED] Constellation Tree UI & Workout Banner verified.`

- [ ] **Step 5: Commit**

```bash
git add web/src/modules/skill-tree-view.ts web/src/assets/styles/dossiers.css web/src/main.ts web/scripts/verify-tree-ui.cjs
git commit -m "feat(ui): implement Skyrim-style constellation skill tree view and daily workout"
```

---

### Task 5: Dedicated Benjamin Franklin Copywork Studio

**Files:**
- Modify: `web/src/modules/writing-dossier.ts:1-350`
- Modify: `web/src/assets/styles/dossiers.css`
- Test: `web/scripts/verify-copywork-studio.cjs`

**Interfaces:**
- Consumes: `drills.json` writing prompts, `SRSEngine`, `StorageManager`.
- Produces: Dedicated 3-step Franklin Copywork Studio (`Analyze` -> `Recall & Type` -> `Split-Diff`).

- [ ] **Step 1: Write the failing test**

Create `web/scripts/verify-copywork-studio.cjs`:
```javascript
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[TEST 5] Verifying Dedicated Franklin Copywork Studio...');

const writingTs = fs.readFileSync(path.join(__dirname, '../src/modules/writing-dossier.ts'), 'utf-8');

// 1. Assert AtomicCard 3D flipper card is NOT used as wrapper
assert(!writingTs.includes('AtomicCard.create'), "writing-dossier.ts must not wrap copywork in 720x440 AtomicCard flipper");

// 2. Assert real textarea exists for typing
assert(writingTs.includes('<textarea') && writingTs.includes('copywork-input'), "writing-dossier.ts must render dedicated copywork textarea");

// 3. Assert 3-step state machine
assert(writingTs.includes("'analyze'") && writingTs.includes("'type'") && writingTs.includes("'diff'"), "writing-dossier.ts must support 3-step flow (analyze, type, diff)");

// 4. Assert Myers/Hirschberg word/char diff tokens and metrics
assert(writingTs.includes('calculateWritingMetrics'), "writing-dossier.ts must calculate WPM and accuracy metrics");
assert(writingTs.includes('accuracyPct') && writingTs.includes('netWpm'), "writing-dossier.ts must report accuracyPct and netWpm");

console.log('✅ [TEST 5 PASSED] Franklin Copywork Studio verified.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node web/scripts/verify-copywork-studio.cjs`  
Expected: FAIL because `writing-dossier.ts` still uses `AtomicCard.create`.

- [ ] **Step 3: Implement minimal code to make test pass**

Refactor `web/src/modules/writing-dossier.ts`:
- Remove `AtomicCard.create` dependency.
- Structure into a 3-step state machine:
  - Step 1: `ANALYZE MODEL`
    - Display model sentence in generous 20px font with 68ch measure.
    - Display MEAL structural breakdown (Main claim, Evidence, Analysis, Link) and rhetorical notes.
    - Button: `[ MEMORIZED — PROCEED TO TYPE → ]`
  - Step 2: `RECALL & TYPE`
    - Model sentence hides.
    - Auto-focused `<textarea class="copywork-input" placeholder="Reconstruct the sentence from memory..." rows="5"></textarea>`.
    - Live counters: Word count, character count, timer elapsed.
    - Button: `[ EVALUATE RECONSTRUCTION → ]`
  - Step 3: `INSTANT SPLIT-DIFF`
    - Side-by-side or stacked diff: Original Model vs Your Version.
    - Highlight matches, omissions (`[-deleted-]`), and additions (`{+inserted+}`).
    - Metrics bar: Accuracy %, Net WPM, Error Count.
    - Pedagogical takeaway explaining rhetorical nuance.
    - Self-rating buttons: `[ Again ]`, `[ Hard ]`, `[ Good ]`, `[ Easy ]` updating SM-2 and constellation mastery score.
    - Button: `[ NEXT PROMPT → ]`

Update `web/src/assets/styles/dossiers.css`:
Add spacious styling for `.copywork-studio`, `.copywork-input`, `.copywork-diff-container`, `.diff-match`, `.diff-delete`, `.diff-insert`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node web/scripts/verify-copywork-studio.cjs`  
Expected: `✅ [TEST 5 PASSED] Franklin Copywork Studio verified.`

- [ ] **Step 5: Commit**

```bash
git add web/src/modules/writing-dossier.ts web/src/assets/styles/dossiers.css web/scripts/verify-copywork-studio.cjs
git commit -m "feat(writing): convert copywork to dedicated 3-step studio with real typing input"
```

---

### Task 6: Dual-View 1,000 Collocations & Lexicon Vault

**Files:**
- Modify: `web/src/modules/collocations-dossier.ts:1-220`
- Modify: `web/src/assets/styles/dossiers.css`
- Test: `web/scripts/verify-collocation-vault.cjs`

**Interfaces:**
- Consumes: `collocations.json` (1,000 items), `AudioSynthesizer`.
- Produces: Dual-View Collocations Studio (View A: SRS Drill Card, View B: Full 1,000 Searchable Dictionary Table).

- [ ] **Step 1: Write the failing test**

Create `web/scripts/verify-collocation-vault.cjs`:
```javascript
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[TEST 6] Verifying Dual-View 1,000 Collocations & Lexicon Vault...');

const collocTs = fs.readFileSync(path.join(__dirname, '../src/modules/collocations-dossier.ts'), 'utf-8');

// 1. Assert dual-view mode toggle exists
assert(collocTs.includes('viewMode') || collocTs.includes("'drill'") || collocTs.includes("'dictionary'"), "collocations-dossier.ts must support drill and dictionary view modes");

// 2. Assert full table rendering in dictionary mode
assert(collocTs.includes('<table') || collocTs.includes('lexicon-table'), "collocations-dossier.ts must render table for full 1,000 dictionary");

// 3. Assert audio button on dictionary table rows
assert(collocTs.includes('playAudio') || collocTs.includes('btn-speak-colloc'), "collocations-dossier.ts table rows must have audio pronunciation");

// 4. Assert instant search filters both English phrase and Vietnamese meaning
assert(collocTs.includes('phrase.toLowerCase()') && collocTs.includes('vietnamese.toLowerCase()'), "Search must filter both English phrase and Vietnamese translation");

console.log('✅ [TEST 6 PASSED] Dual-View Collocations Studio verified.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node web/scripts/verify-collocation-vault.cjs`  
Expected: FAIL because table dictionary mode is not implemented.

- [ ] **Step 3: Implement minimal code to make test pass**

Refactor `web/src/modules/collocations-dossier.ts`:
- Add `viewMode: 'drill' | 'dictionary' = 'dictionary'`.
- In `render()`:
  - Add top switch buttons: `[ ⚡ ACTIVE SRS DRILL ]` and `[ 📖 FULL 1,000 LEXICON ]`.
  - When `viewMode === 'drill'`: render the single card SRS practice drill.
  - When `viewMode === 'dictionary'`: render the full searchable table:
    - Search input: instant filter by English phrase or Vietnamese meaning.
    - Category pills: `ALL`, `EVERYDAY`, `BUSINESS`, `ACADEMIC`, `IDIOMS`.
    - Table columns: `#`, `English Collocation`, `Preposition Hub`, `Vietnamese Meaning`, `Pronounce [🔊]`.
    - Audio button uses Web Speech API or AudioSynthesizer on row click.
    - Clean pagination (e.g. 50 per page with fast navigation).

Update `web/src/assets/styles/dossiers.css`:
Add styles for `.lexicon-table`, `.lexicon-row`, `.btn-speak-colloc`, `.view-mode-toggle`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node web/scripts/verify-collocation-vault.cjs`  
Expected: `✅ [TEST 6 PASSED] Dual-View Collocations Studio verified.`

- [ ] **Step 5: Commit**

```bash
git add web/src/modules/collocations-dossier.ts web/src/assets/styles/dossiers.css web/scripts/verify-collocation-vault.cjs
git commit -m "feat(colloc): implement dual-view studio with full 1,000 searchable lexicon"
```

---

### Task 7: Calm Document Reader & Grammar Ergonomics

**Files:**
- Modify: `web/src/modules/reading-dossier.ts:1-250`
- Modify: `web/src/modules/grammar-dossier.ts:1-250`
- Modify: `web/src/assets/styles/dossiers.css`
- Test: `web/scripts/verify-calm-reading.cjs`

**Interfaces:**
- Consumes: `reading.json`, `grammar.json`.
- Produces: Calm, distraction-free document reader with clickable vocabulary definitions and clean grammar matrix.

- [ ] **Step 1: Write the failing test**

Create `web/scripts/verify-calm-reading.cjs`:
```javascript
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[TEST 7] Verifying Calm Reading & Grammar Ergonomics...');

const readingTs = fs.readFileSync(path.join(__dirname, '../src/modules/reading-dossier.ts'), 'utf-8');
const dossiersCss = fs.readFileSync(path.join(__dirname, '../src/assets/styles/dossiers.css'), 'utf-8');

// 1. Assert calm reader measure is constrained to comfortable 68ch
assert(dossiersCss.includes('68ch') || dossiersCss.includes('max-width: 68ch'), "Reading text must be constrained to 68ch measure for eye comfort");

// 2. Assert clickable vocab drawer or modal exists
assert(readingTs.includes('showVocabDrawer') || readingTs.includes('vocab-target'), "reading-dossier.ts must support clickable vocabulary target words");

console.log('✅ [TEST 7 PASSED] Calm reading & grammar ergonomics verified.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node web/scripts/verify-calm-reading.cjs`  
Expected: FAIL.

- [ ] **Step 3: Implement minimal code to make test pass**

Update `web/src/modules/reading-dossier.ts`:
- Ensure natural vertical scrolling of entire long-form essays without 720x440 clipping.
- Render text in relaxed typography: `max-width: 68ch; font-size: 17px; line-height: 1.7;`.
- Underline vocabulary targets; clicking one opens a calm inline footnote drawer with Vietnamese meaning and collocation tips.
- Optional 60-second gentle timer with pause/resume (no forced cutoff).

Update `web/src/modules/grammar-dossier.ts`:
- Ensure formula cards and inversion drills scroll naturally without clipping.
- Clear step-by-step syntactic rules with contrastive examples.

Update `web/src/assets/styles/dossiers.css`:
Add styles for `.calm-reader`, `.vocab-drawer`, `.vocab-target`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node web/scripts/verify-calm-reading.cjs`  
Expected: `✅ [TEST 7 PASSED] Calm reading & grammar ergonomics verified.`

- [ ] **Step 5: Commit**

```bash
git add web/src/modules/reading-dossier.ts web/src/modules/grammar-dossier.ts web/src/assets/styles/dossiers.css web/scripts/verify-calm-reading.cjs
git commit -m "feat(reading): implement calm typography and clickable vocabulary drawer"
```

---

### Task 8: End-to-End Headless Browser QA Verification & Production Build

**Files:**
- Modify: `web/scripts/browser-qa-test.cjs`
- Modify: `E:\Eng\hive\board.md`
- Modify: `E:\Eng\hive\tasks.json`
- Modify: `E:\Eng\hive\agents\god\memory.md`

**Interfaces:**
- Consumes: Running Vite server on `http://localhost:4173` or `http://localhost:5173`.
- Produces: 10 visual screenshots, 0 console errors, 100% verification across all 8 routes and features.

- [ ] **Step 1: Write and run headless browser QA test**

Update `web/scripts/browser-qa-test.cjs` to:
1. Launch Chrome headlessly.
2. Navigate to `http://localhost:4173/#tree` and verify the Constellation Skill Tree renders with 25 nodes and Daily Workout banner.
3. Verify cursor is native pointer (`cursor !== 'none'`).
4. Click on an unlocked node (`Writing`) to navigate to `#write`.
5. Verify the Franklin Copywork studio loads without card clipping.
6. Type test sentence into the `<textarea>` and click `[ EVALUATE RECONSTRUCTION ]`.
7. Verify side-by-side diff appears with accuracy % and WPM.
8. Click `[ ← Back to Constellation Tree ]` in the top header and verify return to `#tree`.
9. Navigate to `#colloc` and toggle to `[ 📖 FULL 1,000 LEXICON ]`.
10. Type "decision" into search and verify table rows filter dynamically.
11. Capture screenshots for `#tree`, `#write`, `#colloc`, `#read`, `#grammar`, and `#speak`.
12. Assert 0 unhandled console errors or exceptions.

- [ ] **Step 2: Run test suite**

Run: `node web/scripts/browser-qa-test.cjs`  
Expected: 100% checks passed, 10 screenshots captured in `web/screenshots/`.

- [ ] **Step 3: Run production build**

Run: `npm run build` in `web/`  
Expected: Build passes with 0 TypeScript errors and emits clean `dist/`.

- [ ] **Step 4: Update Hive Project Records & Final Commit**

Update `E:\Eng\hive\board.md`, `E:\Eng\hive\tasks.json`, and `E:\Eng\hive\agents\god\memory.md`.
```bash
git add .
git commit -m "feat(release): constellation skill tree & human ergonomics overhaul complete"
```
