/**
 * Barba page transitions: visible text hides, the old container fades out, scroll state is
 * torn down, then the new container fades in and every page script re-initialises.
 */
import barba from '@barba/core';
import { gsap, ScrollTrigger, DUR_M } from './core/config';
import { animateVisibleElements } from './core/reveal';
import { destroyLocalLenis, scrollToTop } from './core/scroll';
import { initAllParallax } from './features/parallax';

export function initPageTransitions(initScripts: () => void) {
  barba.init({
    debug: false,
    transitions: [
      {
        name: 'default',
        sync: false,
        once() {
          initScripts();
        },
        async beforeLeave({ current }) {
          animateVisibleElements(current.container, 'hide');
        },
        async leave({ current }) {
          await gsap.to(current.container, { opacity: 0, duration: DUR_M, ease: 'In' });
        },
        async afterLeave({ current }) {
          setTimeout(scrollToTop, 60);
          ScrollTrigger.getAll().forEach((t) => t.kill());
          destroyLocalLenis();
          current.container.remove();
        },
        async beforeEnter({ next }) {
          gsap.set(next.container, { opacity: 0 });
          initScripts();
          initAllParallax();
          ScrollTrigger.refresh(true);
        },
        async enter({ next }) {
          await gsap.to(next.container, { opacity: 1, duration: DUR_M, ease: 'InOut' });
        },
      },
    ],
  });
}
