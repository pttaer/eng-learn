import listeningData from '../data/listening.json';
import { ListeningSection } from '../types';
import { rawToBand } from '../bands';
import { addAttempt } from '../progress';
import { QuestionForm, renderQuestions, typeBreakdown } from '../questions';
import { SetScore } from '../scoring';
import {
  playSection,
  Playback,
  ttsAvailable,
  setPreferredAccent,
  getPreferredAccent,
  setExamRoomAmbience,
  isExamRoomAmbienceEnabled
} from '../tts';
import { AccentCadenceType } from '../../core/audio-synthesizer';
import { bandBadge, esc, h } from '../ui';
import { TestResult } from './reading';
import { icon } from '../../utils/icons';
import { t } from '../../core/i18n';
import { setIeltsTestInProgress } from '../confirm-dialog';
import { illustration } from '../../utils/illustrations';
import { AcousticHaptics } from '../../core/acoustic-haptics';
import { HapticEngine } from '../../core/haptic-engine';

const SECTIONS = listeningData as ListeningSection[];

// Quotes in a `why` are matched to script lines after case and punctuation are stripped.
const normText = (str: string): string => str.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

/** Script line indexes quoted in the `why` of the given questions. */
export function evidenceLineIndexes(sec: ListeningSection, questionIds: Set<string>): Set<number> {
  const out = new Set<number>();
  for (const q of sec.questions) {
    if (!questionIds.has(q.id)) continue;
    // A quote opens after a space, bracket or start and closes before space or punctuation, so "there's" does not split it.
    // Ellipses split one quote into separate segments, since a single script line rarely holds the whole span.
    const quotes = [...(q.why || '').matchAll(/(?:^|[\s(\u201C\u2018"])["\u201C\u2018']([^"\u201C\u201D\u2018\u2019]{4,}?)["\u201D\u2019'](?=[\s.,;:!?)]|$)/g)]
      .flatMap(m => (m[1] ?? '').split(/\.{3}|\u2026/))
      .map(normText)
      .filter(qq => qq.length > 0);
    sec.script.forEach((line, i) => {
      const textNorm = ' ' + normText(line.text) + ' ';
      if (quotes.some(qq => textNorm.includes(' ' + qq + ' '))) out.add(i);
    });
  }
  return out;
}

export interface TokenDiffItem {
  word: string;
  status: 'matched' | 'missing' | 'extra';
}

export interface DictationResult {
  accuracy: number;
  matchedCount: number;
  totalTarget: number;
  targetTokens: TokenDiffItem[];
  userTokens: TokenDiffItem[];
}

/**
 * Compares learner dictation input with the target sentence using LCS token alignment.
 * Case-insensitive, normalizes smart quotes and ignores punctuation differences.
 */
export function diffSentenceTokens(targetText: string, userText: string): DictationResult {
  const normQuotes = (s: string): string => s.replace(/[’‘]/g, "'").replace(/[“”]/g, '"');
  const clean = (w: string): string => normQuotes(w).toLowerCase().replace(/[^a-z0-9]/g, '');

  const targetWords = normQuotes(targetText).trim().split(/\s+/).filter(Boolean);
  const userWords = normQuotes(userText).trim().split(/\s+/).filter(Boolean);

  const m = targetWords.length;
  const n = userWords.length;

  if (m === 0) {
    return {
      accuracy: 100,
      matchedCount: 0,
      totalTarget: 0,
      targetTokens: [],
      userTokens: userWords.map(w => ({ word: w, status: 'extra' }))
    };
  }

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    const tw = clean(targetWords[i - 1]);
    for (let j = 1; j <= n; j++) {
      const uw = clean(userWords[j - 1]);
      if (tw && uw && tw === uw) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  let i = m;
  let j = n;
  const matchedTargetIdxs = new Set<number>();
  const matchedUserIdxs = new Set<number>();

  while (i > 0 && j > 0) {
    const tw = clean(targetWords[i - 1]);
    const uw = clean(userWords[j - 1]);
    if (tw && uw && tw === uw && dp[i][j] === dp[i - 1][j - 1] + 1) {
      matchedTargetIdxs.add(i - 1);
      matchedUserIdxs.add(j - 1);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  const targetTokens: TokenDiffItem[] = targetWords.map((word, idx) => ({
    word,
    status: matchedTargetIdxs.has(idx) ? 'matched' : 'missing'
  }));

  const userTokens: TokenDiffItem[] = userWords.map((word, idx) => ({
    word,
    status: matchedUserIdxs.has(idx) ? 'matched' : 'extra'
  }));

  const matchedCount = matchedTargetIdxs.size;
  const accuracy = Math.round((matchedCount / m) * 100);

  return {
    accuracy,
    matchedCount,
    totalTarget: m,
    targetTokens,
    userTokens
  };
}

export interface DictationLine {
  speaker: string;
  text: string;
  origIndex: number;
  isEvidence: boolean;
}

/**
 * Interactive Sentence Micro-Dictation and Cloze Ear Training Lab.
 * Enables single-sentence synthesis, variable rate (0.8x/1.0x), replay shortcuts,
 * and token-by-token comparison.
 */
export function mountMicroDictationLab(root: HTMLElement): () => void {
  root.innerHTML = '';

  let secIdx = 0;
  let filterMode: 'all' | 'evidence' = 'all';
  let currentLineIdx = 0;
  const completedMap = new Map<number, { userInput: string; diff: DictationResult }>();

  let activePlayback: Playback | null = null;
  let isPlaying = false;
  let currentRate = 1.0;

  const labContainer = h('div', 'ie-dict-lab');
  const toolbar = h('div', 'ie-dict-toolbar');
  const cardHost = h('div', 'ie-dict-card-host');

  labContainer.append(toolbar, cardHost);
  root.append(labContainer);

  const getLines = (): DictationLine[] => {
    const sec = SECTIONS[secIdx];
    if (!sec) return [];
    const qIds = new Set(sec.questions.map(q => q.id));
    const evSet = evidenceLineIndexes(sec, qIds);
    const all = sec.script.map((line, idx) => ({
      speaker: line.speaker,
      text: line.text,
      origIndex: idx,
      isEvidence: evSet.has(idx)
    }));
    if (filterMode === 'evidence') {
      const evOnly = all.filter(l => l.isEvidence);
      return evOnly.length > 0 ? evOnly : all;
    }
    return all;
  };

  let currentLines: DictationLine[] = getLines();

  // Section Selector
  const secGroup = h('div', 'ie-dict-control-group');
  const secLabel = h('span', 'ie-dict-control-label', t('ielts.section', undefined, 'Section'));
  const secSelect = h('select', 'ie-select ie-dict-section-select') as HTMLSelectElement;
  SECTIONS.forEach((s, idx) => {
    const opt = document.createElement('option');
    opt.value = String(idx);
    opt.textContent = `Section ${s.section}: ${s.title}`;
    secSelect.appendChild(opt);
  });
  secSelect.value = String(secIdx);
  secSelect.addEventListener('change', () => {
    AcousticHaptics.tap();
    HapticEngine.trigger('selection');
    stopAudio();
    secIdx = parseInt(secSelect.value, 10);
    currentLineIdx = 0;
    completedMap.clear();
    currentLines = getLines();
    updateFilterCounts();
    renderSentenceCard();
  });
  secGroup.append(secLabel, secSelect);

  // Line Filter Tabs
  const filterGroup = h('div', 'ie-dict-filter-group');
  const filterLabel = h('span', 'ie-dict-control-label', t('common.filter', undefined, 'Line Filter'));
  const filterTabs = h('div', 'ie-dict-filter-tabs');
  const allBtn = h('button', 'ie-dict-filter-btn is-on');
  const evBtn = h('button', 'ie-dict-filter-btn');

  const updateFilterCounts = () => {
    const sec = SECTIONS[secIdx];
    if (!sec) return;
    const qIds = new Set(sec.questions.map(q => q.id));
    const evSet = evidenceLineIndexes(sec, qIds);
    allBtn.textContent = `All lines (${sec.script.length})`;
    evBtn.textContent = `Key Evidence (${evSet.size})`;
  };
  updateFilterCounts();

  allBtn.addEventListener('click', () => {
    if (filterMode === 'all') return;
    AcousticHaptics.tap();
    HapticEngine.trigger('selection');
    stopAudio();
    filterMode = 'all';
    allBtn.classList.add('is-on');
    evBtn.classList.remove('is-on');
    currentLineIdx = 0;
    completedMap.clear();
    currentLines = getLines();
    renderSentenceCard();
  });

  evBtn.addEventListener('click', () => {
    if (filterMode === 'evidence') return;
    AcousticHaptics.tap();
    HapticEngine.trigger('selection');
    stopAudio();
    filterMode = 'evidence';
    evBtn.classList.add('is-on');
    allBtn.classList.remove('is-on');
    currentLineIdx = 0;
    completedMap.clear();
    currentLines = getLines();
    renderSentenceCard();
  });

  filterTabs.append(allBtn, evBtn);
  filterGroup.append(filterLabel, filterTabs);

  // Multi-accent Selector
  const accentGroup = h('div', 'ie-dict-control-group');
  const accentLabel = h('span', 'ie-dict-control-label', t('listening.accent_title', undefined, 'Cadence Accent'));
  const accentSelect = h('select', 'ie-select ie-dict-accent-select', `
    <option value="uk-rp">${t('listening.accent_uk')}</option>
    <option value="general-american">${t('listening.accent_us')}</option>
    <option value="australian">${t('listening.accent_au')}</option>
    <option value="scottish">${t('listening.accent_sc')}</option>
  `) as HTMLSelectElement;
  accentSelect.value = getPreferredAccent();
  accentSelect.addEventListener('change', () => {
    setPreferredAccent(accentSelect.value as AccentCadenceType);
  });
  accentGroup.append(accentLabel, accentSelect);

  toolbar.append(secGroup, filterGroup, accentGroup);

  function stopAudio() {
    if (activePlayback) {
      activePlayback.stop();
      activePlayback = null;
    }
    isPlaying = false;
  }

  function playSentence(rate = 1.0, onStart?: () => void, onDone?: () => void) {
    if (!ttsAvailable() || !currentLines.length) return;
    stopAudio();
    currentRate = rate;
    isPlaying = true;
    onStart?.();

    const sec = SECTIONS[secIdx];
    const line = currentLines[currentLineIdx];
    activePlayback = playSection(
      { ...sec, script: [{ speaker: line.speaker, text: line.text }] },
      {
        rate,
        accent: (accentSelect.value as AccentCadenceType) || getPreferredAccent(),
        roomAmbience: isExamRoomAmbienceEnabled(),
        onEnd: () => {
          isPlaying = false;
          activePlayback = null;
          onDone?.();
        }
      }
    );
  }

  function renderSentenceCard() {
    stopAudio();
    cardHost.innerHTML = '';

    if (!currentLines.length) {
      cardHost.append(h('p', 'ie-note', t('listening.no_sentences_found', undefined, 'No sentences found matching the selected filter.')));
      return;
    }

    const currentLine = currentLines[currentLineIdx];
    const completedRecord = completedMap.get(currentLineIdx);
    const isChecked = Boolean(completedRecord);

    const card = h('section', 'ie-dict-card');

    // Telemetry calculation
    const completedCount = completedMap.size;
    const totalTargetTokens = Array.from(completedMap.values()).reduce((sum, item) => sum + item.diff.totalTarget, 0);
    const totalMatchedTokens = Array.from(completedMap.values()).reduce((sum, item) => sum + item.diff.matchedCount, 0);
    const overallAccuracy = totalTargetTokens > 0 ? Math.round((totalMatchedTokens / totalTargetTokens) * 100) : 0;
    const progressPct = Math.round((completedCount / currentLines.length) * 100);

    // 1. Telemetry Row
    const telemetryRow = h('div', 'ie-dict-telemetry-row');
    const metaLeft = h('div', 'ie-dict-meta-left');
    const sentPill = h('span', 'ie-dict-pill', `Sentence ${currentLineIdx + 1} of ${currentLines.length}`);
    metaLeft.append(sentPill);

    if (currentLine.isEvidence) {
      const evPill = h('span', 'ie-dict-pill ie-dict-pill-evidence', t('listening.key_evidence', undefined, 'Key Evidence'));
      metaLeft.append(evPill);
    }

    const metaRight = h('div', 'ie-dict-meta-right');
    const accLabel = h('span', '', `Accuracy: ${completedCount > 0 ? overallAccuracy + '%' : '--%'}`);
    const doneLabel = h('span', '', `Sentences completed: ${completedCount}/${currentLines.length}`);
    metaRight.append(accLabel, doneLabel);

    telemetryRow.append(metaLeft, metaRight);

    // Progress bar
    const progressTrack = h('div', 'ie-dict-progress');
    const progressBar = h('div', 'ie-dict-progress-bar');
    progressBar.style.width = `${progressPct}%`;
    progressTrack.append(progressBar);

    // 2. Audio Controls Row
    const audioRow = h('div', 'ie-dict-audio-row');
    const playBtn = h('button', 'ie-btn ie-btn-primary');
    playBtn.innerHTML = `${icon('play', 14)} Play Sentence`;

    const slowBtn = h('button', 'ie-btn', '🐢 Slow 0.8x');
    const replayBtn = h('button', 'ie-btn', '↺ Replay (R)');
    replayBtn.title = 'Replay sentence (hotkey: R or Alt+R)';

    const setPlayingState = (playing: boolean) => {
      if (playing) {
        playBtn.innerHTML = `${icon('stop', 14)} Stop Audio`;
        playBtn.classList.add('is-playing');
      } else {
        playBtn.innerHTML = `${icon('play', 14)} Play Sentence`;
        playBtn.classList.remove('is-playing');
      }
    };

    playBtn.addEventListener('click', () => {
      AcousticHaptics.tap();
      HapticEngine.trigger('light');
      if (isPlaying) {
        stopAudio();
        setPlayingState(false);
      } else {
        playSentence(1.0, () => setPlayingState(true), () => setPlayingState(false));
      }
    });

    slowBtn.addEventListener('click', () => {
      AcousticHaptics.tap();
      HapticEngine.trigger('light');
      playSentence(0.8, () => setPlayingState(true), () => setPlayingState(false));
    });

    replayBtn.addEventListener('click', () => {
      AcousticHaptics.tap();
      HapticEngine.trigger('light');
      playSentence(currentRate, () => setPlayingState(true), () => setPlayingState(false));
    });

    audioRow.append(playBtn, slowBtn, replayBtn);

    // 3. Text Input & Actions
    const inputArea = h('div', 'ie-dict-input-wrap');
    const textarea = document.createElement('textarea');
    textarea.className = 'ie-dict-textarea';
    textarea.rows = 2;
    textarea.placeholder = 'Listen carefully and type what you hear... (Press Enter to check)';
    if (completedRecord) {
      textarea.value = completedRecord.userInput;
      textarea.disabled = true;
    }

    const actionsRow = h('div', 'ie-dict-actions-row');

    if (!isChecked) {
      const checkBtn = h('button', 'ie-btn ie-btn-primary', t('action.check_answer', undefined, 'Check (Enter)'));
      const skipBtn = h('button', 'ie-btn', t('listening.skip', undefined, 'Skip'));

      const performCheck = () => {
        const val = textarea.value.trim();
        if (!val) {
          AcousticHaptics.nudge();
          HapticEngine.trigger('warning');
          textarea.focus();
          return;
        }
        const diff = diffSentenceTokens(currentLine.text, val);
        completedMap.set(currentLineIdx, { userInput: val, diff });

        if (diff.accuracy >= 90) {
          AcousticHaptics.chime();
          HapticEngine.trigger('success');
        } else if (diff.accuracy < 70) {
          AcousticHaptics.nudge();
          HapticEngine.trigger('warning');
        } else {
          AcousticHaptics.tap();
          HapticEngine.trigger('light');
        }

        renderSentenceCard();
      };

      checkBtn.addEventListener('click', () => {
        performCheck();
      });

      skipBtn.addEventListener('click', () => {
        AcousticHaptics.tap();
        if (currentLineIdx < currentLines.length - 1) {
          currentLineIdx++;
          renderSentenceCard();
        }
      });

      textarea.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          performCheck();
        }
      });

      actionsRow.append(checkBtn, skipBtn);
    } else {
      const isLast = currentLineIdx >= currentLines.length - 1;
      const nextBtn = h(
        'button',
        'ie-btn ie-btn-primary',
        isLast ? 'Complete Section 🎉' : 'Next Sentence (Enter) ➔'
      );
      const retryBtn = h('button', 'ie-btn', t('listening.try_again', undefined, 'Try Again'));

      const advanceNext = () => {
        AcousticHaptics.tap();
        HapticEngine.trigger('selection');
        if (!isLast) {
          currentLineIdx++;
          renderSentenceCard();
        } else {
          renderSummary();
        }
      };

      nextBtn.addEventListener('click', () => {
        advanceNext();
      });

      retryBtn.addEventListener('click', () => {
        AcousticHaptics.tap();
        HapticEngine.trigger('light');
        completedMap.delete(currentLineIdx);
        renderSentenceCard();
      });

      textarea.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          advanceNext();
        }
      });

      actionsRow.append(nextBtn, retryBtn);
    }

    inputArea.append(textarea);
    card.append(telemetryRow, progressTrack, audioRow, inputArea, actionsRow);

    // 4. Result Comparison Box (if checked)
    if (completedRecord) {
      const diff = completedRecord.diff;
      const resultBox = h('div', 'ie-dict-result-box');

      const resultHeader = h('div', 'ie-dict-result-header');
      const speakerBadge = h('span', 'ie-dict-speaker-tag', `${currentLine.speaker}:`);

      const accClass = diff.accuracy >= 90 ? 'is-good' : diff.accuracy >= 70 ? 'is-mid' : 'is-low';
      const accChip = h(
        'span',
        `ie-dict-acc-chip ${accClass}`,
        diff.accuracy === 100 ? '100% Match - Perfect!' : `${diff.accuracy}% Accuracy`
      );
      resultHeader.append(speakerBadge, accChip);

      // Exact Script line with token comparison (matched in green, missing in red strikethrough)
      const targetBlock = h('div', 'ie-dict-comparison-block');
      const targetLabel = h('span', 'ie-dict-comparison-label', t('listening.exact_script_comparison', undefined, 'Exact Script Comparison'));
      const targetFlow = h('div', 'ie-dict-tokens-flow');

      const spkSpan = h('span', 'ie-dict-speaker-tag', `${currentLine.speaker}:`);
      targetFlow.append(spkSpan);

      diff.targetTokens.forEach(tok => {
        const span = h('span', `ie-dict-token is-${tok.status}`, esc(tok.word));
        targetFlow.append(span);
      });
      targetBlock.append(targetLabel, targetFlow);

      // Learner echo (matched in green, extra/incorrect in red strikethrough)
      const userBlock = h('div', 'ie-dict-comparison-block');
      const userLabel = h('span', 'ie-dict-comparison-label', t('listening.your_input', undefined, 'Your Input'));
      const userFlow = h('div', 'ie-dict-tokens-flow');

      diff.userTokens.forEach(tok => {
        const span = h('span', `ie-dict-token is-${tok.status}`, esc(tok.word));
        userFlow.append(span);
      });
      userBlock.append(userLabel, userFlow);

      // Full original script quote
      const originalText = h(
        'div',
        'ie-dict-script-original',
        `<b>${esc(currentLine.speaker)}:</b> "${esc(currentLine.text)}"`
      );

      resultBox.append(resultHeader, targetBlock, userBlock, originalText);
      card.append(resultBox);
    }

    // 5. Navigation Row (Previous / Next)
    const navRow = h('div', 'ie-dict-nav-row');
    const prevBtn = h('button', 'ie-btn', '← Previous');
    prevBtn.disabled = currentLineIdx === 0;
    prevBtn.addEventListener('click', () => {
      if (currentLineIdx > 0) {
        AcousticHaptics.tap();
        HapticEngine.trigger('selection');
        currentLineIdx--;
        renderSentenceCard();
      }
    });

    const nextNavBtn = h('button', 'ie-btn', 'Next →');
    nextNavBtn.disabled = currentLineIdx >= currentLines.length - 1;
    nextNavBtn.addEventListener('click', () => {
      if (currentLineIdx < currentLines.length - 1) {
        AcousticHaptics.tap();
        HapticEngine.trigger('selection');
        currentLineIdx++;
        renderSentenceCard();
      }
    });

    navRow.append(prevBtn, nextNavBtn);
    card.append(navRow);

    cardHost.append(card);

    if (!isChecked) {
      setTimeout(() => textarea.focus(), 60);
    }
  }

  function renderSummary() {
    stopAudio();
    cardHost.innerHTML = '';

    const completedCount = completedMap.size;
    const totalTargetTokens = Array.from(completedMap.values()).reduce((sum, item) => sum + item.diff.totalTarget, 0);
    const totalMatchedTokens = Array.from(completedMap.values()).reduce((sum, item) => sum + item.diff.matchedCount, 0);
    const finalAccuracy = totalTargetTokens > 0 ? Math.round((totalMatchedTokens / totalTargetTokens) * 100) : 0;

    const summaryCard = h('div', 'ie-dict-summary-card');
    const headerTitle = h('h2', 'ie-title', '🎉 Dictation Complete!');
    const sec = SECTIONS[secIdx];
    const headerLead = h(
      'p',
      'ie-lead',
      `You completed Section ${sec.section}: ${sec.title} (${filterMode === 'evidence' ? 'Key Evidence' : 'All Lines'})`
    );

    const stats = h('div', 'ie-dict-summary-stats');
    const statAcc = h(
      'div',
      'ie-dict-stat-item',
      `<span class="ie-dict-stat-num">${finalAccuracy}%</span><span class="ie-dict-stat-label">${t('listening.accuracy_label', undefined, 'Accuracy')}</span>`
    );
    const statCount = h(
      'div',
      'ie-dict-stat-item',
      `<span class="ie-dict-stat-num">${completedCount}/${currentLines.length}</span><span class="ie-dict-stat-label">${t('listening.sentences_label', undefined, 'Sentences')}</span>`
    );
    stats.append(statAcc, statCount);

    const actions = h('div', 'ie-dict-actions-row');
    const reviewBtn = h('button', 'ie-btn ie-btn-primary', t('listening.review_sentences', undefined, 'Review Sentences'));
    reviewBtn.addEventListener('click', () => {
      AcousticHaptics.tap();
      currentLineIdx = 0;
      renderSentenceCard();
    });

    const isNextSecAvailable = secIdx < SECTIONS.length - 1;
    const nextSecBtn = h('button', 'ie-btn', 'Next Section ➔');
    nextSecBtn.disabled = !isNextSecAvailable;
    nextSecBtn.addEventListener('click', () => {
      if (isNextSecAvailable) {
        AcousticHaptics.tap();
        secIdx++;
        secSelect.value = String(secIdx);
        currentLineIdx = 0;
        completedMap.clear();
        currentLines = getLines();
        updateFilterCounts();
        renderSentenceCard();
      }
    });

    actions.append(reviewBtn, nextSecBtn);
    summaryCard.append(headerTitle, headerLead, stats, actions);
    cardHost.append(summaryCard);
  }

  // Keyboard shortcut listener for 'R' replay
  const handleKeydown = (e: KeyboardEvent) => {
    const isR = e.key === 'r' || e.key === 'R';
    const activeEl = document.activeElement;
    const isTyping = activeEl && (activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'INPUT');

    if ((isR && !isTyping) || (isR && (e.altKey || e.ctrlKey))) {
      e.preventDefault();
      AcousticHaptics.tap();
      HapticEngine.trigger('light');
      playSentence(currentRate);
    }
  };
  window.addEventListener('keydown', handleKeydown);

  renderSentenceCard();

  return () => {
    stopAudio();
    window.removeEventListener('keydown', handleKeydown);
  };
}

/** Runs sections in order. exam=true plays each section once (no replay); practice allows replay and shows the transcript after submit. */
export function mountListeningTest(root: HTMLElement, sections: ListeningSection[], exam: boolean, mock: boolean, onDone?: (r: TestResult) => void): () => void {
  root.innerHTML = '';
  setIeltsTestInProgress('listening');
  let playback: Playback | null = null;
  const bar = h('div', 'ie-testbar');
  const status = h('span', 'ie-clock', ttsAvailable() ? t('listening.press_play', undefined, 'Press Play to start') : t('listening.tts_unavailable', undefined, 'Text-to-speech is not available in this browser'));
  const play = h('button', 'ie-btn ie-btn-primary', t('ielts.play_audio', undefined, 'Play'));
  const submit = h('button', 'ie-btn', t('ielts.submit_answers', undefined, 'Submit answers'));
  const tabs = h('div', 'ie-tabs');

  // Multi-accent cadence selector
  const accentSelect = h('select', 'ie-select ie-accent-select', `
    <option value="uk-rp">${t('listening.accent_uk')}</option>
    <option value="general-american">${t('listening.accent_us')}</option>
    <option value="australian">${t('listening.accent_au')}</option>
    <option value="scottish">${t('listening.accent_sc')}</option>
  `) as HTMLSelectElement;
  accentSelect.value = getPreferredAccent();
  accentSelect.title = t('listening.accent_title');
  accentSelect.addEventListener('change', () => {
    setPreferredAccent(accentSelect.value as AccentCadenceType);
  });

  // Authentic Cambridge 40Hz acoustic exam room resonance toggle
  const getAmbienceText = (active: boolean) =>
    t('listening.ambience_btn', { status: active ? t('nav.active') : t('nav.off') });

  const ambienceBtn = h(
    'button',
    'ie-btn ie-ambience-btn' + (isExamRoomAmbienceEnabled() ? ' is-active' : '')
  );
  ambienceBtn.innerHTML = `${icon('landmark', 13)} ${getAmbienceText(isExamRoomAmbienceEnabled())}`;
  ambienceBtn.title = t('listening.ambience_title');
  ambienceBtn.addEventListener('click', () => {
    const next = !isExamRoomAmbienceEnabled();
    setExamRoomAmbience(next);
    ambienceBtn.classList.toggle('is-active', next);
    ambienceBtn.innerHTML = `${icon('landmark', 13)} ${getAmbienceText(next)}`;
  });

  bar.append(status, tabs, accentSelect, ambienceBtn, play, submit);
  const panes: HTMLElement[] = [];
  const forms: QuestionForm[] = [];
  const played = new Set<number>();
  let cur = 0;
  let replay: Playback | null = null;
  let n = 1;
  sections.forEach((s, i) => {
    const pane = h('section', 'ie-qcol ie-listen-pane');
    pane.hidden = i > 0;
    pane.append(h('h2', '', `${t('ielts.section', undefined, 'Section')} ${s.section}: ${esc(s.title)}`));
    const form = renderQuestions(s.questions, n);
    n += s.questions.length;
    pane.append(form.el);
    panes.push(pane);
    forms.push(form);
    const tabBtn = h('button', 'ie-tab' + (i === 0 ? ' is-on' : ''), `${t('ielts.section', undefined, 'Section')} ${s.section}`);
    tabBtn.addEventListener('click', () => {
      playback?.stop();
      play.textContent = t('ielts.play_audio', undefined, 'Play');
      cur = i;
      panes.forEach((x, j) => { x.hidden = j !== i; });
      tabs.querySelectorAll('.ie-tab').forEach((x, j) => x.classList.toggle('is-on', j === i));
      refresh();
    });
    tabs.append(tabBtn);
  });
  const result = h('section', 'ie-result');
  result.hidden = true;
  root.append(bar, ...panes, result);

  const refresh = (): void => {
    play.disabled = !ttsAvailable() || (exam && played.has(cur));
    status.textContent = exam && played.has(cur) ? t('listening.played_once', undefined, 'Played once. Answer from memory, as in the exam.') : ttsAvailable() ? t('listening.press_play', undefined, 'Press Play to start') : status.textContent;
  };

  play.addEventListener('click', () => {
    if (playback) { playback.stop(); playback = null; play.textContent = t('ielts.play_audio', undefined, 'Play'); return; }
    played.add(cur);
    play.textContent = exam ? t('listening.playing', undefined, 'Playing…') : t('listening.stop', undefined, 'Stop');
    if (exam) play.disabled = true;
    playback = playSection(sections[cur], {
      accent: accentSelect.value as AccentCadenceType,
      roomAmbience: isExamRoomAmbienceEnabled(),
      onLine: i => { status.textContent = t('listening.speaker_speaking', { speaker: sections[cur].script[i].speaker }, `${sections[cur].script[i].speaker} speaking…`); },
      onEnd: () => { playback = null; play.textContent = t('ielts.play_audio', undefined, 'Play'); refresh(); }
    });
  });

  submit.addEventListener('click', () => {
    playback?.stop();
    submit.disabled = true;
    play.hidden = true;
    const total: SetScore = { raw: 0, of: 0, byType: {}, wrong: [] };
    forms.forEach((f, i) => {
      const s = f.reveal();
      total.raw += s.raw;
      total.of += s.of;
      for (const [t, v] of Object.entries(s.byType)) {
        const c = (total.byType[t] ||= { ok: 0, n: 0 });
        c.ok += v.ok;
        c.n += v.n;
      }
      const tr = h('details', 'ie-transcript', `<summary>${t('listening.transcript_section', { sec: sections[i].section }, `Transcript: Section ${sections[i].section}`)}</summary>` + sections[i].script.map(l => `<p><b>${esc(l.speaker)}:</b> ${esc(l.text)}</p>`).join(''));
      if (!exam && ttsAvailable()) {
        const marked = evidenceLineIndexes(sections[i], new Set(s.wrong));
        tr.querySelectorAll('p').forEach((p, j) => {
          if (!marked.has(j)) return;
          const replayBtn = h('button', 'ie-btn ie-btn-sm', t('listening.hear_at_08x', undefined, 'Hear at 0.8x'));
          replayBtn.addEventListener('click', () => {
            replay?.stop();
            replay = playSection({ ...sections[i], script: [sections[i].script[j]] }, { rate: 0.8, accent: accentSelect.value as AccentCadenceType });
          });
          p.append(replayBtn);
        });
      }
      panes[i].append(tr);
    });
    const band = rawToBand('listening', total.raw, total.of);
    addAttempt({ skill: 'listening', itemId: sections.map(s => s.id).join('+'), band, raw: total.raw, of: total.of, byType: total.byType, mock });
    setIeltsTestInProgress(null);
    result.hidden = false;
    const correctText = t('reading.result_correct', { raw: total.raw, of: total.of }, `${total.raw}/${total.of} correct`);
    const noteText = t('listening.result_note', undefined, 'Band is scaled to 40 questions. Browser voices are not real exam audio; treat the band as a guide.');
    result.innerHTML = `${bandBadge(band, 'Listening')}<div><h3>${correctText}</h3><p class="ie-note">${noteText}</p><ul class="ie-breakdown">${typeBreakdown(total.byType)}</ul></div>`;
    panes.forEach(x => { x.hidden = false; });
    tabs.hidden = true;
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    onDone?.({ raw: total.raw, of: total.of, band, byType: total.byType });
  });

  refresh();
  return () => {
    setIeltsTestInProgress(null);
    playback?.stop();
    replay?.stop();
    setExamRoomAmbience(false);
  };
}

export function listeningView(root: HTMLElement): () => void {
  let stopCurrent = () => { };
  let activeTab: 'practice' | 'dictation' = 'practice';

  root.innerHTML = '';

  const header = h(
    'div',
    'app-hero-banner ielts-listening-hero',
    `<div class="app-hero-banner-content">` +
      `<span class="telemetry-label" style="color: var(--accent-gold); font-size: var(--font-kicker); font-family: var(--font-mono); font-weight: 700;">` +
        `[IELTS ACADEMIC // LISTENING HUB]` +
      `</span>` +
      `<h1 class="ie-title" style="margin: 0; font-size: var(--font-h1); line-height: 1.25;">${esc(t('ielts.nav_listening', undefined, 'Academic Listening'))}</h1>` +
      `<p class="ie-lead" style="margin: 0; font-size: var(--font-body-compact); color: var(--ink-secondary); line-height: 1.5;">${esc(t('ielts.listening_lead', undefined, 'Ten questions per section, voiced by browser text-to-speech with a different voice per speaker. Practice mode lets you replay; the mock plays each section once.'))}</p>` +
    `</div>` +
    `<div class="app-hero-banner-art">` +
      `${illustration('podcast-listener', { size: 'banner', ariaLabel: 'Academic Listening' })}` +
    `</div>`
  );
  header.style.marginBottom = 'var(--space-12, 12px)';

  // Top Mode Switcher Tabs
  const modeSwitcher = h('div', 'ie-tabs ie-listening-mode-tabs');
  const practiceTabBtn = h('button', 'ie-tab is-on', t('ielts.listening_full_section', undefined, '🎧 Full Section Practice'));
  const dictationTabBtn = h('button', 'ie-tab', t('ielts.listening_micro_dictation', undefined, '✍️ Micro-Dictation Lab'));
  modeSwitcher.append(practiceTabBtn, dictationTabBtn);

  const contentArea = h('div', 'ie-listening-content');

  root.append(header, modeSwitcher, contentArea);

  const renderCurrentTab = () => {
    stopCurrent();
    contentArea.innerHTML = '';

    if (activeTab === 'practice') {
      practiceTabBtn.classList.add('is-on');
      dictationTabBtn.classList.remove('is-on');

      // Navigation to #listening-traps (ie-lab-banner) is unified in main.ts top subnavigation bar
      const list = h('div', 'ie-cards');
      SECTIONS.forEach(s => {
        const spkKey = s.speakers.length === 1 ? 'listening.speakers_count_one' : 'listening.speakers_count';
        const spkText = t(spkKey, { count: s.speakers.length }, s.speakers.length === 1 ? '1 speaker' : `${s.speakers.length} speakers`);
        const qCountText = t('listening.questions_count', { count: s.questions.length }, `${s.questions.length} questions`);
        const c = h('button', 'ie-card', `<b>${t('ielts.section', undefined, 'Section')} ${s.section}: ${esc(s.title)}</b><span>${spkText}</span><small>${qCountText}</small>`);
        c.addEventListener('click', () => {
          AcousticHaptics.tap();
          HapticEngine.trigger('selection');
          contentArea.innerHTML = '';
          const back = h('button', 'ie-btn', t('ielts.all_sections', undefined, 'All sections'));
          back.addEventListener('click', () => {
            AcousticHaptics.tap();
            HapticEngine.trigger('light');
            stopCurrent();
            renderCurrentTab();
          });
          const host = h('div', 'ie-stage');
          contentArea.append(back, host);
          stopCurrent = mountListeningTest(host, [s], false, false);
        });
        list.append(c);
      });
      if (!SECTIONS.length) list.append(h('p', 'ie-note', t('listening.no_sections', undefined, 'No sections loaded yet.')));
      contentArea.append(list);
    } else {
      dictationTabBtn.classList.add('is-on');
      practiceTabBtn.classList.remove('is-on');
      stopCurrent = mountMicroDictationLab(contentArea);
    }
  };

  practiceTabBtn.addEventListener('click', () => {
    if (activeTab === 'practice') return;
    AcousticHaptics.tap();
    HapticEngine.trigger('selection');
    activeTab = 'practice';
    renderCurrentTab();
  });

  dictationTabBtn.addEventListener('click', () => {
    if (activeTab === 'dictation') return;
    AcousticHaptics.tap();
    HapticEngine.trigger('selection');
    activeTab = 'dictation';
    renderCurrentTab();
  });

  renderCurrentTab();

  return () => {
    stopCurrent();
  };
}
