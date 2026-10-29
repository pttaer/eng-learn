import { t } from '../core/i18n';
import { h } from './ui';

type View = (root: HTMLElement) => () => void;

// Every lazy view registers its loader here, so prefetchViews() can warm them all once the app is up.
const loaders: Array<() => Promise<View>> = [];

/**
 * Wraps a view so its module loads on first visit. Shows a short placeholder while it loads
 * and a clear message if the chunk cannot be fetched (for example offline and never cached).
 */
export function lazyView(load: () => Promise<View>): View {
  loaders.push(load);
  return root => {
    let off: (() => void) | undefined;
    let dead = false;
    const placeholder = h('p', 'ie-lead', t('common.loading', undefined, 'Loading…'));
    root.append(placeholder);
    load().then(
      view => {
        if (dead) return;
        placeholder.remove();
        off = view(root);
      },
      () => {
        placeholder.textContent = t('common.offline_reload', undefined, 'This section could not load. Reload when online.');
      }
    );
    return () => {
      dead = true;
      off?.();
    };
  };
}

/** Fetches every lazy view on idle time, so each one is cached and works offline after one online visit. */
export function prefetchViews(): void {
  const run = () => {
    for (const load of loaders) load().catch(() => undefined);
  };
  const idle = (window as any).requestIdleCallback as ((cb: () => void) => void) | undefined;
  if (idle) idle(run);
  else setTimeout(run, 1500);
}
