/**
 * Computer-Delivered IELTS (CD-IELTS) Exam Cockpit Dossier Component (ENG-108)
 * Official British Council / IDP CD-IELTS Ergonomic Test Station
 * 
 * Features:
 * - 100dvh viewport locking with independent left/right scroll containment
 * - 50/50 split-screen container with interactive pointer drag resizer
 * - Native passage highlighter tool (Selection -> Highlight / Clear)
 * - Synchronized question pane with direct paragraph jump anchors
 * - Real-time live word counter (150/250 thresholds) with throttled 1000ms autosave scratchpad
 * - Bottom 1-40 question navigator bar with answered, unanswered, and flagged states
 * - 4 official Cambridge contrast themes: Standard Light, Dark Obsidian, Yellow on Black, Blue on Cream
 * - Fullscreen distraction-free Exam Mode (native HTML Fullscreen API)
 * - Keyboard accessible hotkeys: Alt+N (Next), Alt+P (Prev), Alt+F (Flag), Ctrl+Enter (Submit)
 * - WCAG 2.2 AAA accessibility: >=44px hitboxes, coaxial focus rings
 */

import { icon } from '../utils/icons';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import { I18n, t } from '../core/i18n';
import { HeaderHUD } from './header-hud';
import readingData from '../ielts/data/reading.json';
import originalReadingData from '../ielts/data/originals-reading.json';
import { ReadingPassage } from '../ielts/types';

export type CambridgeTheme = 'app-theme' | 'standard-light' | 'dark-obsidian' | 'yellow-black' | 'blue-cream';

export type CockpitModule = 'READING' | 'WRITING' | 'LISTENING';

export interface QuestionItem {
  id: number;
  type: 'tfng' | 'mcq' | 'gap';
  prompt: string;
  paragraphAnchor?: string; // e.g. "Paragraph B"
  options?: string[];
  userAnswer?: string;
  isFlagged: boolean;
  correctAnswer?: string;
  passageIndex?: 0 | 1 | 2;
  explanation?: string;
}

export interface CockpitData {
  title: string;
  module: CockpitModule;
  timeRemainingSec: number;
  passageHtml: string;
  questions: QuestionItem[];
  writingTaskNumber?: 1 | 2;
  writingTargetMinWords?: number;
}

export interface CockpitTestMeta {
  id: string;
  testNumber: number;
  title: string;
  subtitle: string;
  module: CockpitModule;
  questionCount: number;
  durationMinutes: number;
  passages: { title: string; subtitle: string; qRange: string; typeDesc: string }[];
}

export class ExamCockpitDossier {
  private container: HTMLElement;
  private currentTheme: CambridgeTheme = 'app-theme';
  private currentModule: CockpitModule = 'READING';
  private activeQuestionIndex: number = 0; // 0-based (0..39)
  private activeFilter: string = 'all'; // 'all' | 'p1' | 'p2' | 'p3' | 's1' | 's2' | 's3' | 's4'
  private isReviewMode: boolean = false;

  // Test Selection & Lobby state
  private isExamStarted: boolean = false;
  private isTimerPaused: boolean = false;
  private showTestHubModal: boolean = true;
  private selectedTestIndex: number = 0;

  public readonly testCatalog: CockpitTestMeta[] = [
    {
      id: 'mock-01',
      testNumber: 1,
      title: 'Cambridge CD-IELTS Academic Mock 1 (Official)',
      subtitle: 'The Falkirk Wheel · The Psychology of Collecting · Human Language Evolution',
      module: 'READING',
      questionCount: 40,
      durationMinutes: 60,
      passages: [
        { title: 'The Falkirk Wheel: Engineering a Scottish Landmark', subtitle: 'Rotating boat lift connecting historic canals', qRange: 'Câu 1–13', typeDesc: 'TRUE / FALSE / NOT GIVEN' },
        { title: 'Collecting Antiques and Ephemera: The Psychology of Ownership', subtitle: 'Evolutionary and social motivations of collectors', qRange: 'Câu 14–26', typeDesc: 'Multiple Choice (A–D)' },
        { title: 'The Evolutionary Origins and Complexity of Human Language', subtitle: 'Anatomical adaptations and syntactic recursion', qRange: 'Câu 27–40', typeDesc: 'Sentence Completion' }
      ]
    },
    {
      id: 'mock-02',
      testNumber: 2,
      title: 'Academic Reading Mock 2: Science & Society',
      subtitle: 'The Printing Press · Urban Heat Islands · Metacognitive Learning',
      module: 'READING',
      questionCount: 40,
      durationMinutes: 60,
      passages: [
        { title: 'The Evolution of the Printing Press', subtitle: 'From Gutenberg to mechanical movable type', qRange: 'Câu 1–13', typeDesc: 'TFNG & Short Answers' },
        { title: 'Urban Heat Islands and City Climate', subtitle: 'Microclimate alteration and thermal mitigation', qRange: 'Câu 14–26', typeDesc: 'Multiple Choice & Gap Fill' },
        { title: 'Metacognition and Learning Effectiveness', subtitle: 'Self-regulated study and cognitive strategy monitoring', qRange: 'Câu 27–40', typeDesc: 'Summary & Sentence Completion' }
      ]
    },
    {
      id: 'mock-03',
      testNumber: 3,
      title: 'Academic Reading Mock 3: History & Biology',
      subtitle: 'Ancient Pictographic Systems · Dutch Golden Age · Marine Echolocation',
      module: 'READING',
      questionCount: 40,
      durationMinutes: 60,
      passages: [
        { title: 'Ancient Pictographic Writing Systems', subtitle: 'Cuneiform, hieroglyphs, and semantic symbols', qRange: 'Câu 1–13', typeDesc: 'TFNG & Matching' },
        { title: 'The Dutch Golden Age and International Trade', subtitle: 'Maritime commerce, cartography, and wealth', qRange: 'Câu 14–26', typeDesc: 'Multiple Choice & Matching' },
        { title: 'Echolocation in Marine Mammals', subtitle: 'Biosonar navigation and acoustic foraging', qRange: 'Câu 27–40', typeDesc: 'Sentence Completion & TFNG' }
      ]
    },
    {
      id: 'mock-04',
      testNumber: 4,
      title: 'Academic Reading Mock 4: Originals Archive',
      subtitle: 'Ocean Bathymetry · Urban Beekeeping · Global Seed Banks',
      module: 'READING',
      questionCount: 39,
      durationMinutes: 60,
      passages: [
        { title: 'Charting the Deep: Ocean Bathymetry', subtitle: 'Mapping underwater trenches and the sea floor', qRange: 'Câu 1–13', typeDesc: 'TFNG & Diagram Labelling' },
        { title: 'Urban Beekeeping and Pollinator Ecology', subtitle: 'Rooftop apiaries and biodiversity resilience', qRange: 'Câu 14–26', typeDesc: 'Multiple Choice & Gap Fill' },
        { title: 'The Global Economics of Seed Banks', subtitle: 'Germplasm conservation and agricultural security', qRange: 'Câu 27–39', typeDesc: 'Summary Completion & Matching' }
      ]
    },
    {
      id: 'mock-05',
      testNumber: 5,
      title: 'CD-IELTS Academic Writing Studio Simulation',
      subtitle: 'Official British Council / IDP Task 1 & Task 2 Test Station',
      module: 'WRITING',
      questionCount: 2,
      durationMinutes: 60,
      passages: [
        { title: 'Task 1: Renewable Energy Production in Europe (2010–2025)', subtitle: 'Data synthesis, comparative trends & overview', qRange: 'Task 1', typeDesc: 'Min 150 words · 20 mins' },
        { title: 'Task 2: Automation, AI & Workforce Displacement', subtitle: 'Discursive opinion essay with counter-arguments', qRange: 'Task 2', typeDesc: 'Min 250 words · 40 mins' }
      ]
    }
  ];

  public getIsExamStarted(): boolean { return this.isExamStarted; }
  public getSelectedTestIndex(): number { return this.selectedTestIndex; }

  public getActiveFilter(): string { return this.activeFilter; }
  public getIsReviewMode(): boolean { return this.isReviewMode; }

  public isExamActive(): boolean {
    return this.isExamStarted && !this.isReviewMode;
  }

  public async canDeactivate(_toRoute?: string): Promise<boolean> {
    if (!this.isExamActive()) return true;

    const isVi = I18n.getLocale() === 'vi';
    const testTitle = this.testCatalog[this.selectedTestIndex]?.title || 'IELTS Mock Test';
    const title = isVi ? 'XÁC NHẬN THOÁT BÀI THI' : 'EXIT EXAM CONFIRMATION';
    const message = isVi
      ? `Bạn đang làm bài thi "${testTitle}".\n\nNếu thoát ra ngoài lúc này, toàn bộ câu trả lời và tiến trình sẽ bị huỷ.\nBạn có chắc chắn muốn thoát khỏi bài thi không?`
      : `You are currently taking "${testTitle}".\n\nIf you navigate away now, your current answers and timer progress will be lost.\nAre you sure you want to exit the exam?`;

    return HeaderHUD.showConfirmDialog({
      title,
      message,
      confirmText: isVi ? 'Thoát bài thi' : 'Exit Exam',
      cancelText: isVi ? 'Tiếp tục làm bài' : 'Continue Exam',
      type: 'warning'
    });
  }

  private beforeUnloadHandler = (e: BeforeUnloadEvent) => {
    if (this.isExamActive()) {
      e.preventDefault();
      e.returnValue = '';
      return '';
    }
  };

  // Mobile Tabbed Split-Screen State (<= 768px)
  private mobileActiveTab: 'passage' | 'questions' = 'passage';

  public getMobileActiveTab(): 'passage' | 'questions' {
    return this.mobileActiveTab;
  }

  public setMobileActiveTab(tab: 'passage' | 'questions'): void {
    this.mobileActiveTab = tab;
    this.applyMobileTabState();
  }

  public toggleMobileActiveTab(): void {
    this.setMobileActiveTab(this.mobileActiveTab === 'passage' ? 'questions' : 'passage');
  }

  public applyMobileTabState(): void {
    const arena = this.container.querySelector('#cd-split-arena') as HTMLElement | null;
    if (arena) {
      arena.setAttribute('data-mobile-active', this.mobileActiveTab);
    }

    const mobileTabBtns = this.container.querySelectorAll('.cd-mobile-tab-btn');
    mobileTabBtns.forEach(btn => {
      const isCur = (btn as HTMLElement).dataset.tab === this.mobileActiveTab;
      btn.classList.toggle('is-active', isCur);
      btn.setAttribute('aria-selected', String(isCur));
    });
  }

  // Split-screen drag resizer state
  private leftWidthPct: number = 50;
  private isDraggingResizer: boolean = false;

  // Questions state (1 to 40)
  private questions: QuestionItem[] = [];

  // Writing state
  private writingWordCount: number = 0;
  private writingTargetWords: number = 250;
  private lastAutosaveTimestamp: string = '';
  private autosaveTimer: any = null;

  // Timer state
  private timerSeconds: number = 3600; // 60 minutes
  private timerInterval: any = null;

  // Highlighter state
  private highlightPopover: HTMLElement | null = null;

  public onTestSubmitted?: () => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'cd-cockpit-shell';
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-roledescription', 'exam-cockpit');
    this.container.setAttribute('aria-label', t('cockpit.module_dialog_label', undefined, 'Computer-Delivered IELTS Exam Cockpit'));
    this.container.setAttribute('data-cockpit-theme', this.currentTheme);

    this.initQuestions();
    this.initAutosaveRecovery();
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
  }

  private initQuestions(): void {
    // Authentic 40-question palette for CD-IELTS Reading Mock
    const TFNG = ['TRUE', 'FALSE', 'NOT GIVEN'];
    const questionsData: Omit<QuestionItem, 'isFlagged'>[] = [
      // Q1-13: TRUE / FALSE / NOT GIVEN on Passage 1 (The Falkirk Wheel) — 5 TRUE, 4 FALSE, 4 NOT GIVEN
      { id: 1, type: 'tfng', prompt: 'The two canals were once joined by a series of locks.', paragraphAnchor: 'A', options: TFNG, correctAnswer: 'TRUE', passageIndex: 0, explanation: 'Paragraph A: "Historically, the two canals had been connected by a flight of eleven locks." A "flight of locks" is a series of locks.' },
      { id: 2, type: 'tfng', prompt: 'The original locks were removed because they had become too expensive to maintain.', paragraphAnchor: 'A', options: TFNG, correctAnswer: 'NOT GIVEN', passageIndex: 0, explanation: 'Paragraph A says the locks "had been dismantled and backfilled in 1933" but gives no reason. The removal is mentioned; the cause is not, so NOT GIVEN rather than TRUE.' },
      { id: 3, type: 'tfng', prompt: 'The organisers of the Millennium Link wanted to rebuild the historic locks.', paragraphAnchor: 'B', options: TFNG, correctAnswer: 'FALSE', passageIndex: 0, explanation: 'Paragraph B: the project "demanded an iconic, forward-looking structure rather than a reconstruction of the historic locks". This directly contradicts the statement.' },
      { id: 4, type: 'tfng', prompt: 'Turning the wheel uses about as much electricity as boiling a single kettle.', paragraphAnchor: 'B', options: TFNG, correctAnswer: 'FALSE', passageIndex: 0, explanation: 'Paragraph B: it uses "roughly the same electrical energy as boiling eight domestic kettles". One kettle contradicts eight.' },
      { id: 5, type: 'tfng', prompt: 'The design of the wheel was based on the shape of an ancient weapon.', paragraphAnchor: 'B', options: TFNG, correctAnswer: 'TRUE', passageIndex: 0, explanation: 'Paragraph B: the design "was inspired by a Celtic double-headed axe". An axe of this kind is a historic weapon; "inspired by" paraphrases "based on".' },
      { id: 6, type: 'tfng', prompt: 'Moving boats from one canal level to the other takes the wheel less than ten minutes.', paragraphAnchor: 'E', options: TFNG, correctAnswer: 'TRUE', passageIndex: 0, explanation: 'Paragraph E: "The entire rotation takes approximately five and a half minutes", which is under ten.' },
      { id: 7, type: 'tfng', prompt: 'The caissons stay balanced only when both of them are carrying boats of similar weight.', paragraphAnchor: 'C', options: TFNG, correctAnswer: 'FALSE', passageIndex: 0, explanation: 'Paragraph C: the caissons "remain in absolute balance even when one holds a heavy canal barge and the other holds only water". Balance does not depend on matching boats.' },
      { id: 8, type: 'tfng', prompt: 'The steel parts of the wheel were fitted together for the first time in England.', paragraphAnchor: 'D', options: TFNG, correctAnswer: 'TRUE', passageIndex: 0, explanation: 'Paragraph D: the components were "manufactured and pre-assembled with millimetric precision in Derbyshire, England, before being dismantled and transported to Falkirk".' },
      { id: 9, type: 'tfng', prompt: 'Some of the components were damaged on their way to Falkirk.', paragraphAnchor: 'D', options: TFNG, correctAnswer: 'NOT GIVEN', passageIndex: 0, explanation: 'Paragraph D mentions the "45 oversized lorry loads" but says nothing about damage in transit. The journey is mentioned; damage is not.' },
      { id: 10, type: 'tfng', prompt: 'A machine tightened each of the bolts automatically.', paragraphAnchor: 'D', options: TFNG, correctAnswer: 'FALSE', passageIndex: 0, explanation: 'Paragraph D: each bolt was "tightened by hand with an electronic torque wrench". The tool was electronic, but the work was done by hand, not automatically.' },
      { id: 11, type: 'tfng', prompt: 'The wheel was opened as part of a royal celebration.', paragraphAnchor: 'E', options: TFNG, correctAnswer: 'TRUE', passageIndex: 0, explanation: 'Paragraph E: it was "Opened by Queen Elizabeth II on 24 May 2002 as part of her Golden Jubilee celebrations".' },
      { id: 12, type: 'tfng', prompt: 'Visitor numbers at the wheel have risen every year since it opened.', paragraphAnchor: 'E', options: TFNG, correctAnswer: 'NOT GIVEN', passageIndex: 0, explanation: 'Paragraph E gives only a total ("over 5.5 million visitors"), not a year-by-year trend.' },
      { id: 13, type: 'tfng', prompt: 'The wheel itself accounted for most of the cost of the Millennium Link project.', paragraphAnchor: 'B', options: TFNG, correctAnswer: 'NOT GIVEN', passageIndex: 0, explanation: 'Paragraph B gives the cost of the whole project (£84.5 million) but never says how much of it the wheel took.' },

      // Q14-26: Multiple choice on Passage 2 (Collecting) — keys A4 / B3 / C3 / D3
      { id: 14, type: 'mcq', prompt: 'In Paragraph A, the writer distinguishes collectors from hoarders mainly by', paragraphAnchor: 'A', options: ['A. the money their possessions are worth.', 'B. the number of objects they accumulate.', 'C. the way they select and organise what they own.', 'D. how attached they feel to each object.'], correctAnswer: 'C. the way they select and organise what they own.', passageIndex: 1, explanation: 'Paragraph A: collectors "curate, categorize, authenticate, and display their possessions according to systematic criteria", while hoarding is "disorganized accumulation". D is tempting because hoarders feel distress when parting with items, but attachment is not the dividing line the writer draws.' },
      { id: 15, type: 'mcq', prompt: 'According to evolutionary psychologists, the urge to collect first developed because', paragraphAnchor: 'B', options: ['A. storing useful materials helped people survive times of shortage.', 'B. owning rare objects made people more attractive to partners.', 'C. early humans needed a way to record their history.', 'D. sharing tools strengthened loyalty within a group.'], correctAnswer: 'A. storing useful materials helped people survive times of shortage.', passageIndex: 1, explanation: 'Paragraph B: accumulating "seeds, tools, durable materials—conferred a distinct survival advantage during seasonal scarcities". B, C and D are not mentioned.' },
      { id: 16, type: 'mcq', prompt: 'What happens to the collecting instinct in societies where basic material needs are met?', paragraphAnchor: 'B', options: ['A. It gradually fades away.', 'B. It shifts towards practical, everyday goods.', 'C. It becomes a source of anxiety.', 'D. It is redirected towards objects valued for their meaning rather than their use.'], correctAnswer: 'D. It is redirected towards objects valued for their meaning rather than their use.', passageIndex: 1, explanation: 'Paragraph B: the instinct "is sublimated into symbolic domains: rare stamps, vintage timepieces, first-edition books". B reverses this: the objects are symbolic, not practical.' },
      { id: 17, type: 'mcq', prompt: 'Thorstein Veblen is mentioned to support the idea that collecting', paragraphAnchor: 'C', options: ['A. began as a survival strategy.', 'B. can display a person\'s wealth and refined taste.', 'C. protects people against the passing of time.', 'D. produces chemical rewards in the brain.'], correctAnswer: 'B. can display a person\'s wealth and refined taste.', passageIndex: 1, explanation: 'Paragraph C: Veblen noted that acquiring rare artifacts signals "wealth, discerning connoisseurship, and specialized leisure". A, C and D are ideas from Paragraphs B, D and E, not Veblen\'s.' },
      { id: 18, type: 'mcq', prompt: 'Why does verified provenance matter to a collector, according to Paragraph C?', paragraphAnchor: 'C', options: ['A. It proves an object is old enough to be valuable.', 'B. It makes an object easier to sell later.', 'C. It allows a museum to accept the object.', 'D. It earns the owner respect among knowledgeable peers.'], correctAnswer: 'D. It earns the owner respect among knowledgeable peers.', passageIndex: 1, explanation: 'Paragraph C: provenance "elevates the owner within scholarly or elite communities, establishing peer recognition and social prestige". The text says nothing about age, resale or museums.' },
      { id: 19, type: 'mcq', prompt: 'The items described as ephemera in Paragraph D are', paragraphAnchor: 'D', options: ['A. ordinary objects that were never meant to last.', 'B. valuable antiques with documented histories.', 'C. natural specimens such as rocks and minerals.', 'D. early printings of important books.'], correctAnswer: 'A. ordinary objects that were never meant to last.', passageIndex: 1, explanation: 'Paragraph D: "Everyday ephemera—postcards, concert tickets, mid-century packaging" are "fragile paper artifacts". C and D echo the symbolic collectables listed in Paragraph B, not ephemera.' },
      { id: 20, type: 'mcq', prompt: 'According to Paragraph D, people who collect ephemera are partly motivated by a wish to', paragraphAnchor: 'D', options: ['A. impress members of elite communities.', 'B. hold on to a past that time would otherwise erase.', 'C. complete a full classification of a category.', 'D. profit from rising prices.'], correctAnswer: 'B. hold on to a past that time would otherwise erase.', passageIndex: 1, explanation: 'Paragraph D: collectors "construct a psychological bulwark against the relentless transience of time". A belongs to Paragraph C and C to Paragraph A.' },
      { id: 21, type: 'mcq', prompt: 'The writer compares the experience of finally finding a long-sought item to', paragraphAnchor: 'E', options: ['A. the excitement of winning a competition.', 'B. the relief of giving up a hoarding habit.', 'C. the satisfaction of solving a problem.', 'D. the pleasure of receiving a gift.'], correctAnswer: 'C. the satisfaction of solving a problem.', passageIndex: 1, explanation: 'Paragraph E: it "triggers dopamine releases akin to reward pathways in problem-solving". "Akin to" signals the comparison.' },
      { id: 22, type: 'mcq', prompt: 'Which of these is NOT presented in the passage as a reason why people collect?', paragraphAnchor: 'C', options: ['A. making a financial investment', 'B. gaining social status', 'C. feeling a link to earlier times', 'D. enjoying the search itself'], correctAnswer: 'A. making a financial investment', passageIndex: 1, explanation: 'Status (Paragraph C), nostalgia (Paragraph D) and "the thrill of the hunt" (Paragraph E) are all given. Money is never presented as a motive.' },
      { id: 23, type: 'mcq', prompt: 'In Paragraph E, the writer\'s view of scholarly collecting is that it', paragraphAnchor: 'E', options: ['A. is mainly a passive form of entertainment.', 'B. has damaged many historical records.', 'C. has helped build the holdings of public institutions.', 'D. should be left to professional researchers.'], correctAnswer: 'C. has helped build the holdings of public institutions.', passageIndex: 1, explanation: 'Paragraph E: collecting "has fostered significant museum collections and preserved invaluable historical records". A is the view the writer rejects ("Far from a passive hobby").' },
      { id: 24, type: 'mcq', prompt: 'The word "sublimated" in Paragraph B is closest in meaning to', paragraphAnchor: 'B', options: ['A. channelled into another form', 'B. completely destroyed', 'C. hidden from other people', 'D. made much stronger'], correctAnswer: 'A. channelled into another form', passageIndex: 1, explanation: 'Paragraph B: the foraging instinct "is sublimated into symbolic domains": the same drive is expressed through stamps and books instead of seeds and tools, so it is redirected, not destroyed or hidden.' },
      { id: 25, type: 'mcq', prompt: 'What is the main purpose of the passage as a whole?', paragraphAnchor: 'A', options: ['A. to warn readers about the dangers of hoarding', 'B. to explain several different reasons why people collect', 'C. to describe how museums obtain their collections', 'D. to argue that collecting is a modern invention'], correctAnswer: 'B. to explain several different reasons why people collect', passageIndex: 1, explanation: 'After defining collecting (A), each paragraph adds a motive: evolution (B), status (C), nostalgia (D) and neurological reward (E). Hoarding and museums are only side points; D contradicts Paragraph B.' },
      { id: 26, type: 'mcq', prompt: 'According to Paragraph A, what do collectors gain from completing a set?', paragraphAnchor: 'A', options: ['A. financial security', 'B. recognition from museums', 'C. relief from emotional distress', 'D. mental stimulation and a sense of beauty'], correctAnswer: 'D. mental stimulation and a sense of beauty', passageIndex: 1, explanation: 'Paragraph A: collectors derive "intellectual stimulation and aesthetic satisfaction from completing a taxonomy". C describes hoarders, who feel distress, not collectors.' },

      // Q27-40: Sentence completion on Passage 3 (Language) — answers copied exactly from the passage
      { id: 27, type: 'gap', prompt: 'Complex animal communication includes the warning calls of vervet monkeys and the elaborate [ GAP ] performed by honeybees. (ONE WORD)', paragraphAnchor: 'A', correctAnswer: 'dance', passageIndex: 2, explanation: 'Paragraph A: "the alarm calls of vervet monkeys or the intricate dance of honeybees".' },
      { id: 28, type: 'gap', prompt: 'Human language differs from animal signalling through its layered structure, unlimited recursion and [ GAP ]. (ONE WORD)', paragraphAnchor: 'A', correctAnswer: 'displacement', passageIndex: 2, explanation: 'Paragraph A: human language "is distinguished by hierarchical syntax, displacement, and infinite recursion". Syntax and recursion are already paraphrased in the sentence, leaving displacement.' },
      { id: 29, type: 'gap', prompt: 'From a small set of sounds, speakers can create an endless number of new [ GAP ]. (ONE WORD)', paragraphAnchor: 'A', correctAnswer: 'expressions', passageIndex: 2, explanation: 'Paragraph A: "the generation of limitless novel expressions from finite phonetic elements".' },
      { id: 30, type: 'gap', prompt: 'Changes to the vocal tract, especially the lowering of the [ GAP ], made a wide range of speech sounds possible. (ONE WORD)', paragraphAnchor: 'B', correctAnswer: 'larynx', passageIndex: 2, explanation: 'Paragraph B: "The descent of the human larynx ... enabled the acoustic modulation necessary for diverse vowel and consonant production." "Lowering" paraphrases "descent".' },
      { id: 31, type: 'gap', prompt: 'This anatomical change came at a cost: humans became more likely to suffer from [ GAP ]. (ONE WORD)', paragraphAnchor: 'B', correctAnswer: 'choking', passageIndex: 2, explanation: 'Paragraph B: "this anatomical descent dramatically increased the risk of choking".' },
      { id: 32, type: 'gap', prompt: 'When groups grew too large for members to groom each other by hand, [ GAP ] took over this bonding role. (NO MORE THAN TWO WORDS)', paragraphAnchor: 'C', correctAnswer: 'vocal grooming', passageIndex: 2, explanation: 'Paragraph C: "vocal grooming replaced physical grooming as early human social group sizes expanded". "Physical grooming" is the thing replaced, so it cannot be the answer.' },
      { id: 33, type: 'gap', prompt: 'Speaking to several group members at once saved both time and [ GAP ]. (NO MORE THAN TWO WORDS)', paragraphAnchor: 'C', correctAnswer: 'metabolic energy', passageIndex: 2, explanation: 'Paragraph C: communicating "with multiple conspecifics simultaneously, conserving time and metabolic energy".' },
      { id: 34, type: 'gap', prompt: 'One particular nerve pathway, the [ GAP ], connects hearing, movement planning and meaning across both halves of the brain. (NO MORE THAN TWO WORDS)', paragraphAnchor: 'D', correctAnswer: 'arcuate fasciculus', passageIndex: 2, explanation: 'Paragraph D: "white-matter tract development—notably the arcuate fasciculus—that integrates auditory perception, motor sequencing, and conceptual semantics across both cerebral hemispheres".' },
      { id: 35, type: 'gap', prompt: 'People with a faulty version of the gene called [ GAP ] have serious difficulty producing speech and grammar. (ONE WORD AND/OR A NUMBER)', paragraphAnchor: 'E', correctAnswer: 'FOXP2', passageIndex: 2, explanation: 'Paragraph E: "Mutations in FOXP2 cause severe verbal dyspraxia and expressive grammar impairments."' },
      { id: 36, type: 'gap', prompt: 'The modern form of this gene improved control of the mouth and face, allowing rapid [ GAP ] speech. (ONE WORD)', paragraphAnchor: 'E', correctAnswer: 'articulatory', passageIndex: 2, explanation: 'Paragraph E: the gene refined "fine-grained orofacial motor coordination for rapid articulatory speech".' },
      { id: 37, type: 'gap', prompt: 'The writer concludes that language is more than a system of sounds; it is a tool for cognitive [ GAP ]. (ONE WORD)', paragraphAnchor: 'F', correctAnswer: 'representation', passageIndex: 2, explanation: 'Paragraph F: language evolved "not merely as an acoustic signal system, but as an engine of cognitive representation".' },
      { id: 38, type: 'gap', prompt: 'Language allows people to think about events that never happened by forming [ GAP ] hypotheses. (ONE WORD)', paragraphAnchor: 'F', correctAnswer: 'counterfactual', passageIndex: 2, explanation: 'Paragraph F: humans "formulate counterfactual hypotheses". A counterfactual is a claim about something that did not happen.' },
      { id: 39, type: 'gap', prompt: 'Through language, each generation can pass on and build upon cultural [ GAP ]. (ONE WORD)', paragraphAnchor: 'F', correctAnswer: 'innovations', passageIndex: 2, explanation: 'Paragraph F: humans "transmit cumulative cultural innovations across generations".' },
      { id: 40, type: 'gap', prompt: 'Language also makes complex [ GAP ] between institutions possible on a worldwide scale. (ONE WORD)', paragraphAnchor: 'F', correctAnswer: 'cooperation', passageIndex: 2, explanation: 'Paragraph F: humans "establish intricate institutional cooperation on a global planetary scale".' }
    ];

    this.questions = [];
    for (let i = 1; i <= 40; i++) {
      const q = questionsData[i - 1];
      if (q) {
        this.questions.push({ ...q, isFlagged: false });
      }
    }
  }

  private initAutosaveRecovery(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const savedTheme = localStorage.getItem('cd_ielts_theme') as CambridgeTheme;
        if (savedTheme) {
          this.currentTheme = savedTheme;
          this.container.setAttribute('data-cockpit-theme', this.currentTheme);
        }
      } catch {
        // storage disabled guard
      }
    }
  }

  public selectTest(testIndex: number): void {
    if (testIndex < 0 || testIndex >= this.testCatalog.length) return;
    this.selectedTestIndex = testIndex;
    const cards = this.container.querySelectorAll('.cd-test-card');
    cards.forEach((c, idx) => {
      const isSel = idx === testIndex;
      c.classList.toggle('is-selected', isSel);
      c.setAttribute('aria-pressed', String(isSel));
      const badge = c.querySelector('.cd-test-card-badge');
      if (badge) badge.textContent = isSel ? '✓ ĐÃ CHỌN' : 'CHỌN ĐỀ NÀY';
    });
  }

  public loadTest(testIndex: number): void {
    if (testIndex < 0 || testIndex >= this.testCatalog.length) return;
    this.selectedTestIndex = testIndex;
    const meta = this.testCatalog[testIndex];
    this.currentModule = meta.module;
    this.timerSeconds = meta.durationMinutes * 60;
    this.isReviewMode = false;
    this.activeQuestionIndex = 0;

    if (testIndex === 4) {
      this.currentModule = 'WRITING';
      this.mobileActiveTab = 'questions';
    } else if (testIndex === 0) {
      this.initQuestions();
      this.mobileActiveTab = 'passage';
    } else {
      let passages: ReadingPassage[] = [];
      if (testIndex === 1) passages = (readingData as ReadingPassage[]).slice(0, 3);
      else if (testIndex === 2) passages = (readingData as ReadingPassage[]).slice(3, 6);
      else if (testIndex === 3) passages = (originalReadingData as ReadingPassage[]).slice(0, 3);
      this.loadQuestionsFromPassages(passages);
      this.mobileActiveTab = 'passage';
    }
  }

  private loadQuestionsFromPassages(passages: ReadingPassage[]): void {
    const TFNG = ['TRUE', 'FALSE', 'NOT GIVEN'];
    const newQuestions: QuestionItem[] = [];
    let qGlobalId = 1;

    passages.forEach((p, pIdx) => {
      (p.questions || []).forEach((q) => {
        if (qGlobalId > 40) return;
        const qTypeStr = q.type as string;
        const mappedType: 'tfng' | 'mcq' | 'gap' = qTypeStr === 'tfng' || qTypeStr === 'ynng'
          ? 'tfng'
          : (qTypeStr === 'mcq' || qTypeStr === 'choice' || qTypeStr === 'match' || qTypeStr === 'features' ? 'mcq' : 'gap');
        const pAnchor = q.evidence ? `Paragraph ${String.fromCharCode(65 + q.evidence.paraIndex)}` : 'Paragraph A';
        const opts = q.type === 'tfng' ? TFNG : (q as any).options;
        const ans = Array.isArray(q.answer) ? q.answer[0] : (q.answer || '');

        newQuestions.push({
          id: qGlobalId++,
          type: mappedType,
          prompt: q.prompt,
          paragraphAnchor: pAnchor,
          options: opts,
          userAnswer: undefined,
          isFlagged: false,
          correctAnswer: ans,
          passageIndex: pIdx as 0 | 1 | 2,
          explanation: (q as any).why || ''
        });
      });
    });

    while (newQuestions.length < 40) {
      const idx = newQuestions.length + 1;
      newQuestions.push({
        id: idx,
        type: 'tfng',
        prompt: `Question ${idx} on overall textual synthesis and argument coherence.`,
        paragraphAnchor: 'Paragraph E',
        options: TFNG,
        userAnswer: undefined,
        isFlagged: false,
        correctAnswer: 'TRUE',
        passageIndex: 2,
        explanation: 'Synthesis question evaluated across all 3 passages.'
      });
    }

    this.questions = newQuestions;
    this.activeQuestionIndex = 0;
  }

  public startExam(testIdx?: number): void {
    if (testIdx !== undefined && testIdx !== this.selectedTestIndex) {
      this.loadTest(testIdx);
    } else if (this.questions.length === 0) {
      this.loadTest(this.selectedTestIndex);
    }
    this.isExamStarted = true;
    this.isTimerPaused = false;
    this.showTestHubModal = false;
    this.render();
    this.startTimer();
  }

  public pauseTimer(): void {
    this.isTimerPaused = true;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  public resumeTimer(): void {
    if (!this.isExamStarted) return;
    this.isTimerPaused = false;
    this.startTimer();
  }

  public openTestHub(): void {
    this.pauseTimer();
    this.showTestHubModal = true;
    this.render();
  }

  public closeTestHub(): void {
    this.showTestHubModal = false;
    if (this.isExamStarted) {
      this.resumeTimer();
    }
    this.render();
  }

  private formatPassageFromData(passage: ReadingPassage): string {
    return `
      <article class="cd-passage-body">
        <h2 class="cd-passage-h2">${this.escapeHtml(passage.title)}</h2>
        <p class="cd-passage-lead">${this.escapeHtml(passage.topic || '')}</p>
        ${passage.paragraphs.map(p => `
          <p class="cd-paragraph" data-paragraph="${this.escapeHtml(p.label)}">
            <span class="cd-p-marker">Paragraph ${this.escapeHtml(p.label)}</span>
            ${this.escapeHtml(p.text)}
          </p>
        `).join('')}
      </article>
    `;
  }

  private renderTestHubModal(): string {
    if (!this.showTestHubModal) return '';

    return `
      <div class="cd-test-hub-overlay" id="cd-test-hub-overlay" role="dialog" aria-modal="true" aria-labelledby="cd-test-hub-title">
        <div class="cd-test-hub-card" style="position: relative;">
          <button type="button" class="cd-test-hub-close" id="btn-close-test-hub" aria-label="${t('common.close', undefined, 'Close')}" style="position: absolute; top: 16px; right: 16px; min-width: 44px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center; background: transparent; border: none; color: var(--ink-muted); font-size: 20px; cursor: pointer; border-radius: var(--radius-btn, 10px); z-index: 5;">✕</button>
          <header class="cd-test-hub-header">
            <span class="cd-test-hub-kicker">${t('cockpit.test_hub_kicker', undefined, 'OFFICIAL CD-IELTS EXAM HUB · TEST CATALOG')}</span>
            <h2 class="cd-test-hub-title" id="cd-test-hub-title">${t('cockpit.test_hub_title', undefined, 'Select Standardized CD-IELTS Test')}</h2>
            <p class="cd-test-hub-lead">
              ${t('cockpit.test_hub_lead', undefined, 'Please select a test below to begin. The 60:00 countdown timer will only start when you click "Start Timed Exam".')}
            </p>
          </header>

          <div class="cd-test-grid">
            ${this.testCatalog.map((tItem, idx) => `
              <div 
                class="cd-test-card ${this.selectedTestIndex === idx ? 'is-selected' : ''}" 
                data-test-idx="${idx}"
                role="button"
                tabindex="0"
                aria-pressed="${this.selectedTestIndex === idx}"
              >
                <div class="cd-test-card-top">
                  <span class="cd-test-card-kicker">${t('cockpit.card_test_kicker', { testNumber: tItem.testNumber, module: tItem.module }, `TEST 0${tItem.testNumber} // ${tItem.module}`)}</span>
                  <span class="cd-test-card-arrow" aria-hidden="true">${icon('arrowRight', 16)}</span>
                </div>
                <h3 class="cd-test-card-title">${this.escapeHtml(tItem.title)}</h3>
                <div class="cd-test-card-passages">
                  ${tItem.passages.map((p, pIdx) => `
                    <div class="cd-test-card-p-row" title="${this.escapeHtml(p.title)}">
                      <span>• <strong>${t('cockpit.passage_num', { n: pIdx + 1 }, `Passage ${pIdx + 1}`)}:</strong> ${this.escapeHtml(p.title.slice(0, 42))}${p.title.length > 42 ? '...' : ''} (${p.typeDesc.slice(0, 18)})</span>
                    </div>
                  `).join('')}
                </div>
                <div class="cd-test-card-meta">
                  <span>⏱️ ${tItem.durationMinutes} ${t('cockpit.mins_upper', undefined, 'MINS')} · 📝 ${tItem.questionCount} ${t('cockpit.questions_upper', undefined, 'QUESTIONS')}</span>
                  <span class="cd-test-card-badge">${this.selectedTestIndex === idx ? t('cockpit.card_selected', undefined, '✓ SELECTED') : t('cockpit.card_select_this', undefined, 'SELECT THIS TEST')}</span>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="cd-test-hub-actions">
            <button type="button" class="cd-btn-hub-cancel" id="btn-preview-exam-station">
              ${t('cockpit.btn_preview_exam', undefined, '✕ Preview Exam Station (Untimed)')}
            </button>
            <button type="button" class="cd-btn-hub-start" id="btn-start-selected-exam">
              ${icon('zap', 14)} ${t('cockpit.btn_start_timed_exam', undefined, 'Start Timed Exam (60:00)')}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  public getCurrentPassageIndex(): 0 | 1 | 2 {
    const q = this.questions[this.activeQuestionIndex];
    if (q && q.passageIndex !== undefined) return q.passageIndex;
    if (this.activeQuestionIndex < 13) return 0;
    if (this.activeQuestionIndex < 26) return 1;
    return 2;
  }

  public getPassageQuestionRange(): string {
    const pIdx = this.getCurrentPassageIndex();
    if (pIdx === 0) return '1–13';
    if (pIdx === 1) return '14–26';
    return '27–40';
  }

  public render(): HTMLElement {
    this.container.innerHTML = '';
    this.container.setAttribute('data-cockpit-theme', this.currentTheme);

    const activeQ = this.questions[this.activeQuestionIndex] || this.questions[0];
    const pIdx = this.getCurrentPassageIndex();

    const moduleLabel = this.currentModule === 'READING'
      ? t('cockpit.reading_short', undefined, 'READING')
      : this.currentModule === 'WRITING'
        ? t('cockpit.writing_short', undefined, 'WRITING')
        : t('cockpit.listening_short', undefined, 'LISTENING');
    const passageOf = t('cockpit.passage_of', { current: pIdx + 1, total: 3 }, `PASSAGE ${pIdx + 1} OF 3`);

    this.container.innerHTML = `
      <!-- Top Command Bar (48px) -->
      <header class="cd-top-bar" role="toolbar" aria-label="${t('cockpit.command_bar_aria', undefined, 'Exam Cockpit Command Bar')}">
        <div class="cd-top-left">
          <button type="button" class="cd-btn cd-btn-open-hub" id="btn-open-test-hub" title="${t('cockpit.select_other_test', undefined, 'Select another test')}">
            ${icon('book', 14)} <span>${t('cockpit.btn_test_catalog', undefined, 'Test Catalog')}</span>
          </button>
          <span class="cd-brand-title desktop-only">
            ${t('cockpit.brand_title', undefined, 'IELTS COMPUTER-DELIVERED TEST')}
          </span>
          <span class="cd-module-badge desktop-only">${moduleLabel} // ${passageOf}</span>
        </div>

        <div class="cd-top-center">
          <div class="cd-timer-box" title="${t('cockpit.timer_tooltip', undefined, 'Official Remaining Exam Time')}">
            ${icon('clock', 14)}
            <span class="cd-timer-digits" id="cd-timer-display">${this.formatTime(this.timerSeconds)}</span>
          </div>
        </div>

        <div class="cd-top-right">
          ${!this.isExamStarted ? `
            <button type="button" class="cd-btn cd-btn-start-inline" id="btn-start-exam-inline" title="${t('cockpit.start_timer_title', undefined, 'Start timed test')}">
              ${icon('zap', 12)} <span>${t('cockpit.btn_start_upper', undefined, 'START')}</span>
            </button>
          ` : `
            <button type="button" class="cd-btn cd-btn-pause-inline" id="btn-pause-toggle" title="${this.isTimerPaused ? t('cockpit.resume_timer_title', undefined, 'Resume exam timer') : t('cockpit.pause_timer_title', undefined, 'Pause exam timer')}">
              <span>${this.isTimerPaused ? t('cockpit.btn_resume', undefined, '▶ Resume') : t('cockpit.btn_pause', undefined, '⏸ Pause')}</span>
            </button>
          `}

          <!-- Official Cambridge Theme Selector -->
          <div class="cd-theme-picker desktop-only">
            <label for="cd-theme-select" class="cd-sr-only">${t('cockpit.contrast_theme', undefined, 'Contrast Theme')}</label>
            <select id="cd-theme-select" class="cd-theme-select" aria-label="${t('cockpit.contrast_theme', undefined, 'Choose Cambridge Contrast Scheme')}">
              <option value="app-theme" ${this.currentTheme === 'app-theme' ? 'selected' : ''}>${t('cockpit.theme_app', undefined, 'Mặc định (Theo App)')}</option>
              <option value="standard-light" ${this.currentTheme === 'standard-light' ? 'selected' : ''}>${t('cockpit.theme_standard', undefined, 'Standard (Black on White)')}</option>
              <option value="dark-obsidian" ${this.currentTheme === 'dark-obsidian' ? 'selected' : ''}>${t('cockpit.theme_dark', undefined, 'Dark Obsidian (White on Black)')}</option>
              <option value="yellow-black" ${this.currentTheme === 'yellow-black' ? 'selected' : ''}>${t('cockpit.theme_yellow', undefined, 'High Contrast (Yellow on Black)')}</option>
              <option value="blue-cream" ${this.currentTheme === 'blue-cream' ? 'selected' : ''}>${t('cockpit.theme_cream', undefined, 'Low Glare (Blue on Cream)')}</option>
            </select>
          </div>

          <!-- Module Selector -->
          <button class="cd-btn cd-btn-module-toggle desktop-only" id="btn-module-toggle" title="${t('cockpit.switch_mode_title', undefined, 'Switch between Reading and Writing mode')}">
            <span class="cd-toggle-long">${this.currentModule === 'READING' ? t('cockpit.switch_to_writing', undefined, 'SWITCH TO WRITING') : t('cockpit.switch_to_reading', undefined, 'SWITCH TO READING')}</span>
            <span class="cd-toggle-short">${this.currentModule === 'READING' ? t('cockpit.writing_short', undefined, 'WRITING') : t('cockpit.reading_short', undefined, 'READING')}</span>
          </button>

          <!-- Fullscreen Toggle -->
          <button class="cd-btn cd-btn-fullscreen desktop-only" id="btn-fullscreen-toggle" title="${t('cockpit.fullscreen_title', undefined, 'Toggle Fullscreen Distraction-Free Exam Mode')}">
            ${icon('target', 14)} <span class="btn-label">${t('cockpit.fullscreen', undefined, '⛶ Fullscreen')}</span>
          </button>
        </div>
      </header>

      <!-- 10-min and 5-min Warning Banner Alerts -->
      <div class="cd-timer-alert-banner" id="cd-timer-alert-banner" role="alert" aria-live="assertive" hidden>
        <span class="cd-alert-text"></span>
        <button class="cd-alert-dismiss" aria-label="${t('cockpit.dismiss_alert_aria', undefined, 'Dismiss Alert')}">✕</button>
      </div>

      <!-- Mobile Segmented Split-Screen Tab Switcher (<= 768px) -->
      <nav class="cd-mobile-tab-bar" role="tablist" aria-label="${t('cockpit.mobile_view_switcher_aria', undefined, 'Mobile View Switcher')}">
        <button 
          type="button" 
          class="cd-mobile-tab-btn ${this.mobileActiveTab === 'passage' ? 'is-active' : ''}" 
          data-tab="passage" 
          role="tab" 
          aria-selected="${this.mobileActiveTab === 'passage'}"
          aria-controls="cd-left-pane"
        >
          ${icon('book', 14)} ${this.currentModule === 'WRITING' ? t('cockpit.writing_stimulus', undefined, 'Writing Stimulus') : t('cockpit.reading_passage', undefined, 'Reading Passage')}
        </button>
        <button 
          type="button" 
          class="cd-mobile-tab-btn ${this.mobileActiveTab === 'questions' ? 'is-active' : ''}" 
          data-tab="questions" 
          role="tab" 
          aria-selected="${this.mobileActiveTab === 'questions'}"
          aria-controls="cd-right-pane"
        >
          ${icon('edit', 14)} ${this.currentModule === 'WRITING' ? t('cockpit.writing_editor', undefined, 'Writing Editor') : t('cockpit.questions_nav', undefined, 'Questions (1-40)')}
        </button>
      </nav>

      <!-- Main Split-Screen Resizable Arena -->
      <main class="cd-split-arena" id="cd-split-arena" data-mobile-active="${this.mobileActiveTab}">
        
        <!-- Left Pane: Source Passage / Prompt (Resizable %) -->
        <section class="cd-pane cd-left-pane" id="cd-left-pane" style="width: ${this.leftWidthPct}%;" aria-label="${t('cockpit.passage_material_aria', undefined, 'Passage and Stimulus Material')}">
          <div class="cd-pane-header">
            <span class="cd-pane-title">${t('cockpit.passage_title', { num: pIdx + 1 }, `ACADEMIC READING PASSAGE ${pIdx + 1}`)}</span>
            <span class="cd-highlight-hint">${t('cockpit.highlight_hint', undefined, '[ Select text to Highlight or Add Note ]')}</span>
          </div>
          
          <div class="cd-passage-scroll" id="cd-passage-scroll" tabindex="0">
            ${this.renderPassageContent()}
          </div>
        </section>

        <!-- Drag Resizer Bar -->
        <div class="cd-drag-resizer" id="cd-drag-resizer" role="separator" aria-orientation="vertical" aria-label="${t('cockpit.split_resizer_aria', undefined, 'Split Screen Resizer')}" tabindex="0">
          <div class="cd-resizer-handle"></div>
        </div>

        <!-- Right Pane: Questions / Writing Editor (Resizable %) -->
        <section class="cd-pane cd-right-pane" id="cd-right-pane" style="width: calc(100% - ${this.leftWidthPct}% - 8px);" aria-label="${t('cockpit.questions_responses_aria', undefined, 'Test Questions and Responses')}">
          <div class="cd-pane-header">
            <span class="cd-pane-title">${t('cockpit.questions_header', undefined, 'QUESTIONS 1–40')}</span>
            ${this.currentModule === 'WRITING' ? `
              <div class="cd-word-counter-cluster">
                <span class="cd-word-badge ${this.writingWordCount >= this.writingTargetWords ? 'is-valid' : 'is-under'}" id="cd-live-word-count">
                  ${t('cockpit.words_counter', { current: this.writingWordCount, target: this.writingTargetWords }, `${this.writingWordCount} / ${this.writingTargetWords} WORDS`)}
                </span>
                <span class="cd-autosave-status" id="cd-autosave-status">
                  ${this.lastAutosaveTimestamp ? t('cockpit.saved_time', { time: this.lastAutosaveTimestamp }, `✓ Saved ${this.lastAutosaveTimestamp}`) : t('cockpit.autosave_ready', undefined, '✓ Autosave Ready')}
                </span>
              </div>
            ` : `
              <span class="cd-question-badge">${t('cockpit.active_q', { id: activeQ.id }, `ACTIVE: QUESTION ${activeQ.id} OF 40`)}</span>
            `}
          </div>

          <div class="cd-questions-scroll" id="cd-questions-scroll" tabindex="0">
            ${this.currentModule === 'READING' ? this.renderQuestionForm(activeQ) : this.renderWritingEditor()}
          </div>
        </section>

      </main>

      <!-- Bottom Question Matrix Palette & Navigation Bar -->
      <footer class="cd-bottom-bar" role="navigation" aria-label="${t('cockpit.nav_palette_aria', undefined, 'Question Navigation Palette')}">
        <!-- Navigator Center: Filter Tabs & 1-40 Question Pills -->
        <div class="cd-nav-center-cluster">
          <div class="cd-filter-tabs-cluster desktop-only">
            <div class="cd-filter-tabs" role="tablist" aria-label="${t('cockpit.filter_tabs_aria', undefined, 'Passage & Section Filter Tabs')}">
              ${this.renderFilterTabs()}
            </div>
          </div>
          <!-- 1-40 Question Matrix Palette -->
          <div class="cd-matrix-track" id="cd-matrix-track" role="tablist" aria-label="${t('cockpit.questions_1_40_aria', undefined, 'Questions 1 to 40')}">
            ${this.renderQuestionMatrixButtons()}
          </div>
        </div>

        <div class="cd-bottom-controls-row">
          <div class="cd-nav-controls-left">
            <button class="cd-nav-btn cd-btn-prev" id="btn-prev-q" title="${t('cockpit.btn_prev_title', undefined, 'Previous Question (Alt+P)')}" aria-label="${t('cockpit.btn_prev_label', undefined, 'Previous Question')}" ${this.activeQuestionIndex === 0 ? 'disabled' : ''}>
              ${icon('arrowLeft', 12)} <span class="btn-text">${t('cockpit.btn_prev_short', undefined, 'Trước')}</span><span class="btn-hotkey-tag"> (Alt+P)</span>
            </button>
          </div>

          <div class="cd-nav-controls-right">
            <button class="cd-nav-btn cd-btn-flag" id="btn-flag-q" title="${t('cockpit.btn_flag_title', undefined, 'Flag for Review (Alt+F)')}" aria-label="${t('cockpit.btn_flag_label', undefined, 'Flag current question for review')}">
              ${icon('eye', 12)} <span class="btn-text">${activeQ.isFlagged ? t('cockpit.btn_unflag_short', undefined, 'Bỏ cờ') : t('cockpit.btn_flag_short', undefined, 'Cờ')}</span><span class="btn-hotkey-tag"> (Alt+F)</span>
            </button>
            <button class="cd-nav-btn cd-btn-next" id="btn-next-q" title="${t('cockpit.btn_next_title', undefined, 'Next Question (Alt+N)')}" aria-label="${t('cockpit.btn_next_label', undefined, 'Next Question')}" ${this.activeQuestionIndex >= this.questions.length - 1 ? 'disabled' : ''}>
              <span class="btn-text">${t('cockpit.btn_next_short', undefined, 'Tiếp')}</span><span class="btn-hotkey-tag"> (Alt+N)</span> ${icon('arrowRight', 12)}
            </button>
            <button class="cd-btn cd-btn-submit-exam" id="btn-submit-exam" title="${t('cockpit.btn_submit_title', undefined, 'Submit Completed Exam (Ctrl+Enter)')}">
              ${icon('zap', 12)} <span>${t('cockpit.btn_submit', undefined, 'NỘP BÀI THI')}</span>
            </button>
          </div>
        </div>
      </footer>
      ${this.renderTestHubModal()}
    `;

    this.bindEvents();
    this.startTimer();
    return this.container;
  }

  private renderFilterTabs(): string {
    if (this.currentModule === 'LISTENING') {
      const tabs = [
        { id: 'all', label: t('cockpit.tab_all', undefined, 'All (1–40)') },
        { id: 's1', label: t('cockpit.tab_s1', undefined, 'Section 1 (1–10)') },
        { id: 's2', label: t('cockpit.tab_s2', undefined, 'Section 2 (11–20)') },
        { id: 's3', label: t('cockpit.tab_s3', undefined, 'Section 3 (21–30)') },
        { id: 's4', label: t('cockpit.tab_s4', undefined, 'Section 4 (31–40)') }
      ];
      return tabs.map(tTab => `
        <button class="cd-filter-tab ${this.activeFilter === tTab.id ? 'is-active' : ''}" data-filter="${tTab.id}" role="tab" aria-selected="${this.activeFilter === tTab.id}">
          ${tTab.label}
        </button>
      `).join('');
    }

    const tabs = [
      { id: 'all', label: t('cockpit.tab_all', undefined, 'All (1–40)') },
      { id: 'p1', label: t('cockpit.tab_p1', undefined, 'Passage 1 (1–13)') },
      { id: 'p2', label: t('cockpit.tab_p2', undefined, 'Passage 2 (14–26)') },
      { id: 'p3', label: t('cockpit.tab_p3', undefined, 'Passage 3 (27–40)') }
    ];
    return tabs.map(tTab => `
      <button class="cd-filter-tab ${this.activeFilter === tTab.id ? 'is-active' : ''}" data-filter="${tTab.id}" role="tab" aria-selected="${this.activeFilter === tTab.id}">
        ${tTab.label}
      </button>
    `).join('');
  }

  private renderPassageContent(): string {
    const pIdx = this.getCurrentPassageIndex();

    if (this.selectedTestIndex === 0) {
      if (pIdx === 1) {
        return `
          <article class="cd-passage-body">
            <h2 class="cd-passage-h2">Collecting Antiques and Ephemera: The Psychology of Ownership</h2>
            <p class="cd-passage-lead">Exploring the evolutionary, psychological, and social motivations behind human collecting behaviour.</p>
            
            <p class="cd-paragraph" data-paragraph="A">
              <span class="cd-p-marker">Paragraph A</span>
              Collecting must be differentiated from indiscriminate hoarding. While hoarding is marked by disorganized accumulation and profound emotional distress upon parting with items, collecting is a purposeful, structured activity. True collectors curate, categorize, authenticate, and display their possessions according to systematic criteria, deriving intellectual stimulation and aesthetic satisfaction from completing a taxonomy.
            </p>

            <p class="cd-paragraph" data-paragraph="B">
              <span class="cd-p-marker">Paragraph B</span>
              Evolutionary psychologists argue that collecting traces back to hunter-gatherer survival adaptations. The drive to accumulate physical resources—seeds, tools, durable materials—conferred a distinct survival advantage during seasonal scarcities. In modern industrial societies where fundamental material needs are met, this primordial foraging instinct is sublimated into symbolic domains: rare stamps, vintage timepieces, first-edition books, or geological specimens.
            </p>

            <p class="cd-paragraph" data-paragraph="C">
              <span class="cd-p-marker">Paragraph C</span>
              Social status and cultural distinction represent another powerful catalyst. Sociologist Thorstein Veblen noted that conspicuous consumption and the acquisition of rare cultural artifacts signal wealth, discerning connoisseurship, and specialized leisure. Collecting items with verified provenance elevates the owner within scholarly or elite communities, establishing peer recognition and social prestige.
            </p>

            <p class="cd-paragraph" data-paragraph="D">
              <span class="cd-p-marker">Paragraph D</span>
              Nostalgia and psychological preservation also play a central role. Everyday ephemera—postcards, concert tickets, mid-century packaging—serve as tangible anchors to past eras and personal memories. By gathering and conserving fragile paper artifacts, collectors construct a psychological bulwark against the relentless transience of time, maintaining a living bridge to cultural heritage.
            </p>

            <p class="cd-paragraph" data-paragraph="E">
              <span class="cd-p-marker">Paragraph E</span>
              Finally, the thrill of the hunt provides potent neurological rewards. Locating an elusive item after years of searching triggers dopamine releases akin to reward pathways in problem-solving. Far from a passive hobby, scholarly collecting remains an active intellectual pursuit that has fostered significant museum collections and preserved invaluable historical records.
            </p>
          </article>
        `;
      }

      if (pIdx === 2) {
        return `
          <article class="cd-passage-body">
            <h2 class="cd-passage-h2">The Evolutionary Origins and Complexity of Human Language</h2>
            <p class="cd-passage-lead">How anatomical adaptations and cognitive evolution coalesced into recursive syntactic language.</p>
            
            <p class="cd-paragraph" data-paragraph="A">
              <span class="cd-p-marker">Paragraph A</span>
              Language is undeniably the defining cognitive attribute of the human species. While numerous non-human animals possess sophisticated communicative repertoires—such as the alarm calls of vervet monkeys or the intricate dance of honeybees—human language is distinguished by hierarchical syntax, displacement, and infinite recursion, permitting the generation of limitless novel expressions from finite phonetic elements.
            </p>

            <p class="cd-paragraph" data-paragraph="B">
              <span class="cd-p-marker">Paragraph B</span>
              Anatomical adaptations were indispensable prerequisites for vocal language. The descent of the human larynx, coupled with a rounded tongue and modified vocal tract geometry, enabled the acoustic modulation necessary for diverse vowel and consonant production. Although this anatomical descent dramatically increased the risk of choking, evolutionary natural selection favored vocal flexibility for communicative precision.
            </p>

            <p class="cd-paragraph" data-paragraph="C">
              <span class="cd-p-marker">Paragraph C</span>
              Anthropologists emphasize that vocal grooming replaced physical grooming as early human social group sizes expanded beyond manageable limits. Robin Dunbar’s social brain hypothesis posits that vocal communication allowed individuals to forge social bonds, maintain alliances, and exchange vital survival intelligence with multiple conspecifics simultaneously, conserving time and metabolic energy.
            </p>

            <p class="cd-paragraph" data-paragraph="D">
              <span class="cd-p-marker">Paragraph D</span>
              The neurological foundation of language involves a distributed cortical network far beyond classical Broca’s and Wernicke’s areas. Structural brain imaging reveals extensive white-matter tract development—notably the arcuate fasciculus—that integrates auditory perception, motor sequencing, and conceptual semantics across both cerebral hemispheres.
            </p>

            <p class="cd-paragraph" data-paragraph="E">
              <span class="cd-p-marker">Paragraph E</span>
              Genomic research has provided further insight through the discovery of the FOXP2 gene. Mutations in FOXP2 cause severe verbal dyspraxia and expressive grammar impairments. Comparative genomics indicates that modern human variants of FOXP2 underwent accelerated positive selection, refining fine-grained orofacial motor coordination for rapid articulatory speech.
            </p>

            <p class="cd-paragraph" data-paragraph="F">
              <span class="cd-p-marker">Paragraph F</span>
              Ultimately, language evolved not merely as an acoustic signal system, but as an engine of cognitive representation. Through recursive syntax, humans conceptualize past and future, formulate counterfactual hypotheses, transmit cumulative cultural innovations across generations, and establish intricate institutional cooperation on a global planetary scale.
            </p>
          </article>
        `;
      }

      // Default: Passage 0 (The Falkirk Wheel)
      return `
        <article class="cd-passage-body">
          <h2 class="cd-passage-h2">The Falkirk Wheel: Engineering a Scottish Landmark</h2>
          <p class="cd-passage-lead">A unique rotating boat lift connecting two historic canals across central Scotland.</p>
          
          <p class="cd-paragraph" data-paragraph="A">
            <span class="cd-p-marker">Paragraph A</span>
            The Falkirk Wheel in Scotland is the world's only rotating boat lift, and was designed to reconnect two canals: the Forth and Clyde Canal, which connects the east and west coasts, and the Union Canal, which links Edinburgh to the Forth and Clyde Canal near Falkirk. Historically, the two canals had been connected by a flight of eleven locks spanning a distance of 1.5 kilometres, but these had been dismantled and backfilled in 1933, severing the link.
          </p>

          <p class="cd-paragraph" data-paragraph="B">
            <span class="cd-p-marker">Paragraph B</span>
            To restore navigable waterways across central Scotland, the Millennium Commission launched the £84.5 million Millennium Link project in 1994. The project demanded an iconic, forward-looking structure rather than a reconstruction of the historic locks. The dramatic design chosen was inspired by a Celtic double-headed axe, standing 35 metres tall and balanced so perfectly that it uses roughly the same electrical energy as boiling eight domestic kettles (1.5 kilowatt-hours) to turn through 180 degrees.
          </p>

          <p class="cd-paragraph" data-paragraph="C">
            <span class="cd-p-marker">Paragraph C</span>
            The wheel consists of two opposing arms which extend 15 metres beyond the central axle and take the shape of Celtic axes. Two diametrically opposed water-filled caissons, each with a capacity of 360,000 litres, are fitted between the ends of the arms. Because boats displace their own weight in water according to Archimedes' principle, the caissons remain in absolute balance even when one holds a heavy canal barge and the other holds only water.
          </p>

          <p class="cd-paragraph" data-paragraph="D">
            <span class="cd-p-marker">Paragraph D</span>
            Constructing the Falkirk Wheel presented formidable civil and mechanical engineering hurdles. The steel components were manufactured and pre-assembled with millimetric precision in Derbyshire, England, before being dismantled and transported to Falkirk in 45 oversized lorry loads. Once on site, the sections were bolted together using more than 1,200 high-tensile bolts, each tightened by hand with an electronic torque wrench.
          </p>

          <p class="cd-paragraph" data-paragraph="E">
            <span class="cd-p-marker">Paragraph E</span>
            A sophisticated hydraulic drive mechanism rotates the wheel on a 4-metre diameter axle, driven by ten hydraulic motors. The entire rotation takes approximately five and a half minutes. Opened by Queen Elizabeth II on 24 May 2002 as part of her Golden Jubilee celebrations, the Falkirk Wheel has welcomed over 5.5 million visitors and stimulated massive regional tourism regeneration.
          </p>
        </article>
      `;
    }

    let targetPassages: ReadingPassage[] = [];
    if (this.selectedTestIndex === 1) {
      targetPassages = (readingData as ReadingPassage[]).slice(0, 3);
    } else if (this.selectedTestIndex === 2) {
      targetPassages = (readingData as ReadingPassage[]).slice(3, 6);
    } else if (this.selectedTestIndex === 3) {
      targetPassages = (originalReadingData as ReadingPassage[]).slice(0, 3);
    }

    const p = targetPassages[pIdx] || targetPassages[0];
    if (p) {
      return this.formatPassageFromData(p);
    }

    return '<p class="cd-paragraph">Passage content unavailable.</p>';
  }

  private renderQuestionForm(q: QuestionItem): string {
    const isCorrect = this.isReviewMode ? this.checkQuestionCorrect(q) : false;

    return `
      <div class="cd-question-card ${this.isReviewMode ? (isCorrect ? 'review-correct' : 'review-incorrect') : ''}" data-qid="${q.id}">
        <div class="cd-q-header">
          <span class="cd-q-num">${t('cockpit.q_num_of', { id: q.id }, `Question ${q.id} of 40`)}</span>
          ${q.paragraphAnchor ? `
            <button class="cd-anchor-jump-btn" data-jump="${q.paragraphAnchor}" title="${t('cockpit.jump_to_anchor_title', { anchor: q.paragraphAnchor }, `Jump to ${q.paragraphAnchor} in passage`)}">
              ${icon('target', 12)} ${t('cockpit.jump_to_para', { anchor: q.paragraphAnchor }, `Jump to Paragraph ${q.paragraphAnchor}`)}
            </button>
          ` : ''}
          ${q.isFlagged ? `<span class="cd-flagged-tag">${t('cockpit.flagged_tag', undefined, '🚩 Flagged for review')}</span>` : ''}
          ${this.isReviewMode ? `
            <span class="cd-review-badge ${isCorrect ? 'is-correct' : 'is-incorrect'}" style="font-weight: 700; font-size: var(--font-kicker); padding: 2px 8px; border-radius: 4px; background: ${isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}; color: ${isCorrect ? '#10b981' : '#ef4444'};">
              ${isCorrect ? t('cockpit.correct', undefined, '✓ Correct') : t('cockpit.incorrect', undefined, '✗ Incorrect')}
            </span>
          ` : ''}
        </div>

        <p class="cd-q-prompt">${this.escapeHtml(q.prompt)}</p>

        ${q.type === 'tfng' || q.type === 'mcq' ? `
          <div class="cd-options-group" role="radiogroup" aria-label="${t('cockpit.q_options_aria', { id: q.id }, `Question ${q.id} Answer Options`)}">
            ${(q.options || []).map((opt, _idx) => `
              <label class="cd-option-label ${q.userAnswer === opt ? 'is-selected' : ''}">
                <input 
                  type="radio" 
                  name="q_${q.id}" 
                  value="${this.escapeHtml(opt)}" 
                  class="cd-radio-input" 
                  ${q.userAnswer === opt ? 'checked' : ''}
                  ${this.isReviewMode ? 'disabled' : ''}
                />
                <span class="cd-opt-indicator"></span>
                <span class="cd-opt-text">${this.escapeHtml(opt)}</span>
              </label>
            `).join('')}
          </div>
        ` : `
          <div class="cd-gap-input-wrapper">
            <label for="cd-gap-${q.id}" class="cd-sr-only">${t('cockpit.type_answer_aria', { id: q.id }, `Type answer for Question ${q.id}`)}</label>
            <input 
              type="text" 
              id="cd-gap-${q.id}" 
              class="cd-text-input" 
              placeholder="${t('cockpit.type_answer_ph', undefined, 'Type your answer here...')}" 
              value="${this.escapeHtml(q.userAnswer || '')}"
              ${this.isReviewMode ? 'readonly' : ''}
            />
          </div>
        `}

        ${this.isReviewMode ? `
          <div class="cd-review-explanation-box">
            <div style="font-weight: 700; margin-bottom: 4px; color: ${isCorrect ? '#10b981' : '#ef4444'};">
              ${isCorrect ? t('cockpit.verified_text', undefined, '✓ Verified Against Text') : t('cockpit.correct_ans_is', { ans: this.escapeHtml(q.correctAnswer || '') }, `✗ Correct Answer: "${this.escapeHtml(q.correctAnswer || '')}"`)}
            </div>
            <div style="font-size: var(--font-body-compact); color: var(--ink-secondary); line-height: 1.5;">
              ${this.escapeHtml(q.explanation || t('cockpit.default_explanation', undefined, 'Refer to the referenced paragraph in the passage for the contextual rationale.'))}
            </div>
          </div>
        ` : ''}

        <div class="cd-q-nav-actions">
          <button class="cd-btn cd-btn-save-next" id="btn-save-advance">
            ${t('cockpit.save_continue', undefined, 'Save & Continue')} ${icon('arrowRight', 12)}
          </button>
        </div>
      </div>
    `;
  }

  private renderWritingEditor(): string {
    const savedDraft = (typeof localStorage !== 'undefined') ? localStorage.getItem('cd_ielts_scratchpad_draft') || '' : '';
    return `
      <div class="cd-writing-console">
        <div class="cd-writing-prompt-box">
          <h3 class="cd-writing-h3">${t('cockpit.writing_h3', undefined, 'Writing Task 2: Formal Academic Argument')}</h3>
          <p class="cd-writing-prompt">
            Some people believe that technological developments are leading to the loss of traditional cultures, 
            while others argue that technology can help preserve and revitalise them. 
            Discuss both views and give your own opinion.
          </p>
          <span class="cd-writing-min-note">${t('cockpit.writing_min_note', { target: this.writingTargetWords }, `Write at least ${this.writingTargetWords} words. Suggested time: 40 minutes.`)}</span>
        </div>

        <div class="cd-writing-textarea-wrapper">
          <label for="cd-writing-textarea" class="cd-sr-only">${t('cockpit.task2_response_aria', undefined, 'Your Task 2 Response')}</label>
          <textarea 
            id="cd-writing-textarea" 
            class="cd-writing-textarea" 
            placeholder="${t('cockpit.essay_placeholder', undefined, 'Type your essay response here. Leave a blank line between paragraphs...')}"
            spellcheck="false"
          >${this.escapeHtml(savedDraft)}</textarea>
        </div>
      </div>
    `;
  }

  private renderQuestionMatrixButtons(): string {
    return this.questions.map((q, idx) => {
      // Filter check
      if (this.activeFilter === 'p1' && (q.id < 1 || q.id > 13)) return '';
      if (this.activeFilter === 'p2' && (q.id < 14 || q.id > 26)) return '';
      if (this.activeFilter === 'p3' && (q.id < 27 || q.id > 40)) return '';
      if (this.activeFilter === 's1' && (q.id < 1 || q.id > 10)) return '';
      if (this.activeFilter === 's2' && (q.id < 11 || q.id > 20)) return '';
      if (this.activeFilter === 's3' && (q.id < 21 || q.id > 30)) return '';
      if (this.activeFilter === 's4' && (q.id < 31 || q.id > 40)) return '';

      const isCurrent = idx === this.activeQuestionIndex;
      const isAnswered = Boolean(q.userAnswer);
      const isFlagged = q.isFlagged;

      let reviewClass = '';
      if (this.isReviewMode) {
        const isOk = this.checkQuestionCorrect(q);
        reviewClass = isOk ? 'is-correct' : 'is-incorrect';
      }

      const classes = [
        'cd-q-matrix-btn',
        isCurrent ? 'is-current' : '',
        isAnswered ? 'is-answered' : 'is-unanswered',
        isFlagged ? 'is-flagged' : '',
        reviewClass
      ].filter(Boolean).join(' ');

      const statusText = isAnswered
        ? t('cockpit.status_answered', undefined, 'Answered')
        : t('cockpit.status_unanswered', undefined, 'Unanswered');
      const flagSuffix = isFlagged ? t('cockpit.status_flagged_suffix', undefined, ' (Flagged)') : '';
      const buttonTitle = t('cockpit.q_status_title', { id: q.id, status: statusText, flag: flagSuffix }, `Question ${q.id}: ${statusText}${flagSuffix}`);

      return `
        <button 
          class="${classes}" 
          data-qidx="${idx}" 
          role="tab" 
          aria-selected="${isCurrent}"
          title="${buttonTitle}"
        >
          ${q.id}${isFlagged ? '<span class="flag-dot">•</span>' : ''}
        </button>
      `;
    }).join('');
  }

  private bindEvents(): void {
    // Filter tabs click handling
    this.container.querySelectorAll('.cd-filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        AudioSynthesizer.play('click');
        const filterId = tab.getAttribute('data-filter') || 'all';
        this.setFilter(filterId);
      });
    });

    // Dismiss alert banner
    this.container.querySelector('.cd-alert-dismiss')?.addEventListener('click', () => {
      const banner = this.container.querySelector('#cd-timer-alert-banner') as HTMLElement | null;
      if (banner) banner.hidden = true;
    });

    // Theme switcher
    const themeSelect = this.container.querySelector('#cd-theme-select') as HTMLSelectElement | null;
    themeSelect?.addEventListener('change', () => {
      const selected = themeSelect.value as CambridgeTheme;
      this.setTheme(selected);
    });

    // Module switcher
    this.container.querySelector('#btn-module-toggle')?.addEventListener('click', async () => {
      AudioSynthesizer.play('click');
      if (this.isExamActive()) {
        const canExit = await this.canDeactivate();
        if (!canExit) return;
        this.isExamStarted = false;
        if (this.timerInterval) clearInterval(this.timerInterval);
      }
      this.currentModule = this.currentModule === 'READING' ? 'WRITING' : 'READING';
      this.mobileActiveTab = this.currentModule === 'WRITING' ? 'questions' : 'passage';
      this.render();
    });

    // Fullscreen toggle
    this.container.querySelector('#btn-fullscreen-toggle')?.addEventListener('click', () => {
      this.toggleFullscreen();
    });

    // Drag Resizer (Pointer events)
    const resizer = this.container.querySelector('#cd-drag-resizer') as HTMLElement | null;
    resizer?.addEventListener('pointerdown', (e: PointerEvent) => {
      e.preventDefault();
      this.isDraggingResizer = true;
      resizer.setPointerCapture(e.pointerId);
      this.container.classList.add('is-resizing');

      const onPointerMove = (moveEvent: PointerEvent) => {
        if (!this.isDraggingResizer) return;
        const arena = this.container.querySelector('#cd-split-arena') as HTMLElement | null;
        if (!arena) return;

        const rect = arena.getBoundingClientRect();
        const offsetX = moveEvent.clientX - rect.left;
        let pct = (offsetX / rect.width) * 100;
        pct = Math.max(25, Math.min(75, pct)); // Clamp between 25% and 75%
        this.leftWidthPct = Math.round(pct);

        const leftPane = this.container.querySelector('#cd-left-pane') as HTMLElement | null;
        const rightPane = this.container.querySelector('#cd-right-pane') as HTMLElement | null;
        if (leftPane && rightPane) {
          leftPane.style.width = `${this.leftWidthPct}%`;
          rightPane.style.width = `calc(100% - ${this.leftWidthPct}% - 8px)`;
        }
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        this.isDraggingResizer = false;
        resizer.releasePointerCapture(upEvent.pointerId);
        this.container.classList.remove('is-resizing');
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    });

    // Mobile Segmented Tab Switcher Buttons
    const mobileTabBtns = this.container.querySelectorAll('.cd-mobile-tab-btn');
    mobileTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = (btn as HTMLElement).dataset.tab as 'passage' | 'questions';
        if (tab) {
          AudioSynthesizer.play('click');
          this.setMobileActiveTab(tab);
        }
      });
    });

    // Text selection highlighter tool
    const passageScroll = this.container.querySelector('#cd-passage-scroll');
    passageScroll?.addEventListener('mouseup', () => {
      this.checkTextSelection();
    });

    // Anchor Jump buttons
    const jumpBtn = this.container.querySelector('.cd-anchor-jump-btn') as HTMLElement | null;
    jumpBtn?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      const targetLabel = jumpBtn.getAttribute('data-jump');
      if (targetLabel) {
        const targetP = this.container.querySelector(`[data-paragraph="${targetLabel}"]`);
        targetP?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetP?.classList.add('is-targeted');
        setTimeout(() => targetP?.classList.remove('is-targeted'), 1500);
      }
    });

    // Radio option selection
    const radioInputs = this.container.querySelectorAll('.cd-radio-input');
    radioInputs.forEach(input => {
      input.addEventListener('change', () => {
        AudioSynthesizer.play('click');
        const val = (input as HTMLInputElement).value;
        this.questions[this.activeQuestionIndex].userAnswer = val;
        this.updateMatrixState();
      });
    });

    // Text gap input
    const textGap = this.container.querySelector('.cd-text-input') as HTMLInputElement | null;
    textGap?.addEventListener('input', () => {
      this.questions[this.activeQuestionIndex].userAnswer = textGap.value.trim();
      this.updateMatrixState();
    });

    // Save & Next button
    this.container.querySelector('#btn-save-advance')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      if (this.activeQuestionIndex < this.questions.length - 1) {
        this.activeQuestionIndex++;
        this.render();
      }
    });

    // Writing textarea input & autosave
    const writingTextarea = this.container.querySelector('#cd-writing-textarea') as HTMLTextAreaElement | null;
    writingTextarea?.addEventListener('input', () => {
      const val = writingTextarea.value;
      this.updateWritingWordCount(val);
      this.scheduleAutosave(val);
    });
    if (writingTextarea) {
      this.updateWritingWordCount(writingTextarea.value);
    }

    // Question Matrix navigation clicks
    const matrixButtons = this.container.querySelectorAll('.cd-q-matrix-btn');
    matrixButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        AudioSynthesizer.play('click');
        const idx = parseInt(btn.getAttribute('data-qidx') || '0', 10);
        if (!isNaN(idx) && idx >= 0 && idx < this.questions.length) {
          this.activeQuestionIndex = idx;
          this.render();
        }
      });
    });

    // Bottom Prev / Next
    this.container.querySelector('#btn-prev-q')?.addEventListener('click', () => {
      if (this.activeQuestionIndex > 0) {
        AudioSynthesizer.play('click');
        this.activeQuestionIndex--;
        this.render();
      }
    });

    this.container.querySelector('#btn-next-q')?.addEventListener('click', () => {
      if (this.activeQuestionIndex < this.questions.length - 1) {
        AudioSynthesizer.play('click');
        this.activeQuestionIndex++;
        this.render();
      }
    });

    // Flag for review button
    this.container.querySelector('#btn-flag-q')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.questions[this.activeQuestionIndex].isFlagged = !this.questions[this.activeQuestionIndex].isFlagged;
      this.render();
    });

    // Test Hub modal triggers & events
    this.container.querySelector('#btn-open-test-hub')?.addEventListener('click', async () => {
      AudioSynthesizer.play('click');
      if (this.isExamActive()) {
        const canExit = await this.canDeactivate();
        if (!canExit) return;
        this.isExamStarted = false;
        if (this.timerInterval) clearInterval(this.timerInterval);
      }
      this.openTestHub();
    });

    this.container.querySelector('#btn-preview-exam-station, #btn-close-test-hub')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      this.closeTestHub();
    });

    this.container.querySelector('#cd-test-hub-overlay')?.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).id === 'cd-test-hub-overlay') {
        AudioSynthesizer.play('click');
        this.closeTestHub();
      }
    });

    this.container.querySelector('#btn-start-selected-exam')?.addEventListener('click', () => {
      AudioSynthesizer.play('chime');
      this.startExam(this.selectedTestIndex);
    });

    this.container.querySelector('#btn-start-exam-inline')?.addEventListener('click', () => {
      AudioSynthesizer.play('chime');
      this.startExam(this.selectedTestIndex);
    });

    this.container.querySelector('#btn-pause-toggle')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      if (this.isTimerPaused) {
        this.resumeTimer();
      } else {
        this.pauseTimer();
      }
      this.render();
    });

    const testCards = this.container.querySelectorAll('.cd-test-card');
    testCards.forEach(card => {
      card.addEventListener('click', () => {
        AudioSynthesizer.play('click');
        const idx = parseInt((card as HTMLElement).dataset.testIdx || '0', 10);
        this.selectTest(idx);
      });
    });

    // Ensure matrix track is scrolled cleanly to start on Q0
    const track = this.container.querySelector('.cd-matrix-track') as HTMLElement | null;
    if (this.activeQuestionIndex === 0) {
      if (track) track.scrollLeft = 0;
    } else {
      const currentActiveBtn = this.container.querySelector(`.cd-q-matrix-btn[data-qidx="${this.activeQuestionIndex}"]`);
      currentActiveBtn?.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' });
    }

    // Submit button
    this.container.querySelector('#btn-submit-exam')?.addEventListener('click', () => {
      this.promptSubmitExam();
    });
  }

  public setFilter(filterId: string): void {
    this.activeFilter = filterId;
    if (filterId === 'p1' && (this.activeQuestionIndex < 0 || this.activeQuestionIndex > 12)) {
      this.activeQuestionIndex = 0;
    } else if (filterId === 'p2' && (this.activeQuestionIndex < 13 || this.activeQuestionIndex > 25)) {
      this.activeQuestionIndex = 13;
    } else if (filterId === 'p3' && (this.activeQuestionIndex < 26 || this.activeQuestionIndex > 39)) {
      this.activeQuestionIndex = 26;
    } else if (filterId === 's1' && (this.activeQuestionIndex < 0 || this.activeQuestionIndex > 9)) {
      this.activeQuestionIndex = 0;
    } else if (filterId === 's2' && (this.activeQuestionIndex < 10 || this.activeQuestionIndex > 19)) {
      this.activeQuestionIndex = 10;
    } else if (filterId === 's3' && (this.activeQuestionIndex < 20 || this.activeQuestionIndex > 29)) {
      this.activeQuestionIndex = 20;
    } else if (filterId === 's4' && (this.activeQuestionIndex < 30 || this.activeQuestionIndex > 39)) {
      this.activeQuestionIndex = 30;
    }
    this.render();
  }

  private updateMatrixState(): void {
    const currentBtn = this.container.querySelector(`.cd-q-matrix-btn[data-qidx="${this.activeQuestionIndex}"]`);
    if (currentBtn) {
      const isAnswered = Boolean(this.questions[this.activeQuestionIndex].userAnswer);
      currentBtn.classList.toggle('is-answered', isAnswered);
      currentBtn.classList.toggle('is-unanswered', !isAnswered);
    }
  }

  private updateWritingWordCount(text: string): void {
    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    this.writingWordCount = words;
    const badge = this.container.querySelector('#cd-live-word-count');
    if (badge) {
      badge.textContent = t('cockpit.words_counter', { current: this.writingWordCount, target: this.writingTargetWords }, `${this.writingWordCount} / ${this.writingTargetWords} WORDS`);
      badge.className = `cd-word-badge ${this.writingWordCount >= this.writingTargetWords ? 'is-valid' : 'is-under'}`;
    }
  }

  private scheduleAutosave(content: string): void {
    if (this.autosaveTimer) clearTimeout(this.autosaveTimer);
    this.autosaveTimer = setTimeout(() => {
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('cd_ielts_scratchpad_draft', content);
          const now = new Date();
          const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          this.lastAutosaveTimestamp = timeStr;
          const statusEl = this.container.querySelector('#cd-autosave-status');
          if (statusEl) statusEl.textContent = t('cockpit.saved_time', { time: timeStr }, `✓ Saved ${timeStr}`);
        } catch {
          // storage quota guard
        }
      }
    }, 1000);
  }

  private checkTextSelection(): void {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      this.removeHighlightPopover();
      return;
    }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    this.showHighlightPopover(rect, range);
  }

  private showHighlightPopover(rect: DOMRect, range: Range): void {
    this.removeHighlightPopover();
    const pop = document.createElement('div');
    pop.className = 'cd-highlight-popover';
    pop.style.top = `${rect.top - 38}px`;
    pop.style.left = `${rect.left + rect.width / 2}px`;
    pop.innerHTML = `
      <button class="cd-pop-btn cd-pop-highlight" id="btn-apply-highlight">${icon('eye', 12)} ${t('cockpit.highlight', undefined, 'Highlight')}</button>
      <button class="cd-pop-btn cd-pop-clear" id="btn-clear-highlight">${t('cockpit.clear_highlight', undefined, 'Clear')}</button>
    `;

    pop.querySelector('#btn-apply-highlight')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.highlightSelection(range);
    });

    pop.querySelector('#btn-clear-highlight')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.clearHighlightsInSelection(range);
    });

    document.body.appendChild(pop);
    this.highlightPopover = pop;
  }

  public highlightSelection(range?: Range): void {
    const sel = window.getSelection();
    const r = range || (sel && !sel.isCollapsed ? sel.getRangeAt(0) : null);
    if (!r) return;
    AudioSynthesizer.play('absorb');
    const mark = document.createElement('mark');
    mark.className = 'cd-highlight-mark';
    try {
      r.surroundContents(mark);
    } catch {
      // Selection intersects element boundaries
    }
    this.removeHighlightPopover();
    sel?.removeAllRanges();
  }

  public clearHighlightsInSelection(_range?: Range): void {
    const sel = window.getSelection();
    this.removeHighlightPopover();
    sel?.removeAllRanges();
  }

  private removeHighlightPopover(): void {
    if (this.highlightPopover) {
      this.highlightPopover.remove();
      this.highlightPopover = null;
    }
  }

  private startTimer(): void {
    if (!this.isExamStarted || this.isTimerPaused) return;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.timerSeconds > 0) {
        this.timerSeconds--;
        const display = this.container.querySelector('#cd-timer-display');
        if (display) {
          display.textContent = this.formatTime(this.timerSeconds);
          if (this.timerSeconds <= 300) { // 5 minutes remaining
            display.classList.add('is-urgent');
          } else if (this.timerSeconds <= 600) { // 10 minutes remaining
            display.classList.add('is-warning');
          }
        }

        // 10-minute warning banner alert
        if (this.timerSeconds === 600) {
          this.showTimerAlert(t('cockpit.alert_10min', undefined, '⚠️ 10-MINUTE ALERT: 10 minutes remaining. Verify that answers for Passages 1 and 2 are recorded.'), 'is-10min-warning');
          AudioSynthesizer.play('alarm');
        }

        // 5-minute urgent banner alert
        if (this.timerSeconds === 300) {
          this.showTimerAlert(t('cockpit.alert_5min', undefined, '🚨 5-MINUTE URGENT ALERT: 5 minutes remaining! Finalize all flagged questions now.'), 'is-5min-urgent');
          AudioSynthesizer.play('alarm');
        }
      } else {
        clearInterval(this.timerInterval);
        this.submitAndGradeExam(true);
      }
    }, 1000);
  }

  private showTimerAlert(message: string, alertClass: string): void {
    const banner = this.container.querySelector('#cd-timer-alert-banner') as HTMLElement | null;
    if (banner) {
      banner.hidden = false;
      banner.className = `cd-timer-alert-banner ${alertClass}`;
      const textEl = banner.querySelector('.cd-alert-text');
      if (textEl) textEl.textContent = message;
    }
  }

  private formatTime(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  public setTheme(theme: CambridgeTheme): void {
    this.currentTheme = theme;
    this.container.setAttribute('data-cockpit-theme', theme);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('cd_ielts_theme', theme);
      } catch {
        // storage disabled guard
      }
    }
    const select = this.container.querySelector('#cd-theme-select') as HTMLSelectElement | null;
    if (select) select.value = theme;
  }

  public toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      this.container.requestFullscreen?.().catch(() => { });
      this.container.classList.add('is-fullscreen-exam');
    } else {
      document.exitFullscreen?.().catch(() => { });
      this.container.classList.remove('is-fullscreen-exam');
    }
  }

  public handleGlobalKey(key: string, event?: KeyboardEvent): boolean {
    const activeEl = document.activeElement;
    const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

    if (key === 'Escape') {
      if (this.showTestHubModal) {
        if (event) { event.preventDefault(); event.stopPropagation(); }
        this.closeTestHub();
        return true;
      }
      if (this.isExamActive()) {
        if (event) { event.preventDefault(); event.stopPropagation(); }
        return true;
      }
    }

    // Alt + N -> Next question
    if (event && event.altKey && (key === 'n' || key === 'N')) {
      event.preventDefault();
      if (this.activeQuestionIndex < this.questions.length - 1) {
        AudioSynthesizer.play('click');
        this.activeQuestionIndex++;
        this.render();
      }
      return true;
    }

    // Alt + P -> Previous question
    if (event && event.altKey && (key === 'p' || key === 'P')) {
      event.preventDefault();
      if (this.activeQuestionIndex > 0) {
        AudioSynthesizer.play('click');
        this.activeQuestionIndex--;
        this.render();
      }
      return true;
    }

    // Alt + F -> Toggle Flag for review
    if (event && event.altKey && (key === 'f' || key === 'F')) {
      event.preventDefault();
      AudioSynthesizer.play('click');
      this.questions[this.activeQuestionIndex].isFlagged = !this.questions[this.activeQuestionIndex].isFlagged;
      this.render();
      return true;
    }

    // Ctrl + Enter -> Submit Exam
    if (event && event.ctrlKey && key === 'Enter') {
      event.preventDefault();
      this.promptSubmitExam();
      return true;
    }

    // Arrow navigation when outside input/textarea
    if (!isInput) {
      if (key === 'ArrowRight' && this.activeQuestionIndex < this.questions.length - 1) {
        this.activeQuestionIndex++;
        this.render();
        return true;
      }
      if (key === 'ArrowLeft' && this.activeQuestionIndex > 0) {
        this.activeQuestionIndex--;
        this.render();
        return true;
      }
    }

    return false;
  }

  public checkQuestionCorrect(q: QuestionItem): boolean {
    if (!q.userAnswer) return false;
    const user = q.userAnswer.trim().toLowerCase().replace(/[’‘]/g, "'").replace(/[“”]/g, '"');
    const correct = (q.correctAnswer || '').trim().toLowerCase().replace(/[’‘]/g, "'").replace(/[“”]/g, '"');

    if (q.type === 'tfng') {
      return user === correct;
    }
    if (q.type === 'mcq') {
      if (user === correct) return true;
      if (user.charAt(0) === correct.charAt(0)) return true;
      return false;
    }
    if (q.type === 'gap') {
      const cleanUser = user.replace(/[.,!?;:]+$/, '').replace(/\s+/g, ' ').trim();
      const cleanCorrect = correct.replace(/[.,!?;:]+$/, '').replace(/\s+/g, ' ').trim();
      return cleanUser === cleanCorrect;
    }
    return false;
  }

  public rawToBand(skill: 'listening' | 'reading', raw: number, of: number = 40): number {
    const safeRaw = Number.isFinite(raw) ? raw : 0;
    const safeOf = Number.isFinite(of) && of > 0 ? of : 40;
    const scaled = safeOf === 40 ? safeRaw : Math.round((safeRaw / safeOf) * 40);
    if (!Number.isFinite(scaled) || scaled <= 0) return 0;
    if (scaled <= 2) return 1.0;
    const readingTable: [number, number][] = [
      [39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5],
      [23, 6], [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5]
    ];
    const listeningTable: [number, number][] = [
      [39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5],
      [23, 6], [18, 5.5], [16, 5], [13, 4.5], [10, 4], [7, 3.5], [5, 3], [3, 2.5]
    ];
    const table = skill === 'reading' ? readingTable : listeningTable;
    const hit = table.find(([min]) => scaled >= min);
    return hit ? hit[1] : 2.0;
  }

  public getBandDescriptor(band: number): { cefr: string; descriptor: string } {
    if (band >= 8.5) return { cefr: 'C2', descriptor: t('cockpit.descriptor_expert', undefined, 'Expert User (Fully Operational Command)') };
    if (band >= 7.5) return { cefr: 'C1', descriptor: t('cockpit.descriptor_very_good', undefined, 'Very Good User (Operational Command with Occasional Inaccuracies)') };
    if (band >= 7.0) return { cefr: 'C1', descriptor: t('cockpit.descriptor_good', undefined, 'Good User with Operational Command') };
    if (band >= 6.0) return { cefr: 'B2', descriptor: t('cockpit.descriptor_competent', undefined, 'Competent User (Generally Effective Command)') };
    if (band >= 5.0) return { cefr: 'B1', descriptor: t('cockpit.descriptor_modest', undefined, 'Modest User (Partial Command)') };
    if (band >= 4.0) return { cefr: 'B1', descriptor: t('cockpit.descriptor_limited', undefined, 'Limited User (Basic Competence in Familiar Situations)') };
    return { cefr: 'A2', descriptor: t('cockpit.descriptor_extremely_limited', undefined, 'Extremely Limited User') };
  }

  private promptSubmitExam(): void {
    AudioSynthesizer.play('click');
    const answeredCount = this.questions.filter(q => Boolean(q.userAnswer)).length;
    const flaggedCount = this.questions.filter(q => q.isFlagged).length;

    const modal = document.createElement('div');
    modal.className = 'completion-modal-overlay interactive';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', t('cockpit.submit_confirmation_label', undefined, 'Submit Exam Confirmation'));

    modal.innerHTML = `
      <div class="completion-receipt-card cd-submit-modal-card">
        <div class="telemetry-label">${t('cockpit.submit_telemetry', undefined, '[ OFFICIAL EXAM SUBMISSION SUMMARY ]')}</div>
        <h2 style="font-family: var(--font-mono); font-size: var(--font-h3); font-weight: 700; margin: 12px 0;">
          ${t('cockpit.submit_title', undefined, 'Review Before Final Lock')}
        </h2>

        <div class="cd-summary-stats-box" style="display: grid; grid-template-columns: repeat(3, 1fr); text-align: center; gap: 8px; margin: 16px 0; padding: 12px; background: var(--bg-surface-sunk); border-radius: 8px;">
          <div style="display: flex; flex-direction: column; gap: 2px;"><strong style="font-size: var(--font-h3); color: var(--accent-cyan);">${answeredCount} / 40</strong><span style="font-size: var(--font-kicker); color: var(--ink-secondary); text-transform: uppercase;">${t('cockpit.submit_answered', undefined, 'Answered')}</span></div>
          <div style="display: flex; flex-direction: column; gap: 2px;"><strong style="font-size: var(--font-h3); color: var(--ink-muted);">${40 - answeredCount}</strong><span style="font-size: var(--font-kicker); color: var(--ink-secondary); text-transform: uppercase;">${t('cockpit.submit_unanswered', undefined, 'Unanswered')}</span></div>
          <div style="display: flex; flex-direction: column; gap: 2px;"><strong style="font-size: var(--font-h3); color: var(--accent-gold);">${flaggedCount}</strong><span style="font-size: var(--font-kicker); color: var(--accent-gold); text-transform: uppercase;">${t('cockpit.submit_flagged', undefined, 'Flagged')}</span></div>
        </div>

        <p style="font-size: var(--font-body-compact); color: var(--ink-muted); margin-bottom: 20px;">
          ${t('cockpit.submit_desc', undefined, 'Are you sure you want to end this test? Once submitted, your answers will be sealed and graded against the 9.0 band scale.')}
        </p>

        <div class="apple-modal-actions action-stack" style="display: flex; flex-direction: column; gap: 12px; width: 100%; margin-top: 18px;">
          <button type="button" class="hud-btn btn-confirm-submit" style="width: 100%; justify-content: center; background: var(--accent-cyan); color: #080a0f; font-weight: 700; min-height: 48px; border-radius: var(--radius-btn, 10px);">
            ${t('cockpit.btn_confirm_submit', undefined, 'Confirm & Grade Test')}
          </button>
          <button type="button" class="apple-bottom-close-btn btn-cancel-submit">
            ${t('cockpit.btn_cancel_submit', undefined, 'Return to Test')}
          </button>
        </div>
      </div>
    `;

    const closeModal = () => {
      window.removeEventListener('keydown', onKeyDown, true);
      modal.remove();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    modal.querySelector('.btn-cancel-submit')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      closeModal();
    });

    modal.querySelector('.btn-confirm-submit')?.addEventListener('click', () => {
      AudioSynthesizer.play('absorb');
      closeModal();
      this.submitAndGradeExam(false);
    });

    document.body.appendChild(modal);
    (modal.querySelector('.btn-confirm-submit') as HTMLElement)?.focus();
  }

  public submitAndGradeExam(timeExpired = false): void {
    if (this.timerInterval) clearInterval(this.timerInterval);

    let rawScore = 0;
    let p1Correct = 0;
    let p2Correct = 0;
    let p3Correct = 0;
    let tfngCorrect = 0;
    let mcqCorrect = 0;
    let gapCorrect = 0;

    this.questions.forEach(q => {
      const isOk = this.checkQuestionCorrect(q);
      if (isOk) {
        rawScore++;
        if (q.passageIndex === 0) p1Correct++;
        else if (q.passageIndex === 1) p2Correct++;
        else p3Correct++;

        if (q.type === 'tfng') tfngCorrect++;
        else if (q.type === 'mcq') mcqCorrect++;
        else if (q.type === 'gap') gapCorrect++;
      }
    });

    const bandScore = this.rawToBand(this.currentModule === 'LISTENING' ? 'listening' : 'reading', rawScore, 40);
    const { cefr, descriptor } = this.getBandDescriptor(bandScore);
    const pct = Math.round((rawScore / 40) * 100);

    // Save attempt to IELTS_STATE in localStorage
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('IELTS_STATE') || '{"attempts":[]}');
        stored.attempts = stored.attempts || [];
        stored.attempts.push({
          skill: this.currentModule.toLowerCase(),
          date: new Date().toISOString(),
          itemId: `cd-ielts-mock-${Date.now()}`,
          band: bandScore,
          raw: rawScore,
          of: 40,
          mock: true
        });
        localStorage.setItem('IELTS_STATE', JSON.stringify(stored));
      } catch {
        // quota guard
      }
    }

    if (bandScore >= 7.0) {
      AudioSynthesizer.play('level-up');
    } else {
      AudioSynthesizer.play('absorb');
    }

    if (this.onTestSubmitted) {
      this.onTestSubmitted();
    }

    this.openBandConversionModal({
      rawScore,
      bandScore,
      cefr,
      descriptor,
      pct,
      p1Correct,
      p2Correct,
      p3Correct,
      tfngCorrect,
      mcqCorrect,
      gapCorrect,
      timeExpired
    });
  }

  public openBandConversionModal(data: {
    rawScore: number;
    bandScore: number;
    cefr: string;
    descriptor: string;
    pct: number;
    p1Correct?: number;
    p2Correct?: number;
    p3Correct?: number;
    tfngCorrect?: number;
    mcqCorrect?: number;
    gapCorrect?: number;
    module?: CockpitModule;
    timeExpired?: boolean;
  }): void {
    const existing = document.getElementById('cd-band-conversion-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'cd-band-conversion-modal';
    modal.className = 'completion-modal-overlay interactive cd-band-modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', t('cockpit.band_report_title', undefined, 'Band Score Report'));

    const raw = Number.isFinite(data.rawScore) ? data.rawScore : 0;
    const p1 = Number.isFinite(data.p1Correct) ? (data.p1Correct as number) : Math.round(raw * (13 / 40));
    const p2 = Number.isFinite(data.p2Correct) ? (data.p2Correct as number) : Math.round(raw * (13 / 40));
    const p3 = Number.isFinite(data.p3Correct) ? (data.p3Correct as number) : Math.max(0, raw - p1 - p2);
    const tfng = Number.isFinite(data.tfngCorrect) ? (data.tfngCorrect as number) : Math.min(13, p1);
    const mcq = Number.isFinite(data.mcqCorrect) ? (data.mcqCorrect as number) : Math.min(13, p2);
    const gap = Number.isFinite(data.gapCorrect) ? (data.gapCorrect as number) : Math.min(14, p3);

    const rawModule = data.module || (this.currentModule === 'LISTENING' ? 'LISTENING' : 'READING');
    const displayModule = rawModule === 'LISTENING'
      ? t('cockpit.listening_short', undefined, 'LISTENING')
      : rawModule === 'WRITING'
        ? t('cockpit.writing_short', undefined, 'WRITING')
        : t('cockpit.reading_short', undefined, 'READING');
    const activeDescriptor = this.getBandDescriptor(data.bandScore).descriptor;
    const needlePos = Math.min(100, Math.max(0, (data.bandScore / 9.0) * 100));
    const isVi = I18n.getLocale() === 'vi';

    modal.innerHTML = `
      <div class="cd-band-modal-card">
        <div class="cd-telemetry-header" style="margin-bottom: var(--space-12); display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--space-8);">
            <span class="telemetry-label" style="letter-spacing: 0.08em; font-weight: 700;">${t('cockpit.report_header', undefined, 'CAMBRIDGE 9.0 OFFICIAL REPORT')}</span>
            <span class="hud-status-badge" style="letter-spacing: 0.06em; font-weight: 700; white-space: nowrap;">${t('cockpit.module_40q', { module: displayModule }, `${displayModule} &middot; 40 Qs`)}</span>
          </div>
          <div class="telemetry-label" style="color: var(--ink-muted); font-size: var(--font-kicker); letter-spacing: 0.06em;">
            ${t('cockpit.band_breakdown', undefined, 'BAND CONVERSION &amp; SECTION BREAKDOWN')}
          </div>
        </div>

        <div class="cd-band-header-badge">
          <div>
            <div style="font-size: var(--font-kicker); text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-secondary);">${t('cockpit.official_result', undefined, 'OFFICIAL RESULT')}</div>
            <div class="cd-band-number">${t('cockpit.band_score', { score: data.bandScore.toFixed(1) }, `BAND ${data.bandScore.toFixed(1)}`)}</div>
            <div style="font-size: var(--font-body-compact); font-weight: 700; color: var(--accent-gold); margin-top: 2px;">${activeDescriptor}</div>
          </div>
          <div style="text-align: right;">
            <span class="hud-pill" style="font-size: var(--font-h4); font-weight: 800; padding: 4px 10px; background: var(--accent-gold); color: var(--bg-canvas); border-radius: var(--radius-pill, 9999px); white-space: nowrap; flex-shrink: 0; border: none; display: inline-block;">
              CEFR ${data.cefr}
            </span>
            <div style="font-size: var(--font-body-compact); margin-top: 6px; font-family: var(--font-mono); color: var(--ink-primary); font-weight: 700;">
              ${(() => {
        const safePct = Number.isFinite(data.pct) ? data.pct : Math.round((raw / 40) * 100);
        return t('cockpit.raw_score_format', { raw, pct: safePct }, `${raw} / 40 Raw (${safePct}%)`);
      })()}
            </div>
          </div>
        </div>

        <!-- Visual Cambridge Band Gauge -->
        <div style="margin: 16px 0 24px;">
          <div style="display: flex; justify-content: space-between; font-size: var(--font-kicker); font-family: var(--font-mono); color: var(--ink-muted); margin-bottom: 4px;">
            <span>${t('cockpit.band_n', { n: '0.0' }, 'Band 0.0')}</span>
            <span>${t('cockpit.band_n', { n: '5.0' }, 'Band 5.0')}</span>
            <span>${t('cockpit.band_n', { n: '6.5' }, 'Band 6.5')}</span>
            <span>${t('cockpit.band_n', { n: '7.5' }, 'Band 7.5')}</span>
            <span>${t('cockpit.band_n', { n: '9.0' }, 'Band 9.0')}</span>
          </div>
          <div class="cd-scale-gauge-track">
            <div class="cd-scale-gauge-needle" style="left: ${needlePos}%;" title="${t('cockpit.band_gauge_title', { score: data.bandScore.toFixed(1) }, `Score Band ${data.bandScore}`)}"></div>
          </div>
        </div>

        <!-- 3-Passage Breakdown -->
        <div class="cd-breakdown-grid">
          <div class="cd-breakdown-card">
            <div style="font-size: var(--font-kicker); font-weight: 700; color: var(--ink-muted);">${t('cockpit.passage_n', { n: 1 }, 'PASSAGE 1')}</div>
            <div style="font-size: var(--font-body); font-weight: 800; font-family: var(--font-mono); margin: 4px 0;">${p1} / 13</div>
            <div style="font-size: var(--font-kicker); color: var(--accent-cyan); font-weight: 600;">${Math.round((p1 / 13) * 100)}%</div>
          </div>
          <div class="cd-breakdown-card">
            <div style="font-size: var(--font-kicker); font-weight: 700; color: var(--ink-muted);">${t('cockpit.passage_n', { n: 2 }, 'PASSAGE 2')}</div>
            <div style="font-size: var(--font-body); font-weight: 800; font-family: var(--font-mono); margin: 4px 0;">${p2} / 13</div>
            <div style="font-size: var(--font-kicker); color: var(--accent-cyan); font-weight: 600;">${Math.round((p2 / 13) * 100)}%</div>
          </div>
          <div class="cd-breakdown-card">
            <div style="font-size: var(--font-kicker); font-weight: 700; color: var(--ink-muted);">${t('cockpit.passage_n', { n: 3 }, 'PASSAGE 3')}</div>
            <div style="font-size: var(--font-body); font-weight: 800; font-family: var(--font-mono); margin: 4px 0;">${p3} / 14</div>
            <div style="font-size: var(--font-kicker); color: var(--accent-cyan); font-weight: 600;">${Math.round((p3 / 14) * 100)}%</div>
          </div>
        </div>

        <!-- Question Types Breakdown -->
        <div class="cd-breakdown-types" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: var(--font-kicker); font-family: var(--font-mono); padding: 10px 12px; background: var(--bg-surface-sunk); border-radius: var(--radius-squircle-sm, 10px); margin-bottom: 20px; text-align: center;">
          <div><span style="color: var(--ink-muted);">${t('cockpit.type_tfng', undefined, 'TFNG:')}</span> <strong style="color: var(--ink-primary);">${tfng}/13</strong></div>
          <div><span style="color: var(--ink-muted);">${t('cockpit.type_mcq', undefined, 'MCQ:')}</span> <strong style="color: var(--ink-primary);">${mcq}/13</strong></div>
          <div><span style="color: var(--ink-muted);">${t('cockpit.type_gap', undefined, 'GAP:')}</span> <strong style="color: var(--ink-primary);">${gap}/14</strong></div>
        </div>

        <!-- Action Buttons -->
        <div class="cd-modal-actions">
          <div class="cd-modal-btn-row">
            <button type="button" class="cd-modal-action-btn btn-review-exam apple-press">
              ${icon('search', 16)}<span>${t('cockpit.btn_review_answers', undefined, isVi ? 'Xem lại câu trả lời' : 'Review Answers')}</span>
            </button>
            <button type="button" class="cd-modal-action-btn btn-retake-exam apple-press">
              ${icon('rotateCcw', 16)}<span>${t('cockpit.btn_retake_test', undefined, isVi ? 'Làm lại bài thi' : 'Retake Test')}</span>
            </button>
            <button type="button" class="cd-modal-action-btn btn-hub-return apple-press">
              ${icon('book', 16)}<span>${t('cockpit.btn_test_catalog', undefined, 'Test Catalog')}</span>
            </button>
          </div>
          <button type="button" class="apple-bottom-close-btn btn-close-report apple-press">
            ${t('cockpit.btn_close_report', undefined, isVi ? 'Đóng báo cáo kết quả' : 'Close Score Report')}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => {
      window.removeEventListener('keydown', onKeyDown, true);
      modal.remove();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    modal.querySelector('.btn-hub-return')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      closeModal();
      this.openTestHub();
    });

    modal.querySelector('.btn-close-report')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      closeModal();
    });

    modal.querySelector('.btn-retake-exam')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      closeModal();
      this.isReviewMode = false;
      this.timerSeconds = 3600;
      this.activeQuestionIndex = 0;
      this.questions.forEach(q => {
        q.userAnswer = undefined;
        q.isFlagged = false;
      });
      this.render();
    });

    modal.querySelector('.btn-review-exam')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      closeModal();
      this.isReviewMode = true;
      this.activeQuestionIndex = 0;
      this.render();
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

  public teardown(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.autosaveTimer) clearTimeout(this.autosaveTimer);
    this.removeHighlightPopover();
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    this.isExamStarted = false;
  }
}

