/**
 * Apartments listing behaviour (filter, sort, reset). Not used on the homepage; kept so the
 * listing pages only need markup.
 */
import { gsap, ScrollTrigger, DUR_L, DUR_M, DUR_S } from '../core/config';

const refadeList = (list: HTMLElement) =>
  gsap.fromTo(
    list,
    { opacity: 0, y: '10rem' },
    { opacity: 1, y: '0rem', duration: DUR_L, ease: 'Out', clearProps: 'y', onComplete: () => ScrollTrigger.refresh() },
  );

/** `[data-filter]`: AND-filter items by `data-<group>` values; state mirrored to the query string. */
export function initFilter() {
  document.querySelectorAll<HTMLElement>('[data-filter]').forEach((root) => {
    const list = root.querySelector<HTMLElement>('[data-filter-list]');
    if (!list) return;
    const count = root.querySelector<HTMLElement>('[data-filter-count]');
    const empty = root.querySelector<HTMLElement>('[data-filter-empty]');
    const filters: Record<string, string> = {};
    const items = [...list.querySelectorAll<HTMLElement>('[data-filter-item]')];

    const matching = () =>
      Object.keys(filters).length
        ? items.filter((item) =>
            Object.entries(filters).every(([group, value]) =>
              [...item.querySelectorAll<HTMLElement>(`[data-${group}]`)].map((el) => el.dataset[group]).includes(value),
            ),
          )
        : items;

    const apply = () => {
      const shown = matching();
      items.filter((i) => !shown.includes(i)).forEach((i) => gsap.set(i, { display: 'none' }));
      shown.forEach((i) => gsap.set(i, { display: '' }));
      if (empty) {
        if (shown.length === 0) {
          gsap.set(empty, { display: '' });
          gsap.fromTo(empty, { opacity: 0 }, { opacity: 1, duration: DUR_M, ease: 'Out' });
        } else gsap.set(empty, { display: 'none' });
      }
      if (count) {
        const counter = { val: parseInt(count.textContent ?? '', 10) || 0 };
        gsap.to(counter, {
          val: shown.length,
          duration: DUR_M,
          ease: 'Out',
          overwrite: true,
          onUpdate: () => (count.textContent = String(Math.round(counter.val))),
        });
      }
      refadeList(list);
    };

    const syncUrl = () => {
      const qs = new URLSearchParams(filters).toString();
      history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
    };

    apply();
    root.querySelectorAll<HTMLElement>('[data-filter-trigger]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const group = trigger.dataset.filterGroup!;
        const value = trigger.dataset.filterTrigger!;
        root.querySelectorAll(`[data-filter-group="${group}"]`).forEach((el) => el.classList.remove('is-active'));
        trigger.classList.add('is-active');
        if (value === '*') delete filters[group];
        else filters[group] = value;
        syncUrl();
        gsap.timeline().to(list, { opacity: 0, duration: DUR_S, ease: 'Out', overwrite: true }).add(apply);
      });
    });

    const params = new URLSearchParams(location.search);
    const groups = new Set(
      [...root.querySelectorAll<HTMLElement>('[data-filter-trigger]')].map((t) => t.dataset.filterGroup),
    );
    groups.forEach((group) => {
      const value = params.get(group!);
      const initial = value
        ? root.querySelector<HTMLElement>(`[data-filter-group="${group}"][data-filter-trigger="${value}"]`)
        : root.querySelector<HTMLElement>(`[data-filter-group="${group}"][data-filter-trigger="*"]`);
      initial?.click();
    });
  });
}

/** `[data-sort]`: sort `[data-sort-item]` by `data-sort-<key>` (numeric when possible). */
export function initSort() {
  document.querySelectorAll<HTMLElement>('[data-sort]').forEach((root) => {
    const list = root.querySelector<HTMLElement>('[data-sort-list]');
    if (!list) return;
    const items = [...list.querySelectorAll<HTMLElement>('[data-sort-item]')];
    const state: { key: string | null; order: string } = { key: null, order: 'asc' };
    const camel = (s: string) => s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

    const sort = () => {
      const prop = camel(`sort-${state.key}`);
      [...items]
        .sort((a, b) => {
          const av = a.querySelector<HTMLElement>(`[data-sort-${state.key}]`)?.dataset[prop] ?? '';
          const bv = b.querySelector<HTMLElement>(`[data-sort-${state.key}]`)?.dataset[prop] ?? '';
          const an = parseFloat(av);
          const bn = parseFloat(bv);
          const diff = !isNaN(an) && !isNaN(bn) ? an - bn : av.localeCompare(bv);
          return state.order === 'asc' ? diff : -diff;
        })
        .forEach((item) => list.appendChild(item));
    };

    root.querySelectorAll<HTMLElement>('[data-sort-trigger]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        if (trigger.classList.contains('is-active')) return;
        state.key = trigger.dataset.sortTrigger ?? null;
        state.order = trigger.dataset.sortOrder ?? 'asc';
        root.querySelectorAll('[data-sort-trigger]').forEach((t) => t.classList.remove('is-active'));
        trigger.classList.add('is-active');
        gsap
          .timeline()
          .to(list, { opacity: 0, duration: DUR_S, ease: 'Out', overwrite: true })
          .add(() => {
            sort();
            refadeList(list);
          });
      });
    });
    root.querySelector<HTMLElement>('[data-sort-trigger]')?.click();
  });
}

/** `[data-reset]`: clears filters and restores default sort; disabled when nothing to reset. */
export function initReset() {
  const resets = document.querySelectorAll<HTMLElement>('[data-reset]');
  if (!resets.length) return;
  const sync = () => {
    const filtered = [...document.querySelectorAll('[data-filter-trigger]:not([data-filter-trigger="*"])')].some((t) =>
      t.classList.contains('is-active'),
    );
    const sorts = [...document.querySelectorAll('[data-sort-trigger]')];
    const sorted = sorts.length > 0 && !sorts[0]!.classList.contains('is-active');
    resets.forEach((r) => r.classList.toggle('is-disabled', !filtered && !sorted));
  };
  document
    .querySelectorAll('[data-filter-trigger], [data-sort-trigger]')
    .forEach((t) => t.addEventListener('click', sync));
  resets.forEach((reset) =>
    reset.addEventListener('click', () => {
      if (reset.classList.contains('is-disabled')) return;
      document.querySelectorAll<HTMLElement>('[data-filter-trigger="*"]').forEach((t) => t.click());
      document.querySelector<HTMLElement>('[data-sort-trigger]')?.click();
    }),
  );
  sync();
}
