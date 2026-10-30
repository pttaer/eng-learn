export type RouteId = 'tree' | 'read' | 'write' | 'listen' | 'speak' | 'vocab' | 'colloc' | 'grammar' | 'tenses' | 'habits' | 'singularity' | 'blitz' | 'mediate' | 'analytics' | 'cockpit' | 'drills' | 'settings';

export type RouteChangeHandler = (route: RouteId) => void;
export type RouteNavigationGuard = (toRoute: RouteId, fromRoute: RouteId) => boolean | Promise<boolean>;

export class Router {
  private currentRoute: RouteId = 'tree';
  private handlers: RouteChangeHandler[] = [];
  private guard: RouteNavigationGuard | null = null;
  private isReverting: boolean = false;
  private isNavigating: boolean = false;

  constructor() {
    this.init();
  }

  private init(): void {
    window.addEventListener('hashchange', () => {
      this.handleHashChange();
    });

    // Initial resolve
    this.resolveRoute();
  }

  private matchHash(raw: string): RouteId {
    const rawHash = raw.replace(/^#\/?/, '').toLowerCase();
    const validRoutes: RouteId[] = ['tree', 'read', 'write', 'listen', 'speak', 'vocab', 'colloc', 'grammar', 'tenses', 'habits', 'singularity', 'blitz', 'mediate', 'analytics', 'cockpit', 'drills', 'settings'];

    const aliases: Record<string, RouteId> = {
      'reading': 'read',
      'writing': 'write',
      'listening': 'listen',
      'speaking': 'speak',
      'collocations': 'colloc',
      'collocation': 'colloc',
      'mistakes': 'tree'
    };
    return validRoutes.find(r => r === rawHash) || aliases[rawHash] || 'tree';
  }

  private resolveRoute(): void {
    this.currentRoute = this.matchHash(window.location.hash);
    this.handlers.forEach(handler => handler(this.currentRoute));
  }

  private async handleHashChange(): Promise<void> {
    if (this.isReverting) {
      this.isReverting = false;
      return;
    }

    const targetRoute = this.matchHash(window.location.hash);
    if (targetRoute === this.currentRoute) return;

    if (this.guard) {
      this.isNavigating = true;
      try {
        const allowed = await this.guard(targetRoute, this.currentRoute);
        if (!allowed) {
          this.isReverting = true;
          window.location.hash = `#${this.currentRoute}`;
          return;
        }
      } finally {
        this.isNavigating = false;
      }
    }

    this.currentRoute = targetRoute;
    this.handlers.forEach(handler => handler(this.currentRoute));
  }

  public async navigate(route: RouteId): Promise<boolean> {
    if (route === this.currentRoute) return true;
    if (this.isNavigating) return false;

    if (this.guard) {
      this.isNavigating = true;
      try {
        const allowed = await this.guard(route, this.currentRoute);
        if (!allowed) return false;
      } finally {
        this.isNavigating = false;
      }
    }

    this.currentRoute = route;
    window.location.hash = `#${route}`;
    this.handlers.forEach(handler => handler(this.currentRoute));
    return true;
  }

  public setBeforeNavigate(guard: RouteNavigationGuard | null): void {
    this.guard = guard;
  }

  public onRoute(handler: RouteChangeHandler): void {
    this.handlers.push(handler);
    // Invoke immediately with current route
    handler(this.currentRoute);
  }

  public getCurrentRoute(): RouteId {
    return this.currentRoute;
  }
}
