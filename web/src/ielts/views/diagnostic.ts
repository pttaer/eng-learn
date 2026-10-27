// web/src/ielts/views/diagnostic.ts
import courseData from '../../assets/data/ielts-course.json';
import { DiagnosticEngine, DiagnosticQuestion, DiagnosticReport } from '../diagnostic-engine';
import { esc, h } from '../ui';
import { feedback } from '../../core/feedback';
import { icon, IconName } from '../../utils/icons';

const SUBTYPE_NAMES: Record<string, string> = {
  subject_verb: 'Subject-Verb Concord',
  tenses: 'Tense Consistency & Aspect',
  articles: 'Article Omission & Precision',
  clauses: 'Clausal Subordination & Modifiers',
  prepositions: 'Dependent Prepositions',
  collocations: 'Academic Collocations'
};

const SUBTYPE_ICONS: Record<string, IconName> = {
  subject_verb: 'scale',
  tenses: 'clock',
  articles: 'edit',
  clauses: 'layers',
  prepositions: 'target',
  collocations: 'book'
};

export function diagnosticView(root: HTMLElement): () => void {
  const questions: DiagnosticQuestion[] = (courseData as { diagnostics: DiagnosticQuestion[] }).diagnostics || [];
  let userAnswers: Record<string, number> = {};
  let currentFilter: 'all' | 'grammar' | 'vocabulary' = 'all';

  // Load existing profile if available
  let cachedReport = DiagnosticEngine.getDiagnosticProfile();
  let showingResults = false;

  const container = h('div', 'ie-diagnostic-view');

  function render(): void {
    container.innerHTML = '';

    // Hero Header
    const header = h('div', 'ie-diag-header');
    header.innerHTML = `
      <div class="ie-diag-badge-row">
        <span class="ie-pill ie-pill-accent">Foundation Checkpoint</span>
        <span class="ie-pill ie-pill-neutral">20 Questions • 15 Mins</span>
      </div>
      <h1 class="ie-title">Grammar &amp; Vocabulary Diagnostic</h1>
      <p class="ie-lead ie-diag-lead">
        Identify and isolate high-frequency morphosyntactic and lexical flaws. Calibrated against IELTS band descriptors 5.5–8.5+.
      </p>
    `;
    container.append(header);

    // If already completed or showing results, render results dashboard
    if (showingResults && cachedReport) {
      renderResults(cachedReport);
      return;
    }

    // Previous Report banner if one exists and user hasn't yet started/completed current session
    if (cachedReport && Object.keys(userAnswers).length === 0) {
      const banner = h('div', 'ie-diag-cached-banner');
      banner.innerHTML = `
        <div class="ie-cached-info">
          <span class="ie-cached-label">Previous Diagnostic Record</span>
          <span class="ie-cached-score"><strong>${esc(cachedReport.bandEstimate)}</strong> (${cachedReport.score}/20 — ${cachedReport.percentage}%)</span>
          <span class="ie-cached-date">Recorded on ${new Date(cachedReport.timestamp).toLocaleDateString()}</span>
        </div>
        <div class="ie-cached-actions">
          <button class="ie-btn ie-btn-sm ie-btn-primary" id="btn-view-cached">View Analysis & Study Plan</button>
          <button class="ie-btn ie-btn-sm ie-btn-outline" id="btn-retake-new">Retake Diagnostic</button>
        </div>
      `;
      banner.querySelector('#btn-view-cached')?.addEventListener('click', () => {
        showingResults = true;
        render();
      });
      banner.querySelector('#btn-retake-new')?.addEventListener('click', () => {
        userAnswers = {};
        cachedReport = null;
        render();
      });
      container.append(banner);
    }

    // Progress Bar and Controls
    const totalCount = questions.length;
    const answeredCount = Object.keys(userAnswers).length;
    const progressPercent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

    const toolbar = h('div', 'ie-diag-toolbar');
    toolbar.innerHTML = `
      <div class="ie-diag-filter-tabs">
        <button class="ie-tab-btn ${currentFilter === 'all' ? 'is-active' : ''}" data-filter="all">All (${totalCount})</button>
        <button class="ie-tab-btn ${currentFilter === 'grammar' ? 'is-active' : ''}" data-filter="grammar">Grammar (10)</button>
        <button class="ie-tab-btn ${currentFilter === 'vocabulary' ? 'is-active' : ''}" data-filter="vocabulary">Vocabulary (10)</button>
      </div>
      <div class="ie-diag-progress-wrap">
        <div class="ie-diag-progress-label">
          <span>Progress: <strong>${answeredCount}/${totalCount}</strong> answered</span>
          <span>${progressPercent}%</span>
        </div>
        <div class="ie-progress-track">
          <div class="ie-progress-fill" style="width: ${progressPercent}%;"></div>
        </div>
      </div>
    `;

    toolbar.querySelectorAll('.ie-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = (e.currentTarget as HTMLElement).dataset.filter as 'all' | 'grammar' | 'vocabulary';
        currentFilter = filter;
        render();
      });
    });

    container.append(toolbar);

    // Questions list
    const filteredQuestions = questions.filter(q => {
      if (currentFilter === 'all') return true;
      return q.category === currentFilter;
    });

    const list = h('div', 'ie-diag-qlist');

    filteredQuestions.forEach(q => {
      const qNum = questions.indexOf(q) + 1;
      const isAnswered = q.id in userAnswers;
      const userChoice = userAnswers[q.id];
      const isCorrect = isAnswered && userChoice === q.correctIndex;

      const card = h('article', `ie-diag-card ${isAnswered ? (isCorrect ? 'is-answered-correct' : 'is-answered-incorrect') : ''}`);
      card.id = `q-${q.id}`;

      const subtypeName = SUBTYPE_NAMES[q.subType] || q.subType;
      const subIconKey = SUBTYPE_ICONS[q.subType] || 'book';

      card.innerHTML = `
        <div class="ie-diag-card-head">
          <div class="ie-diag-meta">
            <span class="ie-diag-number">Q${qNum}</span>
            <span class="ie-pill ie-pill-${q.category === 'grammar' ? 'blue' : 'purple'}">${esc(q.category.toUpperCase())}</span>
            <span class="ie-pill ie-pill-sub">${icon(subIconKey, 11)} ${esc(subtypeName)}</span>
          </div>
          ${isAnswered ? `
            <span class="ie-diag-result-status ${isCorrect ? 'is-status-correct' : 'is-status-incorrect'}">
              ${isCorrect ? '✓ Correct' : '✗ Incorrect'}
            </span>
          ` : '<span class="ie-diag-unanswered">Pending</span>'}
        </div>
        <p class="ie-diag-prompt">${esc(q.prompt)}</p>
        <div class="ie-diag-options">
          ${q.options.map((opt, optIdx) => {
            const letter = String.fromCharCode(65 + optIdx);
            let optCls = 'ie-diag-opt';
            if (isAnswered) {
              if (optIdx === q.correctIndex) {
                optCls += ' is-target-correct';
              }
              if (optIdx === userChoice) {
                optCls += isCorrect ? ' is-selected-correct' : ' is-selected-incorrect';
              }
            }
            return `
              <button class="${optCls}" data-qid="${esc(q.id)}" data-opt="${optIdx}">
                <span class="ie-opt-letter">${letter}</span>
                <span class="ie-opt-text">${esc(opt)}</span>
              </button>
            `;
          }).join('')}
        </div>
        ${isAnswered ? `
          <div class="ie-diag-explanation">
            <div class="ie-explain-header">
              <strong>${isCorrect ? 'Explanation:' : 'Why this error matters:'}</strong>
            </div>
            <p class="ie-explain-text">${esc(q.explanation)}</p>
            <div class="ie-impact-alert">
              <span class="ie-impact-icon">${icon('alertTriangle', 14)}</span>
              <span class="ie-impact-text"><strong>Impact on Band:</strong> ${esc(q.impactOnBand)}</span>
            </div>
          </div>
        ` : ''}
      `;

      // Event listeners for option buttons
      card.querySelectorAll('.ie-diag-opt').forEach(optBtn => {
        optBtn.addEventListener('click', (e) => {
          const btn = e.currentTarget as HTMLElement;
          const qId = btn.dataset.qid!;
          const optIdx = parseInt(btn.dataset.opt!, 10);
          userAnswers[qId] = optIdx;
          render();
          const answered = questions.find(item => item.id === qId);
          const answeredCard = document.getElementById(`q-${qId}`);
          if (answered && answeredCard) {
            feedback.emit(
              {
                type: 'answer',
                result: optIdx === answered.correctIndex ? 'correct' : 'wrong',
                why: answered.explanation,
                mode: 'practice'
              },
              answeredCard
            );
          }
        });
      });

      list.append(card);
    });

    container.append(list);

    // Bottom Action Bar
    const bottomBar = h('div', 'ie-diag-bottom-bar');
    const allAnswered = Object.keys(userAnswers).length === questions.length;

    bottomBar.innerHTML = `
      <div class="ie-bottom-info">
        <span>${answeredCount}/${totalCount} questions evaluated.</span>
        ${!allAnswered ? '<span class="ie-bottom-hint">Answer all 20 questions to generate a full error taxonomy and study roadmap.</span>' : '<span class="ie-bottom-hint is-ready">All items answered! Ready for final evaluation.</span>'}
      </div>
      <div class="ie-bottom-actions">
        <button class="ie-btn ie-btn-primary ${answeredCount >= 5 ? '' : 'is-disabled'}" id="btn-finish-eval">
          ${allAnswered ? 'Generate Full Assessment & Study Plan' : `Evaluate Progress (${answeredCount}/${totalCount})`}
        </button>
      </div>
    `;

    bottomBar.querySelector('#btn-finish-eval')?.addEventListener('click', () => {
      if (answeredCount < 1) return;
      cachedReport = DiagnosticEngine.evaluateDiagnostic(userAnswers, questions);
      DiagnosticEngine.saveDiagnosticProfile(cachedReport);
      showingResults = true;
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    container.append(bottomBar);
  }

  function renderResults(report: DiagnosticReport): void {
    const dashboard = h('div', 'ie-diag-dashboard');

    // Hero Results Banner
    const isBand7Plus = report.percentage >= 80;
    const hero = h('div', `ie-results-hero ${isBand7Plus ? 'is-high-band' : 'is-mid-band'}`);
    hero.innerHTML = `
      <div class="ie-hero-score-block">
        <span class="ie-hero-eyebrow">Estimated Band Baseline</span>
        <div class="ie-hero-band">${esc(report.bandEstimate)}</div>
        <div class="ie-hero-fraction">Score: <strong>${report.score} / ${report.totalQuestions}</strong> (${report.percentage}%)</div>
      </div>
      <div class="ie-hero-summary">
        <h3>${isBand7Plus ? 'Band 7.0+ Structural Foundations Confirmed' : 'Systematic Error Vectors Cap Band Score'}</h3>
        <p>
          ${isBand7Plus
            ? 'Your grammatical control and academic lexical choices demonstrate the consistency required for Band 7.0–8.0. Focus on high-level clausal variety and stylistic concision.'
            : 'Specific recurring errors in sentence architecture and lexical collocation are currently capping your Grammatical Range & Accuracy (GRA) and Lexical Resource (LR). Follow the targeted prescriptions below.'}
        </p>
        <div class="ie-hero-cta">
          <button class="ie-btn ie-btn-sm ie-btn-secondary" id="btn-retake-quiz">Retake Assessment</button>
          <a class="ie-btn ie-btn-sm ie-btn-outline" href="#writing">Open Writing Workbench →</a>
        </div>
      </div>
    `;

    hero.querySelector('#btn-retake-quiz')?.addEventListener('click', () => {
      showingResults = false;
      userAnswers = {};
      render();
    });

    dashboard.append(hero);

    // Section 1: Error Taxonomy Breakdown (6 Vectors)
    const taxonomySec = h('section', 'ie-diag-sec');
    taxonomySec.innerHTML = `
      <div class="ie-sec-header">
        <h2>6-Vector Error Taxonomy Breakdown</h2>
        <p class="ie-sec-desc">Granular accuracy scores across the six most common failure points in academic exam writing.</p>
      </div>
    `;

    const grid = h('div', 'ie-taxonomy-grid');
    const subTypes = Object.keys(report.subTypeBreakdown);

    subTypes.forEach(st => {
      const summary = report.subTypeBreakdown[st];
      const name = SUBTYPE_NAMES[st] || st;
      const iconKey = SUBTYPE_ICONS[st] || 'target';
      const pct = summary.percentage;
      const statusCls = pct >= 80 ? 'good' : pct >= 50 ? 'warning' : 'danger';
      const statusLabel = pct >= 80 ? 'Mastered (Band 7.0+)' : pct >= 50 ? 'At Risk (Band 6.0-6.5)' : 'Critical Flaw (< Band 6.0)';

      const flaw = report.flawsDetected.find(f => f.subType === st);

      const card = h('article', `ie-taxonomy-card ie-card-status-${statusCls}`);
      card.innerHTML = `
        <div class="ie-tax-head">
          <div class="ie-tax-title">
            <span class="ie-tax-icon">${icon(iconKey, 14)}</span>
            <div>
              <h4>${esc(name)}</h4>
              <span class="ie-tax-status ie-status-${statusCls}">${statusLabel}</span>
            </div>
          </div>
          <div class="ie-tax-pct">${pct}%</div>
        </div>
        <div class="ie-tax-bar-track">
          <div class="ie-tax-bar-fill ie-bar-${statusCls}" style="width: ${pct}%;"></div>
        </div>
        <div class="ie-tax-ratio">${summary.correct} of ${summary.total} correct</div>
        <div class="ie-tax-body">
          <p class="ie-tax-rec"><strong>Prescription:</strong> ${esc(flaw ? flaw.recommendation : 'Maintain active recall and audit for slips under time pressure.')}</p>
          <p class="ie-tax-impact"><strong>Rubric Impact:</strong> ${esc(flaw ? flaw.impactOnBand : 'Contributes positively toward Band 7.5+ GRA/LR.')}</p>
        </div>
      `;
      grid.append(card);
    });

    taxonomySec.append(grid);
    dashboard.append(taxonomySec);

    // Section 2: Pre-Flight Editing Checklist
    if (report.checklistItems.length > 0) {
      const checklistSec = h('section', 'ie-diag-sec');
      checklistSec.innerHTML = `
        <div class="ie-sec-header">
          <h2>Pre-Flight Self-Correction Checklist</h2>
          <p class="ie-sec-desc">Before submitting Task 1 or Task 2 essays, audit your drafts against these detected vulnerability rules.</p>
        </div>
        <ul class="ie-checklist-items">
          ${report.checklistItems.map(item => `
            <li class="ie-check-item">
              <span class="ie-check-bullet">☑</span>
              <span class="ie-check-text">${esc(item)}</span>
            </li>
          `).join('')}
        </ul>
      `;
      dashboard.append(checklistSec);
    }

    // Section 3: Personalized Study Plan
    const planSec = h('section', 'ie-diag-sec');
    planSec.innerHTML = `
      <div class="ie-sec-header">
        <h2>Personalized Band 7+ Remediation Roadmap</h2>
        <p class="ie-sec-desc">Direct 4-step path forward calibrated to your current diagnostic profile.</p>
      </div>
      <div class="ie-roadmap-grid">
        <div class="ie-roadmap-card">
          <div class="ie-roadmap-step">Step 1</div>
          <h4>Targeted Clausal & Morphosyntactic Drills</h4>
          <p>Prioritize remediation on your lowest scoring vectors (${report.flawsDetected.map(f => SUBTYPE_NAMES[f.subType] || f.subType).slice(0, 2).join(', ') || 'lexical register'}).</p>
          <a class="ie-roadmap-link" href="#strategy">Review Question Strategy & Traps →</a>
        </div>
        <div class="ie-roadmap-card">
          <div class="ie-roadmap-step">Step 2</div>
          <h4>Task 1 Visual Overview & Data Grouping</h4>
          <p>Master the Keino Campbell 2-Sentence Overview rule and practice grouping dynamic vs static datasets.</p>
          <a class="ie-roadmap-link" href="#writing">Open Task 1 Formula Inspector →</a>
        </div>
        <div class="ie-roadmap-card">
          <div class="ie-roadmap-step">Step 3</div>
          <h4>Task 2 4-Sentence Paragraph Workbench</h4>
          <p>Compose essays using strictly 4 sentences per body paragraph (Topic -> Explanation -> Evidence -> Impact).</p>
          <a class="ie-roadmap-link" href="#writing">Launch Paragraph Workbench →</a>
        </div>
        <div class="ie-roadmap-card">
          <div class="ie-roadmap-step">Step 4</div>
          <h4>Timed Mock Simulation & AES Feedback</h4>
          <p>Run full-length timed mock tests and evaluate clausal complexity (MLT, clausal density) in the AES Engine.</p>
          <a class="ie-roadmap-link" href="#mock">Start Computer-Delivered Mock →</a>
        </div>
      </div>
    `;
    dashboard.append(planSec);

    container.append(dashboard);
  }

  root.append(container);
  render();

  return () => {
    container.remove();
  };
}
