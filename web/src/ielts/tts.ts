import { ListeningSection } from './types';
import {
  AudioSynthesizer,
  AccentCadenceType,
  AccentCadenceModel,
  ACCENT_CADENCE_MODELS
} from '../core/audio-synthesizer';

let voices: SpeechSynthesisVoice[] = [];
const load = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    voices = window.speechSynthesis.getVoices();
  }
};

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  load();
  window.speechSynthesis.addEventListener('voiceschanged', load);
}

const FEMALE = /female|zira|hazel|susan|samantha|karen|catherine|libby|sonia|natasha|aria|jenny|emma|moira|tessa|serena|olivia/i;
const MALE = /\bmale\b|david|george|mark|daniel|ryan|guy|james|richard|william|alex|oliver|thomas|gordon/i;

// Global settings for IELTS audio player
let preferredAccent: AccentCadenceType = 'uk-rp';
let roomAmbienceEnabled: boolean = false;
const activePlaybacks = new Set<Playback>();

export function setPreferredAccent(accent: AccentCadenceType): void {
  if (ACCENT_CADENCE_MODELS[accent]) {
    preferredAccent = accent;
    AudioSynthesizer.setCadence(accent);
  }
}

export function getPreferredAccent(): AccentCadenceType {
  return preferredAccent;
}

export function setExamRoomAmbience(enabled: boolean): void {
  roomAmbienceEnabled = enabled;
  AudioSynthesizer.playExamRoomAmbience(enabled);
}

export function isExamRoomAmbienceEnabled(): boolean {
  return roomAmbienceEnabled || AudioSynthesizer.isExamRoomAmbienceActive();
}

export function getAccentCadenceModels(): AccentCadenceModel[] {
  return AudioSynthesizer.getAvailableCadences();
}

/** Pick a distinct voice per speaker: language/accent first, then gender by voice name, else rotate. */
function pickVoice(
  lang: string,
  gender: 'f' | 'm',
  taken: Set<string>,
  accent?: AccentCadenceType
): SpeechSynthesisVoice | null {
  const en = voices.filter(v => v.lang.replace('_', '-').startsWith('en'));
  const want = gender === 'f' ? FEMALE : MALE;

  // 1. If explicit accent specified, prioritize accent-specific voice pool
  if (accent && ACCENT_CADENCE_MODELS[accent]) {
    const model = ACCENT_CADENCE_MODELS[accent];
    // Check preferred voice names with matching gender
    for (const pattern of model.preferredVoiceNames) {
      const v = en.find(x => pattern.test(x.name) && want.test(x.name) && !taken.has(x.name));
      if (v) return v;
    }
    // Check language prefix with matching gender
    for (const prefix of model.langPrefixes) {
      const cleanPrefix = prefix.toLowerCase().replace('_', '-');
      const v = en.find(x => x.lang.toLowerCase().replace('_', '-').startsWith(cleanPrefix) && want.test(x.name) && !taken.has(x.name));
      if (v) return v;
    }
  }

  // 2. Language pool matching speaker definition
  const pool = [...en.filter(v => v.lang.replace('_', '-') === lang), ...en];
  return pool.find(v => want.test(v.name) && !taken.has(v.name)) || pool.find(v => !taken.has(v.name)) || pool[0] || null;
}

export const ttsAvailable = (): boolean => typeof window !== 'undefined' && 'speechSynthesis' in window;

export interface Playback {
  stop(): void;
}

export interface PlaySectionOptions {
  rate?: number;
  accent?: AccentCadenceType;
  roomAmbience?: boolean;
  onLine?: (i: number) => void;
  onEnd?: () => void;
}

/**
 * Reads a listening section line by line with multi-accent support and optional Cambridge room acoustics.
 * onLine fires as each line starts; onEnd when finished (not when stopped).
 */
export function playSection(sec: ListeningSection, opts: PlaySectionOptions = {}): Playback {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    opts.onEnd?.();
    return { stop() {} };
  }

  const synth = window.speechSynthesis;
  synth.cancel();

  const activeAccent = opts.accent || preferredAccent;
  const shouldPlayAmbience = opts.roomAmbience ?? roomAmbienceEnabled;
  let roomStarted = false;

  if (shouldPlayAmbience) {
    AudioSynthesizer.playExamRoomAmbience(true);
    roomStarted = true;
  }

  const taken = new Set<string>();
  const map = new Map<string, { v: SpeechSynthesisVoice | null; pitch: number }>();
  for (const sp of sec.speakers) {
    const v = pickVoice(sp.lang, sp.gender, taken, activeAccent);
    if (v) taken.add(v.name);
    map.set(sp.name, { v, pitch: sp.gender === 'f' ? 1.1 : 0.9 });
  }

  let stopped = false;
  let sectionTimer: any = null;
  const next = (i: number) => {
    if (stopped) return;
    if (i >= sec.script.length) {
      if (roomStarted && !roomAmbienceEnabled) {
        AudioSynthesizer.playExamRoomAmbience(false);
      }
      activePlaybacks.delete(playback);
      opts.onEnd?.();
      return;
    }

    const line = sec.script[i];
    const u = new SpeechSynthesisUtterance(line.text);
    const m = map.get(line.speaker);
    if (m?.v) {
      u.voice = m.v;
      u.lang = m.v.lang;
    }
    u.pitch = m?.pitch ?? 1;
    u.rate = opts.rate ?? AudioSynthesizer.getCadenceModel(activeAccent).rate;
    u.onstart = () => opts.onLine?.(i);
    u.onend = () => {
      if (!stopped) sectionTimer = setTimeout(() => next(i + 1), 450);
    };
    u.onerror = () => {
      if (!stopped) sectionTimer = setTimeout(() => next(i + 1), 450);
    };
    synth.speak(u);
  };

  next(0);

  const playback: Playback = {
    stop() {
      stopped = true;
      if (sectionTimer) {
        clearTimeout(sectionTimer);
        sectionTimer = null;
      }
      synth.cancel();
      if (roomStarted && !roomAmbienceEnabled) {
        AudioSynthesizer.playExamRoomAmbience(false);
      }
      activePlaybacks.delete(playback);
    }
  };
  activePlaybacks.add(playback);
  return playback;
}

export interface PlayTextOptions {
  rate?: number;
  pitch?: number;
  lang?: string;
  accent?: AccentCadenceType;
  roomAmbience?: boolean;
  onEnd?: () => void;
}

/**
 * Synthesizes arbitrary text (e.g. speaking model answers, examiner questions),
 * chunked with multi-accent cadence models and punctuation micro-pauses (200-450ms)
 * to avoid Chromium stalls and provide natural exam pacing.
 */
export function playText(text: string, opts?: PlayTextOptions): Playback {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    opts?.onEnd?.();
    return { stop() {} };
  }

  const synth = window.speechSynthesis;
  synth.cancel();

  const activeAccent = opts?.accent || preferredAccent;
  const cadenceModel = AudioSynthesizer.getCadenceModel(activeAccent);
  const shouldPlayAmbience = opts?.roomAmbience ?? roomAmbienceEnabled;
  let roomStarted = false;

  if (shouldPlayAmbience) {
    AudioSynthesizer.playExamRoomAmbience(true);
    roomStarted = true;
  }

  let stopped = false;
  // Chunk at clauses and sentences
  const chunks = text.match(/[^.!?,;:]+[.!?,;:]*|[^.!?,;:]+$/g)?.map(s => s.trim()).filter(Boolean) || [text];

  const voice = AudioSynthesizer.getVoiceForAccent(activeAccent) ||
    voices.find(x => x.lang.replace('_', '-').startsWith('en')) || null;

  let current = 0;
  let timer: any = null;

  const speakNext = (): void => {
    if (stopped) return;
    if (current >= chunks.length) {
      if (roomStarted && !roomAmbienceEnabled) {
        AudioSynthesizer.playExamRoomAmbience(false);
      }
      activePlaybacks.delete(playback);
      opts?.onEnd?.();
      return;
    }

    const chunk = chunks[current++];
    const u = new SpeechSynthesisUtterance(chunk);
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    } else {
      u.lang = cadenceModel.langPrefixes[0] || 'en-GB';
    }

    u.rate = opts?.rate ?? cadenceModel.rate;
    u.pitch = opts?.pitch ?? cadenceModel.pitch;

    const lastChar = chunk.slice(-1);
    const isSentenceEnd = ['.', '!', '?'].includes(lastChar);
    const isClauseEnd = [',', ';', ':', '—', '-'].includes(lastChar);
    const pauseMs = isSentenceEnd
      ? cadenceModel.periodPauseMs
      : (isClauseEnd ? cadenceModel.commaPauseMs : 150);

    u.onend = () => {
      if (!stopped) {
        timer = setTimeout(speakNext, pauseMs);
      }
    };
    u.onerror = () => {
      if (!stopped) {
        timer = setTimeout(speakNext, pauseMs);
      }
    };

    synth.speak(u);
  };

  speakNext();

  const playback: Playback = {
    stop(): void {
      stopped = true;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      synth.cancel();
      if (roomStarted && !roomAmbienceEnabled) {
        AudioSynthesizer.playExamRoomAmbience(false);
      }
      activePlaybacks.delete(playback);
    }
  };
  activePlaybacks.add(playback);
  return playback;
}

/**
 * Centrally stops all running IELTS speech playback, pending speech timers,
 * and clears ambient exam audio across views.
 */
export function stopAll(): void {
  activePlaybacks.forEach(p => p.stop());
  activePlaybacks.clear();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch {}
  }
}
