import { gsap, ScrollTrigger, DELAY_REVEAL, DUR_L, DUR_M, MQ_DESKTOP } from '../core/config';
import { getLenis } from '../core/scroll';

/** Cookie bar slides up until accepted/declined; the choice is remembered in localStorage. */
export function initCookies() {
  const bar = document.querySelector<HTMLElement>('[data-cookies]');
  if (!bar) return;
  let stored: string | null = null;
  try {
    stored = localStorage.getItem('cookies');
  } catch {}
  if (stored) {
    bar.remove();
    return;
  }
  const choose = (value: 'accepted' | 'declined') => {
    try {
      localStorage.setItem('cookies', value);
    } catch {}
    gsap.to(bar, { yPercent: 100, duration: DUR_M, ease: 'In', onComplete: () => bar.remove() });
  };
  gsap.fromTo(bar, { yPercent: 100 }, { yPercent: 0, duration: DUR_M, delay: DELAY_REVEAL, ease: 'Out' });
  document.querySelector('[data-cookies="accept"]')?.addEventListener('click', (e) => {
    e.preventDefault();
    choose('accepted');
  });
  document.querySelector('[data-cookies="decline"]')?.addEventListener('click', (e) => {
    e.preventDefault();
    choose('declined');
  });
}

/**
 * The header logo's ring rotates continuously; scroll velocity speeds it up and scroll
 * direction sets its spin direction (only after the user has actually scrolled).
 */
export function initLogo() {
  const logo = document.querySelector('.header-logo');
  if (!logo) return;
  const ring = [...logo.querySelectorAll<HTMLElement>('.header-logo_bg')].find(
    (el) => getComputedStyle(el).display !== 'none',
  );
  if (!ring) return;

  const state = { speed: 30 };
  let direction = 1;
  let rotation = 0;
  let userScrolled = false;
  let settle: ReturnType<typeof setTimeout> | undefined;

  const markScrolled = () => (userScrolled = true);
  window.addEventListener('wheel', markScrolled, { once: true });
  window.addEventListener('touchmove', markScrolled, { once: true });

  gsap.ticker.add((_time, deltaMs) => {
    rotation += state.speed * (Math.min(deltaMs, 100) / 1000);
    gsap.set(ring, { rotation, transformOrigin: 'center center' });
  });

  getLenis().on('scroll', ({ velocity }: { velocity: number }) => {
    if (!userScrolled) return;
    if (velocity !== 0) direction = velocity > 0 ? 1 : -1;
    gsap.to(state, {
      speed: direction * (30 + 10 * Math.abs(velocity)),
      duration: 0.3,
      ease: 'Out',
      overwrite: true,
    });
    clearTimeout(settle);
    settle = setTimeout(() => gsap.to(state, { speed: 30 * direction, duration: DUR_L, ease: 'Out' }), 100);
  });
}

/** Custom vertical scrollbar with a percentage label and a draggable thumb (desktop). */
export function initScrollBar() {
  gsap.matchMedia().add(MQ_DESKTOP, () => {
    const bar = document.querySelector<HTMLElement>('[data-s-bar]');
    if (!bar) return;
    const thumb = bar.querySelector<HTMLElement>('[data-s-bar-thumb]');
    const label = bar.querySelector<HTMLElement>('[data-s-bar-label]');

    ScrollTrigger.create({
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const pct = Math.round(self.progress * 100);
        bar.style.setProperty('--progress', `${self.progress * 100}%`);
        if (label) label.textContent = String(pct).padStart(2, '0');
      },
    });

    if (!thumb) return;
    let dragging = false;
    thumb.addEventListener('pointerenter', () => (document.body.style.cursor = 'grab'));
    thumb.addEventListener('pointerleave', () => {
      if (!dragging) document.body.style.cursor = '';
    });
    thumb.addEventListener('pointerdown', (e) => {
      dragging = true;
      thumb.setPointerCapture(e.pointerId);
      document.body.style.cursor = 'grabbing';
    });
    thumb.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const rect = bar.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      const max = document.documentElement.scrollHeight - window.innerHeight;
      getLenis().scrollTo(progress * max, { duration: 3.2 });
    });
    thumb.addEventListener('pointerup', () => {
      dragging = false;
      document.body.style.cursor = 'grab';
    });
  });
}

/** Agency credit: Lottie logo scrubs to its midpoint on hover and plays out on leave. */
export function initCredits() {
  const credits = document.querySelectorAll<HTMLElement>('.credits');
  if (!credits.length) return;
  // lottie-web is ~250KB; only fetch it when the footer credits exist.
  import('lottie-web/build/player/lottie_svg').then(({ default: lottie }) => {
    credits.forEach((credit) => {
      const container = credit.querySelector<HTMLElement>('.credits_logo');
      const path = container?.getAttribute('data-json');
      if (!container || !path) return;
      const anim = lottie.loadAnimation({ container, renderer: 'svg', loop: false, autoplay: false, path });
      anim.goToAndStop(0, true);
      const FRAMES = 99;
      const scrub = gsap.timeline({ paused: true });
      scrub.to(
        { p: 0 },
        {
          p: 1,
          duration: 1,
          ease: 'none',
          onUpdate(this: gsap.core.Tween) {
            const p = (this.targets()[0] as { p: number }).p;
            anim.goToAndStop(Math.round(p * (FRAMES - 1)), true);
          },
        },
      );
      credit.addEventListener('mouseenter', () => gsap.to(scrub, { progress: 0.5, duration: 1 }));
      credit.addEventListener('mouseleave', () => gsap.to(scrub, { progress: 1, duration: 1 }));
    });
  });
}
