import strategyData from '../data/strategy.json';
import tipsData from '../../assets/data/ielts-tips.json';
import { esc, h } from '../ui';
import { ttsAvailable } from '../tts';

export interface StrategyCard {
  id: string;
  skill: string;
  title: string;
  sectionRef?: string;
  tips: string[];
  traps?: string[];
  formula?: string;
  synonymPairs?: { promptWord: string; passageWord: string }[];
  modelRef?: string;
}

const MASTER_COURSE_CARDS: StrategyCard[] = [
  // ==========================================
  // READING MODULE: 14 QUESTION TYPES (Sec 15)
  // ==========================================
  {
    id: 'rd-01',
    skill: 'Reading',
    title: 'True / False / Not Given (T/F/NG)',
    sectionRef: 'Sec 15: Academic Reading Specific Question Strategy (Lectures 115, 121, 122)',
    formula: 'Step 1: Identify 2-3 target keywords in statement -> Step 2: Scan passage for synonym cluster -> Step 3: Compare strict semantic meaning (TRUE = identical meaning; FALSE = opposite/contradicts; NOT GIVEN = no statement made).',
    traps: [
      'Absolute qualifiers (always, never, all, solely, only) vs hedged text (often, typically, largely)',
      'Comparative traps (more than, less than when passage discusses both items without comparing them)',
      'Extrapolation trap: using personal knowledge to assume information not explicitly stated in the text'
    ],
    synonymPairs: [
      { promptWord: 'completely removed', passageWord: 'utterly eliminated' },
      { promptWord: 'inevitable consequence', passageWord: 'unavoidable outcome' },
      { promptWord: 'substantial increase', passageWord: 'marked surge' },
      { promptWord: 'prior to', passageWord: 'preceding' }
    ],
    tips: [
      'Never use outside knowledge. If you cannot point to a sentence that contradicts the statement, it is NOT GIVEN.',
      'Statements follow passage order. If you found Q1 in paragraph 2 and Q3 in paragraph 4, Q2 must be in paragraph 2, 3, or early 4.',
      'Watch for modal shifts: "may contribute" in passage vs "is responsible for" in statement makes it FALSE.'
    ]
  },
  {
    id: 'rd-02',
    skill: 'Reading',
    title: 'Yes / No / Not Given (Y/N/NG)',
    sectionRef: 'Sec 15: Academic Reading Specific Question Strategy (Lectures 113, 114, 116-120)',
    formula: 'Step 1: Isolate author stance / claim (not empirical facts) -> Step 2: Locate writer\'s voice in passage -> Step 3: Match stance (YES = agrees with writer\'s opinion; NO = contradicts writer\'s opinion; NOT GIVEN = writer expresses no view).',
    traps: [
      'Distinguishing between reported researcher findings vs the author\'s personal argumentation',
      'Neutral reporting traps: passage describes a controversy without taking a side, making strong statements NOT GIVEN',
      'Confusing absence of evidence with disagreement'
    ],
    synonymPairs: [
      { promptWord: 'writer believes', passageWord: 'in our estimation' },
      { promptWord: 'overstated', passageWord: 'exaggerated claims' },
      { promptWord: 'misguided approach', passageWord: 'flawed methodology' },
      { promptWord: 'unjustified', passageWord: 'lacks empirical foundation' }
    ],
    tips: [
      'Look for attitude markers: "regrettably", "it is naively assumed", "one might argue", "clearly".',
      'Apply the exact same logical truth table as T/F/NG, but focus on subjectivity and intent.',
      'If the writer quotes another scholar\'s view and does not endorse it, do not attribute it to the writer.'
    ]
  },
  {
    id: 'rd-03',
    skill: 'Reading',
    title: 'Matching Headings',
    sectionRef: 'Sec 15: Academic Reading Specific Question Strategy (Lectures 166-171)',
    formula: 'Step 1: Read heading list first, circling contrasting focus words -> Step 2: Skim paragraph first 1-2 sentences and concluding sentence -> Step 3: Match overarching central concept -> Step 4: Eliminate used headings.',
    traps: [
      'Detail traps: a heading mentioning a specific word or statistic that only appears in one subordinate clause',
      'Distractor headings with similar wording but opposite scope (e.g. general vs specific)',
      'Spending too long on ambiguous paragraphs before solving the straightforward ones'
    ],
    synonymPairs: [
      { promptWord: 'financial constraints', passageWord: 'budgetary limitations' },
      { promptWord: 'environmental footprint', passageWord: 'ecological impact' },
      { promptWord: 'historical evolution', passageWord: 'chronological development' },
      { promptWord: 'commercial viability', passageWord: 'market profitability' }
    ],
    tips: [
      'A heading summarizes the entire paragraph, not just an interesting detail or opening hook.',
      'Start with the easiest and most distinct paragraphs first to eliminate heading choices rapidly.',
      'Check the concluding sentence: writers often pivot ("However...") right before finishing a paragraph.'
    ]
  },
  {
    id: 'rd-04',
    skill: 'Reading',
    title: 'Matching Information (Paragraph Location)',
    sectionRef: 'Sec 15: Academic Reading Specific Question Strategy (Lectures 160-165)',
    formula: 'Step 1: Parse functional stem ("a reference to...", "a description of...", "an explanation of...") -> Step 2: Underline core category noun -> Step 3: Scan for communicative role across candidate paragraphs.',
    traps: [
      'NB instruction: "You may use any letter more than once" indicates at least one paragraph has multiple matches',
      'Questions do NOT follow passage order; jumping randomly without a structured mental map costs time',
      'Scanning for literal words instead of functional descriptions'
    ],
    synonymPairs: [
      { promptWord: 'description of the apparatus', passageWord: 'how the device is structured' },
      { promptWord: 'economic justification', passageWord: 'financial rationale' },
      { promptWord: 'future projection', passageWord: 'anticipated forecast' },
      { promptWord: 'reasons for reluctance', passageWord: 'factors causing hesitation' }
    ],
    tips: [
      'Complete this question set LAST within the passage after you already know the contents of each paragraph.',
      'Look for organizational signals: "description" = physical details; "explanation" = causal mechanics; "comparison" = contrast linkers.',
      'Mark paragraph themes in the margins as you read for other question types.'
    ]
  },
  {
    id: 'rd-05',
    skill: 'Reading',
    title: 'Matching Features (Categorization)',
    sectionRef: 'Sec 15: Academic Reading Specific Question Strategy (Lectures 157-159)',
    formula: 'Step 1: Scan passage to locate and highlight all named entities (researchers, organizations, years) -> Step 2: Read context immediately before and after each occurrence -> Step 3: Match with statements.',
    traps: [
      'A single researcher or entity may appear in 3 different paragraphs throughout the passage',
      'Early hypothesis vs later refuted conclusion by the same researcher',
      'Colleagues who co-authored a study having distinct viewpoints attributed in the text'
    ],
    synonymPairs: [
      { promptWord: 'demonstrated that', passageWord: 'provided empirical verification' },
      { promptWord: 'hypothesized', passageWord: 'posited the theory' },
      { promptWord: 'challenged earlier beliefs', passageWord: 'disproved conventional consensus' }
    ],
    tips: [
      'Capital letters and numbers make named entities easy to spot during initial skimming.',
      'Read from the name backward to the start of the sentence and forward to the period.',
      'If an entity appears multiple times, review all occurrences before finalizing your match.'
    ]
  },
  {
    id: 'rd-06',
    skill: 'Reading',
    title: 'Matching Sentence Endings',
    sectionRef: 'Sec 15: Academic Reading Specific Question Strategy (Lectures 157-159)',
    formula: 'Step 1: Read incomplete sentence stem and identify target concept -> Step 2: Use grammatical parsing (agreement, tense, prepositional collocation) to eliminate incompatible endings -> Step 3: Verify semantic match in passage.',
    traps: [
      'Grammatically smooth endings that directly contradict passage facts',
      'Stems follow passage order, but endings are scrambled in random order',
      'Endings that borrow exact vocabulary from unrelated passage sections'
    ],
    synonymPairs: [
      { promptWord: 'precipitates', passageWord: 'triggers' },
      { promptWord: 'impedes progress', passageWord: 'stifles ongoing growth' },
      { promptWord: 'hastens adoption', passageWord: 'accelerates widespread uptake' }
    ],
    tips: [
      'Grammar filtering eliminates 30% to 50% of the choices before you even look back at the passage.',
      'Never select an ending that creates a grammatical error with the stem.',
      'Confirm the causal direction: does A cause B, or does B cause A?'
    ]
  },
  {
    id: 'rd-07',
    skill: 'Reading',
    title: 'Multiple Choice (Standard Single Choice)',
    sectionRef: 'Sec 15: Academic Reading Specific Question Strategy (Lectures 145-149)',
    formula: 'Step 1: Read question stem only (cover options A-D) -> Step 2: Locate target paragraph section -> Step 3: Formulate your own answer in your mind -> Step 4: Uncover options and eliminate 3 distractors.',
    traps: [
      'Distractor options using verbatim words from the passage lifted out of context',
      'Options that are factually true in real life but never stated in the text',
      'Inverted causality or incorrect degree (e.g. "totally" instead of "partially")'
    ],
    synonymPairs: [
      { promptWord: 'primary objective', passageWord: 'chief ambition' },
      { promptWord: 'unprecedented event', passageWord: 'novel phenomenon' },
      { promptWord: 'mitigate hazards', passageWord: 'curb potential risks' }
    ],
    tips: [
      'Treat options like a T/F/NG checklist: 3 options are FALSE or NOT GIVEN, and only 1 is TRUE.',
      'Do not read options first—doing so biases your mind toward attractive distractors.',
      'Questions follow passage order consistently.'
    ]
  },
  {
    id: 'rd-08',
    skill: 'Reading',
    title: 'Multiple Choice (Pick Multiple from List)',
    sectionRef: 'Sec 15: Academic Reading Specific Question Strategy (Lectures 154-156)',
    formula: 'Step 1: Check required count (e.g. TWO or THREE options) -> Step 2: Identify category boundaries in question stem -> Step 3: Scan passage and check off each candidate item.',
    traps: [
      'Selecting fewer or more options than instructed by the prompt',
      'Half-correct options: the action is right, but the beneficiary or timeframe is wrong',
      'Cluster traps: 2 correct answers might be separated by two full paragraphs'
    ],
    synonymPairs: [
      { promptWord: 'advantageous traits', passageWord: 'beneficial attributes' },
      { promptWord: 'criticisms voiced', passageWord: 'objections articulated' },
      { promptWord: 'protective protocols', passageWord: 'safety measures' }
    ],
    tips: [
      'Each chosen letter is worth 1 mark on your answer sheet.',
      'Mark selected choices clearly as you locate each one in the passage.',
      'If you cannot find the second answer, move on and re-check after finishing the passage.'
    ]
  },
  {
    id: 'rd-09',
    skill: 'Reading',
    title: 'Sentence Completion',
    sectionRef: 'Sec 15: Academic Reading Specific Question Strategy (Lectures 150-153)',
    formula: 'Step 1: Note word limit (e.g. NO MORE THAN TWO WORDS) -> Step 2: Predict grammatical part of speech and semantic field -> Step 3: Scan passage for synonym anchors -> Step 4: Extract verbatim words.',
    traps: [
      'Inflecting or changing word form (e.g. writing "analyzing" when passage says "analysis")',
      'Writing three words when the limit says NO MORE THAN TWO WORDS',
      'Including extra articles (a, an, the) that violate the word count'
    ],
    synonymPairs: [
      { promptWord: 'indispensable component', passageWord: 'essential ingredient' },
      { promptWord: 'precipitated by', passageWord: 'brought about by' },
      { promptWord: 'rapidly dwindling', passageWord: 'declining at a swift pace' }
    ],
    tips: [
      'Answers MUST come directly from the passage text with zero spelling changes.',
      'Check grammar: read your completed sentence with the word in place to ensure perfect syntax.',
      'Questions follow passage order.'
    ]
  },
  {
    id: 'rd-10',
    skill: 'Reading',
    title: 'Summary Completion',
    sectionRef: 'Sec 15: Academic Reading Specific Question Strategy (Lectures 133-135)',
    formula: 'Step 1: Skim summary heading and identify passage boundaries -> Step 2: Predict parts of speech for each numbered gap -> Step 3: Scan passage and extract exact words or match word bank synonyms.',
    traps: [
      'When a word bank (A-H) is supplied, bank words are SYNONYMS of passage words; do not write passage words',
      'Ignoring prepositions directly preceding or following the gap',
      'Assuming the summary covers the entire text when it often covers only 1-2 paragraphs'
    ],
    synonymPairs: [
      { promptWord: 'deterioration', passageWord: 'decay' },
      { promptWord: 'implemented', passageWord: 'put into effect' },
      { promptWord: 'widespread apprehension', passageWord: 'broad concern' }
    ],
    tips: [
      'Use collocations around the blank to predict the exact word form needed.',
      'If using a word bank, cross off letters as you assign them to avoid duplicate usage.',
      'Summary gaps usually follow passage order within the targeted passage segment.'
    ]
  },
  {
    id: 'rd-11',
    skill: 'Reading',
    title: 'Table Completion',
    sectionRef: 'Sec 15: Academic Reading Specific Question Strategy (Lectures 142-144)',
    formula: 'Step 1: Read row and column headers to understand the categorization matrix -> Step 2: Trace coordinates for the target blank -> Step 3: Locate parallel table structure in passage -> Step 4: Extract verbatim word(s).',
    traps: [
      'Misreading row vs column alignment',
      'Confusing units (e.g. metric vs imperial, currency symbols) already printed in the header',
      'Failing to recognize that table entries summarize sequential or comparative findings'
    ],
    synonymPairs: [
      { promptWord: 'longevity', passageWord: 'lifespan' },
      { promptWord: 'habitat', passageWord: 'natural ecosystem' },
      { promptWord: 'nutritional intake', passageWord: 'dietary profile' }
    ],
    tips: [
      'Use adjacent filled cells in the table as navigational anchors to pinpoint text paragraphs.',
      'Check whether the table is organized chronologically or by category.',
      'Adhere strictly to the word limit stated in the rubric.'
    ]
  },
  {
    id: 'rd-12',
    skill: 'Reading',
    title: 'Flow-Chart Completion',
    sectionRef: 'Sec 15: Academic Reading Specific Question Strategy (Lectures 136-137)',
    formula: 'Step 1: Trace arrow directions and step numbers -> Step 2: Identify sequence signposts (first, subsequently, following this, finally) -> Step 3: Extract sequential terms verbatim.',
    traps: [
      'Reverse-order descriptions in the text (e.g. "Step B is preceded by Step A")',
      'Skipping an intermediate step described parenthetically in the passage',
      'Overlooking passive constructions describing automated processes'
    ],
    synonymPairs: [
      { promptWord: 'thermal processing', passageWord: 'heating phase' },
      { promptWord: 'purification', passageWord: 'filtration' },
      { promptWord: 'storage', passageWord: 'containment' }
    ],
    tips: [
      'Flow charts follow a strict chronological or procedural sequence.',
      'Use the preceding box and following box terms to bound your search area in the text.',
      'Ensure the grammatical form fits the flowchart box style (e.g. gerund vs bare noun).'
    ]
  },
  {
    id: 'rd-13',
    skill: 'Reading',
    title: 'Diagram Label Completion',
    sectionRef: 'Sec 15: Academic Reading Specific Question Strategy (Lectures 138-141)',
    formula: 'Step 1: Examine physical layout (top, bottom, interior, exterior, arrows) -> Step 2: Scan for spatial and structural nouns -> Step 3: Match spatial labels to technical terms in text.',
    traps: [
      'Directional disorientation (inlet vs outlet, upper vs lower valve)',
      'Spelling errors in technical or scientific terminology copied from the passage',
      'Confusing the container name with the substance inside it'
    ],
    synonymPairs: [
      { promptWord: 'external membrane', passageWord: 'outer layer' },
      { promptWord: 'intake regulator', passageWord: 'control valve' },
      { promptWord: 'reinforcing framework', passageWord: 'support structure' }
    ],
    tips: [
      'Look for spatial language: "adjacent to", "suspended from", "at the base of", "flanked by".',
      'Copy spelling with 100% precision from the text.',
      'Note whether labels require singular or plural nouns based on the diagram pointers.'
    ]
  },
  {
    id: 'rd-14',
    skill: 'Reading',
    title: 'Short Answer Questions',
    sectionRef: 'Sec 15: Academic Reading Specific Question Strategy (Lectures 123-126)',
    formula: 'Step 1: Parse interrogative word (Who, What, Where, When, How much) to determine datum type -> Step 2: Underline question keywords -> Step 3: Scan text and extract concise verbatim answer.',
    traps: [
      'Writing complete sentences when only a concise 1-3 word phrase is required',
      'Including unnecessary words like prepositions or articles that push the answer over the limit',
      'Answering with numbers in words when figures are preferred or vice versa'
    ],
    synonymPairs: [
      { promptWord: 'primary catalyst', passageWord: 'fundamental cause' },
      { promptWord: 'estimated timeframe', passageWord: 'approximate duration' },
      { promptWord: 'annual expenditure', passageWord: 'yearly spending' }
    ],
    tips: [
      'Questions strictly follow passage order.',
      'If you find the answer to Q2 in paragraph 3, Q3 cannot appear in paragraph 1 or 2.',
      'Write only the precise answer; extra words waste time and risk word-limit disqualification.'
    ]
  },

  // ==========================================
  // LISTENING MODULE (Sec 4-12)
  // ==========================================
  {
    id: 'ls-01',
    skill: 'Listening',
    title: 'Distractors, Negations & Oral Self-Corrections',
    sectionRef: 'Sec 4-7: Listening Tactics & Traps',
    formula: 'Rule: The first number, date, or name stated is almost always a distractor. Wait for the speaker to self-correct ("Actually...", "No, wait...", "I thought so, but...") before recording your final answer.',
    traps: [
      'Preliminary offers contradicted by later constraints',
      'Distractor dates and telephone digits spoken in quick succession',
      'Qualifiers: "mostly", "usually", "with the exception of"'
    ],
    synonymPairs: [
      { promptWord: 'approximate cost', passageWord: 'around eighty pounds' },
      { promptWord: 'rescheduled to', passageWord: 'moved forward to' },
      { promptWord: 'compulsory requirement', passageWord: 'mandatory prerequisite' }
    ],
    tips: [
      'Underline keywords during the 30-45 second prep time before each section.',
      'Never write down a value immediately if the conversation feels unfinished.',
      'If you miss a question, abandon it instantly to protect the next three.'
    ]
  },
  {
    id: 'ls-02',
    skill: 'Listening',
    title: 'Map & Plan Navigation',
    sectionRef: 'Sec 8: Listening Map/Diagram Navigation',
    formula: 'Step 1: Anchor starting point ("You are standing here at the entrance") -> Step 2: Establish compass bearings (North/South/East/West) and clock directions -> Step 3: Track speaker path step-by-step.',
    traps: [
      'Confusing "to your left" with "on the western boundary"',
      'Assuming the path starts where the question labels are located',
      'Overlooking landmarks mentioned purely as navigational reference points'
    ],
    synonymPairs: [
      { promptWord: 'adjacent to', passageWord: 'right next to' },
      { promptWord: 'opposite', passageWord: 'facing directly across' },
      { promptWord: 'in the corner', passageWord: 'tucked away at the junction' }
    ],
    tips: [
      'Keep your pen or cursor physically moving along the diagram as the guide speaks.',
      'Listen for directional signposts: "turn right past the fountain", "take the second exit".',
      'Check whether the map has a printed compass rose or left/right orientation.'
    ]
  },
  {
    id: 'ls-03',
    skill: 'Listening',
    title: 'Spelling, Numbers & Exact-Word Verification',
    sectionRef: 'Sec 9-12: Form Completion & Section 4 Monologues',
    formula: 'Constraint: Write EXACT words heard from the audio. Zero inflection changes. No added plurals, no converted tenses.',
    traps: [
      'Double letter pronunciation: "double-L", "double-E"',
      'Number confusion: 14 vs 40, 15 vs 50, 0 pronounced as "oh" or "zero"',
      'Including units already printed on the question sheet ($ or %)'
    ],
    synonymPairs: [
      { promptWord: 'profession', passageWord: 'occupation' },
      { promptWord: 'contact details', passageWord: 'telephone and postal address' }
    ],
    tips: [
      'In Section 4, there is NO mid-section pause; read all 10 questions in the opening prep window.',
      'Follow thematic transition signposts: "Now turning to...", "Another consideration is...".',
      'Check plurals carefully: singular vs plural errors cost full marks.'
    ]
  },

  // ==========================================
  // WRITING TASK 1 MODULE (Sec 24-25)
  // ==========================================
  {
    id: 'wt1-01',
    skill: 'Writing Task 1',
    title: 'Task 1 Visual Architecture & The 2-Sentence Overview',
    sectionRef: 'Sec 24: Academic Task 1 Strategy & Formulas',
    formula: 'Structure: Paragraph 1 (Paraphrased Prompt) + Paragraph 2 (2-Sentence Overview with ZERO raw figures) + Paragraph 3 (Body 1: Dominant Group) + Paragraph 4 (Body 2: Secondary Group). Minimum 150 words.',
    traps: [
      'Listing raw numbers in the overview (overview must state broad trends/contrasts only)',
      'Describing every single data point like a robot instead of selecting key features',
      'Tense inconsistency (mixing past and future projections)'
    ],
    synonymPairs: [
      { promptWord: 'shows', passageWord: 'illustrates / depicts / reveals' },
      { promptWord: 'proportion', passageWord: 'percentage / share / fraction' },
      { promptWord: 'rose significantly', passageWord: 'experienced a marked surge' }
    ],
    tips: [
      'Without a clear overview, Task Achievement cannot exceed Band 5.0.',
      'Sentence 1 of overview: major trend or highest point; Sentence 2: contrasting trend or anomaly.',
      'Select 4-6 key data points and group by trajectory or category.'
    ]
  },
  {
    id: 'wt1-02',
    skill: 'Writing Task 1',
    title: 'Process & Map Descriptions',
    sectionRef: 'Sec 25: Process Diagrams & Comparative Maps',
    formula: 'Process Formula: Passive voice ("is transferred", "are processed") + Sequential linkers (initially, subsequently, following this, ultimately) + Overview identifying total stages and cyclic/linear nature.',
    traps: [
      'Using active voice for automated factory steps ("workers pack" vs "goods are packaged")',
      'Forgetting the overview in maps or processes',
      'Map orientation errors: failing to use compass directions (northward, eastern flank)'
    ],
    synonymPairs: [
      { promptWord: 'demolished', passageWord: 'knocked down / razed to make way for' },
      { promptWord: 'constructed', passageWord: 'erected / developed' },
      { promptWord: 'transformed', passageWord: 'repurposed / remodeled' }
    ],
    tips: [
      'Count the total number of stages in the process and state it in the overview.',
      'For maps, contrast "before and after" across two distinct body paragraphs.',
      'Use prepositions of location: "to the north of", "adjacent to the former site".'
    ]
  },

  // ==========================================
  // WRITING TASK 2 MODULE (Sec 28-29)
  // ==========================================
  {
    id: 'wt2-01',
    skill: 'Writing Task 2',
    title: 'The 4-Sentence Body Paragraph Architecture',
    sectionRef: 'Sec 28: Keino Campbell Unified Organization Method',
    formula: 'Sentence 1 (Topic Claim) -> Sentence 2 (Causal Explanation: mechanism/why) -> Sentence 3 (Concrete Evidence: specific exemplar) -> Sentence 4 (Concluding Impact: link to thesis). Exactly 4 sentences, 80-110 words.',
    traps: [
      'Listing multiple undeveloped ideas instead of developing one single main idea deeply',
      'Vague examples ("many people think this") instead of concrete exemplars',
      'Forgetting to link the concluding sentence back to the essay prompt'
    ],
    synonymPairs: [
      { promptWord: 'for example', passageWord: 'for instance / a case in point / specifically' },
      { promptWord: 'because', passageWord: 'since / as a consequence of / owing to the fact that' },
      { promptWord: 'therefore', passageWord: 'consequently / thus / as such' }
    ],
    tips: [
      'Two fully developed body paragraphs beat three shallow ones every time.',
      'Plan for 5 minutes, write for 30 minutes, review for 5 minutes.',
      'Keep average sentence length between 18 and 24 words for optimal syntactic clarity.'
    ]
  },
  {
    id: 'wt2-02',
    skill: 'Writing Task 2',
    title: '5 Discursive Essay Architectures',
    sectionRef: 'Sec 29: 5 Master Architectures (Opinion, Discuss, Adv/Disadv, Problem-Solution, Two-Part)',
    formula: 'Architecture Selection: 1. Opinion (Stance in intro, 2 supporting bodies) | 2. Discussion (Body 1 View A, Body 2 View B + opinion) | 3. Advantages/Disadvantages | 4. Problem-Solution | 5. Two-Part Question.',
    traps: [
      'Failing to address both views in a "Discuss both views and give your opinion" prompt',
      'Taking a middle stance without providing a clear, decisive thesis in the introduction',
      'Introducing brand-new arguments in the conclusion paragraph'
    ],
    synonymPairs: [
      { promptWord: 'I agree', passageWord: 'I firmly contend that / in my estimation' },
      { promptWord: 'advantages', passageWord: 'merits / beneficial ramifications' },
      { promptWord: 'problems', passageWord: 'predicaments / structural obstacles' }
    ],
    tips: [
      'State your position clearly in the introduction and reiterate it in the conclusion.',
      'Check that every prompt requirement is directly answered to secure Band 7+ Task Response.',
      'Aim for 270–300 words total for Task 2.'
    ]
  },

  // ==========================================
  // SPEAKING MODULE (Sec 30-35)
  // ==========================================
  {
    id: 'sp-01',
    skill: 'Speaking',
    title: 'Part 1: The 2-3 Sentence Formula',
    sectionRef: 'Sec 30: Speaking Part 1 Warm-up Strategy',
    formula: 'Formula: Direct Answer + Reason (Why) + Specific Detail / Example. Never answer with a single word or single short sentence; never deliver a memorized speech.',
    traps: [
      'One-word answers ("Yes.", "Not really.") that force examiner probing',
      'Speaking so long the examiner has to interrupt you',
      'Reciting robotic canned openings'
    ],
    synonymPairs: [
      { promptWord: 'I like', passageWord: 'I am particularly fond of / I gravitate toward' },
      { promptWord: 'often', passageWord: 'on a regular basis / more often than not' }
    ],
    tips: [
      'Answer directly in the first 3 seconds, then elaborate naturally.',
      'Mix past reflections with present preferences.',
      'Smile and maintain eye contact to project confident fluency.'
    ]
  },
  {
    id: 'sp-02',
    skill: 'Speaking',
    title: 'Part 2: 1-Minute Prep 4-Keyword Bullet Notepad Strategy',
    sectionRef: 'Sec 31-33: Cue Card Mastery',
    formula: 'Prep Strategy: Spend the 60 seconds writing exactly 4 keywords corresponding to the 4 prompt bullets. During monologue, speak for ~30 seconds per bullet point to hit 2 full minutes.',
    traps: [
      'Writing full sentences during the 60-second prep time instead of keywords',
      'Stopping after 1 minute 15 seconds (examiner will remain silent waiting for you to continue)',
      'Sticking rigidly to one bullet and running out of things to say'
    ],
    synonymPairs: [
      { promptWord: 'memorable occasion', passageWord: 'unforgettable milestone' },
      { promptWord: 'admirable person', passageWord: 'inspirational figure' }
    ],
    tips: [
      'Cover all four bullets on the card to ensure full task fulfillment.',
      'Use a grammatical blend: past background, present significance, conditional reflection.',
      'Speak until the examiner says "Thank you" to stop you at the 2-minute mark.'
    ]
  },
  {
    id: 'sp-03',
    skill: 'Speaking',
    title: 'Part 3: Analytical Reasoning & Societal Speculation',
    sectionRef: 'Sec 34-35: Abstract Discursive Analysis',
    formula: 'Formula: General Position ("From a broader perspective...") + Causal Analysis + Societal Exemplar + Contrast / Future Speculation. Shift focus from personal anecdotes to societal trends.',
    traps: [
      'Answering personal stories ("My brother and I...") instead of analyzing society at large',
      'Hesitating silently while searching for rare vocabulary',
      'Flat monotone delivery lacking prosodic stress'
    ],
    synonymPairs: [
      { promptWord: 'in my opinion', passageWord: 'from an analytical standpoint' },
      { promptWord: 'people nowadays', passageWord: 'contemporary society / modern citizens' }
    ],
    tips: [
      'Use natural conversational fillers: "That is an intriguing question", "Looking at it objectively".',
      'Self-correct smoothly when making grammar slips without abandoning the sentence.',
      'Structure answers with cohesive signposts: "On one hand...", "Conversely...".'
    ]
  },

  // ==========================================
  // CBT EXAM NAVIGATION (Sec 23)
  // ==========================================
  {
    id: 'cbt-01',
    skill: 'CBT Navigation',
    title: 'Computer-Based IELTS Navigation & Hotkeys',
    sectionRef: 'Sec 23: CBT Ergonomics & Interface Tactics',
    formula: 'Navigation Tactics: Split-screen divider positioning (50/50 or 60/40) + Text Highlighter (Right click / Popover) + Notepad + Review Matrix check before timer expiration.',
    traps: [
      'Highlighting too much text so the passage becomes visually cluttered',
      'Forgetting to verify unanswered items in the bottom 1-40 question palette',
      'Copy-paste formatting issues in the Writing module'
    ],
    synonymPairs: [
      { promptWord: 'flag for review', passageWord: 'mark question for later verification' },
      { promptWord: 'one skill retake', passageWord: 'OSR single module re-sit' }
    ],
    tips: [
      'Use Alt+N (Next), Alt+P (Previous), Alt+F (Flag) for rapid keyboard navigation.',
      'Type fill-in answers directly during Listening; do not wait until the end.',
      'Keep your eyes on the countdown timer badge as the 10-minute warning approaches.'
    ]
  }
];

function getAllCards(): StrategyCard[] {
  const mergedMap = new Map<string, StrategyCard>();
  
  // Seed with master course cards (contains 14 Reading, plus Listening, Writing, Speaking, CBT)
  for (const c of MASTER_COURSE_CARDS) {
    mergedMap.set(c.id, c);
  }

  // Merge any compiled cards from strategy.json if present
  if (Array.isArray(strategyData)) {
    for (const item of (strategyData as Partial<StrategyCard>[])) {
      if (!item.title) continue;
      const id = item.id || `json-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      const existing = mergedMap.get(id);
      if (existing) {
        mergedMap.set(id, {
          ...existing,
          ...item,
          tips: item.tips && item.tips.length ? item.tips : existing.tips,
          traps: item.traps && item.traps.length ? item.traps : existing.traps,
          formula: item.formula || existing.formula,
          synonymPairs: item.synonymPairs && item.synonymPairs.length ? item.synonymPairs : existing.synonymPairs
        } as StrategyCard);
      } else {
        mergedMap.set(id, {
          id,
          skill: item.skill || 'General',
          title: item.title,
          sectionRef: item.sectionRef,
          tips: item.tips || [],
          traps: item.traps || [],
          formula: item.formula,
          synonymPairs: item.synonymPairs || []
        });
      }
    }
  }

  return Array.from(mergedMap.values());
}

function matchesSkillFilter(cardSkill: string, filterId: string): boolean {
  if (filterId === 'all') return true;
  const c = cardSkill.toLowerCase();
  if (filterId === 'reading') return c.includes('reading');
  if (filterId === 'listening') return c.includes('listening');
  if (filterId === 'writing1' || filterId === 'writing t1') return c.includes('task 1') || (c.includes('writing') && !c.includes('task 2'));
  if (filterId === 'writing2' || filterId === 'writing t2') return c.includes('task 2');
  if (filterId === 'speaking') return c.includes('speaking');
  if (filterId === 'cbt') return c.includes('cbt') || c.includes('navigation');
  return c.includes(filterId.toLowerCase());
}

export interface TipItem {
  id: string;
  slug: string;
  title: string;
  skill: string;
  category: string;
  rating: number | null;
  votes: string;
  views: number;
  date: string;
  summary: string;
  headings: string[];
  content_text: string;
}

const ALL_TIPS: TipItem[] = tipsData as TipItem[];

export function strategyView(root: HTMLElement): () => void {
  const allCards = getAllCards();
  let currentSkillFilter = 'all';
  let searchQuery = '';

  root.innerHTML = '';
  root.append(
    h('h1', 'ie-title', 'IELTS Master Strategy & Knowledge Codex'),
    h(
      'p',
      'ie-lead',
      'The authoritative IELTS strategy compendium: 46 tactical exam blueprints from the Band 7+ master curriculum alongside 746 official articles & lessons from IELTS Online Tests.'
    )
  );

  // Master Mode Switcher
  const modeSwitcher = h('div', 'ie-mode-switcher');
  const btnBlueprints = h(
    'button',
    'ie-mode-btn is-active',
    `📐 46 Tactical Blueprints (Formulas & Traps)`
  );
  const btnVault = h(
    'button',
    'ie-mode-btn',
    `💡 746 IELTS Knowledge Vault & Tips Explorer`
  );
  modeSwitcher.append(btnBlueprints, btnVault);
  root.append(modeSwitcher);

  // Container 1: Blueprints (Existing 46 cards)
  const blueprintsContainer = h('div', 'ie-blueprints-container');

  // Top Controls Bar: Skill filter tabs + Search input
  const controlsBar = h('div', 'ie-strategy-controls');

  const filterTabs = h('div', 'ie-tabs ie-strategy-tabs');
  filterTabs.setAttribute('role', 'tablist');
  filterTabs.setAttribute('aria-label', 'Filter strategy by skill');

  const tabsConfig = [
    { id: 'all', label: 'All' },
    { id: 'reading', label: 'Reading (14 Types)' },
    { id: 'listening', label: 'Listening' },
    { id: 'writing1', label: 'Writing T1' },
    { id: 'writing2', label: 'Writing T2' },
    { id: 'speaking', label: 'Speaking' },
    { id: 'cbt', label: 'CBT Navigation' }
  ];

  tabsConfig.forEach(t => {
    const btn = h('button', `ie-tab ${t.id === currentSkillFilter ? 'is-on' : ''}`, esc(t.label));
    btn.setAttribute('role', 'tab');
    btn.setAttribute('data-filter', t.id);
    btn.setAttribute('aria-selected', t.id === currentSkillFilter ? 'true' : 'false');
    btn.addEventListener('click', () => {
      currentSkillFilter = t.id;
      filterTabs.querySelectorAll('.ie-tab').forEach(b => {
        const on = (b as HTMLElement).getAttribute('data-filter') === t.id;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      renderCards();
    });
    filterTabs.append(btn);
  });

  const searchBox = h('div', 'ie-search-box');
  const searchInput = h('input', 'ie-input ie-search') as HTMLInputElement;
  searchInput.type = 'search';
  searchInput.placeholder = 'Search formulas, traps, question types, or synonyms...';
  searchInput.setAttribute('aria-label', 'Search strategy cards');
  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value.trim().toLowerCase();
    renderCards();
  });
  searchBox.append(searchInput);

  const expandAllBtn = h('button', 'ie-btn ie-expand-all', 'Expand All Drawers');
  let allExpanded = false;
  expandAllBtn.addEventListener('click', () => {
    allExpanded = !allExpanded;
    expandAllBtn.textContent = allExpanded ? 'Collapse All Drawers' : 'Expand All Drawers';
    cardsGrid.querySelectorAll('.ie-strategy-card').forEach(cardEl => {
      cardEl.classList.toggle('is-open', allExpanded);
      const toggle = cardEl.querySelector('.ie-drawer-toggle');
      if (toggle) {
        toggle.setAttribute('aria-expanded', allExpanded ? 'true' : 'false');
        toggle.textContent = allExpanded ? 'Hide Details ▲' : 'Details & Formula ▼';
      }
    });
  });

  const actionsBar = h('div', 'ie-strategy-actions');
  actionsBar.append(searchBox, expandAllBtn);

  controlsBar.append(filterTabs, actionsBar);
  blueprintsContainer.append(controlsBar);

  const countBadge = h('div', 'ie-count-badge', '');
  blueprintsContainer.append(countBadge);

  const cardsGrid = h('div', 'ie-cards ie-strategy-grid');
  blueprintsContainer.append(cardsGrid);

  function renderCards(): void {
    cardsGrid.innerHTML = '';

    const filtered = allCards.filter(c => {
      const matchSkill = matchesSkillFilter(c.skill, currentSkillFilter);
      if (!matchSkill) return false;
      if (!searchQuery) return true;

      const titleMatch = c.title.toLowerCase().includes(searchQuery);
      const skillMatch = c.skill.toLowerCase().includes(searchQuery);
      const formulaMatch = c.formula ? c.formula.toLowerCase().includes(searchQuery) : false;
      const tipsMatch = c.tips.some(t => t.toLowerCase().includes(searchQuery));
      const trapsMatch = c.traps ? c.traps.some(tr => tr.toLowerCase().includes(searchQuery)) : false;
      const synMatch = c.synonymPairs
        ? c.synonymPairs.some(
            s => s.promptWord.toLowerCase().includes(searchQuery) || s.passageWord.toLowerCase().includes(searchQuery)
          )
        : false;

      return titleMatch || skillMatch || formulaMatch || tipsMatch || trapsMatch || synMatch;
    });

    countBadge.innerHTML = `Showing <b>${filtered.length}</b> strategy card${filtered.length === 1 ? '' : 's'}${
      currentSkillFilter !== 'all' ? ` in <em>${esc(currentSkillFilter)}</em>` : ''
    }${searchQuery ? ` matching "<em>${esc(searchQuery)}</em>"` : ''}`;

    if (!filtered.length) {
      cardsGrid.append(
        h(
          'div',
          'ie-empty-message',
          '<p class="ie-note">No strategy cards match your current filter and search query. Try switching skill tabs or clearing search.</p>'
        )
      );
      return;
    }

    filtered.forEach(c => {
      const card = h('article', 'ie-card ie-strategy-card');
      card.id = c.id;
      card.setAttribute('data-id', c.id);
      card.setAttribute('data-skill', c.skill);

      const header = h('div', 'ie-strategy-header');
      header.innerHTML = `
        <div class="ie-strategy-meta">
          <span class="ie-skill-badge">${esc(c.skill)}</span>
          ${c.sectionRef ? `<small class="ie-sec-ref">${esc(c.sectionRef)}</small>` : ''}
        </div>
        <h3 class="ie-strategy-title">${esc(c.title)}</h3>
      `;

      const formulaSnippet = c.formula
        ? `<div class="ie-formula-snippet"><code>${esc(c.formula)}</code></div>`
        : '';

      const toggleBtn = h('button', 'ie-btn ie-drawer-toggle', 'Details & Formula ▼');
      toggleBtn.setAttribute('aria-expanded', 'false');

      const drawer = h('div', 'ie-strategy-drawer');

      let formulaBlock = '';
      if (c.formula) {
        formulaBlock = `
          <div class="ie-drawer-section ie-section-formula">
            <h4>📐 Tactical Formula &amp; Step-by-Step Algorithm</h4>
            <div class="ie-formula-code">${esc(c.formula)}</div>
          </div>
        `;
      }

      let trapsBlock = '';
      if (c.traps && c.traps.length) {
        trapsBlock = `
          <div class="ie-drawer-section ie-section-traps">
            <h4>⚠️ Common Examiner Traps &amp; Distractors</h4>
            <ul class="ie-traps-list">
              ${c.traps.map(tr => `<li>${esc(tr)}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      let synBlock = '';
      if (c.synonymPairs && c.synonymPairs.length) {
        synBlock = `
          <div class="ie-drawer-section ie-section-synonyms">
            <h4>🔄 Exam Synonym Mapping Engine</h4>
            <div class="ie-table-wrap">
              <table class="ie-table ie-synonym-table">
                <thead>
                  <tr>
                    <th>Prompt / Question Phrase</th>
                    <th>Passage / Audio Counterpart</th>
                  </tr>
                </thead>
                <tbody>
                  ${c.synonymPairs
                    .map(
                      sp =>
                        `<tr><td><code>${esc(sp.promptWord)}</code></td><td><code>${esc(sp.passageWord)}</code></td></tr>`
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      }

      const tipsBlock = `
        <div class="ie-drawer-section ie-section-tips">
          <h4>💡 Actionable Execution Tips</h4>
          <ul class="ie-tips-list">
            ${c.tips.map(t => `<li>${esc(t)}</li>`).join('')}
          </ul>
        </div>
      `;

      drawer.innerHTML = formulaBlock + trapsBlock + synBlock + tipsBlock;

      function toggleOpen(e?: Event): void {
        if (e) e.stopPropagation();
        const isOpen = card.classList.toggle('is-open');
        toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        toggleBtn.textContent = isOpen ? 'Hide Details ▲' : 'Details & Formula ▼';
      }

      toggleBtn.addEventListener('click', toggleOpen);
      header.addEventListener('click', () => toggleOpen());
      card.addEventListener('click', e => {
        if (e.target === card) toggleOpen(e);
      });

      card.append(header, h('div', '', formulaSnippet), toggleBtn, drawer);
      cardsGrid.append(card);
    });
  }

  // ==========================================
  // CONTAINER 2: 746 TIPS VAULT & EXPLORER
  // ==========================================
  const vaultContainer = h('div', 'ie-vault-container');
  vaultContainer.style.display = 'none';

  let vaultSkill = 'all';
  let vaultQuery = '';
  let vaultSort = 'views'; // 'views' | 'rating' | 'date'
  let vaultLimit = 24;

  const vaultControls = h('div', 'ie-tips-controls');

  // Top search & sort row
  const barTop = h('div', 'ie-tips-bar-top');
  const searchWrap = h('div', 'ie-tips-search-wrap');
  const vSearchInput = h('input', 'ie-tips-search') as HTMLInputElement;
  vSearchInput.type = 'search';
  vSearchInput.placeholder = 'Search 746 tips, rules, essays, or grammar lessons...';
  vSearchInput.setAttribute('aria-label', 'Search IELTS Tips');
  const searchIcon = h('span', 'ie-tips-search-icon', '🔍');
  searchWrap.append(searchIcon, vSearchInput);

  const sortSelect = h('select', 'ie-tips-sort') as HTMLSelectElement;
  sortSelect.setAttribute('aria-label', 'Sort tips');
  sortSelect.innerHTML = `
    <option value="views">🔥 Most Popular (Views)</option>
    <option value="rating">⭐ Highest Rated</option>
    <option value="date">📅 Newest Added</option>
  `;

  barTop.append(searchWrap, sortSelect);

  // Skill filter chips
  const chipsRow = h('div', 'ie-tips-chips');
  const skillChips = [
    { id: 'all', label: 'All', icon: '🌐' },
    { id: 'Writing', label: 'Writing', icon: '✍️' },
    { id: 'Grammar', label: 'Grammar 101', icon: '🏛️' },
    { id: 'Vocabulary', label: 'Vocabulary', icon: '📚' },
    { id: 'Speaking', label: 'Speaking', icon: '🎙️' },
    { id: 'Reading', label: 'Reading', icon: '📖' },
    { id: 'Listening', label: 'Listening', icon: '🎧' },
    { id: 'General & Strategies', label: 'General & Strategies', icon: '🧭' }
  ];

  function renderChips(): void {
    chipsRow.innerHTML = '';
    skillChips.forEach(sc => {
      const count =
        sc.id === 'all'
          ? ALL_TIPS.length
          : ALL_TIPS.filter(t => t.skill === sc.id).length;
      const chip = h(
        'button',
        `ie-tips-chip ${vaultSkill === sc.id ? 'is-active' : ''}`,
        `<span>${sc.icon}</span> <span>${esc(sc.label)}</span> <span class="ie-tips-chip-count">${count}</span>`
      );
      chip.addEventListener('click', () => {
        vaultSkill = sc.id;
        vaultLimit = 24;
        renderChips();
        renderVault();
      });
      chipsRow.append(chip);
    });
  }

  vaultControls.append(barTop, chipsRow);
  vaultContainer.append(vaultControls);

  const vaultStats = h('div', 'ie-count-badge', '');
  vaultContainer.append(vaultStats);

  const vaultGrid = h('div', 'ie-tips-grid');
  vaultContainer.append(vaultGrid);

  const loadMoreBtn = h('button', 'ie-btn ie-btn-primary', 'Load More Strategies (24+)');
  loadMoreBtn.style.margin = 'var(--space-16) auto';
  loadMoreBtn.style.display = 'block';
  loadMoreBtn.addEventListener('click', () => {
    vaultLimit += 24;
    renderVault();
  });
  vaultContainer.append(loadMoreBtn);

  // Reading Modal Element
  const modalOverlay = h('div', 'ie-tip-modal-overlay');
  const modalBox = h('div', 'ie-tip-modal-box');
  const modalHeader = h('div', 'ie-tip-modal-header');
  const modalTitle = h('h3', '', 'Strategy Guide');
  modalTitle.style.margin = '0';
  modalTitle.style.fontSize = 'var(--text-lg)';
  const closeBtn = h('button', 'ie-tip-modal-close', '✕');
  closeBtn.setAttribute('aria-label', 'Close modal');
  modalHeader.append(modalTitle, closeBtn);

  const modalBody = h('div', 'ie-tip-modal-body');
  modalBox.append(modalHeader, modalBody);
  modalOverlay.append(modalBox);
  root.append(modalOverlay);

  function closeModal(): void {
    modalOverlay.classList.remove('is-active');
    if (ttsAvailable()) speechSynthesis.cancel();
  }

  closeBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('is-active')) {
      closeModal();
    }
  });

  function openTipDetail(tip: TipItem): void {
    modalTitle.textContent = tip.title;
    modalBody.innerHTML = '';

    const metaRow = h('div', 'ie-tip-meta-header');
    metaRow.innerHTML = `
      <div style="display:flex; gap: var(--space-8); align-items:center;">
        <span class="ie-skill-badge ie-skill-${esc(tip.skill.split(' ')[0])}">${esc(tip.skill)}</span>
        <span style="font-size: var(--text-xs); color: var(--ink-muted);">${esc(tip.category)}</span>
      </div>
      <div style="font-size: var(--text-xs); color: var(--ink-muted);">
        👁️ ${tip.views.toLocaleString()} views ${tip.rating ? `· ⭐ ${tip.rating} (${esc(tip.votes)})` : ''} · 📅 ${esc(tip.date)}
      </div>
    `;

    const audioRow = h('div', '', '');
    if (ttsAvailable()) {
      const listenBtn = h('button', 'ie-btn', '🔊 Listen to Audio Lesson (en-GB)');
      listenBtn.addEventListener('click', () => {
        speechSynthesis.cancel();
        const textToRead = `${tip.title}. ${tip.summary}. ${tip.content_text.slice(0, 1500)}`;
        const u = new SpeechSynthesisUtterance(textToRead);
        u.lang = 'en-GB';
        u.rate = 0.95;
        speechSynthesis.speak(u);
      });
      audioRow.append(listenBtn);
    }

    const summaryBox = h('div', 'ie-tipcard', `
      <div style="padding: var(--space-12); background: rgba(56, 189, 248, 0.08); border-left: 3px solid var(--accent-cyan); border-radius: 8px; margin: var(--space-12) 0;">
        <b style="color: var(--accent-cyan);">Executive Key Takeaways:</b>
        <p style="margin-top: var(--space-6); color: var(--ink-primary);">${esc(tip.summary)}</p>
      </div>
    `);

    // Format full article content
    const contentEl = h('div', 'ie-tip-full-content');
    const paras = tip.content_text.split(/\n\n+/);
    paras.forEach(p => {
      const trimmed = p.trim();
      if (!trimmed) return;
      if (trimmed.length < 80 && !trimmed.endsWith('.')) {
        contentEl.append(h('h3', '', esc(trimmed)));
      } else {
        contentEl.append(h('p', '', esc(trimmed)));
      }
    });

    modalBody.append(metaRow, audioRow, summaryBox, contentEl);
    modalOverlay.classList.add('is-active');
  }

  function renderVault(): void {
    vaultGrid.innerHTML = '';

    let filtered = ALL_TIPS.filter(t => {
      if (vaultSkill !== 'all' && t.skill !== vaultSkill) return false;
      if (!vaultQuery) return true;
      const q = vaultQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.headings.some(h => h.toLowerCase().includes(q))
      );
    });

    // Sort
    if (vaultSort === 'views') {
      filtered.sort((a, b) => b.views - a.views);
    } else if (vaultSort === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (vaultSort === 'date') {
      filtered.sort((a, b) => (b.date > a.date ? 1 : -1));
    }

    const totalViewsInFilter = filtered.reduce((acc, it) => acc + it.views, 0);
    vaultStats.innerHTML = `Displaying <b>${Math.min(vaultLimit, filtered.length)}</b> of <b>${filtered.length}</b> articles ${
      vaultSkill !== 'all' ? `in <em>${esc(vaultSkill)}</em>` : ''
    } · Cumulative views: <b>${totalViewsInFilter.toLocaleString()}</b>`;

    if (!filtered.length) {
      vaultGrid.append(
        h(
          'div',
          'ie-empty-message',
          '<p class="ie-note">No articles match your current search. Try clearing keywords or selecting "All".</p>'
        )
      );
      loadMoreBtn.style.display = 'none';
      return;
    }

    const batch = filtered.slice(0, vaultLimit);
    batch.forEach(tip => {
      const card = h('article', 'ie-card ie-tip-vault-card');
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');

      const metaHeader = h('div', 'ie-tip-meta-header');
      const skillClass = `ie-skill-${esc(tip.skill.split(' ')[0])}`;
      metaHeader.innerHTML = `
        <span class="ie-skill-badge ${skillClass}">${esc(tip.skill)}</span>
        <span class="ie-tip-views">👁️ ${tip.views > 9999 ? (tip.views / 1000).toFixed(1) + 'k' : tip.views} views</span>
      `;

      const titleEl = h('h3', 'ie-tip-card-title', esc(tip.title));
      const summaryEl = h('p', 'ie-tip-card-summary', esc(tip.summary));

      const footer = h('div', 'ie-tip-card-footer');
      footer.innerHTML = `
        <span style="color: var(--ink-muted); font-size: var(--text-2xs);">${
          tip.rating ? `⭐ ${tip.rating.toFixed(1)} (${esc(tip.votes)})` : esc(tip.date)
        }</span>
        <span class="ie-tip-read-btn">Read Full Guide →</span>
      `;

      card.append(metaHeader, titleEl, summaryEl, footer);

      card.addEventListener('click', () => openTipDetail(tip));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openTipDetail(tip);
        }
      });

      vaultGrid.append(card);
    });

    loadMoreBtn.style.display = vaultLimit < filtered.length ? 'block' : 'none';
  }

  // Switcher event handlers
  btnBlueprints.addEventListener('click', () => {
    btnBlueprints.classList.add('is-active');
    btnVault.classList.remove('is-active');
    blueprintsContainer.style.display = 'block';
    vaultContainer.style.display = 'none';
  });

  btnVault.addEventListener('click', () => {
    btnVault.classList.add('is-active');
    btnBlueprints.classList.remove('is-active');
    blueprintsContainer.style.display = 'none';
    vaultContainer.style.display = 'block';
    renderChips();
    renderVault();
  });

  vSearchInput.addEventListener('input', () => {
    vaultQuery = vSearchInput.value.trim();
    vaultLimit = 24;
    renderVault();
  });

  sortSelect.addEventListener('change', () => {
    vaultSort = sortSelect.value;
    renderVault();
  });

  root.append(blueprintsContainer, vaultContainer);

  renderCards();

  return () => {
    if (ttsAvailable()) speechSynthesis.cancel();
  };
}
