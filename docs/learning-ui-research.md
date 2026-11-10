# Research-Backed Learning-View Design & Cognitive Readability

> **Authority:** Autonomous Overhaul Stream D  
> **Status:** Canonical Design Research  
> **Target Learners:** Vietnamese English Learners (CEFR A1 to C2 / IELTS Academic).

---

## 1. Cognitive Load Theory & Educational Interface Psychology

### 1.1 Extraneous Cognitive Load & The Split-Attention Effect
According to John Sweller’s Cognitive Load Theory (Sweller, 1988, 1994; Paas et al., 2003), working memory is strictly bounded (Miller’s Law: $7 \pm 2$ chunks, modern consensus: $4 \pm 1$ active items). Interface complexity that does not contribute directly to schema acquisition constitutes *extraneous cognitive load*.

In language learning, the *split-attention effect* occurs when learners must mentally integrate disparate sources of information (e.g. looking back and forth between an unfamiliar vocabulary word, a separate dictionary glossary, and a distant explanation box). 
- **Design Mandate:** Co-locate definitions and contextual exemplars directly beside or immediately beneath the target stimulus. In `AtomicCard` and `ReadingDossier`, lexical targets and syntactic dissections are displayed inline or via single-tap instant reveals without context-switching navigation.

### 1.2 Dual-Coding Theory (Paivio)
Allan Paivio’s Dual-Coding Theory (Paivio, 1986, 2006) demonstrates that human memory processes verbal and non-verbal information through separate cognitive channels. Pairing a verbal concept with an acoustic or spatial representation dramatically boosts retention:
- **Design Mandate:** Every target vocabulary item pairs orthography (English text) with phonetic audio (synthesizer/TTS speech) and IPA phonetic transcription, engaging both auditory and visual working memory buffers simultaneously.

---

## 2. On-Screen Typographic Readability Research

### 2.1 Optimal Line Length (The Measure)
Empirical reading research (Dyson & Haselgrove, 2001; Rayner et al., 2006; Tinker, 1963) confirms:
- Lines that are too wide (>85 characters) cause ocular fatigue and track loss during return saccades (the eye struggles to locate the start of the next line).
- Lines that are too narrow (<35 characters) break natural phrasing into unnatural fragments, inflating fixation counts.
- **The Golden Range:** **45 to 75 characters per line** (approximately 60–68ch for prose). In our CSS, this is enforced via `max-width: 68ch;` on all reading paragraphs (`--font-learn-prose`).

### 2.2 Line Height & Vertical Rhythm
Reading on digital displays requires generous vertical leading:
- Standard body text requires a line-height of **1.45 to 1.65**.
- In Vietnamese typography, tone marks stack above vowels (e.g. `ề`, `ổ`, `ở`, `ự`). Tight line-height (<1.35) causes grave diacritic collisions with preceding descenders (`g`, `y`, `p`).
- **Design Mandate:** Base line height on prose is set to **1.6 to 1.72**, completely preventing diacritic collisions and improving vertical scan comfort.

### 2.3 Alignment: Ragged-Right vs. Full Justification
Tinker (1963) and Hartley (1994) demonstrated that left-aligned text (ragged-right) provides superior reading speed and comprehension compared to full justification on screens. Full justification without complex hyphenation engines creates "rivers of white space" and erratic word spacing that disrupts saccadic rhythms.
- **Design Mandate:** Strict left-alignment across all prose (`text-align: left;`). Center alignment is restricted exclusively to solitary hero titles or empty state cards.

---

## 3. Dissecting Industry Paradigms: Duolingo, Anki, Kindle, Medium

### 3.1 Duolingo: Micro-Chunking & Immediate Positive Feedback
- **Principle:** One cognitive challenge per viewport. Never ask the learner to read a grammar textbook, write an essay, and solve multiple-choice questions on the same screen.
- **Application:** Speed Blitz (`#blitz`) and Placement Quiz present a single isolated prompt with dedicated choices, real-time auditory confirmation (chime/flip), and a high-contrast progress track.

### 3.2 Anki: Active Recall & Spaced Repetition (SRS)
- **Principle:** Separation of stimulus (front) and verification (back). Active recall forces synaptic retrieval before confirmation.
- **Application:** `AtomicCard` declares a dual-faced card surface (`.atomic-card-face-prompt` vs `.atomic-card-face-target`). The learner formulates their hypothesis, flips with `Space` or tap, and scores with four graded interval buttons (`Again`, `Hard`, `Good`, `Easy`).

### 3.3 Kindle & Medium: Editorial Calm & Distraction Removal
- **Principle:** Quiet background surfaces, minimal chrome, absence of flashing decorative badges.
- **Application:** Zen Immersion Mode (`ZenMode`) suppresses distracting navigation headers, mobile docks, and timers, leaving only pure high-contrast prose on an Apple-calm matte slate backdrop (`#0f172a` / `#182030`).

---

## 4. Vietnamese-Specific Typography & Letterform Disambiguation

### 4.1 Diacritic Safety & Letterform Disambiguation
- **Glyph Collisions:** Characters like `Ư/ơ`, `Ê/ế`, and `Đ/đ` require typefaces with deep OpenType font metrics and dedicated diacritic hinting.
- **Glyph Disambiguation:** Standard neo-grotesque typefaces often feature ambiguous forms where uppercase `I` (India), lowercase `l` (lima), and digit `1` (one) appear virtually identical.
- **Typeface Selection:** 
  - Sans-Serif: System font stack prioritizing Inter, SF Pro, Roboto, and Be Vietnam Pro (`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`).
  - Monospace: Disambiguated glyphs for telemetry, timers, and CEFR indicators (`ui-monospace, "SF Mono", Menlo, Consolas, monospace`).

### 4.2 L2 Target Stimulus vs. L1 Helper Scaffolding Contrast
To prevent cognitive interference between English target phrases and Vietnamese explanations, our UI enforces a strict dual-styling rule:
1. **Target English Stimulus:** Bold/semi-bold weight, primary text ink (`var(--ink-primary)` / `#f8fafc`), clean sans-serif, high visual hierarchy.
2. **Vietnamese Helper Gloss:** Soft gold / warm cyan tone (`var(--accent-gold)` / `#f59e0b` or `var(--ink-secondary)`), regular/medium weight, italicized or enclosed in brackets. The eye immediately discerns which language represents the learning challenge versus the pedagogical aid.

---

## 5. Canonical 7-Tier Learning View Typography Scale

| Tier Token | CSS Variable | Mobile Size | Desktop Size | Weight | Line Height | Role |
|---|---|---|---|---|---|---|
| **Tier 1: Stimulus** | `--font-learn-stimulus` | `20px` | `24px` | `700` | `1.25` | Target headword, key idiom, clausal core. |
| **Tier 2: Prompt** | `--font-learn-prompt` | `17px` | `20px` | `600` | `1.50` | Exercise prompt sentence, question instruction. |
| **Tier 3: Prose** | `--font-learn-prose` | `15.5px` | `16.5px` | `400` | `1.72` | Long-form reading passage, max measure 68ch. |
| **Tier 4: Definition** | `--font-learn-def` | `15px` | `15.5px` | `400` | `1.60` | Cambridge/Oxford academic English definition. |
| **Tier 5: Translation** | `--font-learn-vn` | `15px` | `15px` | `600` | `1.60` | Diacritic-safe Vietnamese semantic gloss. |
| **Tier 6: Exemplar** | `--font-learn-example` | `14.5px` | `15px` | `400 (italic)` | `1.60` | Corpus contextual sentence demonstrating usage. |
| **Tier 7: Scaffolding** | `--font-learn-scaffold` | `13px` | `13px` | `500 (mono)` | `1.40` | IPA phonetics, CEFR badge, part-of-speech. |

---

## 6. Implementation Verification

All tokens are defined as canonical variables in [`web/src/assets/styles/variables.css`](file:///d:/eng-learn/web/src/assets/styles/variables.css) and verified via [`web/scripts/verify-typographic-pedagogy.cjs`](file:///d:/eng-learn/web/scripts/verify-typographic-pedagogy.cjs) to guarantee 100% adherence across all learning dossiers and IELTS components.

