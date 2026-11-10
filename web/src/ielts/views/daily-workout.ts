import { h, esc } from '../ui';
import { icon } from '../../utils/icons';
import { t } from '../../core/i18n';
import { AudioSynthesizer } from '../../core/audio-synthesizer';
import { HapticEngine } from '../../core/haptic-engine';
import { StorageManager } from '../../utils/storage';
import { DailyWorkoutStorage } from '../daily-workout/storage';
import { generateDailyWorkout } from '../daily-workout/generator';
import { DailyWorkoutSession, TimeBudgetMinutes, DailyWorkoutStep } from '../daily-workout/types';
import { SRSEngine, SRSCardState } from '../../core/srs-engine';
import { illustration } from '../../utils/illustrations';

const VOCAB_KEY = 'IELTS_VOCAB_SRS';

function loadVocabStates(): Record<string, SRSCardState> {
  try {
    return JSON.parse(localStorage.getItem(VOCAB_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

function saveVocabStates(states: Record<string, SRSCardState>): void {
  try {
    localStorage.setItem(VOCAB_KEY, JSON.stringify(states));
  } catch {
    /* storage full */
  }
}

export function workoutView(root: HTMLElement): () => void {
  let timeBudget = StorageManager.getDailyTimeBudget() as TimeBudgetMinutes;
  if (![15, 30, 45, 60].includes(timeBudget)) timeBudget = 30;

  const todayKey = DailyWorkoutStorage.getTodayDateKey();
  const progressState = DailyWorkoutStorage.loadWorkoutState(todayKey);
  progressState.timeBudget = timeBudget;

  let session: DailyWorkoutSession = generateDailyWorkout({
    dateKey: todayKey,
    timeBudget,
    srsStates: loadVocabStates(),
    starredTopics: StorageManager.getStarredVocabTopics(),
    targetBand: StorageManager.getTargetBand()
  });

  // Active step index pointer (first incomplete step or completed screen)
  let activeStepIndex = session.steps.findIndex(s => !progressState.completedStepIndexes.includes(s.index));
  if (activeStepIndex === -1 && progressState.completed) {
    activeStepIndex = 4; // Celebration state
  } else if (activeStepIndex === -1) {
    activeStepIndex = 0;
  }

  const container = h('div', 'ie-workout-container');
  root.innerHTML = '';
  root.append(container);

  function advanceStep(): void {
    AudioSynthesizer.play('chime');
    HapticEngine.trigger('success');
    activeStepIndex += 1;
    render();
  }

  // Step 1: Vocab SRS Exercise Runner
  function renderVocabExercise(card: HTMLElement, step: DailyWorkoutStep): void {
    const cards = step.data.vocabCards || [];
    let currentIdx = 0;
    const vocabStates = loadVocabStates();

    const stage = h('div', 'ie-vocab-workout-stage');

    function showCard(): void {
      stage.innerHTML = '';
      if (currentIdx >= cards.length) {
        DailyWorkoutStorage.markStepComplete(todayKey, step.index, {
          stepIndex: step.index,
          type: 'vocab',
          completedAt: Date.now()
        });
        advanceStep();
        return;
      }

      const item = cards[currentIdx];

      const vBox = h('div', 'ie-phrasebank-cloze-box');
      vBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--accent-cyan);">${esc(item.topic.toUpperCase())}</span>
          <span style="font-size: 11px; color: var(--ink-secondary);">${currentIdx + 1} / ${cards.length}</span>
        </div>
        <div style="font-size: 20px; font-weight: 800; color: var(--ink-primary); margin-bottom: 4px;">${esc(item.word)}</div>
        <div id="vocab-reveal-area" style="display: none; margin-top: 12px; border-top: 1px solid var(--border-hairline); padding-top: 10px;">
          <div style="font-size: 14px; margin-bottom: 6px;"><b>${t('ielts.definition_label', undefined, 'Definition:')}</b> ${esc(item.definition)}</div>
          ${item.vietnamese ? `<div style="font-size: 13px; color: var(--ink-secondary); margin-bottom: 6px;"><b>${t('ielts.vn_label', undefined, 'VN:')}</b> ${esc(item.vietnamese)}</div>` : ''}
          <div style="font-size: 13px; font-style: italic; color: var(--ink-secondary);">"${esc(item.example)}"</div>
        </div>
      `;

      const actionsRow = h('div', 'ie-vocab-actions', '');
      actionsRow.style.display = 'flex';
      actionsRow.style.gap = '8px';
      actionsRow.style.marginTop = '12px';

      const flipBtn = h('button', 'ie-btn ie-btn-secondary') as HTMLButtonElement;
      flipBtn.textContent = t('ielts.flip_reveal', undefined, 'Flip Reveal (Space)');
      flipBtn.style.flex = '1';
      flipBtn.style.minHeight = '44px';
      flipBtn.style.borderRadius = 'var(--radius-btn, 10px)';

      const againBtn = h('button', 'ie-btn ie-btn-danger') as HTMLButtonElement;
      againBtn.textContent = t('ielts.again', undefined, 'Again (1)');
      againBtn.style.flex = '1';
      againBtn.style.display = 'none';
      againBtn.style.minHeight = '44px';
      againBtn.style.borderRadius = 'var(--radius-btn, 10px)';

      const goodBtn = h('button', 'ie-btn ie-btn-primary') as HTMLButtonElement;
      goodBtn.textContent = t('ielts.good', undefined, 'Good (2)');
      goodBtn.style.flex = '1';
      goodBtn.style.display = 'none';
      goodBtn.style.minHeight = '44px';
      goodBtn.style.borderRadius = 'var(--radius-btn, 10px)';

      flipBtn.addEventListener('click', () => {
        const revealEl = vBox.querySelector('#vocab-reveal-area') as HTMLElement | null;
        if (revealEl) revealEl.style.display = 'block';
        flipBtn.style.display = 'none';
        againBtn.style.display = 'inline-flex';
        goodBtn.style.display = 'inline-flex';
        AudioSynthesizer.play('click');
      });

      againBtn.addEventListener('click', () => {
        const cur = vocabStates[item.id] || SRSEngine.createInitialState(item.id, item.band >= 7.5 ? 3 : 1);
        vocabStates[item.id] = SRSEngine.rateCard(cur, item.id, 'again');
        saveVocabStates(vocabStates);
        currentIdx++;
        AudioSynthesizer.play('click');
        showCard();
      });

      goodBtn.addEventListener('click', () => {
        const cur = vocabStates[item.id] || SRSEngine.createInitialState(item.id, item.band >= 7.5 ? 3 : 1);
        vocabStates[item.id] = SRSEngine.rateCard(cur, item.id, 'good');
        saveVocabStates(vocabStates);
        currentIdx++;
        AudioSynthesizer.play('click');
        showCard();
      });

      actionsRow.append(flipBtn, againBtn, goodBtn);
      stage.append(vBox, actionsRow);
    }

    showCard();
    card.append(stage);
  }

  // Step 2: Micro-Reading Exercise Runner
  function renderReadingExercise(card: HTMLElement, step: DailyWorkoutStep): void {
    const drill = step.data.readingDrill;
    if (!drill) return;

    let qIdx = 0;
    const questions = drill.questions;
    let correctCount = 0;

    const box = h('div');
    const excerptBox = h('div', 'ie-phrasebank-cloze-box');
    excerptBox.style.maxHeight = '140px';
    excerptBox.style.overflowY = 'auto';
    excerptBox.innerHTML = `
      <div style="font-size: 11px; font-weight: 700; color: var(--accent-cyan); margin-bottom: 6px;">
        EXCERPT: ${esc(drill.title)}
      </div>
      <p style="font-size: 13px; line-height: 1.5; color: var(--ink-secondary); margin: 0;">
        ${drill.excerptParagraphs.join('<br><br>')}
      </p>
    `;

    const qStage = h('div');
    qStage.style.marginTop = '12px';

    function showQ(): void {
      qStage.innerHTML = '';
      if (qIdx >= questions.length) {
        DailyWorkoutStorage.markStepComplete(todayKey, step.index, {
          stepIndex: step.index,
          type: 'reading',
          completedAt: Date.now(),
          score: { correct: correctCount, total: questions.length }
        });
        advanceStep();
        return;
      }

      const q = questions[qIdx];
      const qCard = h('div');
      qCard.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--accent-gold);">${esc(q.type.toUpperCase())}</span>
          <span style="font-size: 11px; color: var(--ink-secondary);">${qIdx + 1} / ${questions.length}</span>
        </div>
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 10px;">${esc(q.prompt)}</div>
      `;

      const optGrid = h('div', 'ie-cloze-options-grid');
      const options = q.options || ['TRUE', 'FALSE', 'NOT GIVEN'];

      options.forEach(opt => {
        const btn = h('button', 'ie-cloze-btn') as HTMLButtonElement;
        btn.textContent = opt;
        btn.addEventListener('click', () => {
          const isCorrect = Array.isArray(q.answer)
            ? q.answer.some(a => a.toLowerCase() === opt.toLowerCase())
            : String(q.answer).toLowerCase() === opt.toLowerCase();

          if (isCorrect) correctCount++;
          btn.classList.add(isCorrect ? 'is-correct' : 'is-wrong');
          AudioSynthesizer.play(isCorrect ? 'chime' : 'click');

          optGrid.querySelectorAll('button').forEach(b => ((b as HTMLButtonElement).disabled = true));

          setTimeout(() => {
            qIdx++;
            showQ();
          }, 1000);
        });
        optGrid.append(btn);
      });

      qStage.append(qCard, optGrid);
    }

    showQ();
    box.append(excerptBox, qStage);
    card.append(box);
  }

  // Step 3: Phrasebank Sentence Cloze Runner
  function renderPhrasebankExercise(card: HTMLElement, step: DailyWorkoutStep): void {
    const drills = step.data.phrasebankDrills || [];
    let dIdx = 0;

    const pbStage = h('div');

    function showDrill(): void {
      pbStage.innerHTML = '';
      if (dIdx >= drills.length) {
        DailyWorkoutStorage.markStepComplete(todayKey, step.index, {
          stepIndex: step.index,
          type: 'phrasebank',
          completedAt: Date.now()
        });
        advanceStep();
        return;
      }

      const drill = drills[dIdx];
      const box = h('div', 'ie-phrasebank-cloze-box');
      box.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--accent-cyan);">
            ${esc(drill.sectionTitle)} • ${esc(drill.category)}
          </span>
          <span style="font-size: 11px; color: var(--ink-secondary);">${dIdx + 1} / ${drills.length}</span>
        </div>
        <div style="font-size: 16px; font-weight: 600; line-height: 1.5; color: var(--ink-primary); margin-bottom: 12px;">
          ${esc(drill.template)}
        </div>
      `;

      const optGrid = h('div', 'ie-cloze-options-grid');
      drill.options.forEach(opt => {
        const btn = h('button', 'ie-cloze-btn') as HTMLButtonElement;
        btn.textContent = opt;
        btn.addEventListener('click', () => {
          const isCorrect = opt.toLowerCase() === drill.clozeTarget.toLowerCase();
          btn.classList.add(isCorrect ? 'is-correct' : 'is-wrong');
          AudioSynthesizer.play(isCorrect ? 'chime' : 'click');
          optGrid.querySelectorAll('button').forEach(b => ((b as HTMLButtonElement).disabled = true));

          setTimeout(() => {
            dIdx++;
            showDrill();
          }, 900);
        });
        optGrid.append(btn);
      });

      pbStage.append(box, optGrid);
    }

    showDrill();
    card.append(pbStage);
  }

  // Step 4: CBT Tactical Blueprint Runner
  function renderStrategyExercise(card: HTMLElement, step: DailyWorkoutStep): void {
    const tip = step.data.strategyTip;
    if (!tip) return;

    const sBox = h('div', 'ie-phrasebank-cloze-box');
    sBox.innerHTML = `
      <div style="font-size: 11px; font-weight: 700; color: var(--accent-cyan); margin-bottom: 6px;">
        ${esc(tip.sectionRef)}
      </div>
      <div style="font-size: 15px; font-weight: 700; margin-bottom: 8px;">
        ${esc(tip.title)}
      </div>
      <div style="background: rgba(6, 182, 212, 0.1); border-left: 3px solid var(--accent-cyan); padding: 8px 12px; margin-bottom: 10px; border-radius: 4px;">
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase;">${t('ielts.formula_label', undefined, 'Formula:')}</span>
        <div style="font-size: 13px; font-family: monospace; margin-top: 2px;">${esc(tip.formula)}</div>
      </div>
      <ul style="font-size: 13px; line-height: 1.5; color: var(--ink-secondary); padding-left: 18px; margin: 0 0 12px 0;">
        ${tip.tips.map(tp => `<li>${esc(tp)}</li>`).join('')}
      </ul>
      <div style="font-size: 12px; color: #f87171; background: rgba(239, 68, 68, 0.1); padding: 6px 10px; border-radius: 6px;">
        ⚠️ <b>${t('ielts.trap_label', undefined, 'Trap:')}</b> ${esc(tip.traps[0] || 'Avoid rush without checking passage evidence.')}
      </div>
    `;

    const doneBtn = h('button', 'ie-btn ie-btn-primary') as HTMLButtonElement;
    doneBtn.style.width = '100%';
    doneBtn.style.marginTop = '14px';
    doneBtn.style.minHeight = '44px';
    doneBtn.style.borderRadius = 'var(--radius-btn, 10px)';
    doneBtn.textContent = t('ielts.strategy_internalized', undefined, '✓ Strategy Internalized • Complete Workout');

    doneBtn.addEventListener('click', () => {
      DailyWorkoutStorage.markStepComplete(todayKey, step.index, {
        stepIndex: step.index,
        type: 'strategy',
        completedAt: Date.now()
      });
      advanceStep();
    });

    card.append(sBox, doneBtn);
  }

  // Celebration Completion View
  function renderCelebration(): void {
    const streak = DailyWorkoutStorage.getWorkoutStreak();
    const cCard = h('div', 'ie-workout-completion-card');
    const isStreakMilestone = streak.currentStreak > 0 && streak.currentStreak % 7 === 0;
    cCard.innerHTML = `
      <div class="app-illustration-wrap" style="margin-bottom: var(--space-12, 12px);">
        ${illustration(isStreakMilestone ? 'special-occasion' : 'completed', { size: 'card', ariaLabel: t('ielts.workout_completed', undefined, 'Workout Completed!') })}
      </div>
      <h2 style="font-size: var(--text-xl, 22px); margin: 0; font-weight: 800;">
        ${t('ielts.workout_completed', undefined, 'Workout Completed!')}
      </h2>
      <p style="font-size: var(--text-base, 14px); color: var(--ink-secondary); max-width: 440px; margin: 0;">
        ${t('ielts.workout_completed_desc', { minutes: timeBudget }, `You have completed your ${timeBudget}-minute IELTS Academic session for today. Retention locked in!`)}
      </p>
      <div style="display: flex; gap: 16px; margin: 12px 0;">
        <div style="background: var(--bg-surface-elevated); padding: 12px 20px; border-radius: 12px; border: 1px solid var(--border-hairline);">
          <div style="font-size: 24px; font-weight: 800; color: var(--accent-gold);">${streak.currentStreak} 🔥</div>
          <div style="font-size: 11px; font-weight: 700; color: var(--ink-secondary); text-transform: uppercase;">${t('ielts.day_streak', undefined, 'Day Streak')}</div>
        </div>
        <div style="background: var(--bg-surface-elevated); padding: 12px 20px; border-radius: 12px; border: 1px solid var(--border-hairline);">
          <div style="font-size: 24px; font-weight: 800; color: var(--accent-cyan);">${streak.totalWorkoutsCompleted} 🎯</div>
          <div style="font-size: 11px; font-weight: 700; color: var(--ink-secondary); text-transform: uppercase;">${t('ielts.total_sessions', undefined, 'Total Sessions')}</div>
        </div>
      </div>
      <a class="ie-btn ie-btn-primary" href="#home" style="min-height: 44px; border-radius: var(--radius-btn, 10px); padding: 10px 24px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
        <span>${t('ielts.return_overview', undefined, 'Return to Overview')}</span>
        ${icon('arrowRight', 16)}
      </a>
    `;
    container.append(cCard);
  }

  function renderActiveStep(step: DailyWorkoutStep): void {
    const card = h('div', 'ie-workout-step-card');

    const stepHeader = h('div');
    stepHeader.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-size: var(--font-kicker, 11px); font-weight: 700; color: var(--accent-gold, #f59e0b); text-transform: uppercase;">
          ${t('ielts.step_n_of_total', { current: step.index + 1, total: 4, minutes: step.estimatedMinutes }, `Step ${step.index + 1} of 4 • ~${step.estimatedMinutes} min`)}
        </span>
        <span style="font-size: var(--font-kicker, 11px); color: var(--ink-secondary);">
          ${step.type.toUpperCase()}
        </span>
      </div>
      <h2 style="font-size: var(--text-base, 16px); margin: 0; font-weight: 700;">${esc(step.title)}</h2>
      <p style="font-size: var(--font-body-compact, 13px); color: var(--ink-secondary); margin: 4px 0 0 0;">${esc(step.subtitle)}</p>
    `;
    card.append(stepHeader);

    if (step.type === 'vocab') {
      renderVocabExercise(card, step);
    } else if (step.type === 'reading') {
      renderReadingExercise(card, step);
    } else if (step.type === 'phrasebank') {
      renderPhrasebankExercise(card, step);
    } else if (step.type === 'strategy') {
      renderStrategyExercise(card, step);
    }

    container.append(card);
  }

  function render(): void {
    container.innerHTML = '';

    // 1. Header Card with Title, Time Budget Switcher, and Stepper Progress
    const headerCard = h('div', 'ie-workout-header-card');

    const topRow = h('div', 'ie-workout-top-row');
    const titleCol = h('div');
    titleCol.innerHTML = `
      <div style="font-size: var(--font-kicker, 11px); font-weight: 700; color: var(--accent-cyan, #06b6d4); text-transform: uppercase; letter-spacing: 0.08em;">
        ${t('ielts.daily_guided_workout', undefined, 'Daily Guided Workout')}
      </div>
      <h1 style="font-size: var(--text-lg, 18px); margin: 2px 0 0 0; font-weight: 700;">
        ${todayKey} • ${timeBudget}m Focus
      </h1>
    `;

    // Time budget switcher pills
    const budgetPills = h('div', 'ie-workout-budget-pills');
    ([15, 30, 45, 60] as TimeBudgetMinutes[]).forEach(b => {
      const btn = h('button', `ie-workout-budget-btn ${b === timeBudget ? 'is-active' : ''}`) as HTMLButtonElement;
      btn.type = 'button';
      btn.textContent = `${b}m`;
      btn.addEventListener('click', () => {
        if (b === timeBudget) return;
        timeBudget = b;
        StorageManager.setDailyTimeBudget(b);
        progressState.timeBudget = b;
        DailyWorkoutStorage.saveWorkoutState(progressState);
        session = generateDailyWorkout({
          dateKey: todayKey,
          timeBudget: b,
          srsStates: loadVocabStates(),
          starredTopics: StorageManager.getStarredVocabTopics(),
          targetBand: StorageManager.getTargetBand()
        });
        render();
      });
      budgetPills.append(btn);
    });

    topRow.append(titleCol, budgetPills);

    // Stepper Bars
    const stepper = h('div', 'ie-workout-stepper');
    session.steps.forEach((_step, idx) => {
      const isDone = progressState.completedStepIndexes.includes(idx);
      const isCurrent = idx === activeStepIndex;
      const bar = h('div', `ie-stepper-bar ${isDone ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''}`);
      stepper.append(bar);
    });

    headerCard.append(topRow, stepper);
    container.append(headerCard);

    // 2. Active Step Content or Celebration View
    if (activeStepIndex >= 4 || progressState.completed) {
      renderCelebration();
    } else {
      renderActiveStep(session.steps[activeStepIndex]);
    }
  }

  render();

  return () => {
    /* cleanup */
  };
}

