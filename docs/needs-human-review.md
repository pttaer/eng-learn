# Human-Thumb Review Items (Real Device Sensory & Ergonomics)

> **Mandate:** Honest division of labor. Things requiring biological human perception, physical thumb comfort, outdoor lighting, or multi-day circadian timing cannot and must not be marked verified by automated sweeps.

---

## 1. Acoustic & Physical Haptics
- **Items:**
  1. Haptic click feedback on AtomicCard flip and option tap (`AcousticHaptics.tap()`, `flip()`).
  2. Tone pleasantness of success chime (`chime()`) vs error nudge (`nudge()`) via Web Audio API through physical phone speakers at 30% and 80% device volume.
- **Verification Steps for Human:**
  1. Open app on phone.
  2. Tap any option in Speed Blitz (`#blitz`) and ensure speaker volume is audible.
  3. Feel if vibration/audio latency is crisp (<50ms) without jarring buzzing or speaker distortion.

---

## 2. One-Handed Thumb Reach & Comfort
- **Items:**
  1. Bottom navigation bar thumb reach across 360 × 800 dp screen.
  2. Top action buttons (e.g. back button on top left, gear on top right) accessibility when holding phone with one hand.
  3. Card-as-Button top-right unbordered chevron tap comfort without thumb hyperextension.
- **Verification Steps for Human:**
  1. Hold phone in single hand (dominant hand).
  2. Navigate through the 5 bottom nav tabs (`#tree`, `#read`, `#blitz`, `#habits`, `#vocab`) using only thumb.
  3. Verify whether thumb can reach main CTAs comfortably without adjusting grip.

---

## 3. High Ambient Light & Direct Sunlight Contrast
- **Items:**
  1. Readability of diacritics in Vietnamese translations under direct sun or outdoor ambient light.
  2. Contrast of subtle elevated surface cards (`rgba(255,255,255,0.03)` or `#182030`) against pitch-dark or bright ambient glare.
- **Verification Steps for Human:**
  1. Step outside or hold phone under bright overhead lighting.
  2. Inspect Reading Lab (`#read`) and Vocabulary Dossier (`#vocab`).
  3. Confirm that dark mode background and subtle borders maintain legible content edges.

---

## 4. Multi-Day Circadian Retention & Notification Timing
- **Items:**
  1. Real-world delivery of exact alarm notifications across sleep/wake cycles over 24–48 hours.
  2. Notification shade action response when phone is locked overnight.
- **Verification Steps for Human:**
  1. Schedule a reminder via Settings (`#settings` -> Notification Diagnostics).
  2. Lock device and verify heads-up banner alerts at the exact expected minute without OS battery-saver killing the alarm.

