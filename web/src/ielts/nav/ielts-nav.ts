import { t } from '../../core/i18n';
import { icon, IconName } from '../../utils/icons';

const TABS: { id: string; icon: IconName; label: string }[] = [
  { id: 'home',           icon: 'compass',       label: 'ielts_nav_roadmap' },
  { id: 'reading',        icon: 'book',          label: 'ielts_nav_reading' },
  { id: 'listening',      icon: 'headphones',    label: 'ielts_nav_listening' },
  { id: 'writing-studio', icon: 'edit',          label: 'ielts_nav_writing' },
  { id: 'mock',           icon: 'graduationCap', label: 'ielts_nav_mock' },
];

export class IeltsNav {
  private el: HTMLElement;
  private active = 'home';

  constructor(mount: HTMLElement) {
    this.el = mount;
    this.render();
    this.el.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.ie-bnav-btn');
      if (btn?.dataset.route) window.location.hash = `#${btn.dataset.route}`;
    });
  }

  setActiveRoute(hash: string): void {
    const raw = (hash || '#home').replace(/^#/, '');
    let matched = 'home';
    if (raw.startsWith('reading')) matched = 'reading';
    else if (raw.startsWith('listening')) matched = 'listening';
    else if (raw.startsWith('writing')) matched = 'writing-studio';
    else if (raw.startsWith('mock')) matched = 'mock';
    else if (raw === 'home' || raw === 'roadmap' || raw === 'workout' || raw === 'daily-workout') matched = 'home';

    this.active = matched;
    this.el.querySelectorAll<HTMLButtonElement>('.ie-bnav-btn').forEach(btn => {
      const on = btn.dataset.route === this.active;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-selected', String(on));
    });
  }

  private render(): void {
    this.el.innerHTML = `<nav class="ie-bottom-nav" role="tablist" aria-label="IELTS Navigation">${
      TABS.map(tab => `<button type="button" class="ie-bnav-btn${tab.id === this.active ? ' active' : ''}"
        data-route="${tab.id}" role="tab" aria-selected="${tab.id === this.active}">
        <span class="ie-bnav-icon">${icon(tab.icon, 20)}</span>
        <span class="ie-bnav-label">${t(tab.label)}</span>
      </button>`).join('')
    }</nav>`;
  }
}

