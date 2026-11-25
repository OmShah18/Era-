import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './config';

const smoothEasing = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

let lenis: Lenis | null = null;

type LocalLenis = { instance: Lenis; tick: gsap.TickerCallback };
let localInstances: LocalLenis[] = [];

/** The page-level smooth scroller. Created once by `initLenis()`. */
export function getLenis(): Lenis {
  if (!lenis) throw new Error('Lenis has not been initialised');
  return lenis;
}

export function hasLenis() {
  return lenis !== null;
}

export function initLenis() {
  lenis = new Lenis({
    wrapper: window,
    duration: 1.2,
    smoothWheel: true,
    touchMultiplier: 2,
    easing: smoothEasing,
    infinite: false,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis!.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/** Nested smooth-scroll areas, e.g. scrollable modal bodies. */
export function initLocalLenis() {
  document.querySelectorAll<HTMLElement>('[data-lenis-scroll]').forEach((wrapper) => {
    const instance = new Lenis({
      wrapper,
      duration: 0.6,
      smoothWheel: true,
      touchMultiplier: 2,
      easing: smoothEasing,
      infinite: false,
    });
    const tick: gsap.TickerCallback = (time) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    localInstances.push({ instance, tick });
  });
}

export function destroyLocalLenis() {
  localInstances.forEach(({ instance, tick }) => {
    gsap.ticker.remove(tick);
    instance.destroy();
  });
  localInstances = [];
}

export function lockScroll() {
  const scrollbar = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.setProperty('--scrollbar-width', `${scrollbar}px`);
  document.body.style.paddingRight = 'var(--scrollbar-width)';
  document.documentElement.style.overflow = 'hidden';
  lenis?.stop();
}

export function unlockScroll() {
  document.documentElement.style.removeProperty('--scrollbar-width');
  document.body.style.paddingRight = '';
  document.documentElement.style.overflow = '';
  lenis?.start();
}

export function scrollToTop() {
  window.scrollTo(0, 0);
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  lenis?.scrollTo(0, { immediate: true });
}
