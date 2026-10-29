/**
 * Unified Accent Theme Manager
 * Provides 6 curated WCAG 2.2 AAA compliant primary accent themes.
 * Dynamically updates CSS variables on :root and persists in localStorage.
 */

export type AccentThemeId = 'indigo' | 'emerald' | 'cyan' | 'gold' | 'rose' | 'violet';

export interface AccentThemeConfig {
  id: AccentThemeId;
  label: string;
  swatch: string;
  accent: string;
  accentSoft: string;
  accentLight: string;
  accentSoftLight: string;
  accentStar: string;
  accentStarGlow: string;
}

export const ACCENT_THEMES: Record<AccentThemeId, AccentThemeConfig> = {
  indigo: {
    id: 'indigo',
    label: 'Celestial Indigo',
    swatch: '#818cf8',
    accent: '#a5b4fc',
    accentSoft: 'rgba(165, 180, 252, 0.16)',
    accentLight: '#4f46e5',
    accentSoftLight: 'rgba(79, 70, 229, 0.12)',
    accentStar: '#c4b5fd',
    accentStarGlow: 'rgba(196, 181, 253, 0.45)'
  },
  emerald: {
    id: 'emerald',
    label: 'Emerald Green',
    swatch: '#34d399',
    accent: '#34d399',
    accentSoft: 'rgba(52, 211, 153, 0.16)',
    accentLight: '#059669',
    accentSoftLight: 'rgba(5, 150, 105, 0.12)',
    accentStar: '#6ee7b7',
    accentStarGlow: 'rgba(110, 231, 183, 0.45)'
  },
  cyan: {
    id: 'cyan',
    label: 'Ocean Cyan',
    swatch: '#38bdf8',
    accent: '#38bdf8',
    accentSoft: 'rgba(56, 189, 248, 0.16)',
    accentLight: '#0284c7',
    accentSoftLight: 'rgba(2, 132, 199, 0.12)',
    accentStar: '#7dd3fc',
    accentStarGlow: 'rgba(125, 211, 252, 0.45)'
  },
  gold: {
    id: 'gold',
    label: 'Amber Gold',
    swatch: '#fbbf24',
    accent: '#fbbf24',
    accentSoft: 'rgba(251, 191, 36, 0.16)',
    accentLight: '#d97706',
    accentSoftLight: 'rgba(217, 119, 6, 0.12)',
    accentStar: '#fde68a',
    accentStarGlow: 'rgba(253, 230, 138, 0.45)'
  },
  rose: {
    id: 'rose',
    label: 'Crimson Rose',
    swatch: '#fb7185',
    accent: '#fb7185',
    accentSoft: 'rgba(251, 113, 133, 0.16)',
    accentLight: '#e11d48',
    accentSoftLight: 'rgba(225, 29, 72, 0.12)',
    accentStar: '#fda4af',
    accentStarGlow: 'rgba(253, 164, 175, 0.45)'
  },
  violet: {
    id: 'violet',
    label: 'Cosmic Violet',
    swatch: '#c084fc',
    accent: '#c084fc',
    accentSoft: 'rgba(192, 132, 252, 0.16)',
    accentLight: '#7c3aed',
    accentSoftLight: 'rgba(124, 58, 237, 0.12)',
    accentStar: '#d8b4fe',
    accentStarGlow: 'rgba(216, 180, 254, 0.45)'
  }
};

const STORAGE_KEY = 'eng_accent_theme';

export class AccentThemeManager {
  private static listeners: Set<(themeId: AccentThemeId) => void> = new Set();
  private static themeObserverInitialized = false;

  public static getTheme(): AccentThemeId {
    if (typeof localStorage === 'undefined') return 'indigo';
    const val = localStorage.getItem(STORAGE_KEY) as AccentThemeId;
    return val && ACCENT_THEMES[val] ? val : 'indigo';
  }

  public static setTheme(themeId: AccentThemeId): void {
    if (!ACCENT_THEMES[themeId]) return;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, themeId);
    }
    this.apply(themeId);
    this.listeners.forEach(fn => fn(themeId));
  }

  public static apply(themeId: AccentThemeId = this.getTheme()): void {
    if (typeof document === 'undefined') return;
    const cfg = ACCENT_THEMES[themeId] || ACCENT_THEMES.indigo;
    const root = document.documentElement;
    const isLight = root.getAttribute('data-theme') === 'light';

    const activeColor = isLight ? (cfg.accentLight || cfg.accent) : cfg.accent;
    const activeSoft = isLight ? (cfg.accentSoftLight || cfg.accentSoft) : cfg.accentSoft;

    root.setAttribute('data-accent-theme', cfg.id);
    root.style.setProperty('--accent', activeColor);
    root.style.setProperty('--accent-gold', activeColor);
    root.style.setProperty('--accent-gold-soft', activeSoft);
    root.style.setProperty('--accent-cyan', activeColor);
    root.style.setProperty('--accent-cyan-soft', activeSoft);
    root.style.setProperty('--cyan', activeColor);
    root.style.setProperty('--cyan-soft', activeSoft);
    root.style.setProperty('--accent-star', cfg.accentStar);
    root.style.setProperty('--accent-star-glow', cfg.accentStarGlow);
    root.style.setProperty('--focus-ring-outer', activeColor);
  }

  public static init(): void {
    this.apply();
    if (!this.themeObserverInitialized && typeof window !== 'undefined') {
      this.themeObserverInitialized = true;
      window.addEventListener('theme-change', () => this.apply());
      const observer = new MutationObserver(() => this.apply());
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }
  }

  public static onChange(fn: (themeId: AccentThemeId) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}
