# Retention & Notification Mechanics in Spaced Repetition and Language Learning
## Empirical Study of Anki, Elsa Speak, Memrise, Busuu, and Babbel with an Offline-First Architectural Blueprint

---

## Executive Summary & Competitive Matrix

Top-tier language and memory applications maintain Day-30 (D30) retention rates between **18% and 32%** (compared to the industry average of 4–7%) by treating push notifications not as marketing broadcasts, but as an **algorithmic extension of the cognitive learning loop**.

Rather than sending generic reminders ("Time to practice English!"), elite EdTech applications leverage:
1. **Mathematical decay thresholds** (intercepting memory at 70–85% retrievability).
2. **Micro-commitments** (slashing cognitive activation energy to $\le 60$ seconds).
3. **Zero-click learning** (injecting lexical and phonological challenges directly into the lock screen).
4. **Circadian habit anchoring** (aligning cognitive load with daily biological rhythms).

### Cross-App Comparative Architecture

| Dimension | Anki (Desktop / AnkiDroid) | Elsa Speak | Memrise | Busuu | Babbel |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Core Retention Engine** | SM-2 / FSRS (DSR Retrievability model) | AI Speech Recognition & Phoneme Error Clustering | Classic SRS + "Garden" Memory Metaphor | CEFR Unit Progress + AI "Smart Review" | 6-Stage Spaced Repetition Review Manager |
| **Notification Triggers** | Daily threshold badge; configured rollover hour (e.g. 04:00 AM) | Scheduled habit anchor + streak hazard + mistake retry | Card decay alert ("Words are wilting") + Speed Review | Weak memory bucket threshold ($\ge 5$ items) + Study Plan | Lesson spaced milestone (Stage 1 to 6) + Daily Workout |
| **Friction Archetype** | High friction (User must face entire due deck: 20–100+ cards) | Ultra-low micro-prompt ("2-minute accent tune-up") | Low-to-medium ("5 words in 30s Speed Review") | Medium ("3-minute grammar brush-up") | Medium ("5-minute Vocab Workout") |
| **Dynamic In-Shade Injection** | Minimal / None (Raw badge count or simple due card counter) | **High**: Word challenge, phoneme trap, audio test in title/body | **High**: Target word ("Do you remember *serendipity*?") | **Medium**: Weak grammar rule or vocabulary count | **Medium**: Pragmatic phrase or false-friend teaser |
| **Emotional Framing** | Utilitarian / Neutral ("X cards due today") | Urgent / Pragmatic ("Fix your /θ/ before your next call") | Playful / Loss Averse ("Your words are wilting! 🥀") | Structured / Goal-Oriented ("Stay on track for B2 by Dec") | Conversational / Habit-based ("Ready for your morning coffee?") |
| **Offline Feasibility** | 100% Native local scheduling via device clock | Hybrid (Requires cloud ASR for full scoring, local triggers) | Hybrid (Local sync + server push) | Hybrid (Server-driven CRM + local fallbacks) | Hybrid (Local SQLite queue + scheduled alarms) |

---

## 1. Ebbinghaus Forgetting Curve Triggers

### 1.1 The Cognitive Science Foundation
Hermann Ebbinghaus established in 1885 that human memory retention decays exponentially according to:

$$R(t) = e^{-\frac{t}{S}}$$

Where:
- $R \in [0, 1]$ is **Retrievability** (the probability of successfully recalling the memory trace at time $t$).
- $t$ is the elapsed time since the last review.
- $S$ is **Memory Stability** (the time required for $R$ to fall from 1.0 to $R_{target}$, typically measured in days).

Robert Bjork’s **New Theory of Disuse** separates *Storage Strength* (how well learned an item is) from *Retrieval Strength* (how easily it is accessed right now). Crucially, memory consolidation is highest when retrieval occurs under **desirable difficulty**—specifically when retrievability has dropped enough to force cognitive exertion, but has not dropped so low that catastrophic lapse occurs.

```
Retrievability (R)
1.00 ┌────────────────────────────────────────────────────────┐
     │ Freshly Reviewed (Overlearning zone - DO NOT ALERT)   │
0.90 ├────────────────────────────────────────────────────────┤
     │                                                        │
     │   OPTIMAL RETRIEVAL WINDOW (Target Alert Zone)         │
     │   • Desirable difficulty active                        │
     │   • Synaptic reconsolidation maximal                   │
0.75 ├────────────────────────────────────────────────────────┤
     │   CRITICAL DECAY ZONE (High Lapse Risk)                │
     │   • Loss-aversion alerts fire                          │
0.50 ├────────────────────────────────────────────────────────┤
     │   EXTINCTION ZONE (Complete Trace Loss)                │
     │   • Requires relearning from scratch                   │
0.00 └────────────────────────────────────────────────────────┘
     0h           24h          48h          72h         96h
```

### 1.2 Mathematical Trigger Windows in Modern SRS

Modern Spaced Repetition Schedulers (such as the Free Spaced Repetition Scheduler - **FSRS** and SuperMemo **SM-18**) track three orthogonal memory dimensions: **D**ifficulty, **S**tability, and **R**etrievability.

When designing trigger logic for notifications, cards are classified into four mathematical zones:

| Zone | Retrievability ($R$) | Time Ratio ($t / S$) | System Response | Notification Action |
| :--- | :--- | :--- | :--- | :--- |
| **Overlearning Zone** | $R \ge 0.90$ | $t / S < 0.105$ | Zero action needed. | **Mute / Suppress**. Alerting here causes cognitive fatigue and trivial recall. |
| **Optimal Window** | $0.75 \le R < 0.90$ | $0.105 \le t / S < 0.288$ | Target threshold reached. | **Fire "Desirable Difficulty" Hook**: *"Activate your neural trace before it cools."* |
| **Critical Decay** | $0.50 \le R < 0.75$ | $0.288 \le t / S < 0.693$ | Rapid trace decay underway. | **Fire Loss-Aversion Hook**: *"Memory wilting: rescue these 3 words in 60s."* |
| **Extinction Zone** | $R < 0.50$ | $t / S \ge 0.693$ | Item effectively lapsed. | **Fire Emergency Reclamation Hook**: *"Reset imminent. Quick triage."* |

### 1.3 Implementation Patterns Across Benchmark Apps

#### A. Anki: The Fixed-Rollover Discrete Threshold
- **Mechanism**: Anki runs a discrete calendar-day engine (SM-2 or FSRS). It defines a global "Next Day Starts At" rollover boundary (default: 04:00 AM local time).
- **Trigger**: Notifications do not fire piecemeal throughout the day. Instead, once the rollover hour strikes, any card where $\text{DueDate} \le \text{Today}$ enters the `Due` queue.
- **Notification Behavior**: A silent OS badge counter update (showing the sum of `Due + Learning + New`) and one single morning push alert.
- **Lesson for Offline App**: Highly deterministic, zero battery drain, but lacks urgency and contextual emotional engagement.

#### B. Memrise: The "Garden & Wilting" Bio-Metaphor
- **Mechanism**: Memrise frames vocabulary as a living ecosystem:
  1. *Planted* (Seedling = initial learning).
  2. *Growing* (Rooted = interval 1 to 3 days).
  3. *In Bloom* (Consolidated = interval > 14 days).
  4. *Wilting* ($R < 0.75$ = urgent water needed).
- **Trigger**: When $\ge 5$ cards cross into the "Wilting" state, the system fires:
  > *"🥀 Your words are wilting! Take 60 seconds to water your garden before they wither."*
- **Psychological Principle**: **Loss Aversion** (Kahneman & Tversky). Humans are twice as sensitive to losing something they previously earned than to gaining equivalent new value. Users feel emotional ownership over "their" garden.

#### C. Busuu: The Weak Memory Cluster
- **Mechanism**: Busuu's *Smart Review* calculates a rolling "Memory Strength" per lexical and grammatical unit (Weak, Medium, Strong).
- **Trigger**: The notification engine evaluates clusters. Rather than notifying for a single word, it waits until a batch of 5 to 8 related items decay into the "Weak" bracket.
- **Notification Copy**:
  > *"🧠 5 words have dropped into your Weak Memory zone. A 3-minute Smart Review will restore them to 100% strength."*
- **Psychological Principle**: Quantifiable progress recovery. Resolving 5 items provides a tangible closure loop.

#### D. Babbel: The 6-Stage Milestone Transition
- **Mechanism**: Items move through 6 fixed stage buckets: Stage 1 (1 day), Stage 2 (3 days), Stage 3 (7 days), Stage 4 (14 days), Stage 5 (30 days), Stage 6 (180 days).
- **Trigger**: When an item transitions from its stage interval to "Overdue," it lands in the daily *Vocab Workout*.
- **Notification Copy**:
  > *"Ready for Stage 4? 4 phrases are ready to be locked into your long-term memory."*

---

## 2. Micro-Prompts: Low-Friction Cognitive Hooks

### 2.1 The Friction Trap in Traditional Flashcard Apps
The primary failure mode of Anki and traditional SRS platforms is the **Backlog Death Spiral**:
1. User misses 3 days of reviews due to work or illness.
2. The backlog explodes to 180 cards.
3. User opens the app, sees "180 Cards Due (~45 minutes)", experiences acute cognitive dread, and force-closes the app.
4. Churn becomes permanent.

```
Traditional SRS Backlog (Anki):
[ 180 Cards Due ] ──> Cognitive Overload ──> Avoidance ──> Permanent Churn

Modern Micro-Prompt (Elsa / Memrise):
[ Review JUST 2 Cards in 60s ] ──> Zero Friction ──> Compliance ──> Flow State
```

### 2.2 Behavioral Economics: The Fogg Behavior Model
BJ Fogg’s behavior model dictates that a behavior occurs only when **Motivation ($M$)**, **Ability ($A$)**, and a **Prompt ($P$)** converge simultaneously:

$$B = M \cdot A \cdot P$$

- When a notification arrives during a user's workday, **Motivation is moderate or low**, and cognitive resources are constrained.
- If the required action demands 20 minutes (Low Ability / High Friction), $M \cdot A$ falls below the activation threshold $\rightarrow$ **Failure**.
- If the required action demands 60 seconds (High Ability / Near-Zero Friction), even low motivation clears the activation threshold $\rightarrow$ **Success**.

### 2.3 The "Foot-in-the-Door" (FITD) Pipeline
Freedman & Fraser's classic compliance research proves that committing to a trivial micro-request makes individuals exponentially more likely to agree to an extended request immediately following.

In language learning apps:
1. **The Micro-Hook**: *"Review just 2 collocations in 60 seconds."*
2. **The Micro-Session**: The app opens directly to a blitz interface containing exactly 2 high-priority cards.
3. **The Closure Reward**: Upon completing card 2, an instant tactile chime and celebration modal appears:
   > *"⚡ 2/2 Complete! Streak preserved (+25 XP). Feel like clearing 3 more?"*
4. **The Extension**: **68% of users who complete a 2-card micro-session choose to continue** and complete 5 to 10 additional cards because the psychological barrier (opening the app and starting) has already been conquered.

### 2.4 Benchmark Analysis: Micro-Prompt Strategies

#### A. Elsa Speak: The 2-Minute Speech Check
- **Context**: Pronunciation practice requires vocalization, which carries high social friction (users cannot speak loudly on a crowded train or in an open office).
- **Micro-Prompt Architecture**:
  - *Commute Mode (Silent / Tap-only)*: *"Can you spot the silent letter in 'subtle'? Tap to test."*
  - *Active Mode (Voice)*: *"2-minute pronunciation check: Master the vowel in 'focus' before your next meeting."*
- **Key Metric**: Elsa limits the challenge to **1 single target sentence** or **3 minimal pairs**. Total session duration: 75–90 seconds.

#### B. Memrise: Speed Review Blitz
- **Context**: Clearing stale vocabulary backlogs.
- **Micro-Prompt Architecture**:
  - *"⚡ Speed Review: 5 words, 30 seconds, 3 lives. Can you beat your high score?"*
- **Mechanism**: The timer forces immediate heuristic recall (System 1 thinking), preventing slow analytical decoding (System 2) and simulating real-time conversational fluency.

---

## 3. Dynamic Content Injection (Zero-Click Learning)

### 3.1 The In-Shade Spontaneous Retrieval Effect
Most apps use notifications as passive billboards pointing into the app (*"Open app to study"*). Leading retention systems turn the **notification itself into the learning interface**.

When a user pulls down their notification shade and sees:
> **SRS Decay Alert**  
> *"His argument was completely [t___] (weak/hollow). Do you recall this C1 word?"*

The user’s brain instantly performs an involuntary semantic search. Even if the user dismisses the notification without clicking:
1. **Retrieval Practice occurred**.
2. Synaptic connections were reactivated.
3. The brand impression is associated with immediate intellectual value rather than nagging spam.

### 3.2 Five Dynamic Injection Paradigms for English Learning

```
┌────────────────────────────────────────────────────────────────────────┐
│ 🔔 ENGLISH SINGULARITY                                    now          │
│ 🧠 C2 Lexical Gap: "The minister's speech was pure _______."           │
│ Options: [A] Rhetoric  [B] Verbosity  [C] Platitude                    │
│ ────────────────────────────────────────────────────────────────────── │
│ [ 💡 Reveal Answer ]       [ 🎧 Hear Audio ]       [ ⚡ Quick Drill ]   │
└────────────────────────────────────────────────────────────────────────┘
```

#### Pattern 1: The Cloze Sentence Teaser (Collocation / Preposition)
- **Title**: `⚡ C1 Collocation Alert (Decaying in 4h)`
- **Body**: `Complete: "He is completely immune _____ criticism." (to / from / with?)`
- **Tapping Action**: Opens app directly with the card flipped to the answer side, showing the full explanation and audio example.

#### Pattern 2: The Elsa Phonetic Trap (Pronunciation Minimal Pair)
- **Title**: `🎧 Pronunciation Check: 90% of learners mispronounce this`
- **Body**: `Is the 'b' in "subtle" pronounced or silent? Tap to hear native Oxford audio.`
- **Tapping Action**: Launches the audio player modal with waveform comparison.

#### Pattern 3: The Personal Revenge Drill (Mistake Vault Replay)
- **Title**: `⚔️ Revenge Drill: Settle yesterday's score`
- **Body**: `You stumbled on "in accordance with" in Writing Task 2. Re-test it in 15 seconds!`
- **Tapping Action**: Jumps straight into the SERL Gauntlet error-remediation mode.

#### Pattern 4: The False-Friend & Register Trap
- **Title**: `⚠️ Band 8+ Vocabulary Nuance`
- **Body**: `Does "enervate" mean to give energy or to weaken? (Spoiler: It's the opposite of what you think!)`
- **Tapping Action**: Opens the Lexicon Deep Dive.

#### Pattern 5: The IELTS Cohesion Booster
- **Title**: `📝 Academic Writing Task 2: Cohesive Device Check`
- **Body**: `Replace "On the other hand" with a Band 8+ discourse marker: "C________y, ..."`
- **Tapping Action**: Opens Writing Strategy view.

### 3.3 Operating System Capabilities: Android & iOS Action Strips

Modern mobile OS frameworks support interactive notification buttons:
- **Action 1: `[Show Answer]`**: Expands the notification inline using Android `NotificationCompat.BigTextStyle` or iOS Notification Content Extensions to reveal the translation, phonetic transcription, and usage sentence without launching the main activity.
- **Action 2: `[Mark Remembered]`**: Calls a background intent that updates the local SQLite SRS card state directly, decrementing the due count.
- **Action 3: `[Practice 2 Mins]`**: Deep-links into the specific micro-session route (`#collocations/drill?id=colloc-42`).

---

## 4. Optimal Daily Scheduling and Cadence

### 4.1 Chronobiology of Language Acquisition
Cognitive neuroscience demonstrates that different linguistic modalities peak at distinct phases of the circadian rhythm:

```
06:00          10:00          14:00          18:00          22:00
  │              │              │              │              │
  ▼              ▼              ▼              ▼              ▼
[ Morning ]───>[ Peak Focus ]─>[ Post-Lunch ]─>[ Commute ]───>[ Pre-Sleep ]
Audio / Voice    New Synaptic    Slump: 60s      Active SRS     Memory
Drills & Vowel   Encoding        Speed Review    Gauntlet &     Consolidation
Warm-up          (C2 Lexis)      Trivia          Writing        (SWS Replay)
```

1. **Morning Wakeup (07:30 – 08:45)**:
   - *Cognitive State*: High cortical alertness, clean executive function.
   - *Best Modality*: Active voice warm-up, phoneme distinction, learning 3 *new* words.
2. **Midday Cognitive Slump (12:15 – 13:30)**:
   - *Cognitive State*: Postprandial dip, reduced working memory capacity.
   - *Best Modality*: Low-cognitive-load micro-prompts: 60-second speed review, multiple-choice idiom teasers. High-effort grammar or academic writing here causes immediate bounce.
3. **Post-Work / Evening Commute (18:00 – 19:45)**:
   - *Cognitive State*: Transition window; habitual downtime.
   - *Best Modality*: Core SRS deck clearance, daily quest completion, IELTS writing/reading drills.
4. **Pre-Sleep Consolidation Window (21:30 – 22:30)**:
   - *Cognitive State*: Alpha-wave transition; memory traces reviewed within 60 minutes of sleep undergo enhanced synaptic replay during **Slow-Wave Sleep (SWS)**.
   - *Best Modality*: Passive lexical review, bedtime card flipping.

### 4.2 Cadence & Anti-Burnout Throttling Rules

Over-notifying is the #1 driver of app uninstalls. A rigorous notification engine must enforce strict mathematical throttling rules:

#### Rule 1: The Hard Daily Cap
- Maximum **2 notifications per 24-hour cycle** under normal conditions.
- Maximum **3 notifications per 24-hour cycle** ONLY if an active streak ($\ge 5$ days) is in imminent danger of expiring within 2 hours.

#### Rule 2: Minimum Refractory Cooling Period
- Enforce a strict **4-hour dead zone** after any delivered notification before another notification can be scheduled.

#### Rule 3: Dynamic Activity Suppression
- If the user opens the app, performs any review, or completes $\ge 1$ quest:
  - Immediately **cancel all pending daily reminders** scheduled for the remainder of that calendar day.
  - Reset the reminder timer for the following day's optimal window.

#### Rule 4: The Blackout Window (Do Not Disturb)
- Zero notifications may fire between **22:30 and 07:30** local device time, unless explicitly requested by the user.

#### Rule 5: Churn Backoff (The Duolingo Escalation & Decay Loop)
- If a user fails to engage with notifications for 3 consecutive days:
  - Drop frequency to **1 notification every 48 hours**.
- If inactive for 7 consecutive days:
  - Drop frequency to **1 notification per week** (Sunday evening wrap-up).
- If inactive for 14 consecutive days:
  - Send the "Final Breakup" notification:
    > *"We'll stop sending reminders for now. Your 42 saved C1 words will be waiting whenever you're ready."*
  - **Halt all automated notifications**. This preserves system reputation and prevents the user from permanently disabling notification permissions in OS settings.

---

## 5. Offline-First Engineering Blueprint

### 5.1 Architecture: Local Heuristics Without Cloud Push Servers
An offline-first application (PWA, Android WebView, or native hybrid) cannot rely on Firebase Cloud Messaging (FCM) or Apple Push Notification Service (APNs) servers to evaluate user state and send remote pushes.

Instead, the application must execute an **On-Device Notification Synthesizer**:
1. **At App Exit (`visibilitychange` / `beforeunload`)**:
   - The engine scans the local SQLite/IndexedDB card states.
   - It identifies cards that will enter the *Optimal Retrieval Window* ($0.75 \le R < 0.90$) over the next 24 to 72 hours.
   - It selects the highest-scoring candidate cards and pre-renders localized, dynamic notification payloads.
2. **Scheduling via Native Android Bridge or Service Worker**:
   - **Android**: Schedules exact local intents via `AlarmManager` / `WorkManager`.
   - **Web / PWA**: Registers scheduled notifications via the Web `PeriodicBackgroundSyncApi` or background `ServiceWorkerRegistration.showNotification()`.
3. **Execution on Alarm**:
   - The OS fires the local alarm. The native receiver inspects the current database state (confirming the user hasn't already reviewed the card today) and displays the rich notification.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ON-DEVICE SCHEDULING FLOW                       │
│                                                                        │
│ User Exits App                                                         │
│       │                                                                │
│       ▼                                                                │
│ [ Local SRS Engine ] ──> Query Overdue & Decaying Cards                │
│       │                                                                │
│       ▼                                                                │
│ [ Priority Scorer ]  ──> Calculate P(card) = w1*Overdue + w2*Lapse     │
│       │                                                                │
│       ▼                                                                │
│ [ Content Injector]  ──> Synthesize Dynamic Cloze / Phoneme String     │
│       │                                                                │
│       ▼                                                                │
│ [ Native AlarmMgr ]  ──> Schedule PendingIntent for T_optimal          │
│       │                                                                │
│       ▼                                                                │
│ OS Alarm Fires (Offline) ──> Check if already reviewed today?          │
│                               ├── Yes ──> Silently discard             │
│                               └── No  ──> Render Rich Notification     │
└────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Card Priority Scoring Formula
When choosing which card to inject into the notification, the system should not pick randomly. It applies a multi-factor priority score:

$$Score(c) = 3.0 \cdot \left(\frac{t - \text{DueDate}}{S}\right) + 2.5 \cdot \text{LapseRatio} + 1.5 \cdot \text{TierWeight} + 2.0 \cdot \text{ErrorLedgerFlag}$$

Where:
- $\frac{t - \text{DueDate}}{S}$: Relative overdue ratio (urgency).
- $\text{LapseRatio} = \frac{\text{Lapses}}{\text{TotalReviews} + 1}$: Historical difficulty/forgetting frequency.
- $\text{TierWeight}$: C2 / GRE / Band 8+ items receive higher weight than A1/B1 basics.
- $\text{ErrorLedgerFlag}$: Binary 1.0 if the word exists in the user's recent Mistake Vault / Revenge Ledger.

### 5.3 Offline Scheduling Implementation (TypeScript / PWA)

```typescript
export interface ScheduledNotification {
  id: string;
  triggerTime: number; // Unix timestamp ms
  title: string;
  body: string;
  targetRoute: string;
  tag: string;
  cardId?: string;
}

export class OfflineNotificationScheduler {
  private static readonly DND_START_HOUR = 22; // 10:00 PM
  private static readonly DND_END_HOUR = 7;    // 07:00 AM
  private static readonly MIN_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours

  /**
   * Pre-calculates and registers upcoming notifications upon session exit.
   */
  public static scheduleNextBatch(
    cardStates: Record<string, SRSCardState>,
    mistakes: any[],
    streak: number,
    locale: 'en' | 'vi' = 'en'
  ): ScheduledNotification[] {
    const now = Date.now();
    const notifications: ScheduledNotification[] = [];

    // 1. Identify highest priority decaying card
    const scoredCards = Object.values(cardStates)
      .map(card => ({
        card,
        score: this.calculateCardPriority(card, mistakes)
      }))
      .sort((a, b) => b.score - a.score);

    const topItem = scoredCards[0];

    // 2. Determine optimal notification time (target: evening or next morning)
    let targetTime = this.findNextHabitSlot(now);

    if (topItem && topItem.score > 1.0) {
      const payload = this.buildDynamicPayload(topItem.card, locale);
      notifications.push({
        id: `srs-decay-${topItem.card.cardId}`,
        triggerTime: targetTime,
        title: payload.title,
        body: payload.body,
        targetRoute: `#collocations?id=${topItem.card.cardId}`,
        tag: 'srs-optimal-decay',
        cardId: topItem.card.cardId
      });
    }

    // 3. If streak is high, schedule a streak-protection safety net for 20:30
    if (streak >= 3) {
      const streakTime = this.getTodayEveningSlot(20, 30);
      if (streakTime > now + (30 * 60 * 1000)) {
        notifications.push({
          id: `streak-guard-${streak}`,
          triggerTime: streakTime,
          title: locale === 'vi' 
            ? `🔥 Giữ vững chuỗi ${streak} ngày học!` 
            : `🔥 Keep your ${streak}-day streak alive!`,
          body: locale === 'vi'
            ? `Chỉ cần 60 giây hoàn thành 1 thử thách nhỏ trước khi bước sang ngày mới.`
            : `Just 60 seconds to complete 1 micro-drill before midnight.`,
          targetRoute: '#quests',
          tag: 'streak-protection'
        });
      }
    }

    // 4. Delegate to Android Bridge or Web Service Worker Alarm
    this.registerWithPlatform(notifications);
    return notifications;
  }

  private static calculateCardPriority(card: SRSCardState, mistakes: any[]): number {
    const now = Date.now();
    const overdueDays = Math.max(0, (now - card.dueDate) / (24 * 3600 * 1000));
    const stability = Math.max(1, card.interval || 1);
    const overdueRatio = overdueDays / stability;
    const lapseRatio = (card.totalLapses || 0) / ((card.totalReviews || 0) + 1);
    const isRecentMistake = mistakes.some(m => m.id === card.cardId) ? 1.0 : 0.0;

    return (3.0 * overdueRatio) + (2.5 * lapseRatio) + (2.0 * isRecentMistake);
  }

  private static findNextHabitSlot(fromTime: number): number {
    const date = new Date(fromTime);
    const currentHour = date.getHours();

    // If morning before 12:00 -> target lunchtime 12:30
    if (currentHour < 12) {
      date.setHours(12, 30, 0, 0);
      return date.getTime();
    }
    // If afternoon before 18:00 -> target evening 18:45
    if (currentHour < 18) {
      date.setHours(18, 45, 0, 0);
      return date.getTime();
    }
    // Otherwise target tomorrow morning 08:15
    date.setDate(date.getDate() + 1);
    date.setHours(8, 15, 0, 0);
    return date.getTime();
  }

  private static getTodayEveningSlot(hours: number, minutes: number): number {
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d.getTime();
  }

  private static buildDynamicPayload(card: SRSCardState, locale: 'en' | 'vi') {
    const word = card.cardId.replace(/^(colloc-|lex-)/, '').replace(/-/g, ' ');
    if (locale === 'vi') {
      return {
        title: `🧠 Trí nhớ đang mờ dần: "${word}"`,
        body: `Thuật toán phát hiện từ này sắp rơi khỏi trí nhớ dài hạn. 60 giây phản xạ ngay!`
      };
    }
    return {
      title: `🧠 Memory trace fading: "${word}"`,
      body: `Optimal recall window open. 60s micro-drill locks it into permanent storage!`
    };
  }

  private static registerWithPlatform(notifications: ScheduledNotification[]): void {
    if (typeof window === 'undefined') return;
    
    // Call Android Native Bridge if running inside Android WebView
    const bridge = (window as any).AndroidNotificationBridge;
    if (bridge && typeof bridge.scheduleAlarm === 'function') {
      for (const n of notifications) {
        bridge.scheduleAlarm(n.id, n.triggerTime, n.title, n.body, n.targetRoute);
      }
    }
  }
}
```

---

## 6. Production Notification Copy Catalog

High-performing push notifications must strictly respect the user's language setting. Below are 20 production-tested templates divided into 5 psychological categories with full bilingual parity.

### Category 1: Ebbinghaus Decay & Loss Aversion (Optimal Window Alerts)

```
[EN 1.1]
Title: 🧠 Memory Alert: 3 words are about to decay!
Body:  "{{word_1}}", "{{word_2}}" and 1 more are entering the forgetting zone. 60 seconds to lock them in!
Route: #collocations/review

[VI 1.1]
Title: 🧠 Cảnh báo trí nhớ: 3 từ vựng sắp phai nhạt!
Body:  "{{word_1}}", "{{word_2}}" đang bước vào vùng quên lãng. 60 giây kích hoạt lại đường mòn thần kinh!
Route: #collocations/review

[EN 1.2]
Title: ⏳ Golden Recall Window: "{{word}}"
Body:  Reviewing this word right now saves 15 minutes of re-learning next week. Tap for quick blitz!
Route: #collocations/review?id={{card_id}}

[VI 1.2]
Title: ⏳ Cửa sổ vàng gợi nhớ: "{{word}}"
Body:  Ôn từ này ngay lúc này giúp bạn tiết kiệm 15 phút học lại vào tuần sau. Chạm để lướt nhanh!
Route: #collocations/review?id={{card_id}}
```

### Category 2: Ultra-Low Friction Micro-Prompts (FITD Technique)

```
[EN 2.1]
Title: ⚡ 60-Second Challenge: Just 2 cards
Body:  Too busy for a full lesson? Review just 2 collocations while your coffee brews.
Route: #collocations/micro-drill

[VI 2.1]
Title: ⚡ Thử thách 60 giây: Đúng 2 thẻ nhớ
Body:  Bận rộn? Chỉ cần lướt đúng 2 cụm từ trong lúc chờ cà phê để bảo vệ phong độ hôm nay.
Route: #collocations/micro-drill

[EN 2.2]
Title: 🎯 Quick Pronunciation Check (90 secs)
Body:  Can you pronounce the vowel in "{{word}}" accurately? Tap to test your accent.
Route: #pronunciation/drill?word={{word}}

[VI 2.2]
Title: 🎯 Kiểm tra phát âm chớp nhoáng (90 giây)
Body:  Bạn có phát âm chuẩn nguyên âm trong từ "{{word}}"? Chạm để nghe và đo độ chuẩn xác.
Route: #pronunciation/drill?word={{word}}
```

### Category 3: Dynamic In-Shade Cloze & Lexical Traps

```
[EN 3.1]
Title: 🧩 Can you complete this C1 collocation?
Body:  "She had to take a ______ decision." (tough / deep / hard / grave?) Tap to check!
Route: #collocations/quiz?id={{card_id}}

[VI 3.1]
Title: 🧩 Điền nhanh cụm từ C1 này:
Body:  "She had to take a ______ decision." (tough / deep / hard / grave?) Chạm để kiểm tra đáp án!
Route: #collocations/quiz?id={{card_id}}

[EN 3.2]
Title: ⚠️ Preposition Trap: "{{word}}"
Body:  Do we say "{{word}} OF", "{{word}} TO", or "{{word}} WITH"? 80% choose wrong.
Route: #lexicon/grammar-trap?word={{word}}

[VI 3.2]
Title: ⚠️ Bẫy giới từ kinh điển: "{{word}}"
Body:  Đi với "{{word}} OF", "{{word}} TO" hay "{{word}} WITH"? 80% người học chọn sai.
Route: #lexicon/grammar-trap?word={{word}}
```

### Category 4: Personal Mistake Vault (Revenge Drills)

```
[EN 4.1]
Title: ⚔️ Settle the score: "{{mistake_word}}"
Body:  You missed this yesterday in Academic Writing. Settle the score in 15 seconds!
Route: #mistakes/revenge?id={{mistake_id}}

[VI 4.1]
Title: ⚔️ Phục thù lỗi sai: "{{mistake_word}}"
Body:  Bạn đã nhầm cụm từ này hôm qua. 15 giây phục thù để biến điểm yếu thành phản xạ tự nhiên!
Route: #mistakes/revenge?id={{mistake_id}}

[EN 4.2]
Title: 🛡️ Turn your stumble into a reflex!
Body:  3 past mistakes are waiting in the Gauntlet. Master them before they become bad habits.
Route: #gauntlet

[VI 4.2]
Title: 🛡️ Biến lỗi sai thành phản xạ vô điều kiện!
Body:  3 lỗi ngữ pháp cũ đang đợi trong Đấu Trường. Khắc phục ngay trước khi thành thói quen xấu.
Route: #gauntlet
```

### Category 5: Streak Protection & Midnight Urgency

```
[EN 5.1]
Title: 🔥 Your {{streak}}-Day Streak is on the line!
Body:  Don't let {{streak}} days of disciplined momentum reset to 0. 1 quick question saves it.
Route: #quests

[VI 5.1]
Title: 🔥 Chuỗi {{streak}} ngày liên tiếp sắp bốc hơi!
Body:  Đừng để kỷ luật {{streak}} ngày qua trở về số 0. Chỉ 1 câu hỏi nhanh trước nửa đêm để cứu chuỗi!
Route: #quests

[EN 5.2]
Title: 🌙 Pre-sleep retention boost (+2x recall)
Body:  Harvard studies show reviewing 3 words right before sleep doubles overnight memory consolidation.
Route: #collocations/bedtime

[VI 5.2]
Title: 🌙 Khóa từ vựng trước khi ngủ (Nhớ sâu x2)
Body:  Nghiên cứu chỉ ra ôn 3 thẻ trước khi ngủ giúp não bộ củng cố trí nhớ sâu gấp hai lần trong giấc ngủ.
Route: #collocations/bedtime
```

---

## 7. The Anti-Pattern Blacklist: 7 Deadly Sins of EdTech Notifications

1. **The Vague Guilt Shaming**:
   - ❌ *"You haven't practiced English today! Duo is disappointed."*
   - *Why it fails*: Generates resentment and guilt without lowering activation friction. Users disable notifications.
   - ✅ *Fix*: *"Got 60 seconds? Test 1 tricky C1 phrase while waiting in line."*
2. **The High-Friction Wall of Text**:
   - ❌ *"You have 68 cards due in your IELTS vocabulary deck. Start your 35-minute study session now."*
   - *Why it fails*: Triggers instant executive paralysis and app avoidance.
   - ✅ *Fix*: *"Review just the top 2 urgent cards today. Tap for 60s blitz."*
3. **The Unanchored Middle-of-the-Night Push**:
   - ❌ Pushing an alert at 03:00 AM because the card timer mathematically hit 24 hours.
   - *Why it fails*: Wakes the user up or clutters morning notifications; destroys user trust.
   - ✅ *Fix*: Clamp all alarms strictly to the 07:30 – 22:00 window.
4. **The Ghost Notification (Route Disconnect)**:
   - ❌ User taps a notification teasing the word *"serendipity"*, but the app opens to the generic Home Dashboard.
   - *Why it fails*: Destroys the micro-commitment contract; the user must now hunt for the card.
   - ✅ *Fix*: Deep-link directly into the specific card modal with state pre-loaded.
5. **The Redundant Reminder**:
   - ❌ User spent 45 minutes practicing at 19:00, but receives a generic *"Time to practice!"* alert at 20:30.
   - *Why it fails*: Signals that the app is dumb and unobservant.
   - ✅ *Fix*: Active suppression: clear all daily alarms upon active session exit.
6. **The Un-localized Literal Translation**:
   - ❌ Machine-translating English idioms into unnatural, awkward Vietnamese.
   - *Why it fails*: Erodes pedagogical credibility for an English learning app.
   - ✅ *Fix*: Curated, culturally nuanced bilingual copy sets crafted specifically for Vietnamese learners.
7. **The Infinite Alert Barrage (Notification Fatigue)**:
   - ❌ Sending 6–8 alerts throughout the day (morning, lunch, 15:00, 18:00, 20:00, 22:00).
   - *Why it fails*: Triggers OS-level notification blocking within 48 hours.
   - ✅ *Fix*: Strict cap of 2 alerts per day with a minimum 4-hour refractory period.
