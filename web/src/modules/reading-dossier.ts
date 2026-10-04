import { icon } from '../utils/icons';
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
  content: string[] | string;
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

export type ReadingPass = 1 | 2 | 3 | 4;

export interface ArticlePassConfig {
  pass: ReadingPass;
  title: string;
  badge: string;
  instruction: string;
}

export const READING_PASS_CONFIGS: ArticlePassConfig[] = [
  {
    pass: 1,
    badge: '01 GIST SKIM',
    title: 'PASS 1: COLD READ & THESIS EXTRACTION',
    instruction: 'Scan the macro-structure within 60 seconds. Extract overarching thesis before lexical details distract cognitive bandwidth.'
  },
  {
    pass: 2,
    badge: '02 SKELETON',
    title: 'PASS 2: CLAUSAL & SYNTACTIC ARCHITECTURE',
    instruction: 'Dissect the core Subject-Verb-Object spine and subordinate clausal geometry across key argument milestones.'
  },
  {
    pass: 3,
    badge: '03 LEXICON',
    title: 'PASS 3: INTENSIVE SENTENCE MINING',
    instruction: 'Internalize target C1/C2 collocations, lexical anchors, and etymological roots with contextual SRS cards.'
  },
  {
    pass: 4,
    badge: '04 SYNTHESIS',
    title: 'PASS 4: CRITICAL SYNTHESIS & PRÉCIS',
    instruction: 'Analyze the 50-word benchmark précis and reverse-engineer the core thesis into your personal writing buffer.'
  }
];

export interface VocabItemInfo {
  targetWord: string;
  partOfSpeech: string;
  ipa?: string;
  definition: string;
  vietnamese: string;
  contextSentence?: string;
  collocations: string[];
  etymology?: string;
}

const CURATED_LEXICAL_DICTIONARY: Record<string, VocabItemInfo> = {
  // Article 1
  'epistemic commons': {
    targetWord: 'epistemic commons',
    partOfSpeech: 'noun phrase',
    ipa: '/ˌep.ɪˈstiː.mɪk ˈkɒm.ənz/',
    definition: 'The shared societal ecosystem of verifiable knowledge, mutual factual agreement, and trusted communication channels.',
    vietnamese: 'Không gian tri thức chung; hệ sinh thái thông tin và niềm tin xã hội có thể kiểm chứng.',
    collocations: ['preserve the epistemic commons', 'degrade the epistemic commons', 'structural crisis of the epistemic commons'],
    etymology: 'Greek episteme (knowledge) + English commons (shared resource held in collective trust).'
  },
  'ubiquitous proliferation': {
    targetWord: 'ubiquitous proliferation',
    partOfSpeech: 'noun phrase',
    ipa: '/juːˈbɪk.wɪ.təs prəˌlɪf.əˈreɪ.ʃən/',
    definition: 'Extremely rapid, widespread reproduction or multiplication of something in virtually every sphere.',
    vietnamese: 'Sự sinh sôi, lan tràn khắp mọi nơi với tốc độ chóng mặt.',
    collocations: ['ubiquitous proliferation of synthetic media', 'halt ubiquitous proliferation'],
    etymology: 'Latin ubique (everywhere) + proles (offspring) + ferre (to bear).'
  },
  'perceptual heuristic': {
    targetWord: 'perceptual heuristic',
    partOfSpeech: 'noun phrase',
    ipa: '/pəˈsep.tʃu.əl hjʊəˈrɪs.tɪk/',
    definition: 'An intuitive mental shortcut based on direct sensory observation (e.g. \"seeing is believing\") used to form judgments quickly.',
    vietnamese: 'Nguyên tắc phỏng đoán tri giác; đường tắt nhận thức dựa trên mắt thấy tai nghe.',
    collocations: ['rely on perceptual heuristic', 'implicit perceptual heuristic', 'cognitive heuristic'],
    etymology: 'Latin perceptio (gathering) + Greek heuriskein (to find/discover).'
  },
  'factual veracity': {
    targetWord: 'factual veracity',
    partOfSpeech: 'noun phrase',
    ipa: '/ˈfæk.tʃu.əl vəˈræs.ə.ti/',
    definition: 'Conformity to empirical facts; the objective truthfulness and verifiable accuracy of documented evidence.',
    vietnamese: 'Tính xác thực khách quan của dữ kiện; độ tin cậy của sự thật.',
    collocations: ['anchor upon factual veracity', 'verify factual veracity', 'ascertain veracity'],
    etymology: 'Latin verax (truthful) from verus (true).'
  },
  'pernicious consequence': {
    targetWord: 'pernicious consequence',
    partOfSpeech: 'noun phrase',
    ipa: '/pəˈnɪʃ.əs ˈkɒn.sɪ.kwəns/',
    definition: 'A destructive, highly damaging outcome that unfolds subtly, gradually, or imperceptibly.',
    vietnamese: 'Hậu quả hiểm độc, nguy hại ngấm ngầm tàn phá về lâu dài.',
    collocations: ['pernicious consequence', 'unintended pernicious effect', 'suffer pernicious consequences'],
    etymology: 'Latin perniciosus (destructive) from per- (completely) + necis (violent death).'
  },
  'liar’s dividend': {
    targetWord: 'liar’s dividend',
    partOfSpeech: 'idiomatic noun phrase',
    ipa: '/ˈlaɪ.əz ˈdɪv.ɪ.dend/',
    definition: 'The cynical benefit gained by guilty actors who can dismiss real, incriminating evidence by claiming it was artificially fabricated.',
    vietnamese: 'Lợi tức của kẻ dối trá; việc lợi dụng tin giả để phủ nhận bằng chứng xác thực về tội lỗi của mình.',
    collocations: ['exploit the liar’s dividend', 'weaponize the liar’s dividend', 'legal defense of the liar’s dividend'],
    etymology: 'Coined by legal scholars Chesney and Citron in algorithmic media studies.'
  },
  'culpable actors': {
    targetWord: 'culpable actors',
    partOfSpeech: 'noun phrase',
    ipa: '/ˈkʌl.pə.bəl ˈæk.tərz/',
    definition: 'Individuals, organizations, or entities deserving blame, moral condemnation, or legal sanction for wrongful deeds.',
    vietnamese: 'Những cá nhân hoặc tổ chức có tội, chịu trách nhiệm pháp lý/đạo đức.',
    collocations: ['hold culpable actors accountable', 'shield culpable actors', 'identify culpable actors'],
    etymology: 'Latin culpare (to blame) from culpa (fault/guilt).'
  },
  'cryptographic provenance': {
    targetWord: 'cryptographic provenance',
    partOfSpeech: 'noun phrase',
    ipa: '/ˌkrɪp.təˈɡræf.ɪk ˈprɒv.ən.əns/',
    definition: 'Verifiable historical origin of digital data authenticated by mathematical cryptography and hardware signatures.',
    vietnamese: 'Nguồn gốc xuất xứ mật mã học; việc chứng thực tính nguyên bản bằng chữ ký số phần cứng.',
    collocations: ['cryptographic provenance standards', 'hardware-anchored provenance', 'verify provenance'],
    etymology: 'Greek kryptos (hidden) + graphein (to write) + French provenir (to come forth).'
  },
  'obviate consensus reality': {
    targetWord: 'obviate consensus reality',
    partOfSpeech: 'verbal phrase',
    ipa: '/ˈɒb.vi.eɪt kənˈsen.səs riˈæl.ə.ti/',
    definition: 'To completely preclude or make impossible any shared collective recognition of factual truth across society.',
    vietnamese: 'Triệt tiêu/vô hiệu hóa khả năng đồng thuận về thực tại khách quan.',
    collocations: ['obviate consensus reality', 'obviate the possibility of consensus'],
    etymology: 'Latin obviare (to prevent) + consensus (agreement).'
  },

  // Article 2
  'neuronal recycling': {
    targetWord: 'neuronal recycling',
    partOfSpeech: 'noun phrase',
    ipa: '/njʊəˈrɒn.əl riːˈsaɪ.klɪŋ/',
    definition: 'The neurobiological repurposing of evolutionary brain pathways (e.g. visual object recognition) to process written language.',
    vietnamese: 'Sự tái sử dụng nơ-ron thần kinh; giả thuyết não bộ thích ứng mạch thị giác để nhận diện chữ viết.',
    collocations: ['theory of neuronal recycling', 'Dehaene’s neuronal recycling', 'cortical recycling'],
    etymology: 'Greek neuron (nerve) + English recycling.'
  },
  'cognitive bandwidth': {
    targetWord: 'cognitive bandwidth',
    partOfSpeech: 'noun phrase',
    ipa: '/ˈkɒɡ.nɪ.tɪv ˈbænd.wɪtθ/',
    definition: 'The finite computational capacity of human working memory available for simultaneous reasoning and comprehension.',
    vietnamese: 'Băng thông nhận thức; dung lượng giới hạn của trí óc trong việc xử lý thông tin tại một thời điểm.',
    collocations: ['exhaust cognitive bandwidth', 'conserve cognitive bandwidth', 'bandwidth depletion'],
    etymology: 'Latin cognoscere (to know) + bandwidth (signal channel width).'
  },
  'subvocalization': {
    targetWord: 'subvocalization',
    partOfSpeech: 'noun',
    ipa: '/ˌsʌb.voʊ.kəl.aɪˈzeɪ.ʃən/',
    definition: 'The internal acoustic simulation or silent pronunciation of words while reading.',
    vietnamese: 'Hiện tượng phát âm thầm khi đọc; lời nói thầm trong óc.',
    collocations: ['suppress subvocalization', 'rate of subvocalization', 'inner subvocalization'],
    etymology: 'Latin sub (under) + vocalis (voice).'
  },
  'phonological scaffolding': {
    targetWord: 'phonological scaffolding',
    partOfSpeech: 'noun phrase',
    ipa: '/ˌfəʊ.nəˈlɒdʒ.ɪ.kəl ˈskæf.əl.dɪŋ/',
    definition: 'Internal sound-based cognitive framework that reinforces letter perception and aids grammatical processing.',
    vietnamese: 'Giàn giáo ngữ âm học; sự hỗ trợ của âm thanh trong đầu giúp hiểu cấu trúc câu.',
    collocations: ['phonological scaffolding', 'acoustic scaffolding in reading'],
    etymology: 'Greek phone (voice/sound) + Old French eschafaud (platform).'
  },
  'involuntary acoustic simulation': {
    targetWord: 'involuntary acoustic simulation',
    partOfSpeech: 'noun phrase',
    ipa: '/ɪnˈvɒl.ən.tər.i əˈkuː.stɪk ˌsɪm.jʊˈleɪ.ʃən/',
    definition: 'The spontaneous neural generation of voice intonation and spoken cadence while silently reading text.',
    vietnamese: 'Sự mô phỏng âm thanh vô thức; tiếng đọc thầm tự động vang lên trong não.',
    collocations: ['involuntary acoustic simulation', 'trigger acoustic simulation'],
    etymology: 'Latin involuntarius + Greek akoustikos (hearing) + simulare (to imitate).'
  },
  'high-order inference': {
    targetWord: 'high-order inference',
    partOfSpeech: 'noun phrase',
    ipa: '/haɪ ˈɔː.dər ˈɪn.fər.əns/',
    definition: 'Sophisticated cognitive deductions regarding implicit premises, underlying rhetorical intent, and logical coherence.',
    vietnamese: 'Suy luận bậc cao; khả năng đọc giữa các dòng chữ và phát hiện dụng ý tu từ.',
    collocations: ['draw high-order inferences', 'facilitate high-order inference'],
    etymology: 'Latin inferre (to bring in/deduce).'
  },
  'input hypothesis': {
    targetWord: 'input hypothesis',
    partOfSpeech: 'noun phrase',
    ipa: '/ˈɪn.pʊt haɪˈpɒθ.ə.sɪs/',
    definition: 'Stephen Krashen’s foundational SLA principle that learners acquire language most efficiently through comprehensible input at the i+1 level.',
    vietnamese: 'Giả thuyết thụ đắc đầu vào (Krashen); tiếp nhận ngôn ngữ vượt một nấc so với trình độ hiện tại (i+1).',
    collocations: ['Krashen’s input hypothesis', 'comprehensible input hypothesis'],
    etymology: 'English input + Greek hypothesis (foundation/supposition).'
  },
  'retrievable engrams': {
    targetWord: 'retrievable engrams',
    partOfSpeech: 'noun phrase',
    ipa: '/rɪˈtriː.və.bəl ˈen.ɡræmz/',
    definition: 'Physical neurochemical memory traces consolidated in synapses that can be reliably recalled under deliberate retrieval cues.',
    vietnamese: 'Vết hằn ký ức có thể truy xuất; các dấu vết thần kinh được củng cố trong não.',
    collocations: ['consolidate retrievable engrams', 'encode retrievable engrams'],
    etymology: 'French retrouver (to find again) + Greek engramma (something written in).'
  },

  // Article 3
  'conflated with': {
    targetWord: 'conflated with',
    partOfSpeech: 'verb participle phrase',
    ipa: '/kənˈfleɪ.tɪd wɪð/',
    definition: 'Mistakenly combined or treated as interchangeable with an entirely different concept.',
    vietnamese: 'Bị đánh đồng với; bị gộp nhầm lẫn thành một.',
    collocations: ['conflated with', 'often conflated with', 'conflate distinction'],
    etymology: 'Latin conflare (to blow together/fuse).'
  },
  'insidious side effect': {
    targetWord: 'insidious side effect',
    partOfSpeech: 'noun phrase',
    ipa: '/ɪnˈsɪd.i.əs saɪd ɪˈfekt/',
    definition: 'A subtle, treacherous byproduct that causes cumulative impairment without initial alarm.',
    vietnamese: 'Tác dụng phụ ngấm ngầm; tác hại âm ỉ và khó nhận biết ban đầu.',
    collocations: ['insidious side effect', 'insidious consequences of multitasking'],
    etymology: 'Latin insidiosus (treacherous/deceitful) from insidere (to sit in ambush).'
  },
  'cognitive throughput': {
    targetWord: 'cognitive throughput',
    partOfSpeech: 'noun phrase',
    ipa: '/ˈkɒɡ.nɪ.tɪv ˈθruː.pʊt/',
    definition: 'The rate and clarity at which the intellect processes, synthesizes, and outputs complex solutions.',
    vietnamese: 'Lưu lượng xử lý nhận thức; hiệu năng tư duy chiều sâu trong một đơn vị thời gian.',
    collocations: ['maximize cognitive throughput', 'impair cognitive throughput'],
    etymology: 'Latin cognoscere + English through + put.'
  },
  'attention residue': {
    targetWord: 'attention residue',
    partOfSpeech: 'noun phrase',
    ipa: '/əˈten.ʃən ˈrez.ɪ.dʒuː/',
    definition: 'Sophie Leroy’s psychological phenomenon where mental focus remains tethered to a previous task after switching to a new one.',
    vietnamese: 'Cặn dư chú ý; phần năng lượng tâm trí vẫn vương vấn ở công việc trước làm giảm hiệu quả việc sau.',
    collocations: ['accumulate attention residue', 'eliminate attention residue'],
    etymology: 'Latin attendere (to stretch toward) + residuum (that which remains).'
  },
  'syntactic immersion': {
    targetWord: 'syntactic immersion',
    partOfSpeech: 'noun phrase',
    ipa: '/sɪnˈtæk.tɪk ɪˈmɜː.ʃən/',
    definition: 'Complete mental absorption in the nuanced architecture of subordinate clauses and complex propositions.',
    vietnamese: 'Sự đắm chìm cú pháp; tập trung cao độ vào kết cấu ngữ pháp phức hợp.',
    collocations: ['syntactic immersion', 'require syntactic immersion'],
    etymology: 'Greek syntaxis (arrangement) + Latin immergere (to plunge into).'
  },
  'cognitive autonomy': {
    targetWord: 'cognitive autonomy',
    partOfSpeech: 'noun phrase',
    ipa: '/ˈkɒɡ.nɪ.tɪv ɔːˈtɒn.ə.mi/',
    definition: 'The independent self-governance of one’s conscious focus, shielded from algorithmic interruptions and notification loops.',
    vietnamese: 'Quyền tự chủ nhận thức; quyền tự quyết tâm trí không bị thuật toán thao túng.',
    collocations: ['defend cognitive autonomy', 'surrender cognitive autonomy'],
    etymology: 'Greek autonomos (having its own laws) from autos (self) + nomos (law).'
  },
  'low-entropy sanctuaries': {
    targetWord: 'low-entropy sanctuaries',
    partOfSpeech: 'noun phrase',
    ipa: '/ləʊ ˈen.trə.pi ˈsæŋk.tʃu.ər.iz/',
    definition: 'Calm, highly orderly physical and mental environments with minimal chaotic noise or unexpected intrusions.',
    vietnamese: 'Những vùng trú ẩn trật tự tĩnh tại; không gian ít hỗn loạn thuận lợi cho tư duy sâu.',
    collocations: ['retreat to low-entropy sanctuaries', 'design low-entropy sanctuaries'],
    etymology: 'Greek entropia (transformation) + Latin sanctuarium (holy place).'
  }
};

export class ReadingDossier {
  private container: HTMLElement;
  private articles: ReadingArticle[];
  private currentArticleIndex: number = 0;
  private currentPass: ReadingPass = 1;
  private miningCardIndex: number = 0;
  private currentCardHandle: any = null;
  private skimTimerInterval: any = null;
  private skimSecondsRemaining: number = 60;
  private isSkimTimerRunning: boolean = false;
  private isFocusModeActive: boolean = false;
  private activeVocabDrawerWord: string | null = null;
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
            <button class="hud-btn article-tab ${idx === this.currentArticleIndex ? 'active' : ''}" data-idx="${idx}" title="${this.escapeHtml(art.title)}" aria-label="Article ${idx + 1}: ${this.escapeHtml(art.title)}">
              Art 0${idx + 1}: ${art.title.length > 20 ? art.title.slice(0, 18) + '…' : art.title}
            </button>
          `).join('')}
        </div>
        <div class="article-meta-telemetry reading-meta-telemetry">
          <span class="telemetry-value">CEFR: ${article.cefrLevel}</span>
          <span class="telemetry-value">WORDS: ${article.wordCount}</span>
          <span class="telemetry-value">${article.readingTime.toUpperCase()}</span>
        </div>
      </div>

      <!-- Stepped 4-Pass Cognitive Scaffolding Header -->
      <div class="reading-pass-stepper">
        ${READING_PASS_CONFIGS.map(cfg => {
          const isActive = cfg.pass === this.currentPass;
          const isCompleted = cfg.pass < this.currentPass;
          const statusPrefix = isCompleted ? '✓ ' : '';
          return `
            <button class="stepper-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" data-pass="${cfg.pass}">
              <span class="step-badge">${statusPrefix}${cfg.badge}</span>
            </button>
          `;
        }).join('<span class="stepper-arrow">→</span>')}
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
        this.clearSkimTimer();
        this.currentArticleIndex = parseInt((tab as HTMLElement).dataset.idx || '0', 10);
        this.miningCardIndex = 0;
        this.currentPass = 1;
        this.activeVocabDrawerWord = null;
        AudioSynthesizer.play('click');
        this.render();
      });
    });

    // Stepper pass tabs
    const stepTabs = this.container.querySelectorAll('.stepper-step');
    stepTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.clearSkimTimer();
        this.currentPass = parseInt((tab as HTMLElement).dataset.pass || '1', 10) as ReadingPass;
        this.activeVocabDrawerWord = null;
        AudioSynthesizer.play('click');
        this.render();
      });
    });
  }

  private clearSkimTimer(): void {
    if (this.skimTimerInterval) {
      clearInterval(this.skimTimerInterval);
      this.skimTimerInterval = null;
    }
    this.isSkimTimerRunning = false;
    this.skimSecondsRemaining = 60;
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

  public showVocabDrawer(term: string): void {
    this.openVocabDrawer(term);
  }

  public openVocabDrawer(term: string): void {
    this.activeVocabDrawerWord = term;
    AudioSynthesizer.play('click');

    const drawerSlot = this.container.querySelector('.vocab-drawer-slot');
    if (drawerSlot) {
      const article = this.articles[this.currentArticleIndex];
      const info = this.getVocabInfo(term, article);
      this.renderVocabDrawerInto(drawerSlot as HTMLElement, info);
    }

    // Update active highlight class on matching targets
    const targets = this.container.querySelectorAll('.vocab-target');
    targets.forEach(el => {
      const w = (el as HTMLElement).dataset.word || el.textContent || '';
      if (w.trim().toLowerCase() === term.trim().toLowerCase()) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  public closeVocabDrawer(): void {
    this.activeVocabDrawerWord = null;
    const targets = this.container.querySelectorAll('.vocab-target');
    targets.forEach(el => el.classList.remove('active'));

    const drawerSlot = this.container.querySelector('.vocab-drawer-slot');
    if (drawerSlot) {
      this.renderVocabDrawerInto(drawerSlot as HTMLElement, null);
    }
  }

  private getVocabInfo(term: string, article: ReadingArticle): VocabItemInfo {
    const key = term.trim().toLowerCase();

    // 1. Check Pass 3 Mining in current article
    const mined = article.fourPassProtocol.pass3SentenceMining.find(
      m => m.targetWord.toLowerCase() === key || key.includes(m.targetWord.toLowerCase())
    );
    if (mined) {
      return {
        targetWord: mined.targetWord,
        partOfSpeech: mined.partOfSpeech,
        ipa: mined.ipa,
        definition: mined.definition,
        vietnamese: mined.vietnamese,
        contextSentence: mined.contextSentence,
        collocations: mined.collocations || [],
        etymology: mined.etymology
      };
    }

    // 2. Check Curated Dictionary
    if (CURATED_LEXICAL_DICTIONARY[key]) {
      return CURATED_LEXICAL_DICTIONARY[key];
    }

    // 3. Check partial match in Curated Dictionary
    for (const dictKey of Object.keys(CURATED_LEXICAL_DICTIONARY)) {
      if (dictKey.includes(key) || key.includes(dictKey)) {
        return CURATED_LEXICAL_DICTIONARY[dictKey];
      }
    }

    // 4. Clean fallback
    return {
      targetWord: term,
      partOfSpeech: 'lexical target',
      definition: 'Contextual C1/C2 collocation highlighted in this article.',
      vietnamese: 'Từ vựng/cụm từ trọng tâm cần nắm trong văn cảnh bài đọc.',
      collocations: [term],
      etymology: 'Contextual reading anchor.'
    };
  }

  private renderVocabDrawerInto(slot: HTMLElement, info: VocabItemInfo | null): void {
    if (!info) {
      slot.innerHTML = `
        <div class="vocab-drawer-empty">
          <div class="telemetry-label" style="margin-bottom: 6px;">Vocabulary Drawer</div>
          <p>Click any highlighted term in the essay to reveal Vietnamese translation & collocations.</p>
        </div>
      `;
      return;
    }

    slot.innerHTML = `
      <div class="vocab-drawer" role="dialog" aria-label="Vocabulary definition for ${this.escapeHtml(info.targetWord)}">
        <div class="vocab-drawer-header">
          <div class="vocab-drawer-title-cluster">
            <span class="telemetry-label">Lexical Target · Footnote</span>
            <h3 class="vocab-drawer-word">${this.escapeHtml(info.targetWord)}</h3>
            <span class="vocab-drawer-pos">${this.escapeHtml(info.partOfSpeech)}${info.ipa ? ` • ${this.escapeHtml(info.ipa)}` : ''}</span>
          </div>
          <div class="vocab-drawer-actions">
            <button type="button" class="hud-btn btn-vocab-speak" title="Listen to pronunciation">${icon('volume')} Listen</button>
            <button type="button" class="hud-btn btn-close-drawer" title="Close drawer" aria-label="Close vocabulary drawer">✕ Close</button>
          </div>
        </div>
        <div class="vocab-drawer-body">
          <div class="vocab-drawer-field">
            <span class="vocab-field-label">ENGLISH DEFINITION</span>
            <p class="vocab-field-value">${this.escapeHtml(info.definition)}</p>
          </div>
          <div class="vocab-drawer-field vocab-vietnamese-field">
            <span class="vocab-field-label">VIETNAMESE EQUIVALENT & NUANCE</span>
            <p class="vocab-field-value vietnamese-meaning">${this.escapeHtml(info.vietnamese)}</p>
          </div>
          ${info.collocations && info.collocations.length > 0 ? `
            <div class="vocab-drawer-field">
              <span class="vocab-field-label">COLLOCATION PARTNERS</span>
              <div class="vocab-colloc-tags">
                ${info.collocations.map(c => `<span class="colloc-pill">${this.escapeHtml(c)}</span>`).join('')}
              </div>
            </div>
          ` : ''}
          ${info.etymology ? `
            <div class="vocab-drawer-field">
              <span class="vocab-field-label">ETYMOLOGY & ROOTS</span>
              <p class="vocab-field-value" style="font-size: 11px; font-style: italic; color: var(--ink-muted);">${this.escapeHtml(info.etymology)}</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    slot.querySelector('.btn-vocab-speak')?.addEventListener('click', () => {
      AudioSynthesizer.speak(info.targetWord);
    });

    slot.querySelector('.btn-close-drawer')?.addEventListener('click', () => {
      this.closeVocabDrawer();
    });
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private renderPass1ColdRead(slot: Element, article: ReadingArticle, data: any): void {
    const rawParagraphs: string[] = Array.isArray(article.content)
      ? article.content
      : typeof article.content === 'string'
        ? (article.content as string).split('\n\n').filter(p => p.trim().length > 0)
        : [];

    // Combine markedLexicalTargets and mined target words
    const allTargets = [
      ...data.markedLexicalTargets,
      ...article.fourPassProtocol.pass3SentenceMining.map(m => m.targetWord)
    ];
    const uniqueTargets = Array.from(new Set(allTargets.map(t => t.trim()))).filter(t => t.length > 0);
    // Sort descending by length so longer multi-word collocations match first
    uniqueTargets.sort((a, b) => b.length - a.length);

    const highlightedContent = rawParagraphs.map(p => {
      let text = p;
      for (const target of uniqueTargets) {
        const escaped = target.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`\\b(${escaped})\\b`, 'gi');
        const parts = text.split(/(<[^>]+>)/g);
        for (let i = 0; i < parts.length; i += 2) {
          parts[i] = parts[i].replace(
            regex,
            `<mark class="reading-target-word vocab-target" data-word="${this.escapeHtml(target)}" tabindex="0" role="button" aria-haspopup="dialog" title="Click to view definition & Vietnamese translation">$1</mark>`
          );
        }
        text = parts.join('');
      }
      return `<p class="reading-paragraph">${text}</p>`;
    }).join('');

    slot.innerHTML = `
      <!-- Pass 1 Skim Timer & Focus Mode Bar -->
      <div class="skim-timer-bar">
        <div>
          <span>SKIM COUNTDOWN: </span>
          <strong class="timer-display-text val-time" style="font-size: 13px;">00:${String(this.skimSecondsRemaining).padStart(2, '0')}</strong>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="hud-btn btn-toggle-timer" style="padding: 4px 12px; font-size: 11px;">
            ${this.isSkimTimerRunning ? '⏸ Pause Timer' : '⏱ Start 60s Skim'}
          </button>
          <button class="hud-btn btn-toggle-focus" style="padding: 4px 12px; font-size: 11px;">
            ${this.isFocusModeActive ? icon('eye') + ' Unblur Detail' : icon('target') + ' Focus Headings'}
          </button>
        </div>
      </div>

      <div class="reading-pass1-layout" style="display: flex; gap: 24px; width: 100%; align-items: flex-start;">
        <!-- Calm Document Reader (Strict 68ch measure & relaxed 1.75 line-height) -->
        <article class="calm-reader reading-text-pane" style="max-width: 68ch;">
          <div class="reading-header">
            <span class="telemetry-label"></span>
            <h2 class="reading-article-title">${article.title}</h2>
            <div class="reading-source-line">${article.genre} • Source: ${article.source}</div>
          </div>
          <div class="reading-body ${this.isFocusModeActive ? 'skim-focused' : ''}">
            ${highlightedContent}
          </div>

          <div class="pass-progression-bar">
            <button class="hud-btn btn-proceed-next" style="padding: 8px 18px; font-weight: 700;">
              Proceed to Pass 2: Skeleton ${icon('arrowRight')}
            </button>
          </div>
        </article>

        <aside class="reading-sidebar-pane" style="width: 320px; display: flex; flex-direction: column; gap: 16px;">
          <!-- Dedicated Vocabulary Drawer Slot -->
          <div class="vocab-drawer-slot"></div>

          <div class="reading-sidebar-card">
            <div class="telemetry-label">Thesis Gist</div>
            <p class="reading-gist-text" style="font-size: 13px; line-height: 1.5; margin-top: 6px;">${data.thesisGist}</p>
          </div>

          <div class="reading-sidebar-card">
            <div class="telemetry-label">Marked Lexical Targets (${data.markedLexicalTargets.length})</div>
            <div class="reading-tag-cloud">
              ${data.markedLexicalTargets.map((t: string) => `
                <button type="button" class="reading-tag vocab-chip" data-word="${this.escapeHtml(t)}">
                  ${this.escapeHtml(t)}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="reading-sidebar-card">
            <div class="telemetry-label" style="margin-bottom: 8px;">COMPREHENSION CHECKS</div>
            ${data.comprehensionChecks.map((check: any, idx: number) => `
              <div class="comp-check-item">
                <div class="comp-question">${idx + 1}. ${check.question}</div>
                <details class="comp-answer-reveal">
                  <summary class="hud-btn-link" style="cursor: pointer; color: var(--accent-gold); font-weight: 600;">Reveal Verification</summary>
                  <p class="comp-answer">${check.answer}</p>
                </details>
              </div>
            `).join('')}
          </div>
        </aside>
      </div>
    `;

    // Render initial drawer state
    const drawerSlot = slot.querySelector('.vocab-drawer-slot') as HTMLElement;
    if (drawerSlot) {
      if (this.activeVocabDrawerWord) {
        const info = this.getVocabInfo(this.activeVocabDrawerWord, article);
        this.renderVocabDrawerInto(drawerSlot, info);
      } else {
        this.renderVocabDrawerInto(drawerSlot, null);
      }
    }

    // Bind clickable vocabulary targets in reading text
    const vocabTargets = slot.querySelectorAll('.vocab-target');
    vocabTargets.forEach(el => {
      const word = (el as HTMLElement).dataset.word || el.textContent || '';
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openVocabDrawer(word);
      });
      el.addEventListener('keydown', (e) => {
        const ke = e as KeyboardEvent;
        if (ke.key === 'Enter' || ke.key === ' ') {
          ke.preventDefault();
          this.openVocabDrawer(word);
        }
      });
    });

    // Bind sidebar vocabulary chips
    const vocabChips = slot.querySelectorAll('.vocab-chip');
    vocabChips.forEach(chip => {
      const word = (chip as HTMLElement).dataset.word || chip.textContent || '';
      chip.addEventListener('click', () => {
        this.openVocabDrawer(word);
      });
    });

    // Timer controls
    const toggleTimerBtn = slot.querySelector('.btn-toggle-timer');
    const toggleFocusBtn = slot.querySelector('.btn-toggle-focus');
    const timerText = slot.querySelector('.timer-display-text');
    const readingBody = slot.querySelector('.reading-body');
    const proceedBtn = slot.querySelector('.btn-proceed-next');

    toggleTimerBtn?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      if (this.isSkimTimerRunning) {
        if (this.skimTimerInterval) clearInterval(this.skimTimerInterval);
        this.isSkimTimerRunning = false;
        toggleTimerBtn.textContent = '▶ Resume Skim';
      } else {
        this.isSkimTimerRunning = true;
        toggleTimerBtn.textContent = '⏸ Pause Timer';
        this.skimTimerInterval = setInterval(() => {
          if (this.skimSecondsRemaining > 0) {
            this.skimSecondsRemaining -= 1;
            if (timerText) timerText.textContent = `00:${String(this.skimSecondsRemaining).padStart(2, '0')}`;
          } else {
            clearInterval(this.skimTimerInterval);
            this.isSkimTimerRunning = false;
            AudioSynthesizer.play('chime');
            toggleTimerBtn.textContent = '✓ Skim Completed';
          }
        }, 1000);
      }
    });

    toggleFocusBtn?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.isFocusModeActive = !this.isFocusModeActive;
      if (this.isFocusModeActive) {
        readingBody?.classList.add('skim-focused');
        toggleFocusBtn.innerHTML = icon('eye') + ' Unblur Detail';
      } else {
        readingBody?.classList.remove('skim-focused');
        toggleFocusBtn.innerHTML = icon('target') + ' Focus Headings';
      }
    });

    proceedBtn?.addEventListener('click', () => {
      this.clearSkimTimer();
      this.currentPass = 2;
      AudioSynthesizer.play('click');
      this.render();
    });
  }

  private renderPass2SyntaxDissection(slot: Element, dissections: any[]): void {
    slot.innerHTML = `
      <div class="reading-syntax-layout">
        <div class="syntax-intro-bar">
          <span class="telemetry-label">Pass 2 · Clausal & Syntactic Architecture</span>
          <p class="syntax-subtitle">Deconstructing core subject-verb-object predicates and subordinate functional clauses.</p>
        </div>
        <div class="syntax-cards-grid">
          ${dissections.map((d, idx) => `
            <div class="syntax-card">
              <div class="syntax-header">
                <span class="telemetry-label">Dissection 0${idx + 1}</span>
              </div>
              <blockquote class="syntax-sentence" style="max-width: 68ch; line-height: 1.62;">"${d.sentence}"</blockquote>

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
                  <div class="telemetry-label" style="margin-bottom: 8px;">Subordinate Clauses</div>
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
                <span class="telemetry-label">Rhetorical Analysis</span>
                <p class="syntax-analysis-text" style="max-width: 68ch; line-height: 1.5;">${d.syntacticAnalysis}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="pass-progression-bar">
          <button class="hud-btn btn-proceed-next" style="padding: 8px 18px; font-weight: 700;">
            Proceed to Pass 3: Lexical Mining ${icon('arrowRight')}
          </button>
        </div>
      </div>
    `;

    slot.querySelector('.btn-proceed-next')?.addEventListener('click', () => {
      this.currentPass = 3;
      AudioSynthesizer.play('click');
      this.render();
    });
  }

  private renderPass3SentenceMining(slot: Element, miningCards: any[]): void {
    if (miningCards.length === 0) {
      slot.innerHTML = `<div class="empty-state-notice"><div class="telemetry-label">NO MINING CARDS</div></div>`;
      return;
    }

    const item = miningCards[this.miningCardIndex];
    slot.innerHTML = `
      <div class="reading-mining-layout">
        <div class="dossier-nav-bar" style="margin-bottom: 16px;">
          <button class="hud-btn mine-btn-prev">${icon('arrowLeft')} Prev Card</button>
          <span class="telemetry-value mine-counter">MINED ITEM ${this.miningCardIndex + 1} / ${miningCards.length}</span>
          <button class="hud-btn mine-btn-next">Next Card ${icon('arrowRight')}</button>
        </div>
        <div class="mining-card-mount"></div>

        <div class="pass-progression-bar" style="margin-top: 16px;">
          <button class="hud-btn btn-proceed-next" style="padding: 8px 18px; font-weight: 700;">
            Proceed to Pass 4: Critical Synthesis ${icon('arrowRight')}
          </button>
        </div>
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
      category: `i+1 MINING · ${item.partOfSpeech.toUpperCase()}`,
      indexStr: `${this.miningCardIndex + 1} / ${miningCards.length}`,
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

    slot.querySelector('.btn-proceed-next')?.addEventListener('click', () => {
      this.currentPass = 4;
      AudioSynthesizer.play('click');
      this.render();
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
          <div class="telemetry-label">Pass 4 · 50-Word Benchmark Précis</div>
          <blockquote class="synthesis-precis-box" style="max-width: 68ch; line-height: 1.62;">
            ${synthesis.modelPrécis}
          </blockquote>
          <div class="synthesis-meta">
            Word Count: ~<span class="telemetry-value">${synthesis.modelPrécis.split(/\s+/).length}</span> words • Density: Maximum Academic Conciseness
          </div>
        </div>

        <div class="synthesis-card">
          <div class="telemetry-label">Integrated Target Vocabulary</div>
          <div class="reading-tag-cloud" style="margin-top: 12px;">
            ${synthesis.incorporatedVocabulary.map((v: string) => `<span class="reading-tag active">${v}</span>`).join('')}
          </div>
        </div>

        <div class="synthesis-card">
          <div class="telemetry-label">Reverse-Engineering Reconstruction Prompt</div>
          <p class="synthesis-reconstruction-prompt" style="max-width: 68ch; line-height: 1.62;">
            ${synthesis.reconstructionPrompt || 'Close this dossier. In your notebook or writing buffer, reconstruct the central thesis of the article in exactly 3 complex sentences utilizing at least 3 of the mined vocabulary items.'}
          </p>
          <div style="margin-top: 16px;">
            <button class="hud-btn btn-finish-reading" style="padding: 10px 20px; font-weight: 700; background: var(--accent-gold); color: var(--bg-canvas); border: none; box-shadow: var(--shadow-glow);">
              Complete Intensive Pass & Log to Record
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
    if (key === 'Escape' && this.activeVocabDrawerWord) {
      this.closeVocabDrawer();
      return true;
    }
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
