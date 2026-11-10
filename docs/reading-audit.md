# Reading Skill Comprehensive Pedagogical & Quality Audit

> **Authority:** Autonomous Overhaul Stream A (Highest Priority)  
> **Scope:** Intensive Reading Articles (`web/content/reading.md`), IELTS Academic Reading Parts 1–7 (`web/src/ielts/data/parts/reading-*.json`), Reading Question Attack Drills (`web/src/ielts/views/reading-drills.ts`), and Exam Cockpit Reading Module (`web/src/modules/exam-cockpit-dossier.ts`).  
> **Target Audience:** Vietnamese English Learners (A1 to C2 & IELTS Band 5.0 to 9.0).

---

## 1. Executive Summary

A comprehensive, multi-pass audit of every reading asset across the English Singularity and IELTS suites was conducted:
1. **Intensive Reading Master Bank (`web/content/reading.md`):** 21 articles spanning CEFR A1 through C2. Every article incorporates the 4-pass protocol: Pass 1 Cold Read (with Gist Thesis & Comprehension Checks), Pass 2 Syntax Dissection (with explicit Vietnamese grammatical scaffolding), Pass 3 Sentence Mining (with vocabulary definitions and cloze targets), and Pass 4 Synthesis (model précis and reconstruction prompt).
2. **IELTS Academic Reading Master Bank (`web/src/ielts/data/parts/reading-*.json`):** 30 passages comprising 400 questions. Every question verified for:
   - Non-copied question stems (no giveaway verbatim quoting without paraphrasing).
   - Valid, unambiguous answer keys.
   - Distinct, plausible distractors without giveaway contradictions or twin options.
   - Verifiable passage evidence anchors (`paraIndex`, `start`, `end`, and `evidenceText`).
   - Detailed explanatory `why` lines explicitly quoting the evidence sentence and explaining the examiner logic.
   - Strict adherence to word count limits on completion/short-answer questions.
   - Balanced True/False/Not Given and Yes/No/Not Given distributions (minimum 1 NOT GIVEN per passage, minimum 2 unique keys).
3. **IELTS Reading Attack Drills Lab (`web/src/ielts/views/reading-drills.ts`):** 14 drills covering all official Cambridge IELTS question types:
   - T1: True/False/Not Given (Factual)
   - T2: Yes/No/Not Given (Author's Stance)
   - T3: Short Answer Questions (Exact Word Lifting)
   - T4: Sentence Completion (Grammatical Gap-Fill)
   - T5: Summary Completion (Word Bank Box)
   - T6: Table Completion (Categorized Matrix)
   - T7: Flow Chart Completion (Sequential Stages)
   - T8: Diagram Labelling (Spatial Structure)
   - T9: Multiple Choice Standard (Single Answer)
   - T10: Choose 2 to 5 From a List (Multi-Selection)
   - T11: Matching Headings (Paragraph Main Idea)
   - T12: Matching Information (Locating Specific Paragraph)
   - T13: Matching Features / Names (Researcher Claims)
   - T14: Matching Sentence Endings (Grammar + Meaning)
   Each drill includes order category, tactical rule snippet, authentic academic excerpt, synonym mapping matrix, distractor trap deconstruction, and examiner rationale.
4. **Exam Cockpit CD-IELTS Mock (`web/src/modules/exam-cockpit-dossier.ts`):** 40 authentic reading questions tied directly to the on-screen passages (The Falkirk Wheel, Collecting, Language Evolution), featuring balanced keys (5 TRUE, 4 FALSE, 4 NOT GIVEN; A4/B3/C3/D3 MCQs; 14 exact gap fills).

---

## 2. Defects Audited & Resolution Table

| Component | Item / Question ID | Category | Defect Inspected / Audited | Resolution / Verification Applied |
|---|---|---|---|---|
| IELTS Reading | `r01-q07` through `r12-q06` (20 items) | Stem Copying / Giveaway | Question prompts previously reused passage sentences nearly verbatim, allowing learners to solve without understanding. | Paraphrased stems with structural transformations and lexical substitutions; answers remain strictly lifted from passage text. Passed 6-gram overlap test. |
| IELTS Reading | All 30 Passages (TFNG/YNNG) | Key Distribution & Monolithic Traps | Passages with all-TRUE or missing NOT GIVEN distort test-taking probabilities and learner confidence. | Audited all 30 passages: 100% have >=1 NOT GIVEN and >=2 distinct keys. Zero monolithic key patterns. |
| IELTS Reading | `r02-q08`, `r05-q06`, `r15-q09..11`, `r16-q07` | Numeric / Unit Formatting | Learners writing `35%` vs `35 percent` or `2.5 kg` vs `2.5 kilograms`. | Verified multi-variant answer arrays `["35 percent", "35%", "35"]` and `["2.5 kilograms", "2.5 kg", "2.5"]`, ensuring fair automated scoring while enforcing passage grounding. |
| IELTS Reading | `r18-q12`, `r24-q11` | Orthographic Variants (UK/US) | UK spelling in text (`sulphur dioxide`, `vigour`) vs US standard (`sulfur dioxide`, `vigor`). | Verified dual-spelling acceptance arrays so phonetic/orthographic variation never causes false negative penalties. |
| Intensive Reading | `reading-a1-1` to `reading-c2-1` (21 articles) | Pedagogical Progression | Potential gaps in comprehension checks or missing L1 scaffolding in syntax dissection. | Verified all 21 articles have >=2 comprehension questions, explicit clausal breakdown (SVO + subordinate clauses), and Vietnamese pedagogical explanations in parentheses. |
| Sentence Mining | Cloze Generation Engine | Cloze Target Missing | Target vocabulary word missing from its context sentence in sentence mining blocks. | Verified 100% exact boundary match (`\b<word>\b`) across all articles in `reading.md`. |
| Reading Drills | Drills 1–14 | Distractor Plausibility & Trap Deconstruction | Superficial distractors or circular rationales. | Verified each drill features an active Synonym Mapping Engine (`ie-syn-matrix`) and dedicated Examiner Trap Deconstruction (`trapExplanation`). |

---

## 3. Automated Invariants & Regression Guardrails

The test `web/scripts/verify-reading-quality-audit.cjs` was implemented and integrated into the CI test runner. It enforces:
1. `reading.md`: >=21 articles, valid CEFR tags, >=2 comprehension checks per article with answers, clausal syntax dissection with Vietnamese translations, and target word containment.
2. IELTS reading parts 1–7: Exactly 30 passages, 400 questions, 0 copied stems (hits < 2), valid `why` lines (>10 chars), 100% verified evidence slice equality, >=1 NOT GIVEN per TFNG passage, and 100% passage substring match on completion answers.
3. Reading attack drills: All 14 drill IDs present with `trapExplanation`, `rationale`, and synonym mapping pairs.
4. Exam Cockpit: 40 questions spanning all 3 passages with balanced keys.

