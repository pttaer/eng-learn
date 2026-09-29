import { SKILL_BRANCHES } from '../core/skill-tree-data';
import { SkillTreeEngine, SummitProgress } from '../core/skill-tree-engine';
import { RouteId } from '../core/router';
import { AudioSynthesizer } from '../core/audio-synthesizer';

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
      <div class="skill-tree-shell" style="width: 100%; max-width: 1100px; margin: 0 auto; padding-bottom: 60px;">
        <!-- 1. Today's 15-Minute Workout Banner -->
        ${this.renderWorkoutBanner(progress)}

        <!-- 2. Constellation Header & Progress -->
        <div class="tree-header-card" style="margin-top: 24px; text-align: center; border: 1px solid var(--border-hairline); background: var(--bg-surface); padding: 24px; border-radius: 4px;">
          <div class="telemetry-label" style="letter-spacing: 0.16em; margin-bottom: 8px;">[THE SKYRIM CONSTELLATION ROADMAP]</div>
          <h1 style="font-size: 26px; font-weight: 700; margin-bottom: 8px; font-family: var(--font-sans);">
            The Path to C2 Native Mastery
          </h1>
          <p style="font-size: 15px; color: var(--ink-muted); max-width: 68ch; margin: 0 auto 16px auto; line-height: 1.6;">
            Every node represents an advanced linguistic capability. Master prerequisites to unlock higher-tier rhetorical and syntactic perks.
          </p>
          <div style="display: inline-flex; align-items: center; gap: 24px; font-family: var(--font-mono); font-size: 13px; background: rgba(0,0,0,0.03); padding: 8px 20px; border-radius: 99px;">
            <span>RANK: <strong style="color: var(--ink-primary);">${progress.currentRank}</strong></span>
            <span>•</span>
            <span>SUMMIT PROGRESS: <strong style="color: var(--accent-gold);">${progress.masteredCount} / ${progress.totalNodes} PERKS (${progress.progressPct}%)</strong></span>
          </div>
        </div>

        <!-- 3. Constellation Visualizer Canvas/SVG -->
        <div class="constellation-container" style="position: relative; width: 100%; height: 640px; margin-top: 24px; background: var(--bg-surface); border: 1px solid var(--border-hairline); border-radius: 4px; overflow: hidden;">
          ${this.renderConstellationSVG()}
        </div>

        <!-- 4. 5 Branches Reference Grid -->
        <div class="branches-summary-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 24px;">
          ${this.renderBranchesSummary()}
        </div>
      </div>
    `;

    this.bindEvents();
    return this.container;
  }

  private renderWorkoutBanner(_progress: SummitProgress): string {
    return `
      <div class="workout-banner" style="background: var(--bg-surface); border: 1px solid var(--border-solid); padding: 20px 24px; border-radius: 4px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px;">
        <div style="flex: 1; min-width: 280px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span class="telemetry-label" style="color: var(--accent-gold); font-weight: 700;">★ TODAY'S 15-MINUTE WORKOUT</span>
            <span class="telemetry-label">• 2 OF 3 DRILLS REMAINING</span>
          </div>
          <div style="display: flex; gap: 16px; font-size: 14px; margin-top: 8px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="color: var(--accent-gold); font-weight: 700;">✓</span> <span>10 Collocations Reviewed</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; color: var(--ink-secondary);">
              <span style="opacity: 0.5;">○</span> <span>1 Franklin Copywork (Inversion)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; color: var(--ink-secondary);">
              <span style="opacity: 0.5;">○</span> <span>1 Speaking Take (4-3-2 Fluency)</span>
            </div>
          </div>
        </div>
        <button class="hud-btn btn-continue-workout" style="background: var(--ink-primary); color: var(--ink-inverted); padding: 12px 24px; font-weight: 600; font-size: 14px; border: none; cursor: pointer;">
          [ CONTINUE TODAY'S WORKOUT → ]
        </button>
      </div>
    `;
  }

  private renderConstellationSVG(): string {
    // Generate connecting lines (filaments) and star nodes in SVG
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
          const strokeColor = isMastered ? 'var(--accent-gold)' : 'rgba(17, 17, 17, 0.15)';
          const strokeWidth = isMastered ? '2' : '1';
          const strokeDash = isMastered ? 'none' : '3,3';

          linesSvg += `
            <line
              x1="${prereq.x}%" y1="${prereq.y}%"
              x2="${node.x}%" y2="${node.y}%"
              stroke="${strokeColor}"
              stroke-width="${strokeWidth}"
              stroke-dasharray="${strokeDash}"
              class="constellation-line"
            />
          `;
        }
      }
    }

    // Connect top Level 5 nodes of all branches to the C2 SUMMIT Apex (50%, 4%)
    const summitX = 50;
    const summitY = 5;
    for (const node of nodes.filter(n => n.level === 5)) {
      linesSvg += `
        <line
          x1="${node.x}%" y1="${node.y}%"
          x2="${summitX}%" y2="${summitY}%"
          stroke="rgba(202, 138, 4, 0.4)"
          stroke-width="1.5"
          stroke-dasharray="4,4"
        />
      `;
    }

    // Apex Summit Star
    const summitSvg = `
      <g class="constellation-apex" style="cursor: pointer;" transform="translate(${summitX * 10}, ${summitY * 6.4})">
        <circle cx="0" cy="0" r="14" fill="var(--bg-surface)" stroke="var(--accent-gold)" stroke-width="2" />
        <circle cx="0" cy="0" r="7" fill="var(--accent-gold)" />
        <text x="0" y="26" text-anchor="middle" font-family="var(--font-mono)" font-size="11" font-weight="700" fill="var(--accent-gold)">C2 SUMMIT</text>
      </g>
    `;

    // Render 25 Interactive Perk Stars
    for (const node of nodes) {
      const status = SkillTreeEngine.getNodeStatus(node.id);

      let circleFill = 'var(--bg-surface)';
      let circleStroke = 'var(--border-solid)';
      let symbol = `${node.level}`;
      let cursorClass = 'node-unlocked';

      if (status === 'mastered') {
        circleFill = 'var(--accent-gold)';
        circleStroke = 'var(--accent-gold)';
        cursorClass = 'node-mastered';
        symbol = '★';
      } else if (status === 'locked') {
        circleFill = 'var(--bg-canvas)';
        circleStroke = 'rgba(17, 17, 17, 0.25)';
        cursorClass = 'node-locked';
        symbol = '🔒';
      }

      // Percentage coordinate to SVG coordinate (1000 x 640 viewBox)
      const cx = node.x * 10;
      const cy = node.y * 6.4;

      nodesSvg += `
        <g class="constellation-node ${cursorClass}" data-node-id="${node.id}" transform="translate(${cx}, ${cy})" style="cursor: pointer;">
          <circle cx="0" cy="0" r="15" fill="${circleFill}" stroke="${circleStroke}" stroke-width="2" class="node-circle" />
          <text x="0" y="4" text-anchor="middle" font-family="var(--font-mono)" font-size="11" font-weight="700" fill="${status === 'mastered' ? '#ffffff' : 'var(--ink-primary)'}">
            ${symbol}
          </text>
          <text x="0" y="24" text-anchor="middle" font-family="var(--font-sans)" font-size="10" font-weight="600" fill="var(--ink-secondary)" class="node-title-label">
            ${node.title.length > 24 ? node.title.slice(0, 22) + '...' : node.title}
          </text>
        </g>
      `;
    }

    return `
      <svg viewBox="0 0 1000 640" style="width: 100%; height: 100%; display: block;" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="summitGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(202, 138, 4, 0.25)" />
            <stop offset="100%" stop-color="rgba(202, 138, 4, 0)" />
          </radialGradient>
        </defs>
        <circle cx="500" cy="32" r="160" fill="url(#summitGlow)" />
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
      return `
        <div class="branch-summary-card" data-route="${branch.routeTarget}" style="background: var(--bg-surface); border: 1px solid var(--border-hairline); padding: 14px; border-radius: 4px; cursor: pointer;">
          <div style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-gold); font-weight: 700; margin-bottom: 4px;">
            ${branch.name.toUpperCase()}
          </div>
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px;">
            ${branch.tagline}
          </div>
          <div style="font-size: 12px; color: var(--ink-muted); display: flex; justify-content: space-between;">
            <span>Level: ${masteredInBranch + 1} of 5</span>
            <span>${Math.round((masteredInBranch / 5) * 100)}%</span>
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

    // SVG Node clicks
    this.container.querySelectorAll('.constellation-node').forEach(nodeEl => {
      nodeEl.addEventListener('click', () => {
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
      <div class="completion-receipt-card" style="max-width: 540px; width: 92%; text-align: left;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="telemetry-label" style="color: var(--accent-gold);">[${branch.name.toUpperCase()} // LEVEL ${node.level}]</span>
          <span class="hud-status-badge" style="background: var(--ink-primary); color: var(--ink-inverted); font-size: 11px;">CEFR ${node.cefrLevel}</span>
        </div>

        <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 4px; font-family: var(--font-sans);">
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
          <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); padding: 12px 16px; border-radius: 4px; margin-bottom: 20px;">
            <div style="font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: #dc2626; margin-bottom: 4px;">
              🔒 LOCKED — PREREQUISITE REQUIRED
            </div>
            <div style="font-size: 13px; color: var(--ink-primary); line-height: 1.5;">
              Requires mastery in <strong>${prereqStatus.prereqName}</strong> (Current: ${prereqStatus.currentPct}% / Required: ${prereqStatus.requiredPct}%). Complete review drills in that skill first to unlock.
            </div>
          </div>
        ` : `
          <div style="background: rgba(202, 138, 4, 0.08); border: 1px solid rgba(202, 138, 4, 0.25); padding: 12px 16px; border-radius: 4px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 12px; font-weight: 700; margin-bottom: 6px;">
              <span style="color: var(--accent-gold);">★ MASTERY RETENTION:</span>
              <span>${mastery}% / 80%</span>
            </div>
            <div style="width: 100%; height: 6px; background: rgba(0,0,0,0.1); border-radius: 3px; overflow: hidden;">
              <div style="width: ${mastery}%; height: 100%; background: var(--accent-gold);"></div>
            </div>
          </div>
        `}

        <div style="display: flex; gap: 12px; margin-top: 8px;">
          ${status !== 'locked' ? `
            <button class="hud-btn btn-launch-drill" style="flex: 1; justify-content: center; background: var(--ink-primary); color: var(--ink-inverted); padding: 12px; font-weight: 600; border: none; cursor: pointer;">
              [ START PRACTICE DRILL → ]
            </button>
          ` : `
            <button class="hud-btn btn-train-prereq" style="flex: 1; justify-content: center; background: var(--border-solid); color: var(--ink-inverted); padding: 12px; font-weight: 600; border: none; cursor: pointer;">
              [ TRAIN PREREQUISITE FIRST → ]
            </button>
          `}
          <button class="hud-btn btn-close-modal" style="padding: 12px 20px; justify-content: center; cursor: pointer;">
            [ CLOSE ]
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.btn-close-modal')?.addEventListener('click', () => {
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
