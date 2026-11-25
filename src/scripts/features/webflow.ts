/**
 * The two pieces of webflow.js behaviour this page relies on (jQuery + webflow.js are not
 * shipped):
 *   - `a[href="#"]` clicks are cancelled (buttons that are anchors).
 *   - same-page `#hash` links smooth-scroll with Webflow's distance-based duration.
 */
import { getLenis, hasLenis } from '../core/scroll';

const HASH = /^#[a-zA-Z0-9][\w:.-]*$/;
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1);

/** Webflow's scroll duration: 472.143·ln(|Δ| + 125) − 2000 ms. */
const durationFor = (distance: number) => Math.max(0, 472.143 * Math.log(Math.abs(distance) + 125) - 2000) / 1000;

let bound = false;

export function initWebflowLinks() {
  if (bound) return;
  bound = true;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.addEventListener('click', (e) => {
    const link = (e.target as Element | null)?.closest?.('a');
    if (!link) return;
    const href = link.getAttribute('href') ?? '';

    if (href === '#') {
      e.preventDefault();
      return;
    }
    if (!href.includes('#') || link.classList.contains('w-tab-link')) return;
    const samePage = link.host + link.pathname === location.host + location.pathname;
    if (!samePage || !HASH.test(link.hash)) return;
    const target = document.querySelector<HTMLElement>(link.hash);
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();
    if (location.hash !== link.hash) history.pushState({ hash: link.hash }, '', link.hash);

    const top = target.getBoundingClientRect().top + window.scrollY;
    const duration = reducedMotion.matches ? 0 : durationFor(top - window.scrollY);
    if (hasLenis()) getLenis().scrollTo(top, { duration, easing: easeInOutCubic, force: true });
    else window.scrollTo({ top, behavior: duration ? 'smooth' : 'auto' });
  });
}
