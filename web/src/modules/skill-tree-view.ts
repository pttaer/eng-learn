import { icon } from '../utils/icons';
import anime from 'animejs';
import { SKILL_BRANCHES } from '../core/skill-tree-data';
import { SkillTreeEngine } from '../core/skill-tree-engine';
import { RouteId } from '../core/router';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import { MotionEngine } from '../core/motion-engine';

export class SkillTreeView {
  private container: HTMLElement;
  public onNavigate?: (route: RouteId) => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'skill-tree-view interactive';
  }

  public render(): HTMLElement {
    const progress = SkillTreeEngine.calculateSummitProgress();

    this.container.innerHTML = `
      <div class="skill-tree-shell" style="width: 100%; max-width: 1200px; height: 100%; margin: 0 auto; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
        <!-- 1. Unified Command Header & Today's 15-Minute Workout -->
        ${this.renderWorkoutBanner()}

        <!-- 2. Constellation Visualizer Canvas/SVG -->
        <div class="constellation-container" style="position: relative; width: 100%; flex: 1 1 0; min-height: 0; margin-top: 6px; margin-bottom: 6px; background: radial-gradient(circle at 50% 25%, color-mix(in srgb, var(--accent-gold) 6%, transparent), transparent 75%), var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-card);">
          ${this.renderConstellationSVG()}
        </div>

        <!-- 3. 5 Branches Reference Grid -->
        <div class="branches-summary-grid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; flex: 0 0 auto;">
          ${this.renderBranchesSummary()}
        </div>
      </div>
    `;

    this.bindEvents();

    // Procedural entrance animations via MotionEngine
    setTimeout(() => {
      // 1. Procedurally illuminate SVG connecting lines
      const lines = this.container.querySelectorAll('.constellation-line');
      if (lines.length > 0) {
        MotionEngine.drawSvgLines(lines as any);
      }

      // 2. Stagger star node entrance with elastic bounce
      const nodes = this.container.querySelectorAll('.constellation-node');
      if (nodes.length > 0) {
        MotionEngine.staggerEntrance(nodes as any, { from: 'bottom', delayStep: 25 });
      }

      // 3. Roll up summit progress counter
      const progressEl = this.container.querySelector('.val-progress-pct') as HTMLElement | null;
      if (progressEl) {
        MotionEngine.tweenNumber(progressEl, 0, progress.progressPct, '%');
      }
    }, 40);

    return this.container;
  }

  private renderWorkoutBanner(): string {
    const progress = SkillTreeEngine.calculateSummitProgress();
    return `
      <div class="workout-banner tree-command-panel" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 8px 16px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; gap: 12px; box-shadow: var(--shadow-card); flex: 0 0 auto;">
        <div style="flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px;">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span class="telemetry-label" style="letter-spacing: 0.12em; font-size: 10px; color: var(--accent-gold); font-weight: 700;">✦ CONSTELLATION ROADMAP ✦</span>
            <span class="hud-status-badge" style="font-size: 10px; padding: 2px 8px; border-radius: 4px;">
              RANK: <strong>${progress.currentRank}</strong>
            </span>
            <span class="hud-status-badge" style="font-size: 10px; padding: 2px 8px; border-radius: 4px; border-color: var(--accent-gold); color: var(--accent-gold);">
              SUMMIT: <strong class="val-progress-pct">${progress.progressPct}%</strong> (${progress.masteredCount}/${progress.totalNodes} PERKS)
            </span>
          </div>
          <div style="display: flex; align-items: baseline; gap: 8px; overflow: hidden;">
            <h1 style="font-size: 16px; font-weight: 700; margin: 0; font-family: var(--font-sans); color: var(--ink-primary); letter-spacing: -0.01em; white-space: nowrap;">
              The Path to C2 Native Mastery
            </h1>
            <span style="font-size: 12px; color: var(--ink-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              — Master prerequisite engrams to unlock higher-tier syntactic and rhetorical perks.
            </span>
          </div>
        </div>

        <div class="workout-panel" style="flex: 0 0 auto; display: flex; align-items: center; gap: 12px; background: var(--bg-surface-sunk); border: 1px solid var(--border-hairline); border-radius: 6px; padding: 6px 14px;">
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
              <span class="telemetry-label" style="color: var(--accent-gold); font-weight: 700; font-size: 10px;">★ TODAY'S 15-MINUTE WORKOUT</span>
              <span class="telemetry-label" style="font-size: 10px;">2 OF 3 DRILLS REMAINING</span>
            </div>
            <div class="workout-tasks" style="display: flex; gap: 10px; font-size: 11px; color: var(--ink-secondary);">
              <div style="display: flex; align-items: center; gap: 3px;">
                <span style="color: var(--accent-gold); font-weight: 700;">✓</span> <span>10 Collocations Reviewed</span>
              </div>
              <div style="display: flex; align-items: center; gap: 3px; opacity: 0.75;">
                <span>○</span> <span>1 Franklin Copywork (Inversion)</span>
              </div>
              <div style="display: flex; align-items: center; gap: 3px; opacity: 0.75;">
                <span>○</span> <span>1 Speaking Take (4-3-2 Fluency)</span>
              </div>
            </div>
          </div>
          <button class="hud-btn btn-continue-workout" style="justify-content: center; background: var(--accent-gold); color: var(--bg-canvas); padding: 6px 16px; min-height: 34px; font-weight: 700; font-size: 11px; border: none; cursor: pointer; border-radius: 6px; white-space: nowrap; box-shadow: var(--shadow-glow);">
            Continue Today's Workout →
          </button>
        </div>
      </div>
    `;
  }

  private formatNodeLabel(title: string): [string, string] {
    if (title.includes('(')) {
      const parts = title.split('(');
      return [parts[0].trim(), `(${parts[1]}`];
    }
    const words = title.split(' ');
    if (words.length <= 2 || title.length <= 15) {
      return [title, ''];
    }
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
  }

  private renderConstellationSVG(): string {
    const nodes = SkillTreeEngine.getAllNodes();
    let linesSvg = '';
    let nodesSvg = '';

    // Draw lines between parent prerequisites and child nodes
    for (const node of nodes) {
      const nodeStatus = SkillTreeEngine.getNodeStatus(node.id);
      for (const prereqId of node.prerequisites) {
        const prereq = nodes.find(n => n.id === prereqId);
        if (prereq) {
          const isMastered = nodeStatus === 'mastered' || SkillTreeEngine.getNodeStatus(prereq.id) === 'mastered';
          const strokeColor = isMastered ? 'var(--accent-gold)' : 'var(--border-subtle)';
          const strokeWidth = isMastered ? '2.5' : '1.2';
          const strokeDash = isMastered ? 'none' : '3,3';

          linesSvg += `
            <line
              x1="${prereq.x * 10}" y1="${prereq.y * 7}"
              x2="${node.x * 10}" y2="${node.y * 7}"
              stroke="${strokeColor}"
              stroke-width="${strokeWidth}"
              stroke-dasharray="${strokeDash}"
              class="constellation-line"
            />
          `;
        }
      }
    }

    // Connect top Level 5 nodes of all branches to the C2 SUMMIT Apex (500, 35)
    const summitPxX = 500;
    const summitPxY = 35;
    for (const node of nodes.filter(n => n.level === 5)) {
      linesSvg += `
        <line
          x1="${node.x * 10}" y1="${node.y * 7}"
          x2="${summitPxX}" y2="${summitPxY}"
          stroke="var(--accent-gold)"
          stroke-width="1.8"
          stroke-dasharray="4,4"
          opacity="0.55"
          class="constellation-line"
        />
      `;
    }

    // Apex Summit Star
    const summitSvg = `
      <g class="constellation-apex" style="cursor: pointer;" transform="translate(${summitPxX}, ${summitPxY})">
        <circle cx="0" cy="0" r="22" fill="url(#summitGlow)" />
        <circle cx="0" cy="0" r="14" fill="var(--bg-card)" stroke="var(--accent-gold)" stroke-width="2.5" />
        <circle cx="0" cy="0" r="6" fill="var(--accent-gold)" />
        <text x="0" y="24" text-anchor="middle" font-family="var(--font-mono)" font-size="11" font-weight="700" fill="var(--accent-gold)" class="node-title-label">★ C2 SUMMIT ★</text>
      </g>
    `;

    // Render 25 Interactive Perk Stars with Full 2-Line Titles (Zero Truncation)
    for (const node of nodes) {
      const status = SkillTreeEngine.getNodeStatus(node.id);

      let circleFill = 'var(--bg-card)';
      let circleStroke = 'var(--accent-gold)';
      let strokeWidth = '2';
      let symbol = `${node.level}`;
      let cursorClass = 'node-unlocked';
      let haloSvg = '';
      let textFill = 'var(--accent-gold)';

      if (status === 'mastered') {
        circleFill = 'var(--accent-gold)';
        circleStroke = 'var(--accent-star)';
        strokeWidth = '2.5';
        cursorClass = 'node-mastered';
        symbol = '★';
        textFill = '#ffffff';
        haloSvg = `<circle cx="0" cy="0" r="20" fill="none" stroke="var(--accent-gold)" stroke-width="1.5" opacity="0.45" class="star-halo" />`;
      } else if (status === 'locked') {
        circleFill = 'var(--bg-surface-sunk)';
        circleStroke = 'var(--border-subtle)';
        strokeWidth = '1.5';
        cursorClass = 'node-locked';
        symbol = '';
        textFill = 'var(--ink-muted)';
      }

      const cx = node.x * 10;
      const cy = node.y * 7;
      const [line1, line2] = this.formatNodeLabel(node.title);

      nodesSvg += `
        <g transform="translate(${cx}, ${cy})"><g class="constellation-node ${cursorClass}" data-node-id="${node.id}" style="cursor: pointer;">
          <title>${node.title} (Level ${node.level} - CEFR ${node.cefrLevel})</title>
          ${haloSvg}
          <circle cx="0" cy="0" r="14" fill="${circleFill}" stroke="${circleStroke}" stroke-width="${strokeWidth}" class="node-circle" />
          <text x="0" y="4" text-anchor="middle" font-family="var(--font-mono)" font-size="11" font-weight="700" fill="${textFill}">
            ${symbol}
          </text>
          ${status === 'locked' ? `<g transform="translate(-6, -6)" style="color: var(--ink-muted)">${icon('lock', 12)}</g>` : ''}
          <text x="0" y="24" text-anchor="middle" font-family="var(--font-sans)" font-size="9.5" font-weight="600" fill="${status === 'locked' ? 'var(--ink-muted)' : 'var(--ink-secondary)'}" class="node-title-label">
            <tspan x="0" dy="0">${line1}</tspan>
            ${line2 ? `<tspan x="0" dy="10.5">${line2}</tspan>` : ''}
          </text>
        </g></g>
      `;
    }

    return `
      <svg viewBox="0 0 1000 620" style="width: 100%; height: 100%; display: block;" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="starGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <radialGradient id="summitGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="var(--accent-gold)" stop-opacity="0.4" />
            <stop offset="100%" stop-color="var(--accent-gold)" stop-opacity="0" />
          </radialGradient>
        </defs>
        <circle cx="500" cy="35" r="140" fill="url(#summitGlow)" />
        ${linesSvg}
        ${summitSvg}
        ${nodesSvg}
      </svg>
    `;
  }

  private renderBranchesSummary(): string {
    return Object.values(SKILL_BRANCHES).map(branch => {
      const branchNodes = branch.nodes;
      const masteredInBranch = branchNodes.filter(n => SkillTreeEngine.getNodeStatus(n.id) === 'mastered').length;
      const pct = Math.round((masteredInBranch / 5) * 100);
      return `
        <div class="branch-summary-card" data-route="${branch.routeTarget}" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: transform 0.18s, border-color 0.18s, box-shadow 0.18s; display: flex; flex-direction: column; justify-content: space-between; min-height: 50px; box-shadow: var(--shadow-btn);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
            <span style="font-family: var(--font-mono); font-size: 10.5px; color: var(--accent-gold); font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 78%;">
              ✦ ${branch.name.toUpperCase()}
            </span>
            <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--ink-primary);">
              ${pct}%
            </span>
          </div>
          <div style="font-size: 11px; font-weight: 500; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--ink-secondary);">
            ${branch.tagline}
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-family: var(--font-mono); font-size: 10px; color: var(--ink-muted); white-space: nowrap;">
              Lv ${masteredInBranch + 1}/5 (${masteredInBranch}/5)
            </span>
            <div style="flex: 1; height: 4px; background: var(--border-hairline); border-radius: 2px; overflow: hidden;">
              <div style="width: ${pct}%; height: 100%; background: var(--accent-gold); border-radius: 2px; box-shadow: 0 0 6px var(--accent-gold-soft);"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  private bindEvents(): void {
    // Continue workout button
    this.container.querySelector('.btn-continue-workout')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      if (this.onNavigate) {
        this.onNavigate('write'); // Jump into Franklin Copywork
      }
    });

    // Branch cards click
    this.container.querySelectorAll('.branch-summary-card').forEach(el => {
      el.addEventListener('click', () => {
        const route = (el as HTMLElement).dataset.route as RouteId;
        AudioSynthesizer.play('click');
        if (this.onNavigate && route) {
          this.onNavigate(route);
        }
      });
    });

    // SVG Node clicks & hover animations
    this.container.querySelectorAll('.constellation-node').forEach(nodeEl => {
      const circleEl = nodeEl.querySelector('.node-circle');

      nodeEl.addEventListener('mouseenter', () => {
        if (!MotionEngine.isReducedMotion() && circleEl) {
          anime({
            targets: circleEl,
            scale: 1.25,
            duration: 250,
            easing: 'easeOutQuad'
          });
        }
      });

      nodeEl.addEventListener('mouseleave', () => {
        if (!MotionEngine.isReducedMotion() && circleEl) {
          anime({
            targets: circleEl,
            scale: 1.0,
            duration: 200,
            easing: 'easeOutQuad'
          });
        }
      });

      nodeEl.addEventListener('click', () => {
        AudioSynthesizer.play('click');
        if (!MotionEngine.isReducedMotion()) {
          anime({
            targets: nodeEl,
            scale: [0.92, 1.08, 1.0],
            duration: 350,
            easing: 'easeOutElastic(1, 0.5)'
          });
        }
        const nodeId = (nodeEl as HTMLElement).dataset.nodeId;
        if (nodeId) {
          this.openNodeModal(nodeId);
        }
      });
    });
  }

  public openNodeModal(nodeId: string): void {
    const allNodes = SkillTreeEngine.getAllNodes();
    const node = allNodes.find(n => n.id === nodeId);
    if (!node) return;

    const status = SkillTreeEngine.getNodeStatus(node.id);
    const mastery = SkillTreeEngine.getNodeMasteryPct(node.id);
    const prereqStatus = SkillTreeEngine.getPrerequisiteStatus(node.id);

    const existing = document.getElementById('skill-node-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'skill-node-modal';
    modal.className = 'completion-modal-overlay interactive';

    const branch = SKILL_BRANCHES[node.branchId];

    modal.innerHTML = `
      <div class="completion-receipt-card" style="max-width: 540px; width: 92%; text-align: left; background: var(--bg-surface); border: 1px solid var(--border-subtle); box-shadow: var(--shadow-card);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="telemetry-label" style="color: var(--accent-gold); font-weight: 700;">✦ ${branch.name.toUpperCase()} // LEVEL ${node.level}</span>
          <span class="hud-status-badge" style="background: var(--accent-gold); color: var(--bg-canvas); font-size: 11px; font-weight: 700; border-color: var(--accent-gold);">CEFR ${node.cefrLevel}</span>
        </div>

        <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 4px; font-family: var(--font-sans); color: var(--ink-primary);">
          ${node.title}
        </h2>
        <div style="font-family: var(--font-mono); font-size: 12px; color: var(--ink-muted); margin-bottom: 16px;">
          ${node.subtitle}
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: var(--ink-secondary); margin-bottom: 20px;">
          ${node.description}
        </p>

        <!-- Prerequisite / Gating Box -->
        ${status === 'locked' && prereqStatus ? `
          <div style="background: var(--critical-soft); border: 1px solid var(--critical); padding: 12px 16px; border-radius: 6px; margin-bottom: 20px;">
            <div style="font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: var(--critical); margin-bottom: 4px;">
              ${icon('lock', 12)} LOCKED — PREREQUISITE REQUIRED
            </div>
            <div style="font-size: 13px; color: var(--ink-primary); line-height: 1.5;">
              Requires mastery in <strong>${prereqStatus.prereqName}</strong> (Current: ${prereqStatus.currentPct}% / Required: ${prereqStatus.requiredPct}%). Complete review drills in that skill first to unlock.
            </div>
          </div>
        ` : `
          <div style="background: var(--accent-gold-soft); border: 1px solid var(--accent-gold); padding: 12px 16px; border-radius: 6px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 12px; font-weight: 700; margin-bottom: 6px;">
              <span style="color: var(--accent-gold);">★ MASTERY RETENTION:</span>
              <span style="color: var(--ink-primary);">${mastery}% / 80%</span>
            </div>
            <div style="width: 100%; height: 6px; background: var(--border-hairline); border-radius: 3px; overflow: hidden;">
              <div style="width: ${mastery}%; height: 100%; background: var(--accent-gold); border-radius: 3px; box-shadow: 0 0 8px var(--accent-gold-soft);"></div>
            </div>
          </div>
        `}

        <div style="display: flex; gap: 12px; margin-top: 8px;">
          ${status !== 'locked' ? `
            <button class="hud-btn btn-launch-drill" style="flex: 1; justify-content: center; background: var(--accent-gold); color: var(--bg-canvas); padding: 12px; font-weight: 700; border: none; cursor: pointer; border-radius: 6px; box-shadow: var(--shadow-glow);">
              Start Practice Drill →
            </button>
          ` : `
            <button class="hud-btn btn-train-prereq" style="flex: 1; justify-content: center; background: var(--bg-surface-sunk); color: var(--ink-primary); padding: 12px; font-weight: 600; border: 1px solid var(--border-subtle); cursor: pointer; border-radius: 6px;">
              Train Prerequisite First →
            </button>
          `}
          <button class="hud-btn btn-close-modal" style="padding: 12px 20px; justify-content: center; cursor: pointer; border-radius: 6px;">
            Close
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const cardEl = modal.querySelector('.completion-receipt-card') as HTMLElement;
    if (cardEl) {
      MotionEngine.springModal(modal, cardEl);
    }

    modal.querySelector('.btn-close-modal')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      modal.remove();
    });

    modal.querySelector('.btn-launch-drill')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      modal.remove();
      if (this.onNavigate) {
        this.onNavigate(node.routeTarget);
      }
    });

    modal.querySelector('.btn-train-prereq')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      modal.remove();
      if (this.onNavigate) {
        this.onNavigate(node.routeTarget);
      }
    });
  }
}
