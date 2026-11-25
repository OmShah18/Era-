import { gsap, BREAKPOINT } from '../core/config';

/** `data-desk="off"` / `data-mob="off"` on the wrapper disables the effect per breakpoint. */
function enabledFor(el: HTMLElement) {
  const mobile = window.innerWidth < BREAKPOINT;
  if (mobile) return el.dataset.mob !== 'off';
  return el.dataset.desk !== 'off';
}

type ImageParallax = {
  from: gsap.TweenVars;
  to: gsap.TweenVars;
  trigger: Omit<ScrollTrigger.Vars, 'trigger'>;
};

const IMAGE_PARALLAX: Record<string, ImageParallax> = {
  img: {
    from: { yPercent: -15, translateZ: 10 },
    to: { yPercent: 15, translateZ: 10 },
    trigger: { start: 'top bottom', scrub: 0.5 },
  },
  'img-out': {
    from: { yPercent: 0, translateZ: 10 },
    to: { yPercent: 20, translateZ: 10 },
    trigger: { start: 'bottom bottom', end: 'bottom top', scrub: 0.5 },
  },
  'img-in': {
    from: { yPercent: -20, translateZ: 10 },
    to: { yPercent: 0, translateZ: 10 },
    trigger: { start: 'top bottom', end: 'bottom bottom', scrub: true },
  },
};

export function initAllParallax() {
  Object.entries(IMAGE_PARALLAX).forEach(([kind, cfg]) => {
    gsap.utils.toArray<HTMLElement>(`[data-parallax="${kind}"]`).forEach((img) => {
      const wrapper = img.closest<HTMLElement>('[data-parallax="w"]');
      if (!wrapper || !enabledFor(wrapper)) return;
      gsap.fromTo(img, cfg.from, {
        ...cfg.to,
        ease: 'none',
        scrollTrigger: { trigger: wrapper, ...cfg.trigger },
      });
    });
  });

  const drift = (selector: string, from: number, to: number) => {
    gsap.utils.toArray<HTMLElement>(selector).forEach((el) => {
      if (!enabledFor(el)) return;
      gsap.fromTo(
        el,
        { yPercent: from },
        {
          yPercent: to,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 125%', end: 'bottom -25%', scrub: 0.5 },
        },
      );
    });
  };
  drift('[data-parallax="ctn-down"]', -10, 10);
  drift('[data-parallax="ctn-up"]', 10, -10);
}
