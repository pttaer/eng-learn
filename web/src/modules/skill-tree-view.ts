const NODE_BRANCH_META: Record<string, { name: string; icon: string }> = {
  reading: { name: 'Reading', icon: 'book' },
  writing: { name: 'Writing', icon: 'edit' },
  listening: { name: 'Listening', icon: 'volume' },
  speaking: { name: 'Speaking', icon: 'messageCircle' },
  grammar: { name: 'Grammar', icon: 'layers' },
  collocations: { name: 'Vocabulary', icon: 'compass' },
  collocations_grammar: { name: 'Collocations & Grammar', icon: 'compass' },
  mediation: { name: 'Mediation', icon: 'globe' },
};

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
import { t } from '../core/i18n';

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
          { route: 'vocab' as RouteId, ok: done.vocab >= 5, label: `${Math.min(done.vocab, 5)}/5 ${t('tree.task_vocab_cards', undefined, 'Vocabulary Cards')}` },
          { route: 'colloc' as RouteId, ok: done.colloc >= 1, label: t('tree.task_a1_colloc', undefined, '1 A1 Collocation Drill') },
          { route: 'listen' as RouteId, ok: done.listen >= 1, label: t('tree.task_phonetic_listen', undefined, '1 Phonetic Listen') }
        ];
        break;
      case 'A2':
        tasks = [
          { route: 'vocab' as RouteId, ok: done.vocab >= 5, label: `${Math.min(done.vocab, 5)}/5 ${t('tree.task_vocab_cards', undefined, 'Vocabulary Cards')}` },
          { route: 'grammar' as RouteId, ok: done.grammar >= 1, label: t('tree.task_a2_grammar', undefined, '1 A2 Grammar Rule') },
          { route: 'read' as RouteId, ok: done.reading >= 1, label: t('tree.task_short_reading', undefined, '1 Short Reading Pass') }
        ];
        break;
      case 'B1':
        tasks = [
          { route: 'colloc' as RouteId, ok: done.colloc >= 8, label: `${Math.min(done.colloc, 8)}/8 ${t('tree.task_colloc_reviewed', undefined, 'Collocations Reviewed')}` },
          { route: 'grammar' as RouteId, ok: done.grammar >= 1, label: t('tree.task_b1_grammar', undefined, '1 B1 Grammar Rule') },
          { route: 'write' as RouteId, ok: done.writing >= 1, label: t('tree.task_para_copywork', undefined, '1 Paragraph Copywork') }
        ];
        break;
      case 'B2':
        tasks = [
          { route: 'colloc' as RouteId, ok: done.colloc >= 10, label: `${Math.min(done.colloc, 10)}/10 ${t('tree.task_colloc_reviewed', undefined, 'Collocations Reviewed')}` },
          { route: 'grammar' as RouteId, ok: done.grammar >= 1, label: t('tree.task_b2_inversion', undefined, '1 B2 Inversion Rule') },
          { route: 'speak' as RouteId, ok: done.speaking >= 1, label: t('tree.task_speech_take', undefined, '1 Speech (4-3-2 Take)') }
        ];
        break;
      case 'C1':
        tasks = [
          { route: 'colloc' as RouteId, ok: done.colloc >= 15, label: `${Math.min(done.colloc, 15)}/15 ${t('tree.task_colloc_reviewed', undefined, 'Collocations Reviewed')}` },
          { route: 'write' as RouteId, ok: done.writing >= 1, label: t('tree.task_rhetorical_copywork', undefined, '1 Rhetorical Copywork') },
          { route: 'speak' as RouteId, ok: done.speaking >= 1, label: t('tree.task_nation_take', undefined, '1 Nation 4-3-2 Take') }
        ];
        break;
      case 'C2':
      default:
        tasks = [
          { route: 'colloc' as RouteId, ok: done.colloc >= 20, label: `${Math.min(done.colloc, 20)}/20 ${t('tree.task_colloc_reviewed', undefined, 'Collocations Reviewed')}` },
          { route: 'write' as RouteId, ok: done.writing >= 1, label: t('tree.task_master_copywork', undefined, '1 Master Copywork') },
          { route: 'read' as RouteId, ok: done.reading >= 1, label: t('tree.task_intensive_reading', undefined, '1 Intensive Reading Pass') }
        ];
        break;
    }

    return { level, tasks, left: tasks.filter(t => !t.ok).length, next: tasks.find(t => !t.ok)?.route ?? ('tree' as RouteId) };
  }

  public teardown(): void {
    const modal = document.getElementById('skill-node-modal');
    if (modal) modal.remove();
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
      <div class="workout-banner tree-command-panel">
        <div class="workout-banner-header">
          <div class="workout-banner-stats">
            <span class="telemetry-label">${t('tree.roadmap', undefined, 'ROADMAP')}</span>
            <span class="workout-rank-metric">
              ${t('tree.rank', undefined, 'RANK:')} <strong>${t('rank.' + progress.currentRank.toLowerCase().replace(/\s+/g, '_'), undefined, progress.currentRank)}</strong>
            </span>
          </div>
          <div class="workout-summit-row">
            <span class="workout-summit-pct">
              ${t('tree.summit', undefined, 'SUMMIT:')} <strong class="val-progress-pct">${progress.progressPct}%</strong>
            </span>
            <span class="workout-banner-count">(${progress.masteredCount}/${progress.totalNodes} ${t('tree.nodes', undefined, 'Nodes')})</span>
          </div>
          <div class="workout-summit-bar-track">
            <div class="workout-summit-bar-fill" style="width: ${progress.progressPct}%;"></div>
          </div>
        </div>

        <div class="workout-panel">
          <div class="workout-panel-info">
            <div class="workout-panel-header">
              <span class="telemetry-label">☆ ${t('tree.workout', undefined, 'WORKOUT')} [${workout.level}]</span>
              <span class="telemetry-label workout-remaining-label">${workout.left === 0 ? t('tree.all_done', undefined, 'ALL DONE ✓') : workout.left + ' ' + t('tree.left', undefined, 'LEFT')}</span>
            </div>
            <div class="workout-tasks">
              ${workout.tasks.map(tTask => `
              <div class="workout-task-chip" data-route="${tTask.route}" title="Jump to ${tTask.route} drill">
                <span${tTask.ok ? ' style="color: var(--accent-gold); font-weight: 700;"' : ''}>${tTask.ok ? '✓' : '○'}</span> <span>${tTask.label}</span>
              </div>`).join('')}
            </div>
          </div>
          <button class="hud-btn btn-continue-workout">
            <span>${t('common.continue', undefined, 'Continue')}</span> ${icon('arrowRight')}
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
        <text x="0" y="24" text-anchor="middle" font-family="var(--font-mono)" font-size="11" font-weight="700" fill="var(--accent-gold)" class="node-title-label">☆ C2 SUMMIT ☆</text>
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
        symbol = '☆';
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
      const pct = branchNodes.length > 0 ? Math.round((masteredInBranch / branchNodes.length) * 100) : 0;
      const bName = t(`branch.${branch.id}.name`, undefined, branch.name);
      const bTagline = t(`branch.${branch.id}.tagline`, undefined, branch.tagline);
      return `
        <div class="branch-summary-card" data-route="${branch.routeTarget}" tabindex="0" role="button" aria-label="Open ${bName}" title="${bName} — ${bTagline}" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 8px 12px; border-radius: var(--radius-btn, 10px); cursor: pointer; transition: border-color 0.18s, box-shadow 0.18s; display: flex; flex-direction: column; justify-content: space-between; min-height: 50px; box-shadow: var(--shadow-btn);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
            <span style="font-family: var(--font-mono); font-size: var(--font-kicker); color: var(--accent-gold); font-weight: 700; line-height: 1.25; max-width: 78%;">
              ${bName.toUpperCase()}
            </span>
            <span style="font-family: var(--font-mono); font-size: var(--font-kicker); font-weight: 700; color: var(--ink-primary);">
              ${pct}%
            </span>
          </div>
          <div style="font-size: var(--font-kicker); font-weight: 500; margin-bottom: 6px; line-height: 1.35; color: var(--ink-secondary);">
            ${bTagline}
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-family: var(--font-mono); font-size: var(--font-kicker); color: var(--ink-muted); white-space: nowrap;">
              ${masteredInBranch}/${branchNodes.length} ${t('tree.mastered', undefined, 'mastered')}
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
        <button class="view-switch-btn btn-view-skill-deck ${this.viewMode === 'deck' ? 'active' : ''}" data-view="deck" role="tab" aria-selected="${this.viewMode === 'deck'}" aria-label="Switch to Skill Grid View">
          <span class="btn-icon">${icon('grid', 16)}</span> <span class="btn-text">${t('tree.skill_grid', undefined, 'Skill Grid')}</span>
        </button>
        <button class="view-switch-btn btn-view-star-map ${this.viewMode === 'map' ? 'active' : ''}" data-view="map" role="tab" aria-selected="${this.viewMode === 'map'}" aria-label="Switch to Star Map View">
          <span class="btn-icon">${icon('compass', 16)}</span> <span class="btn-text">${t('tree.star_map', undefined, 'Star Map')}</span>
        </button>
      </div>
    `;
  }

  private renderMobileSkillDeck(): string {
    const branches = ConstellationEngine.getMobileDeckBranches();

    return `
      <div class="mobile-skill-deck" role="region" aria-label="Skill Grid Roadmap">
        <div class="deck-carousel-track">
          ${branches.map(b => `
            <div class="deck-branch-card" data-branch="${b.id}" data-route="${b.routeTarget}" tabindex="0" role="region" aria-label="${b.name} Skill Card">
              <button class="hud-btn btn-enter-dossier" data-route="${b.routeTarget}" aria-label="Enter ${b.name}">
                ${icon('arrowRight', 16)}
              </button>

              <div class="deck-card-top">
                <div class="deck-card-header">
                  <div class="deck-header-lead" style="display: flex; align-items: center; gap: 7px; min-width: 0;">
                    <div class="deck-branch-icon-badge">${icon(b.iconName, 16)}</div>
                    <h2 class="deck-branch-name">${b.name}</h2>
                  </div>
                </div>
                <div class="deck-branch-sub">
                  <span class="hud-status-badge deck-cefr-badge">${b.cefrLevel}</span>
                  <span class="deck-branch-tagline">${t(`deck.${b.id}_tagline`, undefined, b.tagline)}</span>
                </div>
              </div>

              <div class="deck-mastery-block">
                <div class="deck-mastery-labels">
                  <span class="deck-mastery-pct-text">${b.masteryPct}%</span>
                  <span class="deck-perks-count-text">${b.unlockedPerks}/${b.totalPerks} ${t('tree.perks', undefined, 'Perks')}</span>
                </div>
                <div class="deck-progress-bar-track">
                  <div class="deck-progress-bar-fill" style="width: ${b.masteryPct}%;"></div>
                </div>
              </div>

              <div class="deck-card-perks-section">
                <details class="deck-perks-details">
                  <summary class="deck-section-title deck-perks-summary">
                    <span>${b.perks.slice(0, 5).length} ${t('tree.perks_and_drills', undefined, 'Perks & Drills')}</span>
                  </summary>
                <div class="deck-perk-badges">
                  ${b.perks.slice(0, 5).map(p => `
                    <div class="deck-badge deck-perk-badge ${p.status === 'mastered' ? 'is-mastered' : (p.status === 'unlocked' ? 'is-unlocked' : 'is-locked')}" data-node-id="${p.id}" data-route="${p.routeTarget}" role="button" tabindex="0" aria-label="${p.title} (${p.status})">
                      <span class="badge-status-dot"></span>
                      <span class="badge-text">${p.title}</span>
                    </div>
                  `).join('')}
                  ${b.workoutTasks.map(t => `
                    <div class="deck-badge deck-workout-badge ${t.ok ? 'is-complete' : 'is-pending'}" data-route="${t.route}" role="button" tabindex="0" aria-label="Workout: ${t.label}">
                      <span class="badge-check">${t.ok ? '✓' : '○'}</span>
                      <span class="badge-text">${t.label}</span>
                    </div>
                  `).join('')}
                </div>
                </details>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private bindEvents(): void {
    this.container.addEventListener('keydown', (e: KeyboardEvent) => {
      const el = (e.target as Element).closest('.constellation-node, .branch-summary-card, .deck-badge, .deck-branch-card');
      if (el && (e.key === 'Enter' || e.key === ' ')) {
        if (e.target !== el && (e.target as Element).closest('button, details, summary, input')) return;
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

    // Deck card click
    this.container.querySelectorAll('.deck-branch-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('.btn-enter-dossier, .deck-badge, details, summary')) return;
        const route = (card as HTMLElement).dataset.route as RouteId;
        if (route && this.onNavigate) {
          AudioSynthesizer.play('click');
          this.onNavigate(route);
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
    this.container.querySelector('.btn-blitz-espresso')?.addEventListener('click', () => {
      AudioSynthesizer.play('click');
      if (this.onNavigate) {
        this.onNavigate('blitz');
      }
    });

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
    const branchMeta = NODE_BRANCH_META[node.branchId] || { name: branch ? branch.name : 'Skill', icon: 'target' };

    modal.innerHTML = `
      <div class="completion-receipt-card skill-node-card">
        <div class="skill-node-topbar">
          <span class="skill-branch-pill">${icon(branchMeta.icon as any, 14)} ${branchMeta.name} · ${t('nav.level', undefined, 'Level')} ${node.level}</span>
          <span class="skill-cefr-pill">CEFR ${node.cefrLevel}</span>
        </div>

        <h2 class="skill-node-title">
          ${node.title}
        </h2>
        <div class="skill-node-subtitle">
          ${node.subtitle}
        </div>

        <p class="skill-node-desc">
          ${node.description}
        </p>

        <!-- Prerequisite / Gating Box -->
        ${status === 'locked' && prereqStatus ? `
          <div style="background: var(--critical-soft); padding: 12px 14px; border-radius: var(--radius-squircle-sm, 10px); margin-bottom: 16px;">
            <div style="font-size: var(--font-kicker); font-weight: 700; color: var(--critical); margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
              ${icon('lock', 12)} ${t('tree.prereq_required', undefined, 'Prerequisite Required')}
            </div>
            <div style="font-size: var(--text-xs); color: var(--ink-primary); line-height: 1.5;">
              Requires mastery in <strong>${prereqStatus.prereqName}</strong> (${prereqStatus.currentPct}% / ${prereqStatus.requiredPct}% needed). Complete review drills in that skill first to unlock.
            </div>
          </div>
        ` : `
          <div class="skill-mastery-box">
            <div class="skill-mastery-labels">
              <span style="color: var(--ink-secondary); font-weight: 500;">${t('tree.mastery_retention', undefined, 'Mastery retention')}</span>
              <span style="color: var(--ink-primary); font-weight: 700;">${mastery}% / 80%</span>
            </div>
            <div class="skill-mastery-track">
              <div class="skill-mastery-fill" style="width: ${mastery}%;"></div>
            </div>
          </div>
        `}

        <div class="skill-node-actions action-stack" style="display: flex; flex-direction: column; gap: 12px; width: 100%; margin-top: 18px;">
          ${status !== 'locked' ? `
            <button type="button" class="skill-btn-primary btn-launch-drill">
              ${t('tree.practice_drill', undefined, 'Practice Drill')} ${icon('arrowRight')}
            </button>
          ` : `
            <button type="button" class="skill-btn-primary btn-train-prereq">
              ${t('tree.train_prereq', undefined, 'Train Prereq')} ${icon('arrowRight')}
            </button>
          `}
          <button type="button" class="apple-bottom-close-btn btn-modal-close" aria-label="${t('common.close', undefined, 'Close')}">
            ${t('common.close', undefined, 'Close')}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const cardEl = modal.querySelector('.completion-receipt-card') as HTMLElement;
    if (cardEl) {
      MotionEngine.springModal(modal, cardEl);
    }

    const closeModal = () => {
      window.removeEventListener('keydown', onKeyDown, true);
      AudioSynthesizer.play('click');
      modal.remove();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    modal.querySelectorAll('.btn-modal-close, .skill-node-close-btn').forEach(btn => {
      btn.addEventListener('click', closeModal);
    });

    modal.querySelector('.btn-launch-drill')?.addEventListener('click', () => {
      window.removeEventListener('keydown', onKeyDown, true);
      AudioSynthesizer.play('click');
      modal.remove();
      if (this.onNavigate) {
        this.onNavigate(node.routeTarget);
      }
    });

    modal.querySelector('.btn-train-prereq')?.addEventListener('click', () => {
      window.removeEventListener('keydown', onKeyDown, true);
      AudioSynthesizer.play('click');
      modal.remove();
      if (this.onNavigate) {
        this.onNavigate(node.routeTarget);
      }
    });
  }
}
