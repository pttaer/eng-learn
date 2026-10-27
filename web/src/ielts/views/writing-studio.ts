import { countdown, esc, fmtTime, h } from '../ui';
import { validateFourSentenceParagraph, ParagraphEvaluation } from '../writing-heuristics';
import { icon } from '../../utils/icons';
import { HapticEngine } from '../../core/haptic-engine';
import { AudioSynthesizer } from '../../core/audio-synthesizer';
import { t } from '../../core/i18n';

export interface DiffWordToken {
  type: 'match' | 'insert' | 'delete';
  value: string;
}

/**
 * Myers LCS-based word-level diff tokenizer.
 * Compares candidate user essay against the benchmark Band 8.5 model essay.
 */
export function computeWordDiff(target: string, candidate: string): DiffWordToken[] {
  const tWords = target.trim().split(/\s+/).filter(Boolean);
  const cWords = candidate.trim().split(/\s+/).filter(Boolean);
  const m = tWords.length;
  const n = cWords.length;

  const dp = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (tWords[i - 1].toLowerCase() === cWords[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const tokens: DiffWordToken[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && tWords[i - 1].toLowerCase() === cWords[j - 1].toLowerCase()) {
      tokens.unshift({ type: 'match', value: cWords[j - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      tokens.unshift({ type: 'insert', value: cWords[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      tokens.unshift({ type: 'delete', value: tWords[i - 1] });
      i--;
    }
  }

  return tokens;
}

export interface OverviewValidation {
  valid: boolean;
  hasNumbers: boolean;
  sentenceCount: number;
  hasTrend: boolean;
  hasContrast: boolean;
  feedback: string[];
}

/**
 * Strict Task 1 Overview Validator:
 * Enforces: Exactly 2 sentences, ZERO raw numbers/percentages, 1 key trend + 1 key contrast.
 */
export function validateTask1Overview(text: string): OverviewValidation {
  const clean = text.trim();
  if (!clean) {
    return {
      valid: false,
      hasNumbers: false,
      sentenceCount: 0,
      hasTrend: false,
      hasContrast: false,
      feedback: ['Please write an overview paragraph.']
    };
  }

  const sentences = clean.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;

  const numberMatches = clean.match(/\b\d+([.,]\d+)?\b|%/g) || [];
  const hasNumbers = numberMatches.length > 0;

  const TREND_MARKERS =
    /\b(overall|overall trend|general trend|experience(d)?|witness(ed)?|saw|upward|downward|increas(e|ed|ing)|decreas(e|ed|ing)|growth|declin(e|ed|ing)|ris(e|ing)|fell|highest|lowest|dominant|predominant|most significant|remained|throughout)\b/i;
  const hasTrend = TREND_MARKERS.test(clean);

  const CONTRAST_MARKERS =
    /\b(in contrast|by contrast|in stark contrast|conversely|on the other hand|whereas|while|whilst|however|although|differed|anomaly|exception|at the other extreme)\b/i;
  const hasContrast = CONTRAST_MARKERS.test(clean);

  const feedback: string[] = [];
  if (hasNumbers) {
    feedback.push(
      `⚠️ Rule Violation: Detected raw numbers (${numberMatches.slice(0, 3).join(', ')}). An IELTS overview must contain ZERO raw numbers or percentages. Save all data figures for body paragraphs!`
    );
  } else {
    feedback.push('✓ Zero Raw Numbers Rule: Compliant! No raw numerical data cited.');
  }

  if (sentenceCount === 2) {
    feedback.push('✓ Sentence Count: Exactly 2 sentences (1 major trend + 1 key contrast).');
  } else {
    feedback.push(
      `Sentence Count: ${sentenceCount} sentence(s). Aim for exactly 2 sentences: one for the major trend and one for the contrasting feature.`
    );
  }

  if (hasTrend) {
    feedback.push('✓ Key Trend identified.');
  } else {
    feedback.push('Missing Key Trend: State the dominant or overarching trajectory across the visual.');
  }

  if (hasContrast) {
    feedback.push('✓ Key Contrast / Anomaly identified.');
  } else {
    feedback.push('Missing Contrast: Include a contrasting feature or anomalous trajectory.');
  }

  const valid = !hasNumbers && sentenceCount >= 1 && sentenceCount <= 3 && hasTrend;

  return {
    valid,
    hasNumbers,
    sentenceCount,
    hasTrend,
    hasContrast,
    feedback
  };
}

export interface Task1VisualBlueprint {
  id: string;
  kind: 'line' | 'bar' | 'pie' | 'table' | 'process' | 'map';
  title: string;
  prompt: string;
  dataBrief: string;
  model: {
    intro: string;
    overview: string;
    body1: string;
    body2: string;
  };
  vocab: {
    verbs: string[];
    adverbs: string[];
    prepositions: string[];
    quantifiers: string[];
  };
}

export const TASK1_BLUEPRINTS: Task1VisualBlueprint[] = [
  {
    id: 't1-line',
    kind: 'line',
    title: 'Line Graph: Energy Consumption in Four Nations (1995–2025)',
    prompt:
      'The line graph below shows energy consumption across four industrial nations from 1995 to 2025, with projections to 2030. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    dataBrief:
      'USA started highest at 2100 million tonnes and grew slowly to 2450. China commenced at 900, surged dramatically to 3600 by 2020. India rose steadily from 500 to 1400. Germany remained stable around 300-350.',
    model: {
      intro:
        'The provided line graph illustrates the consumption of energy across four distinct industrialized nations over a thirty-year timeframe between 1995 and 2025, with anticipated projections through 2030, measured in millions of tonnes.',
      overview:
        'Overall, it is evident that China experienced the most dramatic expansion in energy utilization, ultimately overtaking all other surveyed countries to become the dominant consumer. In stark contrast, Germany demonstrated consistent stability throughout the period with the lowest overall consumption.',
      body1:
        'Regarding the primary consumers, energy usage in the United States began at 2,100 million tonnes in 1995 before climbing steadily to plateau around 2,450 million tonnes by 2025. Concurrently, China exhibited an exponential surge from an initial 900 million tonnes, surpassing the United States around 2010 to peak at an unprecedented 3,600 million tonnes.',
      body2:
        'By contrast, India recorded a moderate but continuous upward trajectory, rising from approximately 500 million tonnes in 1995 to roughly 1,400 million tonnes by the end of the survey. Conversely, Germany remained virtually unchanged, hovering between 300 and 350 million tonnes throughout the entire thirty-year duration.'
    },
    vocab: {
      verbs: ['surged', 'climbed steadily', 'plateaued', 'overtook', 'hovered around', 'plummeted'],
      adverbs: ['exponentially', 'dramatically', 'consistently', 'virtually', 'substantially'],
      prepositions: ['rose to 3,600', 'increased by 500', 'commenced at', 'peaked at', 'stood at'],
      quantifiers: ['the vast majority', 'an unprecedented level', 'the dominant consumer', 'roughly two-fold']
    }
  },
  {
    id: 't1-bar',
    kind: 'bar',
    title: 'Bar Chart: Tertiary Enrollment Across Five Disciplines (2010 vs 2022)',
    prompt:
      'The bar chart compares student enrollment figures across five university faculties in 2010 and 2022. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    dataBrief:
      'STEM grew from 14,000 to 28,000 students (doubled). Business climbed from 18,000 to 22,000. Humanities dropped from 15,000 to 9,000. Medicine rose slightly from 8,000 to 9,500. Education dropped from 7,000 to 5,000.',
    model: {
      intro:
        'The bar chart compares tertiary student enrollment numbers across five academic disciplines at a representative higher education institution between 2010 and 2022, measured in thousands of admitted students.',
      overview:
        'Overall, STEM disciplines experienced the most pronounced growth over the twelve-year period, effectively doubling in student volume to become the leading faculty. In contrast, Humanities witnessed a sharp downward trajectory, falling from one of the highest enrollments to among the lowest.',
      body1:
        'In terms of the expanding faculties, STEM enrollments registered a dramatic escalation, doubling from 14,000 in 2010 to 28,000 in 2022. Business also maintained an upward momentum, commencing as the most popular course at 18,000 before rising moderately to reach 22,000 students.',
      body2:
        'Conversely, Humanities suffered a substantial contraction, plummeting from 15,000 down to 9,000 admissions by 2022. Medicine experienced modest expansion from 8,000 to 9,500, whilst Education contracted further from 7,000 to an institutional low of 5,000 students.'
    },
    vocab: {
      verbs: ['doubled', 'escalated', 'contracted', 'plummeted', 'maintained momentum', 'witnessed'],
      adverbs: ['moderately', 'sharply', 'substantially', 'effectively', 'conspicuously'],
      prepositions: ['climbed from 14,000 to 28,000', 'stood as the leading', 'dropped down to'],
      quantifiers: ['twice as many', 'the leading faculty', 'an institutional low', 'modest expansion']
    }
  },
  {
    id: 't1-pie',
    kind: 'pie',
    title: 'Pie Chart: Household Expenditure Breakdown (UK vs Australia)',
    prompt:
      'The pie charts compare the proportion of household spending across five expense categories in the United Kingdom and Australia in 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    dataBrief:
      'Housing was largest in both (32% UK, 35% AUS). Food/Groceries was 22% UK and 18% AUS. Transport was 16% UK and 20% AUS. Leisure was 18% UK and 15% AUS. Utilities was 12% UK and 12% AUS.',
    model: {
      intro:
        'The provided pie charts contrast the distribution of domestic household expenditures across five key budgetary sectors in the United Kingdom and Australia during the year 2020, expressed in percentages.',
      overview:
        'Overall, housing accounted for the single greatest expenditure share in both nations, representing over one third of total household outlay. In contrast, utility bills constituted the lowest expenditure proportion in both countries, displaying identical budget allocations.',
      body1:
        'Regarding the dominant expense categories, housing absorbed 32% of consumer budgets in the United Kingdom, compared to a slightly higher 35% in Australia. Food and grocery provisions formed the second largest sector in the UK at 22%, whereas Australian households allocated a somewhat smaller 18%.',
      body2:
        'Conversely, transport expenditures were more pronounced in Australia at 20%, as opposed to 16% in Britain. Leisure activities accounted for 18% and 15% in the UK and Australia respectively, whilst utility payments stood at an identical 12% in both economies.'
    },
    vocab: {
      verbs: ['accounted for', 'absorbed', 'allocated', 'constituted', 'formed', 'represented'],
      adverbs: ['identically', 'proportionately', 'substantially', 'marginally'],
      prepositions: ['stood at an identical 12%', 'compared to a slightly higher', 'absorbed over one third'],
      quantifiers: ['the single greatest share', 'over one third', 'the second largest sector', 'identical outlay']
    }
  },
  {
    id: 't1-table',
    kind: 'table',
    title: 'Data Table: International Tourist Arrivals & Receipts (2015 vs 2023)',
    prompt:
      'The table provides comparative data on international tourist arrivals and foreign currency receipts across four travel destinations between 2015 and 2023. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    dataBrief:
      'France: 84M -> 90M arrivals ($50B -> $65B). Spain: 68M -> 85M arrivals ($56B -> $82B). USA: 77M -> 79M arrivals ($205B -> $220B). Japan: 19M -> 32M arrivals ($25B -> $45B).',
    model: {
      intro:
        'The tabular matrix illustrates international visitor arrival numbers and subsequent tourist receipts in billions of US dollars across four prominent travel destinations between 2015 and 2023.',
      overview:
        'Overall, tourist arrivals and generated income expanded across all four nations, with Japan recording the most rapid relative percentage increase in both metrics. In contrast, while the United States received fewer visitors than France, it generated vastly higher revenue than any other nation.',
      body1:
        'In terms of raw arrivals, France retained the top global position, climbing from 84 million in 2015 to 90 million in 2023, accompanied by receipts rising from $50 billion to $65 billion. Spain demonstrated rapid expansion, surging from 68 million to 85 million visitors, with revenue jumping from $56 billion to $82 billion.',
      body2:
        'By contrast, the United States saw visitor numbers rise modestly from 77 million to 79 million, yet dominated receipts at $220 billion. Japan exhibited the sharpest percentage surge, nearly doubling arrivals from 19 million to 32 million and elevating receipts from $25 billion to $45 billion.'
    },
    vocab: {
      verbs: ['generated', 'retained the top position', 'dominated', 'expanded across', 'recorded'],
      adverbs: ['vastly', 'modestly', 'accompanied by', 'subsequently', 'relatively'],
      prepositions: ['climbing from 84 million to 90 million', 'jumping from $56 billion to $82 billion'],
      quantifiers: ['vastly higher revenue', 'nearly doubling', 'the sharpest percentage surge']
    }
  },
  {
    id: 't1-process',
    kind: 'process',
    title: 'Process Diagram: Commercial Manufacturing of Black Tea',
    prompt:
      'The flow diagram details the sequential stages involved in the commercial production of loose-leaf black tea from fresh harvest to final packaging. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    dataBrief:
      'Stage 1: Plucking green leaves. Stage 2: Withering under hot air (60% moisture removal). Stage 3: Rolling to release enzymes. Stage 4: Oxidation/fermentation in controlled room. Stage 5: Firing/drying in kiln. Stage 6: Grading and packaging.',
    model: {
      intro:
        'The flow chart illustrates the sequential industrial stages required to manufacture loose-leaf black tea from initial field harvesting through to final distribution packaging.',
      overview:
        'Overall, the production process comprises six distinct chronological phases, transitioning from mechanical moisture extraction through enzymatic fermentation to thermal stabilization. A notable feature is that natural enzymatic oxidation is strictly arrested during the penultimate firing stage.',
      body1:
        'The process initiates when tender green tea leaves are manually plucked and transported to the facility for withering. During this initial phase, warm air is continuously circulated across mesh racks, successfully reducing leaf moisture content by approximately 60 percent before mechanical rolling.',
      body2:
        'Following rolling, which crushes cell walls to release essential enzymes, the broken leaves are spread out in climate-controlled chambers for oxidation. Once the characteristic dark coloration develops, the leaves are fired in high-temperature kilns to arrest fermentation, before finally being sorted into grades and packaged into airtight containers.'
    },
    vocab: {
      verbs: ['plucked', 'withering', 'circulated', 'crushes', 'arrest fermentation', 'sorted', 'packaged'],
      adverbs: ['chronologically', 'manually', 'continuously', 'subsequently', 'finally'],
      prepositions: ['initiates when', 'following rolling', 'once coloration develops', 'prior to packaging'],
      quantifiers: ['six distinct phases', 'approximately 60 percent', 'characteristic coloration']
    }
  },
  {
    id: 't1-map',
    kind: 'map',
    title: 'Comparative Map: Urban Redevelopment of Dunford (2000 vs Present)',
    prompt:
      'The maps illustrate structural changes that have occurred in the coastal settlement of Dunford between the year 2000 and the present day. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    dataBrief:
      '2000: Industrial dock in east, small fishing port, old farmland in north, main road passing through town center. Present: Dock replaced by luxury apartments and marina, farmland converted to technology park, pedestrianized center with bypass road.',
    model: {
      intro:
        'The comparative maps depict the comprehensive urban transformation that has transpired in the coastal town of Dunford from the year 2000 to the present day.',
      overview:
        'Overall, Dunford has evolved from a predominantly industrial and maritime settlement into a modernized residential and commercial hub. The most noticeable alterations are the eradication of industrial docklands in favor of luxury amenities and the diversion of traffic away from the town center.',
      body1:
        'Examining the eastern coastline, the former commercial shipping dock and industrial warehouse complex were completely demolished to facilitate the construction of waterfront luxury apartments and a private yacht marina. Concurrently, the adjacent traditional fishing harbor was preserved but modernized with public boardwalks.',
      body2:
        'In the northern district, open agricultural farmland was entirely repurposed into a high-technology business park and multi-story car park. Furthermore, traffic congestion was relieved through the construction of an exterior dual-carriageway bypass, enabling the historic central high street to become fully pedestrianized.'
    },
    vocab: {
      verbs: ['transpired', 'demolished', 'repurposed', 'pedestrianized', 'diverted', 'modernized'],
      adverbs: ['predominantly', 'noticeably', 'entirely', 'concurrently', 'historically'],
      prepositions: ['in the eastern coastline', 'to the north of', 'in favor of', 'adjacent to'],
      quantifiers: ['comprehensive transformation', 'most noticeable alterations', 'dual-carriageway bypass']
    }
  }
];

export interface Task2EssayArchitecture {
  id: string;
  type: 'opinion' | 'discussion' | 'advantage' | 'problem' | 'direct';
  title: string;
  prompt: string;
  architectureGuide: string;
  model: {
    intro: string;
    body1: {
      topic: string;
      explanation: string;
      evidence: string;
      impact: string;
    };
    body2: {
      topic: string;
      explanation: string;
      evidence: string;
      impact: string;
    };
    conclusion: string;
  };
}

export const TASK2_ARCHITECTURES: Task2EssayArchitecture[] = [
  {
    id: 't2-opinion',
    type: 'opinion',
    title: 'Architecture 1: Opinion Essay (Agree / Disagree)',
    prompt:
      'Tertiary education should be fully funded by the state for all qualified citizens. To what extent do you agree or disagree with this statement?',
    architectureGuide:
      'Take a clear, unequivocal stance in the intro. Body 1 develops Primary Argument supporting your stance. Body 2 develops Secondary Argument supporting your stance. Conclusion restates stance without new points.',
    model: {
      intro:
        'It is frequently asserted that governments ought to fully finance university education for all academically qualified citizens. I firmly agree with this viewpoint, as state-funded higher education directly promotes socioeconomic equity and accelerates long-term national economic innovation.',
      body1: {
        topic:
          'One primary justification for state-funded higher education is that it dismantles systemic financial barriers for underprivileged students.',
        explanation:
          'Because exorbitant tuition fees often compel talented youths from low-income households to abandon academic pursuits, universal funding guarantees meritocratic access based on intellect rather than familial wealth.',
        evidence:
          'For instance, public university systems in Germany and Norway demonstrate substantially higher rates of upward social mobility among working-class graduates compared to nations reliant on tuition fees.',
        impact:
          'Consequently, public financing actively mitigates generational poverty and fosters an equitable, meritocratic society.'
      },
      body2: {
        topic:
          'Furthermore, investing tax revenue into tertiary education generates profound macroeconomic dividends for the host nation.',
        explanation:
          'Because modern post-industrial economies depend upon advanced research, engineering, and technological literacy, cultivating a highly educated populace attracts international investment and drives domestic innovation.',
        evidence:
          'Specifically, South Korea\'s state-sponsored expansion of technological universities catalyzed its transformation into a global leader in semiconductors and telecommunications.',
        impact:
          'Thus, government subsidies for higher education represent a highly lucrative societal investment rather than a drain on public resources.'
      },
      conclusion:
        'In conclusion, I reiterate my firm conviction that university tuition should be fully subsidized by national governments. Doing so safeguards social mobility for talented individuals while generating indispensable economic innovation for the nation as a whole.'
    }
  },
  {
    id: 't2-discussion',
    type: 'discussion',
    title: 'Architecture 2: Discussion Essay (Discuss Both Views + Opinion)',
    prompt:
      'Some people argue that technological automation will destroy employment opportunities, while others believe it will create higher-quality jobs. Discuss both views and give your own opinion.',
    architectureGuide:
      'Balanced thesis acknowledging both perspectives. Body 1 deconstructs View A. Body 2 deconstructs View B and clearly reveals why your opinion aligns with View B. Conclusion synthesizes.',
    model: {
      intro:
        'The accelerating pace of artificial intelligence and robotic automation has ignited intense debate regarding the future of work. While critics contend that automation will trigger catastrophic structural unemployment, proponents argue it will eliminate drudgery and cultivate superior professions. I firmly align with the latter perspective.',
      body1: {
        topic:
          'On one hand, anxieties surrounding technological automation stem from the immediate displacement of routine clerical and manual labor.',
        explanation:
          'Because algorithmic systems and robotic machinery execute repetitive computations and manufacturing tasks with greater speed and fewer errors than humans, corporations inevitably downsize traditional workforces.',
        evidence:
          'For instance, the introduction of automated assembly lines across automotive manufacturing plants in the late twentieth century rendered thousands of conventional factory workers redundant.',
        impact:
          'Consequently, displaced laborers face severe transitional hurdles and financial precarity if retraining programs fail to materialize.'
      },
      body2: {
        topic:
          'On the other hand, historical technological revolutions conclusively demonstrate that automation acts as an engine of novel job creation.',
        explanation:
          'Because automated systems lower manufacturing overheads and generate massive consumer surpluses, capital is freed to stimulate entirely unprecedented industries in software, biotechnology, and personalized services.',
        evidence:
          'Specifically, while automated spreadsheets eliminated traditional bookkeeping positions, they simultaneously created millions of high-paying roles in financial analysis and digital data science.',
        impact:
          'Therefore, technological evolution elevates the intellectual caliber of human employment rather than extinguishing it.'
      },
      conclusion:
        'In conclusion, although the immediate disruption of routine occupations requires proactive vocational retraining, automation ultimately enriches the global economy by creating intellectually sophisticated professions.'
    }
  },
  {
    id: 't2-advantage',
    type: 'advantage',
    title: 'Architecture 3: Advantages vs Disadvantages (Outweigh)',
    prompt:
      'In many contemporary cities, an increasing number of residents choose to live alone in single-person households. Do the advantages of this trend outweigh the disadvantages?',
    architectureGuide:
      'Evaluate whether benefits exceed drawbacks. Body 1 concedes the lesser side (Disadvantages). Body 2 champions the dominant side (Advantages) with greater logical depth. Conclusion confirms the net balance.',
    model: {
      intro:
        'Across urban metropolises globally, the proportion of individuals residing in single-occupant households has escalated significantly. In my estimation, although solitary living can exacerbate feelings of isolation, the personal autonomy and career focus it affords substantially outweigh its drawbacks.',
      body1: {
        topic:
          'Admittedly, the primary disadvantage associated with living alone is the heightened susceptibility to emotional loneliness and financial inefficiency.',
        explanation:
          'Because solo dwellers shoulder total responsibility for rent, utility bills, and grocery costs without shared economies of scale, their monthly living expenditures are disproportionately elevated.',
        evidence:
          'For instance, urban psychological surveys in Tokyo revealed that solo apartment dwellers report significantly higher rates of depressive alienation compared to residents in communal or family arrangements.',
        impact:
          'Consequently, solitary urban existence can undermine psychological wellbeing and financial stability if robust social networks are absent.'
      },
      body2: {
        topic:
          'Nevertheless, the decisive advantage of single-occupancy living is the unparalleled personal independence and professional productivity it unlocks.',
        explanation:
          'Because individuals in solitary domestic environments maintain absolute sovereignty over their daily schedules, they can devote undivided attention to demanding careers and self-directed intellectual development without familial friction.',
        evidence:
          'Specifically, professionals in competitive knowledge-economy sectors like law and software engineering frequently attribute rapid career advancement to the distraction-free domestic sanctuary of living alone.',
        impact:
          'Thus, the self-actualization and personal freedom gained from independent living far exceed its incidental social challenges.'
      },
      conclusion:
        'In conclusion, despite the financial and emotional challenges of domestic isolation, the exceptional autonomy, career concentration, and self-sufficiency fostered by living alone render it an overwhelmingly positive development.'
    }
  },
  {
    id: 't2-problem',
    type: 'problem',
    title: 'Architecture 4: Problem - Solution (Causes & Solutions)',
    prompt:
      'Urban traffic congestion has become a severe crisis in major metropolitan cities worldwide. Discuss the primary causes of this issue and suggest viable solutions.',
    architectureGuide:
      'Directly address both prongs. Body 1 explores the root systemic causes using 4-sentence causal mechanics. Body 2 explores targeted, practical solutions and their anticipated impacts.',
    model: {
      intro:
        'Severe vehicular gridlock has emerged as a pervasive impediment to economic productivity and urban wellbeing in global metropolises. This escalating crisis is primarily propelled by inadequate public transport infrastructure and suburban sprawl, yet it can be successfully rectified through congestion pricing and mass transit investment.',
      body1: {
        topic:
          'The foundational cause of urban traffic paralysis is the severe underinvestment in reliable, rapid public transit networks.',
        explanation:
          'Because municipal bus and train systems are frequently overcrowded, tardy, or disconnected from peripheral neighborhoods, suburban commuters are virtually coerced into utilizing private automobiles for daily travel.',
        evidence:
          'For instance, metropolitan areas like Los Angeles expanded extensive freeway networks while neglecting commuter rail, which triggered severe induced vehicular demand and chronic arterial gridlock.',
        impact:
          'Consequently, millions of private vehicles flood metropolitan thoroughfares simultaneously during peak rush hours.'
      },
      body2: {
        topic:
          'To effectively resolve this predicament, municipal authorities must institute electronic congestion charging zones paired with dedicated bus rapid transit corridors.',
        explanation:
          'Because levying financial tolls on private motorists entering commercial cores creates an immediate disincentive to drive, commuters naturally transition toward affordable, high-capacity electric transit.',
        evidence:
          'Specifically, central London and Singapore achieved immediate 20 percent declines in daily vehicular congestion after enforcing automated cordon charges and reinvesting revenues into electric buses.',
        impact:
          'Therefore, combining financial disincentives with transit infrastructure expansion provides a permanent remedy for traffic paralysis.'
      },
      conclusion:
        'In conclusion, metropolitan gridlock stems predominantly from car-centric planning and deficient transit networks. By adopting progressive congestion tolling and expanding clean public transport, governments can transform congested cities into clean, navigable spaces.'
    }
  },
  {
    id: 't2-direct',
    type: 'direct',
    title: 'Architecture 5: Direct Question / Two-Part Essay',
    prompt:
      'Many people today prefer watching films at home rather than visiting cinemas. Why is this the case? Is this a positive or negative development?',
    architectureGuide:
      'Answer Question 1 in Body 1 (Why it is happening). Answer Question 2 in Body 2 (Is it positive or negative). Introduction must outline answers to both questions; conclusion synthesizes both answers.',
    model: {
      intro:
        'In contemporary society, consumer entertainment preferences have decisively shifted toward domestic digital streaming over commercial movie theaters. This behavioral transition is predominantly driven by home entertainment technology and financial convenience, and I firmly consider it a positive cultural development.',
      body1: {
        topic:
          'The fundamental catalyst behind the preference for home viewing is the unprecedented convenience and affordability of on-demand streaming platforms.',
        explanation:
          'Because modern flat-screen televisions and surround-sound audio systems replicate the cinematic experience at a fraction of the cumulative cost of cinema tickets and concessions, consumers find domestic viewing vastly more practical.',
        evidence:
          'For instance, a single monthly subscription to services like Netflix or HBO Max costs less than two admissions at an IMAX multiplex, while offering thousands of accessible titles.',
        impact:
          'Consequently, domestic viewing provides families with unbeatable economic value and chronological flexibility.'
      },
      body2: {
        topic:
          'Furthermore, this technological democratization of cinematic access represents an overwhelmingly positive cultural milestone.',
        explanation:
          'Because independent filmmakers and niche documentaries can bypass commercial cinema distribution monopolies to reach global audiences directly in their living rooms, cinematic culture has become significantly more diverse and inclusive.',
        evidence:
          'Specifically, foreign-language masterworks like the Korean film Parasite gained unprecedented global acclaim and viewership through streaming availability that localized commercial theaters rarely afford.',
        impact:
          'Therefore, the democratization of film access broadens cultural awareness and fosters deeper artistic appreciation worldwide.'
      },
      conclusion:
        'In conclusion, the migration from traditional cinemas to home theaters is propelled by technological sophistication and economic practicality. Far from detracting from cinematic art, this shift represents a positive democratizing force in global storytelling.'
    }
  }
];

export function writingStudioView(root: HTMLElement): () => void {
  let activeTab: 'task1' | 'task2' | 'clauses' = 'task1';
  let activeT1Index = 0;
  let activeT2Index = 0;

  root.innerHTML = '';

  const shell = h('div', 'ie-writing-studio-shell');

  // Studio Header
  const header = h('div', 'ie-studio-header');
  header.innerHTML = `
    <div class="ie-studio-title-block">
      <span class="ie-studio-badge">KEINO CAMPBELL BAND 7+ SUITE</span>
      <h1 class="ie-title">Interactive Writing Studio</h1>
      <details class="ie-theory-details">
        <summary>Task 1 &amp; Task 2 Architecture Principles</summary>
        <p class="ie-lead">Master Task 1 with 6 progressive visual blueprints (strictly enforcing the 2-Sentence Overview zero-data rule), architect Task 2 with 5 discursive architectures validated by Myers semantic diff, and drill syntactic clause formulas with the Tactical Clause Builder.</p>
      </details>
    </div>
  `;

  // Top Mode Switcher
  const modeSwitcher = h('div', 'ie-studio-mode-tabs');
  const t1TabBtn = h('button', 'ie-tab is-on');
  t1TabBtn.innerHTML = `${icon('layers', 13)} ${t('ielts.task1', undefined, 'Task 1')} Visuals (6)`;
  const t2TabBtn = h('button', 'ie-tab');
  t2TabBtn.innerHTML = `${icon('edit', 13)} ${t('ielts.task2', undefined, 'Task 2')} Essays (5)`;
  const clauseTabBtn = h('button', 'ie-tab');
  clauseTabBtn.innerHTML = `${icon('target', 13)} Tactical Clause Builder`;
  modeSwitcher.append(t1TabBtn, t2TabBtn, clauseTabBtn);

  const contentArea = h('div', 'ie-studio-content');

  shell.append(header, modeSwitcher, contentArea);
  root.append(shell);

  t1TabBtn.addEventListener('click', () => {
    activeTab = 'task1';
    t1TabBtn.classList.add('is-on');
    t2TabBtn.classList.remove('is-on');
    clauseTabBtn.classList.remove('is-on');
    renderStudio();
  });

  t2TabBtn.addEventListener('click', () => {
    activeTab = 'task2';
    t2TabBtn.classList.add('is-on');
    t1TabBtn.classList.remove('is-on');
    clauseTabBtn.classList.remove('is-on');
    renderStudio();
  });

  clauseTabBtn.addEventListener('click', () => {
    activeTab = 'clauses';
    clauseTabBtn.classList.add('is-on');
    t1TabBtn.classList.remove('is-on');
    t2TabBtn.classList.remove('is-on');
    renderStudio();
  });

  function renderClauseBuilderStudio(container: HTMLElement): void {
    const FORMULAS = [
      {
        id: 'concession',
        title: 'Formula 1: Concession & Pivot',
        badge: '[Subordinate Concession] + [Counter-Claim]',
        description: 'Concede an opposing viewpoint with nuance before pivoting to an empirical counter-claim.',
        slot1Label: '1. Subordinate Concession Clause',
        slot1Tokens: [
          'Although proponents argue that economic growth is paramount,',
          'While it is frequently asserted that technology isolates individuals,',
          'Even though rapid urbanization brings undeniable conveniences,'
        ],
        slot2Label: '2. Counter-Claim / Empirical Pivot',
        slot2Tokens: [
          'compelling empirical evidence indicates that environmental degradation inflicts irreversible harm.',
          'careful societal analysis reveals that online communities foster profound global solidarity.',
          'the resulting depletion of green spaces severely degrades urban residents\' physical wellbeing.'
        ],
        trapTokens: [
          'but however this is completely untrue,',
          'despite of popular opinions held by elders,',
          'so therefore governments must immediately stop it,'
        ],
        trapNotes: [
          'Two contrast linkers ("but", "however") in one clause. Use one.',
          '"Despite" takes no "of": write "despite popular opinions".',
          'Two consequence linkers ("so", "therefore") in one clause. Use one.'
        ]
      },
      {
        id: 'causal',
        title: 'Formula 2: Causal Premise & Systemic Impact',
        badge: '[Causal Premise] + [Systemic Outcome]',
        description: 'Articulate structural cause-and-effect with high lexical density without simplistic linkers.',
        slot1Label: '1. Causal Premise Clause',
        slot1Tokens: [
          'Given that automation continuously displaces repetitive manual labour,',
          'In light of unprecedented global temperatures,',
          'Since public healthcare infrastructure is severely overburdened,'
        ],
        slot2Label: '2. Systemic Outcome / Impact',
        slot2Tokens: [
          'policymakers must prioritize comprehensive digital reskilling initiatives.',
          'international governing bodies must enforce stringent renewable energy mandates.',
          'preventative medical education should be integrated into standard school curricula.'
        ],
        trapTokens: [
          'due to the fact that governments fails to act,',
          'so because of this problem happens everywhere,',
          'and this makes everything become very bad,'
        ],
        trapNotes: [
          'Subject-verb agreement: "governments" is plural, so the verb is "fail".',
          'Two cause linkers ("so", "because of") in one clause. Use one.',
          '"And" joins main clauses; slot 1 needs a subordinating linker.'
        ]
      },
      {
        id: 'inversion',
        title: 'Formula 3: Conditional Inversion',
        badge: '[Inverted Condition] + [Hypothetical Result]',
        description: 'Invert the auxiliary in conditional clauses, e.g. "Had governments acted earlier".',
        slot1Label: '1. Inverted Condition Clause',
        slot1Tokens: [
          'Had governments enforced stricter emissions targets earlier,',
          'Were subsidies redirected towards public transit infrastructure,',
          'Should municipal authorities fail to curb industrial runoff,'
        ],
        slot2Label: '2. Hypothetical / Modal Result',
        slot2Tokens: [
          'the severity of contemporary ecological crises would be substantially mitigated.',
          'metropolitan carbon footprints would decline dramatically within five years.',
          'surrounding aquatic ecosystems face imminent catastrophic collapse.'
        ],
        trapTokens: [
          'if had governments done this earlier,',
          'if they would invest more money into trains,',
          'maybe the environment will be better tomorrow,'
        ],
        trapNotes: [
          'Inversion replaces "if": "Had governments..." takes no "if".',
          'No "would" in an if-clause. Use the past simple: "if they invested more".',
          'A complete main clause with no subordinator cannot fill slot 1. "Maybe" is informal hedging.'
        ]
      },
      {
        id: 'policy',
        title: 'Formula 4: Policy Intervention & Long-term Remedy',
        badge: '[Actionable Policy] + [Long-term Impact]',
        description: 'Synthesize actionable proposals for Task 2 recommendations and concluding solutions.',
        slot1Label: '1. Policy / Action Clause',
        slot1Tokens: [
          'By subsidizing sustainable agricultural practices,',
          'Through instituting rigorous transparency regulations in corporate governance,',
          'Via targeted educational grants for underprivileged communities,'
        ],
        slot2Label: '2. Long-Term Societal Remedy',
        slot2Tokens: [
          'nations can simultaneously safeguard domestic food security and protect vital topsoil.',
          'financial regulatory bodies can effectively preempt speculative economic crises.',
          'developing economies can systematically narrow persistent socioeconomic divides.'
        ],
        trapTokens: [
          'by subsidize sustainable farming,',
          'in order for solving problems easily,',
          'to making sure that citizens are happy,'
        ],
        trapNotes: [
          '"By" takes a gerund: "by subsidizing", not "by subsidize".',
          '"In order to" takes a bare verb: "in order to solve", not "in order for solving".',
          '"To" takes a bare verb: "to make sure", not "to making sure".'
        ]
      }
    ];

    let activeFormulaIdx = 0;
    let selectedTokens: string[] = [];

    const arena = h('div', 'ie-clause-builder-arena');

    function renderActiveFormula(): void {
      const f = FORMULAS[activeFormulaIdx];

      arena.innerHTML = `
        <div class="ie-tabs ie-formula-tabs" style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;">
          ${FORMULAS.map((_, idx) => `
            <button type="button" class="ie-tab ${idx === activeFormulaIdx ? 'is-on' : ''}" data-idx="${idx}">
              Formula ${idx + 1}
            </button>
          `).join('')}
        </div>

        <div class="ie-clause-formula-card">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <span class="ie-clause-formula-badge">${f.badge}</span>
            <span class="ie-skill-badge" style="background: var(--accent-gold); color: var(--bg-canvas); font-weight: 700;">CLAUSE DRILL</span>
          </div>
          <h2 style="font-size: 17px; margin: 4px 0;">${f.title}</h2>
          <p style="font-size: 13px; color: var(--ink-secondary); margin: 0; line-height: 1.4;">${f.description}</p>
        </div>

        <div class="ie-clause-workspace-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="ie-clause-slot-label">ASSEMBLED SENTENCE SLOT</span>
            <span style="font-family: var(--font-mono); font-size: 11px; color: var(--ink-muted);">${selectedTokens.length} Tokens</span>
          </div>

          <div class="ie-clause-assembled-box ${selectedTokens.length > 0 ? 'has-tokens' : ''}">
            ${selectedTokens.length > 0 ? selectedTokens.map(tok => `
              <span class="ie-clause-token-pill">
                <span>${esc(tok)}</span>
              </span>
            `).join(' ') : `
              <span class="ie-clause-placeholder-text">Tap tokens from the banks below to construct your academic sentence formula...</span>
            `}
          </div>

          <div class="ie-clause-actions-row">
            <button type="button" class="ie-btn ie-btn-sm ie-btn-undo" ${selectedTokens.length === 0 ? 'disabled' : ''}>
              ${icon('skipBack', 14)} Undo Token
            </button>
            <button type="button" class="ie-btn ie-btn-sm ie-btn-reset" ${selectedTokens.length === 0 ? 'disabled' : ''}>
              ${icon('rotateCcw', 14)} Reset Slot
            </button>
            <button type="button" class="ie-btn ie-btn-sm ie-btn-primary ie-btn-verify" ${selectedTokens.length === 0 ? 'disabled' : ''} style="margin-left: auto;">
              ${icon('check', 14)} Verify Clause Syntax
            </button>
          </div>

          <div class="ie-clause-feedback-mount"></div>
        </div>

        <div class="ie-clause-workspace-card">
          <div class="ie-clause-bank-group">
            <span class="ie-clause-slot-label">${f.slot1Label}</span>
            <div class="ie-clause-tokens-list">
              ${f.slot1Tokens.map(tok => `
                <button type="button" class="ie-token-tap-btn ${selectedTokens.includes(tok) ? 'is-selected' : ''}" data-tok="${esc(tok)}">
                  ${esc(tok)}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="ie-clause-bank-group">
            <span class="ie-clause-slot-label">${f.slot2Label}</span>
            <div class="ie-clause-tokens-list">
              ${f.slot2Tokens.map(tok => `
                <button type="button" class="ie-token-tap-btn ${selectedTokens.includes(tok) ? 'is-selected' : ''}" data-tok="${esc(tok)}">
                  ${esc(tok)}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="ie-clause-bank-group">
            <span class="ie-clause-slot-label" style="color: var(--critical, #ef4444);">Distractor &amp; Trap Tokens (Common Errors)</span>
            <div class="ie-clause-tokens-list">
              ${f.trapTokens.map(tok => `
                <button type="button" class="ie-token-tap-btn is-trap ${selectedTokens.includes(tok) ? 'is-selected' : ''}" data-tok="${esc(tok)}">
                  ${esc(tok)}
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      // Event Bindings
      arena.querySelectorAll('.ie-formula-tabs .ie-tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
          activeFormulaIdx = Number((e.currentTarget as HTMLElement).dataset.idx);
          selectedTokens = [];
          HapticEngine.trigger('selection');
          renderActiveFormula();
        });
      });

      arena.querySelectorAll('.ie-token-tap-btn:not(.is-selected)').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const tok = (e.currentTarget as HTMLElement).dataset.tok;
          if (tok && !selectedTokens.includes(tok)) {
            selectedTokens.push(tok);
            HapticEngine.trigger('light');
            AudioSynthesizer.play('click');
            renderActiveFormula();
          }
        });
      });

      arena.querySelector('.ie-btn-undo')?.addEventListener('click', () => {
        if (selectedTokens.length > 0) {
          selectedTokens.pop();
          HapticEngine.trigger('light');
          renderActiveFormula();
        }
      });

      arena.querySelector('.ie-btn-reset')?.addEventListener('click', () => {
        selectedTokens = [];
        HapticEngine.trigger('selection');
        renderActiveFormula();
      });

      const feedbackMount = arena.querySelector('.ie-clause-feedback-mount');
      arena.querySelector('.ie-btn-verify')?.addEventListener('click', () => {
        if (!feedbackMount) return;
        const sentence = selectedTokens.join(' ').trim();

        // 1. Check double connectors trap (e.g. although ... but)
        if (/\b(although|even though|though)\b.*\b(but|however)\b/i.test(sentence)) {
          HapticEngine.trigger('warning');
          AudioSynthesizer.play('alarm');
          feedbackMount.innerHTML = `
            <div class="ie-clause-feedback-card is-warning">
              <b>⚠️ REDUNDANT CONNECTOR TRAP:</b> "Although" and "but" cannot govern the same sentence clause. Subordinate clauses already establish concession; remove "but".
            </div>
          `;
          return;
        }

        // 2. Check trap tokens
        const trapIdx = f.trapTokens.findIndex(t => selectedTokens.includes(t));
        if (trapIdx !== -1) {
          HapticEngine.trigger('warning');
          AudioSynthesizer.play('alarm');
          feedbackMount.innerHTML = `
            <div class="ie-clause-feedback-card is-warning">
              <b>✗ TRAP TOKEN:</b> ${f.trapNotes[trapIdx]}
            </div>
          `;
          return;
        }

        // 3. Structure: exactly one slot-1 clause, then one slot-2 clause, in that order
        const [first, second] = selectedTokens;
        if (selectedTokens.length !== 2 || !f.slot1Tokens.includes(first) || !f.slot2Tokens.includes(second)) {
          HapticEngine.trigger('warning');
          feedbackMount.innerHTML = `
            <div class="ie-clause-feedback-card is-warning">
              <b>⚠️ STRUCTURE INCOMPLETE:</b> Select one prefix clause from slot 1, then one outcome or counter-claim from slot 2, in that order.
            </div>
          `;
          return;
        }

        // 4. Shape check passed. Says nothing about band; band needs a full paragraph.
        HapticEngine.trigger('success');
        AudioSynthesizer.play('chime');
        feedbackMount.innerHTML = `
          <div class="ie-clause-feedback-card is-success">
            <b>✓ STRUCTURE CHECK PASSED:</b> Subordinate clause followed by main clause. This checks the shape of the formula only.
          </div>
        `;
      });
    }

    renderActiveFormula();
    container.innerHTML = '';
    container.appendChild(arena);
  }

  function renderStudio(): void {
    contentArea.innerHTML = '';
    if (activeTab === 'task1') {
      renderTask1Studio(contentArea);
    } else if (activeTab === 'task2') {
      renderTask2Studio(contentArea);
    } else {
      renderClauseBuilderStudio(contentArea);
    }
  }

  function renderTask1Studio(container: HTMLElement): void {
    const bp = TASK1_BLUEPRINTS[activeT1Index] || TASK1_BLUEPRINTS[0];

    const KIND_LABELS: Record<string, { full: string; short: string }> = {
      line: { full: 'Line Graph', short: 'Line' },
      bar: { full: 'Bar Chart', short: 'Bar' },
      pie: { full: 'Pie Chart', short: 'Pie' },
      table: { full: 'Data Table', short: 'Table' },
      process: { full: 'Process', short: 'Process' },
      map: { full: 'Map', short: 'Map' }
    };

    const visualTabs = h('div', 'ie-tabs ie-visual-tabs');
    TASK1_BLUEPRINTS.forEach((item, idx) => {
      const labels = KIND_LABELS[item.kind.toLowerCase()] || { full: item.kind, short: item.kind };
      const btn = h('button', `ie-tab ${idx === activeT1Index ? 'is-on' : ''}`);
      btn.innerHTML = `<span class="ie-tab-full">${labels.full}</span><span class="ie-tab-short">${labels.short}</span>`;
      btn.addEventListener('click', () => {
        activeT1Index = idx;
        renderTask1Studio(container);
      });
      visualTabs.append(btn);
    });

    const card = h('div', 'ie-blueprint-arena');
    card.innerHTML = `
      <div class="ie-bp-prompt-card">
        <div class="ie-bp-header-row">
          <span class="ie-skill-badge">TASK 1 // ${bp.kind.toUpperCase()}</span>
          <button type="button" class="ie-btn ie-btn-sm ie-load-t1-model">Load Band 8.5 Model Blueprint</button>
        </div>
        <h2 class="ie-sub">${esc(bp.title)}</h2>
        <p class="ie-prompt-text"><b>Prompt:</b> ${esc(bp.prompt)}</p>
        <details class="ie-data-brief-box">
          <summary><b>📊 Visual Data Digest</b></summary>
          <span>${esc(bp.dataBrief)}</span>
        </details>
      </div>

      <div class="ie-t1-steps-grid">
        <!-- Step 1: Paraphrased Intro -->
        <div class="ie-step-card">
          <div class="ie-step-head">
            <span class="ie-step-n">1</span>
            <div>
              <b>Step 1: Paraphrased Introduction</b>
              <p class="ie-note">One single clear sentence identifying metric, categories, and timeframe.</p>
            </div>
          </div>
          <div class="ie-testbar ie-t1-intro-timer">
            <span class="ie-clock">01:00</span>
            <button type="button" class="ie-btn ie-btn-sm ie-t1-intro-start">Start 60-second paraphrase</button>
          </div>
          <textarea class="ie-textarea ie-t1-intro-input" placeholder="The line graph illustrates..."></textarea>
          <div class="ie-step-feedback ie-intro-feedback"></div>
        </div>

        <!-- Step 2: 2-Sentence Overview (Strict Zero Numbers) -->
        <div class="ie-step-card ie-step-overview-card">
          <div class="ie-step-head">
            <span class="ie-step-n">2</span>
            <div>
              <b>Step 2: Two-Sentence Overview (Strict Zero-Data Rule)</b>
              <p class="ie-note">Sentence 1: Dominant trend. Sentence 2: Key contrast. STRICTLY 0 RAW FIGURES!</p>
            </div>
          </div>
          <textarea class="ie-textarea ie-t1-overview-input" placeholder="Overall, it is evident that [dominant trend]... In stark contrast, [key anomaly]..."></textarea>
          <div class="ie-step-feedback ie-overview-feedback">
            <ul class="ie-checklist-items">
              <li class="chk-numbers">Checking for raw data figures...</li>
              <li class="chk-trend">Checking for primary trend...</li>
              <li class="chk-contrast">Checking for contrast / anomaly...</li>
            </ul>
          </div>
        </div>

        <!-- Step 3: Body Paragraph 1 -->
        <div class="ie-step-card">
          <div class="ie-step-head">
            <span class="ie-step-n">3</span>
            <div>
              <b>Step 3: Body Paragraph 1 (Primary Data Group)</b>
              <p class="ie-note">Group 2-3 dominant trajectories. Detail starting figures, change rates, and peaks.</p>
            </div>
          </div>
          <textarea class="ie-textarea ie-t1-body1-input" placeholder="Regarding the primary categories..."></textarea>
          <div class="ie-step-feedback ie-body1-feedback"></div>
        </div>

        <!-- Step 4: Body Paragraph 2 -->
        <div class="ie-step-card">
          <div class="ie-step-head">
            <span class="ie-step-n">4</span>
            <div>
              <b>Step 4: Body Paragraph 2 (Secondary Contrasts)</b>
              <p class="ie-note">Detail remaining categories, minor fluctuations, or static figures with prepositions.</p>
            </div>
          </div>
          <textarea class="ie-textarea ie-t1-body2-input" placeholder="By contrast, figures for..."></textarea>
          <div class="ie-step-feedback ie-body2-feedback"></div>
        </div>
      </div>

      <!-- Vocabulary Palette for Active Blueprint -->
      <div class="ie-vocab-palette">
        <h4>🎨 Academic Lexicon Palette for ${esc(bp.kind.toUpperCase())} (Click to Insert)</h4>
        <div class="ie-vocab-group">
          <span class="ie-vocab-label">Trend &amp; Transform Verbs:</span>
          <div class="ie-chips">
            ${bp.vocab.verbs.map(v => `<button type="button" class="ie-chip" data-word="${v}">${esc(v)}</button>`).join('')}
          </div>
        </div>
        <div class="ie-vocab-group">
          <span class="ie-vocab-label">Degree &amp; Sequence Adverbs:</span>
          <div class="ie-chips">
            ${bp.vocab.adverbs.map(a => `<button type="button" class="ie-chip" data-word="${a}">${esc(a)}</button>`).join('')}
          </div>
        </div>
        <div class="ie-vocab-group">
          <span class="ie-vocab-label">Prepositions of Change &amp; Location:</span>
          <div class="ie-chips">
            ${bp.vocab.prepositions.map(p => `<button type="button" class="ie-chip" data-word="${p}">${esc(p)}</button>`).join('')}
          </div>
        </div>
        <div class="ie-vocab-group">
          <span class="ie-vocab-label">Quantifiers &amp; Proportions:</span>
          <div class="ie-chips">
            ${bp.vocab.quantifiers.map(q => `<button type="button" class="ie-chip" data-word="${q}">${esc(q)}</button>`).join('')}
          </div>
        </div>
      </div>

      <!-- Assembled Report Console -->
      <div class="ie-assembled-console">
        <div class="ie-assembled-head">
          <h3>📄 Complete Assembled Task 1 Report</h3>
          <div class="ie-assembled-metrics">
            <span class="ie-t1-total-words">0 / 150 words</span>
            <button type="button" class="ie-btn ie-btn-sm ie-copy-report">Copy Complete Report</button>
          </div>
        </div>
        <div class="ie-assembled-preview">
          <p class="ie-preview-placeholder">Draft the 4 steps above to assemble your complete report in real-time.</p>
        </div>
      </div>
    `;

    container.innerHTML = '';
    container.append(visualTabs, card);

    // Bindings
    const introInput = card.querySelector<HTMLTextAreaElement>('.ie-t1-intro-input')!;
    const overviewInput = card.querySelector<HTMLTextAreaElement>('.ie-t1-overview-input')!;
    const body1Input = card.querySelector<HTMLTextAreaElement>('.ie-t1-body1-input')!;
    const body2Input = card.querySelector<HTMLTextAreaElement>('.ie-t1-body2-input')!;
    const overviewFeedback = card.querySelector<HTMLElement>('.ie-overview-feedback')!;
    const previewEl = card.querySelector<HTMLElement>('.ie-assembled-preview')!;
    const wordCountBadge = card.querySelector<HTMLElement>('.ie-t1-total-words')!;
    let lastActiveInput: HTMLTextAreaElement = introInput;

    [introInput, overviewInput, body1Input, body2Input].forEach(inp => {
      inp.addEventListener('focus', () => { lastActiveInput = inp; });
    });

    const introClock = card.querySelector<HTMLElement>('.ie-t1-intro-timer .ie-clock')!;
    const introStart = card.querySelector<HTMLButtonElement>('.ie-t1-intro-start')!;
    introStart.addEventListener('click', () => {
      introStart.disabled = true;
      countdown(60, left => {
        introClock.textContent = fmtTime(left);
      }, () => {
        introClock.textContent = '00:00 (Time up)';
        introStart.disabled = false;
      });
    });

    card.querySelectorAll('.ie-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const word = (btn as HTMLElement).dataset.word || '';
        const target = lastActiveInput;
        const start = target.selectionStart ?? target.value.length;
        const end = target.selectionEnd ?? target.value.length;
        target.value = target.value.substring(0, start) + ` ${word} ` + target.value.substring(end);
        target.focus();
        target.dispatchEvent(new Event('input', { bubbles: true }));
      });
    });

    function updateT1State(): void {
      const oVal = validateTask1Overview(overviewInput.value);
      overviewFeedback.innerHTML = `
        <ul class="ie-checklist-items">
          <li class="${oVal.hasNumbers ? 'is-invalid' : 'is-valid'}">${oVal.hasNumbers ? '⚠️ Raw numbers detected (forbidden in overview)!' : '✓ Zero Raw Numbers Rule satisfied.'}</li>
          <li class="${oVal.sentenceCount === 2 ? 'is-valid' : 'is-warn'}">${oVal.sentenceCount} / 2 Sentences</li>
          <li class="${oVal.hasTrend ? 'is-valid' : 'is-invalid'}">${oVal.hasTrend ? '✓ Main trend articulated' : '✗ Missing main trend'}</li>
          <li class="${oVal.hasContrast ? 'is-valid' : 'is-invalid'}">${oVal.hasContrast ? '✓ Key contrast / anomaly articulated' : '✗ Missing key contrast'}</li>
        </ul>
      `;

      const p1 = introInput.value.trim();
      const p2 = overviewInput.value.trim();
      const p3 = body1Input.value.trim();
      const p4 = body2Input.value.trim();

      const combined = [p1, p2, p3, p4].filter(Boolean).join('\n\n');
      const totalWords = combined ? combined.split(/\s+/).length : 0;

      wordCountBadge.textContent = `${totalWords} / 150 words`;
      wordCountBadge.className = `ie-t1-total-words ${totalWords >= 150 ? 'is-good' : 'is-low'}`;

      if (!combined) {
        previewEl.innerHTML = '<p class="ie-preview-placeholder">Draft the 4 steps above to assemble your complete report in real-time.</p>';
      } else {
        previewEl.innerHTML = [p1, p2, p3, p4]
          .filter(Boolean)
          .map(p => `<p>${esc(p)}</p>`)
          .join('');
      }
    }

    [introInput, overviewInput, body1Input, body2Input].forEach(inp => {
      inp.addEventListener('input', updateT1State);
    });

    const loadModelBtn = card.querySelector('.ie-load-t1-model');
    if (loadModelBtn) {
      loadModelBtn.addEventListener('click', () => {
        introInput.value = bp.model.intro;
        overviewInput.value = bp.model.overview;
        body1Input.value = bp.model.body1;
        body2Input.value = bp.model.body2;
        updateT1State();
      });
    }

    const copyBtn = card.querySelector('.ie-copy-report');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const text = [introInput.value, overviewInput.value, body1Input.value, body2Input.value].filter(Boolean).join('\n\n');
        navigator.clipboard.writeText(text).then(() => {
          copyBtn.textContent = '✓ Copied!';
          setTimeout(() => { copyBtn.textContent = 'Copy Complete Report'; }, 2000);
        });
      });
    }

    updateT1State();
  }

  function renderTask2Studio(container: HTMLElement): void {
    const arch = TASK2_ARCHITECTURES[activeT2Index] || TASK2_ARCHITECTURES[0];

    const ARCH_NAMES = [
      'Opinion',
      'Discussion',
      'Advantage',
      'Problems',
      'Two-Part'
    ];

    const archTabs = h('div', 'ie-tabs ie-arch-tabs');
    TASK2_ARCHITECTURES.forEach((item, idx) => {
      const label = ARCH_NAMES[idx] || item.title.split(':')[0];
      const btn = h('button', `ie-tab ${idx === activeT2Index ? 'is-on' : ''}`, label);
      btn.addEventListener('click', () => {
        activeT2Index = idx;
        renderTask2Studio(container);
      });
      archTabs.append(btn);
    });

    const arena = h('div', 'ie-architect-arena');
    arena.innerHTML = `
      <div class="ie-arch-prompt-card">
        <div class="ie-bp-header-row">
          <span class="ie-skill-badge">TASK 2 // ${arch.type.toUpperCase()}</span>
          <button type="button" class="ie-btn ie-btn-sm ie-load-t2-model">Load Band 8.5 Model Essay</button>
        </div>
        <h2 class="ie-sub">${esc(arch.title)}</h2>
        <p class="ie-prompt-text"><b>Prompt:</b> ${esc(arch.prompt)}</p>
        <div class="ie-data-brief-box">
          <b>📐 Architectural Blueprint:</b> <span>${esc(arch.architectureGuide)}</span>
        </div>
      </div>

      <div class="ie-essay-composer-sections">
        <!-- Introduction -->
        <div class="ie-section-box">
          <div class="ie-section-head">
            <b>1. Introduction (Paraphrase + Clear Thesis Stance)</b>
          </div>
          <textarea class="ie-textarea ie-t2-intro" placeholder="State background context and direct thesis stance..."></textarea>
        </div>

        <!-- Body Paragraph 1 (4-Sentence Formula) -->
        <div class="ie-section-box ie-body-architect-box">
          <div class="ie-section-head">
            <b>2. Body Paragraph 1 (Keino Campbell 4-Sentence Formula)</b>
            <div class="ie-body-badges ie-b1-badges">
              <span class="ie-eval-badge ie-b1-topic">S1: Topic</span>
              <span class="ie-eval-badge ie-b1-expl">S2: Explanation</span>
              <span class="ie-eval-badge ie-b1-evid">S3: Evidence</span>
              <span class="ie-eval-badge ie-b1-imp">S4: Impact</span>
              <span class="ie-eval-badge ie-b1-band">Band 6.0</span>
            </div>
          </div>
          <textarea class="ie-textarea ie-t2-b1" placeholder="Sentence 1 (Claim)... Sentence 2 (Causal explanation)... Sentence 3 (Concrete evidence)... Sentence 4 (Concluding impact)..."></textarea>
          <div class="ie-body-feedback ie-b1-feedback"></div>
        </div>

        <!-- Body Paragraph 2 (4-Sentence Formula) -->
        <div class="ie-section-box ie-body-architect-box">
          <div class="ie-section-head">
            <b>3. Body Paragraph 2 (Keino Campbell 4-Sentence Formula)</b>
            <div class="ie-body-badges ie-b2-badges">
              <span class="ie-eval-badge ie-b2-topic">S1: Topic</span>
              <span class="ie-eval-badge ie-b2-expl">S2: Explanation</span>
              <span class="ie-eval-badge ie-b2-evid">S3: Evidence</span>
              <span class="ie-eval-badge ie-b2-imp">S4: Impact</span>
              <span class="ie-eval-badge ie-b2-band">Band 6.0</span>
            </div>
          </div>
          <textarea class="ie-textarea ie-t2-b2" placeholder="Sentence 1 (Second main claim)... Sentence 2 (Causal logic)... Sentence 3 (Concrete example)... Sentence 4 (Concluding impact)..."></textarea>
          <div class="ie-body-feedback ie-b2-feedback"></div>
        </div>

        <!-- Conclusion -->
        <div class="ie-section-box">
          <div class="ie-section-head">
            <b>4. Conclusion (Thesis Synthesis)</b>
          </div>
          <textarea class="ie-textarea ie-t2-concl" placeholder="In conclusion, reiterate main positions without introducing brand new points..."></textarea>
        </div>
      </div>

      <!-- Myers Diff Comparison Console -->
      <div class="ie-diff-console">
        <div class="ie-diff-header">
          <div>
            <h3>${icon('search', 15)} Myers Semantic Diff (Candidate vs Band 8.5 Model)</h3>
            <p class="ie-note">Word-level LCS comparison against the authentic Band 8.5 exemplar model.</p>
          </div>
          <button type="button" class="ie-btn ie-btn-sm ie-run-diff">Execute Word Diff Analysis</button>
        </div>
        <div class="ie-diff-legend">
          <span class="diff-legend-item"><i class="leg-match"></i> Shared Vocabulary (Match)</span>
          <span class="diff-legend-item"><i class="leg-insert"></i> Your Phrasing (Insertion)</span>
          <span class="diff-legend-item"><i class="leg-delete"></i> Band 8.5 Benchmark (Omission)</span>
        </div>
        <div class="ie-diff-stream-box">
          <p class="ie-diff-empty">Click "Execute Word Diff Analysis" to compare your essay draft with the Band 8.5 model.</p>
        </div>
      </div>
    `;

    container.innerHTML = '';
    container.append(archTabs, arena);

    const introInp = arena.querySelector<HTMLTextAreaElement>('.ie-t2-intro')!;
    const b1Inp = arena.querySelector<HTMLTextAreaElement>('.ie-t2-b1')!;
    const b2Inp = arena.querySelector<HTMLTextAreaElement>('.ie-t2-b2')!;
    const conclInp = arena.querySelector<HTMLTextAreaElement>('.ie-t2-concl')!;

    const b1Topic = arena.querySelector<HTMLElement>('.ie-b1-topic')!;
    const b1Expl = arena.querySelector<HTMLElement>('.ie-b1-expl')!;
    const b1Evid = arena.querySelector<HTMLElement>('.ie-b1-evid')!;
    const b1Imp = arena.querySelector<HTMLElement>('.ie-b1-imp')!;
    const b1Band = arena.querySelector<HTMLElement>('.ie-b1-band')!;
    const b1Fb = arena.querySelector<HTMLElement>('.ie-b1-feedback')!;

    const b2Topic = arena.querySelector<HTMLElement>('.ie-b2-topic')!;
    const b2Expl = arena.querySelector<HTMLElement>('.ie-b2-expl')!;
    const b2Evid = arena.querySelector<HTMLElement>('.ie-b2-evid')!;
    const b2Imp = arena.querySelector<HTMLElement>('.ie-b2-imp')!;
    const b2Band = arena.querySelector<HTMLElement>('.ie-b2-band')!;
    const b2Fb = arena.querySelector<HTMLElement>('.ie-b2-feedback')!;

    function applyValidation(report: ParagraphEvaluation, badges: { topic: HTMLElement; expl: HTMLElement; evid: HTMLElement; imp: HTMLElement; band: HTMLElement }, fbEl: HTMLElement): void {
      badges.topic.className = `ie-eval-badge ${report.hasTopicSentence ? 'is-valid' : 'is-invalid'}`;
      badges.topic.textContent = report.hasTopicSentence ? '✓ S1: Topic' : '✗ S1: Topic';

      badges.expl.className = `ie-eval-badge ${report.hasExplanation ? 'is-valid' : 'is-invalid'}`;
      badges.expl.textContent = report.hasExplanation ? '✓ S2: Causal' : '✗ S2: Causal';

      badges.evid.className = `ie-eval-badge ${report.hasEvidence ? 'is-valid' : 'is-invalid'}`;
      badges.evid.textContent = report.hasEvidence ? '✓ S3: Evidence' : '✗ S3: Evidence';

      badges.imp.className = `ie-eval-badge ${report.hasImpactSentence ? 'is-valid' : 'is-invalid'}`;
      badges.imp.textContent = report.hasImpactSentence ? '✓ S4: Impact' : '✗ S4: Impact';

      badges.band.textContent = report.scoreEstimate;
      badges.band.className = `ie-eval-badge band-${report.scoreEstimate.replace(/[^0-9]/g, '')}`;

      fbEl.innerHTML = `<ul class="ie-checklist-items">${report.feedback.map(f => `<li>${esc(f)}</li>`).join('')}</ul>`;
    }

    b1Inp.addEventListener('input', () => {
      const rep = validateFourSentenceParagraph(b1Inp.value);
      applyValidation(rep, { topic: b1Topic, expl: b1Expl, evid: b1Evid, imp: b1Imp, band: b1Band }, b1Fb);
    });

    b2Inp.addEventListener('input', () => {
      const rep = validateFourSentenceParagraph(b2Inp.value);
      applyValidation(rep, { topic: b2Topic, expl: b2Expl, evid: b2Evid, imp: b2Imp, band: b2Band }, b2Fb);
    });

    const loadModelBtn = arena.querySelector('.ie-load-t2-model');
    if (loadModelBtn) {
      loadModelBtn.addEventListener('click', () => {
        introInp.value = arch.model.intro;
        b1Inp.value = [arch.model.body1.topic, arch.model.body1.explanation, arch.model.body1.evidence, arch.model.body1.impact].join(' ');
        b2Inp.value = [arch.model.body2.topic, arch.model.body2.explanation, arch.model.body2.evidence, arch.model.body2.impact].join(' ');
        conclInp.value = arch.model.conclusion;

        b1Inp.dispatchEvent(new Event('input', { bubbles: true }));
        b2Inp.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }

    const diffBtn = arena.querySelector('.ie-run-diff');
    const diffStream = arena.querySelector<HTMLElement>('.ie-diff-stream-box')!;
    if (diffBtn) {
      diffBtn.addEventListener('click', () => {
        const fullModel = [
          arch.model.intro,
          arch.model.body1.topic, arch.model.body1.explanation, arch.model.body1.evidence, arch.model.body1.impact,
          arch.model.body2.topic, arch.model.body2.explanation, arch.model.body2.evidence, arch.model.body2.impact,
          arch.model.conclusion
        ].join(' ');

        const candidate = [introInp.value, b1Inp.value, b2Inp.value, conclInp.value].filter(Boolean).join(' ');

        if (!candidate.trim()) {
          diffStream.innerHTML = '<p class="ie-note">Please enter your essay draft above or load the model before executing diff.</p>';
          return;
        }

        const diffTokens = computeWordDiff(fullModel, candidate);
        const matches = diffTokens.filter(t => t.type === 'match').length;
        const total = diffTokens.length;
        const overlapPct = total > 0 ? Math.round((matches / total) * 100) : 0;

        const renderedDiff = diffTokens
          .map(tok => {
            if (tok.type === 'match') return `<span class="diff-word-match">${esc(tok.value)}</span>`;
            if (tok.type === 'insert') return `<span class="diff-word-insert" title="Your unique phrasing">${esc(tok.value)}</span>`;
            return `<span class="diff-word-delete" title="Omitted Band 8.5 benchmark">${esc(tok.value)}</span>`;
          })
          .join(' ');

        diffStream.innerHTML = `
          <div class="ie-diff-stats">
            <span>Lexical Overlap: <b>${overlapPct}%</b></span>
            <span>Total Diff Tokens: <b>${total}</b></span>
            <span>Shared Word Anchors: <b>${matches}</b></span>
          </div>
          <div class="ie-diff-tokens-stream">${renderedDiff}</div>
        `;
      });
    }

    b1Inp.dispatchEvent(new Event('input', { bubbles: true }));
    b2Inp.dispatchEvent(new Event('input', { bubbles: true }));
  }

  renderStudio();

  return () => {
    // cleanup
  };
}
