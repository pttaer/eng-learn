export type RouteId = 'tree' | 'read' | 'write' | 'listen' | 'speak' | 'vocab' | 'colloc' | 'grammar' | 'habits' | 'singularity';

export type RouteChangeHandler = (route: RouteId) => void;

export class Router {
  private currentRoute: RouteId = 'tree';
  private handlers: RouteChangeHandler[] = [];

  constructor() {
    this.init();
  }

  private init(): void {
    window.addEventListener('hashchange', () => {
      this.resolveRoute();
    });

    // Initial resolve
    this.resolveRoute();
  }

  private resolveRoute(): void {
    const rawHash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    const validRoutes: RouteId[] = ['tree', 'read', 'write', 'listen', 'speak', 'vocab', 'colloc', 'grammar', 'habits', 'singularity'];

    const matched = validRoutes.find(r => r === rawHash) || 'tree';
    this.currentRoute = matched;

    this.handlers.forEach(handler => handler(this.currentRoute));
  }

  public navigate(route: RouteId): void {
    window.location.hash = `#${route}`;
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
