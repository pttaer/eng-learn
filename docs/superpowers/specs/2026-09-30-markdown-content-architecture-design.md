# Specification: Markdown-First Content Architecture & Compilation Pipeline

- **Date**: 2026-09-30
- **Author**: Michael (`god`)
- **Status**: Draft / Under Review
- **Initiative**: Content Architecture Modernization (Initiative 14)
- **Target Repository**: `E:\Eng\web`

---

## 1. Executive Summary

The English Singularity web learning platform currently stores all educational content across seven deeply nested static JSON files in `web/src/assets/data/`. While fast at runtime, this JSON-only format creates severe authoring friction:
1. Deeply nested syntax trees (e.g. SVO parses in `reading.json`) require extensive JSON escaping and manual bracket nesting.
2. Content creators and autonomous agents cannot leverage natural Markdown syntax (headings, tables, lists).
3. The platform's foundational Markdown guides in `E:\Eng\` (`collocations.md`, `reading.md`, `writing.md`, etc.) are disconnected from the application's runtime data.

This specification defines a **100% Markdown-First Content Architecture**. All educational material will live in clean, version-controlled Markdown files under `web/content/`. A lightweight, zero-dependency Node.js compiler (`web/scripts/compile-content.cjs`) will parse, validate, and compile these Markdown sources into the runtime JSON assets in `web/src/assets/data/`, integrated seamlessly into the Vite build lifecycle and dev workflow.

---

## 2. Directory Architecture & Source Layout

All content sources will reside in a dedicated directory: `web/content/`.

```
web/content/
├── collocations/
│   ├── 01-everyday.md            # Items 1–250: Everyday & Action
│   ├── 02-business-law.md        # Items 251–500: Business & Legal
│   ├── 03-academic-science.md    # Items 501–750: Academic & Technical
│   └── 04-emotions-idioms.md     # Items 751–1000: Rhetorical & Idiomatic
├── reading/
│   ├── epistemic-commons.md      # C1: Epistemic Commons & Synthetic Media
│   ├── cognitive-bandwidth.md    # C2: Subvocalization & Deep Reading
│   └── architecture-solitude.md  # C1: Attention in Knowledge Work
├── grammar/
│   ├── 01-inversion.md           # 15 items: Negative & Locative Inversion
│   ├── 02-subjunctive.md         # 15 items: Counterfactuals & Mandatives
│   ├── 03-condensation.md       # 15 items: Absolute & Participial Clauses
│   └── 04-syntactic-repair.md    # 15 items: Dangling Modifiers & Parallelism
├── vocabulary/
│   ├── root-forge.md             # 40 items: Greek & Latin Morphemes
│   ├── cefr-ascent.md            # 40 items: B2 -> C1 -> C2 Lexical Escalation
│   └── particle-lab.md           # 40 items: Phrasal Collocations & Prepositions
├── listening/
│   └── phonetics-passages.md     # Rules (Catenation, Elision) + 3 Transcriptions
├── drills/
│   ├── speaking-prompts.md       # 30 Nation 4-3-2 Fluency Prompts
│   └── writing-prompts.md        # 30 Benjamin Franklin MEAL Exercises
└── habits/
    └── daily-plan.md             # 30-Day Practice Habit Tracker
```

---

## 3. Pillar Markdown Schemas

Each pillar utilizes standard Markdown constructs (Frontmatter, Headings, Markdown Tables, Key-Value Bullets) that are natural to write and parse.

### 3.1. Reading Articles (`web/content/reading/*.md`)

Each file represents a complete intensive reading dossier:

```markdown
---
id: reading-art-1
title: The Epistemic Commons and the Economics of Synthetic Abundance
stage: Stage 3: Advanced Competency (CEFR C1)
cefrLevel: C1
genre: Philosophy of Technology & Epistemology
source: Adapted from long-form essays in The Atlantic & Aeon Essays
wordCount: 420
readingTime: 3.5 min @ 120 WPM (Intensive)
---

# Passage
In an era defined by the ubiquitous proliferation of generative synthetic media, the human epistemic commons faces an unprecedented structural crisis...

## Cold Read
- **Thesis**: Generative AI degrades public trust not only by deceiving individuals but by enabling wrongdoers to dismiss real evidence.
- **Targets**: epistemic commons, ubiquitous proliferation, perceptual heuristic, factual veracity, liar's dividend

### Comprehension Checks
- Q: Why is the "liar's dividend" described as the most pernicious consequence?
  A: It allows guilty individuals to avoid accountability by claiming authentic evidence is AI fabrication.
- Q: What technological solution is proposed?
  A: Cryptographic provenance standards embedded directly into camera and recording hardware.

## Syntax Dissection
### Sentence 1
- **Sentence**: When any recording can be convincingly fabricated, culpable actors can effortlessly dismiss genuine documentation.
- **Subject**: culpable actors
- **Verb**: can dismiss
- **Object**: genuine documentation of wrongdoing as algorithmic forgery
- **Subordinate Clauses**:
  - [Adverbial Clause of Condition]: When any recording can be convincingly fabricated | Establishes technological precondition
- **Analysis**: Fronted subordinate clause sets the stage; paired adverbs emphasize asymmetric ease of bad-faith defense.

## Sentence Mining
### epistemic
- **Part of Speech**: adjective
- **IPA**: `/ˌep.ɪˈstiː.mɪk/`
- **Definition**: Relating to knowledge or to the degree of its validation and grounds for truth.
- **Vietnamese**: thuộc về tri thức luận, liên quan đến tính xác thực của nhận thức
- **Context**: In an era defined by the ubiquitous proliferation of generative synthetic media...
- **Collocations**: epistemic commons, epistemic crisis, epistemic vigilance
- **Etymology**: Greek episteme (knowledge) from epistasthai (to know how).
```

---

### 3.2. Collocations (`web/content/collocations/*.md`)

Clean Markdown tables matching the structure of `collocations.md`:

```markdown
# Section 1: Everyday & Core Action Collocations

| Index | Phrase | Vietnamese Meaning | Category |
| :---: | :--- | :--- | :--- |
| 1 | pay attention to | chú ý đến, để tâm tới | EVERYDAY |
| 2 | make a decision | đưa ra quyết định | EVERYDAY |
| 3 | take into account | tính đến, xem xét đến | EVERYDAY |
| 4 | catch someone's eye | thu hút sự chú ý của ai | EVERYDAY |
```

---

### 3.3. Grammar Dossier (`web/content/grammar/*.md`)

Section headers represent the rule, followed by structured bullet points:

```markdown
# Mode: Inversion & Emphasis (C1/C2)

## Negative Inversion with 'Seldom'
- **ID**: gram-inv-1
- **Level**: 1
- **Title**: Negative Inversion with 'Seldom'
- **Prompt**: The executive team seldom realized how vulnerable their supply chain had become.
- **Transformation**: Seldom did the executive team realize how vulnerable their supply chain had become.
- **Grammatical Cue**: Fronting the negative frequency adverb 'seldom' triggers subject-auxiliary inversion.
- **Vietnamese**: Đảo ngữ với Seldom: đưa trạng từ phủ định lên đầu câu, đảo trợ động từ 'did' lên trước chủ ngữ.
- **Formula**: `Seldom + Auxiliary Verb + Subject + Main Verb...`
- **Analysis**: When negative frequency adverbs are moved to sentence-initial position, English requires standard subject-auxiliary inversion.
- **Exemplar**: Seldom did the board intervene in day-to-day algorithmic trading executions unless risk thresholds were breached.
```

---

### 3.4. Vocabulary Dossier (`web/content/vocabulary/*.md`)

```markdown
# Mode: Root Forge (Morphological Architecture)

## chronic
- **ID**: vocab-rf-1
- **Level**: 1
- **Word**: chronic
- **IPA**: `/ˈkrɒn.ɪk/`
- **Definition**: Persisting for a long time or constantly recurring.
- **Vietnamese**: mãn tính, kinh niên, kéo dài dai dẳng
- **Context**: The city faces a chronic shortage of affordable housing for municipal workers.
- **Prefix**: None (root-initial)
- **Root**: chron (Greek: time)
- **Suffix**: -ic (adjective-forming: having the character of)
- **Derivatives**: chronicle, synchronize, chronological, anachronism
- **Morphology**: chron (time) + -ic (pertaining to) -> lasting over extended time
- **Remind Candidate**: false
```

---

### 3.5. Speaking & Writing Drills (`web/content/drills/*.md`)

```markdown
# Speaking Drills: Nation 4-3-2 Fluency

## The Automation Paradox in Knowledge Work
- **ID**: speaking-1
- **Index**: 1
- **Mode**: 4-3-2 Fluency Drill
- **Prompt**: As artificial intelligence automates cognitive and analytical tasks, assess whether human expertise will be amplified or degraded.
- **Anchor**: Past baseline (manual analysis) → Present disruption (generative tools) → Future equilibrium (human critical judgment)
- **Collocations**: disruptive technology, cognitive bandwidth, human-in-the-loop, single point of failure
- **Phonetic**: Nuclear stress on contrastive verbs: 'AMPLIFIED versus DEGRADED'; crisp catenation across 'human-in-the-loop'.
```

---

## 4. Compiler Toolchain Architecture

The compilation engine is implemented in `web/scripts/compile-content.cjs`.

### 4.1. Core Requirements & Non-Functional Constraints
1. **Zero External Dependencies**: Uses native Node.js APIs (`fs`, `path`) to eliminate dependency bloat.
2. **Speed**: Full compilation of all 7 content domains must complete in **under 100ms**.
3. **Rigorous Validation**:
   - Validates required fields for every item.
   - Verifies CEFR levels against `['B2', 'C1', 'C2']`.
   - Ensures continuous indexing (1 to N) and uniqueness of all IDs.
   - Throws descriptive errors indicating exact file path and line number on malformed Markdown.
4. **Deterministic Output**: Formats generated JSON with consistent 2-space indentation to keep git diffs minimal.

### 4.2. Build Lifecycle Integration
The compiler hooks directly into `web/package.json`:

```json
{
  "scripts": {
    "content:compile": "node scripts/compile-content.cjs",
    "content:watch": "node scripts/compile-content.cjs --watch",
    "prebuild": "npm run content:compile",
    "predev": "npm run content:compile"
  }
}
```

---

## 5. Migration Strategy & Zero Regression Guarantee

To ensure zero regression and uninterrupted application stability:
1. **Source of Truth Switch**: `web/content/` becomes the sole source of truth for all pedagogical content.
2. **Schema Parity**: The compiler emits JSON matching the exact TypeScript interfaces defined in:
   - `web/src/assets/data/reading.json`
   - `web/src/assets/data/collocations.json`
   - `web/src/assets/data/vocabulary.json`
   - `web/src/assets/data/grammar.json`
   - `web/src/assets/data/drills.json`
   - `web/src/assets/data/listening.json`
   - `web/src/assets/data/habits.json`
3. **Zero UI Code Modifications Required**: Because the compiled output targets `web/src/assets/data/`, existing UI dossiers (`reading-dossier.ts`, `collocations-dossier.ts`, etc.) remain 100% untouched and functional.
4. **Verification Test Suite**: `web/scripts/verify-content-pipeline.cjs` will execute an end-to-end roundtrip test:
   - Compiles Markdown files to temporary test outputs.
   - Compares deep schema keys against production expectations.
   - Asserts 100% item counts (1,000 collocations, 60 grammar rules, 120 vocabulary items, 30 speaking drills, 30 writing drills).

---

## 6. Fleet Allocation & Execution Plan

| Agent | Assigned Subsystem | Deliverables |
| :--- | :--- | :--- |
| **Michael (`god`)** | Orchestration & Compiler Engine | `web/scripts/compile-content.cjs`, `package.json` hooks, test harness `verify-content-pipeline.cjs`. |
| **Dwight (`dwight-mul1u508`)** | Collocations & Vocabulary Migration | `web/content/collocations/*.md` (1,000 items in 4 parts), `web/content/vocabulary/*.md` (120 items in 3 modes). |
| **Andy (`andy-mul1ug04`)** | Reading & Listening Migration | `web/content/reading/*.md` (3 multi-pass dossiers), `web/content/listening/phonetics-passages.md`. |
| **Phyllis (`phyllis-mul1ur07`)** | Grammar & Drills Migration | `web/content/grammar/*.md` (60 rules in 4 modes), `web/content/drills/*.md` (60 prompts), `web/content/habits/daily-plan.md`. |
| **JimMA (`jim-mum0qdlb`)** | Verification & Build QA | Automated pipeline test execution, production Vite build check (`npm run build`), zero-regression sign-off. |

---

## 7. Spec Self-Review Checklist

- [x] **Placeholder Scan**: No "TBD", "TODO", or incomplete sections.
- [x] **Internal Consistency**: Content schemas directly match existing dossier consumer expectations.
- [x] **Scope Check**: Explicitly bounded to content storage, compilation toolchain, and content migration.
- [x] **Ambiguity Check**: Clear directory paths, command invocations, and error handling behaviors defined.
