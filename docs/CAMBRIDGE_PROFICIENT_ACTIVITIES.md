# Cambridge English Learning Activities (Proficient C1–C2) & Ecosystem Map

> **Source:** [Cambridge English Activities for Learners (Proficient)](https://www.cambridgeenglish.org/learning-english/activities-for-learners/?level=proficient&rows=36) & [Cambridge Learning English Portal](https://www.cambridgeenglish.org/learning-english)
> **Target Level:** CEFR C1–C2 (Proficient / IELTS Academic 7.5–9.0)
> **App Workspace:** `e:\Eng` (`pttaer/eng-learn`)

---

## 1. Executive Summary & App Integration Blueprint

This document compiles the **complete collection of 36 Proficient (C1–C2) online learning activities** published by Cambridge English, along with the overarching taxonomy of the 175-activity Cambridge learning portal. Each activity was reverse-engineered from its live e-learning engine (Articulate Storyline 360 & Storyline 2) to extract question banks, interactive choices, answer keys, and pedagogical objectives.

### Key Pedagogical Hallmarks of Cambridge C1–C2 Activities
1. **Micro-Learning Rhythms (0–5 min & 5–10 min):** Designed for high-frequency, low-friction daily practice without learner fatigue.
2. **Discursive & Authentic Register:** Focuses on nuance, implied speaker attitude, ellipsis/substitution in natural discourse, precise collocations, and formal vs. informal stylistic constraints.
3. **Exam Alignment:** Serves as direct preparation for Cambridge C1 Advanced (CAE), C2 Proficiency (CPE), and IELTS Academic Bands 7.5–9.0.

### Mobile & Web App Feature Mapping

| Activity Type | Cambridge Skill | Proposed App Component | Interaction Model |
| :--- | :--- | :--- | :--- |
| **Ellipsis & Substitution** | Grammar | `EllipsisSpotterView` | Tap to highlight missing grammatical elements |
| **Reporting Verb Syntax** | Grammar | `VerbComplementMatcher` | Multi-choice pattern matching (verb + that / to / gerund) |
| **Implied Meaning & Tone** | Listening | `AttitudeProbePlayer` | Audio snippet + contextual deduction chips |
| **Word & Sentence Stress** | Pronunciation | `StressRhythmTapper` | Visual beat indicator (e.g. `oOo`, `Ooo`, `oOoo`) |
| **Discursive Referencing** | Reading | `DiscourseMarkerCloze` | Academic text gap-fill focusing on anaphora/cataphora |
| **Collocation & Precision** | Vocabulary | `NuanceSelectorCard` | Distinguishing near-synonyms in high-stakes contexts |
| **Polite Complaints & Register** | Writing | `RegisterScaleSlider` | Classify phrases across formal/informal/inappropriate |

---

## 2. Activity Breakdown by Skill (Summary Matrix)

| # | Title | Skill | CEFR | Time | Cambridge Slug |
| :-: | :--- | :--- | :-: | :-: | :--- |
| 1 | [Ellipsis](#c1g060-ellipsis) | Grammar | C1-C2 | 0–5 minutes | `c1g060-ellipsis` |
| 2 | [Bank accounts](#c1l062-bank-accounts) | Listening | C1-C2 | 5–10 minutes | `c1l062-bank-accounts` |
| 3 | [Can you understand?](#c1l069-can-you-understand) | Listening | C1-C2 | 0–5 minutes | `c1l069-can-you-understand` |
| 4 | [Voicemail](#c1l070-voicemail) | Listening | C1-C2 | 0–5 minutes | `c1l070-voicemail` |
| 5 | [Word stress](#c1p054-word-stress) | Listening Pronunciation | C1-C2 | 5–10 minutes | `c1p054-word-stress` |
| 6 | [US or UK pronunciation](#c1p064-us-or-uk-pronunciation) | Listening Pronunciation | C1-C2 | 0–5 minutes | `c1p064-us-or-uk-pronunciation` |
| 7 | [Intonation](#c1p065-intonation) | Pronunciation Speaking | C1-C2 | 0–5 minutes | `c1p065-intonation` |
| 8 | [Money matters](#c1r061-money-matters) | Reading | C1-C2 | 10+ minutes | `c1r061-money-matters` |
| 9 | [Text messages](#c1r071-text-messages) | Reading | C1-C2 | 0–5 minutes | `c1r071-text-messages` |
| 10 | [Communication](#c1v053-communication) | Vocabulary | C1-C2 | 10+ minutes | `c1v053-communication` |
| 11 | [More definitions](#c1v073-more-definitions) | Vocabulary Writing | C1-C2 | 5–10 minutes | `c1v073-more-definitions` |
| 12 | [Cover letter](#c1w074-cover-letter) | Vocabulary Writing | C1-C2 | 5–10 minutes | `c1w074-cover-letter` |
| 13 | [What's the product?](#c2l063-what-s-the-product) | Listening Vocabulary | C1-C2 | 5–10 minutes | `c2l063-what-s-the-product` |
| 14 | [A restaurant review](#c2l066-a-restaurant-review) | Listening | C1-C2 | 5–10 minutes | `c2l066-a-restaurant-review` |
| 15 | [Word stress four syllable words](#c2p055-word-stress-four-syllable-words) | Listening Pronunciation | C1-C2 | 5–10 minutes | `c2p055-word-stress-four-syllable-words` |
| 16 | [The world of work](#c2r067-the-world-of-work) | Reading | C1-C2 | 0–5 minutes | `c2r067-the-world-of-work` |
| 17 | [Property for sale](#c2r068-property-for-sale) | Reading | C1-C2 | 0–5 minutes | `c2r068-property-for-sale` |
| 18 | [Body and health part 2](#c2v052-body-and-health-part-2) | Vocabulary | C1-C2 | 10+ minutes | `c2v052-body-and-health-part-2` |
| 19 | [Definitions of formal words](#c2v072-definitions-of-formal-words) | Vocabulary | C1-C2 | 0–5 minutes | `c2v072-definitions-of-formal-words` |
| 20 | [Fronting substitution and ellipsis](#c1g059-fronting-substitution-and-ellipsis) | Grammar Speaking | C1-C2 | 0–5 minutes | `c1g059-fronting-substitution-and-ellipsis` |
| 21 | [Body and health part 1](#c1v051-body-and-health-part-1) | Vocabulary | C1-C2 | 10+ minutes | `c1v051-body-and-health-part-1` |
| 22 | [Science fiction](#c1r002-science-fiction) | Reading Writing | C1-C2 | 5–10 minutes | `c1r002-science-fiction` |
| 23 | [Forensic linguistics](#c1r001-forensic-linguistics) | Reading | C1-C2 | 5–10 minutes | `c1r001-forensic-linguistics` |
| 24 | [Precise words](#c2v001-precise-words) | Vocabulary | C1-C2 | 0–5 minutes | `c2v001-precise-words` |
| 25 | [Understanding implied meaning](#c1l002-understanding-implied-meaning) | Listening | C1-C2 | 5–10 minutes | `c1l002-understanding-implied-meaning` |
| 26 | [Which as a relative pronoun](#c1g002-which-as-a-relative-pronoun) | Grammar | C1-C2 | 0–5 minutes | `c1g002-which-as-a-relative-pronoun` |
| 27 | [Statements and opinions](#c1v002-statements-and-opinions) | Vocabulary | C1-C2 | 0–5 minutes | `c1v002-statements-and-opinions` |
| 28 | [Ethical journalism](#c2r001-ethical-journalism) | Reading | C1-C2 | 0–5 minutes | `c2r001-ethical-journalism` |
| 29 | [Short dialogues](#c2l001-short-dialogues) | Listening | C1-C2 | 5–10 minutes | `c2l001-short-dialogues` |
| 30 | [Stressed words and meaning](#c1s002-stressed-words-and-meaning) | Listening Pronunciation | C1-C2 | 0–5 minutes | `c1s002-stressed-words-and-meaning` |
| 31 | [Idiomatic language](#c1v001-idiomatic-language) | Vocabulary | C1-C2 | 0–5 minutes | `c1v001-idiomatic-language` |
| 32 | [Formal and informal writing](#c1w001-formal-and-informal-writing) | Writing | C1-C2 | 5–10 minutes | `c1w001-formal-and-informal-writing` |
| 33 | [Reporting verbs](#c1g001-reporting-verbs) | Grammar | C1-C2 | 5–10 minutes | `c1g001-reporting-verbs` |
| 34 | [Understanding socio-cultural references](#c2r002-understanding-socio-cultural-references) | Reading | C1-C2 | 5–10 minutes | `c2r002-understanding-socio-cultural-references` |
| 35 | [Subtle attitudes](#c2l002-subtle-attitudes) | Listening | C1-C2 | 0–5 minutes | `c2l002-subtle-attitudes` |
| 36 | [Complaining politely and appropriately](#c1w002-complaining-politely-and-appropriately) | Writing | C1-C2 | 0–5 minutes | `c1w002-complaining-politely-and-appropriately` |

---

## 3. Comprehensive Activity Catalog & Question Banks

### <a id="c1g060-ellipsis"></a>1. Ellipsis

- **Slug:** `c1g060-ellipsis`
- **CEFR Level:** C1-C2
- **Estimated Time:** 0–5 minutes
- **Skill Focus:** Grammar
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1g060-ellipsis](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1g060-ellipsis)
- **Engine:** Storyline 360

**Learning Objective:**  
Choose which parts of these sentences have been left out

#### Extracted Learning Content & Task Items

**Section / Slide (Text):**
- Ellipsis: Seen any good films recently?
- Click the CONTINUE button to begin.

**Section / Slide (Text):**
- Yes
- No
- 1. Been anywhere nice recently?
- The sentences below are examples of ellipsis. That's when we leave out words when we speak. Choose which parts of speech are missing from these spoken English sentences.
- 2. Postman's been!
- 3. Wonder when he'll be back.
- 4. You seen my phone anywhere?
- Incorrect
- Correct
- You are correct! In English, when we speak, we sometimes leave out articles (a, an, the), auxiliary verbs (have, do, etc.) and subject pronouns (I, you, etc.).
- OR
- Sorry, that was incorrect. Look carefully at the correct answers. In English, when we speak, we sometimes leave out articles (a, an, the), auxiliary verbs (have, do, etc.) and subject pronouns (I, you, etc.).
- Sorry, that was incorrect. Think about what words have been left out of the phrase and then think about what parts of speech these are.

**Section / Slide (Text):**
- Yes
- No
- 5. Didn't see the football match last night, did you?
- The sentences below are examples of ellipsis. That's when we leave out words when we speak. Choose which parts of speech are missing from these spoken English sentences.
- 6. Finished with that book I lent you yet?
- 7. You going to go tonight or not?
- 8. I've missed the train again. Always happens to me!
- 9. Cat's gone missing again.
- Incorrect
- Correct
- You are correct! In English, when we speak, we sometimes leave out articles (a, an, the), auxiliary verbs (have, do, etc.) and subject pronouns (I, you, etc.).
- OR
- Sorry, that was incorrect. Look carefully at the correct answers. In English, when we speak, we sometimes leave out articles (a, an, the), auxiliary verbs (have, do, etc.) and subject pronouns (I, you, etc.).
- Sorry, that was incorrect. Think about what words have been left out of the phrase and then think about what parts of speech these are.

**Section / Slide (Results Message):**
- How did you do?
- We have lots more activities to help you practise your English! Choose an activity below or search for a different skill.
- See the related activities below to find more like this.
- RESTART ACTIVITY
- Well done! You answered all the questions correctly.
- ^%^Results.ScorePercent^%^^%^ (^%^Results.ScorePoints^%^ points)
- ^%^Results.PassPercent^%^^%^ (^%^Results.PassPoints^%^ points)
- There were some wrong answers, but why not try again?

**App Implementation Strategy:**
- **Component Pattern:** `EllipsisExercise`
- **UX Recommendation:** Implement as a rapid-fire 0–5 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c1l062-bank-accounts"></a>2. Bank accounts

- **Slug:** `c1l062-bank-accounts`
- **CEFR Level:** C1-C2
- **Estimated Time:** 5–10 minutes
- **Skill Focus:** Listening
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1l062-bank-accounts](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1l062-bank-accounts)
- **Engine:** Storyline 360

**Learning Objective:**  
Practice listening with this activity about bank accounts

#### Extracted Learning Content & Task Items

**Section / Slide (Video with Image):**
- Do you want to practise your listening and learn about how to open a bank account in the UK? Watch this information video and answer the questions that follow.
- Click the CONTINUE button to begin.
- Bank accounts
- icon_task-watch.png
- Transcript

**Section / Slide (Video):**
- Yes
- No
- Type your answer here…
- Listen again and complete the notes.
- Who needs to write a letter for you in order for you to open an unrestricted bank account?
- Correct
- Incorrect
- You are correct!
- Sorry, that was incorrect.
- OR
- employer
- tick.png
- boss
- Sorry, that was incorrect. Listen to the video again. Pay close attention to the key words BEFORE the words 'unrestricted bank account' in the video.
- Transcript

**Section / Slide (Video):**
- Yes
- No
- Type your answer here…
- Listen again and complete the notes.
- What kind of bill do you need to show in order to open an unrestricted bank account?
- Correct
- Incorrect
- You are correct!
- Sorry, that was incorrect.
- OR
- A utility bill
- tick.png
- Utility bill
- utility
- Sorry, that was incorrect. Listen to the video again. Pay close attention to the key words BEFORE the words 'unrestricted bank account' in the video.
- Transcript

**Section / Slide (Video):**
- Yes
- No
- Type your answer here…
- Listen again and complete the notes.
- Apart from a passport, what other document is required to open a restricted bank account?
- Correct
- Incorrect
- You are correct!
- Sorry, that was incorrect.
- OR
- A work visa
- tick.png
- Work visa
- Sorry, that was incorrect. Listen to the video again. Pay close attention to the key words AFTER the words 'restricted bank account' in the video.
- Transcript

**Section / Slide (Audio):**
- The idiom 'child's play' in this context means:
- The speaker says 'Not only are ATMs more accessible but you can also get cash out at the checkout in a supermarket when doing your shopping. Paying bills and other things is almost child's play.'
- Correct
- Incorrect
- You are correct!
- tick.png
- OR
- Sorry, that was incorrect.
- Look at the context, is it generally positive or negative?
- Transcript

**Section / Slide (Audio):**
- The idiom 'hit the ground running' in this context means:
- At the end the speaker says 'Purchasing a package is a really good way to hit the ground running and focus on more important aspects of moving to the UK.'
- Correct
- Incorrect
- You are correct!
- tick.png
- OR
- Sorry, that was incorrect.
- Look at the context, is it generally positive or negative?
- Transcript

**Section / Slide (Results Percent):**
- How did you do?
- RESTART ACTIVITY
- 100^%^
- We have lots more activities to help you practise your English! Choose an activity below or search for a different skill.

**App Implementation Strategy:**
- **Component Pattern:** `BankaccountsExercise`
- **UX Recommendation:** Implement as a rapid-fire 5–10 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c1l069-can-you-understand"></a>3. Can you understand?

- **Slug:** `c1l069-can-you-understand`
- **CEFR Level:** C1-C2
- **Estimated Time:** 0–5 minutes
- **Skill Focus:** Listening
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1l069-can-you-understand](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1l069-can-you-understand)
- **Engine:** Storyline 360

**Learning Objective:**  
Can you identify what is really being said in this listening activity?

#### Extracted Learning Content & Task Items

**Section / Slide (Writing activities):**
- You'll hear a series of statements. See if you can identify what is being said.
- Can you understand what is really being said?
- Click the CONTINUE button to begin.

**Section / Slide (Audio):**
- This person is clarifying what someone has said.
- True
- False
- Correct
- Incorrect
- You are correct!
- Sorry, that was incorrect.
- OR
- SHOW ANSWER

**Section / Slide (Audio):**
- This person is interrupting someone else who is speaking.
- True
- False
- Correct
- Incorrect
- You are correct!
- Sorry, that was incorrect.
- OR
- SHOW ANSWER

**Section / Slide (Audio):**
- This person understands what has just been said.
- True
- False
- Correct
- Incorrect
- You are correct!
- Sorry, that was incorrect.
- OR
- SHOW ANSWER

**Section / Slide (5 Pairs of Audio):**
- Line
- Starting a meeting.
- Signalling the end.
- Confirming what has just been said.
- Agreeing with what has just been said.
- Summing up an opinion.
- No
- Yes
- Listen to the speakers on the left. Match the speaker with the purpose on the right.
- icon_task-puzzle.png
- Correct
- Incorrect
- You are correct!
- Sorry, that was incorrect.
- OR
- Would you like to try again or see answers?

**Section / Slide (Results Message):**
- How did you do?
- We have lots more activities to help you practise your English! Choose an activity below or search for a different skill.
- See the related activities below to find more like this.
- RESTART ACTIVITY
- Well done! You answered all the questions correctly.
- ^%^Results.ScorePercent^%^^%^ (^%^Results.ScorePoints^%^ points)
- ^%^Results.PassPercent^%^^%^ (^%^Results.PassPoints^%^ points)
- There were some wrong answers, but why not try again?

**App Implementation Strategy:**
- **Component Pattern:** `CanyouunderstandExercise`
- **UX Recommendation:** Implement as a rapid-fire 0–5 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c1l070-voicemail"></a>4. Voicemail

- **Slug:** `c1l070-voicemail`
- **CEFR Level:** C1-C2
- **Estimated Time:** 0–5 minutes
- **Skill Focus:** Listening
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1l070-voicemail](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1l070-voicemail)
- **Engine:** Storyline 360

**Learning Objective:**  
Can you understand the general idea in these voicemail messages?

#### Extracted Learning Content & Task Items

**Section / Slide (Writing activities):**
- You'll hear a series of voicemail messages. Can you understand the general idea?
- Voicemail
- Click the CONTINUE button to begin.

**Section / Slide (Audio):**
- The meeting is now later than expected.
- True
- False
- Correct
- Incorrect
- You are correct!
- OR
- Sorry, that was incorrect.

**Section / Slide (Audio):**
- Yes
- No
- LISTEN
- Listen to the voicemail message again. Complete the sentence with ONE word.
- icon_task-listen.png
- Your 4.30 viewing has been ______ back to 5 o'clock.
- Type your answer here…
- Incorrect
- Correct
- Well done! In this context pushed back is a phrasal verb meaning the meeting has been delayed.
- OR
- Sorry, that was incorrect. The correct word was pushed. In this context pushed back is a phrasal verb meaning the meeting has been delayed.
- pushed
- tick.png
- Sorry, that's not correct. Listen again.

**Section / Slide (Audio):**
- The meeting is at the same time.
- True
- False
- Correct
- Incorrect
- You are correct!
- OR
- Sorry, that was incorrect.

**Section / Slide (Audio):**
- Yes
- No
- LISTEN
- Listen to the voicemail message again. Complete the sentence with ONE word.
- icon_task-listen.png
- Your 10 o'clock meeting tomorrow morning has been ______ forward.
- Type your answer here…
- Incorrect
- Correct
- Well done! In this context brought forward is a phrasal verb meaning the meeting is now earlier than planned.
- OR
- Sorry, that was incorrect. The correct word is brought. In this context brought forward is a phrasal verb meaning the meeting is now earlier than planned.
- brought
- tick.png
- Sorry, that's not correct. Listen again.

**Section / Slide (Audio):**
- The speaker is calling to:
- LISTEN
- Correct
- Incorrect
- You are correct!
- OR
- Sorry, that was incorrect.
- tick.png
- Sorry, that's not correct. Listen again.

**Section / Slide (Audio):**
- Yes
- No
- LISTEN
- Listen to the voicemail message again. Complete the sentence with ONE word.
- icon_task-listen.png
- I'm just calling to say I'm really sorry but I won't be able to ____ it in today.
- Type your answer here…
- Incorrect
- Correct
- Well done! In this context make it in is a phrasal verb meaning go to work.
- OR
- Sorry, that was incorrect. The correct word is make. In this context make it in is a phrasal verb meaning go to work.
- make
- tick.png
- Sorry, that's not correct. Listen again.

**Section / Slide (Results Percent):**
- How did you do?
- RESTART ACTIVITY
- 100^%^
- We have lots more activities to help you practise your English! Choose an activity below or search for a different skill.

**App Implementation Strategy:**
- **Component Pattern:** `VoicemailExercise`
- **UX Recommendation:** Implement as a rapid-fire 0–5 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c1p054-word-stress"></a>5. Word stress

- **Slug:** `c1p054-word-stress`
- **CEFR Level:** C1-C2
- **Estimated Time:** 5–10 minutes
- **Skill Focus:** Listening Pronunciation
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1p054-word-stress](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1p054-word-stress)
- **Engine:** Storyline 360

**Learning Objective:**  
Identify the pattern of stressed and unstressed syllables

#### Extracted Learning Content & Task Items

**Section / Slide (Writing activities):**
- Syllables and word stress
- Click the CONTINUE button to begin.

**Section / Slide (Ooo):**
- What is the pattern of stressed and unstressed syllables?
- oOo
- oOoo
- Ooo
- Click to play the words. Select the pattern of stressed and unstressed syllables. (e.g. Manchester = Ooo) Then watch, listen and repeat. Film yourself or look in the mirror. Does your mouth move the same way as in these videos?
- Correct
- Incorrect
- You are correct! Now watch, listen and repeat.
- OR
- Sorry, that was incorrect. Look at the correct answers. Then try the activity again.
- Listen again. How many syllables are there? Where is the stress?

**Section / Slide (oOo):**
- What is the pattern of stressed and unstressed syllables?
- oOo
- oOoo
- Ooo
- Click to play the words. Select the pattern of stressed and unstressed syllables. (e.g. Manchester = Ooo) Then watch, listen and repeat. Film yourself or look in the mirror. Does your mouth move the same way as in these videos?
- Correct
- Incorrect
- You are correct! Now watch, listen and repeat.
- OR
- Sorry, that was incorrect. Look at the correct answers. Then try the activity again.
- Listen again. How many syllables are there? Where is the stress?

**Section / Slide (oOoo):**
- What is the pattern of stressed and unstressed syllables?
- oOo
- oOoo
- Ooo
- Click to play the words. Select the pattern of stressed and unstressed syllables. (e.g. Manchester = Ooo) Then watch, listen and repeat. Film yourself or look in the mirror. Does your mouth move the same way as in these videos?
- Correct
- Incorrect
- You are correct! Now watch, listen and repeat.
- OR
- Sorry, that was incorrect. Look at the correct answers. Then try the activity again.
- Listen again. How many syllables are there? Where is the stress?

**Section / Slide (oOoo):**
- What is the pattern of stressed and unstressed syllables?
- oOo
- oOoo
- Ooo
- Click to play the words. Select the pattern of stressed and unstressed syllables. (e.g. Manchester = Ooo) Then watch, listen and repeat. Film yourself or look in the mirror. Does your mouth move the same way as in these videos?
- Correct
- Incorrect
- You are correct! Now watch, listen and repeat.
- OR
- Sorry, that was incorrect. Look at the correct answers. Then try the activity again.
- Listen again. How many syllables are there? Where is the stress?

**Section / Slide (Ooo):**
- What is the pattern of stressed and unstressed syllables?
- oOo
- oOoo
- Ooo
- Click to play the words. Select the pattern of stressed and unstressed syllables. (e.g. Manchester = Ooo) Then watch, listen and repeat. Film yourself or look in the mirror. Does your mouth move the same way as in these videos?
- Correct
- Incorrect
- You are correct! Now watch, listen and repeat.
- OR
- Sorry, that was incorrect. Look at the correct answers. Then try the activity again.
- Listen again. How many syllables are there? Where is the stress?

**Section / Slide (oOo):**
- What is the pattern of stressed and unstressed syllables?
- oOo
- oOoo
- Ooo
- Click to play the words. Select the pattern of stressed and unstressed syllables. (e.g. Manchester = Ooo) Then watch, listen and repeat. Film yourself or look in the mirror. Does your mouth move the same way as in these videos?
- Correct
- Incorrect
- You are correct! Now watch, listen and repeat.
- OR
- Sorry, that was incorrect. Look at the correct answers. Then try the activity again.
- Listen again. How many syllables are there? Where is the stress?

**Section / Slide (Ooo):**
- What is the pattern of stressed and unstressed syllables?
- oOo
- oOoo
- Ooo
- Click to play the words. Select the pattern of stressed and unstressed syllables. (e.g. Manchester = Ooo) Then watch, listen and repeat. Film yourself or look in the mirror. Does your mouth move the same way as in these videos?
- Correct
- Incorrect
- You are correct! Now watch, listen and repeat.
- OR
- Sorry, that was incorrect. Look at the correct answers. Then try the activity again.
- Listen again. How many syllables are there? Where is the stress?

**Section / Slide (oOoo):**
- What is the pattern of stressed and unstressed syllables?
- oOo
- oOoo
- Ooo
- Click to play the words. Select the pattern of stressed and unstressed syllables. (e.g. Manchester = Ooo) Then watch, listen and repeat. Film yourself or look in the mirror. Does your mouth move the same way as in these videos?
- Correct
- Incorrect
- You are correct! Now watch, listen and repeat.
- OR
- Sorry, that was incorrect. Look at the correct answers. Then try the activity again.
- Listen again. How many syllables are there? Where is the stress?

**Section / Slide (oOo):**
- What is the pattern of stressed and unstressed syllables?
- oOo
- oOoo
- Ooo
- Click to play the words. Select the pattern of stressed and unstressed syllables. (e.g. Manchester = Ooo) Then watch, listen and repeat. Film yourself or look in the mirror. Does your mouth move the same way as in these videos?
- Correct
- Incorrect
- You are correct! Now watch, listen and repeat.
- OR
- Sorry, that was incorrect. Look at the correct answers. Then try the activity again.
- Listen again. How many syllables are there? Where is the stress?

**Section / Slide (oOoo):**
- What is the pattern of stressed and unstressed syllables?
- oOo
- oOoo
- Ooo
- Click to play the words. Select the pattern of stressed and unstressed syllables. (e.g. Manchester = Ooo) Then watch, listen and repeat. Film yourself or look in the mirror. Does your mouth move the same way as in these videos?
- Correct
- Incorrect
- You are correct! Now watch, listen and repeat.
- OR
- Sorry, that was incorrect. Look at the correct answers. Then try the activity again.
- Listen again. How many syllables are there? Where is the stress?

**Section / Slide (Ooo):**
- What is the pattern of stressed and unstressed syllables?
- oOo
- oOoo
- Ooo
- Click to play the words. Select the pattern of stressed and unstressed syllables. (e.g. Manchester = Ooo) Then watch, listen and repeat. Film yourself or look in the mirror. Does your mouth move the same way as in these videos?
- Correct
- Incorrect
- You are correct! Now watch, listen and repeat.
- OR
- Sorry, that was incorrect. Look at the correct answers. Then try the activity again.
- Listen again. How many syllables are there? Where is the stress?

**Section / Slide (oOo):**
- What is the pattern of stressed and unstressed syllables?
- oOo
- oOoo
- Ooo
- Click to play the words. Select the pattern of stressed and unstressed syllables. (e.g. Manchester = Ooo) Then watch, listen and repeat. Film yourself or look in the mirror. Does your mouth move the same way as in these videos?
- Correct
- Incorrect
- You are correct! Now watch, listen and repeat.
- OR
- Sorry, that was incorrect. Look at the correct answers. Then try the activity again.
- Listen again. How many syllables are there? Where is the stress?

**Section / Slide (Results Percent):**
- How did you do?
- RESTART ACTIVITY
- 100^%^
- We have lots more activities to help you practise your English! Choose an activity below or search for a different skill.

**App Implementation Strategy:**
- **Component Pattern:** `WordstressExercise`
- **UX Recommendation:** Implement as a rapid-fire 5–10 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c1p064-us-or-uk-pronunciation"></a>6. US or UK pronunciation

- **Slug:** `c1p064-us-or-uk-pronunciation`
- **CEFR Level:** C1-C2
- **Estimated Time:** 0–5 minutes
- **Skill Focus:** Listening Pronunciation
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1p064-us-or-uk-pronunciation](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1p064-us-or-uk-pronunciation)
- **Engine:** Storyline 360

**Learning Objective:**  
Can you tell the difference between UK and US English?

#### Extracted Learning Content & Task Items

**Section / Slide (Writing activities):**
- Can you tell the difference between US English and UK English? Try this exercise to see if you can detect the difference based on the pronunciation of some words.
- US v UK pronunciation
- Click the CONTINUE button to begin.

**Section / Slide (Audio):**
- Is this US or UK pronunciation?
- US
- UK
- Correct
- Incorrect
- You are correct! The word vitamin is pronounced differently in US and UK English.
- OR
- Sorry, that was incorrect. The word vitamin is pronounced differently in US and UK English.

**Section / Slide (Audio):**
- Is this US or UK pronunciation?
- US
- UK
- Correct
- Incorrect
- You are correct! The word privacy is pronounced differently in US and UK English.
- OR
- Sorry, that was incorrect. The word privacy is pronounced differently in US and UK English.

**Section / Slide (Audio):**
- Is this US or UK pronunciation?
- US
- UK
- Correct
- Incorrect
- You are correct! The words scheduled and mobile are pronounced differently in US and UK English.
- OR
- Sorry, that was incorrect. The words scheduled and mobile are pronounced differently in US and UK English.

**Section / Slide (Results Percent):**
- How did you do?
- RESTART ACTIVITY
- 100^%^
- We have lots more activities to help you practise your English! Choose an activity below or search for a different skill.

**App Implementation Strategy:**
- **Component Pattern:** `USorUKpronunciationExercise`
- **UX Recommendation:** Implement as a rapid-fire 0–5 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c1p065-intonation"></a>7. Intonation

- **Slug:** `c1p065-intonation`
- **CEFR Level:** C1-C2
- **Estimated Time:** 0–5 minutes
- **Skill Focus:** Pronunciation Speaking
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1p065-intonation](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1p065-intonation)
- **Engine:** Storyline 360

**Learning Objective:**  
Learn how intonation can affect the meaning of certain words

#### Extracted Learning Content & Task Items

**Section / Slide (Writing activities):**
- Words are important and convey a great deal of meaning. The way in which you say the words is just as important in conveying meaning. Let's practise!
- Intonation
- Click the CONTINUE button to begin.

**Section / Slide (Audio):**
- This person is really happy to see you.
- True
- False
- Correct
- Incorrect
- You are correct!
- OR
- SHOW ANSWER
- Sorry, that was incorrect.

**Section / Slide (Audio):**
- How does the speaker feel?
- upset
- confused
- surprised
- Correct
- Incorrect
- You are correct!
- OR
- SHOW ANSWER
- Sorry, that was incorrect.
- Sorry, that was incorrect. Focus on how the words are said and not just the words.

**Section / Slide (Audio):**
- How does the speaker feel?
- upset
- excited
- bored
- Correct
- Incorrect
- You are correct!
- OR
- SHOW ANSWER
- Sorry, that was incorrect.
- Sorry, that was incorrect. Focus on how the words are said and not just the words.

**Section / Slide (Audio):**
- This person is amazed.
- True
- False
- Correct
- Incorrect
- You are correct!
- OR
- SHOW ANSWER
- Sorry, that was incorrect.

**Section / Slide (Audio):**
- This person is not surprised.
- True
- False
- Correct
- Incorrect
- You are correct!
- OR
- SHOW ANSWER
- Sorry, that was incorrect.

**Section / Slide (Results Percent):**
- How did you do?
- RESTART ACTIVITY
- 100^%^
- We have lots more activities to help you practise your English! Choose an activity below or search for a different skill.

**App Implementation Strategy:**
- **Component Pattern:** `IntonationExercise`
- **UX Recommendation:** Implement as a rapid-fire 0–5 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c1r061-money-matters"></a>8. Money matters

- **Slug:** `c1r061-money-matters`
- **CEFR Level:** C1-C2
- **Estimated Time:** 10+ minutes
- **Skill Focus:** Reading
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1r061-money-matters](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1r061-money-matters)
- **Engine:** Storyline 360

**Learning Objective:**  
Read a text about money matters and answer some questions

#### Extracted Learning Content & Task Items

**Section / Slide (Text Large):**
- Reading involves lots of sub-skills such as reading for gist and for specific information. Read this factual text related to money matters.
- Money matters
- Click the CONTINUE button to begin.
- Text

**Section / Slide (Audio):**
- On which website would you expect to find this information?
- Read the text again. Choose the correct answer.
- icon_task-read.png
- Correct
- Incorrect
- You are correct!
- tick.png
- OR
- Sorry, that was incorrect.
- Try again. Look at the key words in the text.
- Text

**Section / Slide (Audio):**
- You can choose not to receive text alerts by:
- Read the text again. Choose the correct answer.
- icon_task-read.png
- Correct
- Incorrect
- You are correct!
- tick.png
- OR
- Sorry, that was incorrect.
- Try again. Opt out has a similar meaning to 'choose not to'.
- Text

**Section / Slide (Audio):**
- If you are 20 years old and don't pay in a minimum of £500 per month your …
- Read the text again. Choose the correct answer.
- icon_task-read.png
- Correct
- Incorrect
- You are correct!
- tick.png
- OR
- Sorry, that was incorrect.
- Sorry that was incorrect. Try again.
- Text

**Section / Slide (Text Large):**
- Yes
- No
- Read the text again if necessary.
- VIEW TEXT
- Find ONE word which means the total amount of money you have in your bank account.
- Type your answer here…
- icon_task-read.png
- Incorrect
- Correct
- You are correct!
- Sorry, that was incorrect.
- OR
- balance
- tick.png
- Sorry that was incorrect. Try looking at the beginning of the text.
- Text

**Section / Slide (Text Large):**
- Yes
- No
- Read the text again if necessary.
- VIEW TEXT
- Which ONE word means a record of the amounts of money paid into and taken out of your bank account during a particular period of time?
- Type your answer here…
- icon_task-read.png
- Incorrect
- Correct
- You are correct!
- Sorry, that was incorrect.
- OR
- statement
- tick.png
- Sorry that was incorrect. Try looking in the middle of the text.
- Text

**Section / Slide (Text Large):**
- Yes
- No
- Read the text again if necessary.
- VIEW TEXT
- Which ONE word means to put money into your account?
- Type your answer here…
- icon_task-read.png
- Incorrect
- Correct
- You are correct!
- Sorry, that was incorrect.
- OR
- deposited
- tick.png
- deposit
- Sorry that was incorrect. Try again. It's a verb.
- Text

**Section / Slide (Text Large):**
- Yes
- No
- Read the text again if necessary.
- VIEW TEXT
- Which ONE word means to take money out of your account?
- Type your answer here…
- icon_task-read.png
- Incorrect
- Correct
- You are correct!
- Sorry, that was incorrect.
- OR
- withdrawn
- tick.png
- withdraw
- Sorry that was incorrect. Try again. It's a verb.
- Text

**Section / Slide (Text Large):**
- Yes
- No
- Read the text again if necessary.
- VIEW TEXT
- Which ONE word means satisfying the necessary conditions?
- Type your answer here…
- icon_task-read.png
- Incorrect
- Correct
- You are correct!
- Sorry, that was incorrect.
- OR
- eligible
- tick.png
- Sorry that was incorrect. Try again. It's an adjective.
- Text

**Section / Slide (Text Large):**
- Yes
- No
- Read the text again if necessary.
- VIEW TEXT
- Which phrase means an amount of money which is paid in one amount and on one occasion?
- Type your answer here…
- icon_task-read.png
- Incorrect
- Correct
- You are correct!
- Sorry, that was incorrect.
- OR
- lump sum
- tick.png
- Sorry that was incorrect. Try again. It can be found twice near the end of the text.
- Text

**Section / Slide (Text Large):**
- Yes
- No
- Complete the gap with the correct form of the missing word from the text.
- VIEW TEXT
- I just need to go to the ATM to ________ that money I owe you.
- Type your answer here…
- icon_task-read.png
- Incorrect
- Correct
- You are correct!
- Sorry, that was incorrect.
- OR
- withdraw
- tick.png
- Sorry that was incorrect. Try again. Are you putting money in or taking money out?
- Text

**Section / Slide (Text Large):**
- Yes
- No
- Complete the gap with the correct form of the missing word from the text.
- VIEW TEXT
- I don't want to receive these notification messages any more, how can I ________ out?
- Type your answer here…
- icon_task-read.png
- Incorrect
- Correct
- You are correct!
- Sorry, that was incorrect.
- OR
- opt
- tick.png
- Sorry that was incorrect. Try again. It means 'choose to no longer have the messages'.
- Text

**Section / Slide (Results Percent):**
- How did you do?
- RESTART ACTIVITY
- 100^%^
- We have lots more activities to help you practise your English! Choose an activity below or search for a different skill.

**App Implementation Strategy:**
- **Component Pattern:** `MoneymattersExercise`
- **UX Recommendation:** Implement as a rapid-fire 10+ minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c1r071-text-messages"></a>9. Text messages

- **Slug:** `c1r071-text-messages`
- **CEFR Level:** C1-C2
- **Estimated Time:** 0–5 minutes
- **Skill Focus:** Reading
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1r071-text-messages](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1r071-text-messages)
- **Engine:** Storyline 360

**Learning Objective:**  
Can you understand the general idea in these text messages? s

#### Extracted Learning Content & Task Items

**Section / Slide (Writing activities):**
- You'll read a series of text messages. Can you understand the general idea?
- Text messages
- Click the CONTINUE button to begin.

**Section / Slide (Text):**
- The idiom let someone go means to end someone's employment.
- I finally let my cleaners go so I now need to clean the house myself.
- True
- False
- Correct
- Incorrect
- You are correct!
- OR
- Sorry, that was incorrect.

**Section / Slide (Text):**
- This person is planning on leaving her job.
- Still got loads left to sort out. You wouldn't believe how hard it is to extricate yourself from a firm you've worked at for so many years.
- True
- False
- Correct
- Incorrect
- You are correct! Extricate in this context means 'to leave with difficulty'.
- OR
- Sorry, that was incorrect. Extricate in this context means 'to leave with difficulty'.

**Section / Slide (Text):**
- The person is:
- Hi Liz. Snowed in. There are a few cars getting in and out of the village but no chance in my BMW. I'm going to have to stay put a bit longer which means I won't be able to make it in to work tomorrow. Shame. Not!
- Correct
- Incorrect
- You are correct!
- OR
- Sorry, that was incorrect. The 'Not!' at the end tells us she was joking when she said it was a shame.
- tick.png
- Sorry, that was incorrect. What does the 'Not!' mean at the end of the message?

**Section / Slide (Text):**
- The person
- Frazzled! Have spent upwards of four hours a day every day on this job application in what's been the busiest work week ever and I'm still not halfway through!
- Correct
- Incorrect
- You are correct!
- OR
- Sorry, that was incorrect.
- tick.png

**Section / Slide (Results Percent):**
- How did you do?
- RESTART ACTIVITY
- 100^%^
- We have lots more activities to help you practise your English! Choose an activity below or search for a different skill.

**App Implementation Strategy:**
- **Component Pattern:** `TextmessagesExercise`
- **UX Recommendation:** Implement as a rapid-fire 0–5 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c1v053-communication"></a>10. Communication

- **Slug:** `c1v053-communication`
- **CEFR Level:** C1-C2
- **Estimated Time:** 10+ minutes
- **Skill Focus:** Vocabulary
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1v053-communication](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1v053-communication)
- **Engine:** Storyline 360

**Learning Objective:**  
Practise some vocabulary related to communicating meaning

#### Extracted Learning Content & Task Items

**Section / Slide (Text):**
- Communication
- Click the CONTINUE button to begin.

**Section / Slide (Text):**
- I've read this paragraph several times but I'm still not sure what it's ________.
- Choose the correct words to complete the sentence.
- getting at
- aiming for
- Correct
- Incorrect
- You are correct! Getting at is an informal phrasal verb that has the same meaning as 'means' or 'implies'.
- OR
- Sorry, that was incorrect. The correct answer is getting at - an informal phrasal verb that has the same meaning as 'means' or 'implies'. We use aiming for to describe what we are trying to achieve.

**Section / Slide (Text):**
- A: 'Are you going to be working again this weekend?' B: 'No, __________!'
- Choose the correct phrase to complete the sentence.
- certainly not
- surely not
- Correct
- Incorrect
- You are correct! Certainly not is used to mean 'definitely not'.
- OR
- Sorry, that was incorrect. Certainly not is used to mean 'definitely not'. Surely not is used to express surprise about something that you do not want to believe.

**Section / Slide (Text):**
- Once we're on the road to the airport, it's ________ if you have forgotten something.
- Choose the correct phrase to complete the sentence.
- too bad
- beyond repair
- Correct
- Incorrect
- You are correct! Too bad means that nothing can be done to change a situation.
- OR
- Sorry, that was incorrect. Too bad means that nothing can be done to change a situation. Beyond repair means that something cannot be repaired.

**Section / Slide (Text):**
- When writing essays, you will gain marks if you can ________ your points with quotations from the text.
- Choose the correct word to complete the sentence.
- illustrate
- demonstrate
- Correct
- Incorrect
- You are correct! You illustrate a point or idea with quotations.
- OR
- Sorry, that was incorrect. You illustrate a point with quotations. You demonstrate something when you show people how to do it.

**Section / Slide (Text):**
- This instruction manual is so full of high-level technical _______ that most people won't be able to understand any of it.
- Choose the correct word to complete the sentence.
- jargon
- slogans
- Correct
- Incorrect
- You are correct! Jargon means 'words and phrases that are used by particular groups and are difficult for other people to understand'.
- OR
- Sorry, that was incorrect. Jargon means 'words and phrases that are used by particular groups and are difficult for other people to understand'. Slogans are short phrases that are easy to remember, used for example in political campaigns or advertising.

**Section / Slide (Text):**
- Viewers should be warned that this drama series contains scenes of violence and __________.
- Choose the correct phrase to complete the sentence.
- strong language
- hard language
- Correct
- Incorrect
- You are correct! Strong language means 'words that might be considered offensive'.
- OR
- Sorry, that was incorrect. Strong language means 'words that might be considered offensive'. We don't use the phrase hard language in this sense.

**Section / Slide (Text):**
- If no one has any further comments to make, can we ________ to the next point on the agenda?
- Choose the correct phrasal verb to complete the sentence.
- move up
- move on
- Correct
- Incorrect
- You are correct! Move on is used to mean 'continue', especially to a new point or topic.
- OR
- Sorry, that was incorrect. The correct answer is move on. It is used to mean 'continue', especially to a new point or topic.

**Section / Slide (Text):**
- After months of arguing, the family had to hire a lawyer to ________ their differences.
- Choose the correct word to complete the sentence.
- solve
- settle
- Correct
- Incorrect
- You are correct! Settle their differences is a slightly formal way of saying 'stop people arguing about something'.
- OR
- Sorry, that was incorrect. Settle their differences is a slightly formal way of saying 'stop people arguing about something'. We use solve about problems or mysteries.

**Section / Slide (Text):**
- He can be a really difficult person. ________, I quite like him.
- Choose the correct phrase to complete the sentence.
- All the same
- Much the same
- Correct
- Incorrect
- You are correct! All the same is an informal way of saying 'despite what has just been said'.
- OR
- Sorry, that was incorrect. All the same is an informal way of saying 'despite what has just been said'. If you say that two things are much the same, they are very similar.

**Section / Slide (Text):**
- Gary was just going into a meeting when I called, but he said he'd ________ to me later today.
- Choose the correct phrasal verb to complete the sentence.
- get back
- get through
- Correct
- Incorrect
- You are correct! Get back to me means 'call me back'.
- OR
- Sorry, that was incorrect. Get back to me means 'call me back'. If you get through to someone on the phone, that person answers the phone and you are able to speak.

**Section / Slide (Text):**
- The headlines say that the government is facing a ________ for a new investigation into the deaths.
- Choose the correct word to complete the sentence.
- call
- request
- Correct
- Incorrect
- You are correct! A call is a demand for something to happen. It's used mainly in news reports.
- OR
- Sorry, that was incorrect. A call is a demand for something to happen. It's used mainly in news reports. A request is a very polite way of asking for something.

**Section / Slide (Text):**
- In interviews, politicians are always _______ statistics, but most people know that statistics can be interpreted in various ways.
- Choose the correct word to complete the sentence.
- stating
- quoting
- Correct
- Incorrect
- You are correct! Quoting means 'giving a fact or example to support your point'.
- OR
- Sorry, that was incorrect. Quoting means 'giving a fact or example to support your point'. Stating does not have this meaning.

**Section / Slide (Text):**
- The information on the packaging is completely _________. It says the ladder can be folded but it can't.
- Choose the correct word to complete the sentence.
- misguided
- misleading
- Correct
- Incorrect
- You are correct! Misleading is used about information that is wrong, especially when it's deliberately wrong.
- OR
- Sorry, that was incorrect. Misleading is used about information that is wrong, especially when it's deliberately wrong. If someone is misguided, the way they deal with a particular situation seems wrong.

**Section / Slide (Text):**
- The police have ________ an image of the man they would like to speak to in connection with the theft.
- Choose the correct word to complete the sentence.
- released
- published
- Correct
- Incorrect
- You are correct! Released is used when someone in authority allows the public to have news or information about something.
- OR
- Sorry, that was incorrect. Released is used when someone in authority, for example the police, allows the public to have news or information about something. It's only later that this is published in the press.

**Section / Slide (Text):**
- Chinese is an extremely hard language to learn because it has so many different _________.
- Choose the correct word to complete the sentence.
- characters
- logos
- Correct
- Incorrect
- You are correct! Characters are the signs that are used in the Chinese language instead of an alphabet.
- OR
- Sorry, that was incorrect. Characters are the symbols that are used in the Chinese language instead of an alphabet. Logos are symbols used by a company to advertise its products.

**Section / Slide (Text):**
- Every time I phone, the receptionist puts me ______ and I have to listen to music for at least 10 minutes.
- Choose the correct phrase to complete the sentence.
- in line
- on hold
- Correct
- Incorrect
- You are correct! You are put on hold when you call somewhere and they ask you to wait, often while listening to music.
- OR
- Sorry, that was incorrect. You are put on hold when you call somewhere and they ask you to wait, often while listening to music. In line means 'in a row or queue' but it's not used in this situation.

**Section / Slide (Results Percent):**
- How did you do?
- RESTART ACTIVITY
- 100^%^
- We have lots more activities to help you practise your English! Choose an activity below or search for a different skill.

**App Implementation Strategy:**
- **Component Pattern:** `CommunicationExercise`
- **UX Recommendation:** Implement as a rapid-fire 10+ minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c1v073-more-definitions"></a>11. More definitions

- **Slug:** `c1v073-more-definitions`
- **CEFR Level:** C1-C2
- **Estimated Time:** 5–10 minutes
- **Skill Focus:** Vocabulary Writing
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1v073-more-definitions](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1v073-more-definitions)
- **Engine:** Storyline 360

**Learning Objective:**  
Practise using different forms of the same word

#### Extracted Learning Content & Task Items

**Section / Slide (Text):**
- Having a good range of vocabulary is necessary to make you fluent in both speaking and writing. This activity practises your knowledge of vocabulary and how to use different forms of the same word.
- More definitions
- Click the CONTINUE button to begin.

**Section / Slide (4 Pairs - Text):**
- Line
- contradict (verb)
- differentiate (verb)
- dominate (verb)
- endeavour (verb)
- to try very hard to do something
- to be the largest, most important or most noticeable part of something
- to show or find the difference between things that are compared
- to say the opposite of what someone else has said. Or a statement or fact is so different from another statement or fact that one of them must be wrong.
- No
- Yes
- Match the word on the left with the correct definition on the right.
- icon_task-puzzle.png
- Correct
- Incorrect
- You are correct!
- OR
- Sorry, that was incorrect.
- Would you like to try again or see answers?

**Section / Slide (Text):**
- Yes
- No
- Please can you stop me in front of the children. It confuses them if we tell them different things.
- Now let's see if you can remember the vocabulary. Choose the correct word to complete the gap.
- Incorrect
- Correct
- You are correct!
- OR
- Sorry, that was incorrect.
- Would you like to try again or see answers?

**Section / Slide (Text):**
- Yes
- No
- We don't between our students on the basis of their learning ability.
- Now let's see if you can remember the vocabulary. Choose the correct word to complete the gap.
- Incorrect
- Correct
- You are correct!
- OR
- Sorry, that was incorrect.
- Would you like to try again or see answers?

**Section / Slide (Text):**
- Yes
- No
- Now let's see if you can remember the vocabulary and adapt it to the new sentence structure. You may have to change the original verb to a noun or adjective.
- Definitions
- Despite our best _______, we weren't able to meet the deadline.
- Type your answer here…
- Correct
- Incorrect
- You are correct! Endeavours are attempts to do something.
- OR
- Sorry, that was incorrect. The correct answer is endeavours which are attempts to do something.
- endeavours
- tick.png
- Sorry, that was incorrect. You need the noun form of the word. It should be in the plural.

**Section / Slide (Audio):**
- Click to listen to the sentence. Practise the pronunciation of the new word by repeating the sentence you hear.
- Click the CONTINUE button.
- LISTEN
- Definitions

**Section / Slide (Text):**
- Yes
- No
- Now let's see if you can remember the vocabulary and adapt it to the new sentence structure. You may have to change the original verb to a noun or adjective.
- Definitions
- In terms of business, product ________ is vital if we want to beat our competitors.
- Type your answer here…
- Correct
- Incorrect
- You are correct! Differentiation in this context means 'a product that stands out from the others'.
- OR
- Sorry, that was incorrect. The correct answer is differentiation which means 'a product that stands out from the others'.
- differentiation
- tick.png
- Sorry, that was incorrect. You need the noun form of the word.

**Section / Slide (Audio):**
- Click to listen to the sentence. Practise the pronunciation of the new word by repeating the sentence you hear.
- Click the CONTINUE button.
- LISTEN
- Definitions

**Section / Slide (Results Message):**
- How did you do?
- We have lots more activities to help you practise your English! Choose an activity below or search for a different skill.
- See the related activities below to find more like this.
- RESTART ACTIVITY
- Well done! You answered all the questions correctly.
- ^%^Results.ScorePercent^%^^%^ (^%^Results.ScorePoints^%^ points)
- ^%^Results.PassPercent^%^^%^ (^%^Results.PassPoints^%^ points)
- There were some wrong answers, but why not try again?

**App Implementation Strategy:**
- **Component Pattern:** `MoredefinitionsExercise`
- **UX Recommendation:** Implement as a rapid-fire 5–10 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c1w074-cover-letter"></a>12. Cover letter

- **Slug:** `c1w074-cover-letter`
- **CEFR Level:** C1-C2
- **Estimated Time:** 5–10 minutes
- **Skill Focus:** Vocabulary Writing
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1w074-cover-letter](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1w074-cover-letter)
- **Engine:** Storyline 360

**Learning Objective:**  
Learn some of the formal language you'll need when you apply for a job

#### Extracted Learning Content & Task Items

**Section / Slide (Text):**
- Have you ever applied for a job in English? Would you like to practise the formal language of writing a letter of application for a job? Then this activity is for you.
- Covering letter
- Click the CONTINUE button to begin.

**Section / Slide (5 Pairs Big size):**
- Line
- I am writing to apply for the position of Managing Director currently advertised on your website.
- Please find attached a copy of my CV for your consideration.
- Having worked within the industry for over 10 years, I have developed a range of skills that would meet, and exceed the expectations for the role.
- I would relish the opportunity to bring this level of success to your company.
- I look forward to hearing from you with a view to an interview.
- How you meet the employer's needs
- Referring to another document
- Conclusion
- Intention to apply for the job
- An example of why you are the person for the job
- No
- Yes
- Correct
- Incorrect
- You are correct!
- Sorry, that was incorrect.
- OR
- Fender's Department Store
- Hint

**Section / Slide (Text):**
- Yes
- No
- I am writing to apply for the position of Managing Director advertised on your website.
- Read the extracts from a covering letter. Choose the best word to complete the gap.
- Incorrect
- Correct
- You are correct!
- OR
- Sorry, that was incorrect.

**Section / Slide (Text):**
- Yes
- No
- Please find attached a copy of my CV for your .
- Read the extracts from a covering letter. Choose the best word to complete the gap.
- Incorrect
- Correct
- You are correct!
- OR
- Sorry, that was incorrect.

**Section / Slide (Text):**
- Yes
- No
- I have developed a range of skills that would meet, and exceed the for the role.
- Read the extracts from a covering letter. Choose the best word to complete the gap.
- Incorrect
- Correct
- You are correct!
- OR
- Sorry, that was incorrect.

**Section / Slide (Text):**
- Yes
- No
- Complete the gap with a word which means the same as chance.
- Cover letter
- I would relish the __________ to bring this level of success to your company.
- Type your answer here…
- Correct
- Incorrect
- You are correct!
- OR
- Sorry, that was incorrect. The correct answer is opportunity.
- opportunity
- tick.png
- Sorry, that was incorrect.

**Section / Slide (Text):**
- Yes
- No
- Complete the gap with a word to complete the expression which means receiving a reply from.
- Cover letter
- I look forward to __________ from you with a view to an interview.
- Type your answer here…
- Correct
- Incorrect
- You are correct!
- OR
- Sorry, that was incorrect. The answer is 'I look forward to hearing from you ...'
- hearing
- tick.png
- Sorry, that was incorrect.

**Section / Slide (Results Message):**
- How did you do?
- We have lots more activities to help you practise your English! Choose an activity below or search for a different skill.
- See the related activities below to find more like this.
- RESTART ACTIVITY
- Well done! You answered all the questions correctly.
- ^%^Results.ScorePercent^%^^%^ (^%^Results.ScorePoints^%^ points)
- ^%^Results.PassPercent^%^^%^ (^%^Results.PassPoints^%^ points)
- There were some wrong answers, but why not try again?

**App Implementation Strategy:**
- **Component Pattern:** `CoverletterExercise`
- **UX Recommendation:** Implement as a rapid-fire 5–10 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c2l063-what-s-the-product"></a>13. What's the product?

- **Slug:** `c2l063-what-s-the-product`
- **CEFR Level:** C1-C2
- **Estimated Time:** 5–10 minutes
- **Skill Focus:** Listening Vocabulary
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2l063-what-s-the-product](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2l063-what-s-the-product)
- **Engine:** Storyline 360

**Learning Objective:**  
Listen to some descriptions of products and identify them using context clues

#### Extracted Learning Content & Task Items

**Section / Slide (Writing activities):**
- Quite often it can be difficult to understand meaning unless we look at both the language used and the context in which it is used. Listen to the product descriptions and guess what the product is from the general context.
- What's the product?
- Click the CONTINUE button to begin.

**Section / Slide (Audio):**
- What product is being described?
- an iron
- a kettle
- a steam cleaner
- Correct
- Incorrect
- You are correct!
- OR
- Sorry, that was incorrect.
- Sorry, that was incorrect. Listen again and make a note of the key words you hear.

**Section / Slide (Audio):**
- Yes
- No
- LISTEN
- Listen again to the kettle being described. Complete the gap with the word you hear. Practise repeating the missing word.
- icon_task-listen.png
- With its super-fast boil zone you can heat tap water from ______ to boiling in just 50 seconds.
- Type your answer here…
- Incorrect
- Correct
- You are correct!
- OR
- Sorry, that was incorrect.
- tepid
- tick.png
- Sorry, that was incorrect. Listen again.

**Section / Slide (Audio):**
- Yes
- No
- LISTEN
- Listen again to the kettle being described. Complete the gap with the word you hear. Practise repeating the missing word.
- icon_task-listen.png
- It has a handy spout design so you can pour water evenly into mugs and cups without ________ and spilling.
- Type your answer here…
- Incorrect
- Correct
- You are correct!
- OR
- Sorry, that was incorrect.
- spluttering
- tick.png
- Sorry, that was incorrect. Listen again.

**Section / Slide (Audio):**
- What product is being described?
- a wireless microphone
- a wireless radio
- a wireless speaker
- Correct
- Incorrect
- You are correct!
- OR
- Sorry, that was incorrect.
- Sorry, that was incorrect. Listen again and make a note of the key words you hear.

**Section / Slide (Audio):**
- Yes
- No
- LISTEN
- Listen again to the wireless speaker being described. Complete the gap with the word you hear. Practise repeating the missing word.
- icon_task-listen.png
- Bringing together _______ in digital signal processing technologies.
- Type your answer here…
- Incorrect
- Correct
- You are correct!
- OR
- Sorry, that was incorrect.
- expertise
- tick.png
- Sorry, that was incorrect. Listen again.

**Section / Slide (Audio):**
- Yes
- No
- LISTEN
- Listen again to the wireless speaker being described. Complete the gap with the word you hear. Practise repeating the missing word.
- icon_task-listen.png
- This product ______ audio formats to deliver consistently clear, high-quality sound.
- Type your answer here…
- Incorrect
- Correct
- You are correct!
- OR
- Sorry, that was incorrect.
- optimises
- tick.png
- Sorry, that was incorrect. Listen again.

**Section / Slide (Audio):**
- What product is being described?
- a breadmaker
- a food mixer
- an oven
- Correct
- Incorrect
- You are correct!
- OR
- Sorry, that was incorrect.
- Sorry, that was incorrect. Listen again and make a note of the key words you hear.

**Section / Slide (Audio):**
- Yes
- No
- LISTEN
- Listen again to the breadmaker being described. Complete the gap with the word you hear. Practise repeating the missing word.
- icon_task-listen.png
- The _______ mode enables you to use various grains and flours.
- Type your answer here…
- Incorrect
- Correct
- You are correct!
- OR
- Sorry, that was incorrect.
- speciality
- tick.png
- Sorry, that was incorrect. Listen again.

**Section / Slide (Audio):**
- What product is being described?
- a dishwasher
- a tumble dryer
- a washing machine
- Correct
- Incorrect
- You are correct!
- OR
- Sorry, that was incorrect.
- Sorry, that was incorrect. Listen again and make a note of the key words you hear.

**Section / Slide (Audio):**
- Yes
- No
- LISTEN
- Listen again to the washing machine being described. Complete the gap with the word you hear. Practise repeating the missing word.
- icon_task-listen.png
- Add your laundry _____ into the drum without overfilling it.
- Type your answer here…
- Incorrect
- Correct
- You are correct!
- OR
- Sorry, that was incorrect.
- loosely
- tick.png
- Sorry, that was incorrect. Listen again.

**Section / Slide (Results Percent):**
- How did you do?
- RESTART ACTIVITY
- 100^%^
- We have lots more activities to help you practise your English! Choose an activity below or search for a different skill.

**App Implementation Strategy:**
- **Component Pattern:** `WhatstheproductExercise`
- **UX Recommendation:** Implement as a rapid-fire 5–10 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c2l066-a-restaurant-review"></a>14. A restaurant review

- **Slug:** `c2l066-a-restaurant-review`
- **CEFR Level:** C1-C2
- **Estimated Time:** 5–10 minutes
- **Skill Focus:** Listening
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2l066-a-restaurant-review](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2l066-a-restaurant-review)
- **Engine:** Storyline 360

**Learning Objective:**  
Listen to someone talking about dining at a restaurant and answer some questions

#### Extracted Learning Content & Task Items

**Section / Slide (Writing activities):**
- Do you like trying new places to eat? Listen to someone talking about a place they've been to recently.
- A review
- Click the CONTINUE button to begin.
- Transcript

**Section / Slide (Audio):**
- The woman went to this place for dinner.
- True
- False
- Correct
- Incorrect
- You are correct!
- OR
- Sorry, that was incorrect. She mentions 'afternoon tea' more than once.
- Transcript

**Section / Slide (Audio):**
- Although she enjoyed the experience, she felt it was far too expensive.
- True
- False
- Correct
- Incorrect
- You are correct!
- OR
- Sorry, that was incorrect. At the end she says 'It wasn't cheap but I felt that it was well worth the money.'
- Transcript

**Section / Slide (Audio):**
- This means that satisfied isn't a strong enough word to describe her feeling. She was much more than satisfied.
- True
- False
- The woman says 'To say I was satisfied is an understatement.'
- Correct
- Incorrect
- You are correct! An understatement is a statement which describes something in a way which makes it seem less important (in this context) or less serious or bad than it really is.
- OR
- Sorry, that was incorrect. An understatement is a statement which describes something in a way which makes it seem less important (in this context) or less serious or bad than it really is.
- Transcript

**Section / Slide (Audio):**
- This means:
- The woman says 'The service was second to none.'
- Correct
- Incorrect
- You are correct!
- OR
- Sorry, that was incorrect.
- tick.png
- Sorry, that was incorrect. Listen again and focus on the part where she talks about the waiter and the menu. Think about the context.
- Transcript

**Section / Slide (Audio):**
- This means:
- The woman says 'The price was pretty much in line with other places I've been to.'
- Correct
- Incorrect
- You are correct! In line with in this context means 'similar to'.
- OR
- Sorry, that was incorrect.
- tick.png
- Sorry, that was incorrect. Listen again and focus on the part where she talks about the waiter and the menu. Think about the context.
- Transcript

**Section / Slide (4 Pairs - Text):**
- Line
- incidentally
- enthusiastic
- definitely
- indulgent
- oOo
- Oooo
- oooOo
- ooOoo
- No
- Yes
- Match the word with its correct stress pattern.
- icon_task-puzzle.png
- Correct
- Incorrect
- You are correct!
- OR
- Sorry, that was incorrect.
- Sorry, that was incorrect. Listen again and focus on the pronunciation of the words.

**Section / Slide (Results Message):**
- How did you do?
- We have lots more activities to help you practise your English! Choose an activity below or search for a different skill.
- See the related activities below to find more like this.
- RESTART ACTIVITY
- Well done! You answered all the questions correctly.
- ^%^Results.ScorePercent^%^^%^ (^%^Results.ScorePoints^%^ points)
- ^%^Results.PassPercent^%^^%^ (^%^Results.PassPoints^%^ points)
- There were some wrong answers, but why not try again?

**App Implementation Strategy:**
- **Component Pattern:** `ArestaurantreviewExercise`
- **UX Recommendation:** Implement as a rapid-fire 5–10 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c2p055-word-stress-four-syllable-words"></a>15. Word stress four syllable words

- **Slug:** `c2p055-word-stress-four-syllable-words`
- **CEFR Level:** C1-C2
- **Estimated Time:** 5–10 minutes
- **Skill Focus:** Listening Pronunciation
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2p055-word-stress-four-syllable-words](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2p055-word-stress-four-syllable-words)
- **Engine:** Storyline 360

**Learning Objective:**  
Identify the pattern of stressed and unstressed syllables in these long words

#### Extracted Learning Content & Task Items

**Section / Slide (Writing activities):**
- Word stress in 4-syllable words
- Click the CONTINUE button to begin.

**Section / Slide (Oooo):**
- What is the pattern of stressed and unstressed syllables?
- ooOo
- oOoo
- Oooo
- Click to play the words. Select the pattern of stressed and unstressed syllables. (e.g. America = oOoo) Then watch, listen and repeat. Film yourself or look in the mirror. Does your mouth move the same way as in these videos?
- Correct
- Incorrect
- You are correct! Now watch, listen and repeat.
- SHOW ANSWER
- OR
- Sorry, that was incorrect. Look at the correct answer. Then try the activity again.
- Listen again. How many syllables are there? Where is the stress?

**Section / Slide (oOoo):**
- What is the pattern of stressed and unstressed syllables?
- ooOo
- oOoo
- Oooo
- Click to play the words. Select the pattern of stressed and unstressed syllables. (e.g. America = oOoo) Then watch, listen and repeat. Film yourself or look in the mirror. Does your mouth move the same way as in these videos?
- Correct
- Incorrect
- You are correct! Now watch, listen and repeat.
- SHOW ANSWER
- OR
- Sorry, that was incorrect. Look at the correct answer. Then try the activity again.
- Listen again. How many syllables are there? Where is the stress?

**Section / Slide (ooOo):**
- What is the pattern of stressed and unstressed syllables?
- ooOo
- oOoo
- Oooo
- Click to play the words. Select the pattern of stressed and unstressed syllables. (e.g. America = oOoo) Then watch, listen and repeat. Film yourself or look in the mirror. Does your mouth move the same way as in these videos?
- Correct
- Incorrect
- You are correct! Now watch, listen and repeat.
- SHOW ANSWER
- OR
- Sorry, that was incorrect. Look at the correct answer. Then try the activity again.
- Listen again. How many syllables are there? Where is the stress?

**Section / Slide (oOoo):**
- What is the pattern of stressed and unstressed syllables?
- ooOo
- oOoo
- Oooo
- Click to play the words. Select the pattern of stressed and unstressed syllables. (e.g. America = oOoo) Then watch, listen and repeat. Film yourself or look in the mirror. Does your mouth move the same way as in these videos?
- Correct
- Incorrect
- You are correct! Now watch, listen and repeat.
- SHOW ANSWER
- OR
- Sorry, that was incorrect. Look at the correct answer. Then try the activity again.
- Listen again. How many syllables are there? Where is the stress?

**Section / Slide (Oooo):**
- What is the pattern of stressed and unstressed syllables?
- ooOo
- oOoo
- Oooo
- Click to play the words. Select the pattern of stressed and unstressed syllables. (e.g. America = oOoo) Then watch, listen and repeat. Film yourself or look in the mirror. Does your mouth move the same way as in these videos?
- Correct
- Incorrect
- You are correct! Now watch, listen and repeat.
- SHOW ANSWER
- OR
- Sorry, that was incorrect. Look at the correct answer. Then try the activity again.
- Listen again. How many syllables are there? Where is the stress?

**Section / Slide (ooOo):**
- What is the pattern of stressed and unstressed syllables?
- ooOo
- oOoo
- Oooo
- Click to play the words. Select the pattern of stressed and unstressed syllables. (e.g. America = oOoo) Then watch, listen and repeat. Film yourself or look in the mirror. Does your mouth move the same way as in these videos?
- Correct
- Incorrect
- You are correct! Now watch, listen and repeat.
- SHOW ANSWER
- OR
- Sorry, that was incorrect. Look at the correct answer. Then try the activity again.
- Listen again. How many syllables are there? Where is the stress?

**Section / Slide (ooOo):**
- What is the pattern of stressed and unstressed syllables?
- ooOo
- oOoo
- Oooo
- Click to play the words. Select the pattern of stressed and unstressed syllables. (e.g. America = oOoo) Then watch, listen and repeat. Film yourself or look in the mirror. Does your mouth move the same way as in these videos?
- Correct
- Incorrect
- You are correct! Now watch, listen and repeat.
- SHOW ANSWER
- OR
- Sorry, that was incorrect. Look at the correct answer. Then try the activity again.
- Listen again. How many syllables are there? Where is the stress?

**Section / Slide (oOoo):**
- What is the pattern of stressed and unstressed syllables?
- ooOo
- oOoo
- Oooo
- Click to play the words. Select the pattern of stressed and unstressed syllables. (e.g. America = oOoo) Then watch, listen and repeat. Film yourself or look in the mirror. Does your mouth move the same way as in these videos?
- Correct
- Incorrect
- You are correct! Now watch, listen and repeat.
- SHOW ANSWER
- OR
- Sorry, that was incorrect. Look at the correct answer. Then try the activity again.
- Listen again. How many syllables are there? Where is the stress?

**Section / Slide (Oooo):**
- What is the pattern of stressed and unstressed syllables?
- ooOo
- oOoo
- Oooo
- Click to play the words. Select the pattern of stressed and unstressed syllables. (e.g. America = oOoo) Then watch, listen and repeat. Film yourself or look in the mirror. Does your mouth move the same way as in these videos?
- Correct
- Incorrect
- You are correct! Now watch, listen and repeat.
- SHOW ANSWER
- OR
- Sorry, that was incorrect. Look at the correct answer. Then try the activity again.
- Listen again. How many syllables are there? Where is the stress?

**Section / Slide (ooOo):**
- What is the pattern of stressed and unstressed syllables?
- ooOo
- oOoo
- Oooo
- Click to play the words. Select the pattern of stressed and unstressed syllables. (e.g. America = oOoo) Then watch, listen and repeat. Film yourself or look in the mirror. Does your mouth move the same way as in these videos?
- Correct
- Incorrect
- You are correct! Now watch, listen and repeat.
- SHOW ANSWER
- OR
- Sorry, that was incorrect. Look at the correct answer. Then try the activity again.
- Listen again. How many syllables are there? Where is the stress?

**Section / Slide (oOoo):**
- What is the pattern of stressed and unstressed syllables?
- ooOo
- oOoo
- Oooo
- Click to play the words. Select the pattern of stressed and unstressed syllables. (e.g. America = oOoo) Then watch, listen and repeat. Film yourself or look in the mirror. Does your mouth move the same way as in these videos?
- Correct
- Incorrect
- You are correct! Now watch, listen and repeat.
- SHOW ANSWER
- OR
- Sorry, that was incorrect. Look at the correct answer. Then try the activity again.
- Listen again. How many syllables are there? Where is the stress?

**Section / Slide (Oooo):**
- What is the pattern of stressed and unstressed syllables?
- ooOo
- oOoo
- Oooo
- Click to play the words. Select the pattern of stressed and unstressed syllables. (e.g. America = oOoo) Then watch, listen and repeat. Film yourself or look in the mirror. Does your mouth move the same way as in these videos?
- Correct
- Incorrect
- You are correct! Now watch, listen and repeat.
- SHOW ANSWER
- OR
- Sorry, that was incorrect. Look at the correct answer. Then try the activity again.
- Listen again. How many syllables are there? Where is the stress?

**Section / Slide (Results Percent):**
- How did you do?
- RESTART ACTIVITY
- 100^%^
- We have lots more activities to help you practise your English! Choose an activity below or search for a different skill.

**App Implementation Strategy:**
- **Component Pattern:** `WordstressfoursyllablewordsExercise`
- **UX Recommendation:** Implement as a rapid-fire 5–10 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c2r067-the-world-of-work"></a>16. The world of work

- **Slug:** `c2r067-the-world-of-work`
- **CEFR Level:** C1-C2
- **Estimated Time:** 0–5 minutes
- **Skill Focus:** Reading
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2r067-the-world-of-work](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2r067-the-world-of-work)
- **Engine:** Storyline 360

**Learning Objective:**  
This reading exercise looks at language used in a job application

#### Extracted Learning Content & Task Items

**Section / Slide (Text Large):**
- Have you ever applied for a job in English? This reading exercise looks at language from a job application.
- The world of work
- Click the CONTINUE button to begin.
- Text

**Section / Slide (Text - Large):**
- You would see this extract in a covering letter in an application for a job.
- Is the statement true or false?
- True
- False
- VIEW TEXT
- icon_task-read.png
- Incorrect
- Correct
- You are correct!
- OR
- Sorry, that was incorrect.
- Text

**Section / Slide (Text - Large):**
- In the context of the covering letter, assessment is related to:
- Read the text again if necessary. Then answer the question.
- designing courses
- teaching
- tests
- VIEW TEXT
- icon_task-read.png
- Incorrect
- Correct
- You are correct!
- OR
- Sorry, that was incorrect.
- Sorry, that was incorrect. Think about the meaning of 'This latter is my forte; I have been heavily involved in not only developing exams but also administering and marking'.
- Text

**Section / Slide (Text Large):**
- Yes
- No
- Complete the gap with one word from the text.
- VIEW TEXT
- A _________ person is very good at getting people to believe in what they are saying.
- Type your answer here…
- icon_task-read.png
- Incorrect
- Correct
- You are correct!
- OR
- Sorry, that was incorrect.
- persuasive
- tick.png
- Sorry that was incorrect. You're looking for an adjective.
- Text

**Section / Slide (Text Large):**
- Yes
- No
- Complete the gap with one word from the text.
- VIEW TEXT
- If something is especially made or designed for someone this is described as ___________.
- Type your answer here…
- icon_task-read.png
- Incorrect
- Correct
- You are correct!
- OR
- Sorry, that was incorrect.
- bespoke
- tick.png
- Sorry that was incorrect. You're looking for an adjective.
- Text

**Section / Slide (Text Large):**
- Yes
- No
- Complete the gap with one word from the text.
- VIEW TEXT
- I have been involved in ______ only developing exams but also administering and marking.
- Type your answer here…
- icon_task-read.png
- Incorrect
- Correct
- You are correct!
- OR
- Sorry, that was incorrect. The structure is not only … but also …
- not
- tick.png
- Sorry that was incorrect.
- Text

**Section / Slide (Results Percent):**
- How did you do?
- RESTART ACTIVITY
- 100^%^
- We have lots more activities to help you practise your English! Choose an activity below or search for a different skill.

**App Implementation Strategy:**
- **Component Pattern:** `TheworldofworkExercise`
- **UX Recommendation:** Implement as a rapid-fire 0–5 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c2r068-property-for-sale"></a>17. Property for sale

- **Slug:** `c2r068-property-for-sale`
- **CEFR Level:** C1-C2
- **Estimated Time:** 0–5 minutes
- **Skill Focus:** Reading
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2r068-property-for-sale](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2r068-property-for-sale)
- **Engine:** Storyline 360

**Learning Objective:**  
Read a description of a property for sale and answer some questions

#### Extracted Learning Content & Task Items

**Section / Slide (Text Large):**
- Read the text which is describing a property for sale.
- Descriptions
- Click the CONTINUE button to begin.
- Text

**Section / Slide (Text - Large):**
- The text is describing a large house that isn't attached to any other building.
- Read the text again if necessary. Then answer the question.
- True
- False
- VIEW TEXT
- icon_task-read.png
- Incorrect
- Correct
- You are correct! A detached property is a house that is not connected to any other building.
- OR
- Sorry, that was incorrect. A detached property is a house that is not connected to any other building.
- Text

**Section / Slide (Text - Large):**
- Amenities are things within a town that are designed to make life more pleasant or comfortable for those living there. Things such as a supermarket and coffee shop.
- Read the text again if necessary. Then answer the question.
- True
- False
- VIEW TEXT
- icon_task-read.png
- Incorrect
- Correct
- You are correct!
- OR
- Sorry, that was incorrect.
- Text

**Section / Slide (Text - Large):**
- What are described as well proportioned and well finished?
- Look at the second paragraph again.
- the entrance halls
- the fireplaces
- the reception rooms
- VIEW TEXT
- icon_task-read.png
- Incorrect
- Correct
- You are correct!
- OR
- Sorry, that was incorrect.
- Text

**Section / Slide (Text Large):**
- Yes
- No
- Complete the gap with one word from the text.
- VIEW TEXT
- Which word in the third paragraph is a verb which means to have something to be proud of?
- Type your answer here…
- icon_task-read.png
- Incorrect
- Correct
- You are correct!
- OR
- Sorry, that was incorrect.
- boast
- tick.png
- to boast
- Sorry that was incorrect.
- Text

**Section / Slide (Results Percent):**
- How did you do?
- RESTART ACTIVITY
- 100^%^
- We have lots more activities to help you practise your English! Choose an activity below or search for a different skill.

**App Implementation Strategy:**
- **Component Pattern:** `PropertyforsaleExercise`
- **UX Recommendation:** Implement as a rapid-fire 0–5 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c2v052-body-and-health-part-2"></a>18. Body and health part 2

- **Slug:** `c2v052-body-and-health-part-2`
- **CEFR Level:** C1-C2
- **Estimated Time:** 10+ minutes
- **Skill Focus:** Vocabulary
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2v052-body-and-health-part-2](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2v052-body-and-health-part-2)
- **Engine:** Storyline 360

**Learning Objective:**  
Choose the correct word to complete these sentences about health and wellbeing

#### Extracted Learning Content & Task Items

**Section / Slide (Text):**
- Body and health
- Click the CONTINUE button to begin.

**Section / Slide (Text):**
- Another word for the natural appearance of the skin on your face is your _______.
- Choose the correct word to complete the sentence.
- complexion
- texture
- Correct
- Incorrect
- You are correct! Your complexion is the natural appearance of the skin on your face. Texture means 'the way that something feels when you touch it'.
- OR
- Sorry, that was incorrect. The natural appearance of the skin on your face is your complexion. Texture means 'the way that something feels when you touch it'.

**Section / Slide (Text):**
- When a woman _________, that means she becomes pregnant.
- Choose the correct word to complete the sentence.
- bears
- conceives
- Correct
- Incorrect
- You are correct! If a woman conceives, she becomes pregnant. If she bears a child, she gives birth. To bear a child is used mainly in literature and is slightly old-fashioned.
- OR
- Sorry, that was incorrect. If a woman conceives, she becomes pregnant. If she bears a child, she gives birth. To bear a child is used mainly in literature and is slightly old-fashioned.

**Section / Slide (Text):**
- _______ means having a long life.
- Choose the correct word to complete the sentence.
- Vitality
- Longevity
- Correct
- Incorrect
- You are correct! Longevity means 'having a long life'.
- OR
- Sorry, that was incorrect. Longevity means 'having a long life'. Vitality is the quality of being full of energy and enthusiasm.

**Section / Slide (Text):**
- If you feel a bit ill, you can say that you are ______.
- Choose the correct phrase to complete the sentence.
- under the weather
- down in the dumps
- Correct
- Incorrect
- You are correct! Under the weather means 'feeling a bit ill'. Down in the dumps means 'depressed or feeling gloomy'.
- OR
- Sorry, that was incorrect. Under the weather means 'feeling a bit ill'. Down in the dumps means 'depressed or feeling gloomy'.

**Section / Slide (Text):**
- Your _______ are all the places in your body where two bones meet.
- Choose the correct word to complete the sentence.
- knuckles
- joints
- Correct
- Incorrect
- You are correct! Your joints are all the places in your body where two bones meet. Your knuckles are the joints in your fingers.
- OR
- Sorry, that was incorrect. Your joints are all the places in your body where two bones meet. Your knuckles are the joints in your fingers.

**Section / Slide (Text):**
- When a disease is _______ through water, it is spread to people through water.
- Choose the correct word to complete the sentence.
- transplanted
- transmitted
- Correct
- Incorrect
- You are correct! A disease is transmitted from one person to another. An organ is transplanted when it is moved from one person's body to another's.
- OR
- Sorry, that was incorrect. A disease is transmitted from one person to another. An organ is transplanted when it is moved from one person's body to another's.

**Section / Slide (Text):**
- Patients may feel quite ________ after a long illness in bed and no exercise.
- Choose the correct word to complete the sentence.
- feeble
- unbalanced
- Correct
- Incorrect
- You are correct! Patients may feel quite feeble after a long illness in bed. Feeble is another word meaning 'weak'. Unbalanced means 'slightly mentally ill'.
- OR
- Sorry, that was incorrect. Patients may feel quite feeble after a long illness in bed. Feeble is another word meaning 'weak'. Unbalanced means 'slightly mentally ill'.

**Section / Slide (Text):**
- Your _______ is the back part of your leg below your knee.
- Choose the correct word to complete the sentence.
- thigh
- calf
- Correct
- Incorrect
- You are correct! Your calf is the back part of your leg below your knee. Your thigh is the part of your leg above your knee.
- OR
- Sorry, that was incorrect. Your calf is the back part of your leg below your knee. Your thigh is the part of your leg above your knee.

**Section / Slide (Text):**
- As we age, our skin loses its elasticity and we get more ________ on our faces.
- Choose the correct word to complete the sentence.
- wrinkles
- folds
- Correct
- Incorrect
- You are correct! We get more wrinkles on our faces. A fold is a part of material that is folded.
- OR
- Sorry, that was incorrect. We get more wrinkles on our faces. A fold is a part of material that is folded. A fold in your skin is not due to age or lack of elasticity.

**Section / Slide (Text):**
- To fight infections, a doctor often ________ antibiotics.
- Choose the correct word to complete the sentence.
- diagnoses
- prescribes
- Correct
- Incorrect
- You are correct! A doctor prescribes medicines. A doctor diagnoses an illness when he/she tells you what illness you have got.
- OR
- Sorry, that was incorrect. A doctor prescribes medicines. A doctor diagnoses an illness when he/she tells you what illness you have got.

**Section / Slide (Text):**
- When describing the number of deaths among a particular age group such as the elderly or infants, we talk about the __________ rate.
- Choose the correct word to complete the sentence.
- casualty
- mortality
- Correct
- Incorrect
- You are correct! The mortality rate is the number of deaths among a particular age group. Casualties are people who are injured or killed in an accident or war, and the casualty rate describes the number of these people.
- OR
- Sorry, that was incorrect. The mortality rate is the number of deaths among a particular age group. Casualties are people who are injured or killed in an accident or war, and the casualty rate describes the number of these people.

**Section / Slide (Text):**
- If you _______ a mild illness such as a cold, you manage to get rid of it.
- Choose the correct word to complete the sentence.
- shake off
- shake down
- Correct
- Incorrect
- You are correct! If you shake off a mild illness, you manage to get rid of it. Check the various meanings of shake down in a good dictionary.
- OR
- Sorry, that was incorrect. If you shake off a mild illness, you manage to get rid of it. Check the various meanings of shake down in a good dictionary.

**Section / Slide (Text):**
- People who are given very little food to eat over a long period may die of _________.
- Choose the correct word to complete the sentence.
- famine
- starvation
- Correct
- Incorrect
- You are correct! People who are given very little food to eat over a long period may die of starvation. Famine is the situation of lacking food in a large geographical area, for example because of floods or drought.
- OR
- Sorry, that was incorrect. People who are given very little food to eat over a long period may die of starvation. Famine is the situation of lacking food in a large geographical area, for example because of floods or drought.

**Section / Slide (Text):**
- You can describe someone who is extremely tired as _________.
- Choose the correct word to complete the sentence.
- shattered
- baffled
- Correct
- Incorrect
- You are correct! Shattered means 'extremely tired'. Baffled means 'confused and not able to understand something'.
- OR
- Sorry, that was incorrect. Shattered means 'extremely tired'. Baffled means 'confused and not able to understand something'.

**Section / Slide (Text):**
- Food that makes your mouth _______ makes you want to eat it because it smells or looks delicious.
- Choose the correct word to complete the sentence.
- water
- dribble
- Correct
- Incorrect
- You are correct! Delicious food can make your mouth water. A person, for example a baby, dribbles when liquid comes out of the mouth.
- OR
- Sorry, that was incorrect. Delicious food can make your mouth water. A person, for example a baby, dribbles when liquid comes out of the mouth.

**Section / Slide (Text):**
- If you have ________ after an operation, the surgeon sews the cut in your flesh back together.
- Choose the correct word to complete the sentence.
- threads
- stitches
- Correct
- Incorrect
- You are correct! You have stitches after an operation. Thread is the material used for sewing things together.
- OR
- Sorry, that was incorrect. You have stitches after an operation. Thread is the material used for sewing things together.

**Section / Slide (Text):**
- A person who ________ becomes mentally ill.
- Choose the correct phrasal verb to complete the sentence.
- cracks down
- cracks up
- Correct
- Incorrect
- You are correct! A person who cracks up becomes mentally ill. Check the meaning of crack down in a good dictionary.
- OR
- Sorry, that was incorrect. A person who cracks up becomes mentally ill. Check the meaning of crack down in a good dictionary.

**Section / Slide (Text):**
- If an elderly person is ________, they are not strong or healthy.
- Choose the correct word to complete the sentence.
- tender
- frail
- Correct
- Incorrect
- You are correct! If an elderly person is frail, they are not strong or healthy. Part of your body is tender if it is painful when you touch it.
- OR
- Sorry, that was incorrect. If an elderly person is frail, they are not strong or healthy. Part of your body is tender if it is painful when you touch it.

**Section / Slide (Text):**
- When soldiers returning from a war zone suffer from _______ of traumatic experiences, they imagine that they are experiencing them again.
- Choose the correct word to complete the sentence.
- flashbacks
- hallucinations
- Correct
- Incorrect
- You are correct! Soldiers suffer from flashbacks of traumatic experiences when they imagine they are experiencing them again. Hallucinations are things that you think you see or hear but that are not really there.
- OR
- Sorry, that was incorrect. Soldiers suffer from flashbacks of traumatic experiences when they imagine they are experiencing them again. Hallucinations are things that you think you see or hear but that are not really there.

**Section / Slide (Text):**
- If you _______ a muscle, you injure it by stretching it too much.
- Choose the correct word to complete the sentence.
- twist
- pull
- Correct
- Incorrect
- You are correct! If you pull a muscle, you injure it by stretching it too much. You twist a joint such as an ankle or knee, not a muscle.
- OR
- Sorry, that was incorrect. If you pull a muscle, you injure it by stretching it too much. You twist a joint such as an ankle or knee, not a muscle.

**Section / Slide (Results Percent):**
- How did you do?
- RESTART ACTIVITY
- 100^%^
- We have lots more activities to help you practise your English! Choose an activity below or search for a different skill.

**App Implementation Strategy:**
- **Component Pattern:** `Bodyandhealthpart2Exercise`
- **UX Recommendation:** Implement as a rapid-fire 10+ minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c2v072-definitions-of-formal-words"></a>19. Definitions of formal words

- **Slug:** `c2v072-definitions-of-formal-words`
- **CEFR Level:** C1-C2
- **Estimated Time:** 0–5 minutes
- **Skill Focus:** Vocabulary
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2v072-definitions-of-formal-words](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2v072-definitions-of-formal-words)
- **Engine:** Storyline 360

**Learning Objective:**  
This activity will help you use different forms of the same word s

#### Extracted Learning Content & Task Items

**Section / Slide (Text):**
- Having a good range of vocabulary is necessary to make you fluent in both speaking and writing. This activity practises your knowledge of vocabulary and how to use different forms of the same word.
- Definitions of formal words
- Click the CONTINUE button to begin.

**Section / Slide (Matching):**
- Line
- acknowledge (verb)
- anticipate (verb)
- appoint (verb)
- attain (verb)
- accept, admit or recognise something
- imagine or expect that something will happen
- choose someone officially for a job or responsibility
- reach or succeed in getting something
- No
- Yes
- Match the words on the left with the correct definitions on the right.
- icon_task-puzzle.png
- Correct
- Incorrect
- You are correct!
- OR
- Sorry, that was incorrect.
- Would you like to try again or see answers?

**Section / Slide (Text):**
- Yes
- No
- Please can you receipt of this email by replying.
- Now let's see if you can remember the vocabulary. Choose the correct word to complete the gap.
- Incorrect
- Correct
- You are correct!
- OR
- Sorry, that was incorrect. The correct answer is: Please can you acknowledge receipt of this email by replying?
- Sorry, that was incorrect.
- Would you like to try again or see answers?

**Section / Slide (Text):**
- Yes
- No
- We will be looking to a new CEO within three months.
- Now let's see if you can remember the vocabulary. Choose the correct word to complete the gap.
- Correct
- Incorrect
- You are correct!
- OR
- Sorry, that was incorrect. The correct answer is: We will be looking to appoint a new CEO within three months.
- Sorry, that was incorrect.
- Would you like to try again or see answers?

**Section / Slide (Text):**
- Yes
- No
- Now let's see if you can remember the vocabulary and adapt it to the new sentence structure. You may have to change the original verb to a noun or adjective.
- Definitions
- I hardly slept that night in eager _______ of the big day ahead.
- Type your answer here…
- Correct
- Incorrect
- You are correct! Anticipation means 'a feeling of excitement for something that is going to happen in the near future'.
- OR
- Sorry, that was incorrect. The correct answer is anticipation which means 'a feeling of excitement for something that is going to happen in the near future'.
- anticipation
- tick.png
- Sorry, that was incorrect. You need the noun form of the word.

**Section / Slide (Audio):**
- Click to listen to the sentence. Practise the pronunciation of the new word by repeating the sentence you hear.
- Click the CONTINUE button.
- LISTEN
- Definitions

**Section / Slide (Text):**
- Yes
- No
- Type your answer here…
- Now let's see if you can remember the vocabulary and adapt it to the new sentence structure. You may have to change the original verb to a noun or adjective.
- Definitions
- I applied for so many jobs but only got three _________ thanking me for my application but telling me I hadn't been successful.
- Correct
- Incorrect
- You are correct! Acknowledgements are emails or letters to say that you have received something that someone has sent you.
- OR
- Sorry, that was incorrect. The correct answer is acknowledgements which are emails or letters to say that you have received something that someone has sent you.
- acknowledgements
- tick.png
- Sorry, that was incorrect. You need the noun form of the word.

**Section / Slide (Audio):**
- Click to listen to the sentence. Practise the pronunciation of the new word by repeating the sentence you hear.
- Click the CONTINUE button.
- LISTEN
- Definitions

**Section / Slide (Results Message):**
- How did you do?
- We have lots more activities to help you practise your English! Choose an activity below or search for a different skill.
- See the related activities below to find more like this.
- RESTART ACTIVITY
- Well done! You answered all the questions correctly.
- ^%^Results.ScorePercent^%^^%^ (^%^Results.ScorePoints^%^ points)
- ^%^Results.PassPercent^%^^%^ (^%^Results.PassPoints^%^ points)
- There were some wrong answers, but why not try again?

**App Implementation Strategy:**
- **Component Pattern:** `DefinitionsofformalwordsExercise`
- **UX Recommendation:** Implement as a rapid-fire 0–5 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c1g059-fronting-substitution-and-ellipsis"></a>20. Fronting substitution and ellipsis

- **Slug:** `c1g059-fronting-substitution-and-ellipsis`
- **CEFR Level:** C1-C2
- **Estimated Time:** 0–5 minutes
- **Skill Focus:** Grammar Speaking
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1g059-fronting-substitution-and-ellipsis](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1g059-fronting-substitution-and-ellipsis)
- **Engine:** Storyline 360

**Learning Objective:**  
Identify some elements of spoken English

#### Extracted Learning Content & Task Items

**Section / Slide (Writing activities):**
- Fronting, substitution and ellipsis
- Click the CONTINUE button to begin.

**Section / Slide (3 Pairs - Text):**
- Line
- Written that report for the meeting yet?
- 'Can I help myself to cake?' 'Yes, please do.'
- That tall man you were talking to, what's his name?
- fronting (moving a clause to the front of a sentence)
- substitution (using a word or words to avoid repeating a whole phrase)
- ellipsis (leaving out words from a sentence)
- No
- Yes
- Read each sentence. Which feature of spoken English is shown by the words in italics?
- icon_task-puzzle.png
- Correct
- Incorrect
- You are correct! In Question 1, the full sentence would be Have you written that report for the meeting yet? In English, we sometimes leave out auxiliaries (e.g. have) and subjects (e.g. you) when we speak. In Question 2, do is substituted for help yourself. In Question 3, the first part of the sentence is emphasised by putting it at the front.
- OR
- Sorry, that was incorrect. In Question 1, the full sentence would be Have you written that report for the meeting yet? In English, we sometimes leave out auxiliaries (e.g. have) and subjects (e.g. you) when we speak. In Question 2, do is substituted for help yourself. In Question 3, the first part of the sentence is emphasised by putting it at the front.
- Sorry, that was incorrect. Look carefully at the explanations in brackets and compare them with the words in italics.

**Section / Slide (3 Pairs - Text):**
- Line
- Chinese restaurants? Yes, there's one just round the corner.
- Those nice houses we saw on the way here, where were they again?
- Dan's in South Africa now. Went there on holiday and never came back!
- fronting (moving a clause to the front of a sentence)
- substitution (using a word or words to avoid repeating a whole phrase)
- ellipsis (leaving out words from a sentence)
- No
- Yes
- Read each sentence. Which feature of spoken English is shown by the words in italics?
- icon_task-puzzle.png
- Correct
- Incorrect
- You are correct! In Question 1, one is substituted for a Chinese restaurant. In Question 2, the first part of the sentence is emphasised by being put at the front. In Question 3, the full sentence would be He went there … . In English we sometimes leave out subjects like he when we speak if it's clear who we're talking about.
- OR
- Sorry, that was incorrect. In Question 1, one is substituted for a Chinese restaurant. In Question 2, the first part of the sentence is emphasised by being put at the front. In Question 3, the full sentence would be He went there … . In English we sometimes leave out subjects like he when we speak if it's clear who we're talking about.
- Sorry, that was incorrect. Look carefully at the explanations in brackets and compare them with the words in italics.

**Section / Slide (Results Message):**
- How did you do?
- We have lots more activities to help you practise your English! Choose an activity below or search for a different skill.
- See the related activities below to find more like this.
- RESTART ACTIVITY
- Well done! You answered all the questions correctly.
- ^%^Results.ScorePercent^%^^%^ (^%^Results.ScorePoints^%^ points)
- ^%^Results.PassPercent^%^^%^ (^%^Results.PassPoints^%^ points)
- There were some wrong answers, but why not try again?

**App Implementation Strategy:**
- **Component Pattern:** `FrontingsubstitutionandellipsisExercise`
- **UX Recommendation:** Implement as a rapid-fire 0–5 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c1v051-body-and-health-part-1"></a>21. Body and health part 1

- **Slug:** `c1v051-body-and-health-part-1`
- **CEFR Level:** C1-C2
- **Estimated Time:** 10+ minutes
- **Skill Focus:** Vocabulary
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1v051-body-and-health-part-1](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1v051-body-and-health-part-1)
- **Engine:** Storyline 360

**Learning Objective:**  
Choose the correct word to complete these sentences

#### Extracted Learning Content & Task Items

**Section / Slide (Text):**
- Body and health
- Click the CONTINUE button to begin.

**Section / Slide (Text):**
- If you want to measure your heart rate, simply check your _______.
- Choose the correct word to complete the sentence.
- beat
- pulse
- pressure
- Correct
- Incorrect
- You are correct! Your pulse is the regular beat of blood as it is sent around your body.
- OR
- Sorry, that was incorrect. Your pulse is the regular beat of blood as it is sent around your body. Check the other words in a good dictionary.
- Sorry, that was incorrect. Nurses often check this by putting their fingers on your wrist.

**Section / Slide (Text):**
- _______ are the tubes in the body that are responsible for carrying blood towards the heart.
- Choose the correct word to complete the sentence.
- Veins
- Germs
- Canals
- Correct
- Incorrect
- You are correct! Veins carry blood towards the heart.
- OR
- Sorry, that was incorrect. Veins carry blood towards the heart. Check the other words in a good dictionary.
- Sorry, that was incorrect. You can see these under your skin, and they look blue in colour.

**Section / Slide (Text):**
- You definitely know the answer to this question - just _______!
- Choose the correct phrase to complete the sentence.
- lose your head
- cross your mind
- use your brain
- Correct
- Incorrect
- You are correct! Use your brain is an informal way of saying use your intelligence.
- OR
- Sorry, that was incorrect. Use your brain is an informal way of saying use your intelligence. Check the other words in a good dictionary.
- Sorry, that was incorrect. This is an informal phrase meaning 'use your intelligence'.

**Section / Slide (Text):**
- These tiny living things that consist of a single cell are called _______ , and while some types can cause infection, others help us to digest our food.
- Choose the correct word to complete the sentence.
- viruses
- bacteria
- bugs
- Correct
- Incorrect
- You are correct! Some bacteria can cause infection but others help us to digest our food.
- OR
- Sorry, that was incorrect. Some bacteria can cause infection but unlike viruses and bugs, others help us to digest our food.
- Sorry, that was incorrect. Notice that these things help us to digest our food.

**Section / Slide (Text):**
- It's thought that the increasing size of food portions is a significant factor in _______.
- Choose the correct word to complete the sentence.
- obesity
- overweight
- heaviness
- Correct
- Incorrect
- You are correct! Obesity is a medical condition that people have if they are very overweight.
- OR
- Sorry, that was incorrect. Obesity is a medical condition that people have if they are very overweight. Overweight is an adjective. Heaviness is the general quality of being heavy.
- Sorry, that was incorrect. This is a medical condition.

**Section / Slide (Text):**
- Using these fresh ingredients, you can produce a delicious and _______ meal that's perfect for a growing family.
- Choose the correct word to complete the sentence.
- nutritious
- beneficial
- healing
- Correct
- Incorrect
- You are correct! Nutritious is a formal word meaning 'healthy' (used about food).
- OR
- Sorry, that was incorrect. Nutritious is a formal word meaning 'healthy' (used about food). Check the other words in a good dictionary.
- Sorry, that was incorrect. This is a formal word meaning 'healthy' (used about food).

**Section / Slide (Text):**
- The long series of bones in your back, called your _____ , holds your head and body upright and allows you to bend and twist.
- Choose the correct word to complete the sentence.
- column
- spine
- back bone
- Correct
- Incorrect
- You are correct! Your spine is the long series of bones in your back.
- OR
- Sorry, that was incorrect. Your spine is the long series of bones in your back. It is also called your backbone, but written as one word not two.
- Sorry, that was incorrect. This is only one word.

**Section / Slide (Text):**
- If you are going bald, it may be because you inherited the ______ that cause baldness from one of your parents.
- Choose the correct word to complete the sentence.
- cells
- germs
- genes
- Correct
- Incorrect
- You are correct! You inherit your genes from your parents and they influence your appearance and character.
- OR
- Sorry, that was incorrect. You inherit your genes from your parents and they influence your appearance and character. Check the other words in a good dictionary.
- Sorry, that was incorrect. Which of these can you inherit from your parents?

**Section / Slide (Text):**
- Becoming a professional athlete isn't an easy lifestyle choice - it takes enormous physical and mental _______.
- Choose the correct word to complete the sentence.
- spirit
- stamina
- survival
- Correct
- Incorrect
- You are correct! Stamina means 'strength to continue doing something'.
- OR
- Sorry, that was incorrect. Stamina means 'strength to continue doing something'. Check the other words in a good dictionary.
- Sorry, that was incorrect. This word means 'strength to continue doing something'.

**Section / Slide (Text):**
- There's no denying the _______effects of a relaxing holiday in the sun.
- Choose the correct word to complete the sentence.
- therapeutic
- medical
- repairing
- Correct
- Incorrect
- You are correct! Therapeutic means 'helping to cure a disease or improve your health'.
- OR
- Sorry, that was incorrect. Therapeutic means 'helping to cure a disease or improve your health'. Check the other words in a good dictionary.
- Sorry, that was incorrect. The word you need means 'helping to cure a disease or improve your health'.

**Section / Slide (Text):**
- Exercise is known to increase your sense of _______.
- Choose the correct word to complete the sentence.
- welfare
- health
- well-being
- Correct
- Incorrect
- You are correct! Well-being means 'being healthy and happy'.
- OR
- Sorry, that was incorrect. Well-being means 'being healthy and happy'. It is often used in the phrase a sense of well-being. Check the other words in a good dictionary.
- Sorry, that was incorrect. This word means 'being healthy and happy'.

**Section / Slide (Text):**
- Farm animals can _______diseases, so it's important to wash your hands after handling them.
- Choose the correct word to complete the sentence.
- grow
- infect
- carry
- Correct
- Incorrect
- You are correct! The correct word is carry.
- OR
- Sorry, that was incorrect. The correct word is carry. Animals do not grow diseases. Infect means 'to pass an infection or disease to a person or animal'.
- Sorry, that was incorrect. Some animals and insects have a disease and can spread it, even though they are not sick with it themselves.

**Section / Slide (Text):**
- When you're having stomach trouble, you should avoid rich foods that are difficult to _______.
- Choose the correct word to complete the sentence.
- absorb
- digest
- reduce
- Correct
- Incorrect
- You are correct! Digest means 'to change food into substances that your body can use'.
- OR
- Sorry, that was incorrect. Digest means 'to change food into substances that your body can use'. Check the other words in a good dictionary.
- Sorry, that was incorrect. This word is used in relation to how your body deals with food.

**Section / Slide (Text):**
- The heart is one of the most important ______ in the human body.
- Choose the correct phrase to complete the sentence.
- instruments
- organs
- elements
- Correct
- Incorrect
- You are correct! Organ means 'a part of the body that has a particular purpose'.
- OR
- Sorry, that was incorrect. Organ means 'a part of the body that has a particular purpose'. Check the other words in a good dictionary.
- Sorry, that was incorrect. This is a part of the body that has a particular purpose.

**Section / Slide (Text):**
- It's unlikely that children will _______ badly to the drug although they may have a slightly sore arm.
- Choose the correct word to complete the sentence.
- react
- relate
- refer
- Correct
- Incorrect
- You are correct! If you react badly to a drug or other substance, you become ill because of it.
- OR
- Sorry, that was incorrect. If you react badly to a drug or other substance, you become ill because of it. Check the other words in a good dictionary.
- The correct word, together with 'badly', means 'become ill because of a substance that you have used, eaten, etc'.

**Section / Slide (Text):**
- When working at a computer, good _______ will help you to avoid serious back problems.
- Choose the correct word to complete the sentence.
- position
- attitude
- posture
- Correct
- Incorrect
- You are correct! Posture means 'the position of your back, shoulders, etc. when you are standing or sitting'.
- OR
- Sorry, that was incorrect. Posture means 'the position of your back, shoulders, etc. when you are standing or sitting'. Check the other words in a good dictionary.
- Sorry, that was incorrect. The correct word means 'the position of your back, shoulders, etc. when you are standing or sitting'.

**Section / Slide (Results Percent):**
- How did you do?
- RESTART ACTIVITY
- 100^%^
- We have lots more activities to help you practise your English! Choose an activity below or search for a different skill.

**App Implementation Strategy:**
- **Component Pattern:** `Bodyandhealthpart1Exercise`
- **UX Recommendation:** Implement as a rapid-fire 10+ minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c1r002-science-fiction"></a>22. Science fiction

- **Slug:** `c1r002-science-fiction`
- **CEFR Level:** C1-C2
- **Estimated Time:** 5–10 minutes
- **Skill Focus:** Reading Writing
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1r002-science-fiction](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1r002-science-fiction)
- **Engine:** Storyline 2

**Learning Objective:**  
This reading and writing activity practises understanding text structure through referencing words and various types of linkers and discourse markers

#### Extracted Question Bank & Answer Key

**Item 1:** `Pick One` (multiplechoice)
- **Choices:**
  - [ ] Yes **(Correct)**
  - [ ] No 

**Item 2:** `Pick One` (multiplechoice)
- **Choices:**
  - [ ] Yes **(Correct)**
  - [ ] No 

**App Implementation Strategy:**
- **Component Pattern:** `SciencefictionExercise`
- **UX Recommendation:** Implement as a rapid-fire 5–10 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c1r001-forensic-linguistics"></a>23. Forensic linguistics

- **Slug:** `c1r001-forensic-linguistics`
- **CEFR Level:** C1-C2
- **Estimated Time:** 5–10 minutes
- **Skill Focus:** Reading
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1r001-forensic-linguistics](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1r001-forensic-linguistics)
- **Engine:** Storyline 2

**Learning Objective:**  
Read the text about the role of forensic linguistics in solving crimes. Then answer the question to practise the full range of reading skills required for reading discursive texts on academic subjects.

#### Extracted Question Bank & Answer Key

**Item 1:** `What does the word absolve mean in the second paragraph?` (multiplechoice)
- **Choices:**
  - [ ] to prove 
  - [ ] to clear **(Correct)**
  - [ ] to apologise to 

**Item 2:** `Why does the writer mention the voicemail message?` (multiplechoice)
- **Choices:**
  - [ ] to exemplify the kind of work a forensic linguist does **(Correct)**
  - [ ] to emphasise the difficulty of determining the culpability of a suspect 
  - [ ] to acknowledge the expert skills required by those acting on behalf of the law 

**Item 3:** `Who does his refer to in the fourth paragraph?` (multiplechoice)
- **Choices:**
  - [ ] the person who left the message 
  - [ ] the linguistic expert 
  - [ ] the accused **(Correct)**

**Item 4:** `What point is the writer making about machine analysis in the fifth paragraph?` (multiplechoice)
- **Choices:**
  - [ ] it rarely proves what it sets out to 
  - [ ] it can be easy to cheat 
  - [ ] it tends to be an inaccurate method **(Correct)**

**Item 5:** `What is the writer doing in the final paragraph?` (multiplechoice)
- **Choices:**
  - [ ] confirming the reasons why evidence must be of an objective nature **(Correct)**
  - [ ] pointing out the difficulty of convincing members of a criminal court 
  - [ ] clarifying the true role of the forensic linguist in criminal work 

**App Implementation Strategy:**
- **Component Pattern:** `ForensiclinguisticsExercise`
- **UX Recommendation:** Implement as a rapid-fire 5–10 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c2v001-precise-words"></a>24. Precise words

- **Slug:** `c2v001-precise-words`
- **CEFR Level:** C1-C2
- **Estimated Time:** 0–5 minutes
- **Skill Focus:** Vocabulary
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2v001-precise-words](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2v001-precise-words)
- **Engine:** Storyline 2

**Learning Objective:**  
Use this vocabulary activity to practise precision. Choose the correct word which fits in the sentence.

#### Extracted Question Bank & Answer Key

**Item 1:** `We were all set to go down to the beach. Then, for no __________ reason, Mel said she wanted to stay in.` (multiplechoice)
- **Choices:**
  - [ ] particular **(Correct)**
  - [ ] certain 

**Item 2:** `LED bulbs are a really __________ way of lighting a room because they last so long.` (multiplechoice)
- **Choices:**
  - [ ] economic 
  - [ ] economical **(Correct)**

**Item 3:** `Have you got the __________ edition of the product catalogue? This one seems to be last year’s.` (multiplechoice)
- **Choices:**
  - [ ] current **(Correct)**
  - [ ] modern 

**Item 4:** `There’s no __________ trying to get everything done today - we’ll only make a mess of things if we rush the job.` (multiplechoice)
- **Choices:**
  - [ ] point **(Correct)**
  - [ ] reason 

**App Implementation Strategy:**
- **Component Pattern:** `PrecisewordsExercise`
- **UX Recommendation:** Implement as a rapid-fire 0–5 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c1l002-understanding-implied-meaning"></a>25. Understanding implied meaning

- **Slug:** `c1l002-understanding-implied-meaning`
- **CEFR Level:** C1-C2
- **Estimated Time:** 5–10 minutes
- **Skill Focus:** Listening
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1l002-understanding-implied-meaning](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1l002-understanding-implied-meaning)
- **Engine:** Storyline 2

**Learning Objective:**  
This listening activity practises understanding implied meaning. Listen carefully to the context of the person speaking and choose the right option.

#### Extracted Question Bank & Answer Key

**Item 1:** `What is the woman doing?` (multiplechoice)
- **Choices:**
  - [ ] Asking a favour of Peter. **(Correct)**
  - [ ] Complaining about something Peter has done. 

**Item 2:** `What does the man think?` (multiplechoice)
- **Choices:**
  - [ ] That Sarah has eaten the cheese. **(Correct)**
  - [ ] That Sarah saw who took the cheese. 

**Item 3:** `What does the woman think?` (multiplechoice)
- **Choices:**
  - [ ] She left the door unlocked this morning. 
  - [ ] Michael left the door unlocked. **(Correct)**

**Item 4:** `What is the woman doing?` (multiplechoice)
- **Choices:**
  - [ ] Suggesting the reason the sweater is tight is not because it was washed. **(Correct)**
  - [ ] Explaining the reason why the man’s sweater is too tight for him. 

**App Implementation Strategy:**
- **Component Pattern:** `UnderstandingimpliedmeaningExercise`
- **UX Recommendation:** Implement as a rapid-fire 5–10 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c1g002-which-as-a-relative-pronoun"></a>26. Which as a relative pronoun

- **Slug:** `c1g002-which-as-a-relative-pronoun`
- **CEFR Level:** C1-C2
- **Estimated Time:** 0–5 minutes
- **Skill Focus:** Grammar
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1g002-which-as-a-relative-pronoun](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1g002-which-as-a-relative-pronoun)
- **Engine:** Storyline 2

**Learning Objective:**  
This grammar activity practises which as a relative pronoun. Read the sentence and decide if the relative pronoun refers back to the whole clause or the noun by choosing the correct option.

#### Extracted Question Bank & Answer Key

**Item 1:** `We had to cancel our holiday, which was frustrating.` (multiplechoice)
- **Choices:**
  - [ ] the whole clause **(Correct)**
  - [ ] We 
  - [ ] our holiday 

**Item 2:** `I’m writing with reference to the sales assistant job, which I’d like to apply for.` (multiplechoice)
- **Choices:**
  - [ ] I 
  - [ ] the whole clause 
  - [ ] the sales assistant job **(Correct)**

**Item 3:** `She’s always complaining about stuff, which really gets on my nerves.` (multiplechoice)
- **Choices:**
  - [ ] stuff 
  - [ ] She 
  - [ ] the whole clause **(Correct)**

**Item 4:** `Look, Mary! That’s that scary house which I told you about.` (multiplechoice)
- **Choices:**
  - [ ] That’s 
  - [ ] scary house **(Correct)**
  - [ ] Mary 

**App Implementation Strategy:**
- **Component Pattern:** `WhichasarelativepronounExercise`
- **UX Recommendation:** Implement as a rapid-fire 0–5 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c1v002-statements-and-opinions"></a>27. Statements and opinions

- **Slug:** `c1v002-statements-and-opinions`
- **CEFR Level:** C1-C2
- **Estimated Time:** 0–5 minutes
- **Skill Focus:** Vocabulary
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1v002-statements-and-opinions](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1v002-statements-and-opinions)
- **Engine:** Storyline 2

**Learning Objective:**  
This vocabulary activity practises language for qualifying statements or opinions. Choose the correct preposition to complete the sentence.

#### Extracted Question Bank & Answer Key

**Item 1:** `__________ the whole I think what you’ve written is a pretty accurate version of events.` (multiplechoice)
- **Choices:**
  - [ ] In 
  - [ ] On **(Correct)**
  - [ ] As 

**Item 2:** `I agree with you __________ to a point, but I’m not sure about that last bit.` (multiplechoice)
- **Choices:**
  - [ ] up **(Correct)**
  - [ ] down 
  - [ ] round 

**Item 3:** `__________ some extent the report reflected what management had been saying.` (multiplechoice)
- **Choices:**
  - [ ] To **(Correct)**
  - [ ] For 
  - [ ] By 

**Item 4:** `_________ what I understand, you had no intention of going to the meeting anyway.` (multiplechoice)
- **Choices:**
  - [ ] By 
  - [ ] Of 
  - [ ] From **(Correct)**

**Item 5:** `I can see what you mean __________ a way, but that’s not how most people see it.` (multiplechoice)
- **Choices:**
  - [ ] on 
  - [ ] in **(Correct)**
  - [ ] as 

**App Implementation Strategy:**
- **Component Pattern:** `StatementsandopinionsExercise`
- **UX Recommendation:** Implement as a rapid-fire 0–5 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c2r001-ethical-journalism"></a>28. Ethical journalism

- **Slug:** `c2r001-ethical-journalism`
- **CEFR Level:** C1-C2
- **Estimated Time:** 0–5 minutes
- **Skill Focus:** Reading
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2r001-ethical-journalism](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2r001-ethical-journalism)
- **Engine:** Storyline 2

**Learning Objective:**  
Ethical journalism is the idea of reporting things accurately and fairly. This reading activity practises the full range of skills required for reading discursive texts on academic subjects.

#### Extracted Question Bank & Answer Key

**Item 1:** `The writer` (multiplechoice)
- **Choices:**
  - [ ] says that good journalism requires taking advantage of the latest technologies. 
  - [ ] suggests that there is little real difference between journalism now and in the past. **(Correct)**

**Item 2:** `The writer` (multiplechoice)
- **Choices:**
  - [ ] believes journalists struggle to clarify the difference between ethical and unethical reporting. 
  - [ ] points out one of the ethical difficulties that journalists are regularly presented with. **(Correct)**

**Item 3:** `The writer` (multiplechoice)
- **Choices:**
  - [ ] believes that journalists’ motivation is not always commendable. **(Correct)**
  - [ ] thinks that journalists take care to question what lies behind the choices they make. 

**Item 4:** `The writer` (multiplechoice)
- **Choices:**
  - [ ] believes that journalists have a duty to report events they believe to be significant, especially when reporting on the behaviour of the well-known. 
  - [ ] says while they may have used the media to their own advantage, those who do wrong should still be allowed protection from the media. **(Correct)**

**Item 5:** `The writer` (multiplechoice)
- **Choices:**
  - [ ] strongly suggests that journalists heed the response given when asking for information on a story. **(Correct)**
  - [ ] advises journalists to prepare themselves for the consequences of reporting a potentially damaging story. 

**App Implementation Strategy:**
- **Component Pattern:** `EthicaljournalismExercise`
- **UX Recommendation:** Implement as a rapid-fire 0–5 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c2l001-short-dialogues"></a>29. Short dialogues

- **Slug:** `c2l001-short-dialogues`
- **CEFR Level:** C1-C2
- **Estimated Time:** 5–10 minutes
- **Skill Focus:** Listening
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2l001-short-dialogues](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2l001-short-dialogues)
- **Engine:** Storyline 2

**Learning Objective:**  
This activity practises following dialogues that contain colloquial language. Listen to the person talk and identify how that person feels or the way they speak.

#### Extracted Question Bank & Answer Key

**Item 1:** `What does the woman want from the man?` (multiplechoice)
- **Choices:**
  - [ ] a chair **(Correct)**
  - [ ] a drink 

**Item 2:** `Who is the man referring to when he says They’re?` (multiplechoice)
- **Choices:**
  - [ ] the government **(Correct)**
  - [ ] the general public 

**Item 3:** `What are the friends looking at?` (multiplechoice)
- **Choices:**
  - [ ] an outfit in a chain-store window 
  - [ ] an item of clothing in an exclusive shop **(Correct)**

**Item 4:** `What is the man asking the woman about?` (multiplechoice)
- **Choices:**
  - [ ] a document **(Correct)**
  - [ ] a desk 

**App Implementation Strategy:**
- **Component Pattern:** `ShortdialoguesExercise`
- **UX Recommendation:** Implement as a rapid-fire 5–10 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c1s002-stressed-words-and-meaning"></a>30. Stressed words and meaning

- **Slug:** `c1s002-stressed-words-and-meaning`
- **CEFR Level:** C1-C2
- **Estimated Time:** 0–5 minutes
- **Skill Focus:** Listening Pronunciation
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1s002-stressed-words-and-meaning](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1s002-stressed-words-and-meaning)
- **Engine:** Storyline 2

**Learning Objective:**  
Listen to the speaker stress a particular word and understand how this can illustrate the speaker's attitude. Match the statement with its meaning.

#### Extracted Question Bank & Answer Key

**Item 1:** `Pick One` (multiplechoice)
- **Choices:**
  - [ ] Yes **(Correct)**
  - [ ] No 

**App Implementation Strategy:**
- **Component Pattern:** `StressedwordsandmeaningExercise`
- **UX Recommendation:** Implement as a rapid-fire 0–5 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c1v001-idiomatic-language"></a>31. Idiomatic language

- **Slug:** `c1v001-idiomatic-language`
- **CEFR Level:** C1-C2
- **Estimated Time:** 0–5 minutes
- **Skill Focus:** Vocabulary
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1v001-idiomatic-language](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1v001-idiomatic-language)
- **Engine:** Storyline 2

**Learning Objective:**  
Choose the correct idiomatic phrase to complete the sentence in this vocabulary exercise.

#### Extracted Question Bank & Answer Key

**Item 1:** `I’d expected the city to be relatively quiet during the day. __________, I’d never seen it so crowded.` (multiplechoice)
- **Choices:**
  - [ ] In contrast 
  - [ ] On the contrary **(Correct)**

**Item 2:** `Thanks, Suzanna, for that amazing performance. Now, __________ , in tonight’s concert programme is Ben, who’s going to sing a folk song.` (multiplechoice)
- **Choices:**
  - [ ] at the very least 
  - [ ] last but not least **(Correct)**

**Item 3:** `Although this month’s sales have shown an improvement on last month’s, __________ things aren’t looking too bright.` (multiplechoice)
- **Choices:**
  - [ ] in the long run 
  - [ ] in the long term **(Correct)**

**Item 4:** `This is a complex and difficult project, so let’s just take it __________ .` (multiplechoice)
- **Choices:**
  - [ ] one step at a time **(Correct)**
  - [ ] one step ahead 

**App Implementation Strategy:**
- **Component Pattern:** `IdiomaticlanguageExercise`
- **UX Recommendation:** Implement as a rapid-fire 0–5 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c1w001-formal-and-informal-writing"></a>32. Formal and informal writing

- **Slug:** `c1w001-formal-and-informal-writing`
- **CEFR Level:** C1-C2
- **Estimated Time:** 5–10 minutes
- **Skill Focus:** Writing
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1w001-formal-and-informal-writing](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1w001-formal-and-informal-writing)
- **Engine:** Storyline 2

**Learning Objective:**  
This writing activity practises the appropriate register. Choose whether the phrase is used in formal or informal writing.

#### Extracted Question Bank & Answer Key

**Item 1:** `Pick One` (multiplechoice)
- **Choices:**
  - [ ] Yes **(Correct)**
  - [ ] No 

**Item 2:** `Pick One` (multiplechoice)
- **Choices:**
  - [ ] Yes **(Correct)**
  - [ ] No 

**App Implementation Strategy:**
- **Component Pattern:** `FormalandinformalwritingExercise`
- **UX Recommendation:** Implement as a rapid-fire 5–10 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c1g001-reporting-verbs"></a>33. Reporting verbs

- **Slug:** `c1g001-reporting-verbs`
- **CEFR Level:** C1-C2
- **Estimated Time:** 5–10 minutes
- **Skill Focus:** Grammar
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1g001-reporting-verbs](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1g001-reporting-verbs)
- **Engine:** Storyline 2

**Learning Objective:**  
Practise using reporting verbs such as threaten, deny and advise. Read the sentences and choose the correct part of speech to follow the reporting verb.

#### Extracted Question Bank & Answer Key

**Item 1:** `advise` (multiplechoice)
- **Choices:**
  - [ ] verb + that + clause OR verb + gerund 
  - [ ] verb + preposition + gerund 
  - [ ] verb + to + infinitive 
  - [ ] verb + direct object + to + infinitive **(Correct)**

**Item 2:** `deny` (multiplechoice)
- **Choices:**
  - [ ] verb + that + clause OR verb + gerund **(Correct)**
  - [ ] verb + preposition + gerund 
  - [ ] verb + to + infinitive 
  - [ ] verb + direct object + to + infinitive 

**Item 3:** `admit` (multiplechoice)
- **Choices:**
  - [ ] verb + that + clause OR verb + gerund **(Correct)**
  - [ ] verb + preposition + gerund 
  - [ ] verb + to + infinitive 
  - [ ] verb + direct object + to + infinitive 

**Item 4:** `focus` (multiplechoice)
- **Choices:**
  - [ ] verb + that + clause OR verb + gerund 
  - [ ] verb + preposition + gerund **(Correct)**
  - [ ] verb + to + infinitive 
  - [ ] verb + direct object + to + infinitive 

**Item 5:** `threaten` (multiplechoice)
- **Choices:**
  - [ ] verb + that + clause OR verb + gerund 
  - [ ] verb + preposition + gerund 
  - [ ] verb + to + infinitive **(Correct)**
  - [ ] verb + direct object + to + infinitive 

**App Implementation Strategy:**
- **Component Pattern:** `ReportingverbsExercise`
- **UX Recommendation:** Implement as a rapid-fire 5–10 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c2r002-understanding-socio-cultural-references"></a>34. Understanding socio-cultural references

- **Slug:** `c2r002-understanding-socio-cultural-references`
- **CEFR Level:** C1-C2
- **Estimated Time:** 5–10 minutes
- **Skill Focus:** Reading
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2r002-understanding-socio-cultural-references](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2r002-understanding-socio-cultural-references)
- **Engine:** Storyline 2

**Learning Objective:**  
Read the text about understanding social-cultural references. Then answer the question to practise the full range of skills required for reading discursive texts on academic subjects.

#### Extracted Question Bank & Answer Key

**Item 1:** `According to the writer, ‘Entering unfamiliar territory’ relates to` (multiplechoice)
- **Choices:**
  - [ ] a process of informing oneself about other lands and peoples. 
  - [ ] places or practices we have not previously come across. **(Correct)**
  - [ ] the discomfort felt when making a cultural error. 

**Item 2:** `Why does the writer use the examples of staring and gesturing?` (multiplechoice)
- **Choices:**
  - [ ] to highlight the insensitive approach some people take towards others 
  - [ ] to emphasise the enormous variation in behaviour between cultures **(Correct)**
  - [ ] to point out the importance of explaining one’s beliefs to others 

**Item 3:** `What does the verb disabuse mean in the third paragraph?` (multiplechoice)
- **Choices:**
  - [ ] to rid oneself of a mistaken idea **(Correct)**
  - [ ] to carry out research into an idea 
  - [ ] to clarify the reasons behind an idea 

**Item 4:** `What is the main point of the article?` (multiplechoice)
- **Choices:**
  - [ ] that even the most culturally aware will make cultural mistakes 
  - [ ] that erring on the side of caution will eliminate difficult situations 
  - [ ] that arming ourselves with knowledge will enhance communication **(Correct)**

**App Implementation Strategy:**
- **Component Pattern:** `UnderstandingsocioculturalreferencesExercise`
- **UX Recommendation:** Implement as a rapid-fire 5–10 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c2l002-subtle-attitudes"></a>35. Subtle attitudes

- **Slug:** `c2l002-subtle-attitudes`
- **CEFR Level:** C1-C2
- **Estimated Time:** 0–5 minutes
- **Skill Focus:** Listening
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2l002-subtle-attitudes](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2l002-subtle-attitudes)
- **Engine:** Storyline 2

**Learning Objective:**  
This activity practises understanding people's attitudes based on the words and the intonation they use.

#### Extracted Question Bank & Answer Key

**Item 1:** `How does the man feel?` (multiplechoice)
- **Choices:**
  - [ ] resigned **(Correct)**
  - [ ] resentful 
  - [ ] irritable 

**Item 2:** `How does the woman speak to the man?` (multiplechoice)
- **Choices:**
  - [ ] comfortingly 
  - [ ] sentimentally 
  - [ ] apologetically **(Correct)**

**Item 3:** `How does the woman feel?` (multiplechoice)
- **Choices:**
  - [ ] defensive **(Correct)**
  - [ ] sarcastic 
  - [ ] miserable 

**Item 4:** `How does the woman talk about the man?` (multiplechoice)
- **Choices:**
  - [ ] in an affectionate way 
  - [ ] in a complimentary way **(Correct)**
  - [ ] in a doubtful way 

**App Implementation Strategy:**
- **Component Pattern:** `SubtleattitudesExercise`
- **UX Recommendation:** Implement as a rapid-fire 0–5 minutes interactive card with immediate formative feedback and explanation of nuance.

---

### <a id="c1w002-complaining-politely-and-appropriately"></a>36. Complaining politely and appropriately

- **Slug:** `c1w002-complaining-politely-and-appropriately`
- **CEFR Level:** C1-C2
- **Estimated Time:** 0–5 minutes
- **Skill Focus:** Writing
- **Canonical URL:** [https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1w002-complaining-politely-and-appropriately](https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1w002-complaining-politely-and-appropriately)
- **Engine:** Storyline 2

**Learning Objective:**  
Read an extract from some letters of complaint. Use this writing activity to practise if the language of complaining is polite and appropriate, or not.

#### Extracted Question Bank & Answer Key

**Item 1:** `It has been brought to my attention that several recent deliveries have contained broken parts.` (multiplechoice)
- **Choices:**
  - [ ] Polite and appropriate **(Correct)**
  - [ ] Not polite and appropriate 

**Item 2:** `I’m not keen on the way you’re dealing with our people.` (multiplechoice)
- **Choices:**
  - [ ] Polite and appropriate 
  - [ ] Not polite and appropriate **(Correct)**

**Item 3:** `We might as well find another supplier if things can’t be sorted out.` (multiplechoice)
- **Choices:**
  - [ ] Polite and appropriate 
  - [ ] Not polite and appropriate **(Correct)**

**Item 4:** `I look forward to the matter being resolved in due course.` (multiplechoice)
- **Choices:**
  - [ ] Polite and appropriate **(Correct)**
  - [ ] Not polite and appropriate 

**App Implementation Strategy:**
- **Component Pattern:** `ComplainingpolitelyandappropriatelyExercise`
- **UX Recommendation:** Implement as a rapid-fire 0–5 minutes interactive card with immediate formative feedback and explanation of nuance.

---

## 4. The Complete Cambridge Learning English Ecosystem

Beyond the 36 Proficient activities, Cambridge English provides an extensive tiered curriculum comprising **175 activities** across three levels:

### Activity Distribution Across CEFR Levels
- **Basic (A1–A2):** 43 activities — Foundational sentence structure, daily routine vocabulary, simple present/past tenses, basic listening dialogues.
- **Independent (B1–B2):** 96 activities — Intermediate conversational agility, modal verbs, conditionals, work & travel vocabulary, longer listening extracts.
- **Proficient (C1–C2):** 36 activities — Advanced discursive markers, rhetorical ellipsis, idiomatic subtleties, subtle attitudes, formal register, complex phonology.

### Companion Cambridge Platforms for App Integration
1. **Virtually Anywhere Audio Drama Series (B1–B2):** An episodic 7-episode audio series following university students Geeta and Paul, ideal for our podcast audio player with synchronized transcripts.
2. **Write & Improve:** Cambridge's automated AI writing feedback tool. Can be integrated into our writing module to evaluate CEFR levels on essays and letters.
3. **Official Exam Preparation Materials:** Free sample test papers for C1 Advanced (CAE), C2 Proficiency (CPE), B2 First (FCE), and IELTS Academic.

### Recommendations for our App (`pttaer/eng-learn`)
1. **Adopt Cambridge's Time-Boxed Activity Structure:** Keep daily exercises under 5–10 minutes to maximize completion rates.
2. **Implement CEFR Micro-Badging:** Tag every question bank item with exact CEFR competency codes (e.g. `C1.Grammar.Ellipsis`).
3. **Local Evaluation:** In accordance with repository rules, compute all scoring locally without relying on external LLM runtime latency.