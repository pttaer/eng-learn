# Rule: Canonical Spacing & Padding Standard

> **MANDATORY SPECIFICATION FOR ALL AGENTS AND DEVELOPERS**  
> **Source Exemplar:** IELTS Academic Writing View (`Mobile/1.0.0/37-mobile-ielts-writing.png` / `web/src/ielts/views/writing.ts` & `web/src/ielts/ielts.css`).  
> **Scope:** Entire application suite (CEFR Skill Tree, 6 Mastery Dossiers, Placement Quiz, 12 Tenses, IELTS Suite & Modals).

From now on, all views across the application must strictly adhere to the paddings, spacing rhythms, and component geometry established by this canonical view.

---

## 1. Visual Hierarchy & Spacing Rhythm

```
+--------------------------------------------------------------------------+
|  HEADER: [Brand: IELTS 7.0]                  [Action: ← Back / Nav]      |  padding: 12px 24px;
|  NAV TRACK: [ Pill 1 ] [ Pill 2 (active) ] [ Pill 3 ]                    |  gap: 8px; pill-pad: 8px 12px; radius: 8px;
+--------------------------------------------------------------------------+
                                                                             
  WORKSPACE CONTAINER (max-width: 1040px; margin: 0 auto; padding: 24px;)
  All elements share strict flush-left alignment along the 24px inset.

  [ H1 PAGE TITLE: Academic Writing ]                                        gap-below: 12px–16px (margin: 0)
  
  [ LEAD TEXT: Task 1: describe visual... Task 2: write 250+... ]            max-width: 760px; line-height: 1.5; gap-below: 16px
  
  +------------------------------------------------------------------------+
  | [ Button: Task 1 Visual Formula Inspector ]                            |  pad: 8px 18px; radius: 9px; min-h: 38–44px
  | [ Button: Task 2 4-Sentence Paragraph Workbench ]                      |  gap: 8px–12px between buttons
  | [ Primary Button: Launch Writing Studio (6 Blueprints & 5 Arch...) ]   |  accent-filled, high-contrast, radius: 9px
  +------------------------------------------------------------------------+
                                                                             gap-below: 20px–24px
  [ H2 / H3 SECTION SUBHEAD: Task 1 ]                                        margin: 0; gap-below: 12px–16px
  
  +------------------------------------------------------------------------+
  | CARD (Energy Consumption in Four Countries (1990–2020))                |  padding: 16px all sides; radius: 12px;
  |   <b>Title Text</b>                                                    |  border: 1px solid var(--border-hairline);
  |   <span>metadata / category (line)</span>                              |  internal flex-col gap: 8px; min-height: 88px;
  +------------------------------------------------------------------------+
  | CARD (Internet Penetration by Region (2000–2020))                      |  card-to-card gap: 12px (mobile) / 16–20px (desktop)
  +------------------------------------------------------------------------+
```

---

## 2. Definitive Padding Tiers (Single Source of Truth)

1. **Workspace & Screen Inset (`variables.css`):**
   - **Single place for Left:** `--pad-screen-left: 12px;`
   - **Single place for Right:** `--pad-screen-right: 12px;`
   - Derived tokens: `--pad-screen-x: var(--pad-screen-left);`, `--pad-workspace: 16px var(--pad-screen-right) 24px var(--pad-screen-left);`
   - Changing `--pad-screen-left` and `--pad-screen-right` in `variables.css` propagates across the entire application (`#hud-overlay`, `.ie-header`, `.ie-main`, and all viewports).
   - Title, lead copy, hub action buttons, subheadings, and card edges **must strictly align to this same left margin**.
2. **Card Surfaces (`.ie-card`, `.dossier-card`, etc.):**
   - Padding: **`16px`** on all sides.
   - Border radius: **`12px`**.
   - Border: `1px solid var(--border-hairline)`.
   - Background: `var(--bg-card)`.
   - Internal gap: **`8px`** vertical rhythm between card title and secondary tags/metadata.
3. **Interactive Controls & Buttons:**
   - Button padding: **`8px 18px`** (or `8px 16px` compact).
   - Border radius: **`9px`** (for standard buttons and primary action bars).
   - Navigation pills: **`8px 12px`** with **`8px`** border radius.
   - Touch floor: Minimum **`44px`** tap height on touch/mobile viewports; fine-pointer desktop minimum **`38px`**.
4. **Header Navigation:**
   - Bar padding: **`var(--space-12) var(--pad-screen-right) var(--space-12) var(--pad-screen-left)`**.
   - Pill track gap: **`8px`**.

---

## 3. Spatial Gap Rhythm

- **Between Major Sections:** `var(--gap-section)` (`16px` mobile / `32px` desktop).
- **Between Stacked Blocks / Cards:** `var(--gap-block)` (`12px` mobile / `16px–20px` desktop).
- **Between Header / Title / Lead text:** `12px`–`16px` (zero margins on headings, spacing handled via container `gap`).
- **Between Action Buttons:** `8px`–`12px`.
- **Inside Cards (between title and metadata):** `8px`.

---

## 4. Enforcement & Compliance

- Never use random arbitrary padding like `13px`, `19px`, `21px`, or `30px`.
- Never let cards or buttons touch the screen edge; always preserve the `24px` workspace inset.
- Never wrap card contents with uneven margins; always rely on `padding: 16px` and `gap: 8px`.

---

## 5. Mobile Vertical Rhythm & Text Alignment (added 2026-10-26)

Mirrors spec §6 in `docs/TYPOGRAPHY_SPACING_RULES.md`. Both must stay in sync.

- **One rule per class.** A class is defined once. A later duplicate silently overrides tokens.
- **Kickers:** `--font-kicker` (11px), `--font-kicker-spacing` (0.08em), uppercase. No inline `letter-spacing` or font-size overrides.
- **Badges and chips stay on one line** (`white-space: nowrap`). A flex row holding a kicker plus a badge uses `flex-wrap: wrap; gap: 4px 8px`.
- **Alignment is flush-left.** Centre only a whole hero or empty-state card, where every line inside is centred.
- **No symmetric ornaments on left-aligned text.** Use `✦ TITLE`, never `✦ TITLE ✦`.
- **No 0–4px gaps between stacked text blocks.** Mobile tiers: element 6px, group 8px, block 12px, section 16px. Exempt: a heading with its own one-line subtitle (line-height spacing), and table rows.
- **No fixed-height nested scroll box for a content list on mobile.** The page scrolls. Canvas and map views are exempt.
- **Full-width CTA labels wrap** inside the button (`white-space: normal`). They never overflow.
- **Every clickable is at least 44×44 on phones** (`button`, `a[href]`, `[role=button]`, `[role=tab]`, `[data-route]`). Inline prose links are exempt.
- **Mobile titles and labels wrap.** No `text-overflow: ellipsis` on them.
