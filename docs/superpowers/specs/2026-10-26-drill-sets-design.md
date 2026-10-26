# Drill Sets: Cambridge-style and BC-style practice (design)

Date: 2026-10-26. Source briefs: `docs/CAMBRIDGE_PROFICIENT_ACTIVITIES.md`, `docs/BRITISH_COUNCIL_FREE_RESOURCES_ANALYSIS_AND_APP_INTEGRATION.md`.

## Decisions

- **Original content only.** Activity types and learning objectives are taken from the briefs. Every item text is written fresh. No Cambridge or British Council wording is copied.
- **One new route, `drills`.** It hosts three tabs: Drills (36 sets), Sounds (phonemic chart), Email (business email builder). Route wiring follows the existing pattern in `router.ts`, `main.ts`, `header-hud.ts`, `corner-compass.ts`.
- **Content lives outside the compiler.** Sets are in `web/src/assets/data/drill-sets.json`. `compile-content.cjs` does not write this file.
- **Speech is browser TTS only.** Items carry `speak` text. No audio files. Phonemes are shown with example words; the browser cannot reliably voice isolated phonemes.
- **Blitz gets a grammar source.** Two-option grammar items feed the existing two-choice blitz.
- **IELTS Task 1 annotator** links model-essay sentences to chart labels and values. It is on the IELTS side (`ielts.html`) and Academic only.

## Item schema (`drill-sets.json`)

```json
{
  "version": 1,
  "sets": [
    {
      "id": "ex-ellipsis",
      "title": "Ellipsis in speech",
      "skill": "grammar",
      "cefrLevel": "C1",
      "minutes": 3,
      "objective": "Spot the word class that has been left out",
      "passage": "optional, reading and writing sets only",
      "items": [ ]
    }
  ]
}
```

- `skill`: `grammar` | `vocabulary` | `listening` | `pronunciation` | `reading` | `writing`
- `cefrLevel`: `C1` | `C2`
- `items`: 4 to 5 per set. Mix at least two item types per set.

Every item has `id`, `type`, `why` (20 to 240 characters, states the evidence), and optional `speak` (text for browser TTS).

| type | fields | correct when |
|---|---|---|
| `choice` | `prompt`, `options` (2 to 4), `answer` (index) | chosen index equals `answer` |
| `gap` | `prompt` containing `___`, `answers` (accepted strings) | typed text equals one accepted string, case and surrounding spaces ignored |
| `truefalse` | `statement`, `answer` (boolean) | boolean chosen equals `answer` |
| `match` | `pairs` (2 to 4 of `{left, right}`) | every left matched to its right |
| `stress` | `word`, `options` (2 to 4 patterns of `O` and `o`), `answer` (index) | chosen pattern equals `answer` |

## Rules enforced by `web/scripts/verify-drill-sets.cjs`

- Unique set and item ids. Every item has a non-empty `why`.
- `choice` and `stress`: `answer` is a valid index.
- No set where every answer index is the same (answer position balance).
- Text is British spelling. No profanity, alcohol, drugs or sexual terms (same banned list as `verify-learning-materials-safety.cjs`).

## Host mapping (as built)

| part | where it appears |
|---|---|
| 36 sets, all six skills | `drills` route, Drills tab, filtered by skill chip |
| Listen along | Drills tab, sets with `speak` text: items spoken in order, active item highlighted |
| Sounds | `drills` route, Sounds tab: 44 RP phonemes, example words read aloud |
| Email | `drills` route, Email tab: scenario, tone slider, phrase tiles, draft |
| IELTS Task 1 link | `ielts.html` Writing, after Submit: model sentences dim chart marks they do not mention |

Also: `accent` on an item picks the US or UK browser voice; answer indices within a set are spread (rotation), so no set has every answer at one index.

## Out of scope / deferred

- Blitz grammar source: not built. Blitz is two-option, so it needs authored two-option grammar items.
- Word-level sync: not built. Sync is item-level.
- Multi-user storage: none. Sets are not persisted between sessions.
- Phoneme audio: not built. Browser TTS cannot voice isolated phonemes, so the chart speaks example words.
