export interface CollocationSpotStatus {
  phrase: string;
  spotted: boolean;
  timestampSec?: number;
}

export class CollocationSpotter {
  public isVoiceAvailable: boolean = false;
  public isListening: boolean = false;

  private recognition: any = null;
  private targets: Map<string, CollocationSpotStatus> = new Map();
  private startTime: number = 0;
  private onSpottedCb?: (phrase: string, timestampSec: number) => void;

  constructor() {
    this.checkVoiceAvailability();
  }

  private checkVoiceAvailability(): void {
    if (typeof window === 'undefined') {
      this.isVoiceAvailable = false;
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.isVoiceAvailable = !!SpeechRecognition;
  }

  public setTargetCollocations(phrases: string[]): void {
    this.targets.clear();
    for (const phrase of phrases) {
      const clean = phrase.trim();
      if (clean) {
        this.targets.set(clean.toLowerCase(), {
          phrase: clean,
          spotted: false
        });
      }
    }
  }

  public startListening(onSpotted?: (phrase: string, timestampSec: number) => void): void {
    this.onSpottedCb = onSpotted;
    this.startTime = Date.now();
    this.isListening = true;

    if (!this.isVoiceAvailable) return;

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += ' ' + event.results[i][0].transcript;
        }
        this.processTranscript(transcript);
      };

      this.recognition.onerror = () => {
        // Degrade silently without throwing
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch {}
        }
      };

      this.recognition.start();
    } catch {
      this.isVoiceAvailable = false;
    }
  }

  public stopListening(): void {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }
  }

  public manualToggle(phrase: string): void {
    const key = phrase.toLowerCase();
    const entry = this.targets.get(key);
    if (entry) {
      entry.spotted = !entry.spotted;
      if (entry.spotted) {
        entry.timestampSec = Math.max(0, (Date.now() - this.startTime) / 1000);
        if (this.onSpottedCb) {
          this.onSpottedCb(entry.phrase, entry.timestampSec);
        }
      }
    }
  }

  public getStatus(): CollocationSpotStatus[] {
    return Array.from(this.targets.values());
  }

  public reset(): void {
    for (const entry of this.targets.values()) {
      entry.spotted = false;
      entry.timestampSec = undefined;
    }
  }

  private processTranscript(text: string): void {
    const nowSec = Math.max(0, (Date.now() - this.startTime) / 1000);
    for (const [key, entry] of this.targets.entries()) {
      if (!entry.spotted && CollocationSpotter.fuzzyMatchPhrase(text, key)) {
        entry.spotted = true;
        entry.timestampSec = nowSec;
        if (this.onSpottedCb) {
          this.onSpottedCb(entry.phrase, nowSec);
        }
      }
    }
  }

  public static fuzzyMatchPhrase(spokenText: string, targetPhrase: string): boolean {
    const spokenTokens = this.cleanTokens(spokenText);
    const targetTokens = this.cleanTokens(targetPhrase);
    if (targetTokens.length === 0 || spokenTokens.length === 0) return false;

    const n = targetTokens.length;
    for (let i = 0; i <= spokenTokens.length - n; i++) {
      let allMatched = true;
      for (let j = 0; j < n; j++) {
        const sTok = spokenTokens[i + j];
        const tTok = targetTokens[j];

        if (sTok === tTok) continue;
        if (sTok.startsWith(tTok) || tTok.startsWith(sTok)) continue;
        if (this.levenshtein(sTok, tTok) <= 1) continue;

        allMatched = false;
        break;
      }
      if (allMatched) return true;
    }
    return false;
  }

  private static cleanTokens(str: string): string[] {
    return str.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  }

  public static levenshtein(a: string, b: string): number {
    const al = a.length;
    const bl = b.length;
    if (al === 0) return bl;
    if (bl === 0) return al;

    const matrix: number[][] = Array.from({ length: al + 1 }, () => new Array(bl + 1).fill(0));
    for (let i = 0; i <= al; i++) matrix[i][0] = i;
    for (let j = 0; j <= bl; j++) matrix[0][j] = j;

    for (let i = 1; i <= al; i++) {
      for (let j = 1; j <= bl; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[al][bl];
  }
}
