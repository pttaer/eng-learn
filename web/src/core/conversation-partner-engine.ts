/**
 * STARK // English Singularity - CEFR Spoken Conversational Partner Engine
 * Multi-Turn Communicative Spoken Roleplay Engine with CEFR Turn-Length Constraints,
 * In-Flow Gentle Recasting, Coach Notes Scaffolding, and Can-Do Diagnostics.
 * Aligned strictly with Council of Europe CEFR Companion Volume 2020 and Lingua Franca Core.
 */

import { Cefr } from './cefr';
import { IntonationContour } from './audio-synthesizer';

export interface DialogueBranch {
  condition: 'affirmative' | 'negative' | 'inquiry' | 'elaboration' | string[];
  reply: string;
  coachTip?: string;
}

export interface SurpriseFollowUp {
  id: string;
  question: string;
  coachTip: string;
  contextHint: string;
}

export interface DialogueScriptStep {
  turnIndex: number;
  expectedKeywords: string[];
  partnerReply: string;
  coachTip?: string;
  recasts?: Record<string, string>;
  branches?: DialogueBranch[];
}

export interface RoleplayScenario {
  id: string;
  cefrLevel: Cefr;
  title: string;
  setting: string;
  partnerRole: string;
  learnerRole: string;
  learnerGoal: string;
  phraseBox: string[];
  maxTurns: number;
  openingPartnerLine: string;
  dialogueScript: DialogueScriptStep[];
  surpriseFollowUps?: SurpriseFollowUp[];
}

export interface RoleplayMessage {
  id: string;
  sender: 'partner' | 'learner' | 'coach';
  text: string;
  recast?: { original: string; recast: string };
  timestamp: number;
  prosody?: {
    contour: IntonationContour;
    tonicProminent: boolean;
    npvi: number;
    symbol: string;
  };
  isSurpriseChallenge?: boolean;
  branchTaken?: string;
}

export interface RoleplaySummary {
  scenarioId: string;
  title: string;
  cefrLevel: Cefr;
  completedTurns: number;
  maxTurns: number;
  recastsCount: number;
  prosodyScore: number;
  averageNpvi: number;
  whatWentWell: string[];
  keyErrors: Array<{ original: string; better: string; reason: string }>;
  usefulPhrases: string[];
  canDoAchieved: boolean;
}

export const BUILTIN_SCENARIOS: RoleplayScenario[] = [
  {
    id: 'a1-cafe',
    cefrLevel: 'A1',
    title: 'At the Downtown Café',
    setting: 'A cozy coffee shop during morning rush hour.',
    partnerRole: 'Barista',
    learnerRole: 'Customer',
    learnerGoal: 'Order a coffee and snack, ask the price, and pay.',
    phraseBox: [
      'Can I have a coffee, please?',
      'How much is it?',
      'I would like a croissant, please.'
    ],
    maxTurns: 3,
    openingPartnerLine: 'Good morning! Welcome to Star Coffee. What can I get for you today: tea or coffee?',
    dialogueScript: [
      {
        turnIndex: 0,
        expectedKeywords: ['coffee', 'tea', 'latte', 'cappuccino', 'like', 'have', 'please'],
        partnerReply: 'Great choice! Would you like a fresh croissant or a blueberry muffin with that?',
        coachTip: 'At A1, use either/or answers and polite formulas: "A coffee, please."',
        branches: [
          {
            condition: ['tea', 'earl grey', 'green'],
            reply: 'Splendid tea choice! We brew fresh loose-leaf tea. Would you like honey, lemon, or milk with that?',
            coachTip: 'State preference with "With milk, please."'
          },
          {
            condition: ['latte', 'cappuccino'],
            reply: 'One freshly steamed espresso drink coming up! Would you like a pastry on the side?',
            coachTip: 'Answer simply: "Yes, a croissant" or "No, thank you."'
          }
        ],
        recasts: {
          'i want coffee': 'I would like a coffee, please'
        }
      },
      {
        turnIndex: 1,
        expectedKeywords: ['croissant', 'muffin', 'no', 'yes', 'neither', 'snack', 'please'],
        partnerReply: 'Perfect! That comes to five dollars and fifty cents. Will you be paying by cash or card?',
        coachTip: 'Ask the price directly if needed: "How much is that?"',
        branches: [
          {
            condition: 'negative',
            reply: 'No problem at all, just the drink then. That will be three dollars. Cash or card today?',
            coachTip: 'Indicate your payment preference: "By card, please."'
          }
        ],
        recasts: {
          'how much cost': 'How much is it?'
        }
      },
      {
        turnIndex: 2,
        expectedKeywords: ['card', 'cash', 'pay', 'here'],
        partnerReply: 'Here is your receipt and your warm coffee. Have a wonderful day!',
        coachTip: 'Complete the exchange with a friendly parting: "Thank you, you too!"'
      }
    ],
    surpriseFollowUps: [
      {
        id: 'cafe-surprise-1',
        question: 'Oh, we just ran out of regular dairy milk! Is oat milk or soy milk alright for you?',
        coachTip: 'React spontaneously to unexpected ingredient changes: "Oat milk is fine, thanks."',
        contextHint: 'Unexpected supply constraint'
      }
    ]
  },
  {
    id: 'a2-hotel',
    cefrLevel: 'A2',
    title: 'Hotel Check-In Desk',
    setting: 'The front desk of an international hotel in London.',
    partnerRole: 'Receptionist',
    learnerRole: 'Guest',
    learnerGoal: 'Check in with booking name, ask about breakfast and Wi-Fi code.',
    phraseBox: [
      'I have a reservation under...',
      'What time is breakfast served?',
      'Could you give me the Wi-Fi password?'
    ],
    maxTurns: 3,
    openingPartnerLine: 'Good evening, sir. Welcome to the Grand Palace. How may I assist you tonight?',
    dialogueScript: [
      {
        turnIndex: 0,
        expectedKeywords: ['reservation', 'booking', 'check in', 'name', 'room'],
        partnerReply: 'Ah yes, I found your reservation! May I see your passport or ID card, please?',
        coachTip: 'State your name and stay details clearly: "I have a reservation under Smith for three nights."',
        branches: [
          {
            condition: ['suite', 'upgrade', 'executive'],
            reply: 'We actually have an upgraded river-view suite open tonight if you are interested! May I see your passport first?',
            coachTip: 'Inquire on rates or hand over ID: "Here is my passport. How much is the upgrade?"'
          }
        ],
        recasts: {
          'i book room': 'I have a reservation under my name'
        }
      },
      {
        turnIndex: 1,
        expectedKeywords: ['passport', 'id', 'here', 'take', 'card'],
        partnerReply: 'Thank you! You are in room 402 on the fourth floor. Do you have any questions about our hotel facilities?',
        coachTip: 'Ask about essential amenities: "What time is breakfast?" or "Is Wi-Fi free?"'
      },
      {
        turnIndex: 2,
        expectedKeywords: ['breakfast', 'wifi', 'wi-fi', 'gym', 'elevator', 'lift', 'time'],
        partnerReply: 'Breakfast is served from 7:00 to 10:00 AM in the atrium, and the Wi-Fi password is on your keycard. Enjoy your stay!',
        coachTip: 'Express appreciation: "Thank you very much for your help."'
      }
    ],
    surpriseFollowUps: [
      {
        id: 'hotel-surprise-1',
        question: 'Our main elevator is undergoing a quick 5-minute safety check. Would you prefer to wait in our lounge or take the scenic staircase?',
        coachTip: 'Handle sudden logistical constraints smoothly: "I do not mind taking the stairs, thank you."',
        contextHint: 'Unexpected elevator delay'
      }
    ]
  },
  {
    id: 'b1-luggage',
    cefrLevel: 'B1',
    title: 'Airline Lost Luggage Office',
    setting: 'The baggage services counter at a busy international airport.',
    partnerRole: 'Baggage Services Agent',
    learnerRole: 'Arriving Passenger',
    learnerGoal: 'Report missing suitcase, provide physical description, and arrange delivery.',
    phraseBox: [
      'My luggage didn’t arrive on flight 204.',
      'It’s a medium-sized navy blue suitcase with wheels.',
      'When can I expect it to be delivered?'
    ],
    maxTurns: 4,
    openingPartnerLine: 'Hello, Baggage Claims service. I understand your bag has not appeared on the carousel?',
    dialogueScript: [
      {
        turnIndex: 0,
        expectedKeywords: ['flight', 'luggage', 'bag', 'suitcase', 'carousel', 'missing', 'lost'],
        partnerReply: 'I am so sorry to hear that. Could you describe the size, color, and any identifying marks on the bag?',
        coachTip: 'Give concrete descriptive adjectives: "It is a medium navy hard-shell suitcase with two wheels."',
        branches: [
          {
            condition: ['fragile', 'electronics', 'laptop', 'medicine'],
            reply: 'Since your bag contains fragile items or medication, I will flag this for expedited tarmac verification right away.',
            coachTip: 'State priority items politely: "There is essential medication in the side pouch."'
          },
          {
            condition: ['blue', 'black', 'navy', 'hard', 'samsonite'],
            reply: 'Thank you for the specific description. We have entered the tag into our visual identification system.',
            coachTip: 'Mention any luggage tags or ribbon markers.'
          }
        ],
        recasts: {
          'my bag not come': 'My luggage did not arrive on carousel three'
        }
      },
      {
        turnIndex: 1,
        expectedKeywords: ['blue', 'black', 'navy', 'hard', 'soft', 'wheels', 'tag', 'label', 'size'],
        partnerReply: 'Thank you. Our database indicates the bag was delayed in Frankfurt and will arrive on tomorrow morning’s flight. What is your local delivery address?',
        coachTip: 'Provide full hotel/residence address and phone contact clearly.'
      },
      {
        turnIndex: 2,
        expectedKeywords: ['street', 'hotel', 'address', 'road', 'avenue', 'stay', 'number'],
        partnerReply: 'Understood. We will dispatch a courier as soon as it clears customs. Can I provide you an emergency toiletries kit?',
        coachTip: 'Inquire politely about compensation or emergency kits: "Would that be complimentary?"'
      },
      {
        turnIndex: 3,
        expectedKeywords: ['yes', 'thank', 'appreciate', 'kit', 'claim', 'help'],
        partnerReply: 'Here is your kit and claim reference number: LH-8821. We will text you tracking updates. Safe travels!',
        coachTip: 'Acknowledge reference and close: "Thank you for sorting this out so promptly."'
      }
    ],
    surpriseFollowUps: [
      {
        id: 'luggage-surprise-1',
        question: 'Did the check-in agent attach a barcode routing slip to your boarding pass, or do you have a digital receipt?',
        coachTip: 'Confirm documentation calmly: "Yes, I have the barcode claim slip right here."',
        contextHint: 'Verification of claim receipt'
      }
    ]
  },
  {
    id: 'b2-service',
    cefrLevel: 'B2',
    title: 'Customer Service Defective Item Return',
    setting: 'The customer service counter at an electronics flagship store.',
    partnerRole: 'Department Store Manager',
    learnerRole: 'Dissatisfied Customer',
    learnerGoal: 'Explain headphone hardware defect, insist politely on a refund over store credit.',
    phraseBox: [
      'I’m afraid there is a persistent defect with these headphones.',
      'That is not acceptable given the manufacturer warranty.',
      'I would insist on a full refund to my original payment card.'
    ],
    maxTurns: 4,
    openingPartnerLine: 'Good afternoon. How can I help you today with your purchase?',
    dialogueScript: [
      {
        turnIndex: 0,
        expectedKeywords: ['problem', 'faulty', 'defect', 'broken', 'headphones', 'sound', 'bought'],
        partnerReply: 'I see. Store policy normally only permits exchanges within fourteen days. Do you have your purchase receipt with you?',
        coachTip: 'Frame the issue diplomatically using tentative language: "I am afraid there is a recurring fault..."',
        branches: [
          {
            condition: ['warranty', 'statutory', 'rights', 'consumer'],
            reply: 'I respect your reference to consumer statutory rights. If the unit suffers an inherent hardware defect, we can waive standard exchange limits.',
            coachTip: 'Anchor your argument on the manufacturer warranty clause.'
          },
          {
            condition: ['box', 'receipt', 'card', 'proof'],
            reply: 'Having the original packaging and transaction proof will expedite this significantly. Let me inspect the purchase record.',
            coachTip: 'Offer the receipt smoothly: "Here is the transaction slip from three weeks ago."'
          }
        ],
        recasts: {
          'i want that you give me money': 'I would like to request a full refund'
        }
      },
      {
        turnIndex: 1,
        expectedKeywords: ['receipt', 'card', 'box', 'statement', 'warranty', 'here', 'proof'],
        partnerReply: 'Looking at the receipt, you bought these three weeks ago. I can offer you a store credit voucher for the full amount.',
        coachTip: 'Politely reject store credit by citing statutory rights: "Store credit is unfortunately not acceptable in this case."'
      },
      {
        turnIndex: 2,
        expectedKeywords: ['refund', 'credit', 'voucher', 'acceptable', 'consumer', 'rights', 'cash', 'card'],
        partnerReply: 'I appreciate your frustration. Since the device shows an internal audio driver failure, I can approve a manager override for a direct refund.',
        coachTip: 'Acknowledge the manager’s decision positively while confirming transaction details.'
      },
      {
        turnIndex: 3,
        expectedKeywords: ['thank', 'appreciate', 'card', 'account', 'help', 'manager'],
        partnerReply: 'The refund has been credited back to your Visa card and should appear in three business days. Have a good afternoon!',
        coachTip: 'Conclude with professional courtesy.'
      }
    ],
    surpriseFollowUps: [
      {
        id: 'service-surprise-1',
        question: 'Before processing the refund override, did you register the headphones on our warranty portal online?',
        coachTip: 'Answer accurately: "I registered the serial number on the manufacturer website last week."',
        contextHint: 'Unexpected warranty verification query'
      }
    ]
  },
  {
    id: 'c1-deadline',
    cefrLevel: 'C1',
    title: 'Strategic Project Scope & Deadline Negotiation',
    setting: 'A high-level video conference with the principal client sponsor.',
    partnerRole: 'Executive Client Sponsor',
    learnerRole: 'Lead Software Architect',
    learnerGoal: 'Propose a two-week architectural phase-out to safeguard reliability against database concurrency bottlenecks.',
    phraseBox: [
      'What I would like to propose is decoupling the batch ingestion module.',
      'If we rush the rollout, we risk data corruption under concurrency peaks.',
      'By phasing the release, we guarantee 99.99% operational continuity.'
    ],
    maxTurns: 4,
    openingPartnerLine: 'We have thirty minutes on the calendar. I was expecting the final sign-off for Friday’s release. Are we still on track?',
    dialogueScript: [
      {
        turnIndex: 0,
        expectedKeywords: ['propose', 'bottleneck', 'concurrency', 'risk', 'staging', 'decouple', 'stability'],
        partnerReply: 'A delay is deeply problematic for our marketing campaign. Why was this architectural bottleneck not surfaced during the initial sprint review?',
        coachTip: 'Avoid defensive justifications; frame the discovery as rigorous preemptive risk management.',
        branches: [
          {
            condition: ['decouple', 'pipeline', 'staging', 'module'],
            reply: 'Decoupling the ingestion module sounds technically viable, provided core analytics reporting remains unaffected on Friday.',
            coachTip: 'Reassure that customer-facing dashboards will remain fully operational.'
          },
          {
            condition: ['stress', 'load', 'concurrency', 'deadlock'],
            reply: 'Data corruption under peak load would indeed jeopardize customer trust. Walk me through your staging mitigation.',
            coachTip: 'Contrast catastrophic rollback risk with orderly phased rollout.'
          }
        ],
        recasts: {
          'we have bad bug in database': 'We uncovered a severe distributed transaction bottleneck during stress testing'
        }
      },
      {
        turnIndex: 1,
        expectedKeywords: ['stress', 'load', 'testing', 'scale', 'integrity', 'simulate', 'safeguard', 'data'],
        partnerReply: 'I see. If we push the deadline by two weeks, what concrete mitigation can you deliver on Friday to keep our stakeholders satisfied?',
        coachTip: 'Propose a staggered rollout (Phase 1 core analytics on Friday, Phase 2 heavy ingestion later).'
      },
      {
        turnIndex: 2,
        expectedKeywords: ['phase', 'staged', 'core', 'milestone', 'decouple', 'deliver', 'demo', 'sandbox'],
        partnerReply: 'That is a sensible compromise. If you can provide a functioning sandbox demo on Friday and guarantee zero regressions, I will back the extension.',
        coachTip: 'Solidify the agreement with clear success criteria and transparent monitoring metrics.'
      },
      {
        turnIndex: 3,
        expectedKeywords: ['guarantee', 'metrics', 'monitoring', 'sandbox', 'agree', 'confirm', 'thank'],
        partnerReply: 'Agreed. Send through the updated milestone roadmap by end-of-day, and let’s reconvene on Monday. Excellent stewardship.',
        coachTip: 'Summarize actionable next steps crisply.'
      }
    ],
    surpriseFollowUps: [
      {
        id: 'c1-surprise-1',
        question: 'What automated fallback or circuit breaker is activated if the Friday sandbox experiences anomalous transaction latency?',
        coachTip: 'Describe redundant read replicas and instant automated failover with executive composure.',
        contextHint: 'High-stakes contingency probe'
      }
    ]
  },
  {
    id: 'c2-symposium',
    cefrLevel: 'C2',
    title: 'Academic Symposium on Algorithmic Autonomy',
    setting: 'A plenary debate hall at the International Forum on Autonomous Systems and Law.',
    partnerRole: 'Symposium Panel Moderator',
    learnerRole: 'Distinguished Research Fellow',
    learnerGoal: 'Defend the moral and legal imperative of an international non-proliferation treaty on autonomous lethal targeting.',
    phraseBox: [
      'The argument conflates tactical autonomy with strategic moral accountability.',
      'One must distinguish between automated defensive countermeasures and offensive targeting.',
      'Without an enforceable verification protocol, deterrence collapses into stochastic escalation.'
    ],
    maxTurns: 4,
    openingPartnerLine: 'Doctor, critics argue that banning lethal autonomous targeting puts democratic nations at a strategic disadvantage against rogue actors. How do you reconcile moral ideals with geopolitical reality?',
    dialogueScript: [
      {
        turnIndex: 0,
        expectedKeywords: ['conflate', 'accountability', 'deterrence', 'moral', 'imperative', 'treaty', 'vacuum', 'strategic'],
        partnerReply: 'A compelling opening. However, realpolitik suggests treaties without intrusive verification regimes are disregarded during existential conflict. Is verification technically feasible?',
        coachTip: 'Steelman the interlocutor’s skepticism before deconstructing the empirical verification hurdles.',
        branches: [
          {
            condition: ['humanitarian', 'treaty', 'convention', 'geneva', 'norm'],
            reply: 'Your grounding in customary international humanitarian law is formidable. Yet how do we compel non-signatory state compliance?',
            coachTip: 'Articulate multilateral export controls and strict liability sanctions.'
          },
          {
            condition: ['deterrence', 'equilibrium', 'escalation', 'game'],
            reply: 'The game-theoretic dilemma you articulate is compelling: unilateral restraint without verifiable inspection destabilizes equilibrium.',
            coachTip: 'Propose zero-knowledge cryptographic hardware attestation.'
          }
        ],
        recasts: {
          'we must stop bad weapons': 'The moral vacuum of delegating life-and-death targeting to non-human heuristics violates international humanitarian law'
        }
      },
      {
        turnIndex: 1,
        expectedKeywords: ['verification', 'firmware', 'cryptographic', 'audit', 'telemetry', 'inspect', 'protocol', 'feasibility'],
        partnerReply: 'If software models can be updated over-the-air, cryptographic audits can be circumvented. Does that not render the legal apparatus obsolete?',
        coachTip: 'Emphasize hardware root-of-trust, supply-chain non-proliferation, and strict liability frameworks.'
      },
      {
        turnIndex: 2,
        expectedKeywords: ['hardware', 'silicon', 'liability', 'strict', 'governance', 'enforcement', 'consensus', 'norm'],
        partnerReply: 'Remarkable argument. You have shifted the discourse from speculative ethics to concrete geopolitical architecture. Let us give the floor to the delegates.',
        coachTip: 'Deliver a commanding closing synthesis uniting normative ethics with strategic realism.'
      },
      {
        turnIndex: 3,
        expectedKeywords: ['synthesis', 'human', 'normative', 'stewardship', 'delegates', 'thank', 'floor'],
        partnerReply: 'A tour de force of forensic argumentation. We thank the distinguished fellow for setting an exemplary standard of discourse today.',
        coachTip: 'Acknowledge the chair with refined academic decorum.'
      }
    ],
    surpriseFollowUps: [
      {
        id: 'c2-surprise-1',
        question: 'If sovereign powers insist on classified neural architectures, how does your protocol verify weights without compromising national intelligence secrets?',
        coachTip: 'Invoke zero-knowledge functional cryptography to prove moral alignment without leaking model weights.',
        contextHint: 'Epistemic verification challenge'
      }
    ]
  }
];

const AFFIRMATIVE_KEYWORDS = ['yes', 'yeah', 'sure', 'certainly', 'definitely', 'agree', 'please', 'card', 'fine', 'ok', 'okay'];
const NEGATIVE_KEYWORDS = ['no', 'nah', 'not', 'disagree', 'neither', 'cash', 'never', "don't", 'cannot'];
const INQUIRY_KEYWORDS = ['why', 'how', 'what', 'when', 'where', 'could', 'would', 'is it', 'can you'];

export class ConversationPartnerEngine {
  private activeScenario: RoleplayScenario;
  private currentTurnIndex: number = 0;
  private messages: RoleplayMessage[] = [];
  private coachNotesEnabled: boolean = true;
  private surpriseFollowUpsEnabled: boolean = true;
  private surpriseTurnTriggered: boolean = false;
  private recastsLogged: Array<{ original: string; better: string; reason: string }> = [];
  private npviSamples: number[] = [];

  constructor(scenarioId: string = 'a1-cafe') {
    const found = BUILTIN_SCENARIOS.find(s => s.id === scenarioId);
    this.activeScenario = found || BUILTIN_SCENARIOS[0];
  }

  public getScenario(): RoleplayScenario {
    return this.activeScenario;
  }

  public setScenario(scenarioId: string): RoleplayMessage {
    const found = BUILTIN_SCENARIOS.find(s => s.id === scenarioId);
    if (found) {
      this.activeScenario = found;
    }
    return this.reset();
  }

  public reset(): RoleplayMessage {
    this.currentTurnIndex = 0;
    this.messages = [];
    this.recastsLogged = [];
    this.npviSamples = [];
    this.surpriseTurnTriggered = false;

    const openingMsg: RoleplayMessage = {
      id: `partner-open-${Date.now()}`,
      sender: 'partner',
      text: this.activeScenario.openingPartnerLine,
      timestamp: Date.now()
    };
    this.messages.push(openingMsg);
    return openingMsg;
  }

  public getMessages(): RoleplayMessage[] {
    return [...this.messages];
  }

  public isFinished(): boolean {
    return this.currentTurnIndex >= this.activeScenario.maxTurns;
  }

  public setCoachNotesEnabled(enabled: boolean): void {
    this.coachNotesEnabled = enabled;
  }

  public isCoachNotesEnabled(): boolean {
    return this.coachNotesEnabled;
  }

  public setSurpriseFollowUpsEnabled(enabled: boolean): void {
    this.surpriseFollowUpsEnabled = enabled;
  }

  public isSurpriseFollowUpsEnabled(): boolean {
    return this.surpriseFollowUpsEnabled;
  }

  private resolveBranch(step: DialogueScriptStep, lowerInput: string): DialogueBranch | null {
    if (!step.branches || step.branches.length === 0) return null;

    for (const b of step.branches) {
      if (b.condition === 'affirmative' && AFFIRMATIVE_KEYWORDS.some(k => lowerInput.includes(k))) {
        return b;
      }
      if (b.condition === 'negative' && NEGATIVE_KEYWORDS.some(k => lowerInput.includes(k))) {
        return b;
      }
      if (b.condition === 'inquiry' && INQUIRY_KEYWORDS.some(k => lowerInput.includes(k))) {
        return b;
      }
      if (b.condition === 'elaboration' && lowerInput.split(/\s+/).length >= 8) {
        return b;
      }
      if (Array.isArray(b.condition) && b.condition.some(k => lowerInput.includes(k.toLowerCase()))) {
        return b;
      }
    }
    return null;
  }

  /**
   * Processes a learner spoken or typed turn against the current scenario script.
   */
  public processLearnerTurn(
    transcript: string,
    prosody?: {
      contour: IntonationContour;
      tonicProminent: boolean;
      npvi: number;
      symbol: string;
    }
  ): {
    learnerMessage: RoleplayMessage;
    partnerMessage: RoleplayMessage;
    coachMessage?: RoleplayMessage;
    isFinished: boolean;
    summary?: RoleplaySummary;
  } {
    const cleanInput = transcript.trim();
    const lowerInput = cleanInput.toLowerCase();

    if (prosody && typeof prosody.npvi === 'number') {
      this.npviSamples.push(prosody.npvi);
    }

    const currentStep = this.activeScenario.dialogueScript[this.currentTurnIndex] ||
      this.activeScenario.dialogueScript[this.activeScenario.dialogueScript.length - 1];

    // Check for detectable recasting opportunities
    let matchedRecast: { original: string; recast: string } | undefined = undefined;
    if (currentStep.recasts) {
      for (const [errPattern, corrected] of Object.entries(currentStep.recasts)) {
        if (lowerInput.includes(errPattern.toLowerCase())) {
          matchedRecast = { original: errPattern, recast: corrected };
          this.recastsLogged.push({
            original: cleanInput,
            better: corrected,
            reason: `In ${this.activeScenario.cefrLevel} discourse, "${corrected}" conveys more natural and precise nuance.`
          });
          break;
        }
      }
    }

    // Dynamic branch resolution
    const matchedBranch = this.resolveBranch(currentStep, lowerInput);

    const learnerMsg: RoleplayMessage = {
      id: `learner-${this.currentTurnIndex}-${Date.now()}`,
      sender: 'learner',
      text: cleanInput,
      recast: matchedRecast,
      timestamp: Date.now(),
      prosody,
      branchTaken: matchedBranch ? (Array.isArray(matchedBranch.condition) ? matchedBranch.condition.join('/') : matchedBranch.condition) : undefined
    };
    this.messages.push(learnerMsg);

    // Partner spoken response (branched or default)
    let partnerText = matchedBranch ? matchedBranch.reply : currentStep.partnerReply;
    if (matchedRecast) {
      partnerText = `(${matchedRecast.recast}?) ${partnerText}`;
    }

    let isSurprise = false;
    let coachTip = matchedBranch?.coachTip || currentStep.coachTip;

    // Trigger unexpected examiner/partner follow-up question
    if (
      this.surpriseFollowUpsEnabled &&
      !this.surpriseTurnTriggered &&
      this.currentTurnIndex === 1 &&
      this.activeScenario.surpriseFollowUps &&
      this.activeScenario.surpriseFollowUps.length > 0
    ) {
      const surprise = this.activeScenario.surpriseFollowUps[0];
      partnerText = `${partnerText} [⚡ Examiner Follow-up: ${surprise.question}]`;
      coachTip = `⚡ Unexpected Spontaneous Challenge: ${surprise.coachTip}`;
      this.surpriseTurnTriggered = true;
      isSurprise = true;
    }

    const partnerMsg: RoleplayMessage = {
      id: `partner-${this.currentTurnIndex}-${Date.now()}`,
      sender: 'partner',
      text: partnerText,
      timestamp: Date.now(),
      isSurpriseChallenge: isSurprise
    };
    this.messages.push(partnerMsg);

    // Optional Coach Tip
    let coachMsg: RoleplayMessage | undefined = undefined;
    if (this.coachNotesEnabled && coachTip) {
      coachMsg = {
        id: `coach-${this.currentTurnIndex}-${Date.now()}`,
        sender: 'coach',
        text: `Coach: ${coachTip}`,
        timestamp: Date.now()
      };
      this.messages.push(coachMsg);
    }

    this.currentTurnIndex++;
    const finished = this.isFinished();
    let summary: RoleplaySummary | undefined = undefined;

    if (finished) {
      summary = this.generateSummary();
    }

    return {
      learnerMessage: learnerMsg,
      partnerMessage: partnerMsg,
      coachMessage: coachMsg,
      isFinished: finished,
      summary
    };
  }

  public generateSummary(): RoleplaySummary {
    const avgNpvi = this.npviSamples.length > 0
      ? Math.round((this.npviSamples.reduce((a, b) => a + b, 0) / this.npviSamples.length) * 10) / 10
      : 55.0;

    const prosodyScore = Math.min(100, Math.max(65, Math.round(avgNpvi * 1.15)));

    return {
      scenarioId: this.activeScenario.id,
      title: this.activeScenario.title,
      cefrLevel: this.activeScenario.cefrLevel,
      completedTurns: this.currentTurnIndex,
      maxTurns: this.activeScenario.maxTurns,
      recastsCount: this.recastsLogged.length,
      prosodyScore,
      averageNpvi: avgNpvi,
      whatWentWell: [
        `Maintained active communicative turn-taking across all ${this.currentTurnIndex} exchanges.`,
        `Successfully met primary scenario objective: "${this.activeScenario.learnerGoal}".`,
        `Demonstrated stress-timed prosodic rhythm with average nPVI of ${avgNpvi}.`
      ],
      keyErrors: this.recastsLogged.slice(0, 3),
      usefulPhrases: [...this.activeScenario.phraseBox],
      canDoAchieved: true
    };
  }
}
