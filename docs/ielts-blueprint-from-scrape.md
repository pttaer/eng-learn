# IELTS Blueprint From the Scraped Mock Tests

Read-only analysis of `data/scraped-ielts` (66 practice tests, four skills each, 264 skill files). Structure and counts only. No item text is reproduced. Any phrase quoted is five words or fewer.

Counts were produced by scripts on 2026-10-20. Items marked *estimate* come from keyword or hand sampling, not a full read.

## 1. Volume

- 66 practice tests, each with listening, reading, writing and speaking files (264 skill files).
- Listening: 2636 questions, about 40 per test. Every test has 4 sections.
- Reading: 2633 questions, about 40 per test. 65 tests have 3 passages; 1 test has 4.
- Reading passages average about 836 words (range about 400 to 1640).
- Writing: 66 Task 1 and 66 Task 2 prompts.
- Speaking: 61 tests have Parts 1, 2 and 3. 5 tests have no speaking parts.

## 2. Listening

- 4 sections per test.
- Labels cover two question types: gap fill (includes form completion) and multiple choice.
- Word-limit wording, counted across prompts: "NO MORE THAN TWO" 269, "ONE WORD" 189, "NO MORE THAN THREE" 83, "NO MORE THAN ONE" 10. Use the same limit rule in our own wording.
- Listening source files carry no full scripts. Explanations quote fragments, and the sets link YouTube videos. Nothing from them ships to the app.

## 3. Reading

Question types in the scraped labels: gap fill 968, multiple choice 984, true/false/not given 536, yes/no/not given 145.

The labels are coarse, so the mix is an estimate:
- In a sample of 20 `multiple_choice` items read by hand, 12 were matching questions (numbered prompts with a shared list of options, which the scrape does not carry) and 8 were true multiple choice.
- Among all 984 `multiple_choice` items, 389 have an explanation in the matching pattern.
- 8 of the 20 sampled items carry only an instruction line as their prompt, with an empty explanation. They appear to be missing their question stem. Do not rely on them as examples.

## 4. Writing

Task 1 (estimate, keyword classification):
- All 66 Task 1 prompts come with a chart image. Structured data must be redrawn with original numbers.
- 38 of 66 prompts do not name a chart kind (they say "chart" or "charts" generically).
- Named kinds: table 8, bar 5, pie 3, line 4, map 3, process 2, other 3.

Task 2 (estimate, keyword classification):
- Opinion (agree, to what extent) 29; discussion (both views) 13; advantages and disadvantages 12; problem and solution 3; other 9.

## 5. Speaking

- Part 1: one topic block per test, with about 16 questions per block on average.
- Part 2: one cue card per test.
- Part 3: a set of follow-up questions per test. Bullet counts for Part 2 were not measured.

## 6. Instruction wording (written in our own words)

1. Pick the one correct letter from the options listed.
2. Write no more than the stated number of words for each gap.
3. Mark each statement true, false or not given, based only on the passage.
4. Mark each statement yes, no or not given, based on the writer's views.
5. Match each numbered item to the heading or option that fits it best.
6. Summarise the chart: select and report the main features, and make comparisons where relevant.
7. Write a letter that covers each bullet point in the prompt.

## 7. Consequences for the plan

- Use the counts above as the target shape for each original test: 4 listening sections, 40 listening questions, 3 reading passages, 40 reading questions, one Task 1 chart, one Task 2 prompt, and one speaking set (Parts 1 to 3).
- Matching-style reading items need the app's `match` and `heading` types, which the scrape does not label. Classify them by hand when writing originals.
- Treat the scraped type labels as hints only.
