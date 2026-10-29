import readingData from '../data/reading.json';
import { ReadingPassage, UserHighlight, TextOffsetRange, EvidenceAnchor } from '../types';
import { rawToBand } from '../bands';
import { addAttempt } from '../progress';
import { QuestionForm, renderQuestions, typeBreakdown } from '../questions';
import { SetScore } from '../scoring';
import { bandBadge, countdown, Countdown, esc, fmtTime, h } from '../ui';
import { renderParagraphSpans, mergeHighlightRanges } from '../reading-engine';
import { icon } from '../../utils/icons';
import { t } from '../../core/i18n';
import { StorageManager } from '../../utils/storage';

const PASSAGES = readingData as ReadingPassage[];

export interface TestResult { raw: number; of: number; band: number; byType: SetScore['byType'] }

function getRangeOffsets(
  paraEl: HTMLElement,
  range: Range
): { start: number; end: number } | null {
  const startsInLabel = (range.startContainer.nodeType === Node.TEXT_NODE &&
    (range.startContainer.parentElement as HTMLElement)?.closest('.ie-plabel')) ||
    (range.startContainer as HTMLElement)?.classList?.contains('ie-plabel');
  const endsInLabel = (range.endContainer.nodeType === Node.TEXT_NODE &&
    (range.endContainer.parentElement as HTMLElement)?.closest('.ie-plabel')) ||
    (range.endContainer as HTMLElement)?.classList?.contains('ie-plabel');

  // If selection is entirely contained within the paragraph label itself, ignore
  if (startsInLabel && endsInLabel && paraEl.contains(range.startContainer) && paraEl.contains(range.endContainer)) {
    return null;
  }

  const startsInside = paraEl.contains(range.startContainer) && !startsInLabel;
  const endsInside = paraEl.contains(range.endContainer) && !endsInLabel;

  let currentOffset = 0;
  let start = startsInside ? -1 : 0;
  let end = -1;

  const walker = document.createTreeWalker(paraEl, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if ((node.parentElement as HTMLElement)?.closest('.ie-plabel')) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  let node: Node | null;
  while ((node = walker.nextNode())) {
    const len = node.textContent?.length || 0;
    if (startsInside && node === range.startContainer) {
      start = currentOffset + range.startOffset;
    }
    if (endsInside && node === range.endContainer) {
      end = currentOffset + range.endOffset;
    }
    currentOffset += len;
  }

  if (currentOffset === 0) return null;

  if (!endsInside) {
    end = currentOffset;
  }

  if (start === -1 && range.startContainer === paraEl) {
    start = 0;
  }
  if (end === -1 && range.endContainer === paraEl) {
    end = currentOffset;
  }

  if (start !== -1 && end !== -1 && start < end) {
    return {
      start: Math.max(0, start),
      end: Math.min(currentOffset, end)
    };
  }
  return null;
}

function renderPassageContent(
  article: HTMLElement,
  p: ReadingPassage,
  highlights: UserHighlight[],
  transientEvidence?: EvidenceAnchor
): void {
  const h2 = article.querySelector('h2');
  const returnChip = article.querySelector('.ie-return-chip');
  article.innerHTML = '';
  if (h2) article.append(h2);
  else article.append(h('h2', '', esc(p.title)));
  if (returnChip) article.append(returnChip);

  p.paragraphs.forEach((para, i) => {
    const pEl = h('p', 'ie-para');
    pEl.dataset.paraIndex = String(i);
    const label = h('b', 'ie-plabel', para.label);
    pEl.append(label);
    const paraMarks = highlights.filter(m => m.paraIndex === i);
    const paraEvidence = (transientEvidence && transientEvidence.paraIndex === i)
      ? transientEvidence
      : undefined;
    pEl.append(renderParagraphSpans(para.text, paraMarks, paraEvidence));
    article.append(pEl);
  });
}

/** Runs one or more passages as a single timed test. Used by practice (1 passage, 20 min) and the mock (3 passages, 60 min). */
export function mountReadingTest(
  root: HTMLElement,
  passages: ReadingPassage[],
  minutes: number,
  mock: boolean,
  onDone?: (r: TestResult) => void
): () => void {
  root.innerHTML = '';
  let timer: Countdown | null = null;
  const bar = h('div', 'ie-testbar');
  const clock = h('span', 'ie-clock');
  const submit = h('button', 'ie-btn ie-btn-primary', t('ielts.submit_answers', undefined, 'Submit answers'));
  const tabs = h('div', 'ie-tabs');

  let studyMode = StorageManager.getStudyMode();
  const modeBtn = h('button', 'ie-btn ie-mode-toggle');
  modeBtn.type = 'button';
  const syncModeBtn = () => {
    const isDeep = studyMode === 'deep-study';
    modeBtn.textContent = isDeep ? '⚡ Deep Study' : '⏱️ Exam Sprint';
    modeBtn.title = isDeep ? 'Deep Study: Check answers & explanations immediately' : 'Exam Sprint: Timed exam simulation, answers revealed after submission';
  };
  syncModeBtn();
  modeBtn.addEventListener('click', () => {
    studyMode = studyMode === 'deep-study' ? 'exam-sprint' : 'deep-study';
    StorageManager.setStudyMode(studyMode);
    syncModeBtn();
  });
  bar.append(clock, modeBtn, tabs, submit);

  // Reader Ergonomics Bar (Font Size A-/A+, Font Family, Line-Height)
  const FONT_SIZES = ['14px', '16px', '18px', '20px'];
  let currentFontSizeIdx = Math.max(0, FONT_SIZES.indexOf(localStorage.getItem('eng_reader_font_size') || '16px'));
  if (currentFontSizeIdx === -1) currentFontSizeIdx = 1;
  let isSerif = localStorage.getItem('eng_reader_font_family') === 'serif';
  let isRelaxed = localStorage.getItem('eng_reader_line_height') === '1.85';

  const applyErgonomics = () => {
    const size = FONT_SIZES[currentFontSizeIdx];
    const family = isSerif ? 'Georgia, Cambria, "Times New Roman", serif' : 'var(--font-sans, system-ui, sans-serif)';
    const lineHeight = isRelaxed ? '1.85' : '1.55';
    panes.forEach(pane => {
      const pText = pane.querySelector<HTMLElement>('.ie-passage');
      if (pText) {
        pText.style.setProperty('--passage-font-size', size);
        pText.style.fontSize = size;
        pText.style.fontFamily = family;
        pText.style.lineHeight = lineHeight;
      }
    });
    localStorage.setItem('eng_reader_font_size', size);
    localStorage.setItem('eng_reader_font_family', isSerif ? 'serif' : 'sans');
    localStorage.setItem('eng_reader_line_height', isRelaxed ? '1.85' : '1.55');
  };

  const ergoBar = h('div', 'ie-reader-ergobar');
  ergoBar.style.cssText = 'display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 12px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-hairline); border-radius: var(--radius-squircle-sm, 8px); margin: 6px 0; flex-wrap: wrap; font-size: 13px;';

  const updateErgoBarHtml = () => {
    ergoBar.innerHTML = `
      <div style="display: flex; align-items: center; gap: 6px;">
        <span style="font-size: var(--font-kicker); font-weight: 700; color: var(--ink-muted); text-transform: uppercase;">Cỡ chữ:</span>
        <button type="button" class="ie-btn ie-btn-sm ie-ergo-font-minus" style="min-height: 32px; padding: 2px 10px; font-weight: 700;" ${currentFontSizeIdx === 0 ? 'disabled' : ''}>A-</button>
        <span style="font-family: var(--font-mono); font-size: 12px; min-width: 32px; text-align: center; color: var(--accent-gold);">${FONT_SIZES[currentFontSizeIdx]}</span>
        <button type="button" class="ie-btn ie-btn-sm ie-ergo-font-plus" style="min-height: 32px; padding: 2px 10px; font-weight: 700;" ${currentFontSizeIdx === FONT_SIZES.length - 1 ? 'disabled' : ''}>A+</button>
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        <button type="button" class="ie-btn ie-btn-sm ie-ergo-font-family ${isSerif ? 'active' : ''}" style="min-height: 32px; padding: 2px 12px;">
          ${isSerif ? '📖 Serif' : '🔤 Sans'}
        </button>
        <button type="button" class="ie-btn ie-btn-sm ie-ergo-line-height ${isRelaxed ? 'active' : ''}" style="min-height: 32px; padding: 2px 12px;">
          ${isRelaxed ? '↕ Giãn rộng' : '↕ Giãn chuẩn'}
        </button>
      </div>
    `;
    ergoBar.querySelector('.ie-ergo-font-minus')?.addEventListener('click', () => {
      if (currentFontSizeIdx > 0) {
        currentFontSizeIdx--;
        applyErgonomics();
        updateErgoBarHtml();
      }
    });
    ergoBar.querySelector('.ie-ergo-font-plus')?.addEventListener('click', () => {
      if (currentFontSizeIdx < FONT_SIZES.length - 1) {
        currentFontSizeIdx++;
        applyErgonomics();
        updateErgoBarHtml();
      }
    });
    ergoBar.querySelector('.ie-ergo-font-family')?.addEventListener('click', () => {
      isSerif = !isSerif;
      applyErgonomics();
      updateErgoBarHtml();
    });
    ergoBar.querySelector('.ie-ergo-line-height')?.addEventListener('click', () => {
      isRelaxed = !isRelaxed;
      applyErgonomics();
      updateErgoBarHtml();
    });
  };
  updateErgoBarHtml();

  const highlightsMap = new Map<string, UserHighlight[]>();
  const scrollMap = new Map<string, { passage: number; questions: number }>();
  passages.forEach(p => {
    highlightsMap.set(p.id, []);
    scrollMap.set(p.id, { passage: 0, questions: 0 });
  });

  let currentPassageIndex = 0;
  let mobilePane: 'passage' | 'questions' = 'passage';
  let activeEvidence: EvidenceAnchor | undefined = undefined;

  // Floating selection action pill
  const pill = h('div', 'ie-selection-pill');
  pill.hidden = true;
  pill.innerHTML = `
    <button type="button" class="ie-pill-btn ie-pill-mark" title="Highlight text">🖍️ Highlight</button>
    <button type="button" class="ie-pill-btn ie-pill-clear" title="Clear selection">✕ Clear</button>
  `;
  root.append(pill);

  // Mobile persistent bottom dock
  const dock = h('nav', 'ie-reading-dock');
  const dockClock = h('span', 'ie-dock-clock', t('ielts.untimed', undefined, 'Untimed'));
  const dockPassageBtn = h('button', 'ie-dock-tab is-active', `📖 ${t('ielts.passage', undefined, 'Passage')}`);
  dockPassageBtn.type = 'button';
  const dockQuestionsBtn = h('button', 'ie-dock-tab', `✍️ ${t('ielts.questions_label', undefined, 'Questions')} (0/${passages[0]?.questions.length || 0})`);
  dockQuestionsBtn.type = 'button';
  dock.append(dockClock, dockPassageBtn, dockQuestionsBtn);

  const answeredCounts = passages.map(() => 0);

  const updateDockCounter = (passageIdx: number) => {
    const p = passages[passageIdx];
    if (!p) return;
    const answered = answeredCounts[passageIdx] || 0;
    dockQuestionsBtn.textContent = `✍️ ${t('ielts.questions_label', undefined, 'Questions')} (${answered}/${p.questions.length})`;
  };

  const switchMobilePane = (target: 'passage' | 'questions', overrideScroll = false) => {
    const p = passages[currentPassageIndex];
    const pane = panes[currentPassageIndex];
    const cur = scrollMap.get(p.id) || { passage: 0, questions: 0 };

    if (typeof window !== 'undefined') {
      if (mobilePane === 'passage') {
        cur.passage = window.scrollY;
      } else {
        cur.questions = window.scrollY;
      }
      scrollMap.set(p.id, cur);
    }

    mobilePane = target;
    if (pane) {
      pane.dataset.mobilePane = target;
    }

    dockPassageBtn.classList.toggle('is-active', target === 'passage');
    dockQuestionsBtn.classList.toggle('is-active', target === 'questions');

    if (!overrideScroll && typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      const restoreY = target === 'passage' ? cur.passage : cur.questions;
      requestAnimationFrame(() => {
        window.scrollTo({ top: restoreY, behavior: 'instant' as ScrollBehavior });
      });
    }
  };

  dockPassageBtn.addEventListener('click', () => switchMobilePane('passage'));
  dockQuestionsBtn.addEventListener('click', () => switchMobilePane('questions'));

  const panes: HTMLElement[] = [];
  const forms: QuestionForm[] = [];
  let n = 1;

  passages.forEach((p, i) => {
    const pane = h('section', 'ie-split');
    pane.dataset.mobilePane = mobilePane;
    pane.hidden = i > 0;

    const text = h('article', 'ie-passage');
    renderPassageContent(text, p, highlightsMap.get(p.id) || [], undefined);

    // Tapping existing mark shows floating action pill to remove it
    text.addEventListener('click', (e) => {
      const mark = (e.target as HTMLElement).closest<HTMLElement>('.ie-mark');
      if (!mark) return;
      const pEl = mark.closest<HTMLElement>('.ie-para');
      if (!pEl) return;
      const pIdx = Number(pEl.dataset.paraIndex);
      const start = Number(mark.dataset.start);
      const end = Number(mark.dataset.end);

      const rect = mark.getBoundingClientRect();
      pill.innerHTML = `
        <button type="button" class="ie-pill-btn ie-pill-remove-mark" title="${t('reading.btn_remove_highlight', undefined, 'Remove highlight')}">${t('reading.btn_remove_highlight', undefined, '🗑️ Remove highlight')}</button>
        <button type="button" class="ie-pill-btn ie-pill-cancel" title="${t('common.cancel', undefined, 'Cancel')}">✕</button>
      `;
      pill.hidden = false;
      pill.style.position = 'fixed';
      pill.style.top = `${Math.max(10, rect.top - 48)}px`;
      pill.style.left = `${Math.max(10, rect.left + rect.width / 2)}px`;

      const onRemove = () => {
        const current = highlightsMap.get(p.id) || [];
        const updated = current.filter(h => !(h.paraIndex === pIdx && h.start < end && h.end > start));
        highlightsMap.set(p.id, updated);
        renderPassageContent(text, p, updated, activeEvidence);
        pill.hidden = true;
      };
      const onCancel = () => {
        pill.hidden = true;
      };

      pill.querySelector('.ie-pill-remove-mark')?.addEventListener('click', onRemove, { once: true });
      pill.querySelector('.ie-pill-cancel')?.addEventListener('click', onCancel, { once: true });
    });

    const form = renderQuestions(p.questions, n, (answered, total) => {
      answeredCounts[i] = answered;
      if (i === currentPassageIndex) {
        dockQuestionsBtn.textContent = `✍️ ${t('ielts.questions_label', undefined, 'Questions')} (${answered}/${total})`;
      }
    });
    n += p.questions.length;

    // Evidence cross-linking delegated handler
    pane.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.ie-btn-inspect-evidence');
      if (!btn) return;
      const qid = btn.dataset.qid;
      if (!qid) return;
      const q = p.questions.find(x => x.id === qid);
      if (!q || !q.evidence) return;

      activeEvidence = q.evidence;
      renderPassageContent(text, p, highlightsMap.get(p.id) || [], activeEvidence);

      // Switch to passage view, overriding scroll restoration
      switchMobilePane('passage', true);

      // Scroll target paragraph or evidence span into view
      const targetPara = text.querySelector<HTMLElement>(`[data-para-index="${q.evidence.paraIndex}"]`);
      const targetSpan = targetPara?.querySelector<HTMLElement>('.ie-evidence') || targetPara;
      targetSpan?.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Render sticky return chip at top of passage
      let chip = text.querySelector<HTMLElement>('.ie-return-chip');
      if (!chip) {
        chip = h('div', 'ie-return-chip');
        text.prepend(chip);
      }
      const card = pane.querySelector<HTMLElement>(`[data-qid="${qid}"]`);
      const qNum = card?.querySelector('.ie-q-n')?.textContent ||
        String(passages.slice(0, i).reduce((sum, prevP) => sum + prevP.questions.length, 0) + p.questions.findIndex(x => x.id === qid) + 1);
      chip.innerHTML = `<button type="button" class="ie-btn-return">${t('reading.btn_back_to_q', { qNum }, `↩ Back to Question #${qNum}`)}</button>`;
      chip.querySelector('.ie-btn-return')!.addEventListener('click', () => {
        switchMobilePane('questions', true);
        chip?.remove();
        activeEvidence = undefined;
        renderPassageContent(text, p, highlightsMap.get(p.id) || [], undefined);

        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.setAttribute('tabindex', '-1');
          card.focus({ preventScroll: true });
        }
      });
    });

    const qs = h('div', 'ie-qcol');
    qs.append(form.el);
    pane.append(text, qs);
    panes.push(pane);
    forms.push(form);

    const tabBtn = h('button', 'ie-tab' + (i === 0 ? ' is-on' : ''), passages.length > 1 ? `${t('ielts.passage', undefined, 'Passage')} ${i + 1}` : t('ielts.passage', undefined, 'Passage'));
    tabBtn.addEventListener('click', () => {
      const oldP = passages[currentPassageIndex];
      const cur = scrollMap.get(oldP.id) || { passage: 0, questions: 0 };
      if (typeof window !== 'undefined') {
        if (mobilePane === 'passage') cur.passage = window.scrollY;
        else cur.questions = window.scrollY;
        scrollMap.set(oldP.id, cur);
      }

      currentPassageIndex = i;
      panes.forEach((x, j) => {
        x.hidden = j !== i;
        if (j === i) x.dataset.mobilePane = mobilePane;
      });
      tabs.querySelectorAll('.ie-tab').forEach((x, j) => x.classList.toggle('is-on', j === i));
      updateDockCounter(i);

      const newP = passages[i];
      const newCur = scrollMap.get(newP.id) || { passage: 0, questions: 0 };
      if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
        const restoreY = mobilePane === 'passage' ? newCur.passage : newCur.questions;
        requestAnimationFrame(() => {
          window.scrollTo({ top: restoreY, behavior: 'instant' as ScrollBehavior });
        });
      }
    });
    tabs.append(tabBtn);
  });

  const result = h('section', 'ie-result');
  result.hidden = true;
  root.append(bar, ergoBar, ...panes, dock, result);
  applyErgonomics();

  // Soft keyboard dock handling with 100ms debounce
  let keyboardTimer: ReturnType<typeof setTimeout> | null = null;
  const onFocusIn = (e: FocusEvent) => {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      if (keyboardTimer) {
        clearTimeout(keyboardTimer);
        keyboardTimer = null;
      }
      dock.classList.add('is-keyboard-open');
    }
  };
  const onFocusOut = (e: FocusEvent) => {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      if (keyboardTimer) clearTimeout(keyboardTimer);
      keyboardTimer = setTimeout(() => {
        dock.classList.remove('is-keyboard-open');
      }, 100);
    }
  };
  root.addEventListener('focusin', onFocusIn);
  root.addEventListener('focusout', onFocusOut);

  // Floating highlight pill logic
  const renderSelectionPillButtons = () => {
    pill.innerHTML = `
      <button type="button" class="ie-pill-btn ie-pill-mark" title="${t('reading.btn_highlight', undefined, 'Highlight text')}">${t('reading.btn_highlight', undefined, '🖍️ Highlight')}</button>
      <button type="button" class="ie-pill-btn ie-pill-clear" title="${t('reading.btn_clear', undefined, 'Clear selection')}">${t('reading.btn_clear', undefined, '✕ Clear')}</button>
    `;
    pill.querySelector('.ie-pill-mark')?.addEventListener('click', onMarkClick);
    pill.querySelector('.ie-pill-clear')?.addEventListener('click', onClearClick);
  };

  const onMarkClick = () => {
    if (typeof window === 'undefined' || typeof window.getSelection !== 'function') return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const p = passages[currentPassageIndex];
    const pane = panes[currentPassageIndex];
    const article = pane?.querySelector('.ie-passage') as HTMLElement;
    if (!article) return;

    const paras = Array.from(article.querySelectorAll<HTMLElement>('.ie-para'));
    const newRanges: TextOffsetRange[] = [];

    paras.forEach(pEl => {
      const pIdx = Number(pEl.dataset.paraIndex);
      if (!sel.containsNode(pEl, true)) return;
      const offsets = getRangeOffsets(pEl, range);
      if (offsets) {
        newRanges.push({ paraIndex: pIdx, start: offsets.start, end: offsets.end });
      }
    });

    if (newRanges.length) {
      const current = highlightsMap.get(p.id) || [];
      const merged = mergeHighlightRanges([...current, ...newRanges]);
      highlightsMap.set(p.id, merged.map((r, idx) => ({ ...r, id: `h_${idx}_${Date.now()}` })));
      renderPassageContent(article, p, highlightsMap.get(p.id) || [], activeEvidence);
    }

    sel.removeAllRanges();
    pill.hidden = true;
  };

  const onClearClick = () => {
    if (typeof window !== 'undefined' && typeof window.getSelection === 'function') {
      window.getSelection()?.removeAllRanges();
    }
    pill.hidden = true;
  };

  const updateSelectionPill = () => {
    if (typeof window === 'undefined' || typeof window.getSelection !== 'function') return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) {
      // Don't auto-hide if a mark action menu is showing
      if (!pill.querySelector('.ie-pill-remove-mark')) {
        pill.hidden = true;
      }
      return;
    }
    const range = sel.getRangeAt(0);
    const activePane = panes[currentPassageIndex];
    const article = activePane?.querySelector('.ie-passage');
    if (!article || !article.contains(range.commonAncestorContainer)) {
      pill.hidden = true;
      return;
    }
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      pill.hidden = true;
      return;
    }
    renderSelectionPillButtons();
    pill.hidden = false;
    pill.style.position = 'fixed';
    pill.style.top = `${Math.max(10, rect.top - 48)}px`;
    pill.style.left = `${Math.max(10, rect.left + rect.width / 2)}px`;
  };
  document.addEventListener('selectionchange', updateSelectionPill);

  // Media query listener
  const mql = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(max-width: 768px)')
    : null;
  const onMediaChange = () => {
    panes.forEach(pane => {
      pane.dataset.mobilePane = mobilePane;
    });
  };
  if (mql) {
    mql.addEventListener('change', onMediaChange);
  }

  const finish = (): void => {
    timer?.stop();
    submit.disabled = true;
    pill.hidden = true;
    dockClock.textContent = t('ielts.review', undefined, 'Review');
    dockClock.classList.remove('ie-urgent');
    const total: SetScore = { raw: 0, of: 0, byType: {}, wrong: [] };
    forms.forEach(f => {
      const s = f.reveal();
      total.raw += s.raw;
      total.of += s.of;
      for (const [t, v] of Object.entries(s.byType)) {
        const c = (total.byType[t] ||= { ok: 0, n: 0 });
        c.ok += v.ok;
        c.n += v.n;
      }
    });
    dockQuestionsBtn.textContent = `✍️ ${t('ielts.questions_label', undefined, 'Questions')} (${total.raw}/${total.of})`;
    const band = rawToBand('reading', total.raw, total.of);
    addAttempt({ skill: 'reading', itemId: passages.map(p => p.id).join('+'), band, raw: total.raw, of: total.of, byType: total.byType, mock });
    result.hidden = false;
    const correctText = t('reading.result_correct', { raw: total.raw, of: total.of }, `${total.raw}/${total.of} correct`);
    const noteText = `${t('reading.result_note', undefined, 'Band is scaled to 40 questions.')} ${total.of < 40 ? t('reading.short_sets_note', undefined, 'Short sets give a rough guide only.') : ''}`;
    result.innerHTML = `${bandBadge(band, 'Reading')}<div><h3>${correctText}</h3><p class="ie-note">${noteText}</p><ul class="ie-breakdown">${typeBreakdown(total.byType)}</ul></div>`;
    panes.forEach(x => { x.hidden = false; });
    tabs.hidden = true;
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    onDone?.({ raw: total.raw, of: total.of, band, byType: total.byType });
  };

  submit.addEventListener('click', finish);
  if (minutes > 0) {
    timer = countdown(
      minutes * 60,
      l => {
        const formatted = fmtTime(Math.max(0, l));
        clock.textContent = formatted;
        dockClock.textContent = `⏱ ${formatted}`;
        const isUrgent = l <= 120;
        clock.classList.toggle('ie-urgent', isUrgent);
        dockClock.classList.toggle('ie-urgent', isUrgent);
      },
      finish
    );
  } else {
    clock.textContent = t('ielts.untimed', undefined, 'Untimed');
    dockClock.textContent = t('ielts.untimed', undefined, 'Untimed');
  }

  return () => {
    timer?.stop();
    root.removeEventListener('focusin', onFocusIn);
    root.removeEventListener('focusout', onFocusOut);
    document.removeEventListener('selectionchange', updateSelectionPill);
    if (mql) mql.removeEventListener('change', onMediaChange);
    if (keyboardTimer) clearTimeout(keyboardTimer);
    dock.remove();
    pill.remove();
  };
}

export function readingView(root: HTMLElement): () => void {
  let stop = () => { };
  const list = h('div', 'ie-cards');
  const hubBar = h('div', 'ie-reading-hub-actions');
  const drillsLink = h(
    'a',
    'ie-btn ie-btn-primary ie-drills-hero-btn'
  );
  drillsLink.innerHTML = `${icon('target', 14)} ${t('ielts.subnav_attack_drills', undefined, '14 Question-Type Attack Drills Lab')}`;
  drillsLink.id = 'btn-launch-reading-drills';
  drillsLink.href = '#reading-drills';
  hubBar.append(drillsLink);

  root.append(
    h('h1', 'ie-title', t('ielts.nav_reading', undefined, 'Academic Reading')),
    h(
      'p',
      'ie-lead',
      t('ielts.reading_lead', undefined, 'One passage, 20 minutes, 13-14 questions. Same question types as the exam. Submit to see the evidence for every answer.')
    ),
    hubBar,
    list
  );
  PASSAGES.forEach(p => {
    const words = p.paragraphs.reduce((a, x) => a + x.text.split(/\s+/).length, 0);
    const types = [...new Set(p.questions.map(q => q.type))].length;
    const metaText = t('reading.card_meta', { words, questions: p.questions.length, types }, `${words} words · ${p.questions.length} questions · ${types} types`);
    const topicKey = 'ielts.reading_topic_' + p.topic.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const topicLabel = t(topicKey, undefined, p.topic);
    const c = h('button', 'ie-card ie-passage-card ie-card-action', `<b>${esc(p.title)}</b><span>${esc(topicLabel)}</span><small>${metaText}</small><div class="ie-card-affordance" aria-hidden="true">${icon('chevronRight', 16)}</div>`);
    c.addEventListener('click', () => {
      root.innerHTML = '';
      const back = h('button', 'ie-btn', t('ielts.all_passages', undefined, 'All passages'));
      back.addEventListener('click', () => { stop(); root.innerHTML = ''; stop = readingView(root); });
      const host = h('div', 'ie-stage');
      root.append(back, host);
      stop = mountReadingTest(host, [p], 20, false);
    });
    list.append(c);
  });
  if (!PASSAGES.length) list.append(h('p', 'ie-note', t('reading.no_passages', undefined, 'No passages loaded yet.')));
  return () => stop();
}
