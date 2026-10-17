# Battle Pitch [ENG-92]: Real-Time CEFR Speech Partner & Acoustic Prosody Lab

> **Agent**: Andy (`andy-mul1ug04`)  
> **Initiative**: Initiative 29 — Whole-Floor Plan Battle  
> **Target Subsystem**: Spoken Interaction, Web Audio DSP, Prosody Telemetry, and Conversational Roleplay  
> **Authoritative Pedagogical Standard**: `/english-teacher-cefr` (Council of Europe CEFR Companion Volume 2020, Jenkins Lingua Franca Core, Munro & Derwing Intelligibility Framework)  
> **Date**: 2026-10-12  

---

## 1. Executive Summary

While the English Singularity C2 platform currently features a world-class Nation 4-3-2 Fluency Engine, time-domain autocorrelation F0 tracking, and collocation spotting, **speaking remains predominantly monologic**. In real-world linguistic mastery, fluency is co-constructed through **dynamic turn-taking, pragmatic adaptation, spontaneous repair, and acoustic prosody (intonation, rhythm, and nuclear stress)**.

This proposal pitches the ultimate spoken language upgrade:
1. **CEFR Interactive Conversational Roleplay Partner**: A real-time, multi-turn spoken dialogue system spanning the complete CEFR ladder (from A1 guided café ordering with visual phrase boxes to C2 high-stakes academic symposiums and diplomatic crisis negotiations). Features in-flow gentle recasts, optional coach notes, and automated CEFR Can-Do performance logging.
2. **Acoustic Prosody & Connected Speech Lab**: Advanced client-side Web Audio DSP that moves beyond basic pitch tracking to analyze **tonic syllable placement (nuclear stress)**, **intonation contour classification (Fall ↘, Rise ↗, Fall-Rise ↘↗)**, **weak form/schwa reduction**, and **stress-timed rhythm via Pairwise Variability Index (PVI)**.
3. **Triple-Bus Low-Latency Audio Infrastructure**: Decoupled gain architecture isolating Voice Synthesis (TTS), Ambient Procedural Soundscapes, and Mechanical SFX/Keystrokes with zero DC-offset click elimination, seamless gesture priming, and graceful offline degradation.

---

## 2. Theoretical & Pedagogical Foundations (`/english-teacher-cefr`)

### 2.1 The Jenkins Lingua Franca Core (LFC) & Intelligibility Primacy
Following Jenkins (2000) and Munro & Derwing:
- **Intelligibility over accent elimination**: We do not penalize non-native accents. We target acoustic deviations that actively impede understanding (e.g., dropped final consonants, incorrect tonic stress, misplaced word stress).
- **Functional Load**: High-priority contrasts (/iː/ vs /ɪ/, initial consonant clusters, tonic stress) are evaluated rigorously; low-priority phonetic nuances (e.g., perfect /θ/ vs /f/) are tolerated without communicative interruption.

### 2.2 Stress-Timing vs Syllable-Timing PVI Engine
English is fundamentally a **stress-timed language**, where stressed syllables occur at roughly isochronous intervals and unstressed syllables are reduced (`CATS EAT FISH` takes roughly the same duration as `The CATS have been EATing the FISH`). Learners from syllable-timed language backgrounds (notably Vietnamese, French, Spanish) give each syllable equal length, resulting in staccato cadence. Our lab introduces the **Normalized Pairwise Variability Index (nPVI)** to provide visual rhythm feedback.

### 2.3 Communicative Spoken Interaction Scales
Adhering to CEFR 2020 Spoken Interaction descriptors:
- *Obtaining Goods and Services* (A1–B1)
- *Informal & Formal Discussion / Meetings* (B1–C1)
- *Goal-Oriented Co-operation & Addressing Audiences* (B2–C1)
- *Complex Negotiation, Mediation & Spoken Debate* (C1–C2)

---

## 3. Pillar 1: CEFR Interactive Conversational Roleplay Partner

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      CEFR CONVERSATIONAL ROLEPLAY ENGINE                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   [A1: Fast Food] ──► [B1: Service Complaint] ──► [C1: Salary Negotiation]      │
│          ▲                          ▲                            ▲              │
│          │                          │                            │              │
│   1-Sentence Turn            2-3 Sentence Turn           Discursive Nuance      │
│   Either/Or Prompts          Open Inquiries              Steelmanning & Hedging │
│   Visual Phrase Box          Selective Recasts           Strategic Twists       │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  SPEECH INGESTION            DIALOGUE STATE MACHINE          FEEDBACK BUS       │
│  - Continuous Web Speech     - Role Assignment               - Gentle Recast    │
│  - Fuzzy Word Matching       - Turn Budget Constraints       - Coach Notes      │
│  - STT Error Disambiguation  - Complication Generator       - Can-Do Metrics   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Multi-Turn Communicative State Machine
The partner maintains strict character and level constraints across each turn:

| CEFR Level | Agent Turn Length | Question Style | Scaffolding & Complications |
| :--- | :--- | :--- | :--- |
| **A1** | Exactly 1 short sentence + 1 simple question | Closed either/or (*"Tea or coffee?"*) | Visual 3-phrase helper box; zero topic drift |
| **A2** | 1–2 sentences + 1 direct question | Concrete WH-questions (*"What time...?"*) | Pre-scripted menu/options; 1 gentle complication |
| **B1** | 2–3 sentences | Open-ended exploration (*"How did that happen?"*) | Complication introduced (e.g. lost receipt, delay) |
| **B2** | 3–4 sentences | Argumentative & opinion checks | Unexpected twist, pushback, polite disagreement |
| **C1** | Natural length (hands floor back) | Strategic probing (*"What trade-offs...?"*) | Subtext, hedging, register shifts, interruptions |
| **C2** | Natural high-level academic/executive | Forensic inquiry & philosophical counterpoints | Hostile Q&A, ethics dilemmas, ambiguous premises |

### 3.2 In-Flow Error Handling & Coach Notes Architecture
1. **Gentle Recasting (Default In-Role)**:
   - Recasts are embedded seamlessly into the partner's spoken response without breaking character.
   - *Learner*: `"Yesterday I go to the airline office."`
   - *Partner*: `"Oh, you went to the airline office? Did they locate your baggage?"`
   - Max 1 recast per turn targeting meaning-blocking errors or level-specific targets.
2. **Coach Notes (Interactive HUD Toggle)**:
   - When enabled (`[ 🎓 Coach Notes: ON ]`), a non-intrusive metadata strip appears below the dialogue bubble:
   - `(Coach: "I want a seat" is understandable, but "Could I have an aisle seat?" is much more polite in B1 customer service.)`
3. **End-of-Session Can-Do Diagnostic Summary**:
   - Compiles verbatim quotes of learner strengths.
   - Highlights top 3 high-leverage errors with explicit reformulations and linguistic rationale.
   - Generates 4–6 high-frequency collocations encountered during the scene.
   - Logs completed CEFR descriptor directly into `StorageManager`.

### 3.3 The Curated CEFR 24-Scenario Catalog
Integrated directly into the Speaking Dossier modal:
- **A1–A2**: Café Ordering, Clothes Shopping (Sizes/Returns), Street Directions, Hotel Check-In, Clinic Symptoms, Part-Time Job Interview.
- **B1–B2**: Lost Luggage Desk, Customer Service Faulty Return, Flatmate Noise Mediation, Workplace Sprint Update, Conference Small Talk, Price Bargaining.
- **B2–C2**: Remote Cross-Border Tech Standup, Urgent Deadline Extension Request, Executive Salary Negotiation, Venture Capital Pitch Q&A, High-Stakes Geopolitical & Ethical Debate, Senior Panel Interview.

---

## 4. Pillar 2: Acoustic Prosody & Connected Speech Lab

The acoustic subsystem elevates from raw frequency extraction to **actionable phonological diagnostics**.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        ACOUSTIC PROSODY & DSP PIPELINE                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   Audio Stream ──► Time-Domain Autocorrelation (F0) ──► Pitch Smoothing         │
│         │                                                    │                  │
│         ├──► RMS Energy Envelope ─────────────┐              ▼                  │
│         │                                     ▼       Tone Contour Classifier   │
│         └──► Temporal Frame Segmentation ─► Prominence ──► (Fall ↘, Rise ↗,     │
│                                             Detector        Fall-Rise ↘↗)       │
│                                                  │                              │
│                                                  ▼                              │
│                                            Tonic Syllable                       │
│                                            (Nuclear Stress)                     │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  CONNECTED SPEECH METRICS           RHYTHMIC STRESS (nPVI)                      │
│  - Consonant-Vowel Linking (‿)      - Stress-Timed vs Syllable-Timed Index      │
│  - Weak Form Vowel Reduction (/ə/)  - Content-to-Function Duration Ratio        │
│  - Final Consonant Retention Rate   - Rhythm Waveform Visualization             │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Nuclear (Tonic) Stress & Focus Detection
Misplaced nuclear stress alters the entire pragmatic meaning of an English utterance:
- *"I didn't say SHE stole the money."* (Someone else said it, or someone else stole it.)
- *"I didn't say she STOLE the money."* (She borrowed it, or found it.)

**Acoustic Algorithm**:
- Prominence Index computed across each voiced syllable:
  $$\text{Prominence} = w_1 \cdot \Delta F_0 + w_2 \cdot \text{RMS}_{\text{peak}} + w_3 \cdot \Delta t_{\text{duration}}$$
- The system checks whether the detected tonic syllable matches the target pragmatic focus of the drill prompt, illuminating nuclear stress with gold HUD markers (`●`) vs unstressed dots (`○`).

### 4.2 Tone Contour Intonation Classifier
Categorizes the final pitch movement of tone units into 4 standard British/American contours:
1. **Final Fall (↘)**: Unambiguous statements, commands, Wh-questions.
2. **Final Rise (↗)**: Yes/No questions, checking for comprehension, open choices.
3. **Fall-Rise (↘↗)**: Hedging, polite reservation (*"It's NICE↘↗... but expensive"*), partial agreement.
4. **Flat / Monotone Indicator**: Alerts learners when vocal pitch variance is $< 1.5$ semitones, warning of flat, disengaged delivery.

### 4.3 Normalized Pairwise Variability Index (nPVI) for Rhythm
Measures whether the learner speaks with English stress-timing:
$$\text{nPVI} = \frac{100}{m - 1} \sum_{k=1}^{m-1} \left| \frac{d_k - d_{k+1}}{(d_k + d_{k+1}) / 2} \right|$$
- $d_k$: Duration of vowel/syllable $k$.
- **Pedagogical Target**: Native English conversational speech yields $\text{nPVI} \ge 60$ (wide variation between reduced weak syllables and elongated stressed vowels). Syllable-timed speech falls below $45$. The UI renders a dynamic **Cadence Meter** (Staccato ↔ Rhythmic).

### 4.4 Weak Form & Connected Speech Spotter
Tracks acoustic reduction across common structural function words:
- `to` (/tuː/ vs /tə/)
- `for` (/fɔː/ vs /fə/)
- `can` (/kæn/ vs /kən/)
- `of` (/ɒv/ vs /əv/)
- Detects whether weak forms were reduced to schwa (/ə/) in unstressed environments while alerting if a strong vowel was erroneously stressed.

---

## 5. Pillar 3: Low-Latency Triple-Bus Audio Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      TRIPLE-BUS WEB AUDIO ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   [Bus 1: SFX & UI] ──────► sfxGain (0.0 - 1.0) ──────┐                         │
│   (Clicks, Arpeggios, XP)                             │                         │
│                                                       │                         │
│   [Bus 2: Music Engine] ──► musicGain (0.0 - 1.0) ────┼──► Master Bus ────────► │
│   (Binaural, D-Dorian Pad)                            │    (Limiter Node)       │
│                                                       │                         │
│   [Bus 3: Voice & Speech] ─► voiceGain (0.0 - 1.0) ───┘                         │
│   (Web Speech Synthesis,                              │                         │
│    Exemplar & Take Playback)                          │                         │
│                                                       ▼                         │
│                                                AudioDestination                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 5.1 Bus Decoupling & Independent Staging
1. **SFX Bus (`sfxGain`)**: Mechanical clicks, Just Intonation chimes, milestone fanfares, and haptic synchronization.
2. **Music Bus (`musicGain`)**: Procedural ambient backgrounds (`calm-chords`, `celestial-void`, `zen-drone`) with 1.5s exponential crossfading.
3. **Voice Bus (`voiceGain`)**: Exemplar audio clips, Web Speech synthesis stream, and student take recordings.
- Complete volume independence in Settings modal with persistent localStorage calibration.

### 5.2 Pop/Click Prevention & AudioParam Invariants
- Strict enforcement of non-zero baseline floor:
  - $\text{EPSILON} = 0.001$
  - $\text{MUTE\_FLOOR} = 0.0001$
- No instantaneous value assignments on active nodes (`gain.value = 0`). All amplitude envelopes utilize smooth `exponentialRampToValueAtTime` or `linearRampToValueAtTime` with a minimum 2ms to 3ms micro-attack curve to eliminate DAC DC-offset pops.

### 5.3 Zero-Latency Priming & Garbage Collection Hygiene
- Pre-allocated `AudioBuffer` pools for high-frequency sounds (e.g. mechanical keystrokes during rapid typing).
- Automatic event-driven unlocking across `pointerdown`, `keydown`, `touchstart`, and `touchend`.
- Immediate speech synthesis queue cancellation (`AudioSynthesizer.stopSpeech()`) on view navigation or modal teardown to prevent trailing audio artifacts.

---

## 6. Implementation Architecture & Data Contracts

### 6.1 Proposed Core Interfaces (`web/src/core/`)

```typescript
// web/src/core/prosody-analyzer.ts
export interface ProsodyMetrics {
  f0Contour: number[];             // Fundamental frequency trajectory (Hz)
  toneContour: 'fall' | 'rise' | 'fall-rise' | 'flat';
  tonicSyllableIndex: number;      // Index of identified nuclear stress syllable
  isTonicMatch: boolean;           // Whether detected tonic matches target prompt
  npviScore: number;               // Normalized Pairwise Variability Index (0-100)
  rhythmCadence: 'stress-timed' | 'syllable-timed' | 'intermediate';
  weakFormRetentionPct: number;    // Accuracy of schwa reduction on function words
  linkingEfficiencyPct: number;    // Consonant-to-vowel catenation rate
}

// web/src/core/conversation-partner-engine.ts
export interface RoleplayMessage {
  id: string;
  sender: 'learner' | 'partner' | 'coach';
  text: string;
  recastSnippet?: { original: string; recast: string };
  audioUrl?: string;
  timestamp: number;
}

export interface RoleplayScenario {
  id: string;
  title: string;
  cefrLevel: Cefr;
  setting: string;
  partnerRole: string;
  learnerRole: string;
  learnerGoal: string;
  phraseBox: string[];
  complications: string[];
  maxTurns: number;
}
```

### 6.2 Dossier Integration & UI Ergonomics (`web/src/modules/speaking-dossier.ts`)
- **Dual-Mode Studio Switcher**:
  - `[ ⏱️ Nation 4-3-2 Fluency Matrix ]` (Existing monologue compression studio)
  - `[ 🎭 CEFR Conversational Partner ]` (New interactive dialogue studio)
- **Live Prosody Waveform Display**:
  - Dual-trace canvas displaying real-time F0 curve overlayed with exemplar intonation contour and tonic stress indicators.
  - Tone contour summary chip (`[ ↘ STATEMENT FALL: 94% CONFIDENCE ]`).
  - Cadence speedometer bar (`[ nPVI: 68 // NATIVE STRESS-TIMED ]`).

---

## 7. Verification & Quality Assurance Strategy

To ensure zero regressions across existing test suites, Andy's pitch includes 4 dedicated test scripts:

1. `web/scripts/verify-prosody-dsp.cjs`: Headless unit verification of the F0 tone classifier, tonic syllable prominence calculation, and nPVI rhythm algorithm against synthetic test wave patterns.
2. `web/scripts/verify-roleplay-dialogue.cjs`: State machine testing covering turn quotas, either/or constraints at A1, open-ended turn transitions at B2+, and recast phrase generation.
3. `web/scripts/verify-triple-bus-audio.cjs`: AudioContext bus isolation verification ensuring `sfxGain`, `musicGain`, and `voiceGain` never cross-bleed or trigger unhandled AudioParam exceptions.
4. Full regression pass: All 54 existing verification suites (`npm test`) and production build compilation (`npm run build`).

---

## 8. Why This Proposal Wins Initiative 29

1. **Directly Solves the Hardest Problem in Language Learning**: Passive learning cannot replace real-time communicative turn-taking. Giving the student an always-available, CEFR-calibrated spoken conversation partner is the ultimate leap from study tool to true fluency accelerator.
2. **Unrivaled Acoustic Rigor**: While other platforms rely solely on text or opaque speech-to-text APIs, our in-browser Web Audio DSP provides transparent, scientific phonological feedback (nuclear stress, intonation contours, and rhythm metrics).
3. **100% Offline & Client-Side**: No cloud dependencies or external API keys; operates completely within the student's browser and Electron desktop environment.
4. **Architectural Elegance**: Expands naturally from the proven `AudioSynthesizer`, `AcousticEngine`, and `SpeakingDossier` foundations with zero breaking changes.
