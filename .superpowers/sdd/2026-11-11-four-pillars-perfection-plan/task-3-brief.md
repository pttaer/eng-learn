# Task 3: Streamlined Reading Pass 1 & Anti-Control Overload

**Location in project:** Reading Lab (Trụ cột 01 - Pass 1 Cold Read & Skim) in `web/src/modules/reading-dossier.ts` & CSS.
**Files to modify:**
- `web/src/modules/reading-dossier.ts`
- `web/src/assets/styles/dossiers.css` (or `ux-c.css`)

**Requirements:**
1. Currently in `reading-dossier.ts`, the top of Pass 1 renders 7 stacked layers before the article text starts:
   - Reading mode bar (Intensive vs Extensive)
   - Article selector tabs (`Art 01: ...`)
   - CEFR level chips (`A1 A2 B1 B2 C1 C2`)
   - Monospace telemetry (`CEFR: B2 SỐ TỪ: 286 2.0 MIN @ 140 WPM`)
   - 4-Pass Stepper (`01 ĐỌC LƯỚT -> 02 BỘ KHUNG -> 03 TỪ VỰNG -> 04 TỔNG HỢP`)
   - Pass 1 Cold Read Skim card (`ĐẾM NGƯỢC ĐỌC LƯỚT: 01:00`, `Start 60s Skim`, `Focus Headings`)
   - Reading subtabs (`Reading Text` | `Analysis & Exercises`)
   This pushes the article title and content completely offscreen below the fold on mobile!
2. Streamline & compact this header layout:
   - Combine the CEFR badge, word count, and estimated reading time into a sleek, unified meta strip.
   - For the 4-Pass Stepper: make it a sleek horizontal pill navigation that doesn't consume excessive vertical height.
   - For Pass 1 Skim card: make the countdown timer and "Start 60s Skim" button compact and integrated, so that on mobile (≤768px), **the article title and the opening paragraph are immediately visible above the fold**!
3. Verification:
   Run `cd web; npm test` to ensure 91/91 scripts pass.
4. Write report to `.superpowers/sdd/2026-11-11-four-pillars-perfection-plan/task-3-report.md`.

