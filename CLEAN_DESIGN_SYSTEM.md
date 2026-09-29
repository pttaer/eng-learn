# Clean Design Mandate & Architectural Standard: The Stark Monochrome Rules

> **AUTHORITATIVE DIRECTIVE FOR ALL HIVE AGENTS**  
> **Target Audience:** All floor agents (`jim-mul1meuh`, `dwight-mul1u508`, `andy-mul1ug04`, `phyllis-mul1ur07`, `michael-mum0t4d1`, `god`).  
> **Source Synthesis:** Synthesized from EpicPxls (*Design Like a Pro*), Todd Cantley (*Clean Design in 3 Steps*), BlackHatWorld Design Architecture (*Simplicity & Efficacy*), and Lummi (*6 Key UX Principles of Clean Design*).  
> **Mandate:** Any UI component, CSS rule, or animation implemented for the **Monochrome Sea Urchin English Learning Web System** MUST comply with the rules below. Zero exceptions.

---

## 1. The Core Philosophy: "Simple Does Not Mean Empty"

Clean design is not a lack of content; it is **intense intentionality**. 
1. **Instant Purpose:** Every element on screen—a card, button, timer, coordinate badge, or spine—must communicate its function instantly. The user should never wonder *"what do I do next?"* The interface does the thinking for them.
2. **Subtraction Over Addition:** Before adding an element, border, icon, or label, ask: *"Does this serve the learning mission?"* Removing one unnecessary element improves a layout far more than adding three decorative ones.
3. **Cognitive Load Point (CLP) Minimization:** Human working memory is limited. Irregular shapes, competing focal points, and chaotic angles increase cognitive load. Clean designs default to **stable rectangular and circular geometries** that the brain parses effortlessly.

---

## 2. The 7 Pillars of Clean Design Execution

### Pillar 1: Absolute Monochrome Palette (Less Color = Maximum Weight)
- **The Rule:** Zero multi-color palettes, zero gradients, zero chromatic blooms.
- **Implementation:**
  - Base Canvas: `#FFFFFF` (Pure white).
  - Entity Ink & Typography: `#000000` (Pure pitch-black).
  - Structural Hairlines: `rgba(0, 0, 0, 0.10)` to `rgba(0, 0, 0, 0.15)` for 1px drafting lines.
  - "Black Light" Glow: Inverted dark shadow/ring pulses (`rgba(0, 0, 0, 0.40)`).
- **Rationale:** Color competition destroys visual hierarchy. When you strip away all color, contrast becomes absolute, typography becomes authoritative, and visual fatigue drops to zero during long study sessions.

### Pillar 2: The 8pt Spatial Grid & Generous Whitespace
- **The Rule:** Whitespace is not wasted space; it is the structural glue that makes content legible and prestigious.
- **Implementation:**
  - All margins, paddings, and gaps must follow the **8pt Grid System**: `8px`, `16px`, `24px`, `32px`, `48px`, `64px`.
  - Component padding: Minimum `24px` on cards, `16px` on interactive docks.
  - Let elements breathe: If a screen feels crowded, double the padding instead of shrinking the font.

### Pillar 3: Two Fonts Maximum (Typographic Discipline)
- **The Rule:** Never use more than two typeface families in the entire application.
- **Implementation:**
  - **Typeface 1 (Telemetry & Data):** High-precision geometric monospace (`JetBrains Mono`, `Space Mono`, or system monospace). Used for coordinates, card indices (`[042 / 1000]`), timers, labels, and buttons.
  - **Typeface 2 (Human Prose & Learning):** Clean neo-grotesque sans-serif (`Inter`, `system-ui`). Used for English prompts, collocations, Vietnamese translations, and reading text.
  - **Scale & Leading:** Maintain strict modular hierarchy (Header `24px/32px`, Body `16px/24px`, Telemetry `12px/16px`). Never use tight line-height on learning text.

### Pillar 4: Mathematical Alignment & Grid Rigor
- **The Rule:** Misalignment destroys credibility instantly. Even a 2px offset signals amateur design.
- **Implementation:**
  - All cards, headers, buttons, and telemetry rows must snap to explicit Flexbox or CSS Grid alignment axes.
  - Align text flush-left for reading comprehension; center-align only single focal metrics (e.g. countdown timers, card indices).
  - Hairline borders must be exactly `1px` (`border: 1px solid rgba(0, 0, 0, 0.12)`), never fuzzy fractional pixels (`1.5px` or `0.8px`).

### Pillar 5: Content Minimalism (Zero Filler)
- **The Rule:** Say only what needs to be said.
- **Implementation:**
  - Cut passive voice, unnecessary instructional paragraphs, and filler labels.
  - Instead of *"Click here to flip this card and check the translation"*, use: `[Click or Space to Flip]`.
  - Use scannable bullet points, bold key collocations, and isolate the answer cleanly on the card back.

### Pillar 6: Purposeful, Unified Motion & Physics
- **The Rule:** Animation must guide attention and provide physical feedback—never perform for its own sake.
- **Implementation:**
  - **Universal Timing:** All UI state transitions (hover, card flip, button press) must complete within **180ms – 280ms**.
  - **Unified Easing:** Use consistent cubic-bezier curves (`cubic-bezier(0.16, 1, 0.3, 1)`) or spring physics across the entire codebase. Do not mix bouncy springs with linear fades.
  - **Composite-Only Rule:** Animate ONLY `transform` and `opacity`. Never animate `width`, `height`, `top`, `left`, `margin`, or `padding`.
  - **Immediate Response:** Raw cursor tracking must be 0ms latency; trailing outer reticles and parallax cards use smooth spring damping (`damping: 15–20`).

### Pillar 7: Universal Atomic Consistency
- **The Rule:** All four pillars (Reading, Writing, Listening, Speaking) must feel like the exact same high-precision laboratory instrument.
- **Implementation:**
  - Every learning exercise lives inside the **Universal Atomic Card Standard**:
    `[Top Telemetry Header] -> [Front Prompt] -> [180° Spin] -> [Back Resolution] -> [Bottom [✗] | [Flip] | [✓] Dock]`.
  - Zero bespoke button sizes or mismatched modal popups.

---

## 3. The Agent Pre-Delivery Quality Checklist

Before any agent submits code or marks a task as complete in `tasks.json`, they must verify their deliverable against this 8-point checklist:

- [ ] **1. Color Audit:** Is the component 100% binary black and white? Are there any unapproved colors or chromatic glows?
- [ ] **2. 8pt Grid Audit:** Do all paddings, margins, and gaps resolve to multiples of 8px?
- [ ] **3. Font Audit:** Are there strictly ≤ 2 fonts in use (Monospace for data, Sans for prose)?
- [ ] **4. Alignment Audit:** Are all borders, buttons, and labels pixel-aligned with zero ragged offsets?
- [ ] **5. CLP Audit (Cognitive Load):** Is the purpose of this screen immediately obvious in under 2 seconds? Is there any visual clutter to delete?
- [ ] **6. Performance Audit:** Are all animations running on `transform` and `opacity` at 60–120 FPS?
- [ ] **7. Reduced Motion Audit:** Does the component respect `prefers-reduced-motion` cleanly?
- [ ] **8. Consistency Audit:** Does this screen strictly obey the Universal Atomic Card Standard?

---
*Signed and Approved by Orchestrator Michael (`god`). All floor agents shall enforce these rules.*
