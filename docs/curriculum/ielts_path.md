# IELTS Academic 7.0: guided study path

The path turns the IELTS side into a week-by-week plan. It starts from each skill's recent attempts, sets a length of 4 to 24 weeks (0 once all four gates pass), puts most of the time on Reading, and shows a readiness gate per skill. The logic lives in `web/src/ielts/path.ts`, the view in `web/src/ielts/views/path.ts`, and the checks in `web/scripts/verify-ielts-path.cjs`. Keep this document and `path.ts` in step.

## 1. Starting band

- The placement is the **earliest recorded attempt** in each skill (Listening, Reading, Writing, Speaking). It sets the placement cards and the weakest skill (section 3).
- Current band per skill = mean of the **last 3 attempts**. Listening and Reading count mock tests only, as the gate does. Until a skill has such an attempt, its placement is used.
- Start band = mean of the current bands, rounded to the nearest half band.
- Skills not yet tested are left out of the mean. Until at least one skill has a result, the path asks for one short test per skill and shows no roadmap.

## 2. Length of the roadmap

| Start band | Weeks |
|---|---|
| 7.0 or higher | 4 (minimum); 0 once all four gates pass |
| 6.5 | 4 (the formula gives 3, so the minimum applies) |
| 6.0 | 6 |
| 5.5 | 9 |
| 5.0 | 12 |
| 4.5 | 15 |
| 4.0 | 18 |
| 3.5 | 21 |
| 3.0 or lower | 24 (cap) |

Rule: 6 weeks for each whole band below 7.0 (3 weeks for a half band), capped at 24. Until every gate passes, the roadmap is at least 4 weeks: one full task cycle ending in a mock. Once all four gates pass, the roadmap is empty and the path says no study weeks are left; the gate still shows.

## 3. Focus skill

- The focus skill is **Reading**. This is a choice, not a score: the learner does not yet trust the Listening, Writing and Speaking results.
- Listening, Writing and Speaking still get the rotating third week, and their gates still count toward 7.0.
- `weakestSkill()` in `path.ts` (lowest placement band) is kept but the roadmap no longer uses it.

## 4. Week-by-week roadmap

- Weeks rotate through four task types: **strategy cards**, **skill drill**, **vocabulary review**, **full mock**.
- Reading owns two weeks in every three. The third week goes to the other skills in turn.
- Routes: strategy and drill weeks open the skill's page; vocabulary weeks open `#vocab`; mock weeks open `#mock`.
- Each week can be marked done. The next task is the first week not yet done. When all weeks are done and every gate passes, the path says the roadmap is complete. When all weeks are done but a gate is still red, the path adds another 4-week cycle, so the roadmap runs until all four gates pass.
- Mark-done state is kept by week number and is never rewritten on load. If the length shrinks, weeks past the new end are hidden; they return if the length grows again. A mark stays on its week number even when the skill shown for that week changes.

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

- The week count uses the last 3 attempts, so a few lucky or unlucky results can move it. Placement still sets the placement cards and the fallback start band, but it no longer picks the focus skill.
- The roadmap sets the order of work, not the content. Content lives in the skill pages.
- The gate does not check the quality of Writing and Speaking work. It checks the learner's own rating.
