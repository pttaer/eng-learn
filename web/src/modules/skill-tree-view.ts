import { icon } from '../utils/icons';
import { SKILL_BRANCHES } from '../core/skill-tree-data';
import { SkillTreeEngine } from '../core/skill-tree-engine';
import { RouteId } from '../core/router';
import { AudioSynthesizer } from '../core/audio-synthesizer';
import { MotionEngine } from '../core/motion-engine';
import { StorageManager } from '../utils/storage';
import { NebulaCanvas } from '../core/perspective-canvas';
import { ConstellationEngine } from './constellation-engine';
import type { Cefr } from '../core/cefr';

/** Hides a node label when it would overlap a label or node circle already kept (by level priority). */
function hideCollidingLabels(svg: SVGElement): void {
  // Collect all nodes with their positions and label elements
  const nodes: Array<{
    nodeEl: SVGGElement;
    labelEl: SVGTextElement;
    cx: number;
    cy: number;
    level: number;
    box: DOMRect | null;
  }> = [];

  svg.querySelectorAll<SVGGElement>('g.constellation-node').forEach(nodeEl => {
    const labelEl = nodeEl.querySelector<SVGTextElement>('text.node-title-label');
    if (!labelEl) return;

    // Get cx, cy from the node's parent g transform="translate(cx, cy)"
    const parentG = nodeEl.parentElement as SVGGElement | HTMLElement | null;
    const transform = parentG?.getAttribute('transform');
    const match = transform?.match(/translate\(([\d.]+),\s*([\d.]+)\)/);
    if (!match) return;

    const cx = parseFloat(match[1]);
    const cy = parseFloat(match[2]);
    const level = parseInt((nodeEl.getAttribute('data-level') || '0'), 10);

    nodes.push({
      nodeEl,
      labelEl,
      cx,
      cy,
      level,
      box: null
    });
  });

  // Process by level descending (summit/higher levels first), then by DOM order
  const sortedNodes = nodes.sort((a, b) => {
    if (b.level !== a.level) return b.level - a.level;
    return Array.from(svg.querySelectorAll('g.constellation-node')).indexOf(a.nodeEl) -
           Array.from(svg.querySelectorAll('g.constellation-node')).indexOf(b.nodeEl);
  });

  const keptRects: Array<{ x1: number; x2: number; y1: number; y2: number; cx: number; cy: number; radius: number }> = [];

  // Add summit circle as obstacle (28px diameter at 500, 35)
  keptRects.push({ x1: 486, x2: 514, y1: 21, y2: 49, cx: 500, cy: 35, radius: 14 });

  for (const node of sortedNodes) {
    node.labelEl.style.display = '';

    // Get label bounding box in viewport coords
    const labelBox = node.labelEl.getBoundingClientRect();
    if (labelBox.width === 0 || labelBox.height === 0) continue;

    // Convert to viewBox coords (approximation): divide by viewport scale
    const svgRect = svg.getBoundingClientRect();
    const vbWidth = 1000;
    const vbHeight = 620;
    const scale = Math.min(svgRect.width / vbWidth, svgRect.height / vbHeight);

    const labelVbX1 = (labelBox.left - svgRect.left) / scale;
    const labelVbX2 = labelVbX1 + (labelBox.width / scale);
    const labelVbY1 = (labelBox.top - svgRect.top) / scale;
    const labelVbY2 = labelVbY1 + (labelBox.height / scale);

    // Check collision with kept obstacles (circles and labels)
    const collides = keptRects.some(rect => {
      // Circle collision: check if label overlaps with node circle (radius + margin)
      const circleMargin = 8;
      const circleRadius = rect.radius + circleMargin;
      if (node.cx === rect.cx && node.cy === rect.cy) return false; // Don't collide with own node

      const dx = node.cx - rect.cx;
      const dy = node.cy - rect.cy;
      const distSq = dx * dx + dy * dy;
      const minDistSq = (circleRadius + labelVbX2 - labelVbX1) * (circleRadius + labelVbX2 - labelVbX1);

      if (distSq < minDistSq) return true;

      // Rect-rect collision with label
      return labelVbX1 < rect.x2 && labelVbX2 > rect.x1 && labelVbY1 < rect.y2 && labelVbY2 > rect.y1;
    });

    if (collides) {
      node.labelEl.style.display = 'none';
    } else {
      // Add to kept obstacles
      keptRects.push({
        x1: labelVbX1,
        x2: labelVbX2,
        y1: labelVbY1,
        y2: labelVbY2,
        cx: node.cx,
        cy: node.cy,
        radius: 14
      });
    }
  }

  // Exact screen-space pass: a visible label may not touch any other node's circle
  const circles = Array.from(svg.querySelectorAll<SVGGElement>('g.constellation-node')).map(g => ({
    g,
    rect: g.querySelector('.node-circle')?.getBoundingClientRect() ?? null,
  }));
  for (const node of sortedNodes) {
    if (node.labelEl.style.display === 'none') continue;
    const lr = node.labelEl.getBoundingClientRect();
    if (lr.width === 0 || lr.height === 0) continue;
    const touches = circles.some(c => c.g !== node.nodeEl && c.rect !== null &&
      lr.left < c.rect.right + 2 && lr.right > c.rect.left - 2 &&
      lr.top < c.rect.bottom + 2 && lr.bottom > c.rect.top - 2);
    if (touches) node.labelEl.style.display = 'none';
  }
}

export class SkillTreeView {
  private container: HTMLElement;
  private nebulaCanvas: NebulaCanvas | null = null;
  private viewMode: 'map' | 'deck' = 'map';
  private panZoomTeardown: (() => void) | null = null;
  public onNavigate?: (route: RouteId) => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'skill-tree-view interactive';
    if (typeof window !== 'undefined' && ConstellationEngine.isMobileViewport()) {
      this.viewMode = 'deck';
    }
    window.addEventListener('learner-level-change', () => {
      if (this.container.isConnected) this.render();
    });
  }

  public getViewMode(): 'map' | 'deck' {
    return this.viewMode;
  }

  public setViewMode(mode: 'map' | 'deck'): void {
    if (this.viewMode === mode) return;
    this.viewMode = mode;
    this.render();
  }

  public render(): HTMLElement {
    const progress = SkillTreeEngine.calculateSummitProgress();

    this.container.innerHTML = `
      <div class="skill-tree-shell ${this.viewMode === 'deck' ? 'view-mode-deck' : 'view-mode-map'}" style="width: 100%; max-width: 1200px; height: 100%; margin: 0 auto; display: flex; flex-direction: column; justify-content: ${this.viewMode === 'deck' ? 'flex-start' : 'space-between'}; box-sizing: border-box;">
        <!-- 1. Unified Command Header & Today's 15-Minute Workout -->
        ${this.renderWorkoutBanner()}

        <!-- View Switcher Toggle: [ 🌌 Star Map ] | [ 📱 Skill Deck ] -->
        ${this.renderViewSwitcher()}

        ${this.viewMode === 'deck' ? `
          <!-- Mobile Skill Deck Carousel / List -->
          ${this.renderMobileSkillDeck()}
        ` : `
          <!-- 2. Constellation Visualizer Canvas/SVG with Starfield Nebula Backdrop -->
          <div class="constellation-container" style="position: relative; width: 100%; flex: 1 1 0; min-height: 0; margin-top: 6px; margin-bottom: 6px; background: radial-gradient(circle at 50% 25%, color-mix(in srgb, var(--accent-gold) 6%, transparent), transparent 75%), var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-card);">
            <canvas class="constellation-nebula-canvas" id="constellation-nebula-canvas" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1;"></canvas>
            <div class="constellation-svg-wrapper" style="position: relative; width: 100%; height: 100%; z-index: 2; display: flex; align-items: center; justify-content: center;">
              ${this.renderConstellationSVG()}
            </div>
          </div>

          <!-- 3. 6 Branches Reference Grid -->
          <div class="branches-summary-grid" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; flex: 0 0 auto;">
            ${this.renderBranchesSummary()}
          </div>
        `}
      </div>
    `;

    this.bindEvents();

    if (this.viewMode === 'map') {
      // Initialize Deep-Space Starfield Nebula
      const nebulaEl = this.container.querySelector('.constellation-nebula-canvas') as HTMLCanvasElement | null;
      if (nebulaEl) {
        if (this.nebulaCanvas) {
          this.nebulaCanvas.destroy();
        }
        this.nebulaCanvas = new NebulaCanvas(nebulaEl);
      }

      // Touch pan/zoom for mobile star map
      const containerEl = this.container.querySelector('.constellation-container') as HTMLElement | null;
      const svgEl = this.container.querySelector('.constellation-svg') as SVGElement | null;
      if (containerEl && svgEl && ConstellationEngine.isMobileViewport()) {
        if (this.panZoomTeardown) this.panZoomTeardown();
        this.panZoomTeardown = ConstellationEngine.setupPanZoom(containerEl, svgEl);
      }

      // No overlapping node labels: the full name stays in each node's <title> tooltip
      // Runs after the entrance animation settles, so label rects are at their final size
      const labelSvg = this.container.querySelector('.constellation-svg-wrapper svg') as SVGElement | null;
      if (labelSvg) setTimeout(() => hideCollidingLabels(labelSvg), 1600);

      // Procedural entrance animations via MotionEngine
      setTimeout(() => {
        if (!this.container.isConnected) return;
        const lines = this.container.querySelectorAll('.constellation-line');
        if (lines.length > 0) MotionEngine.drawSvgLines(lines as any);

        const nodes = Array.from(this.container.querySelectorAll<SVGElement>('.constellation-node'))
          .sort((a, b) => b.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom);
        if (nodes.length > 0) MotionEngine.staggerEntrance(nodes, { delayStep: 25 });

        MotionEngine.riseIn(this.container.querySelectorAll('.branch-summary-card'), 60);
        MotionEngine.fillBars(this.container.querySelectorAll('.branch-bar'));
        MotionEngine.breathe(this.container.querySelectorAll('.star-halo, .summit-halo'));

        const progressEl = this.container.querySelector('.val-progress-pct') as HTMLElement | null;
        if (progressEl) MotionEngine.tweenNumber(progressEl, 0, progress.progressPct, '%');
      }, 40);
    } else {
      // In Deck mode
      if (this.nebulaCanvas) {
        this.nebulaCanvas.destroy();
        this.nebulaCanvas = null;
      }
      if (this.panZoomTeardown) {
        this.panZoomTeardown();
        this.panZoomTeardown = null;
      }

      setTimeout(() => {
        if (!this.container.isConnected) return;
        MotionEngine.riseIn(this.container.querySelectorAll('.deck-branch-card'), 50);
        const progressEl = this.container.querySelector('.val-progress-pct') as HTMLElement | null;
        if (progressEl) MotionEngine.tweenNumber(progressEl, 0, progress.progressPct, '%');
      }, 40);
    }

    return this.container;
  }

  // Today's drills are counted from real review timestamps, dynamically scaled to learner's CEFR level.
  public getWorkout() {
    const start = new Date().setHours(0, 0, 0, 0);
    const done = { colloc: 0, writing: 0, speaking: 0, vocab: 0, grammar: 0, reading: 0, listen: 0 };
    for (const [id, st] of Object.entries(StorageManager.loadState().cardStates)) {
      if (!st || (st.lastReviewed ?? 0) < start) continue;
      if (id.startsWith('colloc-')) done.colloc++;
      else if (id.startsWith('writing-') || id.startsWith('write-')) done.writing++;
      else if (id.startsWith('speaking-') || id.startsWith('speak-')) done.speaking++;
      else if (id.startsWith('vocab-') || id.startsWith('awl-')) done.vocab++;
      else if (id.startsWith('gram-')) done.grammar++;
      else if (id.startsWith('read-') || id.startsWith('reading-') || id.startsWith('mine-')) done.reading++;
      else if (id.startsWith('listen-') || id.startsWith('passage-')) done.listen++;
    }

    const level: Cefr = StorageManager.getLearnerLevel() || 'B2';
    let tasks: Array<{ route: RouteId; ok: boolean; label: string }>;

    switch (level) {
      case 'A1':
        tasks = [
          { route: 'vocab' as RouteId, ok: done.vocab >= 5, label: `${Math.min(done.vocab, 5)}/5 Vocabulary Cards` },
          { route: 'colloc' as RouteId, ok: done.colloc >= 1, label: '1 A1 Collocation Drill' },
          { route: 'listen' as RouteId, ok: done.listen >= 1, label: '1 Phonetic Listen' }
        ];
        break;
      case 'A2':
        tasks = [
          { route: 'vocab' as RouteId, ok: done.vocab >= 5, label: `${Math.min(done.vocab, 5)}/5 Vocabulary Cards` },
          { route: 'grammar' as RouteId, ok: done.grammar >= 1, label: '1 A2 Grammar Rule' },
          { route: 'read' as RouteId, ok: done.reading >= 1, label: '1 Short Reading Pass' }
        ];
        break;
      case 'B1':
        tasks = [
          { route: 'colloc' as RouteId, ok: done.colloc >= 8, label: `${Math.min(done.colloc, 8)}/8 Collocations Reviewed` },
          { route: 'grammar' as RouteId, ok: done.grammar >= 1, label: '1 B1 Grammar Rule' },
          { route: 'write' as RouteId, ok: done.writing >= 1, label: '1 Paragraph Copywork' }
        ];
        break;
      case 'B2':
        tasks = [
          { route: 'colloc' as RouteId, ok: done.colloc >= 10, label: `${Math.min(done.colloc, 10)}/10 Collocations Reviewed` },
          { route: 'grammar' as RouteId, ok: done.grammar >= 1, label: '1 B2 Inversion Rule' },
          { route: 'speak' as RouteId, ok: done.speaking >= 1, label: '1 Speech Take (4-3-2 Fluency)' }
        ];
        break;
      case 'C1':
        tasks = [
          { route: 'colloc' as RouteId, ok: done.colloc >= 15, label: `${Math.min(done.colloc, 15)}/15 Collocations Reviewed` },
          { route: 'write' as RouteId, ok: done.writing >= 1, label: '1 Rhetorical Copywork' },
          { route: 'speak' as RouteId, ok: done.speaking >= 1, label: '1 Nation 4-3-2 Take' }
        ];
        break;
      case 'C2':
      default:
        tasks = [
          { route: 'colloc' as RouteId, ok: done.colloc >= 20, label: `${Math.min(done.colloc, 20)}/20 Collocations Reviewed` },
          { route: 'write' as RouteId, ok: done.writing >= 1, label: '1 Master Copywork' },
          { route: 'read' as RouteId, ok: done.reading >= 1, label: '1 C2 Intensive Reading Analysis' }
        ];
        break;
    }

    return { level, tasks, left: tasks.filter(t => !t.ok).length, next: tasks.find(t => !t.ok)?.route ?? ('tree' as RouteId) };
  }

  public teardown(): void {
    if (this.nebulaCanvas) {
      this.nebulaCanvas.destroy();
      this.nebulaCanvas = null;
    }
    if (this.panZoomTeardown) {
      this.panZoomTeardown();
      this.panZoomTeardown = null;
    }
  }

  private renderWorkoutBanner(): string {
    const progress = SkillTreeEngine.calculateSummitProgress();
    const workout = this.getWorkout();
    return `
      <div class="workout-banner tree-command-panel" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 8px 16px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; gap: 12px; box-shadow: var(--shadow-card); flex: 0 0 auto;">
        <div style="flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px;">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span class="telemetry-label" style="letter-spacing: 0.12em; font-size: var(--font-kicker); color: var(--accent-gold); font-weight: 700;">✦ CONSTELLATION ROADMAP ✦</span>
            <span class="hud-status-badge" style="font-size: var(--font-kicker); padding: 2px 8px; border-radius: 4px;">
              RANK: <strong>${progress.currentRank}</strong>
            </span>
            <span class="hud-status-badge" style="font-size: var(--font-kicker); padding: 2px 8px; border-radius: 4px; border-color: var(--accent-gold); color: var(--accent-gold);">
              SUMMIT: <strong class="val-progress-pct">${progress.progressPct}%</strong> (${progress.masteredCount}/${progress.totalNodes} PERKS)
            </span>
          </div>
          <div style="display: flex; align-items: baseline; gap: 8px; overflow: hidden;">
            <h1 style="font-size: var(--font-body); font-weight: 700; margin: 0; font-family: var(--font-sans); color: var(--ink-primary); letter-spacing: -0.01em; white-space: nowrap;">
              The Path to C2 Native Mastery
            </h1>
            </div>
        </div>

        <div class="workout-panel" style="flex: 0 0 auto; display: flex; align-items: center; gap: 12px; background: rgba(255, 255, 255, 0.04); border: none; border-radius: 6px; padding: 8px 14px;">
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
              <span class="telemetry-label" style="color: var(--accent-gold); font-weight: 700; font-size: var(--font-kicker);">★ TODAY'S 15-MINUTE WORKOUT [${workout.level}]</span>
              <span class="telemetry-label" style="font-size: var(--font-kicker);">${workout.left === 0 ? 'ALL 3 DRILLS DONE' : workout.left + ' OF 3 DRILLS REMAINING'}</span>
            </div>
            <div class="workout-tasks" style="display: flex; gap: 10px; font-size: var(--font-kicker); color: var(--ink-secondary);">
              ${workout.tasks.map(t => `
              <div class="workout-task-chip" data-route="${t.route}" title="Jump to ${t.route} drill" style="display: flex; align-items: center; gap: 4px; cursor: pointer;${t.ok ? '' : ' opacity: 0.75;'}">
                <span${t.ok ? ' style="color: var(--accent-gold); font-weight: 700;"' : ''}>${t.ok ? '✓' : '○'}</span> <span>${t.label}</span>
              </div>`).join('')}
            </div>
          </div>
          <button class="hud-btn btn-continue-workout" style="justify-content: center; background: var(--accent-gold); color: var(--bg-canvas); padding: 6px 16px; min-height: 34px; font-weight: 700; font-size: var(--font-kicker); border: none; cursor: pointer; border-radius: 6px; white-space: nowrap; box-shadow: var(--shadow-glow);">
            Continue Today's Workout ${icon('arrowRight')}
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
    for (const node of nodes.filter(n => n.level === 8)) {
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
        <circle cx="0" cy="0" r="22" fill="url(#summitGlow)" class="summit-halo" />
        <circle cx="0" cy="0" r="14" fill="var(--bg-card)" stroke="var(--accent-gold)" stroke-width="2.5" />
        <circle cx="0" cy="0" r="6" fill="var(--accent-gold)" />
        <text x="0" y="24" text-anchor="middle" font-family="var(--font-mono)" font-size="11" font-weight="700" fill="var(--accent-gold)" class="node-title-label">★ C2 SUMMIT ★</text>
      </g>
    `;

    // Labels of near neighbours in one row would collide: alternate them above/below the star.
    const labelAbove = new Set<string>();
    const placed: typeof nodes = [];
    for (const n of [...nodes].sort((p, q) => p.y - q.y || p.x - q.x)) {
      const clash = placed.some(o => Math.abs(o.y - n.y) * 7 < 26 && Math.abs(o.x - n.x) * 10 < 120 && !labelAbove.has(o.id));
      if (clash) labelAbove.add(n.id);
      placed.push(n);
    }

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
        textFill = 'var(--bg-canvas)';
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
        <g transform="translate(${cx}, ${cy})"><g class="constellation-node ${cursorClass}" data-node-id="${node.id}" data-level="${node.level}" style="cursor: pointer;" tabindex="0" role="button" aria-label="${node.title} (${status})">
          <title>${node.title} (Level ${node.level} - CEFR ${node.cefrLevel})</title>
          ${haloSvg}
          <circle cx="0" cy="0" r="14" fill="${circleFill}" stroke="${circleStroke}" stroke-width="${strokeWidth}" class="node-circle" />
          <text x="0" y="4" text-anchor="middle" font-family="var(--font-mono)" font-size="11" font-weight="700" fill="${textFill}">
            ${symbol}
          </text>
          ${status === 'locked' ? `<g transform="translate(-6, -6)" style="color: var(--ink-muted)">${icon('lock', 12)}</g>` : ''}
          <text x="0" y="${labelAbove.has(node.id) ? (line2 ? -29.5 : -19) : 24}" text-anchor="middle" font-family="var(--font-sans)" font-size="9.5" font-weight="600" fill="${status === 'locked' ? 'var(--ink-muted)' : 'var(--ink-secondary)'}" class="node-title-label">
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
      const pct = Math.round((masteredInBranch / branchNodes.length) * 100);
      return `
        <div class="branch-summary-card" data-route="${branch.routeTarget}" tabindex="0" role="button" aria-label="Open ${branch.name}" title="${branch.name} — ${branch.tagline}" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: border-color 0.18s, box-shadow 0.18s; display: flex; flex-direction: column; justify-content: space-between; min-height: 50px; box-shadow: var(--shadow-btn);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
            <span style="font-family: var(--font-mono); font-size: var(--font-kicker); color: var(--accent-gold); font-weight: 700; line-height: 1.25; max-width: 78%;">
              ✦ ${branch.name.toUpperCase()}
            </span>
            <span style="font-family: var(--font-mono); font-size: var(--font-kicker); font-weight: 700; color: var(--ink-primary);">
              ${pct}%
            </span>
          </div>
          <div style="font-size: var(--font-kicker); font-weight: 500; margin-bottom: 6px; line-height: 1.35; color: var(--ink-secondary);">
            ${branch.tagline}
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-family: var(--font-mono); font-size: var(--font-kicker); color: var(--ink-muted); white-space: nowrap;">
              ${masteredInBranch}/${branchNodes.length} mastered
            </span>
            <div style="flex: 1; height: 4px; background: var(--border-hairline); border-radius: 2px; overflow: hidden;">
              <div class="branch-bar" data-pct="${pct}" style="width: ${pct}%; height: 100%; background: var(--accent-gold); border-radius: 2px; box-shadow: 0 0 6px var(--accent-gold-soft);"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  private renderViewSwitcher(): string {
    return `
      <div class="constellation-view-switcher" role="tablist" aria-label="Constellation Display Modes">
        <button class="view-switch-btn btn-view-star-map ${this.viewMode === 'map' ? 'active' : ''}" data-view="map" role="tab" aria-selected="${this.viewMode === 'map'}" aria-label="Switch to Star Map View">
          <span class="btn-icon">${icon('compass', 16)}</span> <span class="btn-text">Star Map</span>
        </button>
        <button class="view-switch-btn btn-view-skill-deck ${this.viewMode === 'deck' ? 'active' : ''}" data-view="deck" role="tab" aria-selected="${this.viewMode === 'deck'}" aria-label="Switch to Skill Deck View">
          <span class="btn-icon">${icon('layers', 16)}</span> <span class="btn-text">Skill Deck</span>
        </button>
      </div>
    `;
  }

  private renderMobileSkillDeck(): string {
    const branches = ConstellationEngine.getMobileDeckBranches();

    return `
      <div class="mobile-skill-deck" role="region" aria-label="Mobile Skill Deck Carousel">
        <div class="deck-carousel-track">
          ${branches.map(b => `
            <div class="deck-branch-card" data-branch="${b.id}" data-route="${b.routeTarget}">
              <div class="deck-card-header">
                <div class="deck-card-title-group">
                  <div class="deck-branch-icon-badge">${icon(b.iconName, 20)}</div>
                  <div>
                    <h2 class="deck-branch-name">${b.name}</h2>
                    <p class="deck-branch-tagline">${b.tagline}</p>
                  </div>
                </div>
                <span class="hud-status-badge deck-cefr-badge">CEFR ${b.cefrLevel}</span>
              </div>

              <div class="deck-mastery-block">
                <div class="deck-mastery-labels">
                  <span class="deck-mastery-pct-text">MASTERY <strong>${b.masteryPct}%</strong></span>
                  <span class="deck-perks-count-text">${b.unlockedPerks}/${b.totalPerks} Active Perks</span>
                </div>
                <div class="deck-progress-bar-track">
                  <div class="deck-progress-bar-fill" style="width: ${b.masteryPct}%;"></div>
                </div>
              </div>

              <button class="hud-btn btn-enter-dossier" data-route="${b.routeTarget}" aria-label="Enter ${b.name} Dossier">
                <span>Enter ${b.name} Dossier</span> ${icon('arrowRight', 16)}
              </button>

              <div class="deck-card-perks-section">
                <div class="deck-section-title">✦ UNLOCKED PERKS & WORKOUT DRILLS</div>
                <div class="deck-perk-badges">
                  ${b.perks.slice(0, 5).map(p => `
                    <div class="deck-badge deck-perk-badge ${p.status === 'mastered' ? 'is-mastered' : (p.status === 'unlocked' ? 'is-unlocked' : 'is-locked')}" data-node-id="${p.id}" data-route="${p.routeTarget}" role="button" tabindex="0" aria-label="${p.title} (${p.status})">
                      <span class="badge-status-dot"></span>
                      <span class="badge-text">${p.title} [${p.cefrLevel}]</span>
                    </div>
                  `).join('')}
                  ${b.workoutTasks.map(t => `
                    <div class="deck-badge deck-workout-badge ${t.ok ? 'is-complete' : 'is-pending'}" data-route="${t.route}" role="button" tabindex="0" aria-label="Workout: ${t.label}">
                      <span class="badge-check">${t.ok ? '✓' : '○'}</span>
                      <span class="badge-text">${t.label}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private bindEvents(): void {
    this.container.addEventListener('keydown', (e: KeyboardEvent) => {
      const el = (e.target as Element).closest('.constellation-node, .branch-summary-card, .deck-badge');
      if (el && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    });

    // View Switcher clicks
    this.container.querySelectorAll('.view-switch-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetView = (btn as HTMLElement).dataset.view as 'map' | 'deck';
        if (targetView && targetView !== this.viewMode) {
          AudioSynthesizer.play('click');
          this.setViewMode(targetView);
        }
      });
    });

    // Enter Dossier 48px CTA buttons in mobile skill deck
    this.container.querySelectorAll('.btn-enter-dossier').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const route = (btn as HTMLElement).dataset.route as RouteId;
        AudioSynthesizer.play('click');
        if (this.onNavigate && route) {
          this.onNavigate(route);
        }
      });
    });

    // Touch-friendly Deck Perk Badges
    this.container.querySelectorAll('.deck-perk-badge').forEach(badge => {
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        AudioSynthesizer.play('click');
        const nodeId = (badge as HTMLElement).dataset.nodeId;
        const route = (badge as HTMLElement).dataset.route as RouteId;
        if (nodeId && SkillTreeEngine.getAllNodes().some(n => n.id === nodeId)) {
          this.openNodeModal(nodeId);
        } else if (route && this.onNavigate) {
          this.onNavigate(route);
        }
      });
    });

    // Touch-friendly Deck Workout Badges
    this.container.querySelectorAll('.deck-workout-badge').forEach(badge => {
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        AudioSynthesizer.play('click');
        const route = (badge as HTMLElement).dataset.route as RouteId;
        if (route && this.onNavigate) {
          this.onNavigate(route);
        }
      });
    });

    // Continue workout button
    this.container.querySelector('.btn-continue-workout')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      if (this.onNavigate) {
        this.onNavigate(this.getWorkout().next); // first unfinished drill
      }
    });

    // Workout task chips click
    this.container.querySelectorAll('.workout-task-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const route = (chip as HTMLElement).dataset.route as RouteId;
        if (route && this.onNavigate) {
          AudioSynthesizer.play('click');
          this.onNavigate(route);
        }
      });
    });

    // Branch cards click
    this.container.querySelectorAll('.branch-summary-card').forEach(el => {
      el.addEventListener('mouseenter', () => MotionEngine.lift(el as HTMLElement, true));
      el.addEventListener('mouseleave', () => MotionEngine.lift(el as HTMLElement, false));
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
        if (circleEl) MotionEngine.hoverScale(circleEl as SVGElement, true);
      });

      nodeEl.addEventListener('mouseleave', () => {
        if (circleEl) MotionEngine.hoverScale(circleEl as SVGElement, false);
      });

      nodeEl.addEventListener('click', () => {
        AudioSynthesizer.play('click');
        MotionEngine.press(nodeEl as HTMLElement);
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
      <div class="completion-receipt-card skill-node-card" style="max-width: 440px; width: 100%; padding: 18px 18px 20px 18px; text-align: left; align-items: stretch; background: var(--bg-card, #131823); border: 1px solid var(--border-subtle); border-radius: 8px; box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6); box-sizing: border-box;">
        <div class="skill-node-topbar" style="display: flex; flex-direction: column; gap: 6px; width: 100%; margin-bottom: 12px; box-sizing: border-box;">
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <span class="telemetry-label" style="color: var(--accent-gold); font-family: var(--font-mono); font-weight: 700; font-size: 11px; letter-spacing: 0.04em;">✦ ${branch.name.toUpperCase()} // LVL ${node.level}</span>
          </div>
          <div style="display: flex; justify-content: flex-end; width: 100%;">
            <span class="hud-status-badge" style="background: rgba(165, 180, 252, 0.16); color: var(--accent-gold); font-family: var(--font-mono); font-size: 10.5px; font-weight: 700; border: 1px solid rgba(165, 180, 252, 0.25); border-radius: 5px; padding: 2px 8px; white-space: nowrap;">CEFR ${node.cefrLevel}</span>
          </div>
        </div>

        <h2 style="font-size: var(--font-h2); font-weight: 700; margin: 0 0 4px 0; font-family: var(--font-sans); color: var(--ink-primary); line-height: 1.25; text-align: left; width: 100%;">
          ${node.title}
        </h2>
        <div style="font-family: var(--font-mono); font-size: var(--text-xs); color: var(--ink-muted); margin-bottom: 12px; text-align: left; width: 100%;">
          ${node.subtitle}
        </div>

        <p style="font-size: var(--font-body-compact); line-height: 1.55; color: var(--ink-secondary); margin: 0 0 16px 0; text-align: left; width: 100%;">
          ${node.description}
        </p>

        <!-- Prerequisite / Gating Box -->
        ${status === 'locked' && prereqStatus ? `
          <div style="background: var(--critical-soft); border: 1px solid rgba(239, 68, 68, 0.3); padding: 12px 14px; border-radius: 8px; margin-bottom: 16px;">
            <div style="font-family: var(--font-mono); font-size: var(--font-kicker); font-weight: 700; color: var(--critical); margin-bottom: 4px;">
              ${icon('lock', 12)} LOCKED — PREREQUISITE REQUIRED
            </div>
            <div style="font-size: var(--text-xs); color: var(--ink-primary); line-height: 1.5;">
              Requires mastery in <strong>${prereqStatus.prereqName}</strong> (Current: ${prereqStatus.currentPct}% / Required: ${prereqStatus.requiredPct}%). Complete review drills in that skill first to unlock.
            </div>
          </div>
        ` : `
          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); padding: 12px 14px; border-radius: 10px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; font-family: var(--font-mono); font-size: var(--font-kicker); font-weight: 700; margin-bottom: 8px;">
              <span style="color: var(--accent-gold); letter-spacing: 0.04em;">★ MASTERY RETENTION:</span>
              <span style="color: var(--ink-primary);">${mastery}% / 80%</span>
            </div>
            <div style="width: 100%; height: 6px; background: rgba(255, 255, 255, 0.08); border-radius: 3px; overflow: hidden;">
              <div style="width: ${mastery}%; height: 100%; background: var(--accent-gold); border-radius: 3px; box-shadow: 0 0 8px var(--accent-gold-soft);"></div>
            </div>
          </div>
        `}

        <div style="display: flex; gap: 8px; margin-top: 8px; width: 100%; box-sizing: border-box;">
          ${status !== 'locked' ? `
            <button type="button" class="btn-launch-drill" style="flex: 1.4; min-height: 42px; padding: 10px 12px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: var(--accent-gold); color: #080a0f; font-family: var(--font-sans); font-weight: 700; font-size: 13px; border: 1px solid transparent; cursor: pointer; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25); white-space: nowrap; box-sizing: border-box;">
              Practice Drill ${icon('arrowRight')}
            </button>
          ` : `
            <button type="button" class="btn-train-prereq" style="flex: 1.4; min-height: 42px; padding: 10px 12px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: rgba(255, 255, 255, 0.06); color: var(--ink-primary); font-family: var(--font-sans); font-weight: 600; font-size: 13px; border: 1px solid rgba(255, 255, 255, 0.1); cursor: pointer; border-radius: 8px; white-space: nowrap; box-sizing: border-box;">
              Train Prereq ${icon('arrowRight')}
            </button>
          `}
          <button type="button" class="btn-close-modal" style="flex: 1; min-height: 42px; padding: 10px 12px; display: inline-flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.06); color: var(--ink-primary); font-family: var(--font-sans); font-weight: 600; font-size: 13px; border: 1px solid rgba(255, 255, 255, 0.1); cursor: pointer; border-radius: 8px; white-space: nowrap; box-sizing: border-box;">
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
