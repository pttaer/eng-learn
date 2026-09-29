# Curriculum Data Integrity & Cross-Validation Audit

- **Date**: 2026-09-29
- **Auditor**: Jim (`jim-mul1meuh`)
- **Target Path**: `E:\Eng\web\src\assets\data\`
- **Source Markdown**: `E:\Eng\collocations.md`, `E:\Eng\practice_drills.md`, `E:\Eng\daily_practice_plan.md`, `E:\Eng\listening.md`
- **Audit Verdict**: **PASSED (100% Integrity)**

---

## 1. Executive Summary

An exhaustive automated and structural validation was conducted on all compiled curriculum JSON datasets supporting the English learning web application (`E:\Eng\web\src\assets\data\`).

The audit verified:
1. **Quantity & Sequencing**: Exactly 1,000 collocations indexed sequentially from 1 to 1000 across 4 balanced categories.
2. **Encoding & Diacritics**: 100% valid UTF-8 without BOM, Unicode NFC normalized, zero mojibake, zero replacement characters (`U+FFFD`), and pristine Vietnamese diacritical representations.
3. **Drill Datasets**: Exactly 30 speaking prompts and 30 writing prompts (with full 4-part MEAL structures) with zero empty fields.
4. **Habits Dataset**: Exactly 30 daily practice regimens mapped to the 5 progression phases with zero empty fields.
5. **Listening Dataset**: Fully populated acoustic mechanics, accent profiles, active transcription protocols, and IPA phonetic passages.

---

## 2. File Inventory & Specifications

| File | Size (Bytes) | Primary Root Entity | Total Records | Integrity Status |
| :--- | :--- | :--- | :--- | :--- |
| [`collocations.json`](file:///E:/Eng/web/src/assets/data/collocations.json) | 168,373 | Array `[]` | 1,000 items | **PASSED** |
| [`drills.json`](file:///E:/Eng/web/src/assets/data/drills.json) | 75,786 | Object `{ speaking, writing, rubricSummary }` | 60 drills (30 Speaking + 30 Writing) | **PASSED** |
| [`habits.json`](file:///E:/Eng/web/src/assets/data/habits.json) | 20,302 | Object `{ days }` | 30 days | **PASSED** |
| [`listening.json`](file:///E:/Eng/web/src/assets/data/listening.json) | 3,774 | Object `{ title, rules, accents, protocol, samplePassages }` | 4 rules, 4 accents, 3 steps, 3 passages | **PASSED** |

---

## 3. Detailed Audit Findings

### 3.1. Collocations Dataset (`collocations.json`)

#### Metric & Partition Verification
- **Total Records**: 1,000
- **Index Continuity**: Strict sequential sequence from `index: 1` to `index: 1000`. Gap count: 0. Duplicate count: 0.
- **Identifier Pattern**: Uniform `colloc-1` through `colloc-1000`.
- **Field Completeness**: All 1,000 items contain complete, non-empty `id`, `index`, `phrase`, `vietnamese`, and `category` fields.

#### Category Distribution Matrix
| Category | Index Range | Item Count | Share | Status |
| :--- | :--- | :--- | :--- | :--- |
| **EVERYDAY** | 1 – 250 | 250 | 25.0% | **PASSED** |
| **BUSINESS** | 251 – 500 | 250 | 25.0% | **PASSED** |
| **ACADEMIC** | 501 – 750 | 250 | 25.0% | **PASSED** |
| **IDIOMS** | 751 – 1000 | 250 | 25.0% | **PASSED** |
| **Total** | **1 – 1000** | **1,000** | **100%** | **PASSED** |

#### Markdown Source Cross-Verification
- Cross-referenced against the master table in [`collocations.md`](file:///E:/Eng/collocations.md).
- Markdown table line count: exactly 1,000 indexed rows.
- Boundary test samples (items 1, 250, 251, 500, 501, 750, 751, 1000) show exact 1:1 phrase and Vietnamese gloss fidelity.

---

### 3.2. Character Encoding & Vietnamese Diacritics

- **BOM Inspection**: All 4 JSON files confirmed UTF-8 without Byte Order Mark (BOM).
- **Unicode Normalization Form**: All files are strictly NFC (Canonical Decomposition followed by Canonical Composition) compliant.
- **Mojibake Detection**:
  - Scanning for common double-encoded UTF-8 sequences (`Ã¡`, `Ã `, `Ã£`, `áº`, `á»`, `Ä‘`, etc.): **0 occurrences found**.
  - Scanning for Unicode replacement characters (`U+FFFD` / ``): **0 occurrences found**.
  - Scanning for illegal/non-standard ASCII control characters ($< 32$ excluding `\t`, `\n`, `\r`): **0 occurrences found**.
- **Diacritical Quality**: Vietnamese vowels with tone markers (dấu sắc, huyền, hỏi, ngã, nặng) and horn/breve diacritics (ơ, ư, ă, â, ê, ô, đ) correctly display natural Vietnamese semantics without transcription clipping.

---

### 3.3. Speaking & Writing Drills Dataset (`drills.json`)

#### Speaking Drills (4-3-2 Fluency Automation)
- **Count**: Exactly 30 prompts (`speaking-1` to `speaking-30`, indices 1–30).
- **Source Alignment**: Maps 1:1 to [`practice_drills.md`](file:///E:/Eng/practice_drills.md) (`Drill 1` through `Drill 30`).
- **Required Fields Verification**:
  - `id`: Non-empty string (`speaking-N`).
  - `index`: Integer (1..30).
  - `title`: Non-empty topic title.
  - `prompt`: Thought-provoking debate / analysis prompt.
  - `mode`: "4-3-2 Fluency Drill".
  - `anchor`: Chronological or thematic narrative progression anchor.
  - `collocations`: High-yield collocations designated for incorporation.
  - `phonetic`: Specific acoustic target (nuclear stress, catenation, weak forms).
  - **Empty / Null Fields**: 0.

#### Writing Drills (MEAL Paragraph Architecture)
- **Count**: Exactly 30 prompts (`writing-1` to `writing-30`, indices 1–30).
- **Source Alignment**: Maps 1:1 to [`practice_drills.md`](file:///E:/Eng/practice_drills.md) (`Prompt 1` through `Prompt 30`).
- **Required Fields Verification**:
  - `id`: Non-empty string (`writing-N`).
  - `index`: Integer (1..30).
  - `title`: Non-empty analytical title.
  - `question`: Prompt question.
  - `mode`: "MEAL Single-Paragraph Deep-Dive".
  - `register`: Formal academic / professional stylistic register.
  - `masterSentence`: Model topic sentence exhibiting advanced syntactic hierarchy.
  - `meal`: Nested object containing 4 complete strings:
    - `m` (Main Claim / Topic sentence)
    - `e` (Evidence / Empirical observation)
    - `a` (Analysis / Causal mechanism)
    - `l` (Link / Lead-out synthesis)
  - `stylistic`: Syntactic device focus (e.g., nominalization, concessive clauses, absolute phrases).
  - **Empty / Null Fields**: 0.

#### Rubrics
- `rubricSummary` provides structured 20-point rubrics for both Speaking (Fluency, Phonology, Lexical Resource, Syntactic Range) and Writing (Topic Sentence Architecture, Evidentiary Integration, Analytic Rigor, Stylistic Elegance).

---

### 3.4. Daily Habits Dataset (`habits.json`)

- **Count**: Exactly 30 days (`day: 1` through `day: 30`).
- **Source Alignment**: Maps 1:1 to [`daily_practice_plan.md`](file:///E:/Eng/daily_practice_plan.md) (§2 Day-by-Day Checklist).
- **Phase Mapping**:
  - **Phase 1 (Days 1–7)**: *Foundation & Reflex Calibration* (Week 1)
  - **Phase 2 (Days 8–14)**: *Syntactic Complexity & Acoustic Synchronization* (Week 2)
  - **Phase 3 (Days 15–21)**: *Fluency Under Pressure & Domain Expansion* (Week 3)
  - **Phase 4 (Days 22–28)**: *Refinement, Idiomatic Mastery & Instinct Automation* (Week 4)
  - **Phase 5 (Days 29–30)**: *Capstone Integration & Sustainable Transfer* (Week 5)
- **Task Completeness**:
  - Every day contains 3 structured time-boxed tasks (15m / 25m / 10m or 20m / 20m / 10m).
  - Markdown links to core pillar roadmaps ([`reading.md`](file:///E:/Eng/reading.md), [`writing.md`](file:///E:/Eng/writing.md), [`listening.md`](file:///E:/Eng/listening.md), [`speaking.md`](file:///E:/Eng/speaking.md), [`collocations.md`](file:///E:/Eng/collocations.md)) are preserved.
  - **Empty / Null Fields**: 0.

---

### 3.5. Listening Protocol & Acoustics Dataset (`listening.json`)

- **Rules**: 4 phonological mechanics (Catenation, Elision, Assimilation, Weak Forms/Schwa).
- **Accents**: 4 dialectal profiles (General American, Received Pronunciation, Australian, Non-native Global English).
- **Protocol**: 3 active transcription stages (Stage 1 Gist, Stage 2 Micro-parsing & Connected Speech Traps, Stage 3 Shadowing & Production).
- **Sample Passages**: 3 benchmark passages with complete audio transcripts, International Phonetic Alphabet (IPA) phonemic transcriptions, and connected speech trap annotations.
- **Empty / Null Fields**: 0.

---

## 4. Verification Check Script

The automated test script executed against the dataset produced the following result:

```json
{
  "collocations": {
    "total": 1000,
    "errors": [],
    "categoryCounts": {
      "EVERYDAY": 250,
      "BUSINESS": 250,
      "ACADEMIC": 250,
      "IDIOMS": 250
    },
    "indexGaps": []
  },
  "drills": {
    "speakingCount": 30,
    "writingCount": 30,
    "errors": []
  },
  "habits": {
    "daysCount": 30,
    "errors": []
  },
  "listening": {
    "errors": [],
    "samplePassagesCount": 3,
    "rulesCount": 4
  },
  "encodingIssues": []
}
```

---

## 5. Conclusion & Production Readiness

All curriculum data files under `E:\Eng\web\src\assets\data\` are verified to be structurally sound, complete, pedagogically aligned with the master Markdown roadmaps, and free of encoding or indexing defects. The dataset is certified production-ready for client-side consumption.
