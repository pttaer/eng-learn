# British Council LearnEnglish Free Resources: Complete Inventory & App Implementation Blueprint

> **Source Reference**: [British Council LearnEnglish - Free Resources](https://learnenglish.britishcouncil.org/free-resources)  
> **Target Application**: `Eng` (Web App `web/` & Mobile `Mobile/`, IELTS Hub `web/ielts.html`)  
> **Document Purpose**: Full extraction of pedagogical goodies, resource taxonomy, media assets, and concrete implementation blueprints for our English learning platform.

---

## 1. Executive Summary & Resource Taxonomy

The British Council LearnEnglish portal is one of the world's most comprehensive, pedagogically sound English-learning ecosystems. It organizes free materials into clear CEFR progressions (A1 Beginner to C1 Advanced), pairing rich multi-modal media (audio, video, text) with interactive practice, diagnostics, and community engagement.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              BRITISH COUNCIL LEARNENGLISH FREE RESOURCES ECOSYSTEM              │
├─────────────────┬─────────────────┬─────────────────┬───────────────────────────┤
│  SKILLS (A1-C1) │  GRAMMAR & VOCAB│ GENERAL & MEDIA │ BUSINESS & IELTS          │
├─────────────────┼─────────────────┼─────────────────┼───────────────────────────┤
│ • Listening     │ • Grammar A1-C1 │ • Podcasts S1-4 │ • English for Emails      │
│ • Reading       │ • Quick Rules   │ • Video Zone    │ • Meetings & Presentations│
│ • Writing       │ • Diagnostic Qs │ • Magazine Zone │ • Business Magazine       │
│ • Speaking      │ • Thematic Vocab│ • Story Zone    │ • "You're Hired" Series   │
│                 │ • Flashcards    │ • Episodic Drama│ • IELTS Prep & Mock Tasks │
└─────────────────┴─────────────────┴─────────────────┴───────────────────────────┘
```

---

## 2. Comprehensive Inventory of "Goodies" by Domain

### 2.1 The Core Skills Suite (CEFR A1 to C1)

Every skill area is strictly tiered from **A1 (Breakthrough)** to **C1 (Effective Operational Proficiency)**:

| Skill | CEFR Tiers | Signature Content & Topics | Delivery Mechanism |
| :--- | :--- | :--- | :--- |
| **Listening** | A1, A2, B1, B2, C1 | Everyday conversations, directions, voicemail, university lectures, news interviews, debates | HTML5 audio player + playback speed toggle + line-by-line collapsible transcript |
| **Reading** | A1, A2, B1, B2, C1 | Posters, menus, invitations, blog posts, news articles, academic essays, formal reports | Formatted responsive text with highlighted key terms & visual aids |
| **Writing** | A1, A2, B1, B2, C1 | Text messages, informal notes, cover letters, formal emails, argumentative essays | Model text with annotated layout, structural checklists, practice submission |
| **Speaking** | A1, A2, B1, B2, C1 | Ordering food, asking for advice, expressing disagreement, giving presentations | Video demonstrations, interactive script turn-taking, phrase banks |

#### The Canonical Lesson Flow (The British Council 5-Stage Pattern)
1. **Preparation (Prime)**: 1–2 rapid vocabulary matching or drag-and-drop questions before encountering the media to activate schemata and reduce cognitive load.
2. **Input (Absorb)**: Core media (Audio / Video / Text) accompanied by an synchronized transcript.
3. **Task 1: Gist Comprehension (Verify)**: True/False, multiple-choice, or matching questions focusing on the big picture and speaker intention.
4. **Task 2: Detailed Comprehension (Master)**: Gap-fills, sentence reordering, or error identification testing specific grammatical structures or exact terminology.
5. **Discussion / Community Prompt (Produce)**: An open-ended question prompting personal response, opinions, or local cultural comparisons.

---

### 2.2 Grammar & Vocabulary Engine

#### A. Grammar Hub
- **Level-Based Paths**: A1–A2 Grammar (elementary mechanics), B1–B2 Grammar (nuance, hypothetical conditions, passives), C1 Grammar (cleft sentences, inversion, subtle modality).
- **Test-First Diagnostic Workflow**: Users can take a 3-question diagnostic quiz before reading rules. If mastered, they can skip; if missed, the rule card highlights the exact misconception.
- **English Grammar Reference**: An encyclopedic reference covering parts of speech, tense systems, clause structures, and modal subtleties with clear contrastive tables.
- **Grammar Snack / Johnny Grammar**: Micro-video explanations where animated characters resolve common learner dilemmas (e.g., *present perfect vs. past simple*, *used to vs. would*).

#### B. Vocabulary Hub
- **Thematic Word Lists**: Everyday categories (Food & Drink, Health, Technology, Travel, Work, Clothes, City Life, Nature).
- **Format**:
  - Image + audio pronunciation + phonemic spelling + definition + example sentence.
  - Interactive matching: drag word to image, word to definition, or fill in missing letters.
  - Collocation drills: pairs that naturally belong together (*take an exam*, *make a mistake*, *heavy rain*).

---

### 2.3 General English, Audio Series & Entertainment

1. **LearnEnglish Podcasts (Flagship Series 1 to 4)**
   - Hosted by engaging native presenter duos (e.g., Adam & Rob, Tess & Ravi).
   - Conversational, natural pacing with culture tidbits, recurring drama segments, quiz games, and language focus check-ins.
   - Includes full audio files, line-numbered transcripts, and companion exercise PDFs.
2. **Video Zone**
   - Curated real-world YouTube and broadcast clips (science, history, nature, social phenomena).
   - Scaffolds authentic native-speed video into pedagogical units with pre-viewing vocabulary and post-viewing checks.
3. **Episodic Audio Dramas**
   - **Big City Small World**: Narrative following a multi-cultural group of young adults living in London. Encourages binge-listening.
   - **Word on the Street**: Cultural video documentary series exploring British lifestyle, colloquial idioms, and regional dialects.
4. **Magazine Zone & Story Zone**
   - Short, high-interest modern articles and graded stories designed for extensive reading.

---

### 2.4 Business English & Workplace Communication

Focused on high-impact professional communication scenarios:
- **English for Emails**: Practical email templates ranging from polite scheduling, follow-ups, apologetic declines, to delicate negotiations.
- **Podcasts for Professionals**: Workplace scenarios including team standups, project debriefs, performance reviews, and customer handling.
- **You're Hired (Interview Mastery)**: Video and audio series simulating job interviews, answering behavioral questions (STAR technique), and presentation pitch delivery.
- **Meeting & Negotiation Tactics**: Interactive phrase banks for turn-taking, interrupting politely, clarifying ambiguities, and closing deals.

---

### 2.5 IELTS Preparation Suite

British Council co-owns IELTS, making its preparation materials the gold standard:
- **Skill-Specific Test Drills**:
  - *Academic Reading*: Skimming/scanning drills, matching headings, True/False/Not Given identification.
  - *Academic Writing*: Task 1 data interpretation (charts, bar graphs, process diagrams) and Task 2 opinion/discussion essay scaffolding.
  - *Listening*: Section 1–4 simulated audio prompts with form-filling, table completion, and multiple choice.
  - *Speaking*: Part 1 personal questions, Part 2 cue-card 1-minute prep drills, Part 3 abstract discussion questions.
- **Assessment Rubrics & Band Descriptors**: Plain-English breakdowns of Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, and Task Achievement.

---

### 2.6 Digital Apps Ecosystem (Standalone Gems)

| App Name | Platform | Core Value & Mechanic |
| :--- | :--- | :--- |
| **LearnEnglish Podcasts** | iOS / Android | Interactive moving transcript synced with audio; offline downloads; pitch-perfect speed regulator. |
| **Sounds Right** | Interactive Chart | The definitive interactive English phonemic chart (IPA). Tap any vowel, diphthong, or consonant to hear pure audio and 3 sample words. |
| **Johnny Grammar's Word Challenge** | Gamified Mobile App | 60-second timed micro-drills across Words, Grammar, and Spelling. Leaderboards, badges, difficulty levels. |
| **LearnEnglish Grammar** | Multi-platform | Over 1,000 interactive questions categorized by CEFR level with immediate explanatory feedback. |

---

## 3. The Pedagogical Blueprint: How to Apply These to Our Apps

Our platform (`web/` and `Mobile/`) can directly adapt and engineer the best components from this crawl:

### 3.1 Feature 1: The Synchronized Audio-Transcript Engine (Podcast Player)

#### Concept
Modelled after British Council's podcast player and app, learners listen while following sentence-by-sentence highlighted text.

#### Technical Implementation (`web/src/components/AudioTranscriptPlayer.ts`)
```typescript
interface TranscriptSegment {
  id: string;
  startSec: number;
  endSec: number;
  speaker: string;
  text: string;
  vocabularyHighlights?: { word: string; definition: string; ipa: string }[];
}

export class AudioTranscriptPlayer {
  private audio: HTMLAudioElement;
  private segments: TranscriptSegment[];
  private activeSegmentId: string | null = null;

  constructor(audioSrc: string, segments: TranscriptSegment[], containerEl: HTMLElement) {
    this.audio = new Audio(audioSrc);
    this.segments = segments;
    this.render(containerEl);
    this.bindEvents();
  }

  private bindEvents() {
    this.audio.addEventListener('timeupdate', () => {
      const currentTime = this.audio.currentTime;
      const current = this.segments.find(
        (s) => currentTime >= s.startSec && currentTime < s.endSec
      );
      if (current && current.id !== this.activeSegmentId) {
        this.activeSegmentId = current.id;
        this.highlightActiveSegment(current.id);
      }
    });
  }

  public seekToSegment(segmentId: string) {
    const target = this.segments.find((s) => s.id === segmentId);
    if (target) {
      this.audio.currentTime = target.startSec;
      this.audio.play();
    }
  }

  // Toggles playback rates: 0.75x, 0.9x, 1.0x, 1.25x
  public setPlaybackRate(rate: number) {
    this.audio.playbackRate = rate;
  }
}
```

#### UI Requirements (per `docs/TYPOGRAPHY_SPACING_RULES.md`)
- Sticky audio toolbar on mobile (`--safe-bottom-dock` compliant).
- Speed selector pill button (`44px` touch target min).
- Tap any sentence in the transcript to instantly jump playback to that timestamp.
- Tap highlighted vocabulary terms to display an inline popover with IPA phonetics and audio sample.

---

### 3.2 Feature 2: Interactive Phonemic Chart ("Sounds Right" Model)

#### Concept
A clean, touch-friendly 44-sound International Phonetic Alphabet (IPA) interactive soundboard built into our reference tools.

#### Layout Specification
- **Monophthongs (Vowels)**: 12 tiles (short vs. long indicated with colon, e.g., `/ɪ/` vs. `/iː/`).
- **Diphthongs**: 8 tiles (gliding vowels, e.g., `/eɪ/`, `/aʊ/`).
- **Consonants**: 24 tiles arranged by Voiced vs. Unvoiced pairs (e.g., `/p/` & `/b/`, `/t/` & `/d/`, `/s/` & `/z/`).

#### Interaction
- **Single Tap**: Plays the pure phoneme sound.
- **Long Press or Secondary Tap**: Opens a card showing 3 sample words highlighting the sound spelling (e.g., `/ʃ/` → **sh**ip, na**ti**on, chef).

---

### 3.3 Feature 3: Johnny Grammar Gamified 60-Second Blitz Drill

#### Concept
A micro-learning drill mode designed for quick mobile practice sessions.

#### Mechanics
1. **Time limit**: 60 seconds countdown timer (`--font-mono`).
2. **Question Formats**:
   - Quick Gap-fill (3 choices, e.g., "She has been working here ___ 2021: since / for / in").
   - Spelling Spotter (Identify which of 4 words is spelled incorrectly).
   - Preposition Sprint (Match verbs to correct prepositions).
3. **Scoring**:
   - Streak multipliers (`x2`, `x3`).
   - Sound effects / haptic feedback for instant affirmation.
   - Zero-latency local grading (no remote API calls needed, strictly runs offline in client).

---

### 3.4 Feature 4: The 5-Stage Modular Lesson Template

To standardize lessons across General English, Business English, and IELTS, all lesson JSON datasets should adhere to the British Council lesson model:

```json
{
  "$schema": "eng-lesson-v1",
  "id": "bc-b1-email-declining-invitation",
  "title": "Declining a Business Invitation Politely",
  "cefrLevel": "B1",
  "category": "business-emails",
  "estimatedMinutes": 8,
  "stages": [
    {
      "stageType": "preparation",
      "instruction": "Match the informal phrases with their polite formal equivalents before reading the email.",
      "exerciseType": "matching_pairs",
      "pairs": [
        { "prompt": "I can't come", "match": "I regret that I am unable to attend" },
        { "prompt": "Tell me later", "match": "Please keep me informed of future dates" },
        { "prompt": "Sorry!", "match": "Please accept my apologies" }
      ]
    },
    {
      "stageType": "input",
      "mediaType": "text",
      "context": "Read the email from Elena declining an invitation to a networking conference.",
      "body": "Dear Mr. Davis,\n\nThank you very much for the invitation to attend the Regional Innovation Summit on October 14th...\n\nKind regards,\nElena Ross"
    },
    {
      "stageType": "task1_gist",
      "exerciseType": "multiple_choice",
      "questions": [
        {
          "question": "What is the primary purpose of Elena's email?",
          "options": [
            "To negotiate the conference registration fee",
            "To decline the invitation while preserving a good professional relationship",
            "To propose a different speaker for the event"
          ],
          "answerIndex": 1,
          "explanation": "Elena thanks Mr. Davis, explains her schedule conflict, and asks to be notified of next year's event."
        }
      ]
    },
    {
      "stageType": "task2_detailed",
      "exerciseType": "gap_fill",
      "prompt": "Complete the sentences with the exact words from the email:",
      "sentence": "I [regret] to inform you that I will be out of the country due to a [prior] commitment."
    },
    {
      "stageType": "reflection_discussion",
      "prompt": "How do people usually decline invitations politely in your culture? Do you give a detailed excuse or keep it brief?"
    }
  ]
}
```

---

### 3.5 Feature 5: Business English Email & Presentation Roleplay Templates

Directly applying the British Council *English for Emails* and *Podcasts for Professionals* goodies:
- **Interactive Email Builder**: Provide a fill-in-the-blank workspace where users compose formal workplace communications using curated phrase tiles (*Opening*, *Context*, *The Ask*, *Softening / Politeness*, *Sign-off*).
- **Style Comparator (Informal vs. Semi-Formal vs. Formal)**: An interactive slider that morphs an email text dynamically from chat-style ("Hey, send the report ASAP") to executive polite ("Dear Alex, could you kindly forward the report at your earliest convenience?").

---

### 3.6 Feature 6: Deepening the IELTS Academic Hub (`web/ielts.html`)

British Council's public free IELTS materials emphasize diagnostic clarity and self-correction:
- **Evidence-Based Question Keys**: Every reading & listening question must carry a `why` field pointing directly to the transcript/text evidence line (conforming to `CLAUDE.md` rule: *"Claude verifies every answer key; each question carries a why with the evidence line"*).
- **Task 1 Model Visualizer**: Interactive chart view with synchronized highlighting between the graph metrics (percentages, trends, peaks) and the sample essay sentences.
- **Speaking Cue Card Timer**: 60 seconds preparation timer with scratchpad notepad followed by 2 minutes recorded response playback.

---

## 4. UI/UX Rules & Styling Checklist for Integration

When integrating these British Council patterns into our codebase, adhere strictly to the project rules in `CLAUDE.md` and `docs/TYPOGRAPHY_SPACING_RULES.md`:

1. **Hierarchy & Tokens**:
   - Use semantic tokens (`--font-h1`, `--font-h2`, `--font-h3`, `--font-kicker`, `--font-body`).
   - Use `--font-mono` for CEFR badges (`A1`, `B2`, `C1`), audio timestamps (`03:42`), and score telemetry.
2. **Spacing Grid**:
   - Strictly 4px/8px rhythm (`--gap-section`: 32/16px, `--gap-block`: 20/12px, `--gap-group`: 12/8px, `--gap-element`: 8/6px).
   - Inset: 24px screen inset with flush-left alignment; 16px card padding with 12px border radius.
3. **Mobile-First Touch Compliance**:
   - Minimum 44px touch targets for all answer choices, audio controls, and tab filters.
   - Fixed bottom audio dock clearance: `--safe-bottom-dock: 84px` plus `env(safe-area-inset-bottom)`.
4. **Zero Remote Dependencies**:
   - All audio/speech synthesis uses browser native Web Audio / SpeechSynthesis.
   - All scoring and validation executes in client JS/TS without external LLM/API dependencies.

---

## 5. Prioritized Implementation Roadmap

| Priority | Feature / Goodie | Target Path | Value Proposition |
| :---: | :--- | :--- | :--- |
| **P1** | **Interactive Audio & Transcript Component** | `web/src/components/AudioPlayer/` | Immediate upgrade for listening lessons & podcasts. |
| **P1** | **5-Stage Lesson Engine (Prep -> Media -> Tasks)** | `web/src/lessons/LessonEngine.ts` | Scalable standard format for all CEFR lessons. |
| **P2** | **IPA Phonemic Soundboard (Sounds Right)** | `web/src/tools/PhonemicChart.ts` | High engagement visual pronunciation reference. |
| **P2** | **Johnny Grammar 60s Blitz Drill** | `web/src/games/GrammarBlitz.ts` | Viral, repeatable micro-learning practice loop. |
| **P3** | **Business Email Builder & Register Slider** | `web/src/business/EmailBuilder.ts` | High-value professional skills for B1-C1 learners. |
| **P3** | **IELTS Task 1 Synchronized Data Annotator** | `web/src/ielts/Task1Viewer.ts` | Direct boost to Academic Writing Hub. |
