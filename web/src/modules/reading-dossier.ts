import { AtomicCard } from '../core/atomic-card';
import { SRSEngine } from '../core/srs-engine';
import { StorageManager } from '../utils/storage';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import readingData from '../assets/data/reading.json';

export interface ReadingArticle {
  id: string;
  title: string;
  stage: string;
  cefrLevel: string;
  genre: string;
  source: string;
  wordCount: number;
  readingTime: string;
  content: string[];
  fourPassProtocol: {
    pass1ColdRead: {
      thesisGist: string;
      markedLexicalTargets: string[];
      comprehensionChecks: Array<{ question: string; answer: string }>;
    };
    pass2SyntaxDissection: Array<{
      sentenceIndex: number;
      sentence: string;
      coreSVO: { subject: string; verb: string; objectOrComplement: string };
      subordinateClauses: Array<{ type: string; clause: string; function: string }>;
      syntacticAnalysis: string;
    }>;
    pass3SentenceMining: Array<{
      id: string;
      targetWord: string;
      partOfSpeech: string;
      ipa: string;
      definition: string;
      vietnamese: string;
      contextSentence: string;
      collocations: string[];
      etymology: string;
    }>;
    pass4Synthesis: {
      modelPrécis: string;
      incorporatedVocabulary: string[];
      reconstructionPrompt: string;
    };
  };
}

export class ReadingDossier {
  private container: HTMLElement;
  private articles: ReadingArticle[];
  private currentArticleIndex: number = 0;
  private currentPass: number = 1; // 1 to 4
  private miningCardIndex: number = 0;
  private currentCardHandle: any = null;
  public onBatchComplete?: () => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'dossier-workspace dossier-reading interactive';
    this.articles = (readingData as any).articles as ReadingArticle[];
  }

  public render(): HTMLElement {
    const article = this.articles[this.currentArticleIndex];

    this.container.innerHTML = `
      <div class="dossier-control-bar">
        <div class="dossier-tabs article-tabs">
          ${this.articles.map((art, idx) => `
            <button class="hud-btn article-tab ${idx === this.currentArticleIndex ? 'active' : ''}" data-idx="${idx}">
              [ART 0${idx + 1}: ${art.title.slice(0, 20).toUpperCase()}...]
            </button>
          `).join('')}
        </div>
        <div class="article-meta-telemetry">
          <span class="telemetry-value">CEFR: ${article.cefrLevel}</span>
          <span class="telemetry-value">WORDS: ${article.wordCount}</span>
          <span class="telemetry-value">${article.readingTime.toUpperCase()}</span>
        </div>
      </div>

      <div class="dossier-protocol-tabs">
        <button class="hud-btn pass-tab ${this.currentPass === 1 ? 'active' : ''}" data-pass="1">[PASS 1: COLD READ]</button>
        <button class="hud-btn pass-tab ${this.currentPass === 2 ? 'active' : ''}" data-pass="2">[PASS 2: SYNTAX DISSECTION]</button>
        <button class="hud-btn pass-tab ${this.currentPass === 3 ? 'active' : ''}" data-pass="3">[PASS 3: SENTENCE MINING]</button>
        <button class="hud-btn pass-tab ${this.currentPass === 4 ? 'active' : ''}" data-pass="4">[PASS 4: SYNTHESIS]</button>
      </div>

      <div class="reading-content-slot"></div>
    `;

    this.bindEvents();
    this.renderCurrentPass();
    return this.container;
  }

  private bindEvents(): void {
    // Article tabs
    const artTabs = this.container.querySelectorAll('.article-tab');
    artTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.currentArticleIndex = parseInt((tab as HTMLElement).dataset.idx || '0', 10);
        this.miningCardIndex = 0;
        AudioSynthesizer.play('click');
        this.render();
      });
    });

    // Pass tabs
    const passTabs = this.container.querySelectorAll('.pass-tab');
    passTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.currentPass = parseInt((tab as HTMLElement).dataset.pass || '1', 10);
        AudioSynthesizer.play('click');
        passTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.renderCurrentPass();
      });
    });
  }

  private renderCurrentPass(): void {
    const slot = this.container.querySelector('.reading-content-slot');
    if (!slot) return;
    slot.innerHTML = '';
    const article = this.articles[this.currentArticleIndex];
    const proto = article.fourPassProtocol;

    switch (this.currentPass) {
      case 1:
        this.renderPass1ColdRead(slot, article, proto.pass1ColdRead);
        break;
      case 2:
        this.renderPass2SyntaxDissection(slot, proto.pass2SyntaxDissection);
        break;
      case 3:
        this.renderPass3SentenceMining(slot, proto.pass3SentenceMining);
        break;
      case 4:
        this.renderPass4Synthesis(slot, proto.pass4Synthesis);
        break;
    }
  }

  private renderPass1ColdRead(slot: Element, article: ReadingArticle, data: any): void {
    let highlightedContent = article.content.map(p => {
      let text = p;
      for (const target of data.markedLexicalTargets) {
        const regex = new RegExp(`\\b(${target})\\b`, 'gi');
        text = text.replace(regex, '<mark class="reading-target-word">$1</mark>');
      }
      return `<p class="reading-paragraph">${text}</p>`;
    }).join('');

    slot.innerHTML = `
      <div class="reading-pass1-layout">
        <div class="reading-text-pane">
          <div class="reading-header">
            <span class="telemetry-label">[STAGE ${article.stage}]</span>
            <h2 class="reading-article-title">${article.title}</h2>
            <div class="reading-source-line">${article.genre} • Source: ${article.source}</div>
          </div>
          <div class="reading-body">
            ${highlightedContent}
          </div>
        </div>

        <div class="reading-sidebar-pane">
          <div class="reading-sidebar-card">
            <div class="telemetry-label">[THESIS GIST]</div>
            <p class="reading-gist-text">${data.thesisGist}</p>
          </div>

          <div class="reading-sidebar-card">
            <div class="telemetry-label">[MARKED LEXICAL TARGETS (${data.markedLexicalTargets.length})]</div>
            <div class="reading-tag-cloud">
              ${data.markedLexicalTargets.map((t: string) => `<span class="reading-tag">${t}</span>`).join('')}
            </div>
          </div>

          <div class="reading-sidebar-card">
            <div class="telemetry-label">[COMPREHENSION CHECKS]</div>
            ${data.comprehensionChecks.map((check: any, idx: number) => `
              <div class="comp-check-item">
                <div class="comp-question">${idx + 1}. ${check.question}</div>
                <details class="comp-answer-reveal">
                  <summary class="hud-btn-link">[REVEAL VERIFICATION]</summary>
                  <p class="comp-answer">${check.answer}</p>
                </details>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  private renderPass2SyntaxDissection(slot: Element, dissections: any[]): void {
    slot.innerHTML = `
      <div class="reading-syntax-layout">
        <div class="syntax-intro-bar">
          <span class="telemetry-label">[PASS 2: CLAUSAL & SYNTACTIC ARCHITECTURE]</span>
          <p class="syntax-subtitle">Deconstructing core subject-verb-object predicates and subordinate functional clauses.</p>
        </div>
        <div class="syntax-cards-grid">
          ${dissections.map((d, idx) => `
            <div class="syntax-card">
              <div class="syntax-header">
                <span class="telemetry-label">DISSECTION [0${idx + 1}]</span>
              </div>
              <blockquote class="syntax-sentence">"${d.sentence}"</blockquote>

              <div class="syntax-svo-breakdown">
                <div class="svo-field">
                  <span class="svo-label">SUBJECT</span>
                  <span class="svo-value">${d.coreSVO.subject}</span>
                </div>
                <div class="svo-field">
                  <span class="svo-label">PREDICATE (VERB)</span>
                  <span class="svo-value">${d.coreSVO.verb}</span>
                </div>
                <div class="svo-field">
                  <span class="svo-label">OBJECT / COMPLEMENT</span>
                  <span class="svo-value">${d.coreSVO.objectOrComplement}</span>
                </div>
              </div>

              ${d.subordinateClauses && d.subordinateClauses.length > 0 ? `
                <div class="syntax-clauses-box">
                  <div class="telemetry-label" style="margin-bottom: 8px;">[SUBORDINATE CLAUSES]</div>
                  ${d.subordinateClauses.map((c: any) => `
                    <div class="sub-clause-item">
                      <div class="clause-type">${c.type}</div>
                      <div class="clause-text">"${c.clause}"</div>
                      <div class="clause-func">${c.function}</div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              <div class="syntax-rhetoric-box">
                <span class="telemetry-label">[RHETORICAL ANALYSIS]</span>
                <p class="syntax-analysis-text">${d.syntacticAnalysis}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderPass3SentenceMining(slot: Element, miningCards: any[]): void {
    if (miningCards.length === 0) {
      slot.innerHTML = `<div class="empty-state-notice"><div class="telemetry-label">[NO MINING CARDS]</div></div>`;
      return;
    }

    const item = miningCards[this.miningCardIndex];
    slot.innerHTML = `
      <div class="reading-mining-layout">
        <div class="dossier-nav-bar" style="margin-bottom: 16px;">
          <button class="hud-btn mine-btn-prev">[ ← PREV CARD ]</button>
          <span class="telemetry-value mine-counter">MINED ITEM [ ${this.miningCardIndex + 1} / ${miningCards.length} ]</span>
          <button class="hud-btn mine-btn-next">[ NEXT CARD → ]</button>
        </div>
        <div class="mining-card-mount"></div>
      </div>
    `;

    const cardMount = slot.querySelector('.mining-card-mount');
    if (!cardMount) return;

    const srsState = StorageManager.getCardState(item.id);
    let statusBadge: 'NEW' | 'REVIEW' | 'MASTERED' = 'NEW';
    if (srsState) {
      statusBadge = srsState.repetitions >= 3 ? 'MASTERED' : 'REVIEW';
    }

    this.currentCardHandle = AtomicCard.create({
      id: item.id,
      pillar: 'READ',
      category: `i+1 MINING [${item.partOfSpeech.toUpperCase()}]`,
      indexStr: `[ ${this.miningCardIndex + 1} / ${miningCards.length} ]`,
      statusBadge,
      front: {
        promptLabel: `CONTEXTUAL TARGET // ${item.partOfSpeech.toUpperCase()}`,
        mainText: item.targetWord,
        subText: `"${item.contextSentence}"`
      },
      back: {
        promptLabel: 'DEFINITION & ETYMOLOGY',
        mainText: `${item.definition}\n\nVietnamese: "${item.vietnamese}"`,
        subText: `Collocations: ${item.collocations.join(', ')} • ${item.etymology}`,
        ipa: item.ipa
      },
      audioText: item.targetWord,
      onRate: (rating: 'again' | 'good') => {
        this.handleRate(item.id, rating, miningCards.length);
      }
    });

    cardMount.appendChild(this.currentCardHandle.element);

    // Navigation buttons
    slot.querySelector('.mine-btn-prev')?.addEventListener('click', () => {
      this.miningCardIndex = (this.miningCardIndex - 1 + miningCards.length) % miningCards.length;
      this.renderPass3SentenceMining(slot, miningCards);
    });

    slot.querySelector('.mine-btn-next')?.addEventListener('click', () => {
      this.miningCardIndex = (this.miningCardIndex + 1) % miningCards.length;
      this.renderPass3SentenceMining(slot, miningCards);
    });
  }

  private handleRate(cardId: string, rating: 'again' | 'good', total: number): void {
    const srsState = StorageManager.getCardState(cardId);
    const nextCardState = SRSEngine.rateCard(srsState, cardId, rating);
    StorageManager.setCardState(cardId, nextCardState);

    this.miningCardIndex = (this.miningCardIndex + 1) % total;
    const slot = this.container.querySelector('.reading-content-slot');
    if (slot) {
      const article = this.articles[this.currentArticleIndex];
      this.renderPass3SentenceMining(slot, article.fourPassProtocol.pass3SentenceMining);
    }
  }

  private renderPass4Synthesis(slot: Element, synthesis: any): void {
    slot.innerHTML = `
      <div class="reading-synthesis-layout">
        <div class="synthesis-card">
          <div class="telemetry-label">[PASS 4: 50-WORD BENCHMARK PRÉCIS]</div>
          <blockquote class="synthesis-precis-box">
            ${synthesis.modelPrécis}
          </blockquote>
          <div class="synthesis-meta">
            Word Count: ~${synthesis.modelPrécis.split(/\s+/).length} words • Density: Maximum Academic Conciseness
          </div>
        </div>

        <div class="synthesis-card">
          <div class="telemetry-label">[INTEGRATED TARGET VOCABULARY]</div>
          <div class="reading-tag-cloud" style="margin-top: 12px;">
            ${synthesis.incorporatedVocabulary.map((v: string) => `<span class="reading-tag active">${v}</span>`).join('')}
          </div>
        </div>

        <div class="synthesis-card">
          <div class="telemetry-label">[REVERSE-ENGINEERING RECONSTRUCTION PROMPT]</div>
          <p class="synthesis-reconstruction-prompt">
            ${synthesis.reconstructionPrompt || 'Close this dossier. In your notebook or writing buffer, reconstruct the central thesis of the article in exactly 3 complex sentences utilizing at least 3 of the mined vocabulary items.'}
          </p>
          <div style="margin-top: 16px;">
            <button class="hud-btn btn-finish-reading" style="padding: 8px 16px;">
              [ COMPLETE INTENSIVE PASS & LOG TO RECORD ]
            </button>
          </div>
        </div>
      </div>
    `;

    slot.querySelector('.btn-finish-reading')?.addEventListener('click', () => {
      AudioSynthesizer.play('absorb');
      if (this.onBatchComplete) {
        this.onBatchComplete();
      }
    });
  }

  public handleGlobalKey(key: string): boolean {
    if (this.currentPass === 3 && this.currentCardHandle) {
      if (key === 'ArrowRight' || key === 'l') {
        const article = this.articles[this.currentArticleIndex];
        const cards = article.fourPassProtocol.pass3SentenceMining;
        this.miningCardIndex = (this.miningCardIndex + 1) % cards.length;
        const slot = this.container.querySelector('.reading-content-slot');
        if (slot) this.renderPass3SentenceMining(slot, cards);
        return true;
      }
      if (key === 'ArrowLeft' || key === 'h') {
        const article = this.articles[this.currentArticleIndex];
        const cards = article.fourPassProtocol.pass3SentenceMining;
        this.miningCardIndex = (this.miningCardIndex - 1 + cards.length) % cards.length;
        const slot = this.container.querySelector('.reading-content-slot');
        if (slot) this.renderPass3SentenceMining(slot, cards);
        return true;
      }
      if (key === ' ') {
        this.currentCardHandle.flip();
        return true;
      }
      if (key === '1') {
        this.currentCardHandle.rate('again');
        return true;
      }
      if (key === '2') {
        this.currentCardHandle.rate('good');
        return true;
      }
    }
    return false;
  }
}
