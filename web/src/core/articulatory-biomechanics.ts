/**
 * ArticulatoryBiomechanics: Physical Mouth, Tongue & Jaw Articulatory Guidance Engine.
 * Translates acoustic formant frequencies (F1/F2) and phonemic targets into:
 * - Concrete physical biomechanical adjustments ("Lower jaw by 1cm", "Spread lips wide", etc.)
 * - Precise tongue anchor and contact points (alveolar ridge, velum, interdental)
 * - Contrastive minimal-pair mouth differential mechanics
 * - Pitch trajectory contour SVG visualizations and prosody guidance
 *
 * 100% offline, zero external dependencies.
 */

export interface ArticulatoryProfile {
  symbol: string;
  ipa: string;
  kind: 'vowel' | 'diphthong' | 'consonant';
  jawApertureMm: number;             // Approximate inter-incisal distance in mm
  jawInstruction: string;            // Physical jaw movement instruction
  tonguePosition: string;            // Exact tongue blade/dorsum placement
  lipPosture: 'spread' | 'neutral' | 'rounded' | 'protruded';
  lipInstruction: string;
  airflowMechanic: string;
  targetFormants?: { f1: number; f2: number };
  vietnameseL1Contrast?: string;     // Specific physical warning for Vietnamese speakers
}

export interface FormantAcousticDelta {
  targetF1: number;
  measuredF1: number;
  deltaF1: number;
  targetF2: number;
  measuredF2: number;
  deltaF2: number;
  jawAdjustment: string;
  tongueAdjustment: string;
  lipAdjustment: string;
  overallBiomechanicalSummary: string;
  isWithinAcousticTarget: boolean;
}

export interface MinimalPairDifferential {
  pairId: string;
  soundA: string;
  soundB: string;
  wordsExample: [string, string];
  jawDelta: string;
  tongueDelta: string;
  lipDelta: string;
  durationDelta: string;
  tactileCheckMethod: string;
}

// Canonical phonetic and biomechanical database
const PHONEME_PROFILES: Record<string, ArticulatoryProfile> = {
  // Long High Front /iː/ (fleece, seat)
  'iː': {
    symbol: 'iː',
    ipa: '/iː/',
    kind: 'vowel',
    jawApertureMm: 3,
    jawInstruction: 'Keep jaw nearly closed (only ~3mm between incisors).',
    tonguePosition: 'Arch front of tongue high toward hard palate; anchor tongue rims firmly against upper molars.',
    lipPosture: 'spread',
    lipInstruction: 'Spread lips wide in a firm horizontal smile.',
    airflowMechanic: 'Sustained tense vocal cord vibration; hold duration ~1.4x longer than short vowels.',
    targetFormants: { f1: 280, f2: 2250 },
    vietnameseL1Contrast: 'Vietnamese /i/ is shorter and less tense. In English /iː/, keep lips firmly spread and sustain the note.'
  },

  // Short Lax Front /ɪ/ (kit, sit)
  'ɪ': {
    symbol: 'ɪ',
    ipa: '/ɪ/',
    kind: 'vowel',
    jawApertureMm: 7,
    jawInstruction: 'Drop jaw ~4mm lower than /iː/ (about half-finger width).',
    tonguePosition: 'Tongue relaxed in mid-high position; release lateral tension from molars.',
    lipPosture: 'neutral',
    lipInstruction: 'Keep lips completely relaxed and unspread.',
    airflowMechanic: 'Short, lax vocal pulse; do not sustain.',
    targetFormants: { f1: 400, f2: 1900 },
    vietnameseL1Contrast: 'Do not tense lips into a smile. Let the jaw drop slightly and make a relaxed, brisk sound.'
  },

  // Low Front Open /æ/ (trap, cat)
  'æ': {
    symbol: 'æ',
    ipa: '/æ/',
    kind: 'vowel',
    jawApertureMm: 15,
    jawInstruction: 'Drop lower jaw wide open by ~1.5cm (approx. two fingers thickness).',
    tonguePosition: 'Flatten tongue body low in floor of mouth; press tongue tip gently behind lower front teeth.',
    lipPosture: 'spread',
    lipInstruction: 'Spread mouth corners outward while jaw is fully lowered.',
    airflowMechanic: 'Resonant pharyngeal cavity vowel.',
    targetFormants: { f1: 660, f2: 1720 },
    vietnameseL1Contrast: 'Vietnamese /e/ is much higher. You MUST physically lower your jaw twice as much for /æ/.'
  },

  // Mid Front /e/ (dress, bed)
  'e': {
    symbol: 'e',
    ipa: '/e/',
    kind: 'vowel',
    jawApertureMm: 8,
    jawInstruction: 'Open jaw moderately (~8mm, one index finger width).',
    tonguePosition: 'Mid-front tongue elevation; tongue sides touch upper side teeth lightly.',
    lipPosture: 'neutral',
    lipInstruction: 'Relax lips in neutral position.',
    airflowMechanic: 'Clear crisp vocal tone.',
    targetFormants: { f1: 550, f2: 1800 },
    vietnameseL1Contrast: 'Do not confuse with Vietnamese "ê" (which is higher /e/) or "e" (which is more open).'
  },

  // Low Back Open /ɑː/ (palm, father)
  'ɑː': {
    symbol: 'ɑː',
    ipa: '/ɑː/',
    kind: 'vowel',
    jawApertureMm: 16,
    jawInstruction: 'Drop jaw wide and vertically downward like at a doctor’s checkup.',
    tonguePosition: 'Retract tongue body backward and downward into throat floor.',
    lipPosture: 'neutral',
    lipInstruction: 'Lips relaxed and open without rounding.',
    airflowMechanic: 'Deep posterior resonant tone; hold for full length.',
    targetFormants: { f1: 730, f2: 1090 },
    vietnameseL1Contrast: 'Do not round your lips. Keep the throat wide and relaxed.'
  },

  // High Back Rounded /uː/ (goose, boot)
  'uː': {
    symbol: 'uː',
    ipa: '/uː/',
    kind: 'vowel',
    jawApertureMm: 4,
    jawInstruction: 'Keep jaw close together (~4mm gap).',
    tonguePosition: 'Pull tongue back and elevate tongue dorsum toward soft palate (velum).',
    lipPosture: 'protruded',
    lipInstruction: 'Pucker and round lips tightly into a small circle, pushing lips outward.',
    airflowMechanic: 'Strongly rounded lip constriction.',
    targetFormants: { f1: 300, f2: 870 },
    vietnameseL1Contrast: 'Vietnamese /u/ is less protruded. Push lips forward as if blowing a candle through a straw.'
  },

  // Mid Central Schwa /ə/ (comma, about)
  'ə': {
    symbol: 'ə',
    ipa: '/ə/',
    kind: 'vowel',
    jawApertureMm: 6,
    jawInstruction: 'Relax jaw completely in natural resting state (~6mm).',
    tonguePosition: 'Tongue sits completely neutral and flat in center of mouth, touching nothing.',
    lipPosture: 'neutral',
    lipInstruction: 'Lips completely slack and unengaged.',
    airflowMechanic: 'Minimal muscular effort; shortest vowel in English.',
    targetFormants: { f1: 500, f2: 1500 },
    vietnameseL1Contrast: 'Never stress or lengthen schwa. Give it almost zero muscular energy.'
  },

  // Voiceless Dental Fricative /θ/ (think, bath)
  'θ': {
    symbol: 'θ',
    ipa: '/θ/',
    kind: 'consonant',
    jawApertureMm: 4,
    jawInstruction: 'Part teeth slightly (~4mm).',
    tonguePosition: 'Place tongue blade flat so tip protrudes 2-3mm between upper and lower teeth. Do not bite.',
    lipPosture: 'neutral',
    lipInstruction: 'Keep lips slightly parted.',
    airflowMechanic: 'Gently blow air across top of tongue tip. Voiceless continuous friction.',
    vietnameseL1Contrast: 'Vietnamese speakers often substitute /s/ or /t/. You MUST see your tongue tip between your teeth in a mirror.'
  },

  // Voiced Dental Fricative /ð/ (this, mother)
  'ð': {
    symbol: 'ð',
    ipa: '/ð/',
    kind: 'consonant',
    jawApertureMm: 4,
    jawInstruction: 'Part teeth slightly (~4mm).',
    tonguePosition: 'Touch tongue tip lightly to edge of upper front incisors or protrude slightly.',
    lipPosture: 'neutral',
    lipInstruction: 'Relax lips in neutral position.',
    airflowMechanic: 'Add vocal cord buzzing vibration to the interdental friction.',
    vietnameseL1Contrast: 'Do not substitute with Vietnamese /d/ (which is alveolar). Keep tongue touching front incisors with vocal buzz.'
  },

  // Voiced Labiodental Fricative /v/ (van, love)
  'v': {
    symbol: 'v',
    ipa: '/v/',
    kind: 'consonant',
    jawApertureMm: 3,
    jawInstruction: 'Bring lower jaw close to upper jaw.',
    tonguePosition: 'Tongue relaxed in floor of mouth.',
    lipPosture: 'neutral',
    lipInstruction: 'Place edge of upper front teeth onto the inner moist edge of lower lip.',
    airflowMechanic: 'Force voiced air between upper teeth and lower lip. Feel intense buzzing on lower lip.',
    vietnameseL1Contrast: 'Do not substitute /w/ (both lips rounded) or /b/ (both lips closed). Only upper teeth touch lower lip.'
  },

  // Velar Nasal /ŋ/ (sing, ring)
  'ŋ': {
    symbol: 'ŋ',
    ipa: '/ŋ/',
    kind: 'consonant',
    jawApertureMm: 8,
    jawInstruction: 'Keep mouth moderately open.',
    tonguePosition: 'Press back of tongue (dorsum) firmly against soft palate to seal mouth completely.',
    lipPosture: 'neutral',
    lipInstruction: 'Keep mouth open so air only exits through nose.',
    airflowMechanic: 'Vocal vibration directed 100% through nasal passage. Never release with a /g/ or /k/ plosive at the end.',
    vietnameseL1Contrast: 'While Vietnamese has initial "ng-", English final "-ng" must not be followed by a hard release tap.'
  }
};

const MINIMAL_PAIRS: MinimalPairDifferential[] = [
  {
    pairId: 'sheep-ship',
    soundA: 'iː',
    soundB: 'ɪ',
    wordsExample: ['sheep', 'ship'],
    jawDelta: 'Drop lower jaw down by ~4mm for /ɪ/. For /iː/, jaw is held high and close.',
    tongueDelta: 'In /iː/, sides of tongue press firmly against upper molars. In /ɪ/, tongue drops and relaxes.',
    lipDelta: 'Spread lips into a wide horizontal smile for /iː/. Keep lips totally neutral and relaxed for /ɪ/.',
    durationDelta: '/iː/ is held 1.4x to 1.6x longer than /ɪ/.',
    tactileCheckMethod: 'Touch corners of your mouth with your fingers: feel active muscular tension on /iː/ and immediate release on /ɪ/.'
  },
  {
    pairId: 'bed-bad',
    soundA: 'e',
    soundB: 'æ',
    wordsExample: ['bed', 'bad'],
    jawDelta: 'Lower your jaw by an additional 7-9mm (one full finger width extra) when transitioning from /e/ to /æ/.',
    tongueDelta: 'In /e/, tongue arch is mid-level. In /æ/, tongue root pushes forward while blade flattens in mouth floor.',
    lipDelta: 'Keep lips neutral for /e/; spread mouth corners wider for /æ/.',
    durationDelta: '/æ/ is inherently longer and more open than /e/.',
    tactileCheckMethod: 'Place your thumb under your chin: you should feel your chin push down significantly harder on "bad".'
  },
  {
    pairId: 'think-sink',
    soundA: 'θ',
    soundB: 's',
    wordsExample: ['think', 'sink'],
    jawDelta: 'Teeth are open 3-4mm for /θ/; teeth are clenched closer (~1mm) for /s/.',
    tongueDelta: 'For /θ/, tongue tip must come forward between your teeth. For /s/, tongue tip pulls back behind the gum ridge.',
    lipDelta: 'Lips relaxed for /θ/; corners slightly drawn back for /s/.',
    durationDelta: 'Both can be sustained; /s/ has much higher acoustic frequency hiss.',
    tactileCheckMethod: 'Use a pocket mirror: on "think", your tongue tip MUST be visible between your front teeth. On "sink", no tongue visible.'
  }
];

export class ArticulatoryBiomechanics {
  /**
   * Retrieves articulatory profile for a given phoneme symbol.
   */
  public static getProfile(symbol: string): ArticulatoryProfile | null {
    const clean = symbol.replace(/[\/\[\]]/g, '').trim();
    return PHONEME_PROFILES[clean] || null;
  }

  /**
   * Retrieves all registered minimal pairs.
   */
  public static getMinimalPairs(): MinimalPairDifferential[] {
    return [...MINIMAL_PAIRS];
  }

  /**
   * Maps measured F1/F2 acoustic formant values to concrete physical biomechanical adjustments.
   *
   * Formant Acoustics 101:
   * - F1 is inversely related to tongue height and directly proportional to jaw opening.
   *   (Higher F1 = lower jaw / lower tongue body).
   * - F2 is directly related to tongue frontness and lip spreading.
   *   (Higher F2 = tongue fronted toward teeth, lips unrounded; Lower F2 = tongue retracted, lips rounded).
   */
  public static diagnoseFormants(
    targetSymbol: string,
    measuredF1: number,
    measuredF2: number
  ): FormantAcousticDelta | null {
    const profile = this.getProfile(targetSymbol);
    if (!profile || !profile.targetFormants) return null;

    const targetF1 = profile.targetFormants.f1;
    const targetF2 = profile.targetFormants.f2;
    const deltaF1 = measuredF1 - targetF1;
    const deltaF2 = measuredF2 - targetF2;

    const formatDeltaAdjustment = (
      delta: number,
      threshold: number,
      highMsg: string | ((d: number) => string),
      lowMsg: string | ((d: number) => string),
      targetMsg: string
    ): string => {
      if (delta > threshold) return typeof highMsg === 'function' ? highMsg(delta) : highMsg;
      if (delta < -threshold) return typeof lowMsg === 'function' ? lowMsg(Math.abs(delta)) : lowMsg;
      return targetMsg;
    };

    const jawAdjustment = formatDeltaAdjustment(
      deltaF1,
      90,
      d => `Your jaw is dropped too low by ~${(d / 200).toFixed(1)}cm. Close your lower jaw slightly and elevate your tongue blade.`,
      d => `Your jaw is too closed / tongue too high. Drop your lower jaw lower by ~${(d / 180).toFixed(1)}cm and flatten the tongue floor.`,
      'Jaw aperture is on target.'
    );

    const tongueAdjustment = formatDeltaAdjustment(
      deltaF2,
      130,
      'Your tongue is too far forward. Pull the tongue body backward toward the velum (soft palate).',
      'Your tongue is retracted too far back. Push the tongue blade forward toward the front teeth.',
      'Tongue posture is well aligned.'
    );

    const lipAdjustment = deltaF2 > 130 && (profile.lipPosture === 'rounded' || profile.lipPosture === 'protruded')
      ? 'Round and protrude your lips more tightly into an "O" shape.'
      : deltaF2 < -130 && profile.lipPosture === 'spread'
      ? 'Spread your lips wider horizontally into a clearer smile.'
      : 'Lip posture is correct.';

    const isWithinAcousticTarget = Math.abs(deltaF1) <= 90 && Math.abs(deltaF2) <= 130;

    let overallBiomechanicalSummary = '';
    if (isWithinAcousticTarget) {
      overallBiomechanicalSummary = `✓ Superb resonance! F1 (${measuredF1}Hz) and F2 (${measuredF2}Hz) match the target acoustic envelope for ${profile.ipa}.`;
    } else {
      overallBiomechanicalSummary = `Acoustic deviation detected (ΔF1: ${deltaF1 > 0 ? '+' : ''}${deltaF1}Hz, ΔF2: ${deltaF2 > 0 ? '+' : ''}${deltaF2}Hz). Follow physical adjustments above to align vocal tract resonance.`;
    }

    return {
      targetF1,
      measuredF1,
      deltaF1,
      targetF2,
      measuredF2,
      deltaF2,
      jawAdjustment,
      tongueAdjustment,
      lipAdjustment,
      overallBiomechanicalSummary,
      isWithinAcousticTarget
    };
  }

  /**
   * Generates clean SVG markup representing an intonation pitch trajectory curve.
   */
  public static generatePitchContourSvg(
    contourType: 'fall' | 'rise' | 'fall-rise' | 'rise-fall' | 'level',
    width: number = 200,
    height: number = 50
  ): string {
    const pad = 10;
    const w = width - pad * 2;
    const h = height - pad * 2;
    const topY = pad;
    const midY = pad + h / 2;
    const botY = pad + h;

    let pathD = '';
    let accentColor = 'var(--accent-gold)';

    switch (contourType) {
      case 'fall':
        // High to low curve
        pathD = `M ${pad} ${midY - 4} Q ${pad + w * 0.4} ${topY}, ${pad + w * 0.6} ${midY} T ${pad + w} ${botY}`;
        break;
      case 'rise':
        // Low to high curve
        pathD = `M ${pad} ${botY - 2} Q ${pad + w * 0.4} ${botY}, ${pad + w * 0.7} ${midY} T ${pad + w} ${topY}`;
        break;
      case 'fall-rise':
        // Plunge down then sweep up (uncertainty / reservation)
        pathD = `M ${pad} ${topY + 4} Q ${pad + w * 0.3} ${botY}, ${pad + w * 0.55} ${botY} T ${pad + w} ${midY - 4}`;
        break;
      case 'rise-fall':
        // Surge up then plunge (emphatic certainty / surprise)
        pathD = `M ${pad} ${midY + 4} Q ${pad + w * 0.35} ${topY - 4}, ${pad + w * 0.6} ${topY} T ${pad + w} ${botY}`;
        break;
      case 'level':
      default:
        pathD = `M ${pad} ${midY} L ${pad + w} ${midY}`;
        break;
    }

    return `
      <svg viewBox="0 0 ${width} ${height}" class="pitch-contour-svg" style="width: 100%; max-width: ${width}px; height: ${height}px; display: block;" aria-label="Pitch contour: ${contourType}">
        <!-- Pitch reference guidelines -->
        <line x1="${pad}" y1="${topY}" x2="${pad + w}" y2="${topY}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3,3" />
        <line x1="${pad}" y1="${midY}" x2="${pad + w}" y2="${midY}" stroke="rgba(255,255,255,0.06)" />
        <line x1="${pad}" y1="${botY}" x2="${pad + w}" y2="${botY}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3,3" />
        <!-- Dynamic pitch curve -->
        <path d="${pathD}" fill="none" stroke="${accentColor}" stroke-width="3" stroke-linecap="round" />
        <!-- Directional terminal bead -->
        <circle cx="${pad + w}" cy="${contourType === 'fall' ? botY : contourType === 'rise' ? topY : midY}" r="4" fill="${accentColor}" />
      </svg>
    `;
  }
}
