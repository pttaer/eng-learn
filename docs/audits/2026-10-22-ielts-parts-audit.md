# IELTS practice parts audit (2026-10-22)

Scope: `web/src/ielts/data/parts/*.json` (30 reading passages, 7 original-style reading passages in `originals-reading-1.json`, 28 listening sections, 33 Task 1 and 45 Task 2 writing items, 2 speaking files with 31 Part 1 topics and 61 Part 2 cue cards, 1,502 vocab items). This is the source of the compiled files the app imports. The 2026-10-21 content audit lists this folder as never audited; this file covers it.

Status: complete. Report only. Nothing in the repo was edited, and no content was fixed.

Branch: `feat/ielts-path-reading-focus` at `4419814`. The session started on `content/ielts-cefr-fixes-2026-10-20`, and the checkout changed during the session. The parts data read here is the working-tree copy, which matches the compiled `parts/` merge.

## Method

1. Compiled-data check: merged `parts/` in a scratch script and compared with the tracked `reading.json`, `listening.json`, `writing1.json`, `writing2.json`, `vocab.json`, `originals-reading.json` and `speaking.json`. All seven match.
2. Mechanical checks (scratch script, not committed): duplicate IDs, `why` present, every quoted `why` string found verbatim in the passage, the paragraph a `why` names, answer keys in the option set, TFNG/YNNG spread per passage, heading keys unique, short-answer keys present in the passage, answer length, answer words repeated in the prompt, listening speaker names, completion answers against the script (numbers compared by value), writing word counts, Task 1 model numbers against chart data, cue-card bullet count, vocab headword in example, vocab duplicates across topics.
3. Semantic check by agents: each answer key decided from the passage or script alone, `why` quotes checked, second-defensible-answer and giveaway checks. Each High finding is spot-checked against the file before it is listed as confirmed. Agent-only findings are marked *unverified*.
4. The existing verifiers (`verify-ielts-content`, `-reading`, `-writing`, `-speaking`, `-vocab`, `-bands`) pass. They check structure and counts, not answer correctness, so they do not cover this audit.

## Findings

### Mechanical pass (checked by hand)

Verified results from the scratch checks. The raw hit counts from the older `deep-audit-ielts-parts.cjs` are not used: most of its 183 listening hits are false positives. Spoken numbers, dates and spelled-out letters were the main cause.

**Clean**

- Compiled data matches `parts/` for all seven tracked files.
- No duplicate IDs. Every question has a `why`. Every quoted string of 12 or more characters in a reading `why` is verbatim in its passage (see r12-q06 below). Listening `why` quotes were not machine-checked; the listening agents cover them.
- Every answer in short, sentence, summary and table items appears in its passage.
- Every TFNG/YNNG passage has at least two different keys and at least one NOT GIVEN.
- Heading answers are unique within each passage, and the option set is identical for every heading question in a passage.
- Every listening speaker in a script is in its section's `speakers` list.
- Every Task 1 and Task 2 model meets its minimum length (150 and 250 words). `deep-audit-writing1-charts.cjs` reports 0 issues.
- Reading passages are 13–14 questions each, and reading band labels run 6 to 8.5.

**Checked and resolved, not flaws**

- The `why` paragraph check flagged 8 items (r02-q12, r02-q13, r06-q12, r07-q13, r21-q12, r25-q08, r29-q08, r12-q06). In each, the `why` names one paragraph for the key and cites other paragraphs to rule out distractors. That is intended. Not a finding.
- r12-q06: the earlier audit reported the evidence quote missing. It is now present. The `why` splices two fragments of Paragraph D with an ellipsis, and both fragments are verbatim. Acceptable.
- r03-q10 and r10-q09 (answers over three words): r03-q10 has the three-word form "anterior prefrontal cortex" in its accepted list, and "11,000 years ago" is three words. The app's own short-answer placeholder says "no more than three words", so no finding.
- l2-s3-q09 ("which is NOT mentioned", key E "pH levels"): pH is not in the script. The listening agent checks the other four options.

**Low (verified)**

- **trn-037** (vocab-transport.json): the definition "an underground railway system in a city" contains the headword. A definition should not contain the word it defines.
- **r10-q11** (reading-2.json): accepted answers are "British Medical Journal" and "the British Medical Journal". "BMJ" is not accepted, and a learner who types the common abbreviation would be marked wrong.
- **l7-s3-q08** (listening-7.json): the key "Three" is the only option longer than the others. Option length is a weak signal, but it is a tell.
- **Duplicate prompts:** "The café closes at (time):" appears in l3-s2-q06 (answer 4 pm) and l5-s2-q09 (answer 5:30). "What is the writer's main point in paragraph G?" appears in r23-q10 and r26-q08. The prompts are ambiguous when shown alone.
- **Heading key distribution** across reading: i 6, ii 11, iii 7, iv 7, v 5, vi 4, vii 1. Key position is skewed toward ii. Not wrong, but worth balancing.

### Agent pass (unverified unless marked verified)

One agent per file group judged each key from its passage or script alone. The agents' evidence quotes were checked against the files: the 16 quotes that were grep-checked are found verbatim (the marked items below). The key and wording judgements are the agents' own, except the items marked **verified**, which were re-checked by hand.

Coverage: reading 30 of 30 passages; listening 28 of 28 sections; writing 33 Task 1 and 45 Task 2 items. Speaking and the vocab sample are still to be recorded (see the end of this section).

#### Reading

**reading-1.json (r01–r06, 80 questions)**

- Medium, r04-q09 (agent said High; downgraded). The agent says Chinese characters also fit. The passage dates "over 3,000 years" only to Egyptian hieroglyphics. Chinese is described as having "persisted and expanded to accommodate phonetic information" with no duration, so from the passage alone the key B holds. The agent's oracle-bone date is outside knowledge. Fix: tighten the stem to the passage wording, e.g. "stayed mainly logographic for over 3,000 years until alphabetic writing emerged." Quote grep-checked.
- Medium, r05-q12, giveaway. Option D is the only option that repeats the passage: "The WIC's failure reflected different competitive conditions in Atlantic trade." Quote grep-checked. Paraphrase D.
- Medium, r03-q14, weak distractors. C ("exactly 40 percent in every case") and D ("more than 40 percent in most trials") can be ruled out by wording alone, against the passage's "from 10 to 40 percent" (grep-checked). Use plausible numeric distractors.
- Low, r03-q08: "comprehension" is not accepted.
- Low, r03-q12: "deliberate" is accepted on its own, but it does not name the training approach the prompt asks for. Remove it.
- Low, r02-q11: "a 2 to 3 °C drop in heat". What falls is temperature.
- Low, r05 paragraph B: "Dutch commercial expansion was laid during the late 16th century" is ungrammatical. Grep-checked. Change "was laid" to "The foundations … were laid".

**reading-2.json (r07–r12, 80 questions)**

- Medium, r09-q08, giveaway. The summary is the passage sentence with the number blanked: "By 1801, approximately 100,000 people in England had received vaccinations." Grep-checked. Reword the frame.
- Medium, r09-q09, giveaway. The summary copies "By 1807, several European nations mandated vaccination programs as effectiveness became undeniable." with one word blanked. Not grep-checked.
- Low, r11-q03, UNSURE. FALSE is reached by inference. The passage never says what is on sale now, and the `why` adds "so production has not yet started", which the text does not say. Reword the prompt; quote "suggesting commercial viability approaching" in the `why`.
- Low, r10-q12. Option A says "Bread", but the passage figure (60–70% of calories) is for bread and grain-based foods together.
- Low, r08-q11. The prompt credits the 70% water saving to automated irrigation alone. The passage credits hydroponics and irrigation automation together.

**reading-3.json (r13–r15) and reading-4.json (r16), 53 questions**

- Medium, r13-q10, giveaway. The prompt repeats the passage clause ("a sudden spike in carbon-14 in the rings of a Japanese cedar") and changes only "spike" to "rise".
- Medium, r13-q11, giveaway. The prompt keeps the passage structure and the word "fixed" before the blank.
- Medium, r15-q14, giveaway. Option A is the only option that copies the passage: "It avoids presuming what people want" (grep-checked).
- Medium, r16-q06, giveaway. "aerial roots called ______ take in oxygen … from the air" copies the passage sentence. "aerial roots called pneumatophores" is grep-checked.
- Low, r14-q11: "archives" alone is not accepted.
- Low, r14-q04: the prompts spell "Maori"; the passage spells "Māori".
- Low, r16-q10: "origin of a term" goes beyond the passage, which says the term was popularised, not who coined it.
- Low, r16-q13: "the southern coast of Kenya" is not accepted.

**reading-5.json (r17–r21), 67 questions**

- Medium, r17-q09. The `why` rules out B using paragraph D's scale-model caution. B's real problem is that it never describes a single experiment. Rewrite the `why`.
- Medium, r17-q14, giveaway. "the shape of the seating bank turned out to matter more than the surface of the stone" with a word blanked.
- Low, r17-q12: the answer "steep slope" is the only accepted form. "The seats rise on a steep slope" is grep-checked, so "steep" should be accepted too.
- Low, r17-q13: the prompt says the circular "orchestra" is in every ancient theatre. The passage names it at Epidaurus only.
- Medium, r18-q06, giveaway. Option B copies the prompt: "researchers began to compare lichen communities with measured levels of sulphur dioxide" (grep-checked).
- Medium, r18-q07, giveaway. Option C copies the prompt's "analysed lichen tissue for metals".
- Low, r18-q08: the prompt is about "a lichen survey", but every option starts "They".
- Low, r18-q09: the options start "They" with no plural noun in the prompt for it to refer to.
- Medium, r18-q10, giveaway. "a photosynthetic partner, usually an alga or a cyanobacterium" with one word blanked.
- Medium, r18-q12, giveaway. "Sulphur dioxide, released when coal and oil are burned, was a major cause of acid rain" (grep-checked). Accept "sulfur dioxide" too.
- Low, r19-q02: the `why` quote shows only that orientation changed. The robin quote ("could orient themselves using magnetic cues") contradicts the claim more directly and should be added.
- Low, r19-q11: accept "beak" as well as "beaks".
- Medium, r19-q12, giveaway. "birds given light that is too dim or wrongly coloured lose their magnetic orientation" (grep-checked) with one word blanked.
- Medium, r19-q13, giveaway. "A migrating bird may use the magnetic field to estimate its latitude" with the last word blanked.
- Medium, r20-q06, giveaway. Option A copies "their users were often clerks, shopkeepers and the sons of the middle class".
- Medium, r20-q09, giveaway. The table cell repeats "Reading rooms that required silence and a formal dress code could discourage those" with the answer blanked.
- Medium, r20-q12. The `why` quote leaves out the answer words "spoke about improvement". Quote the full sentence.
- Medium, r21-q08. The features prompt gives away the answer to r21-q14 ("growth"), which tests the same fact.
- Medium, r21-q11, giveaway. "although even advanced plants are not perfect filters" with the clause restated.

**reading-6.json (r22–r26), 66 questions**

- Medium, r22-q10, giveaway. "oxidise hydrogen sulphide, a gas that is toxic to most animals" with one word blanked.
- Medium, r22-q11, giveaway. The prompt is close to a verbatim copy of the first sentence of paragraph A.
- Low, r22-q12: accept "a mouth or gut", "mouth and gut" and "a mouth and gut".
- Medium, r23-q08, giveaway. Option E is the only option that repeats "lunar distance tables".
- Medium, r23-q11. The `why` quote leaves out the year. "The scale of the difficulty became painfully clear in 1707" is grep-checked, so start the quote there.
- Low, r23-q13: duplicates r23-q07 (the same Board of Longitude sentence). The frame "Board of ______" also gives the answer.
- Low, r23-q12: accept "one", "1" and "1 degree" as well as "one degree".
- Low, r23-q10: the prompt asks for paragraph G's "main point", but the key is a detail. The key holds only because the distractors are weak.
- Medium, r24-q01, giveaway. "The scouts are the first to search." is copied from the passage (grep-checked).
- Medium, r24-q10. The `why` quote omits "threshold". Accept "quorum threshold" and "certain level".
- Low, r24-q11: near-verbatim wording ("the vigour of the dance is thought to signal its quality", grep-checked), so it weakly tests paraphrase.
- Low, r24-q12: accept "the distance" and "distance to the site".
- Low, r24-q13: accept "particular cavity types".
- Medium, r24-q14, giveaway. "A model based on these rules reproduces many features of real swarms" with one word blanked.
- Medium, r25-q09, giveaway. "was grown in large quantities in India and the Americas" is verbatim, and it tests the same sentence as r25-q02.
- Medium, r25-q10, giveaway. The frame "Coal tar, a by-product of coal gas production" copies the passage, so the answer is obvious.
- Medium, r25-q11, giveaway. "Early regulation was limited" (grep-checked) with the answer removed.
- Low, r25-q12: the prompt asks the colour of "the substance", but the passage calls the residue "dark". "dark" is a defensible answer. "vivid purple" is not accepted.
- Medium, r26-q10. "anger" and "angry" are defensible from "visible unfairness can make people angry out of proportion", but are not accepted.
- Medium, r26-q12, giveaway. "Waiting that is unoccupied tends to seem longer than waiting that is filled with activity" is verbatim, and it tests the same sentence as r26-q01.
- Medium, r26-q13, giveaway. "may reduce complaints even though the queue is not shorter" with the last word blanked.

**reading-7.json (r27–r30) and originals-reading-1.json (o01–o03), 93 questions**

- **High, r29-q13 (verified).** The prompt is "The tide changes the position of the shoreline ______ times a day." The key "twice" gives "twice times". The grammatical answer "two" is not accepted. Reword the frame to "…shoreline ______ a day", or accept "two".
- **High, o01-q13 (verified).** The summary is "correct the readings for ______ and salinity." Paragraph F says "Temperature, salinity and pressure all change the speed of sound", so "pressure" is also defensible. Accept "pressure", or reword the frame.
- Medium, o01-q09 and o01-q13. The q09 prompt ("measure water temperature and salinity") gives away the q13 answer.
- Medium, o02-q01. The prompt says "many" hives. The passage only says hives appear on these buildings, so the claim is NOT GIVEN. Drop "many".
- Medium, o02-q03, UNSURE. This is a YNNG item, but the `why` cites a view attributed to "Supporters". Make it a TFNG item, or cite the writer's own line.
- Medium, o02-q13. The prompt says "According to the writer", but the passage gives the claim to supporters.
- Medium, o02-q04. The `why` quotes the line about the debate, not the line that supports "success depends on management".
- Medium, o03-q09. Option D says critics "ignore" the social side. The passage says "underrate". The keyed option overstates them.
- Medium, r27-q10, r27-q11, r27-q13, giveaways. Each prompt is a passage sentence with one word blanked.
- Medium, r28-q11 and r28-q13, giveaways. The r28-q13 fact is also the keyed option of r28-q08 (D), so one item gives away the other.
- Medium, r29-q12 and r29-q14, giveaways. r29-q14 repeats the sentence used as evidence for r29-q05.
- Medium, r29-q03, r29-q06 and r29-q10. The r29-q03 prompt names "self-similarity", which is the answer to r29-q10. r29-q06 tests the same fact a third time.
- Medium, r30-q11, r30-q12 and r30-q13, giveaways. Each is a passage sentence with one word blanked.
- Medium, o01-q11, o03-q06 and o03-q07, giveaways. "Seeds are dried to a precise moisture level before storage" is copied.
- Low, r29-q01: the passage says "almost always"; the prompt drops the hedge.
- Low, r29-q11: "objects of this kind" has no referent in the prompt.
- Low, r29-q10: accept "self similarity".
- Low, r27-q12: accept "oxygen and hydrogen" and "hydrogen, oxygen".
- Low, r28-q12: accept "trophic cascades" and "a trophic cascade".
- Low, o01-q12: accept "mid ocean ridges". The `why` should start at "Mid-ocean ridges".
- Low, o02-q06: the prompt says "weather", but paragraph E is about urban heat stored by concrete and asphalt.
- Low, o02-q09: the table prompt "is ______ degrees higher" is awkward, and "few" is not accepted.
- Low, o02-q10: accept "a variety of flowering plants".
- Low, o02-q11: single-word answers are accepted, but the reversed order "asphalt and concrete" is not.
- Low, o02 paragraphs F and G: both end and begin with the same "Supporters" move. Delete the last sentence of F.
- Low, o03-q13: "sharing information" is equally correct and is not accepted.
- Low, r30 paragraph A: "for exactly this reason" has no referent after the coin-clipping sentence.

#### Listening

**listening-1.json to listening-4.json (16 sections, 160 questions)**

No High findings reported. The agent found no key contradicted by its script.

- Medium, l2-s1-q01. The prompt asks how the surname is spelled, but the `why` quotes the email spelling. The surname is spelled later, by the technician. Quote that instead.
- Medium, l2-s4-q10. "simulate ___ flow" with the key "airflow" reads as "airflow flow". Reword the prompt to "simulate ___ around complex shapes", or accept "air".
- Medium, giveaways (the stem repeats the script line with one word blanked): l1-s4-q02, q05, q07, q09; l2-s4-q02, q06; l2-s2-q05; l3-s4-q07, q08, q10; l4-s4-q03, q05, q06, q07, q09.
- Medium, the correct option is the only one that echoes the script: l3-s2-q05, l3-s3-q04, l3-s3-q06, l3-s4-q05, l3-s4-q06; and l4-s1-q06, q07, l4-s2-q06, l4-s3-q03, q07 (e.g. "I'll take the full cover, to be safe.").
- Low, l4-s1-q03: "C. automatic" is the only bare option, while each distractor has an elaboration.
- Low, l1-s4-q10: two blanks, but the key is three words. The two-word "renewable energy" is not accepted.
- Low, l1-s3-q06: the stem switches from "the group" to "we".
- Low, l2-s4 script: "By the nineteen twenty five" is ungrammatical, and TTS reads it as written.
- Low, l3-s4-q10: the accepted word "limit" is not in the script.
- Low, accepted forms missing: ordinal dates (l1-s1-q03, q04, q08); a grouped phone number (l1-s1-q02); "single room" (l1-s1-q05); "10 percent" and "60 percent" (l1-s2-q08, l1-s3-q02); digits "3" and "2" (l2-s3-q06, q07); "jet engine" (l2-s4-q09); "6" and "6.00" (l3-s1-q05); "the third" and "3rd" (l3-s1-q08); "14th March 1999" (l3-s1-q09); "4", "4.30 pm" and "16:30" (l3-s2-q06, q07); ordinal dates (l3-s3-q09, q10); "12th", "15th", "Friday 12" and "Monday 15" (l4-s1-q01, q02); bare "6", "10" and "six" (l4-s1-q09, l4-s2-q10); "9th February" (l4-s3-q10); digit "5" (l4-s4-q07).

**listening-5.json to listening-7.json (12 sections, 120 questions)**

No key is wrong, and no question has two defensible answers. Every value the agent checked matches its script.

- Medium, giveaways (the prompt is the script line with one word blanked): l5-s2-q05; l5-s3-q02 (the prompt repeats the STAR list); l5-s4-q04, q05, q07; l6-s1-q04 ("third floor"); l6-s2-q08 ("It runs every fifteen minutes." is grep-checked); l6-s4-q03, q09, q10; l7-s2-q01, q04, q07, q09; l7-s4-q01 to q10 (all ten prompts).
- Medium, l7-s4-q09. The `why` paraphrases the script instead of quoting it.
- Low, l5-s2 script: it says "four main rooms", then calls the clock room "final", then introduces "the next room". Change "final" to "fourth", or drop "four".
- Low, l5-s3 script: the adviser says "Thank you" and then goes on giving advice. Move the line and drop "Thank you".
- Low, l6-s3-q02: the stem ends "to the:", and every option starts "the" again. Drop "the" from one of them.
- Low, l6-s3-q10: "6 (Friday)" is an odd stored form. Accept "6th", "Friday 6" and "6".
- Low, accepted forms missing: "EF3 72" (l5-s1-q02); "Tuesday 22", "22" and "22nd" (l5-s1-q04); "5.30 pm", "17:30" and "17.30" (l5-s2-q09); "25 percent" and "quarter" (l5-s3-q04, l6-s4-q02); "10:30 am" (l5-s3-q10); "less than one percent" (l6-s4-q01); "8.30 am" (l6-s1-q08); "client" (l6-s3-q09); "200,000" and "200000" (l7-s2-q02); "March 14" (l7-s1-q02); "£12.50" and "12.5" (l7-s1-q04); "3rd of December" (l7-s3-q10).
- Low, l7-s3-q08: "We have budget for three" means the team can afford three recorders, not that it has three. Reword the prompt as "How many recorders can the team afford?"

#### Writing

**Task 1 (33 items; chart data checked)**

- **High, w1-18 (writing1-2.json, verified).** The model says rural areas grew fastest and "narrowed the gap considerably". In points, the urban–rural gap is 27 (2005), 40 (2010), 43 (2015), 37 (2020) and 31 (2025). It is wider at the end. Only the ratio narrowed (8/35 to 60/91). Rewrite the sentence and the summary.
- **High, w1-20 (writing1-2.json, verified).** "Their figures were consistently higher than those of every other group in both years" is false for 30–45. In 2015 it is 3.2, below 12–17 (3.4) and 18–29 (4.6). In 2025 it is 4.0, below 12–17 (5.1) and 18–29 (6.2). It beats only under-12.
- Medium, w1-23 (writing1-2.json, verified against the chart). Russia 22% and EU 18% together make 40%, which is not "just under half". Say "two-fifths". The closing sentence about shortages and world prices is not in the chart, so delete it.
- Medium, w1-31 (writing1-3.json). The 2005 map shows holiday apartments on the eastern headland, and the model never mentions them.
- Medium, w1-27 (writing1-3.json). The summary mentions "rail connections", but the body never describes the new train station to the west of the centre.
- Low, w1-19: "the fastest-growing subject" is true in absolute terms only. Health grew faster proportionally. Say "largest increase".
- Low, w1-17: "when output passed 60 TWh" is exactly 60. "Denmark's share" is used, but no shares are charted.
- Low, w1-18 (writing1-2.json): "passing 91% by 2025" should be "reaching 91%".
- Low, w1-02 (writing1-1.json, agent-reported, not re-checked): "doubled again" presupposes an earlier doubling that the sentence does not show.
- Low, w1-16 (writing1-3.json): the chart says the port was "Expanded"; the model says it "had been replaced by a modern container port".
- Low, w1-33 (writing1-4.json): "suggests a milder climate" is speculation, and "total" is the wrong word for averages.
- Cleared: the 15 model numbers that the mechanical check flagged are all correct derivations or formatting (for example 3.0 for 3). The agent's word counts of 148 and 149 for w1-20 and w1-29 are not findings: whitespace count gives 151 and 152. Process prompts that say "make comparisons where relevant" use the standard IELTS wording, so that is not a finding either.

**Task 2 (45 items; models, notes and criteria read)**

- Medium, w2-45 (writing2-5.json; agent said High, downgraded). The intro says "I largely agree that practical skills deserve far more time", then rejects replacing academic study. The stance is partly agree, but the opening signals "largely agree". Use "I partly agree" in the intro and conclusion, and align the criteria and notes.
- Medium, w2-38 (writing2-3.json). essayType is "advantage", but the prompt is "To what extent do you agree or disagree?", which is "opinion". The position is also muddled (the intro says the benefits "are not always greater than the costs"; the conclusion says they outweigh them when managed).
- Medium, w2-28 (writing2-2.json). The notes say a separate paragraph explains why the problems are manageable. That reasoning is the last sentence of the disadvantages paragraph.
- Medium, w2-40 (writing2-3.json). essayType is "twopart", but the prompt is "Discuss both views and give your own opinion", so it should be "discuss". The grammar criterion quotes "should be kept", which the model does not contain.
- Low, w2-19: the criteria say "First, Second, Third, Finally". The model says "Moreover" for the third point.
- Low, w2-10: the grammar criterion calls "from village to city" an error. It is a fixed phrase. The real slip in band6 is "have better life".
- Low, w2-39: the criterion calls "leave few quiet corners" a participle clause. It is a finite verb. The criteria also say each cause has its own paragraph, but they share one.
- Low, w2-14: the notes give a First/Second/Third order that does not match. "Cities that have introduced such charges have generally seen fewer cars" is an unsourced claim.
- Low, w2-16: "has proved more successful in several countries" is an unsourced claim. Hedge it.
- Low, w2-22 (writing2-2.json): the prompt bans advertising for children "under twelve", but the essay covers only young children. "Research in child development generally shows" names no source.
- Low, w2-17: notes shown to learners include "no invented statistics are needed to sound convincing". Delete that clause.
- Low, w2-32: the conclusion repeats the intro almost word for word.
- Low, w2-36 to w2-44: several models pad to length with filler that repeats earlier points or drifts off the question. w2-44 notes say "three measures", but the model gives six or more, and it adds employer and school measures when the prompt asks about governments.
- Low, w2-36 and w2-37: the notes claim examples that the models do not give. In w2-37 the criteria order "views, harm, benefit, opinion" does not match the text.
- Low, w2-36 to w2-40: these five prompts lack the "Give reasons for your answer…" sentence the other prompts have.
- Low, w2-44: "partly personal choice", then "a personal decision", so the position is not committed.
- Checked and fine: every model is 259–316 words, has 4–5 paragraphs, and answers the prompt.

**Dead data (verified).** `band6` and `criteria` are used only by the Speaking view (`views/speaking.ts`, lines 118–120 and 217). The Writing view renders only `model` and `notes`. So the 45 Task 2 `band6` texts (35–54 words each, flagged by the mechanical check) and all `criteria` are never shown. If they are ever shown next to the 260–316-word models, the mismatch would be obvious. Either remove them, or write full-length band 6 samples before exposing them.

#### Speaking and vocab sample

**Speaking (`speaking-part1-*.json`, `speaking-part2-*.json`, all 61 Part 2 cards and 30 Part 1 topic sets).** Every Part 2 card has four bullets, and every Part 3 set links to its Part 2 topic. Every model answers its cue. The `band6` and `notes` fields were not reviewed.

- Medium, s2-12 (speaking-part2-1.json, grep-checked). The model answer about Iceland contains a garbled self-correction: "major attractions like Niagara Falls – well actually, the Icelandic equivalent –". Learners may copy it. Replace with "major attractions like Gullfoss waterfall, geysers and glaciers".
- Medium, s2-30 (speaking-part2-2.json, grep-checked). Agreement error: "my employer, who were actually quite understanding". Change to "who was".
- Medium, s2-17 (speaking-part2-2.json). The model says "I was flying from Ho Chi Minh City", then describes several buses. Change "flying" to "travelling".
- Low, s2-15 (speaking-part2-1.json). About 323 words, too long for a two-minute slot. "very lucrative job offer from a large multinational company" is implausible for a school-leaver.
- Low, s2-14 (speaking-part2-1.json). About 304 words, over the 300-word ceiling.
- Low, s2-09 (speaking-part2-1.json). "the first generation to have the opportunity to attend university" is an odd phrase. The persona also clashes with s2-15: graduation is "four years ago" in one and "two years ago" in the other.
- Low, all 15 cards in speaking-part2-3.json (s2-31 to s2-45) and all 16 cards in speaking-part2-4/5 (s2-46 to s2-61). Models are 177–193 words, about 75 seconds of speech, short of the one-to-two-minute target. Extend each by two or three sentences.
- Low, s2-18 (speaking-part2-2.json). 199 words, just under 200.
- Low, s2-16, s2-18, s2-25, s2-26 (speaking-part2-2.json). American spellings ("demeanor", "favorite", "neighbor", "color") in a British-spelling app. The s2-25 cue says "neighbor", while Part 1 says "neighbours".
- Low, s2-19 (speaking-part2-2.json). Near-duplicate of s2-13: both describe a smartphone with the same points. s2-05 and s2-22 are also near-duplicate skill-learning cards.
- Low, s2-12 and s2-17. Part 3 questions mention the pandemic, which dates the content.
- Low, Part 1 wording (speaking-part1-1.json and -2.json). "Has reading habits changed with technology?" is ungrammatical. "Can you cook your national dishes?" and "eat healthy" are unnatural. The Technology and Accommodation topics ask abstract Part 3-style questions. Several other topics (Birthdays, Museums, Noise, Parks and Gardens, Animals, Sleep, Learning Languages, Art) each include one opinion question at Part 3 level. The Cycling topic in speaking-part1-3.json has two Part 3-level questions.

**Vocab sample (`vocab-*.json`, first 15 items of each of the 20 files, 300 of 1,502 items).** This is a sample, not a full check. Definitions and examples were sound throughout, and the agent found no wrong definition. Most problems are weak or non-idiomatic paraphrases and collocations.

- Medium, sibling (vocab-family.json, grep-checked). "fellow child" is not a synonym. Drop it.
- Low, paraphrases that differ in meaning: guardian ("carer" differs from legal responsibility); ancestry ("forebears" means people, not the abstract noun); upbringing ("childhood training" is misleading); kinship ("blood relationship" excludes kinship by marriage); gallery ("art museum" is not a synonym); curator ("gallery keeper" is not a real phrase); tertiary ("higher-level" is vague); wind turbine ("windmill-style generator" is misleading); arable ("cultivated" means already farmed); smallholder ("peasant farmer" is dated and can be offensive); hypothesis ("a proposed theory" blurs hypothesis and theory); competitive ("ambitious" is a different meaning); encryption ("coding of data" suggests programming); managerial ("executive" differs); entrepreneur ("business owner" does not imply risk-taking); pronunciation ("enunciation" means clarity of speech); journalism, circulation and subscription (paraphrases are not synonyms); census ("population survey" is wrong, because a census counts everyone); birth rate ("rate of childbirth" loses "per thousand"); ageing ("maturing" is wrong for populations).
- Low, non-idiomatic or odd collocations: "an oil on canvas" (canvas); "cross genres" (genre); "brutal perpetrator" (perpetrator); "headline" ("catch the headlines" should be "hit the headlines"); "geothermal" ("earth-heat"); "hydroelectric" ("water-generated"); "mass tourism" ("travel by the crowd"); "performance-enhancing" ("athletic boosting" is not English); "motorway" ("highway" is a US term with a different meaning; "diversion road" is not a real phrase); "centenarian" and "pensioner" ("oldest centenarian"; "retired pensioner"); "undergraduate" ("university student" is too broad).
- Low, example overclaim: inheritance ("matters more to young adults than their own salaries") reads as a fact learners may reuse.
- Files with no issues in the sample: vocab-health, vocab-government, vocab-globalisation, vocab-environment, vocab-urban.

## Summary

Report only. Nothing was fixed.

Findings:

- Verified High findings: w1-18, w1-20 (Task 1 model claims false against chart data); r29-q13 (ungrammatical key frame, "twice times"); o01-q13 (two defensible answers, temperature and pressure).
- Downgraded from High: r04-q09 and w2-45 (both Medium on re-reading).
- Giveaways are the largest group, roughly 90 items across reading and listening (my tally of the agent lines, not re-checked item by item). A stem or option copies the passage or script with one word blanked, or the correct option is the only one that echoes the text. This is the complaint `question-bank-audit-plan.md` calls out, so fix these first.
- Accepted-answer gaps (a correct form the answer list does not accept) are the next largest group, mostly Low.
- Writing Task 2 `band6` and `criteria` are dead data, never shown to learners.
- Speaking and vocab: a few Medium model-answer errors (Iceland/Niagara garble, agreement error), and Part 1 questions that are mis-levelled. The vocab sample of 300 of 1,502 items has about 35 weak paraphrases or collocations, all Low except "fellow child".

Initial audit: no content was edited (the fix pass is at the end of this file). The IELTS verifiers were run on the way; `verify-ielts-course-pipeline` rewrites `ielts-mock.json` and `strategy.json`, and the rewrite is byte-identical to HEAD.

## Fix pass (2026-10-22)

Every finding was re-checked against its source before editing. Findings that did not hold were left alone, and the reason is recorded below. Edits went only to `web/src/ielts/data/parts/`, and the compiled IELTS files were regenerated with `merge-ielts.cjs`.

**Checks after the fix pass**

- Per-file checker (`why` quotes verbatim, accepted answers in the source, key labels, TFNG/YNNG values, prompts copying six or more words from the source): clean on all 15 reading and listening files. The one listening hit (l2-s1-q03, "44 89") is a digit-spelling false positive.
- Copy-check across all reading and listening items, including the echo test on MCQ options: 0 copied prompts (baseline 19), 0 echoing correct options (baseline 9), 0 listening copies (baseline 4).
- TFNG balance per passage (question-bank plan, Task 3): every passage has at least two distinct keys and at least one NOT GIVEN.
- No MCQ key is the unique longest option (baseline 1). The fix pass briefly raised this to 10; those were corrected.
- Accepted answers: none over three words, except the pre-existing "11,000 years ago", which is three words once the comma is ignored.
- Compiled `reading`, `listening`, `writing1`, `writing2`, `vocab`, `speaking` and `originals-reading` JSON match the parts exactly.
- Verifiers, all passing: `verify-ielts-content`, `-reading`, `-speaking`, `-vocab`, `-bands`, `-path`, `verify-cd-ielts`, `verify-listening-cloze`, `verify-listening-traps-lab`, `verify-reading-drills`, `verify-listening-diagnostic`. `verify-ielts-writing` passes, but see the open decision below.
- Not run: `verify-ielts-course-pipeline`, `verify-content-pipeline` and `npm test`, because they rewrite tracked files and regenerate screenshots.

**Fixed (by file)**

- reading-1 and reading-2: r04-q09 stem tightened to the passage wording. Echo fixes in r05-q12, r06-q14, r07-q13, r09-q13 and r10-q12. r03-q14 distractors given the same form. r03-q08 "comprehension" accepted. r03-q12 "deliberate" removed as an accepted answer. r02-q11 wording. r05 paragraph B grammar. r08-q11, r09-q08 and r09-q09 frames. r11-q03 reworded to a supported FALSE. Over-limit accepted form removed from r10-q11 (no "BMJ" added; see skipped).
- reading-3 and reading-4: r13-q10 and r13-q11 giveaways. r14-q04 spelling "Māori". r14-q11 and r16-q13 accepted forms. r15-q14 option rewritten. r16-q06 giveaway. r16-q10 wording. r16-q13 reworded to "Which bay…" with the single answer "Gazi Bay", because two locations were defensible.
- reading-5: 19 items. Copied stems reworded, "They" options given antecedents, r17-q09 `why` corrected, r19-q11 "beak" accepted, r20-q12 `why` quotes the whole sentence. The shared r18 option B no longer names sulphur dioxide, so it does not give away r18-q12.
- reading-6: 30 items, including retargeting the duplicates r23-q13, r25-q09 and r26-q12 to new facts with new keys. The duplicate "main point" prompt reworded. Accepted forms added. r25-q12 prompt made unambiguous.
- reading-7 and originals-reading-1: r29-q13 frame fixed (key stays "twice"). o01-q13 now has the single answer "temperature", because "pressure" was already named in the prompt. o02-q03 changed from YNNG to TFNG, with its key re-derived. Giveaways reworded. Cross-item giveaways retargeted (r28-q13, r29-q06, r29-q14, o01-q09).
- listening-1 to listening-4: about 50 lines. Correct-option echoes reworded, prompts paraphrased, accepted forms added (ordinal dates, digits, spoken variants). l2-s4 script line now reads "By nineteen twenty-five". The café in l3-s2-q06 is named from the script, which resolves the duplicate prompt. l4-s1-q03 option length balanced. l4-s2-q07 prompt reworded.
- listening-5 to listening-7: prompts of about 25 items reworded. l5-s2 script wording ("fourth room"). l5-s3 adviser "Thank you" line moved. l6-s3-q02 stem grammar. Accepted forms added. l7-s3-q08 options made the same length. The café in l5-s2-q09 is named from the script. l5-s4-q04 accepts "flat blocks".
- writing1: w1-18 and w1-20 corrected against the chart data (the urban–rural gap widened from 27 to 31 points, and 30–45 was not the highest group). w1-23 "just under half" changed to "two-fifths", and the five named exporters are summed. w1-31 and w1-27 now mention the holiday apartments and the new station. w1-02, w1-16, w1-17, w1-19 and w1-33 wording. Models stay at 150 words or more.
- writing2: w2-45 stance made consistent ("I partly agree"). essayType corrected for w2-38 (opinion) and w2-40 (discuss). The "Give reasons…" sentence added to the five prompts that lacked it. Criteria and notes quotes that the models did not contain corrected. Unsourced claims hedged (w2-14, w2-16). w2-22 covers under-twelves. w2-32 conclusion no longer repeats the intro. w2-44 takes a position and stays within the governments question. All models stay at 250 words or more.
- speaking: s2-12 garbled Niagara line replaced with Gullfoss. s2-30 agreement error. s2-17 "travelling". s2-14 and s2-15 trimmed to 284 words each. s2-09 phrase, and the persona clash with s2-15, fixed. American spellings in s2-16, s2-18, s2-25 and s2-26 changed to British. s2-19 changed from a smartphone to a laptop, with the model rewritten. Pandemic references removed from the Part 3 questions of s2-12 and s2-17. Part 1 questions reworded where flagged (Food, Technology, Reading, Accommodation, the one Part 3-style question in several topics, and Cycling).
- vocab (the 300 sampled items only): about 37 paraphrases, collocations and examples corrected across 15 files. The trn-037 definition no longer contains its headword. sibling drops "fellow child".

**Skipped, with the reason**

- r10-q11 "BMJ": not in the passage, so not a valid answer.
- l2-s4-q09 "jet engine" and l6-s4-q01 "less than one percent": already accepted.
- s2-05 and s2-22: the models differ (photography and guitar), so the cards are not duplicates.
- Speaking models of 177–193 words: about 75–85 seconds, inside the one-to-two-minute window.
- Writing padding: cut only where flagged (w2-32 and w2-44). A blanket cut would drop several models below 250 words.
- Heading key distribution: keys are not wrong, and a change would need the numerals in each `why` rewritten.
- writing2 `band6` and `criteria`: kept, because `verify-ielts-writing` requires them. They are not shown in the UI. Only `criteria` text that was wrong was corrected.
- Mechanical false positives: the eight `why` paragraph flags (each `why` cites other paragraphs for distractors), the r12-q06 ellipsis quote, the "11,000 years ago" word count, and the 45 Task 2 `band6` lengths.

**Still open**

- **Decision needed: `web/scripts/verify-ielts-writing.cjs`.** Its Task 2 coverage threshold for `twopart` was lowered from 8 to 7 at 23:50:16. I did not make that change. Our w2-40 fix (twopart → discuss) moved one item out of that bucket. Either restore the threshold to 8 and write one more genuine two-part Task 2 item, or keep 7. The script now passes only because of the lower threshold.
- r24-q05, q06 and q07: match prompts are close paraphrases of paragraph openings. Not on the original list; found by the fix pass.
- r20-q12: the prompt still copies a five-word run, "moral as well as intellectual meaning". It is below the six-word check.
- r15-q14: distractor D copies paragraph F's wording. It gives nothing away, but it is worth a look.
- o02: TFNG and YNNG items are now interleaved (TFNG at q03 between YNNG items). The renderer labels by type, so this works, but a grouped instruction header would read oddly.
- Vocab: 1,202 of the 1,502 items were never checked.
- Not mine, not touched: `scripts/capture_every_mobile_view.cjs` and the Mobile screenshots changed during the session. `docs/audits/2026-10-21-content-flaws-audit.md` carries a one-line link to this file, which I added.
