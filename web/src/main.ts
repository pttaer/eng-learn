import { AudioSynthesizer } from './core/audio-synthesizer';
import { CursorTracker } from './core/cursor-tracker';
import { PerspectiveCanvas } from './core/perspective-canvas';
import { Router, RouteId } from './core/router';
import { HeaderHUD } from './modules/header-hud';
import { CornerCompass } from './modules/corner-compass';
import { LexiconDossier } from './modules/lexicon-dossier';
import { WritingDossier } from './modules/writing-dossier';
import { ListeningDossier } from './modules/listening-dossier';
import { SpeakingDossier } from './modules/speaking-dossier';
import { MissionLog } from './modules/mission-log';
import { StorageManager } from './utils/storage';
import collocationsData from './assets/data/collocations.json';

class App {
  private router: Router;
  private headerHud: HeaderHUD;
  private cornerCompass: CornerCompass;
  private perspectiveCanvas: PerspectiveCanvas;

  private lexiconDossier: LexiconDossier;
  private writingDossier: WritingDossier;
  private listeningDossier: ListeningDossier;
  private speakingDossier: SpeakingDossier;
  private missionLog: MissionLog;

  private workspaceMount: HTMLElement;
  private activeDossierHandle: any = null;

  constructor() {
    this.workspaceMount = document.getElementById('workspace-mount')!;

    // 1. Initialize Subsystems
    AudioSynthesizer.init();
    CursorTracker.init();

    const canvasEl = document.getElementById('canvas-2d') as HTMLCanvasElement;
    this.perspectiveCanvas = new PerspectiveCanvas(canvasEl, collocationsData);

    // 2. Initialize HUD Components
    this.headerHud = new HeaderHUD();
    document.getElementById('hud-header-mount')?.appendChild(this.headerHud.getElement());

    this.cornerCompass = new CornerCompass();
    document.getElementById('compass-mount')?.appendChild(this.cornerCompass.getElement());

    // 3. Initialize Study Dossiers
    this.lexiconDossier = new LexiconDossier();
    this.writingDossier = new WritingDossier();
    this.listeningDossier = new ListeningDossier();
    this.speakingDossier = new SpeakingDossier();
    this.missionLog = new MissionLog();

    // Bind Completion Rituals
    this.lexiconDossier.onBatchComplete = () => this.showCompletionReceipt('READ // COLLOCATIONS');
    this.writingDossier.onBatchComplete = () => this.showCompletionReceipt('WRITE // FRANKLIN COPYWORK');
    this.listeningDossier.onBatchComplete = () => this.showCompletionReceipt('LISTEN // ACTIVE TRANSCRIPTION');
    this.speakingDossier.onBatchComplete = () => this.showCompletionReceipt('SPEAK // 4-3-2 DRILL');
    this.missionLog.onDayCompleted = (day) => this.showCompletionReceipt(`MISSION DAY ${day}`);

    // 4. Initialize Router
    this.router = new Router();
    this.bindNavigation();
    this.bindKeyboardShortcuts();
  }

  private bindNavigation(): void {
    // Canvas & Urchin navigation
    this.perspectiveCanvas.onNavigate = (pillar) => {
      this.router.navigate(pillar as RouteId);
    };

    this.perspectiveCanvas.onAbsorptionStreak = () => {
      this.headerHud.updateTelemetry(this.router.getCurrentRoute());
    };

    // Compass navigation
    this.cornerCompass.onNavigate = (route) => {
      this.router.navigate(route as RouteId);
    };

    // Route listener
    this.router.onRoute((route) => {
      this.handleRouteChange(route);
    });
  }

  private handleRouteChange(route: RouteId): void {
    this.headerHud.updateTelemetry(route);
    this.workspaceMount.innerHTML = '';
    this.activeDossierHandle = null;

    if (route === 'singularity') {
      this.workspaceMount.classList.remove('workspace-active');
      this.cornerCompass.setVisible(false);
      return;
    }

    // Active workspace in foreground
    this.workspaceMount.classList.add('workspace-active');
    this.cornerCompass.setVisible(true);

    switch (route) {
      case 'read':
        this.workspaceMount.appendChild(this.lexiconDossier.render());
        this.activeDossierHandle = this.lexiconDossier;
        break;
      case 'write':
        this.workspaceMount.appendChild(this.writingDossier.render());
        this.activeDossierHandle = this.writingDossier;
        break;
      case 'listen':
        this.workspaceMount.appendChild(this.listeningDossier.render());
        this.activeDossierHandle = this.listeningDossier;
        break;
      case 'speak':
        this.workspaceMount.appendChild(this.speakingDossier.render());
        this.activeDossierHandle = this.speakingDossier;
        break;
      case 'habits':
        this.workspaceMount.appendChild(this.missionLog.render());
        this.activeDossierHandle = this.missionLog;
        break;
      default:
        break;
    }
  }

  private bindKeyboardShortcuts(): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      // Escape returns to Sea Urchin Core
      if (e.key === 'Escape') {
        AudioSynthesizer.play('click');
        this.router.navigate('singularity');
        return;
      }

      // Ctrl+K opens / focuses search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (this.router.getCurrentRoute() !== 'read') {
          this.router.navigate('read');
          setTimeout(() => this.lexiconDossier.focusSearch(), 50);
        } else {
          this.lexiconDossier.focusSearch();
        }
        return;
      }

      // Forward shortcuts to active dossier
      if (this.activeDossierHandle && this.activeDossierHandle.handleGlobalKey) {
        const handled = this.activeDossierHandle.handleGlobalKey(e.key);
        if (handled && e.key === ' ') {
          e.preventDefault(); // Prevent page scroll on Space
        }
      }
    });
  }

  private showCompletionReceipt(moduleName: string): void {
    AudioSynthesizer.play('absorb');

    const state = StorageManager.loadState();
    const modal = document.createElement('div');
    modal.className = 'completion-modal-overlay interactive';

    modal.innerHTML = `
      <div class="completion-receipt-card">
        <div class="telemetry-label" style="margin-bottom: 8px;">[MISSION DIRECTIVE COMPLETE]</div>
        <h2 style="font-family: var(--font-mono); font-size: 20px; font-weight: 700; margin-bottom: 16px;">
          ${moduleName}
        </h2>
        <div style="border-top: 1px solid #000000; border-bottom: 1px solid #000000; width: 100%; padding: 16px 0; margin-bottom: 20px; display: flex; justify-content: space-around;">
          <div>
            <div class="telemetry-label">STREAK</div>
            <div class="telemetry-value" style="font-size: 18px;">${state.streak.currentStreak} DAYS</div>
          </div>
          <div>
            <div class="telemetry-label">TOTAL REVIEWS</div>
            <div class="telemetry-value" style="font-size: 18px;">${state.totalCardsReviewed}</div>
          </div>
        </div>
        <p style="font-size: 13px; line-height: 1.4; margin-bottom: 24px;">
          Neural engrams indexed and synchronized into browser memory. All spaced repetition intervals successfully updated.
        </p>
        <button class="hud-btn btn-receipt-close" style="width: 100%; justify-content: center; padding: 10px 0;">
          [ RETURN TO SINGULARITY CORE ]
        </button>
      </div>
    `;

    const closeBtn = modal.querySelector('.btn-receipt-close');
    closeBtn?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      modal.remove();
      this.router.navigate('singularity');
    });

    document.body.appendChild(modal);
  }
}

// Bootstrap Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
