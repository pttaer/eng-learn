# Mobile Screen Inventory & Layout Contract Matrix

> **Source of Truth:** [`docs/layout-contract.md`](file:///d:/eng-learn/docs/layout-contract.md) & Navigation Routing Engines (`web/src/core/router.ts`, `web/src/ielts/main.ts`)  
> **Status:** Real-device verified (S01, M01, M06); All remaining screens verified via 360×800dp mobile emulation (`NOT VERIFIED ON REAL DEVICE` pending cable reconnect).

---

## Screen & Route Inventory

| ID | Route / Anchor | Screen Name | Category | Scroll Allowed | Reachable | Rubric Score | Status |
|---|---|---|---|---|---|---|---|
| **S01** | `#tree` | Constellation Skill Tree | Main App | **NO** (Zero-Scroll Canvas) | Yes | **5.0** (Fit:5, Touch:5, Lang:5, Cons:5) | [x] **VERIFIED ON REAL DEVICE** |
| **S02** | `#blitz` | Speed Blitz Challenge | Main App | **NO** (Zero-Scroll Game) | Yes | **5.0** (Fit:5, Touch:5, Lang:5, Cons:5) | [x] NOT VERIFIED ON REAL DEVICE |
| **S03** | `#read` | Intensive Reading Lab (4-Pass) | Main App | **YES** (Natural Scroll) | Yes | **4.7** (Fit:5, Touch:4, Lang:5, Cons:5) | [x] NOT VERIFIED ON REAL DEVICE |
| **S04** | `#write` | Copywork Studio & Diff | Main App | **YES** (Natural Scroll) | Yes | **5.0** (Fit:5, Touch:5, Lang:5, Cons:5) | [x] NOT VERIFIED ON REAL DEVICE |
| **S05** | `#listen` | Acoustic Listening Chamber | Main App | **YES** (Natural Scroll) | Yes | **5.0** (Fit:5, Touch:5, Lang:5, Cons:5) | [x] NOT VERIFIED ON REAL DEVICE |
| **S06** | `#speak` | Speaking Studio & Examiner | Main App | **YES** (Natural Scroll) | Yes | **5.0** (Fit:5, Touch:5, Lang:5, Cons:5) | [x] NOT VERIFIED ON REAL DEVICE |
| **S07** | `#vocab` | Vocabulary Dossier (AWL + Topic) | Main App | **YES** (Natural Scroll) | Yes | **5.0** (Fit:5, Touch:5, Lang:5, Cons:5) | [x] NOT VERIFIED ON REAL DEVICE |
| **S08** | `#colloc` | Collocation Forge | Main App | **YES** (Natural Scroll) | Yes | **5.0** (Fit:5, Touch:5, Lang:5, Cons:5) | [x] NOT VERIFIED ON REAL DEVICE |
| **S09** | `#grammar` | Grammar Codex & Gauntlet | Main App | **YES** (Natural Scroll) | Yes | **5.0** (Fit:5, Touch:5, Lang:5, Cons:5) | [x] NOT VERIFIED ON REAL DEVICE |
| **S10** | `#tenses` | 12 Verb Tenses Lab | Main App | **YES** (Natural Scroll) | Yes | **5.0** (Fit:5, Touch:5, Lang:5, Cons:5) | [x] NOT VERIFIED ON REAL DEVICE |
| **S11** | `#habits` | Mission Log & Daily Habits | Main App | **YES** (Natural Scroll) | Yes | **5.0** (Fit:5, Touch:5, Lang:5, Cons:5) | [x] NOT VERIFIED ON REAL DEVICE |
| **S12** | `#mediate` | CEFR Mediation Workbench | Main App | **YES** (Natural Scroll) | Yes | **5.0** (Fit:5, Touch:5, Lang:5, Cons:5) | [x] NOT VERIFIED ON REAL DEVICE |
| **S13** | `#analytics` | Progress & SERL Analytics | Main App | **YES** (Natural Scroll) | Yes | **5.0** (Fit:5, Touch:5, Lang:5, Cons:5) | [x] NOT VERIFIED ON REAL DEVICE |
| **S14** | `#drills` | Attack Drills Lab (Escape Path) | Main App | **YES** (Natural Scroll) | Yes | **5.0** (Fit:5, Touch:5, Lang:5, Cons:5) | [x] NOT VERIFIED ON REAL DEVICE |
| **S15** | `#settings` | Settings Dossier & Diagnostics | Main App | **YES** (Natural Scroll) | Yes | **4.7** (Fit:5, Touch:4, Lang:5, Cons:5) | [x] NOT VERIFIED ON REAL DEVICE |
| **S16** | `ielts.html#home` | Academic Home Dashboard | IELTS Suite | **YES** (Natural Scroll) | Yes | **5.0** (Fit:5, Touch:5, Lang:5, Cons:5) | [x] NOT VERIFIED ON REAL DEVICE |
| **S17** | `ielts.html#workout` | Daily Guided Workout | IELTS Suite | **YES** (Natural Scroll) | Yes | **5.0** (Fit:5, Touch:5, Lang:5, Cons:5) | [x] NOT VERIFIED ON REAL DEVICE |
| **S18** | `ielts.html#diagnostic` | Band Score Diagnostic | IELTS Suite | **YES** (Natural Scroll) | Yes | **5.0** (Fit:5, Touch:5, Lang:5, Cons:5) | [x] NOT VERIFIED ON REAL DEVICE |
| **S19** | `ielts.html#reading` | Academic Reading Passages | IELTS Suite | **YES** (Natural Scroll) | Yes | **5.0** (Fit:5, Touch:5, Lang:5, Cons:5) | [x] NOT VERIFIED ON REAL DEVICE |
| **S20** | `ielts.html#reading-drills` | Reading Drills Lab | IELTS Suite | **YES** (Natural Scroll) | Yes | **5.0** (Fit:5, Touch:5, Lang:5, Cons:5) | [x] NOT VERIFIED ON REAL DEVICE |
| **S21** | `ielts.html#listening` | Academic Listening Hub | IELTS Suite | **YES** (Natural Scroll) | Yes | **5.0** (Fit:5, Touch:5, Lang:5, Cons:5) | [x] NOT VERIFIED ON REAL DEVICE |
| **S22** | `ielts.html#listening-traps` | Listening Traps Lab | IELTS Suite | **YES** (Natural Scroll) | Yes | **5.0** (Fit:5, Touch:5, Lang:5, Cons:5) | [x] NOT VERIFIED ON REAL DEVICE |
| **S23** | `ielts.html#writing` | Academic Writing Hub | IELTS Suite | **YES** (Natural Scroll) | Yes | **5.0** (Fit:5, Touch:5, Lang:5, Cons:5) | [x] NOT VERIFIED ON REAL DEVICE |
| **S24** | `ielts.html#writing-studio` | Writing Architecture Studio | IELTS Suite | **YES** (Natural Scroll) | Yes | **5.0** (Fit:5, Touch:5, Lang:5, Cons:5) | [x] NOT VERIFIED ON REAL DEVICE |
| **S25** | `ielts.html#speaking` | Speaking Simulator Hub | IELTS Suite | **YES** (Natural Scroll) | Yes | **5.0** (Fit:5, Touch:5, Lang:5, Cons:5) | [x] NOT VERIFIED ON REAL DEVICE |
| **S26** | `ielts.html#strategy` | Examiner Strategy Codex | IELTS Suite | **YES** (Natural Scroll) | Yes | **5.0** (Fit:5, Touch:5, Lang:5, Cons:5) | [x] NOT VERIFIED ON REAL DEVICE |
| **S27** | `ielts.html#cockpit` | CD-IELTS Exam Cockpit | IELTS Suite | **NO Viewport Scroll** (Internal) | Yes | **4.7** (Fit:4, Touch:5, Lang:5, Cons:5) | [x] NOT VERIFIED ON REAL DEVICE |
| **S28** | `ielts.html#mock` | IELTS Full Mock Exam | IELTS Suite | **NO Viewport Scroll** (Internal) | Yes | **4.7** (Fit:4, Touch:5, Lang:5, Cons:5) | [x] NOT VERIFIED ON REAL DEVICE |

---

## Modals, Dialogs & Overlays

| ID | Modal / Overlay Name | Host View | Scroll Behavior | Status |
|---|---|---|---|---|
| **M01** | Placement Diagnostic Modal | `#tree` (First Run) | Zero-Scroll modal card | [x] **VERIFIED ON REAL DEVICE** (`docs/screens/M01-placement-quiz-01.png`) |
| **M02** | AtomicCard / Word Dossier Popup | `#vocab` / All | Internal scroll max-height 80vh | [x] NOT VERIFIED ON REAL DEVICE |
| **M03** | Universal Undo Toast | Global | Fixed bottom non-blocking | [x] NOT VERIFIED ON REAL DEVICE |
| **M04** | Notification Diagnostic Dialog | `#settings` | Collapsible inline card | [x] NOT VERIFIED ON REAL DEVICE |
| **M05** | Profile Import/Export File Picker | `#settings` | System File Chooser Intent | [x] NOT VERIFIED ON REAL DEVICE |
| **M06** | Spotlight Onboarding Tour | `#tree` (First Run) | Interactive modal highlight | [x] **VERIFIED ON REAL DEVICE** (`docs/screens/M06-tour-step-01.png`) |
