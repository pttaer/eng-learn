import { esc, h } from '../ui';
import { feedback } from '../../core/feedback';

export interface SynonymPair {
  promptWord: string;
  passageWord: string;
}

export interface ReadingDrillItem {
  id: string;
  typeNumber: number;
  typeName: string;
  orderCategory: 'Sequential' | 'Mainly Sequential' | 'Global / Non-Sequential';
  ruleSnippet: string;
  passageText: string;
  questionPrompt: string;
  synonymPairs: SynonymPair[];
  inputType: 'choice' | 'text' | 'multi-choice';
  options?: { value: string; label: string }[];
  correctAnswer: string | string[];
  trapExplanation: string;
  rationale: string;
}

export const READING_DRILLS: ReadingDrillItem[] = [
  // 1. True / False / Not Given
  {
    id: 'drill-01-tfng',
    typeNumber: 1,
    typeName: 'True / False / Not Given (Factual)',
    orderCategory: 'Sequential',
    ruleSnippet:
      'TRUE = 100% semantic match; FALSE = direct factual contradiction; NOT GIVEN = passage is completely silent on this specific claim. Never extrapolate from outside knowledge!',
    passageText:
      '[A] In the early 1900s, William Perkin’s pioneering work in synthetic organic chemistry transformed industrial manufacturing across Europe. While conducting experiments at his makeshift laboratory in London, Perkin set out to synthesize artificial quinine, a stubbornly difficult compound historically harvested from cinchona tree bark to treat malaria. Contrary to conventional assumptions, his failed attempts did not discourage him; instead, a chance residue yielded mauveine, the first commercially viable synthetic dye.',
    questionPrompt:
      'Perkin found it remarkably straightforward to synthesize artificial quinine from cinchona tree bark.',
    synonymPairs: [
      { promptWord: 'remarkably straightforward', passageWord: 'stubbornly difficult' },
      { promptWord: 'synthesize artificial quinine', passageWord: 'synthesize artificial quinine' }
    ],
    inputType: 'choice',
    options: [
      { value: 'TRUE', label: 'TRUE — The statement matches the passage information' },
      { value: 'FALSE', label: 'FALSE — The statement directly contradicts the passage information' },
      { value: 'NOT GIVEN', label: 'NOT GIVEN — The passage contains no information about this claim' }
    ],
    correctAnswer: 'FALSE',
    trapExplanation:
      'The prompt claims synthesizing the compound was "remarkably straightforward", while the passage calls it "stubbornly difficult". When information is directly contradicted, the answer is FALSE, not NOT GIVEN.',
    rationale:
      'The statement is FALSE because "remarkably straightforward" directly contradicts the passage, which says quinine was "stubbornly difficult" to synthesize.'
  },

  // 2. Yes / No / Not Given
  {
    id: 'drill-02-ynng',
    typeNumber: 2,
    typeName: "Yes / No / Not Given (Author's Stance & Opinions)",
    orderCategory: 'Sequential',
    ruleSnippet:
      "YES = reflects author's opinion; NO = contradicts author's stance; NOT GIVEN = author expresses no view. Look for attitude markers ('In our estimation', 'naively').",
    passageText:
      '[B] In our estimation, modern educational curricula have naively overemphasized rote memorization over epistemic critical thinking. While some policymakers argue that standardized testing offers objective benchmarks, this reliance has produced deleterious consequences for student creative problem-solving. It is deeply misguided to assume that factual recall equates to cognitive intelligence.',
    questionPrompt:
      'The author believes that prioritizing standardized test scores has had an adverse impact on students’ analytical creativity.',
    synonymPairs: [
      { promptWord: 'author believes', passageWord: 'In our estimation' },
      { promptWord: 'adverse impact', passageWord: 'deleterious consequences' },
      { promptWord: 'analytical creativity', passageWord: 'creative problem-solving' }
    ],
    inputType: 'choice',
    options: [
      { value: 'YES', label: 'YES — The statement agrees with the writer’s claims' },
      { value: 'NO', label: 'NO — The statement contradicts the writer’s claims' },
      { value: 'NOT GIVEN', label: 'NOT GIVEN — It is impossible to say what the writer thinks about this' }
    ],
    correctAnswer: 'YES',
    trapExplanation:
      'The text mentions policymakers who defend tests, but the author uses "In our estimation" and "deleterious consequences" to argue that the tests have harmed problem solving.',
    rationale:
      'The statement is YES because the writer argues ("In our estimation") that relying on standardized tests causes "deleterious consequences" (adverse impact) for creative problem solving.'
  },

  // 3. Short Answer Questions
  {
    id: 'drill-03-short-answer',
    typeNumber: 3,
    typeName: 'Short Answer Questions (Exact Word Lifting)',
    orderCategory: 'Sequential',
    ruleSnippet:
      'Extract exact words from the passage without changing word forms. Obey word limit (NO MORE THAN THREE WORDS AND/OR A NUMBER). Questions follow text chronological order.',
    passageText:
      '[C] The installation of offshore wind turbine clusters in the North Sea required substantial upfront capital. Initially, project developers projected that specialized transport barges would be operational by 2018. However, due to severe maritime winter storms, the heavy fabrication contractor experienced an unavoidable delay of approximately two months before final assembly could commence.',
    questionPrompt:
      'How much time was lost by the fabrication contractor as a result of harsh winter weather? (NO MORE THAN THREE WORDS AND/OR A NUMBER)',
    synonymPairs: [
      { promptWord: 'time was lost', passageWord: 'unavoidable delay' },
      { promptWord: 'harsh winter weather', passageWord: 'severe maritime winter storms' }
    ],
    inputType: 'text',
    correctAnswer: ['two months', 'approximately two months'],
    trapExplanation:
      'Word Count Penalty: Writing "of approximately two months" (4 words) is automatically marked incorrect on official IELTS. Drop extraneous prepositions.',
    rationale:
      'The passage states the contractor experienced an "unavoidable delay of approximately two months". Lifting "two months" or "approximately two months" precisely answers the time lost within the 3-word limit.'
  },

  // 4. Sentence Completion
  {
    id: 'drill-04-sentence-completion',
    typeNumber: 4,
    typeName: 'Sentence Completion (Grammatical Gap-Fill)',
    orderCategory: 'Sequential',
    ruleSnippet:
      'Analyze the blank for syntactic role (noun, adjective, verb). Extract exact words directly from the text so the completed prompt forms flawless grammar.',
    passageText:
      '[D] Agricultural biotechnology researchers have long sought drought-resistant grain varieties. While conventional irrigation systems proved cost-prohibitive for subsistence farmers across arid regions, the widespread adoption of subterranean drip networks delivered adequate volumes of moisture directly to root structures, mitigating crop failure during prolonged dry spells.',
    questionPrompt:
      'Traditional watering methods were ________ for small-scale farmers in arid territories. (NO MORE THAN TWO WORDS)',
    synonymPairs: [
      { promptWord: 'traditional watering methods', passageWord: 'conventional irrigation systems' },
      { promptWord: 'small-scale farmers', passageWord: 'subsistence farmers' }
    ],
    inputType: 'text',
    correctAnswer: ['cost-prohibitive', 'cost prohibitive'],
    trapExplanation:
      'Grammar Misalignment: The linking verb "were" requires a predicate adjective. Inserting "cost" or "a cost" violates syntax.',
    rationale:
      '"Cost-prohibitive" is the exact adjective from the text matching the predicate role after "were" and qualifying conventional irrigation systems.'
  },

  // 5. Summary Completion (Word Bank)
  {
    id: 'drill-05-summary-completion',
    typeNumber: 5,
    typeName: 'Summary Completion (Word Bank Box)',
    orderCategory: 'Mainly Sequential',
    ruleSnippet:
      'Word bank options are synonyms of passage words. Match the passage keyword first, identify its synonym letter in the box, and confirm grammatical agreement.',
    passageText:
      '[E] The introduction of mechanized spinning mules in 18th-century Lancashire textile mills sparked an exponential surge in cotton output. Mill owners witnessed their productivity mushroom precipitously within five years. Nevertheless, domestic artisan spinners exhibited systemic resistance to this transition, mounting widespread protests over suppressed artisan wages.',
    questionPrompt:
      'Summary: The introduction of automated equipment triggered a rapid [Blank 1: ______] in fabric output, despite fierce social [Blank 2: ______] from traditional workers.\n\nWord Bank:\nA: decline\nB: expansion\nC: opposition\nD: investment\nE: indifference',
    synonymPairs: [
      { promptWord: 'rapid expansion', passageWord: 'exponential surge / mushroomed precipitously' },
      { promptWord: 'fierce social opposition', passageWord: 'systemic resistance / widespread protests' }
    ],
    inputType: 'choice',
    options: [
      { value: 'A', label: 'Blank 1: D (investment), Blank 2: A (decline)' },
      { value: 'B', label: 'Blank 1: A (decline), Blank 2: C (opposition)' },
      { value: 'C', label: 'Blank 1: B (expansion), Blank 2: C (opposition)' },
      { value: 'D', label: 'Blank 1: B (expansion), Blank 2: D (investment)' }
    ],
    correctAnswer: 'C',
    trapExplanation:
      'Option B contradicts the text with "decline". "Exponential surge" maps to B (expansion), and "systemic resistance" maps to C (opposition).',
    rationale:
      'Choice C is correct: Blank 1 matches B (expansion for "exponential surge"), and Blank 2 matches C (opposition for "systemic resistance").'
  },

  // 6. Table Completion
  {
    id: 'drill-06-table-completion',
    typeNumber: 6,
    typeName: 'Table Completion (Categorized Matrix)',
    orderCategory: 'Mainly Sequential',
    ruleSnippet:
      'Read column and row headers to orient categories. Scan for hard dates or inventor names, then extract the designated cell datum under the strict word limit.',
    passageText:
      '[F] Maritime navigation underwent radical changes across the 18th century. In 1714, the British Parliament enacted the Longitude Act, creating a substantial financial incentive. In 1735, John Harrison completed his first marine timekeeper (H1), utilizing countervailing brass balances. By 1759, his refined pocket watch design (H4) achieved navigational precision within five seconds on transatlantic voyages.',
    questionPrompt:
      'Table Completion:\n• 1714 | Longitude Act | Financial incentive\n• 1735 | Marine timekeeper (H1) | [ BLANK: ????? ]\n• 1759 | Pocket watch (H4) | Navigational precision\n\nIdentify the technical mechanism for 1735 (NO MORE THAN THREE WORDS):',
    synonymPairs: [
      { promptWord: 'technical mechanism', passageWord: 'utilizing' },
      { promptWord: 'completed his first timekeeper', passageWord: 'H1' }
    ],
    inputType: 'text',
    correctAnswer: ['countervailing brass balances', 'brass balances'],
    trapExplanation:
      'Adjacent Row Lure: Do not lift "pocket watch design" from the 1759 row. Keep strictly to the 1735 horizontal row.',
    rationale:
      'The 1735 row requires the mechanism used in Harrison’s H1 timekeeper, which the passage explicitly identifies as "countervailing brass balances".'
  },

  // 7. Flow Chart Completion
  {
    id: 'drill-07-flow-chart',
    typeNumber: 7,
    typeName: 'Flow Chart Completion (Sequential Stages)',
    orderCategory: 'Mainly Sequential',
    ruleSnippet:
      'Follow sequential arrow progression. Trace chronological transition markers (initially -> subsequently -> in the final phase) to pinpoint the missing stage noun.',
    passageText:
      '[G] Desalination through reverse osmosis follows a strict multistage purification sequence. Initially, raw seawater undergoes coarse intake screening to eliminate marine debris. Subsequently, high-pressure pumps force the saline solution through semi-permeable membranes to filter dissolved mineral salts. In the final phase, remineralization buffers the effluent before municipal distribution.',
    questionPrompt:
      'Flow Chart: [Raw Seawater] ──► [Coarse Screening] ──► [High-Pressure Pumps] ──► [ ______ Membranes] ──► [Remineralization]\n\nFill the missing membrane descriptor (ONE WORD ONLY):',
    synonymPairs: [
      { promptWord: 'filter removes minerals', passageWord: 'filter dissolved mineral salts' },
      { promptWord: 'multistage sequence', passageWord: 'purification sequence' }
    ],
    inputType: 'text',
    correctAnswer: ['semi-permeable', 'semipermeable'],
    trapExplanation:
      'Word Count Violation: The prompt requires ONE WORD ONLY. Hyphenated words ("semi-permeable") count as a single word in IELTS.',
    rationale:
      'The third stage explicitly channels water through "semi-permeable" membranes to filter mineral salts.'
  },

  // 8. Diagram Labelling
  {
    id: 'drill-08-diagram-labelling',
    typeNumber: 8,
    typeName: 'Diagram Labelling (Spatial Structure)',
    orderCategory: 'Mainly Sequential',
    ruleSnippet:
      'Follow spatial orientation cues (outer shell, suspended within core, encircling). Extract precise technical nouns describing the mechanical component.',
    passageText:
      '[H] The acoustic calorimeter features a rigid outer shell lined with thermal insulation. Suspended directly within the core is a sealed copper combustion vessel where the reactant capsule is ignited. Encircling this inner vessel, a continuous helical cooling jacket circulates chilled water to absorb thermodynamic heat dissipation.',
    questionPrompt:
      'Diagram Labelling: Pointer 3 points to the coiled tubes wrapping around the inner combustion chamber.\n\nIdentify Component 3 (NO MORE THAN THREE WORDS):',
    synonymPairs: [
      { promptWord: 'coiled tubes wrapping around', passageWord: 'encircling this inner vessel, a continuous helical' },
      { promptWord: 'absorb heat', passageWord: 'absorb thermodynamic heat dissipation' }
    ],
    inputType: 'text',
    correctAnswer: ['helical cooling jacket', 'cooling jacket'],
    trapExplanation:
      'Misidentifying Location: Do not confuse the reactant capsule (inside) with the helical cooling jacket (encircling the exterior).',
    rationale:
      'The text states that "encircling this inner vessel, a continuous helical cooling jacket circulates chilled water". "Helical cooling jacket" is the exact label.'
  },

  // 9. Multiple Choice Standard
  {
    id: 'drill-09-mcq-single',
    typeNumber: 9,
    typeName: 'Multiple Choice Standard (Single Answer)',
    orderCategory: 'Sequential',
    ruleSnippet:
      'Form your own predictive answer before reading A–D. Eliminate options with verbatim word match traps that quote words from unrelated contexts.',
    passageText:
      '[I] Behavioral economists have evaluated consumer willingness to pay for biodegradable packaging. Although trade specialists predicted that green branding would automatically trigger retail sales premiums, empirical trials indicated that consumer purchases only accelerated when the eco-friendly alternative exhibited exact price parity with conventional single-use plastics.',
    questionPrompt:
      'What did empirical research reveal regarding consumer purchasing habits for biodegradable packaging?',
    synonymPairs: [
      { promptWord: 'price matched traditional plastics', passageWord: 'exact price parity with conventional single-use plastics' }
    ],
    inputType: 'choice',
    options: [
      { value: 'A', label: 'A) Eco-friendly goods were only favored when their price matched traditional plastics.' },
      { value: 'B', label: 'B) Trade specialists correctly forecast rapid sales acceleration for sustainable goods.' },
      { value: 'C', label: 'C) Consumers gladly paid higher premiums whenever green branding was visible.' },
      { value: 'D', label: 'D) Retail sales plummeted due to general skepticism toward recycling claims.' }
    ],
    correctAnswer: 'A',
    trapExplanation:
      'Option C repeats words like "green branding" and "premiums" from the text, but makes the opposite claim from the trial findings.',
    rationale:
      'Option A correctly paraphrases the finding: sales accelerated only when biodegradable alternatives reached "exact price parity" with conventional plastics.'
  },

  // 10. Choose 2 From a List
  {
    id: 'drill-10-pick-multiple',
    typeNumber: 10,
    typeName: 'Choose 2 to 5 From a List (Multi-Selection)',
    orderCategory: 'Mainly Sequential',
    ruleSnippet:
      'Verify that both selected letters are explicitly grounded in the text. Beware of distractors that the text explicitly rejects as unsupported or unproven.',
    passageText:
      '[J] Urban forestry initiatives deliver multifaceted municipal advantages. Empirical urban canopy assessments confirm that mature street trees attenuate localized heat island effects by up to 3.5 degrees Celsius through evapotranspiration. Furthermore, root matrices substantially curtail stormwater runoff velocities, decreasing civil drainage overload during flash floods. Conversely, claims that urban trees universally diminish property insurance rates or eliminate traffic noise remain unsupported by acoustic field data.',
    questionPrompt:
      'Which TWO documented benefits of urban forestry are verified by empirical data in the passage?\n(Select exactly TWO options)',
    synonymPairs: [
      { promptWord: 'reduction in localized urban temperatures', passageWord: 'attenuate localized heat island effects' },
      { promptWord: 'decreased burden on drainage systems', passageWord: 'curtail stormwater runoff, decreasing drainage overload' }
    ],
    inputType: 'multi-choice',
    options: [
      { value: 'A', label: 'A) Significant reduction in localized urban temperatures' },
      { value: 'B', label: 'B) Modest improvements in residential noise levels' },
      { value: 'C', label: 'C) Decreased burden on city stormwater drainage systems' },
      { value: 'D', label: 'D) Enhanced property insurance rates in some districts' },
      { value: 'E', label: 'E) Complete replacement of civil wastewater infrastructure' }
    ],
    correctAnswer: ['A', 'C'],
    trapExplanation:
      'Options B and D name claims that the passage notes are "unsupported by acoustic field data". Option E is not mentioned.',
    rationale:
      'Only A ("attenuate localized heat island effects by up to 3.5°C") and C ("curtail stormwater runoff velocities, decreasing drainage overload") are supported by data in the text.'
  },

  // 11. Matching Headings
  {
    id: 'drill-11-matching-headings',
    typeNumber: 11,
    typeName: 'Matching Headings (Paragraph Main Idea)',
    orderCategory: 'Global / Non-Sequential',
    ruleSnippet:
      'A heading summarizes the overarching controlling theme of the entire paragraph. Skim lines 1–2 and concluding sentence. Avoid detail traps!',
    passageText:
      '[Paragraph C] Despite widespread governmental pledges to decarbonize national freight logistics by 2040, transport infrastructure across maritime ports remains stubbornly tethered to heavy diesel fuel. Haulage operators cite severe budgetary limitations and the prohibitive capital expenditure needed to retrofit electrified commercial fleets. Until targeted state subsidies offset initial adoption expenses, fleet owners express systemic reluctance to commit to zero-emission technology.',
    questionPrompt:
      'Select the most suitable heading for Paragraph C from the list below:',
    synonymPairs: [
      { promptWord: 'Economic hurdles', passageWord: 'budgetary limitations / prohibitive capital expenditure' },
      { promptWord: 'impeding the transition', passageWord: 'stubbornly tethered / systemic reluctance' }
    ],
    inputType: 'choice',
    options: [
      { value: 'i', label: 'i: The triumphant elimination of fossil fuel transit in shipping ports' },
      { value: 'ii', label: 'ii: A comprehensive blueprint for port electrification subsidies' },
      { value: 'iii', label: 'iii: Statistical modeling of heavy diesel particulate emissions' },
      { value: 'iv', label: 'iv: Economic hurdles impeding the freight logistics transition' }
    ],
    correctAnswer: 'iv',
    trapExplanation:
      'Detail Lure vs. Central Idea: Heading i contradicts the text. Heading ii mentions subsidies, but subsidies are only mentioned as a condition in the final line, not the paragraph theme.',
    rationale:
      'Heading iv captures the primary controlling theme: "budgetary limitations" and "prohibitive capital expenditure" (economic hurdles) prevent freight operators from adopting green technology.'
  },

  // 12. Matching Information
  {
    id: 'drill-12-matching-info',
    typeNumber: 12,
    typeName: 'Matching Information (Locating Specific Paragraph)',
    orderCategory: 'Global / Non-Sequential',
    ruleSnippet:
      'Questions do NOT follow passage order. Parse the prompt for functional categories: a reference to, an explanation of, a contrast between. Execute last!',
    passageText:
      '[Paragraph A]: Glaciological core sampling in Western Greenland reveals atmospheric carbon ratios spanning the last 800,000 years.\n\n[Paragraph B]: Deep seismic imaging demonstrates that subsurface magma conduits expand precipitously prior to volcanic eruptions, generating localized tremors.\n\n[Paragraph C]: While conventional hand-drawn cartography historically dominated surveying workflows, contemporary LiDAR drone surveys produce millimeter-accurate topographic elevation models within hours, advancing the discipline substantially.',
    questionPrompt:
      'Which paragraph contains a comparison between conventional hand-drawn mapping and modern digital surveying technology?',
    synonymPairs: [
      { promptWord: 'conventional hand-drawn mapping', passageWord: 'conventional hand-drawn cartography' },
      { promptWord: 'modern digital surveying', passageWord: 'LiDAR drone surveys' }
    ],
    inputType: 'choice',
    options: [
      { value: 'A', label: 'Paragraph A' },
      { value: 'B', label: 'Paragraph B' },
      { value: 'C', label: 'Paragraph C' }
    ],
    correctAnswer: 'C',
    trapExplanation:
      'Scanning for the word "comparison" will not work here. Look for contrast words like "While" that set two things side by side.',
    rationale:
      'Paragraph C contrasts "conventional hand-drawn cartography" with "contemporary LiDAR drone surveys".'
  },

  // 13. Matching Features / Names
  {
    id: 'drill-13-matching-features',
    typeNumber: 13,
    typeName: 'Matching Features / Names / Opinions',
    orderCategory: 'Global / Non-Sequential',
    ruleSnippet:
      'Names are hard capital-letter anchors. Underline every mention of each researcher, read their specific claims, and match against statements.',
    passageText:
      '[K] Contemporary anthropological archaeology has contested early extinction hypotheses. Dr. Elena Vance presented evidence through paleolithic tool analysis that human overhunting intensified across grassland territories during the terminal Pleistocene, directly precipitating megafauna population collapse. Conversely, Professor Arthur Sterling contended that environmental megadroughts, rather than human hunting pressure, accounted for the sudden extinction of giant animal species across the continent.',
    questionPrompt:
      'Statement: Contended that human hunting activity was the decisive factor in megafauna extinction.\n\nMatch with the responsible researcher:',
    synonymPairs: [
      { promptWord: 'human hunting activity', passageWord: 'human overhunting' },
      { promptWord: 'megafauna extinction', passageWord: 'megafauna population collapse' }
    ],
    inputType: 'choice',
    options: [
      { value: 'A', label: 'A: Dr. Elena Vance' },
      { value: 'B', label: 'B: Professor Arthur Sterling' },
      { value: 'C', label: 'C: Neither researcher' }
    ],
    correctAnswer: 'A',
    trapExplanation:
      'Professor Sterling also discusses megafauna, but blames droughts rather than hunting. Dr. Vance is the researcher who argues overhunting drove the collapse.',
    rationale:
      'Dr. Elena Vance found that "human overhunting intensified... directly precipitating megafauna population collapse", matching the statement.'
  },

  // 14. Matching Sentence Endings
  {
    id: 'drill-14-matching-endings',
    typeNumber: 14,
    typeName: 'Matching Sentence Endings (Grammar + Meaning)',
    orderCategory: 'Sequential',
    ruleSnippet:
      'Question stems go in passage order; endings in the box do not. Check grammatical seamlessness (subject-verb agreement, prepositions) and verify semantic accuracy.',
    passageText:
      '[L] The reintroduction of apex predator gray wolves into Yellowstone National Park in 1995 initiated a celebrated trophic cascade. By altering elk grazing behavior near riverbanks, wolf predation allowed overbrowsed willow and aspen stands to regenerate rapidly, which subsequently provided vital dam-building materials for native beaver colonies.',
    questionPrompt:
      'Sentence Stem: The restoration of predatory wolf populations near river valleys ________\n\nComplete the sentence with the correct ending:',
    synonymPairs: [
      { promptWord: 'riparian vegetation to recover', passageWord: 'willow and aspen stands to regenerate rapidly' },
      { promptWord: 'supported local beavers', passageWord: 'provided vital dam-building materials for native beaver colonies' }
    ],
    inputType: 'choice',
    options: [
      { value: 'A', label: 'A) enabled riparian vegetation to recover and supported local beavers.' },
      { value: 'B', label: 'B) was vigorously resisted by regional conservation agencies.' },
      { value: 'C', label: 'C) drastically depleted the survival rates of native aquatic mammals.' },
      { value: 'D', label: 'D) failed to alter the feeding routines of ungulate populations.' }
    ],
    correctAnswer: 'A',
    trapExplanation:
      'Distractor Plausibility: Option C sounds plausible in general knowledge (predators harming animals), but contradicts the passage evidence showing beavers flourished.',
    rationale:
      'Ending A seamlessly completes the sentence: wolf predation changed grazing routines, allowing riverbank flora (willow/aspen) to regenerate and supplying beavers with materials.'
  }
];

export function readingDrillsView(root: HTMLElement): () => void {
  let currentDrillIndex = 0;
  const userAnswers: Record<string, string | string[]> = {};
  const drillEvaluations: Record<string, { attempted: boolean; correct: boolean }> = {};
  let isSynonymActive = false;

  root.innerHTML = '';

  // Main Container
  const container = h('div', 'ie-drills-container');

  // Header Bar
  const head = h('header', 'ie-drills-header');
  head.innerHTML = `
    <div class="ie-drills-title-group">
      <div class="ie-badge-band ie-badge-reading-tag">READING LAB</div>
      <h1 class="ie-title">14 Reading Question-Type Attack Drills</h1>
      <p class="ie-lead">Master Keino Campbell’s Band 7+ tactical algorithms for all 14 official IELTS Reading question types. Featuring live passage scanning, instant synonym matrix mapping, and granular examiner error deconstruction.</p>
    </div>
  `;
  container.append(head);

  // Score HUD
  const hud = h('div', 'ie-drills-hud');
  hud.innerHTML = `
    <div class="ie-hud-metric">
      <span class="ie-hud-num" id="drills-mastered-count">0 / 14</span>
      <span class="ie-hud-label">Drills Mastered</span>
    </div>
    <div class="ie-hud-actions">
      <button type="button" class="ie-btn ie-btn-sm" id="btn-toggle-synonyms" aria-pressed="false">
        🔄 Toggle Synonym Engine
      </button>
      <a href="#reading" class="ie-btn ie-btn-sm">← Back to Full Passages</a>
    </div>
  `;
  container.append(hud);

  // Nav Tabs Bar
  const navTabs = h('nav', 'ie-drills-nav-tabs', '');
  navTabs.setAttribute('aria-label', 'Question Types 1 through 14');
  READING_DRILLS.forEach((d, idx) => {
    const tabBtn = h('button', `ie-drill-tab ${idx === 0 ? 'is-active' : ''}`);
    tabBtn.setAttribute('data-index', String(idx));
    tabBtn.setAttribute('id', `drill-tab-${d.typeNumber}`);
    tabBtn.innerHTML = `<span class="ie-tab-num">T${d.typeNumber}</span><span class="ie-tab-name">${esc(d.typeName.split('(')[0].trim())}</span>`;
    tabBtn.addEventListener('click', () => {
      currentDrillIndex = idx;
      renderDrill();
    });
    navTabs.append(tabBtn);
  });
  container.append(navTabs);

  // Drill Workspace Shell
  const workspace = h('main', 'ie-drill-workspace');
  container.append(workspace);

  root.append(container);

  // Toggle Synonym Engine
  const toggleSynBtn = hud.querySelector('#btn-toggle-synonyms') as HTMLButtonElement;
  toggleSynBtn.addEventListener('click', () => {
    isSynonymActive = !isSynonymActive;
    toggleSynBtn.setAttribute('aria-pressed', isSynonymActive ? 'true' : 'false');
    toggleSynBtn.classList.toggle('ie-btn-primary', isSynonymActive);
    const synMatrixEl = workspace.querySelector('.ie-syn-matrix') as HTMLElement | null;
    if (synMatrixEl) {
      synMatrixEl.hidden = !isSynonymActive;
    }
    const passageEl = workspace.querySelector('.ie-drill-passage') as HTMLElement | null;
    if (passageEl) {
      passageEl.classList.toggle('is-synonyms-highlighted', isSynonymActive);
    }
  });

  function updateHud(): void {
    const mastered = Object.values(drillEvaluations).filter(v => v.correct).length;
    const hudNum = hud.querySelector('#drills-mastered-count');
    if (hudNum) {
      hudNum.textContent = `${mastered} / 14`;
    }

    // Update Tab statuses
    navTabs.querySelectorAll('.ie-drill-tab').forEach((tab, idx) => {
      const d = READING_DRILLS[idx];
      const evalState = drillEvaluations[d.id];
      tab.classList.toggle('is-active', idx === currentDrillIndex);
      tab.classList.toggle('is-passed', evalState ? evalState.correct : false);
      tab.classList.toggle('is-failed', evalState ? evalState.attempted && !evalState.correct : false);
    });
  }

  function renderDrill(): void {
    workspace.innerHTML = '';
    const drill = READING_DRILLS[currentDrillIndex];

    const card = h('article', 'ie-drill-card');
    card.setAttribute('data-drill-id', drill.id);
    card.setAttribute('id', `drill-card-${drill.typeNumber}`);

    // Drill Meta Strip
    const metaStrip = h('div', 'ie-drill-meta-strip');
    metaStrip.innerHTML = `
      <div class="ie-drill-tags">
        <span class="ie-pill ie-pill-type">Question Type ${drill.typeNumber} of 14</span>
        <span class="ie-pill ie-pill-order">${esc(drill.orderCategory)}</span>
      </div>
      <div class="ie-drill-rule">
        <b>📐 Tactical Rule:</b> <span>${esc(drill.ruleSnippet)}</span>
      </div>
    `;

    // Split Pane (Passage Left, Question Right)
    const split = h('div', 'ie-split ie-drill-split');

    // Passage Column
    const passageCol = h('div', 'ie-passage ie-drill-passage');
    if (isSynonymActive) passageCol.classList.add('is-synonyms-highlighted');

    let formattedPassage = esc(drill.passageText);
    // Highlight synonyms if active
    drill.synonymPairs.forEach(pair => {
      const regex = new RegExp(pair.passageWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      formattedPassage = formattedPassage.replace(
        regex,
        match => `<mark class="ie-syn-mark" title="Exam Synonym Match: ${esc(pair.promptWord)}">${match}</mark>`
      );
    });

    passageCol.innerHTML = `
      <div class="ie-passage-head">
        <h3>Passage Excerpt</h3>
        <small class="ie-note">Authentic Academic IELTS Reading Context</small>
      </div>
      <div class="ie-passage-body">
        <p>${formattedPassage}</p>
      </div>
    `;

    // Synonym Engine Matrix Box
    const synMatrix = h('div', 'ie-syn-matrix');
    synMatrix.hidden = !isSynonymActive;
    synMatrix.innerHTML = `
      <h4>🔄 Active Exam Synonym Mapping Engine</h4>
      <table class="ie-table ie-synonym-table">
        <thead>
          <tr>
            <th>Question Stem Phrase</th>
            <th>Passage Counterpart (Paraphrase)</th>
          </tr>
        </thead>
        <tbody>
          ${drill.synonymPairs
            .map(
              sp =>
                `<tr><td><code>${esc(sp.promptWord)}</code></td><td><code>${esc(sp.passageWord)}</code></td></tr>`
            )
            .join('')}
        </tbody>
      </table>
    `;
    passageCol.append(synMatrix);

    // Question Column
    const questionCol = h('div', 'ie-qcol ie-drill-qcol');
    questionCol.innerHTML = `
      <div class="ie-qcol-head">
        <h3>${esc(drill.typeName)}</h3>
        <p class="ie-prompt-text">${esc(drill.questionPrompt).replace(/\n/g, '<br/>')}</p>
      </div>
    `;

    // Interactive Input Form Area
    const inputArea = h('div', 'ie-drill-inputs');

    if (drill.inputType === 'choice') {
      const choicesWrap = h('div', 'ie-choices ie-choices-col');
      drill.options?.forEach(opt => {
        const choice = h('label', 'ie-choice');
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `q-${drill.id}`;
        radio.value = opt.value;
        if (userAnswers[drill.id] === opt.value) {
          radio.checked = true;
        }
        radio.addEventListener('change', () => {
          userAnswers[drill.id] = opt.value;
        });
        choice.append(radio, h('span', '', esc(opt.label)));
        choicesWrap.append(choice);
      });
      inputArea.append(choicesWrap);
    } else if (drill.inputType === 'multi-choice') {
      const choicesWrap = h('div', 'ie-choices ie-choices-col');
      const currentSelected = Array.isArray(userAnswers[drill.id])
        ? (userAnswers[drill.id] as string[])
        : [];

      drill.options?.forEach(opt => {
        const choice = h('label', 'ie-choice');
        const check = document.createElement('input');
        check.type = 'checkbox';
        check.value = opt.value;
        if (currentSelected.includes(opt.value)) {
          check.checked = true;
        }
        check.addEventListener('change', () => {
          let sel = Array.isArray(userAnswers[drill.id])
            ? (userAnswers[drill.id] as string[])
            : [];
          if (check.checked) {
            if (!sel.includes(opt.value)) sel.push(opt.value);
          } else {
            sel = sel.filter(v => v !== opt.value);
          }
          userAnswers[drill.id] = sel;
        });
        choice.append(check, h('span', '', esc(opt.label)));
        choicesWrap.append(choice);
      });
      inputArea.append(choicesWrap);
    } else if (drill.inputType === 'text') {
      const textWrap = h('div', 'ie-text-input-wrap');
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'ie-input ie-drill-text-input';
      input.id = 'drill-text-input';
      input.placeholder = 'Type exact words lifted directly from the text...';
      input.setAttribute('aria-label', 'Your answer');
      if (typeof userAnswers[drill.id] === 'string') {
        input.value = userAnswers[drill.id] as string;
      }
      input.addEventListener('input', () => {
        userAnswers[drill.id] = input.value;
      });
      textWrap.append(input);
      inputArea.append(textWrap);
    }

    questionCol.append(inputArea);

    // Actions & Check Button
    const actions = h('div', 'ie-drill-actions');
    const checkBtn = h('button', 'ie-btn ie-btn-primary ie-drill-check-btn', 'Check Answer');
    checkBtn.id = 'btn-check-drill';
    actions.append(checkBtn);

    // Prev / Next Buttons
    const navButtons = h('div', 'ie-drill-nav-btns');
    const prevBtn = h('button', 'ie-btn ie-btn-sm', '← Previous');
    prevBtn.disabled = currentDrillIndex === 0;
    prevBtn.addEventListener('click', () => {
      if (currentDrillIndex > 0) {
        currentDrillIndex--;
        renderDrill();
      }
    });

    const nextBtn = h('button', 'ie-btn ie-btn-sm', 'Next Drill →');
    nextBtn.disabled = currentDrillIndex === READING_DRILLS.length - 1;
    nextBtn.addEventListener('click', () => {
      if (currentDrillIndex < READING_DRILLS.length - 1) {
        currentDrillIndex++;
        renderDrill();
      }
    });

    navButtons.append(prevBtn, nextBtn);
    actions.append(navButtons);

    questionCol.append(actions);

    // Feedback & Rationale Console
    const feedbackBox = h('div', 'ie-drill-feedback');
    feedbackBox.id = 'drill-feedback-box';
    const evalState = drillEvaluations[drill.id];
    if (evalState && evalState.attempted) {
      renderFeedback(feedbackBox, drill, evalState.correct);
    } else {
      feedbackBox.hidden = true;
    }
    questionCol.append(feedbackBox);

    checkBtn.addEventListener('click', () => {
      const answer = userAnswers[drill.id];
      const isCorrect = evaluateAnswer(drill, answer);
      drillEvaluations[drill.id] = { attempted: true, correct: isCorrect };
      feedbackBox.hidden = false;
      renderFeedback(feedbackBox, drill, isCorrect);
      feedback.emit(
        { type: 'answer', result: isCorrect ? 'correct' : 'wrong', why: drill.rationale, mode: 'practice' },
        feedbackBox
      );
      updateHud();
    });

    split.append(passageCol, questionCol);
    card.append(metaStrip, split);
    workspace.append(card);

    updateHud();
  }

  function evaluateAnswer(drill: ReadingDrillItem, answer: string | string[] | undefined): boolean {
    if (!answer) return false;
    if (drill.inputType === 'choice') {
      return String(answer).trim().toUpperCase() === String(drill.correctAnswer).trim().toUpperCase();
    }
    if (drill.inputType === 'multi-choice') {
      if (!Array.isArray(answer)) return false;
      const expected = (drill.correctAnswer as string[]).map(x => x.toUpperCase()).sort();
      const actual = answer.map(x => x.toUpperCase()).sort();
      return JSON.stringify(expected) === JSON.stringify(actual);
    }
    if (drill.inputType === 'text') {
      const cleanActual = String(answer)
        .trim()
        .toLowerCase()
        .replace(/^[.\s,"']+|[.\s,"']+$/g, '')
        .replace(/\s+/g, ' ');
      if (Array.isArray(drill.correctAnswer)) {
        return drill.correctAnswer.some(
          ans =>
            cleanActual ===
            ans
              .trim()
              .toLowerCase()
              .replace(/\s+/g, ' ')
        );
      }
      return cleanActual === String(drill.correctAnswer).trim().toLowerCase();
    }
    return false;
  }

  function renderFeedback(box: HTMLElement, drill: ReadingDrillItem, isCorrect: boolean): void {
    box.innerHTML = `
      <div class="ie-feedback-banner ${isCorrect ? 'is-correct' : 'is-incorrect'}">
        <span class="ie-eval-verdict">${isCorrect ? '✓ Correct Answer' : '✗ Incorrect Attempt'}</span>
        <span class="ie-eval-band-badge">${isCorrect ? 'Band 8.0+ Precision' : 'Needs Calibration'}</span>
      </div>
      <div class="ie-feedback-body">
        <div class="ie-feedback-section">
          <h4>💡 Examiner Rationale &amp; Cognitive Match:</h4>
          <p>${esc(drill.rationale)}</p>
        </div>
        <div class="ie-feedback-section ie-trap-warning">
          <h4>⚠️ Examiner Trap Deconstruction:</h4>
          <p>${esc(drill.trapExplanation)}</p>
        </div>
      </div>
    `;
  }

  renderDrill();

  return () => {
    // cleanup
  };
}
