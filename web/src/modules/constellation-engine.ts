import { SKILL_BRANCHES, SkillNode } from '../core/skill-tree-data';
import { SkillTreeEngine } from '../core/skill-tree-engine';
import { StorageManager, SkillId } from '../utils/storage';
import { Cefr, cefrIndex } from '../core/cefr';
import { RouteId } from '../core/router';
import { IconName } from '../utils/icons';

export interface MobilePerkItem {
  id: string;
  title: string;
  cefrLevel: Cefr;
  status: 'locked' | 'unlocked' | 'mastered';
  masteryPct: number;
  routeTarget: RouteId;
}

export interface MobileDeckBranch {
  id: string;
  name: string;
  tagline: string;
  iconName: IconName;
  routeTarget: RouteId;
  skillId: SkillId;
  cefrLevel: Cefr;
  masteryPct: number;
  totalPerks: number;
  unlockedPerks: number;
  masteredPerks: number;
  perks: MobilePerkItem[];
  workoutTasks: Array<{
    route: RouteId;
    ok: boolean;
    label: string;
  }>;
}

export class ConstellationEngine {
  /**
   * Evaluates if the current window viewport is in mobile dimensions (<= 640px).
   */
  public static isMobileViewport(): boolean {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 640 || (window.matchMedia && window.matchMedia('(max-width: 640px)').matches);
  }

  /**
   * Generates the 5 Core Mobile Skill Deck branches with calculated mastery,
   * active perks, and drill launch hooks.
   */
  public static getMobileDeckBranches(): MobileDeckBranch[] {
    const learnerLevel: Cefr = StorageManager.getLearnerLevel() || 'B2';

    // 1. Reading Branch
    const readingNodes = SKILL_BRANCHES.reading.nodes;
    const readingPerks: MobilePerkItem[] = readingNodes.map(n => ({
      id: n.id,
      title: n.title,
      cefrLevel: n.cefrLevel,
      status: SkillTreeEngine.getNodeStatus(n.id),
      masteryPct: SkillTreeEngine.getNodeMasteryPct(n.id),
      routeTarget: 'read'
    }));
    const readingMastered = readingPerks.filter(p => p.status === 'mastered').length;
    const readingUnlocked = readingPerks.filter(p => p.status !== 'locked').length;
    const readingPct = readingPerks.length > 0
      ? Math.round(readingPerks.reduce((acc, p) => acc + p.masteryPct, 0) / readingPerks.length)
      : 0;

    // 2. Writing Branch
    const writingNodes = SKILL_BRANCHES.writing.nodes;
    const writingPerks: MobilePerkItem[] = writingNodes.map(n => ({
      id: n.id,
      title: n.title,
      cefrLevel: n.cefrLevel,
      status: SkillTreeEngine.getNodeStatus(n.id),
      masteryPct: SkillTreeEngine.getNodeMasteryPct(n.id),
      routeTarget: 'write'
    }));
    const writingMastered = writingPerks.filter(p => p.status === 'mastered').length;
    const writingUnlocked = writingPerks.filter(p => p.status !== 'locked').length;
    const writingPct = writingPerks.length > 0
      ? Math.round(writingPerks.reduce((acc, p) => acc + p.masteryPct, 0) / writingPerks.length)
      : 0;

    // 3. Listening Branch
    const listeningLevel = StorageManager.getSkillLevel('listening') || learnerLevel;
    const listeningPerkDefs: Array<{ id: string; title: string; level: Cefr }> = [
      { id: 'list-1', title: 'Phonetic Catenation & Linking', level: 'A2' },
      { id: 'list-2', title: 'Elision & Weak Forms (Schwa)', level: 'B1' },
      { id: 'list-3', title: 'Connected Speech & Trap Filters', level: 'B2' },
      { id: 'list-4', title: 'Fast Cadence Acoustic Shadowing', level: 'C1' },
      { id: 'list-5', title: 'Accented Multi-Dialect Synthesis', level: 'C2' }
    ];
    const listeningPerks: MobilePerkItem[] = listeningPerkDefs.map(d => {
      const isPast = cefrIndex(d.level) < cefrIndex(listeningLevel);
      const isCurrent = d.level === listeningLevel;
      const status: 'locked' | 'unlocked' | 'mastered' = isPast ? 'mastered' : (isCurrent ? 'unlocked' : 'locked');
      const masteryPct = isPast ? 100 : (isCurrent ? 65 : 0);
      return {
        id: d.id,
        title: d.title,
        cefrLevel: d.level,
        status,
        masteryPct,
        routeTarget: 'listen'
      };
    });
    const listeningMastered = listeningPerks.filter(p => p.status === 'mastered').length;
    const listeningUnlocked = listeningPerks.filter(p => p.status !== 'locked').length;
    const listeningPct = Math.round(listeningPerks.reduce((acc, p) => acc + p.masteryPct, 0) / listeningPerks.length);

    // 4. Speaking Branch
    const speakingNodes = SKILL_BRANCHES.speaking.nodes;
    const speakingPerks: MobilePerkItem[] = speakingNodes.map(n => ({
      id: n.id,
      title: n.title,
      cefrLevel: n.cefrLevel,
      status: SkillTreeEngine.getNodeStatus(n.id),
      masteryPct: SkillTreeEngine.getNodeMasteryPct(n.id),
      routeTarget: 'speak'
    }));
    const speakingMastered = speakingPerks.filter(p => p.status === 'mastered').length;
    const speakingUnlocked = speakingPerks.filter(p => p.status !== 'locked').length;
    const speakingPct = speakingPerks.length > 0
      ? Math.round(speakingPerks.reduce((acc, p) => acc + p.masteryPct, 0) / speakingPerks.length)
      : 0;

    // 5. Collocations / Grammar Branch (Combined Core)
    const collocNodes = SKILL_BRANCHES.collocations.nodes;
    const grammarNodes = SKILL_BRANCHES.grammar.nodes;
    const combinedNodes: SkillNode[] = [...collocNodes, ...grammarNodes];
    const collocGrammarPerks: MobilePerkItem[] = combinedNodes.map(n => ({
      id: n.id,
      title: n.title,
      cefrLevel: n.cefrLevel,
      status: SkillTreeEngine.getNodeStatus(n.id),
      masteryPct: SkillTreeEngine.getNodeMasteryPct(n.id),
      routeTarget: (n.branchId === 'grammar' ? 'grammar' : 'colloc') as RouteId
    }));
    const cgMastered = collocGrammarPerks.filter(p => p.status === 'mastered').length;
    const cgUnlocked = collocGrammarPerks.filter(p => p.status !== 'locked').length;
    const cgPct = collocGrammarPerks.length > 0
      ? Math.round(collocGrammarPerks.reduce((acc, p) => acc + p.masteryPct, 0) / collocGrammarPerks.length)
      : 0;

    // Today's drills count
    const start = new Date().setHours(0, 0, 0, 0);
    const cardStates = StorageManager.loadState().cardStates || {};
    const done = { read: 0, write: 0, listen: 0, speak: 0, colloc: 0, grammar: 0 };
    for (const [id, st] of Object.entries(cardStates)) {
      if (!st || (st.lastReviewed ?? 0) < start) continue;
      if (id.startsWith('read-') || id.startsWith('reading-') || id.startsWith('mine-')) done.read++;
      else if (id.startsWith('write-') || id.startsWith('writing-')) done.write++;
      else if (id.startsWith('listen-') || id.startsWith('passage-')) done.listen++;
      else if (id.startsWith('speak-') || id.startsWith('speaking-')) done.speak++;
      else if (id.startsWith('colloc-') || id.startsWith('vocab-')) done.colloc++;
      else if (id.startsWith('gram-')) done.grammar++;
    }

    return [
      {
        id: 'reading',
        name: 'Reading',
        tagline: 'Hermeneutic & Analytic Intake',
        iconName: 'book',
        routeTarget: 'read',
        skillId: 'reading',
        cefrLevel: StorageManager.getSkillLevel('reading') || learnerLevel,
        masteryPct: readingPct,
        totalPerks: readingPerks.length,
        unlockedPerks: readingUnlocked,
        masteredPerks: readingMastered,
        perks: readingPerks,
        workoutTasks: [
          { route: 'read', ok: done.read >= 1, label: '1 Intensive Reading Pass' }
        ]
      },
      {
        id: 'writing',
        name: 'Writing',
        tagline: 'Rhetorical & Forensic Composition',
        iconName: 'edit',
        routeTarget: 'write',
        skillId: 'writing',
        cefrLevel: StorageManager.getSkillLevel('writing') || learnerLevel,
        masteryPct: writingPct,
        totalPerks: writingPerks.length,
        unlockedPerks: writingUnlocked,
        masteredPerks: writingMastered,
        perks: writingPerks,
        workoutTasks: [
          { route: 'write', ok: done.write >= 1, label: '1 Copywork Synthesis' }
        ]
      },
      {
        id: 'listening',
        name: 'Listening',
        tagline: 'Phonetics & Connected Speech Mechanics',
        iconName: 'headphones',
        routeTarget: 'listen',
        skillId: 'listening',
        cefrLevel: listeningLevel,
        masteryPct: listeningPct,
        totalPerks: listeningPerks.length,
        unlockedPerks: listeningUnlocked,
        masteredPerks: listeningMastered,
        perks: listeningPerks,
        workoutTasks: [
          { route: 'listen', ok: done.listen >= 1, label: '1 Phonetic Transcription Drill' }
        ]
      },
      {
        id: 'speaking',
        name: 'Speaking',
        tagline: 'Acoustic & Fluency Lab (4-3-2)',
        iconName: 'mic',
        routeTarget: 'speak',
        skillId: 'speaking',
        cefrLevel: StorageManager.getSkillLevel('speaking') || learnerLevel,
        masteryPct: speakingPct,
        totalPerks: speakingPerks.length,
        unlockedPerks: speakingUnlocked,
        masteredPerks: speakingMastered,
        perks: speakingPerks,
        workoutTasks: [
          { route: 'speak', ok: done.speak >= 1, label: '1 Speech Fluency Take (4-3-2)' }
        ]
      },
      {
        id: 'collocations_grammar',
        name: 'Collocations / Grammar',
        tagline: 'Lexical Collocations & Syntactic Architecture',
        iconName: 'layers',
        routeTarget: 'colloc',
        skillId: 'vocab',
        cefrLevel: StorageManager.getSkillLevel('vocab') || learnerLevel,
        masteryPct: cgPct,
        totalPerks: collocGrammarPerks.length,
        unlockedPerks: cgUnlocked,
        masteredPerks: cgMastered,
        perks: collocGrammarPerks,
        workoutTasks: [
          { route: 'colloc', ok: done.colloc >= 8, label: `${Math.min(done.colloc, 8)}/8 Collocations Reviewed` },
          { route: 'grammar', ok: done.grammar >= 1, label: '1 Advanced Inversion Rule' }
        ]
      }
    ];
  }

  /**
   * Enables smooth touch pinch-to-zoom and pan on the SVG Star Map container for mobile devices.
   */
  public static setupPanZoom(containerEl: HTMLElement, svgEl: SVGElement): () => void {
    if (!containerEl || !svgEl) return () => {};

    let scale = 1.0;
    let translateX = 0;
    let translateY = 0;
    let startX = 0;
    let startY = 0;
    let initialDistance = 0;
    let initialScale = 1.0;
    let isPanning = false;

    const applyTransform = () => {
      svgEl.style.transformOrigin = 'center center';
      svgEl.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    };

    const getDistance = (touch1: Touch, touch2: Touch): number => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isPanning = true;
        startX = e.touches[0].clientX - translateX;
        startY = e.touches[0].clientY - translateY;
      } else if (e.touches.length === 2) {
        isPanning = false;
        initialDistance = getDistance(e.touches[0], e.touches[1]);
        initialScale = scale;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isPanning && scale > 1.0) {
        e.preventDefault();
        translateX = e.touches[0].clientX - startX;
        translateY = e.touches[0].clientY - startY;

        // Clamp translation to container bounds
        const maxPanX = (containerEl.clientWidth * (scale - 1)) / 2;
        const maxPanY = (containerEl.clientHeight * (scale - 1)) / 2;
        translateX = Math.max(-maxPanX, Math.min(maxPanX, translateX));
        translateY = Math.max(-maxPanY, Math.min(maxPanY, translateY));
        applyTransform();
      } else if (e.touches.length === 2) {
        e.preventDefault();
        const dist = getDistance(e.touches[0], e.touches[1]);
        if (initialDistance > 0) {
          scale = Math.max(0.9, Math.min(3.0, initialScale * (dist / initialDistance)));
          applyTransform();
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) initialDistance = 0;
      if (e.touches.length === 0) {
        isPanning = false;
        // Snap back if scaled down
        if (scale < 1.0) {
          scale = 1.0;
          translateX = 0;
          translateY = 0;
          svgEl.style.transition = 'transform 0.25s ease-out';
          applyTransform();
          setTimeout(() => { svgEl.style.transition = ''; }, 260);
        }
      }
    };

    containerEl.addEventListener('touchstart', onTouchStart, { passive: false });
    containerEl.addEventListener('touchmove', onTouchMove, { passive: false });
    containerEl.addEventListener('touchend', onTouchEnd);
    containerEl.addEventListener('touchcancel', onTouchEnd);

    return () => {
      containerEl.removeEventListener('touchstart', onTouchStart);
      containerEl.removeEventListener('touchmove', onTouchMove);
      containerEl.removeEventListener('touchend', onTouchEnd);
      containerEl.removeEventListener('touchcancel', onTouchEnd);
    };
  }
}
