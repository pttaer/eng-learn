# Plan: 7-Pillar Expansion (Grammar), UI Scale Upgrade & Pillar Hover Envelope Fix

> **Status (2026-10-05):** implemented; the unchecked boxes below were not maintained. See `docs/audits/STATUS.md` for what is still open.

## 1. Objectives & Context
In response to user directives:
1. **Pillar 07: GRAMMAR** — Add a dedicated Grammar pillar focusing on C1/C2 advanced syntactic structures (inversion, clefts, subjunctive, participle clauses, ellipsis, syntactic error identification) with Universal Atomic Cards and native SM-2 scheduling.
2. **UI Scale & Sizing Upgrade** — Scale up typography, cards, badges, and controls across the entire web application to provide spacious, commanding legibility on all display sizes.
3. **Pillar Hover Envelope & Gap Fix** — Eliminate the premature collapse of the Living Sea Urchin spines when moving mouse between or onto pillars by implementing concentric hysteresis, keep-alive envelope radius, and hit area gap elimination.
4. **Remediate Fleet Audits** — Address input collision bug in `handleGlobalKey` (ignoring hotkeys while typing in inputs) and define fallback CSS tokens (`--bg-card`, `--space-6`, `--space-20`).

---

## 2. Mathematical & Kinematic Geometry: 7 Radial Gateways

Gateways are spaced at exact 7-way radial symmetry ($\Delta\theta = \frac{2\pi}{7} \approx 51.43^\circ$ or $0.8976\text{ rad}$):
- Base anchor: Pillar 01 (`READ`) at $-\frac{\pi}{2}$ (-90° / 12 o'clock).
- Gateway distance: $r = 115\text{px}$ from Singularity Core.
- Node visual radius: $r_{\text{node}} = 28\text{px}$ (scaled from 22px).
- Node hit test radius: $r_{\text{hit}} = 38\text{px}$.

| Code | Pillar | Route | Angle ($\theta$) | Visual Position |
| :--- | :--- | :--- | :--- | :--- |
| `01` | `READ` | `#read` | $-90.0^\circ$ ($-\pi/2$) | Top (12:00) |
| `02` | `WRITE` | `#write` | $-38.6^\circ$ | Top-Right (1:45) |
| `03` | `LISTEN` | `#listen` | $+12.9^\circ$ | Mid-Right (3:25) |
| `04` | `SPEAK` | `#speak` | $+64.3^\circ$ | Bottom-Right (5:10) |
| `05` | `VOCAB` | `#vocab` | $+115.7^\circ$ | Bottom-Left (6:50) |
| `06` | `COLLOC` | `#colloc` | $+167.1^\circ$ | Mid-Left (8:35) |
| `07` | `GRAMMAR` | `#grammar` | $-141.4^\circ$ | Top-Left (10:15) |

---

## 3. Pillar Hover Keep-Alive Envelope Fix (`sea-urchin.ts`)

### Root Cause Analysis
Previously, `isDirectHover = distToCenter < 100`. At $r=88\text{px}$ with node radius $22\text{px}$, the outer edge is $110\text{px}$. When the user moves the cursor toward a node, `distToCenter` exceeds 100px, setting `targetParting = 0.0` and immediately collapsing the spines.

### Kinematic Solution
1. **Concentric Hysteresis**:
   - `OPEN_TRIGGER_RADIUS = 115px`: Hovering within 115px of center begins parting.
   - `KEEP_ALIVE_ENVELOPE = 220px`: Once parting has initiated (`partingProgress > 0.15`), the active zone expands outward to 220px.
   - `isNearAnyNode`: Also check if mouse is within $r_{\text{hit}} + 20\text{px}$ of ANY gateway node position.
   - If mouse is within `KEEP_ALIVE_ENVELOPE` or near any gateway, `targetParting = 1.0`.
2. **Grace Period & Asymmetric Damping**:
   - Moving in: fast responsiveness (`this.partingProgress += (1.0 - this.partingProgress) * 0.14`).
   - Moving out: gradual decay (`this.partingProgress += (0.0 - this.partingProgress) * 0.05`) with a 250ms grace timeout before closing starts.
3. **No Dead Gap Between Nodes**:
   - Adjacent nodes have generous hit test margins ($38\text{px}$ radius), ensuring smooth traversal around the constellation circle without accidental closure.

---

## 4. UI Scale & Readability Upgrade

### 4.1 Typography Scale (`variables.css`)
- `--text-2xs`: 9px $\rightarrow$ **11px**
- `--text-xs`: 11px $\rightarrow$ **13px**
- `--text-sm`: 13px $\rightarrow$ **15px**
- `--text-base`: 15px $\rightarrow$ **17px**
- `--text-lg`: 18px $\rightarrow$ **22px**
- `--text-xl`: 24px $\rightarrow$ **28px**
- `--text-2xl`: 32px $\rightarrow$ **36px**
- `--text-3xl`: 40px $\rightarrow$ **48px**

### 4.2 Universal Atomic Card Dimensions (`atomic-card.css`)
- Card perspective wrapper: width $580\text{px} \rightarrow \mathbf{680\text{px}}$, min-height $380\text{px} \rightarrow \mathbf{430\text{px}}$.
- Card padding: $24\text{px} \rightarrow \mathbf{32\text{px}}$.
- Card front prompt & sentence: scaled to 17px/18px with 1.6 line height.
- Rating buttons: `padding: 12px 24px`, font size 15px with high-contrast borders.

### 4.3 Workspace & Layout Dimensions (`dossiers.css`)
- Container max-width: $860\text{px} \rightarrow \mathbf{1040\text{px}}$.
- Reading pane: generous padding $32\text{px}$, body text 16px.
- Navigation buttons & control tabs: scaled up with comfortable click targets.
- Token hygiene: Add `--bg-card: #ffffff;`, `--space-6: 6px;`, `--space-20: 20px;`.

---

## 5. Pedagogical Architecture of Pillar 07: GRAMMAR

### Modes
1. **Mode A: [INVERSION & EMPHASIS]** (Negative inversion, conditional inversion, cleft sentences, fronting).
2. **Mode B: [SUBJUNCTIVE & HYPOTHETICALS]** (Mandative subjunctive, unreal past, mixed conditionals, inverted conditionals).
3. **Mode C: [CLAUSAL CONDENSATION]** (Participle clauses, absolute constructions, reduced relative clauses, verbless clauses).
4. **Mode D: [SYNTACTIC PRECISION & REPAIR]** (Faulty parallelism, dangling modifiers, tense shifts, ellipsis).

### Universal Atomic Card Standard for Grammar
- **Front Face**: Transformation challenge or diagnostic sentence with target grammatical cue.
- **Back Face**: Syntactic formula, structural derivation breakdown, Vietnamese comparative nuances, and clean reconstructed exemplar.
- **SRS Scheduling**: Integrated SM-2 algorithm with Level 1-3 tiers and Again / Good ratings.

---

## 6. Execution Plan & Fleet Assignments
- **`god` (Michael)**: Draft plan, update kinematic math in `sea-urchin.ts`, update `variables.css`, `atomic-card.css`, `dossiers.css`, `router.ts`, `corner-compass.ts`, build `grammar-dossier.ts`, and integrate into `main.ts`.
- **`michael-mum0t4d1` (Mic)**: Plan audit against `CLEAN_DESIGN_SYSTEM.md` (Strict constraint: Mic audits plans ONLY).
- **`jim-mul1meuh` (Jim)**: Generate comprehensive `grammar.json` dataset (60 curated items across 4 modes, 3 levels).
- **`dwight-mul1u508` (Dwight)**: Validate cohort simulator coverage with 7 pillars.
- **`phyllis-mul1ur07` (Phyllis)**: Verify keyboard focus flow & verify active input collision fix.
- **`jim-mum0qdlb` (JimMA)**: Verify clean design compliance & token hygiene.
