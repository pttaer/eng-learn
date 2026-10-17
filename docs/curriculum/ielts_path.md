# IELTS Academic 7.0: guided study path

The path turns the IELTS side into a week-by-week plan. It starts from the learner's first attempt in each skill, sets a length of 12 to 24 weeks, puts most of the time on the weakest skill, and shows a readiness gate per skill. The logic lives in `web/src/ielts/path.ts`, the view in `web/src/ielts/views/path.ts`, and the checks in `web/scripts/verify-ielts-path.cjs`. Keep this document and `path.ts` in step.

## 1. Starting band (placement)

- The placement is the **earliest recorded attempt** in each skill (Listening, Reading, Writing, Speaking).
- Start band = mean of the placement bands, rounded to the nearest half band.
- Skills not yet tested are left out of the mean. Until at least one skill has a result, the path asks for one short test per skill and shows no roadmap.

## 2. Length of the roadmap

| Start band | Weeks |
|---|---|
| 7.0 or higher | 12 |
| 6.5 | 15 |
| 6.0 | 18 |
| 5.5 | 21 |
| 5.0 or lower | 24 (cap) |

Rule: 12 weeks, plus 6 weeks for each whole band below 7.0, capped at 24.

## 3. Weakest skill

- The weakest skill is the lowest placement band.
- A skill with no placement counts as the weakest, so it gets tested first.
- Ties go to the first skill in the order Listening, Reading, Writing, Speaking.

## 4. Week-by-week roadmap

- Weeks rotate through four task types: **strategy cards**, **skill drill**, **vocabulary review**, **full mock**.
- The weakest skill owns two weeks in every three. The third week goes to the other skills in turn.
- Routes: strategy and drill weeks open the skill's page; vocabulary weeks open `#vocab`; mock weeks open `#mock`.
- Each week can be marked done. The next task is the first week not yet done. When all weeks are done, the path says the roadmap is complete and points to the gate.

## 5. Readiness gate (7.0 per skill)

| Skill | Pass rule | Source |
|---|---|---|
| Listening | last 2 mock tests each 7.0 or higher | mock results |
| Reading | last 2 mock tests each 7.0 or higher | mock results |
| Writing | mean of last 3 estimates is 6.5 or higher | self-rating estimates |
| Speaking | mean of last 3 estimates is 6.5 or higher | self-rating estimates |

- Writing and Speaking estimates never certify a learner alone. They are self-ratings against the rubric. The gate shows them as estimates.
- Overall 7.0 is reached only when all four gates pass.

## 6. Storage and scope

- Attempts come from the existing IELTS progress store (`IELTS_STATE`).
- Mark-done state is stored per viewer under `IELTS_PATH`. Blocked or private storage means the progress is not kept between visits. The roadmap still renders.
- Scoring is local. No API, no LLM, no new dependency.

## 7. Known limits

- Placement is one attempt per skill. A single lucky or unlucky result sets the start band, so the path can be too long or too short. Retake the placement before trusting the week count.
- The roadmap sets the order of work, not the content. Content lives in the skill pages.
- The gate does not check the quality of Writing and Speaking work. It checks the learner's own rating.
