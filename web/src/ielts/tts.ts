import { ListeningSection } from './types';

let voices: SpeechSynthesisVoice[] = [];
const load = () => { voices = window.speechSynthesis.getVoices(); };
if ('speechSynthesis' in window) { load(); window.speechSynthesis.addEventListener('voiceschanged', load); }

const FEMALE = /female|zira|hazel|susan|samantha|karen|catherine|libby|sonia|natasha|aria|jenny|emma|moira|tessa|serena|olivia/i;
const MALE = /\bmale\b|david|george|mark|daniel|ryan|guy|james|richard|william|alex|oliver|thomas|gordon/i;

/** Pick a distinct voice per speaker: language first, then gender by voice name, else rotate. Pitch separates same-voice fallbacks. */
function pickVoice(lang: string, gender: 'f' | 'm', taken: Set<string>): SpeechSynthesisVoice | null {
  const en = voices.filter(v => v.lang.replace('_', '-').startsWith('en'));
  const pool = [...en.filter(v => v.lang.replace('_', '-') === lang), ...en];
  const want = gender === 'f' ? FEMALE : MALE;
  return pool.find(v => want.test(v.name) && !taken.has(v.name)) || pool.find(v => !taken.has(v.name)) || pool[0] || null;
}

export const ttsAvailable = (): boolean => 'speechSynthesis' in window;

export interface Playback { stop(): void }

/** Reads a section line by line with one voice per speaker. onLine fires as each line starts; onEnd when finished (not when stopped). */
export function playSection(sec: ListeningSection, opts: { rate?: number; onLine?: (i: number) => void; onEnd?: () => void }): Playback {
  const synth = window.speechSynthesis;
  synth.cancel();
  const taken = new Set<string>();
  const map = new Map<string, { v: SpeechSynthesisVoice | null; pitch: number }>();
  for (const sp of sec.speakers) {
    const v = pickVoice(sp.lang, sp.gender, taken);
    if (v) taken.add(v.name);
    map.set(sp.name, { v, pitch: sp.gender === 'f' ? 1.1 : 0.9 });
  }
  let stopped = false;
  const next = (i: number) => {
    if (stopped) return;
    if (i >= sec.script.length) { opts.onEnd?.(); return; }
    const line = sec.script[i];
    const u = new SpeechSynthesisUtterance(line.text);
    const m = map.get(line.speaker);
    if (m?.v) { u.voice = m.v; u.lang = m.v.lang; }
    u.pitch = m?.pitch ?? 1;
    u.rate = opts.rate ?? 0.95;
    u.onstart = () => opts.onLine?.(i);
    u.onend = () => setTimeout(() => next(i + 1), 450);
    u.onerror = () => { if (!stopped) setTimeout(() => next(i + 1), 450); };
    synth.speak(u);
  };
  next(0);
  return { stop() { stopped = true; synth.cancel(); } };
}
