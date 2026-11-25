import { gsap, ScrollTrigger } from '../core/config';
import { REVEALS, type RevealFn } from '../core/reveal';

type HorizontalHost = HTMLElement & { _horizontalTween?: gsap.core.Tween };

/**
 * `[data-scroll-reveal="a|h|p|ctn|line|slide"]` elements are set to their hidden state and
 * revealed once when their trigger enters the viewport. Elements sharing a
 * `[data-scroll-reveal="w"]` ancestor reveal together, triggered by that wrapper.
 * Inside the horizontal location track, triggers run against the horizontal tween.
 */
export function initScrollElementsReveal() {
  Object.entries(REVEALS).forEach(([key, fn]) => {
    const items = document.querySelectorAll<HTMLElement>(`[data-scroll-reveal="${key}"]`);
    if (!items.length) return;

    const groups = new Map<HTMLElement, HTMLElement[]>();
    items.forEach((el) => {
      const trigger = el.closest<HTMLElement>('[data-scroll-reveal="w"]') ?? el;
      if (!groups.has(trigger)) groups.set(trigger, []);
      groups.get(trigger)!.push(el);
    });

    groups.forEach((group, trigger) => {
      gsap.set(group, { visibility: 'visible' });
      createRevealTrigger(trigger, group, fn);
      fn(group, 'initial');
    });
  });
}

function createRevealTrigger(trigger: HTMLElement, items: HTMLElement[], fn: RevealFn) {
  const horizontal = trigger.closest<HorizontalHost>('[data-scroll-horizontal]');
  ScrollTrigger.create({
    trigger,
    containerAnimation: horizontal?._horizontalTween,
    start: horizontal ? 'left bottom' : 'top bottom',
    once: true,
    onEnter: () => fn(items, 'reveal'),
  });
}
