import { StorageManager } from '../utils/storage';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import { MotionEngine } from '../core/motion-engine';
import habitsData from '../assets/data/habits.json';

export interface HabitDay {
  day: number;
  week: number;
  phase: string;
  title: string;
  tasks: string[];
}

// Habit tasks are authored in markdown: render the inline subset, drop links (they point at local files).
export function formatTask(md: string): string {
  return md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\$([^$]+)\$/g, '$1');
}

export class MissionLog {
  private container: HTMLElement;
  private days: HabitDay[] = [];
  private activeDayIndex: number = 0;
  public onDayCompleted?: (day: number) => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'dossier-workspace dossier-habits interactive';
    this.days = (habitsData as any).days || [];
  }

  public render(): HTMLElement {
    this.container.innerHTML = `
      <div class="dossier-control-bar">
        <div class="dossier-tabs">
          <span class="telemetry-label">[30-DAY HABIT ENGINE // KINETIC ROADMAP]</span>
        </div>
        <div class="dossier-status-pill">
          <span class="telemetry-value">PHASE-DRIVEN DAILY WORKOUTS</span>
        </div>
      </div>
      <div class="mission-log-main">
        <!-- Day Picker Bar -->
        <div class="day-picker-track"></div>
        <!-- Active Day Card Slot -->
        <div class="mission-day-card-slot"></div>
      </div>
      <div class="dossier-nav-bar">
        <button class="hud-btn nav-btn-prev-day">← Prev Day</button>
        <span class="telemetry-value active-day-indicator">DAY ${this.activeDayIndex + 1} / 30</span>
        <button class="hud-btn nav-btn-next-day">Next Day →</button>
      </div>
    `;

    this.renderDayPicker();
    this.renderActiveDayCard();
    this.bindEvents();
    return this.container;
  }

  private renderDayPicker(): void {
    const track = this.container.querySelector('.day-picker-track');
    if (!track) return;

    track.innerHTML = '';
    const state = StorageManager.loadState();

    this.days.forEach((d, idx) => {
      const isCompleted = state.habitProgress[d.day]?.completed;
      const isSelected = idx === this.activeDayIndex;

      const chip = document.createElement('button');
      chip.className = `day-chip ${isSelected ? 'selected' : ''} ${isCompleted ? 'completed' : ''}`;
      chip.textContent = String(d.day).padStart(2, '0');
      chip.title = `Day ${d.day}: ${d.title}`;

      chip.addEventListener('click', () => {
        this.activeDayIndex = idx;
        this.renderDayPicker();
        this.renderActiveDayCard();
      });

      track.appendChild(chip);
    });
  }

  private renderActiveDayCard(): void {
    const slot = this.container.querySelector('.mission-day-card-slot');
    if (!slot || this.days.length === 0) return;

    const day = this.days[this.activeDayIndex];
    const state = StorageManager.loadState();
    const progress = state.habitProgress[day.day] || { completed: false, completedTasks: [] };

    slot.innerHTML = `
      <div class="mission-card">
        <div class="card-header-bar">
          <div class="card-meta-left">
            <span>[WEEK 0${day.week} // ${day.phase.toUpperCase()}]</span>
            <span class="card-badge-status ${progress.completed ? 'badge-completed' : ''}">
              ${progress.completed ? 'COMPLETED ✓' : 'IN PROGRESS'}
            </span>
          </div>
          <div class="card-meta-right">
            <span>DAY ${String(day.day).padStart(2, '0')}</span>
          </div>
        </div>

        <div class="mission-body">
          <div class="card-prompt-label">DAILY OBJECTIVE</div>
          <div class="card-main-text" style="font-size: 18px; margin-bottom: 16px;">
            ${day.title}
          </div>

          <div class="mission-tasks-list">
            ${day.tasks.map((task, tIdx) => {
              const isChecked = progress.completedTasks.includes(tIdx);
              return `
                <label class="mission-task-item ${isChecked ? 'task-checked' : ''}" data-idx="${tIdx}">
                  <input type="checkbox" class="task-checkbox" ${isChecked ? 'checked' : ''} />
                  <span class="task-text">${formatTask(task)}</span>
                </label>
              `;
            }).join('')}
          </div>
        </div>

        <div class="card-bottom-dock">
          <div class="mission-completion-stat">
            <span class="telemetry-label">PROGRESS:</span>
            <span class="telemetry-value">${progress.completedTasks.length} / ${day.tasks.length} TASKS</span>
          </div>
          <div class="mission-actions">
            ${progress.completed ? '<span style="font-family: var(--font-mono); font-size: 11px; font-weight: 700;">[STREAK REGISTERED]</span>' : ''}
          </div>
        </div>
      </div>
    `;

    // Bind checkboxes
    const checkLabels = slot.querySelectorAll('.mission-task-item');
    checkLabels.forEach(label => {
      const checkbox = label.querySelector('.task-checkbox') as HTMLInputElement;
      const idx = parseInt((label as HTMLElement).dataset.idx || '0', 10);

      checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        const checked = checkbox.checked;
        StorageManager.setHabitTask(day.day, idx, checked, day.tasks.length);

        if (checked) {
          AudioSynthesizer.play('click');
        }

        // Re-check if day is now completed
        const updatedState = StorageManager.loadState();
        if (updatedState.habitProgress[day.day]?.completed) {
          AudioSynthesizer.play('absorb');
          if (this.onDayCompleted) {
            this.onDayCompleted(day.day);
          }
        }

        this.renderDayPicker();
        this.renderActiveDayCard();
        if (checked) {
          const ticked = this.container.querySelector(`.mission-task-item[data-idx="${idx}"]`) as HTMLElement | null;
          if (ticked) MotionEngine.pop(ticked);
        }
      });
    });

    const indicator = this.container.querySelector('.active-day-indicator');
    if (indicator) {
      indicator.textContent = `DAY [ ${this.activeDayIndex + 1} / 30 ]`;
    }
  }

  private bindEvents(): void {
    this.container.querySelector('.nav-btn-prev-day')?.addEventListener('click', () => {
      if (this.activeDayIndex > 0) {
        this.activeDayIndex -= 1;
        this.renderDayPicker();
        this.renderActiveDayCard();
      }
    });

    this.container.querySelector('.nav-btn-next-day')?.addEventListener('click', () => {
      if (this.activeDayIndex < this.days.length - 1) {
        this.activeDayIndex += 1;
        this.renderDayPicker();
        this.renderActiveDayCard();
      }
    });
  }

  public handleGlobalKey(key: string): boolean {
    if (key === 'ArrowLeft' && this.activeDayIndex > 0) {
      this.activeDayIndex -= 1;
      this.renderDayPicker();
      this.renderActiveDayCard();
      return true;
    }
    if (key === 'ArrowRight' && this.activeDayIndex < this.days.length - 1) {
      this.activeDayIndex += 1;
      this.renderDayPicker();
      this.renderActiveDayCard();
      return true;
    }
    return false;
  }
}
