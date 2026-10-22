# Content flaws audit — web/content (2026-10-21)

## Fix pass status (2026-10-22, second pass)

Checks after the pass: `npm run content:compile` passes, `test:content` passes, `tsc --noEmit` passes, `run-verify` passes 82/82.

**Decisions and what changed**

- **Collocations:** kept 21 deletions (audit duplicates, filler rows, near-duplicates, "trust someone"). Restored 16 AI/computing rows (indices 611–712). IDs come from the Index column, so no IDs shifted. The 21 removed IDs orphan any saved progress on them.
- **Grammar L1 C2:** gram-l1-06, 12, 18 and 24 were rewritten in place as genuine C2 items in their own vectors. The verifier needs exactly 6 rules per vector and at least 4 per tier, so adding items would break it. The old B2/B1 items they replaced are gone. gram-l1-08 stays A1 (it teaches be-negation). `verify-cefr-pedagogy` passes.
- **IELTS data path:** the practice mock, reading and listening views import `src/ielts/data/reading.json` and `listening.json`, built from `parts/`. Those already carry `why` on all 680 questions. `ielts.md` feeds `ielts.json` and `ielts-mock.json`, which no view imports, so the ielts.md fixes are correct but not visible in the app. The compiler now attaches `why` from `*Why Qn*` lines: 40/40 reading and 40/40 listening.
- **Diagnostic bank:** all 20 items already have an Explanation, which `diagnostic.ts` maps to `why`. No second field was added. Ambiguous distractors in diag-06, diag-11 and diag-20 were fixed.
- **IELTS content fixes in ielts.md:** Q7, Q11 and Q12 (listening); Q23–26, Q31, Q32, Q34–36 and Q37 (reading) stems and keys; MC answer letters rotated; band table General Training column removed; LaTeX replaced; surveyor renamed Hale to avoid clashing with Dr. Thorne; absurd distractors replaced (listening Q13–15, matching D and G, reading Q39–40); model word counts recounted; two unsourced figures hedged; chart note set to 30.
- **Map Q16–20:** no map asset exists in the repo. Questions kept, unverified. The practice views do not use this data.
- **Keino Campbell attribution:** kept. `check-ielts-provenance.cjs` passes (no 12-word run shared with the 264 scraped files). The rights question stays with the owner.
- **Habits:** `durationMin` set to measured averages (A1 37, A2 41, B1 46, B2 52, C1 56, C2 66). C2 gets a 10-minute copywork task. "Tier N" labels replaced. Promises the files cannot support (multi-speaker audio, dialogues, accent comparisons, comprehension questions) reworded to TTS listening.md passages or learner-written questions. Undefined "3-Pass Transcription Protocol" citations replaced with a plain description. Day 4, 8, 15, 28 and 30 errors fixed. LaTeX fixed.
- **Skill tree:** `src/core/skill-tree-data.ts` A2 title changed to "Short Paragraph" to match the drills mode.
- **Vocabulary:** the audit strings are gone from the file (sweep). Not every medium item was re-checked. The `Level` numbering was not checked.

**Still open**

- The per-topic folders `web/content/{collocations,diagnostic,drills,grammar,habits,ielts,listening,reading,vocabulary}/` are still on disk and tracked in git. The compiler ignores them. Deletion was blocked by the auto-mode permission classifier, so it is awaiting your approval. Copies are in the scratchpad backup `old-folders-2026-10-22`. Four verifiers now read the merged files instead (`verify-cefr-pedagogy`, `verify-diagnostic-questions`, `verify-adaptive-workout`, `verify-ielts-course-pipeline`), so they will not break when the folders go.
- `src/ielts/data/parts/` (about 680 practice questions across 30 passages and 28 sections) was never audited.
- Writing-model statistics: only two were hedged. The rest remain unverified (no web access).
- Day 29: C1 and C2 cut from 70 and 80 minutes to 60 each, matching other C days. Benchmark days 14, 21 and 28 are unchanged.

## Scope and method

- Files: `collocations.md`, `diagnostic.json`, `drills.md`, `grammar.md`, `habits.json`, `ielts.md`, `listening.md`, `reading.md`, `vocabulary.md` (9 files, about 20,000 lines, 1.45 MB).
- Nine read-only passes, one per file (vocabulary split at line 3543). Each pass read its full range, then reported findings by severity.
- Lead spot-checked the high-severity items and the cross-file claims against the files. Results are in "Verification status" below.
- Not checked: audio (listening), the compiled JSON in `web/src/assets/data/`, UI rendering, and whether any passage is copied from published IELTS material (no web access).

## Summary

| File | High | Med | Low | Total |
|---|---:|---:|---:|---:|
| reading.md | 3 | 14 | 15 | 32 |
| vocabulary.md, lines 1–3542 | 1 | 9 | 28 | 38 |
| vocabulary.md, lines 3543–end | 5 | 17 | 17 | 39 |
| listening.md + diagnostic.json | 0 | 12 | 28 | 40 |
| habits.json | 3 | 10 | 13 | 26 |
| collocations.md | 2 | 14 | 19 | 35 |
| grammar.md | 4 | 13 | 15 | 32 |
| drills.md | 3 | 13 | 24 | 40 |
| ielts.md | 6 | 15 | 14 | 35 |
| **Total** | **27** | **117** | **173** | **317** |

## Cross-file issues (fix first)

1. **Broken references in `habits.json`.** The plan cites `speaking.md`, `writing.md` and `collocations_part1.md` (54 citations). None exist in `web/content/`. Verified by directory listing. The § sections the plan points to do not exist in the files that do exist (`reading.md`, `listening.md`, `collocations.md`).
2. **`habits.json` tasks are recycled.** A1–B2 tasks use 7 weekday templates. Days 8–30 repeat days 1–7 under unrelated titles (e.g. Day 18 "Periodic Sentences" gives A1 a "make/do/take" task). Day 30 is cut off mid-task.
3. **IELTS evidence lines.** The IELTS audit found no question carrying a `why`/evidence line, while the app rules (E:\Eng\CLAUDE.md) require one per question. **Unresolved:** a case-insensitive grep returned 14 hits for "why" in prose and a `**Why` grep returned none on a second run. Re-check before acting on this.
4. **CEFR level vs CEFR Rank disagreement** (vocabulary). Seven Ascent entries and the "Level" number do not match the CEFR band. Re-band "Level" or align the two fields.
5. **Answer-key ambiguity across MCQ/gap items.** Several keys have a second defensible answer (grammar, diagnostic, drills, IELTS). Each is listed below.
6. **Vietnamese glosses.** Errors recur across files (vocabulary, collocations, drills, diagnostic). Native review of all Vietnamese is recommended.
7. **Level labels drift.** Items are often 1–2 CEFR bands off in several files (C1/C2 labels on B1/B2 content and the reverse). Level labels track topic technicality more than language difficulty.

## Verification status

Spot-checked by the lead against the files:

| Claim | Result |
|---|---|
| `habits.json` cites missing files (`speaking.md`, `writing.md`, `collocations_part1.md`) | Confirmed (54 citations; no such files in `web/content/`) |
| `grammar.md` line 1531: Vietnamese says adjectives of 2+ syllables take `more`, which is false | Confirmed |
| `drills.md` line 2057: English says "Severe flu", Vietnamese says "sốt xuất huyết" (dengue) | Confirmed |
| `collocations.md` row 24 "make a point": example uses "made a point of thanking" | Confirmed |
| `collocations.md` row 550 "crunch the numbers": "spent a week to crunch" is ungrammatical | Confirmed |
| `vocabulary.md` line 3506 "mitigate": `CEFR: C1` vs `CEFR Rank: B2` | Confirmed |
| `vocabulary.md` Tetracolon exemplar is a three-part series | Confirmed |
| `ielts.md` Q35 key "source of knowledge" is three words; word-limit instruction present (5 instances of "NO MORE THAN TWO WORDS") | Confirmed |
| `reading.md`: "Adapted from" CEFR passages | **Not present.** All passages say `source: "Original text written for this app"` (0 occurrences of "Adapted from"). The earlier tracked item is stale. |
| `reading.md` high items: "five people" vs six listed (a1-my-family); "cross-disciplinary synthesis" not in passage (b2-ai); "equitable" not in passage (b2-cities) | Confirmed by grep |
| `ielts.md` no `why` lines | **Unresolved** (see Cross-file issue 3) |

Not verified: all factual claims about the real world (statistics, dates, quotes, named studies). Those need sources.

---

## reading.md (32 items)

### High
- **line 1222** (b2-ai, Q3): answer lists "cross-disciplinary synthesis, and empathetic negotiation"; the passage names "problem formulation, strategic contextualization, and ethical oversight". Replace with the skills in the text. Also line 1218: "linguistic tasks" is not in the passage (paraphrase; unverified as an error).
- **line 1545** (b2-cities, "equitable"): Context is not in the passage ("equitable" never appears there). Swap in a word the passage uses (e.g. "decentralized", "tenet") or add the word to the passage.
- **line 227** (a1-my-family): "There are five people" but the family lists six (father, mother, me, brother, sister, grandmother). Change to "six people" and fix Q1 (line 239) and Précis (line 314). *Verified.*

### Medium
- **line 1246** (b2-ai, Sentence 3): quoted sentence is not in the passage; the real text is "Curricula emphasizing rote memorization are misaligned with contemporary labor requirements". Quote it verbatim and parse "emphasizing".
- **line 1477** (b2-cities): Sentences 2–3 are altered quotes ("distant facilities", "brief walking radius", dropped clause). Copy verbatim.
- **line 1483** (b2-cities, Sentence 2): "participial inversion" is wrong; "Rather than importing…" is a non-finite phrase, nothing is inverted.
- **line 747** (architecture-solitude): "in order to think" is a purpose adverbial in a contact relative clause, not a "Reduced Relative Clause with Infinitive of Purpose".
- **line 1814** (deep-work, Sentence 1): Object "handsomely for people" — "handsomely" is an adverb; the first clause has no direct object.
- **line 368** (a2-healthy-habits, Sentence 3) packs two sentences into one field; same at **line 504** (a2-lost, Sentence 4).
- **line 400** (a2-healthy-habits, "vegetable"): Context not in passage ("eat a vegetable with every meal" vs "eat fruit and vegetables").
- **line 1148** (b1-working-from-home, "colleague"): Context invented; passage says "they rarely see their colleagues".
- **line 81** (a1-at-the-market, "buy"): Context differs from passage ("My mother buys rice, fish and eggs."). Same pattern at lines 672, 889, 1018, 1305.
- **line 1260** (b2-ai, "proliferation"): Context not verbatim. Same pattern at 1296, 1417, 1426.
- **line 1207** (b2-ai, b2-remote-work, b2-cities): C1/C2 density ("supplanted", "serendipitous", "bio-filtration"). Simplify to B2 or relabel.
- **line 1677** (cognitive-bandwidth) and **line 1783** (deep-work-cognition): same argument in near-identical wording. Differentiate or drop one.

### Low
- **line 24**, 104, 314 (a1-at-the-market, a1-my-family): narrator's gender is never stated, but Q1 says "The girl". Use "A child".
- **line 2135** (orwell): "when a formula does not fit the facts" is a noun clause, not an adverbial of time.
- **line 1240** (b2-ai): "that the primary threat…" is an object noun clause of "caution", not a "noun complement clause".
- **line 861** (b1-learning, Sentence 3): mislabelled clauses.
- **line 1351** (b2-remote, Sentence 1): "Over the past decade" listed under subordinate clauses.
- **lines 1604, 2017, 2232, 2253**: copular complements labelled "Object"; write "Complement".
- **line 345** (a2-healthy-habits): "How often did the writer start to run?" is ungrammatical.
- **line 1765**: Incorporated Vocabulary items with no Sentence Mining entry ("chunks", "seclusion", "tacit pact", "consistent with").
- **line 2217** (precedent-and-discretion): missing blank line before "### Comprehension Checks".
- **line 1771** (deep-work-cognition): title promises "the Epistemology of Flow"; passage never mentions flow or epistemology.
- **line 769** (gradient): circular etymology. Use "from Latin gradiens, from gradus (step)".
- **line 653** (traffic): "tắc đường" means traffic jam, not traffic.
- **line 1189** (b1-working-from-home): Précis says "tired"; passage does not.
- **line 2079** (biodiversity, "privilege") and **line 1655** (rescind): Context changes the word form.
- **line 1202** (b2-ai wordCount 273 vs 239 actual): compiler recomputes; stale count not a content error.

---

## vocabulary.md, lines 1–3542 (38 items)

### High / Medium
- **line 3506** (mitigate): `CEFR: C1` vs `CEFR Rank: B2 / AWL Sublist 2`. Verified. Set Rank to C1.
- **line 3522** (anticipate): `CEFR: B2` vs `CEFR Rank: B1-B2`. Set to B2.
- **lines 3182–3486** (B2 phrasal verbs): C1 items (weed out, root out, pan out, tap into, zero in on, hinge on) with C1/C2-style contexts. *Unverified* CEFR judgment.
- **line 2856** (go on): definition "happen in a particular venue" is not a sense of the phrasal verb.
- **Synonyms wrong (med):** brother (`sibling, boy`), head/eye (`face`), hand (`arm, finger`), morning/night (`day, dawn` / `evening`), school (`class`), bed (`bunk`), open (`unlock`), hot (`warm`). Use `-` or a true synonym.
- **line 2892** (environment): "environment friendly" → "environmentally friendly".
- **line 2116** (society): "benefit society" is unnatural.

### Low
- Synonyms wrong (low): water, rice, apple (hypernyms); door (`entrance, gate`); delay (`wait`); lonely (`alone`); ambitious (`determined`).
- Collocations: cheap price, head "hurt my head" (→ "my head hurts"), pharmacy shop, shop door, hardly tolerate.
- Examples: agree ("because the film was too long"), healthy, "catch up with each other's news", "give in to the union's primary request", "fall behind the production target".
- Definitions: show up ("especially unexpectedly or late"), put on ("Wear clothes" should be "Start wearing").
- Headword: "the weather" (includes article; arguably A1).
- Duplicates: wake/wake up/get up; turn on/off vs switch on/off.
- CEFR levels likely off by one: perspective, privacy, tolerate, tedious, inevitable (*unverified*). Some B1 phrasal verbs misleveled (*unverified*).
- A2 Particle Logic / Semantic Archetype text is above A2 ("gravitational descent", "Egress into public space").
- support/benefit: definition vs collocate parts of speech disagree.
- Structure: missing `FILE` marker before B2 phrasal-verbs header (cosmetic). "Lexical Escalation" block drops from C1 to B2 mid-block. `Level: 1` on every entry (confirm the compiler does not use it).

---

## vocabulary.md, lines 3543–end (39 items)

### High
- **line 7042** (Tetracolon): exemplar "government of the people, by the people, for the people" is a three-part series. Same quote reused at line 6988 (Epistrophe). *Verified.* Replace with a real four-part series.
- **line 6990** (Anadiplosis, application): the application does not repeat the clause-final word at the next clause start. Rewrite (e.g. "Deforestation degrades soil. Soil sustains food security."). *Not re-checked by lead.*
- **line 6991** (Epanalepsis, application): does not start and end with the same word. Rewrite.
- **line 7012** (Antanaclasis, application): shows no meaning shift (this is polyptoton). Use a real same-word, shifted-meaning example.
- **line 7029** (Pleonasm, application): incoherent ("deliver null and void … in their entirety"). Rewrite.

### Medium
- **line 6892** (AWL "confirm bias") → "confirmation bias".
- **line 7040** (Anticlimax): "sleepless sleepless" duplicate word.
- **line 7044** (Bicolon): "Protect principle" → "principal".
- **line 7051** (Epiphonema): exemplar is a rhetorical question, not a summing-up sentiment.
- **line 6998** (Procatalepsis) and **line 6994** (Zeugma): quotes attributed to Cicero and Wodehouse look invented (*unverified*). Cite or mark constructed.
- **line 7077** ("Euphemos"): not a standard figure; near-duplicates Euphemism (*unverified*).
- **line 5672** (antipathy): "bất hảo" means disreputable, not hostile.
- **line 5740** (induce): "quy nạp" is the logic term, not the defined sense.
- **line 5518** (summon up): "whistleblow against" → "blow the whistle on".
- **lines 3570, 3586, 3618, 3794, 3858, 3906, 3922** (Ascent): CEFR vs CEFR Rank disagree (constrain, empirical, intrinsic, delineate, poignant, disenfranchise, corroborate).
- **line 3538** (Level numbers): Ascent L1 holds C1 words, L2 holds C2 words, Particle Lab L2 holds B2 phrasal verbs, Root Forge L1 has C2 fidelity, L3 has C1 induce/indigenous. Re-band Level or CEFR consistently.
- **line 6806** (AWL "prime ministry") → "prime minister" or "ministry of defense".
- **line 6893** (AWL "unchartered") → "uncharted".
- **line 6907** (AWL "eventual"): collocate "lead to eventual" truncated.
- **line 6599** (AWL "core" root): "cor → encored" is wrong (encore unrelated); use "cordial, courage, concord".
- **line 7072** (Invective): Kent-to-Oswald speech labelled only "King Lear"; line altered ("filthy knave" drops "worsted-stocking"). Quote exactly and credit II.ii.
- **line 7025** (Irony): "Water, water, everywhere" is situational irony, not verbal irony as defined. Add situational irony to the definition or change the exemplar.

### Low
- **Examples:** Exemplum (line 7053, ungrammatical), Hypotaxis (7067, awkward), Charientismos (7081, "ninety-nine ways how not to engineer"), Synesthesia (7050, self-contradicting).
- **Duplicates:** Ellipsis exemplar (7006) = Antithesis exemplar (6999); Anthropomorphism (7020) ≈ Personification (row 35).
- **Category:** Chrestomathy (7059) and Polysyllogism (7060) are not rhetorical figures.
- **Collocations (AWL):** "purchase power" → "purchasing power"; "substantial percent", "purely coincide", "unprecedented parallel", "is comprised of", furthermore (lists clauses).
- **Glosses:** "xúc tích" → "súc tích" (brief); sole ("lòng bàn chân" homonym), nuclear ("trung tâm gia đình" → "gia đình hạt nhân"), generation, margin, psychology, text, convert, injure. Fix each to match the English sense.
- **Root families (AWL):** "reframework", "ubiquitous" (for widespread), "final result" (outcome), "goalie" (*unverified*), "warfare" (welfare). Replace with true cognates or "-".
- **IPA:** one IPA given for words whose stress shifts (project, transfer, transport, contract, convert, exhibit, exploit).
- **CEFR inflation (phrasal/root):** chalk up (C2), pare down (C2), embark on (C1), inconsequential (C2); chronic and empathy (C1) are common words. Re-level.
- **Synonyms:** subsequent → "consequent" (means resulting); juxtapose → "collocate"; paradigm → "benchmark model".
- **administrate:** rare variant of "administer" with unnatural collocations.
- **Duplicates across sections:** 15 headwords appear twice (AWL table + Ascent or Root Forge): advocate, allocate, coherent, constrain, contradict, deduce, empirical, evaluate, extract, implement, induce, paradigm, predict, subsequent, sustain. Keep intentionally, or cross-reference.
- **Known:** Ascent B2 contexts use heavy corporate/tech jargon; later Particle Lab entries (after line 5110) are plainer. Rewrite early contexts at B2 register.
- **Climax** gloss "tiến thoái tam cấp" (advance-retreat) → "tiệm tiến".

---

## listening.md and diagnostic.json (40 items)

Structure passed: `diagnostic.json` parses, 30 unique IDs, every item has 4 options and a valid `answer` index pointing to the correct option. `listening.md` has 43 unique passage IDs. Per level: A1 6, A2 6, B1 10, B2 9, C1 8, C2 4.

### Medium
- **diag-c1-colloc:** "grant"/"accord" are attested with "credence", but the explanation says they do not pair with credence. Replace distractors (yield, afford, render, sustain) or soften.
- **diag-c1-write:** option 2 also subordinates the background clause; option 0 is a style preference. Make option 2 clearly worse or state the criterion in the prompt.
- **diag-c2-write:** English says "Option 1" (0-based), Vietnamese says "Câu 2" (1-based). "phép đảo ngữ" means inversion, not chiasmus. Align numbering; gloss chiasmus as "phép đối xứng chéo (ABBA)".
- **diag-b2-read:** "làm việc từ xa bất đối xứng" for asynchronous; use "làm việc không đồng bộ".
- **listening.md:130 / listen-b2-4 (line 314):** "intrusive /r/ in 'core project'" — the /r/ is real, not intrusive.
- **listening.md:74 (listen-1):** "elision in 'feed optimization'" is linking.
- **listening.md:82 (listen-2):** "assimilation in 'often suffer'" — no assimilation.
- **listening.md:330 (listen-b2-6):** "assimilation in 'bank statement'" — no assimilation; at most unreleased /k/.
- **listening.md:410 (listen-c2-4):** "central banking /n/→[ŋ]" — the /ŋ/ is inside "banking", not "central".
- **diag-b1-read:** C1 vocabulary ("indistinguishable", "acoustic clarity") at B1. Rewrite or relabel.
- **diag-b1-colloc:** "viable option … without compromising energy security" is B2+.
- **diag-a2-vocab:** "arrived late because our flight was delayed" is illogical; "rerouted/diverted" are above A2. Rewrite with simpler distractors.

### Low
- Level: diag-b2-read (C1 vocabulary), diag-a2-read (B1/B2 wording in options), diag-b2-gram (negative inversion is C1).
- Option labels: explanations use "Option 0/1/2"; quote option text or use letters (*unverified* how the UI labels them).
- diag-c2-write: "epistrophe" should be "parallelism".
- Vietnamese: "recommended that" glossed as "yêu cầu" (required); "ngữ điệu bản xứ" (intonation) should be "giọng bản xứ" (accent); "equilibrium" glossed as "quỹ đạo ổn định" (stable orbit); diag-a2-gram adds "forgot" not in the English.
- Leakage: `vietnamese` fields contain the answer or rule. Check the UI shows it only after answering (*unverified*).
- diag-a1-write: "requires … Place + Time" overclaims; say "typical".
- Stage 4 unused (*confirm intentional*). Answer-index counts 7/9/9/5 (light on index 3).
- listening.md: assimilation rule example "don't you → [dəʊntʃuː]" is yod-coalescence; "Australian /eɪ/ → /aɪ/" overstated; GA "broad æ" wording; "catenation in 'cut my'" is consonant + consonant; several C1 traps describe non-phenomena (listen-c1 items at lines 338–394); listen-b2-5 [slaɪs] needs devoicing note.
- Titles: listen-4 ("Compound Interest as Behavior" — no interest in text); listen-c2-2 ("Forensic Inquest" — text is about auditors).
- listen-b1-2: bridge/road mixed up (ambiguous). listen-b1-1: "call you again" → "call you back". listen-b1-3: "There was ten pounds" → "were". listen-c2-1: "communique" → "communiqué".
- listen-a1-6: /kɑːnt/ is RP only.
- Coverage: Vietnamese glosses only in 20 of 43 items; A1 items are 4–7 words long.
- Not checkable: no comprehension questions in listening.md (confirm they live elsewhere).

---

## habits.json (26 items)

JSON is valid: 30 days plus `levelRoutines`. Every day has the same keys. Days are sequential. `web/src/assets/data/habits.json` is identical.

### High
- **All days (cross-ref):** `speaking.md`, `writing.md`, `collocations_part1.md` do not exist in `web/content/`. Remove the citations or add the referenced documents. Affected days: 1–13, 15, 17, 18, 21, 22, 24–26, 28. *Verified.*
- **Day 30, line 1256:** "Ghi nhận rõ sự chuyển biến về:" ends in a colon with no list. The task also refers to "Day 1" recordings, which Day 1 does not have.
- **Days 3–6, 8–13, 15–20, 22–27, 29–30:** A1–B2 `tasksByLevel` are 7 templates. Titles and tasks disagree (e.g. Day 18 "Periodic Sentences/BLUF" → A1 "5 Make/Do/Take phrases"; Day 24 "Fall-Rise" → A1 vowel contrast; Day 29 "Capstone" → A1 "reading A1 (Day 29)"). Write day-specific tasks.

### Medium
- Days 15–30: A1–B2 learners repeat the same task four or five times.
- Day 24 (line 998, 1024, 1029): LaTeX `$\searrow\nearrow$` renders literally. Use "↘↗" or words.
- `durationMin` (levelRoutines) does not match actual task sums (A1 25–45m vs 15m stated, etc.). Align.
- Day 29: C1/C2 total is 70m; other C days 45–60m.
- Day 28 (line 1171): "review 250 phrases in `collocations_part1.md`" in 20m. The file does not exist; the plan never introduces 250.
- Days 4 and 8: memorise items 1–30 then 51–110 (60 items in 20m); items 31–50 never covered.
- Days 5/12/19/26 (B2): "Speed-Pacing 250 WPM" vs 300 WPM on Day 15. Reading-speed work on a speaking day.
- Day 15 (lines 609–611): 300 WPM and "triệt tiêu subvocalization" is a speed-reading myth. Lower to 200–250 WPM with comprehension check.
- Weeks 2–3 phase names do not match content (Day 18 periodic sentences sits in week 3).
- C2 `tasksByLevel` equals C1 and default on all days. Differentiate or document.

### Low
- Day 14 and 21 benchmarks identical to Day 7; no week-specific targets.
- Vietnamese terms: "Đa Giọng Điệu" (multiple tones; should be "đa giọng vùng miền"); "Mệnh Đề Chu Kỳ" (periodic sentence is a câu, not mệnh đề); "Chép Chính Tả Tốc Ký" (tốc ký is shorthand; use "Chép Chính Tả").
- Day 13: RP/Estuary vs Australian /r/ comparison is vacuous (both non-rhotic).
- Day 17: "đạt độ trùng khớp ngữ điệu trên 90%" cannot be measured by a self-learner.
- "Tier 2–5" listening levels are not defined in any file.
- Day 19: title "Chế Ngự Khung Giao Tiếp" has no matching task.
- Day 6: "Nghe Nhìn Đắm Chìm" (audio-visual) but the task is audio-only; "podcast dài 30 phút" (episodes run 40–55 min).
- Day 25: "250 words in 15 minutes" is aggressive.
- Day 2: "Phân tích độ chênh lệch" unclear.
- Days 29–30: `week: 4` spans 9 days (22–30). Intentional? Consider week 5.
- levelRoutines B2 "1 B2 Inversion rule" has no matching inversion task.

---

## collocations.md (35 items)

File is one 1336-row table. Scripted check passed: correct column count, no placeholders, no truncated rows, no exact duplicate phrases, indices ascending.

### High
- **line 554** (idx 550, "crunch the numbers"): "spent a week to crunch the numbers" is ungrammatical. Verified. → "spent a week crunching the numbers".
- **line 28** (idx 24, "make a point"): gloss "nêu ra một quan điểm" but the example uses "made a point of thanking". Verified. Change the example or relabel as "make a point of doing".

### Medium
- Wrong or unnatural collocation/usage: "corroborate evidence" (line 505); "pay respect to" (170, → "pay one's respects"); "steep incline" for demand (585); "branch out" in git sense (628); "breach of compliance" (438); "so far so good" (1002).
- Wrong example: "endangered species" (939, example is nonsense).
- Vietnamese: "have confidence in" glossed "tự tin vào" (self-confidence) (111); should be "tin tưởng vào".
- Category mislabels: IDIOMS block (lines 755–1004) mostly not idioms; ACADEMIC block from about line 595 mostly computing/AI jargon.
- Levels track topic, not language difficulty: "angel investor", "landfill site", "flash flood" C2; "spill the beans" B1.
- Duplicates: "a full-time job" / "full-time job"; "a part-time job" (both forms); "wash my hands" / "wash your hands"; "brush my teeth" / "brush your teeth"; "meet my friends" / "meet friends"; "keep a promise" / "keep your promise"; "go straight on" / "go straight ahead". Delete later copies.
- Numbering: 36 index numbers missing between 1142 and 1366. Renumber or confirm intentional.
- Spelling mixed (UK/US): harbor/harboured, defense/defence, marginalize/marginalise, organized/organised; programme/favour and color/behavior/fulfill. Choose one.

### Low
- Unnatural: "underfitting the model" (694); "infectious laugh" glossed as "nụ cười" (smile) (781); "draw up an agreement" glossed as "lập biên bản" (minutes) (263); "poison pill" gloss garbled (412); "self-esteem" glossed "lòng tự trọng" (self-respect) (840–842); "give a hand" / "give a lift" (no object) (149–150); "lend money to me" (1237); "set free the injured bird" (199).
- Levels: "make an inquiry" C1 (12); "close a deal" B1 vs "seal a deal" B2 (254/251); "have a rest" A1 vs "take a rest" A2 (1018/59).
- Not collocations: do without, make up, rely on (phrasal verbs); "trust someone"; free combinations like "a big house", "a cheap shirt", "a bus stop" (lines 1059–1134).
- Category: "send an email" BUSINESS vs "send a message" EVERYDAY; "express an opinion" ACADEMIC vs "share an opinion" EVERYDAY; linkers "for example" and "as a result" are labelled ACADEMIC collocations.
- Near-duplicates: gain/capture market share; strike a deal/strike a bargain; take effect/come into effect; run/launch a campaign; come to/draw/reach a conclusion; meet a deadline/meet a tight deadline; miss a flight/miss the plane.
- Gloss "hoàn thành xuất sắc" adds "excellently" (503). Bottom line example uses the wrong sense (401). "default on an obligation" example odd (281). "minority interest" use odd (411; *unverified*).
- Structure: no headings; A1–B1 items clustered at 1001–1372; CEFR order not contiguous.

---

## grammar.md (32 items)

Structure passed: 168 items, 168 unique IDs, all 10 fields present, no placeholders.

### High
- **line 2164** (gram-l1-16): backshifting taught as mandatory. "the quarterly revenue is satisfactory" is grammatical when still true, and contradicts b1-20. Say the default is backshift but optional for still-true statements; change the prompt to an unambiguous error.
- **line 2204** (gram-l1-18): "perfect participles are obligatory" is false ("Completing the audit report, the team submitted…" is fine). Say "Having + V3" makes anteriority explicit, not obligatory. Level C2 vs B2 for the same structure at cond-6 (line 565).
- **line 1531** (gram-a2-18): Vietnamese says 2+ syllable adjectives take `more` — false ("happy", "narrow", "simple" take -er). Key "more comfortable" is not derivable from "The train is fast." Verified. Use a 3+ syllable adjective in the prompt.
- **line 1607** (gram-a2-24): must / have to both defensible for "Students must wear a uniform". State that they are interchangeable here, or make the cue single-answer.

### Medium
- line 1740 (gram-b1-10): "If plants don't get water, they will die" labelled a common error; it is grammatical first conditional.
- line 685 (gram-cond-15): "it" in "Although it was seemingly an intractable deadlock…" is referential, not an expletive.
- line 423 (gram-subj-14): "Suffice it to say" is a formulaic subjunctive, not concessive.
- line 181 (gram-inv-14): title "All-Cleft & Reverse Wh-Cleft" but reverse wh-cleft is never taught.
- line 1210 (gram-a1-18): Vietnamese says "an" before vowel letters; English says vowel sound. Use "âm nguyên âm" and add "an hour".
- line 2023 (gram-l1-06): cue "/kt/ cluster (/spts/)" wrong for "aspects"; label is B2, not C2.
- line 663 (gram-cond-13): coordinated participle phrases mix passive and active ("Stunned by… and facing…").
- line 881 (gram-prec-12): squinting modifier has two valid repairs; key picks one.
- line 952 (gram-prec-17): pronoun referent ambiguous; key picks one reading.
- line 608 (gram-cond-9): "Danh từ riêng đi với phân từ" → "cụm danh từ".
- line 1541 (gram-a2-19): key "Today is better, but yesterday was hotter" is not a transformation of the prompt.
- line 2110 (gram-l1-12): bored/boring labelled C2; it is A2–B1.
- line 2290 (gram-l1-24): research/evidence uncountable labelled C2; B2.

### Low
- Key not unique: gram-l1-17 (type 2 also fits); gram-a1-9 ("I work" → he/she/it all fit), a1-14, a1-16; gram-prec-15 (second parallel fix).
- Exemplar mismatches: gram-a1-21 ("Those are my shoes" under "this/these"); gram-a1-9.
- "Never internally" overstated for "not" in gram-cond-12 (use "usually").
- Phonetics: gram-l1-04 "/sks/ → /æs/" and "desks" wrong; title "Stop-Fricative" wrong.
- Typo: line 10 "tại các luận điểm the chốt" → "then chốt".
- Which/that rule presented as universal (it is AmE prescriptive style).
- Level inconsistency across files: past simple A2 vs A1 (l1-13); present perfect B1 vs "already" A2.
- Note at line 979 says questions/negatives need do/does; a1-1, 2, 5, 7, 8 teach be/can/there is without it.
- Duplicate topic: "Wish + Past Simple" in b1-14 and subj-3.
- gram-subj-12 mixed conditional labelled B2 (C1).
- gram-prec-7, gram-prec-11 exemplars odd (certiorari, Chapter 11 vs liquidation) (*unverified*).
- gram-inv-13 title "Comparative/Degree Inversion with So/Such" — "Degree" only.

---

## drills.md (40 items)

212 items (speaking A1/A2/B1 ×12 and speaking-1..40; writing ×12 and writing-1..40; 60 scenarios). No placeholders, no duplicate IDs, all fields present. No answer keys in the file (category covered only via model answers).

### High
- **line 2057** (scen-a1 email): Vietnamese "sốt xuất huyết" (dengue) vs English "Severe flu". Verified. → "cúm nặng".
- **line 1632** (writing model): "publicly traded corporations are legally bound to maximize shareholder returns" — a rejected myth. Rewrite (e.g. "under strong pressure from investors").
- **line 1337** (writing model): "seventy-seven" disproportion figure with "identical test percentiles" — likely wrong (matched-score gap about 2×). *Unverified*; check the source or drop.

### Medium
- line 1889: outcome "coffee with plant-based milk", scaffold asks for "black coffee".
- line 959: all A2 writing items labelled "Six-Sentence Paragraph" but models have 4–5 sentences. Rename or pad.
- line 2671: "breakup proposal" context, scaffold says "acquisition".
- line 2581: "British ironic understatement" vs scaffold "exaggerating the issue".
- line 1606: "Orwellian allusion ('digital panopticon')" — Foucault/Bentham. Use "Foucauldian"; "unescapable" → "inescapable" (line 1605).
- line 1659: "withdrew hundreds of billions in bids" for the 2010 flash crash — overstated (*unverified*).
- line 1351: "67% surge in digital messaging" after open-plan move; the cited study reports a much smaller rise (*unverified*).
- line 1379: "over 70% of antimicrobials … not to treat diagnosed animal pathologies" — misstated (*unverified*).
- lines 1323, 1393, 1463, 1491, 1533, 1617, 1631, 1645, 1673, 1715: precise statistics with no source (35% gaps, "400% 2012–2022", "38% hunting success", "8% vs 80%", etc.). Hedge ("studies suggest") or cite (*unverified*).
- line 1850 (writing-40, B1): vocabulary is B2.
- lines 704, 724 (speaking-33, -35, B1): past/present perfect narrative and idioms are B2.
- lines 394, 444, 464, 614 (speaking-2, -7, -9, -24, B2): C1–C2 diction.
- line 990 (writing-a2-3): invitation tagged "Simple Formal"; writing-b1-5 duplicates the same task.

### Low
- C1 writing (lines 1724, 1738, 1766, writing-31/32/34): C1 features labelled B2.
- Model vs stylistic note mismatches: line 1052 ("will" for plans); lines 810, 950, 838, 922 (rules not demonstrated); lines 1578, 1648, 1466 (phrases cited are not in text).
- line 518: "/d/ in 'protecting freedom of speech and public trust'" — only "and" ends in /d/.
- Scenario inconsistencies: scen-a1-01 (hotel vs hostel); scen-a1-10 (doctor vs dentist; negotiate A1); scen-a1-06 scaffold "I am learning English" vs "computing course".
- Vietnamese mismatches: scen-b1-05 ("báo cáo khoa học" vs "news article"); scen-b2-10 "tiền định công nghệ" (predestination) → "quyết định luận công nghệ"; "Supreme Constitutional Court" → "Tòa án Hiến pháp"; scen-c2-05 "di nguyện" (post-death will) for a living patient; scen-b2-08 "cấp phép chéo" vs copyright dispute; scen-b2-01 "audit" vs retrofitting program.
- Levels: scen-b1-02 scaffold is B2+; C2 scaffolds (c2-06, c2-10) plainer than C1 ones.
- Prompt logic: scen-c1-04 mediator already picks Authority B's account; c2-08 argues one side.
- Repetition: A1/A2 topics recur (My Best Friend, Daily Routine, My Home, Favourite Food); AI/algorithms heavily repeated across speaking/writing/scenarios; surveillance and space also.
- Spelling UK/US mixed (behavioral/analyze/neighbor vs favourite/neighbour/ageing/practise).
- line 1408: "slow-wave executive circuitry" misuses a sleep-EEG term; 47-second figure is attention switching, not push notifications (*unverified*).

---

## ielts.md (35 items)

### High
- **Evidence lines (whole file):** the audit found no question with a `why`/evidence line (Reading Q1–40, Listening Q1–40, diag-01..20 have keys only). The app rules require one. **Unresolved in lead check** (see Cross-file issue 3). Add `why` with the evidence quote and extend the compile regexes.
- **line 359–363** (Listening Q11): key "community-led permaculture and protect wetland biodiversity" is not in the Session 2 transcript. Add the objective to the guide or rewrite the question.
- **line 238–239** (Q35): key "source of knowledge" is three words; limit is NO MORE THAN TWO WORDS. Verified (three words). Change the stem or the limit.
- **line 329** (Q7): key "monthly direct debit" is three words; form limit is TWO WORDS AND/OR A NUMBER. Key "direct debit" or change the limit to THREE.
- **line 391–399** (Q16–20, map labelling): no map asset or A–E legend in the file; letters are in order of mention, five labels for five facilities with no distractor. Confirm the asset exists; add a distractor; shuffle letters.
- **line 223** (Q31): verbatim copy of paragraph H; gives away Q40. Rewrite as a real paraphrase.

### Medium
- Cue leak: Q23 (line 168), Q25 (170), Q32 (232), Q34 (236) copy the passage almost word for word; the course's own rule (line 1477) says keys are "almost always paraphrased".
- line 174–175 (Q26): MRV and carbon accounting both defensible.
- line 170 (Q24): "supercritical" attached to the wrong storage approach.
- line 363–387 (Listening Q11–15): keys B, B, B, B, C; distractors absurd. Rotate letters; write plausible distractors.
- line 146–275 (Reading MCQ): keys B, C, A, B, C, B, C — D never correct (known letter bias). Q39 and Q40 distractors absurd.
- line 495–501 (Listening Q26–30): options repeat transcript phrasing; D and G absurd.
- line 1112 (diag-20): "led to ___ environmental degradation" — several options fit.
- line 916 (diag-06): "wield significant influence over" is an equally natural collocation.
- line 583 vs 599–603 (chart): data note says 0–120 in steps of 20; SVG gridlines at 30.
- line 623, 651, 668, 735: model word counts stated (184, 272, 338, 224); recount gives about 167, 255, 309, 201.
- line 811–821: band table headed "Academic & General" with a General Training column; app is Academic only.
- lines 771, 1134, 1309, 1555, 1656, 1697, 1779, 1801, 1879, 1940: personal authorship ("Keino Campbell, Esq.") and branded formula names with no source or licence (*confirm authorship and licence*).
- line 1902, 1930: model evidence stated as fact (Seoul 24% PM reduction; Scandinavian mobility ranking). Mark as illustrative or cite.
- lines 89, 168–176, 323–332, 543–558: answers embedded in blank text (`[Question 11: cognitive reserve]`). Confirm the rendered UI strips them.

### Low
- diag-11 (line 987): "critical threat"/"acute threat" both valid.
- line 1319: passages total about 2,050 words; course claims 2,150–2,750.
- line 2076: 7.5 GRA note lists "due to" as concession clauses.
- line 2081–2092: "Band 8.5 Model" scored 9.0 FC/PR; pronunciation rated from text.
- line 1170: unverified claim about removed introductory example.
- line 1544–1546: error-cause shares (40/35/25%) unsourced.
- Numbering gaps (17→23, 25→28); probably removed GT content.
- line 291–313 (Listening S1): no self-correction, no distractor; "Marcus Thorne" and "Dr. Thorne" share a surname.
- line 51, 60: heading vii shares "frontoparietal" with para E.
- line 73–74 (Q7): "functional neuroimaging" credited; para B names eye-tracking and priming (*unverified*).
- line 254 (Q37): "universal neurophysiological" credited to Rosch; para B attributes it to Kay and Regier (*unverified*).
- line 365–369, 397: Q12 and Q18 hints not in transcript.
- line 730, 806, 1387: raw LaTeX may render literally (*check render*).
- line 668–675: Task 2 band 8.5 model has no conclusion; line 1844 teaches one.

---

## Open items for the next session

1. Resolve the IELTS "why" evidence-line question (Cross-file issue 3).
2. Confirm which tracked items are stale: "Adapted from" (confirmed absent in `reading.md`), l3-s4-q10 (not found in `ielts.md`; check listening data separately), reading passage wordCount (compiler recomputes).
3. Decide the Vietnamese gloss standard (native review recommended).
4. Source-check factual and statistical claims in drills, reading, IELTS models and vocabulary etymologies before editing.
5. Re-band CEFR labels consistently (vocabulary Level vs CEFR Rank; drills and grammar level drift).
6. Decide whether `habits.json` should keep the 7-template structure or get day-specific tasks.
