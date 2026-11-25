import { gsap, ScrollTrigger, DUR_L, DUR_M, DUR_S } from '../core/config';
import { animateCtn, animateSlide, animateTextH, animateTextP } from '../core/reveal';

type AccordionCard = HTMLElement & { closeFunc?: () => void };

/** One-open-at-a-time accordion (`[data-accordion-card]`). */
export function initAccordion() {
  let open: AccordionCard | null = null;
  document.querySelectorAll<AccordionCard>('[data-accordion-card]').forEach((card) => {
    const content = card.querySelector('[data-accordion-card="content"]');
    const icon = card.querySelector('[data-ico-plus]');
    const p = card.querySelectorAll('[data-accordion-card="p"]');
    const ctn = card.querySelectorAll('[data-accordion-card="ctn"]');
    if (!content) return;

    const expand = () => {
      card.classList.add('is-active');
      gsap.to(content, { height: 'auto', duration: DUR_L, ease: 'Out', onComplete: () => ScrollTrigger.refresh() });
      gsap.fromTo(icon, { rotate: 0 }, { rotate: -45, duration: DUR_M, ease: 'InOut', overwrite: true });
      animateTextP(p, 'reveal');
      animateCtn(ctn, 'reveal');
    };
    const collapse = () => {
      card.classList.remove('is-active');
      gsap.to(content, {
        height: 0,
        duration: DUR_L,
        ease: 'Out',
        onComplete: () => ScrollTrigger.refresh(),
        overwrite: true,
      });
      gsap.to(icon, { rotate: -90, duration: DUR_M, ease: 'InOut', overwrite: true });
      animateTextP(p, 'hide', 0);
      animateCtn(ctn, 'hide', 0);
    };

    gsap.set(content, { height: 0, overflow: 'hidden' });
    card.addEventListener('click', () => {
      if (open && open !== card) open.closeFunc?.();
      if (open !== card) {
        expand();
        open = card;
      } else {
        collapse();
        open = null;
      }
    });
    card.closeFunc = collapse;
  });
  ScrollTrigger.refresh();
}

/** Parts of a slide/tab panel that animate during a cross-fade. */
function panelParts(panel: Element, attr: 'data-slider' | 'data-tab') {
  return {
    h: panel.querySelectorAll(`[${attr}="h"]`),
    p: panel.querySelectorAll(`[${attr}="p"]`),
    ctn: panel.querySelectorAll(`[${attr}="ctn"]`),
    img: panel.querySelectorAll(`[${attr}="${attr === 'data-slider' ? 'img' : 'slide'}"]`),
  };
}

/**
 * Shared choreography for sliders and tabs: outgoing text hides while the incoming image
 * wipes over the outgoing one, then incoming text reveals.
 */
function crossfade(
  from: HTMLElement,
  to: HTMLElement,
  attr: 'data-slider' | 'data-tab',
  onComplete: () => void,
): gsap.core.Timeline {
  const out = panelParts(from, attr);
  const inc = panelParts(to, attr);
  return gsap
    .timeline({ onComplete })
    .set(to, { display: 'block', position: 'relative' })
    .set(from, { display: 'block', position: 'absolute' })
    .add(() => {
      animateTextH(inc.h, 'initial');
      animateTextP(inc.p, 'initial');
      animateCtn(inc.ctn, 'initial');
      animateSlide(inc.img, 'initial');
    })
    .add(() => ScrollTrigger.refresh())
    .add(() => {
      animateTextH(out.h, 'hide', 0);
      animateTextP(out.p, 'hide', 0);
      animateCtn(out.ctn, 'hide', 0);
      animateSlide(out.img, 'hide', 0);
      animateSlide(inc.img, 'reveal', 0);
    })
    .to({}, { duration: DUR_M })
    .add(() => {
      animateTextH(inc.h, 'reveal', 0);
      animateTextP(inc.p, 'reveal', 0);
      animateCtn(inc.ctn, 'reveal', DUR_S);
    })
    .to({}, { duration: DUR_S })
    .set(from, { display: 'none' });
}

/** Auto-advancing slider with progress bar and prev/next (`[data-slider]`). */
export function initSlider() {
  // `[data-slider]` also marks parts ("slide", "img"…); like the original, any element with
  // slides inside it is treated as a slider root, the rest bail out on `!length` below.
  gsap.utils.toArray<HTMLElement>('[data-slider]').forEach((root) => {
    const slides = root.querySelectorAll<HTMLElement>('[data-slider="slide"]');
    const pag = root.querySelector<HTMLElement>('[data-slider="pag"]');
    const prevBtn = root.querySelector('[data-slider="prev"]');
    const nextBtn = root.querySelector('[data-slider="next"]');
    const currentEl = root.querySelector('[data-slider="current"]');
    const totalEl = root.querySelector('[data-slider="total"]');
    const nextNumEl = root.querySelector('[data-slider="next-num"]');
    const progressEl = root.querySelector('[data-slider="progress"]');
    const AUTO = 6;
    const length = slides.length;
    if (!length) return;
    if (length === 1) {
      if (pag) pag.style.display = 'none';
      return;
    }

    let current = 0;
    let prev = 0;
    let animating = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    const updateCounters = () => {
      if (currentEl) currentEl.textContent = String(current + 1);
      if (totalEl) totalEl.textContent = String(length);
      if (nextNumEl) nextNumEl.textContent = String(current === length - 1 ? 1 : current + 2);
    };
    const transition = () => {
      const from = slides[prev]!;
      const to = slides[current]!;
      from.style.zIndex = '0';
      to.style.zIndex = '1';
      gsap.killTweensOf([from, to]);
      crossfade(from, to, 'data-slider', () => {
        from.style.zIndex = 'auto';
        to.style.zIndex = '1';
        animating = false;
      });
    };
    const goNext = () => {
      animating = true;
      prev = current;
      current = current === length - 1 ? 0 : current + 1;
      updateCounters();
      transition();
    };
    const startProgress = () => {
      if (progressEl) gsap.fromTo(progressEl, { width: '0%' }, { width: '100%', duration: AUTO, ease: 'none' });
    };
    const resetProgress = () => {
      if (!progressEl) return;
      gsap.killTweensOf(progressEl);
      gsap.set(progressEl, { width: '0%' });
    };
    const start = () => {
      startProgress();
      timer = setInterval(() => {
        goNext();
        startProgress();
      }, AUTO * 1000);
    };
    const stop = () => {
      clearInterval(timer);
      resetProgress();
    };

    gsap.set(slides, { display: 'none', position: 'absolute' });
    gsap.set(slides[current]!, { display: 'block', position: 'relative' });
    updateCounters();

    new IntersectionObserver(
      ([entry]) => {
        stop();
        if (entry?.isIntersecting) start();
      },
      { threshold: 0.2 },
    ).observe(root);
    document.addEventListener('visibilitychange', () => {
      stop();
      if (!document.hidden) start();
    });
    prevBtn?.addEventListener('click', () => {
      if (animating) return;
      animating = true;
      prev = current;
      current = current === 0 ? length - 1 : current - 1;
      updateCounters();
      transition();
      stop();
      start();
    });
    nextBtn?.addEventListener('click', () => {
      if (animating) return;
      stop();
      start();
      goNext();
    });
  });
}

/** Content tabs (`[data-tabs]`) with the same cross-fade as the slider. */
export function initTabs() {
  document.querySelectorAll<HTMLElement>('[data-tabs]').forEach((root) => {
    const triggers = [...root.querySelectorAll<HTMLElement>('[data-tab-trigger]')];
    const contents = root.querySelectorAll('[data-tab-content]');
    if (!triggers.length || !contents.length) return;
    let active = 0;
    let busy = false;
    triggers[0]!.classList.add('is-active');
    contents[0]!.classList.add('is-active');

    triggers.forEach((trigger, index) => {
      trigger.addEventListener('click', () => {
        if (index === active || busy) return;
        const current = triggers[active]!;
        const from = root.querySelector<HTMLElement>(
          `[data-tab-content="${current.getAttribute('data-tab-trigger')}"]`,
        );
        const to = root.querySelector<HTMLElement>(`[data-tab-content="${trigger.getAttribute('data-tab-trigger')}"]`);
        if (!from || !to) return;
        gsap.killTweensOf([from, to]);
        busy = true;
        gsap.set(to, { zIndex: 1 });
        gsap.set(from, { zIndex: 0 });
        crossfade(from, to, 'data-tab', () => (busy = false));
        current.classList.remove('is-active');
        trigger.classList.add('is-active');
        active = index;
      });
    });
  });
}

/** Hero "by day / by night" switch: image cross-fade and the gradient divider position. */
export function initTabsHero() {
  const root = document.querySelector<HTMLElement>('[data-tabs-hero]');
  if (!root) return;
  const triggers = [...root.querySelectorAll<HTMLElement>('[data-tab-trigger]')];
  const divider = root.querySelector<HTMLElement>('.hero-s_tabs_divider');
  if (!triggers.length) return;
  let active = 0;
  let busy = false;

  const syncDivider = () => {
    const current = root.querySelector('[data-tab-trigger].is-active');
    if (!current || !divider) return;
    divider.className = divider.className.replace(/\bis-\S+/g, '').trim();
    divider.classList.add(`is-${current.getAttribute('data-tab-trigger')}`);
  };

  triggers[0]!.classList.add('is-active');
  syncDivider();
  triggers.forEach((trigger, index) => {
    trigger.addEventListener('click', () => {
      if (index === active || busy) return;
      const current = triggers[active]!;
      const from = root.querySelector(`[data-tab-content="${current.getAttribute('data-tab-trigger')}"]`);
      const to = root.querySelector(`[data-tab-content="${trigger.getAttribute('data-tab-trigger')}"]`);
      if (!from || !to) return;
      const img = to.querySelector('[data-tab="img"]');
      gsap.killTweensOf([from, to]);
      busy = true;
      gsap
        .timeline({ onComplete: () => (busy = false) })
        .set(to, { display: 'block', position: 'relative', zIndex: 1 })
        .set(from, { display: 'block', position: 'absolute', zIndex: 0 })
        .add(() => ScrollTrigger.refresh())
        .fromTo(img, { opacity: 0 }, { opacity: 1, duration: DUR_M, ease: 'InOut', overwrite: true })
        .set(from, { display: 'none' });
      current.classList.remove('is-active');
      trigger.classList.add('is-active');
      active = index;
      syncDivider();
    });
  });
}

/** Sliding highlight behind the active tab (`data-tabs-hilight="hor"` for horizontal). */
export function initTabsHilight() {
  document.querySelectorAll<HTMLElement>('[data-tabs-hilight]').forEach((root) => {
    const tabs = root.querySelectorAll<HTMLElement>('[data-tab]');
    const highlight = root.querySelector('[data-tab-hilight]');
    if (!tabs.length || !highlight) return;
    const horizontal = root.dataset.tabsHilight === 'hor';
    const move = () =>
      setTimeout(() => {
        const active = root.querySelector<HTMLElement>('[data-tab].is-active');
        if (!active) return;
        gsap.to(highlight, {
          ...(horizontal
            ? { x: active.offsetLeft, width: active.offsetWidth }
            : { y: active.offsetTop, height: active.offsetHeight }),
          duration: DUR_M,
          ease: 'InOut',
        });
      }, 40);
    move();
    tabs.forEach((tab) => tab.addEventListener('click', move));
  });
}
