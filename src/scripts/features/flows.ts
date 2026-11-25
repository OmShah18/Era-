/**
 * Section-specific scroll choreography for the homepage ("transition flow" in the original).
 * Each block is guarded by its section root, so pages without that section are unaffected.
 */
import { gsap, ScrollTrigger, BREAKPOINT, DUR_L, DUR_M, DUR_S, MQ_DESKTOP } from '../core/config';
import { animateCtn, animateTextH, animateTextP } from '../core/reveal';

type HorizontalHost = HTMLElement & { _horizontalTween?: gsap.core.Tween };

/** Hero: content and background rise together, then the background zooms into the next section. */
function heroFlow() {
  const area = document.querySelector<HTMLElement>('.hero-scroll-area');
  if (!area) return;
  const content = area.querySelector('.hero-s');
  const bg = area.querySelector<HTMLElement>('.hero-w_bg');
  const img = bg?.querySelector<HTMLImageElement>('.img');
  if (!bg || !img) return;
  const mobile = window.innerWidth < BREAKPOINT;

  const build = () => {
    const h = bg.offsetHeight;
    const tl = gsap.timeline({
      scrollTrigger: { trigger: area, start: 'top top', end: 'bottom bottom', scrub: true },
    });
    if (!mobile) {
      tl.fromTo(content, { y: 0 }, { y: -(1.25 * h - window.innerHeight), ease: 'Ease', duration: 0.6 }).fromTo(
        bg,
        { y: 0 },
        { y: -(h - window.innerHeight), ease: 'Ease', duration: 0.6 },
        '<',
      );
    }
    tl.fromTo(
      bg,
      { scale: 1, translateZ: 10, transformOrigin: '50% 75%' },
      { scale: 2, translateZ: 10, ease: 'In', duration: 0.6 },
      mobile ? '>' : '-=0.2',
    );
  };
  if (img.complete) build();
  else img.addEventListener('load', build, { once: true });
}

/** "Benefits" intro: the circular text's words drift apart while scrolling past. */
function benefitsIntroFlow() {
  const section = document.querySelector('.benefits-intro-w');
  if (!section) return;
  gsap
    .timeline({ scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true } })
    .fromTo(
      section.querySelectorAll('[data-circle-text]'),
      { wordSpacing: '0rem' },
      { wordSpacing: '10rem', ease: 'none' },
    );
}

/** Location info card scales in; its copy reveals/hides at the threshold. */
function locationInfoFlow() {
  const section = document.querySelector('.loc-info-w');
  if (!section) return;
  const card = section.querySelector('.loc-info-s');
  const p = section.querySelectorAll('[data-part="p"]');
  const ctn = section.querySelectorAll('[data-part="ctn"]');
  animateTextP(p, 'initial');
  animateCtn(ctn, 'initial');
  gsap
    .timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 30%',
        end: 'bottom bottom',
        scrub: 0.5,
        onEnter: () => {
          animateTextP(p, 'reveal', 0.1);
          animateCtn(ctn, 'reveal', 0.1);
        },
        onLeaveBack: () => {
          animateTextP(p, 'hide', 0);
          animateCtn(ctn, 'hide', 0);
        },
      },
    })
    .fromTo(card, { opacity: 0, scale: 0.75 }, { opacity: 1, scale: 1, ease: 'none' }, 0);
}

/** Desktop: the location story scrolls horizontally inside a pinned, height-matched area. */
function locationHorizontalFlow() {
  const area = document.querySelector<HorizontalHost>('.loc-scroll-area');
  if (!area) return;
  gsap.matchMedia().add(MQ_DESKTOP, () => {
    const track = area.querySelector<HTMLElement>('.loc-scroll-area_track');
    if (!track) return;
    const distance = track.scrollWidth - area.offsetWidth;
    area.style.height = `${track.scrollWidth}px`;
    ScrollTrigger.refresh();

    area._horizontalTween = gsap.to(track, {
      x: -distance,
      ease: 'horScroll',
      scrollTrigger: { trigger: area, start: '2.5% top', end: '97.5% bottom', scrub: 0.25 },
    });

    const scrubAll: ScrollTrigger.Vars = { trigger: area, start: 'top top', end: 'bottom bottom', scrub: 0.25 };
    gsap.fromTo(
      area.querySelectorAll('.loc-intro-s_title_line'),
      { xPercent: gsap.utils.wrap([-5, 25, -15]) },
      { xPercent: gsap.utils.wrap([5, -25, 25]), ease: 'none', scrollTrigger: scrubAll },
    );
    gsap.fromTo(
      area.querySelector('.flower.loc-intro'),
      { xPercent: 0 },
      { xPercent: -25, ease: 'none', scrollTrigger: scrubAll },
    );
    gsap.fromTo(
      area.querySelector('.flower.loc-path'),
      { yPercent: 0 },
      {
        yPercent: 25,
        ease: 'none',
        scrollTrigger: { trigger: area, start: 'bottom bottom', end: 'bottom top', scrub: 0.25 },
      },
    );
  });
}

/** The route illustration draws in left-to-right once it enters (horizontally on desktop). */
function locationPathFlow() {
  const path = document.querySelector<HTMLElement>('.img.loc-path');
  if (!path) return;
  const horizontal = path.closest<HorizontalHost>('[data-scroll-horizontal]');
  gsap.fromTo(
    path,
    { clipPath: 'inset(0% 100% 0% 0%)' },
    {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: DUR_L * 2,
      ease: 'Out',
      delay: DUR_M,
      scrollTrigger: {
        trigger: path,
        containerAnimation: horizontal?._horizontalTween,
        start: horizontal ? 'left bottom' : 'top bottom',
        once: true,
      },
    },
  );
}

/** Master-plan background settles from a slight zoom. */
function locationMapFlow() {
  const section = document.querySelector('.loc-w');
  if (!section) return;
  gsap.from(section.querySelector('.loc-w_bg_img'), {
    scale: 1.15,
    transformOrigin: 'center bottom',
    ease: 'Ease',
    scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom bottom', scrub: 0.25 },
  });
}

/** Amenities: the image stack zooms and the panel fades as the pinned area scrolls out. */
function amenitiesFlow() {
  const area = document.querySelector('.amen-scroll-area');
  if (!area) return;
  gsap
    .timeline({ scrollTrigger: { trigger: area, start: 'top top', end: 'bottom bottom', scrub: true } })
    .fromTo(area.querySelector('.amen-cms'), { scale: 1 }, { scale: 2, ease: 'In' })
    .fromTo(area.querySelector('.amen-w'), { opacity: 1 }, { opacity: 0, ease: 'In' }, '<');
}

/**
 * Architecture (desktop): two clip-path "windows" open into a full arch, the intro scales up
 * and the flowers part, revealing the architecture panel beneath.
 */
function architectureFlow() {
  const area = document.querySelector('.arch-scroll-area');
  if (!area) return;
  gsap.matchMedia().add(MQ_DESKTOP, () => {
    const intro = area.querySelector('.arch-intro-s');
    const panel = area.querySelector('.arch-w');
    if (!intro || !panel) return;
    const left = intro.querySelector('.arch-intro-s_bg_l');
    const right = intro.querySelector('.arch-intro-s_bg_r');
    const flowerL = intro.querySelector('.flower.arch-intro-l');
    const flowerR = intro.querySelector('.flower.arch-intro-r');
    const img = panel.querySelector('.img');
    const h = panel.querySelector('[data-text="h"]');
    const p = panel.querySelector('[data-text="p"]');

    gsap
      .timeline({ scrollTrigger: { trigger: intro, start: 'top bottom', end: '200% top', scrub: true } })
      .fromTo(
        left,
        {
          clipPath:
            'polygon(0% 0%, 0% 100%, 44.444% 100%, 44.444% 36.111%, 98.889% 36.111%, 98.889% 99.074%, 44.444% 99.074%, 1.111% 100%, 100% 100%, 100% 0%)',
        },
        {
          clipPath:
            'polygon(0% 0%, 0% 100%, 44.444% 100%, 44.444% 18.519%, 98.889% 18.519%, 98.889% 81.481%, 44.444% 81.481%, 1.111% 100%, 100% 100%, 100% 0%)',
          ease: 'none',
          duration: 0.5,
        },
      )
      .fromTo(
        right,
        {
          clipPath:
            'polygon(0% 0%, 0% 100%, 1.111% 100%, 1.111% 0.926%, 55.556% 0.926%, 55.556% 63.889%, 1.111% 63.889%, 1.111% 100%, 100% 100%, 100% 0%)',
        },
        {
          clipPath:
            'polygon(0% 0%, 0% 100%, 1.111% 100%, 1.111% 18.519%, 55.556% 18.519%, 55.556% 81.481%, 1.111% 81.481%, 1.111% 100%, 100% 100%, 100% 0%)',
          ease: 'none',
          duration: 0.5,
        },
        '<',
      )
      .to(left, {
        clipPath:
          'polygon(0% 0%, 0% 100%, 44.444% 100%, 44.444% 18.519%, 100% 18.519%, 100% 81.481%, 44.444% 81.481%, 1.111% 100%, 100% 100%, 100% 0%)',
        ease: 'none',
        duration: 0.1,
      })
      .to(
        right,
        {
          clipPath:
            'polygon(0% 0%, 0% 100%, 0% 100%, 0% 18.519%, 55.556% 18.519%, 55.556% 81.481%, 0% 81.481%, 0% 100%, 100% 100%, 100% 0%)',
          ease: 'none',
          duration: 0.1,
        },
        '<',
      )
      .fromTo(intro, { scale: 1 }, { scale: 1.84, ease: 'InOut', duration: 0.4 })
      .to(flowerL, { scale: 1.84, xPercent: -50, ease: 'InOut', duration: 0.4 }, '<')
      .to(flowerR, { scale: 1.84, xPercent: 50, ease: 'InOut', duration: 0.4 }, '<')
      .fromTo(panel, { scale: 0.75, transformOrigin: 'center top' }, { scale: 1, ease: 'InOut', duration: 0.4 }, '<');

    animateTextH(h, 'initial');
    animateTextP(p, 'initial');
    ScrollTrigger.create({
      trigger: area,
      start: '30% top',
      onEnter: () => {
        animateTextH(h, 'reveal', 0);
        animateTextP(p, 'reveal', DUR_S);
      },
      onLeaveBack: () => {
        animateTextH(h, 'hide', 0);
        animateTextP(p, 'hide', 0);
      },
    });
    gsap.to(img, {
      yPercent: 25,
      ease: 'none',
      scrollTrigger: { trigger: area, start: '55% top', end: 'bottom top', scrub: true },
    });
  });
}

/** Footer: the CTA image above insets into a frame while the footer content scales in. */
function footerFlow() {
  const footer = document.querySelector('.footer-w');
  if (!footer) return;
  const clip = document.querySelector('[data-footer-clip]');
  const content = footer.querySelector('.footer-s');
  const h = footer.querySelectorAll('[data-text="h"]');
  const p = footer.querySelectorAll('[data-text="p"]');
  const ctn = footer.querySelectorAll('[data-text="ctn"]');
  const inset = window.innerWidth >= BREAKPOINT ? 'inset(8% 22% 8% 22%)' : 'inset(4% 32% 4% 32%)';

  animateTextH(h, 'initial');
  animateTextP(p, 'initial');
  animateCtn(ctn, 'initial');
  gsap
    .timeline({
      scrollTrigger: {
        trigger: footer,
        start: 'top 30%',
        end: 'bottom bottom',
        scrub: 0.5,
        onEnter: () => {
          animateTextH(h, 'reveal', 0.1);
          animateTextP(p, 'reveal', 0.1);
          animateCtn(ctn, 'reveal', 0.1);
        },
        onLeaveBack: () => {
          animateTextH(h, 'hide', 0);
          animateTextP(p, 'hide', 0);
          animateCtn(ctn, 'hide', 0);
        },
      },
    })
    .fromTo(clip, { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: inset, ease: 'none' }, 0)
    .fromTo(content, { opacity: 0, scale: 0.75 }, { opacity: 1, scale: 1, ease: 'none' }, 0);

  const scrollHint = document.querySelector('.s-down');
  if (scrollHint) {
    gsap.to(scrollHint, {
      opacity: 0,
      ease: 'InOut',
      scrollTrigger: { trigger: footer, start: 'top bottom', end: 'center bottom', scrub: true },
    });
  }
}

/** Apartment detail ("lot") page: sticky info header state. */
function lotFlow() {
  const lot = document.querySelector('.lot-w');
  if (!lot) return;
  const header = lot.querySelector('.lot-s_info_header');
  const line = lot.querySelector('.lot-s_info_line');
  ScrollTrigger.create({
    trigger: lot,
    start: '100px top',
    onEnter: () => {
      header?.classList.remove('is-top');
      line?.classList.remove('is-top');
    },
    onLeaveBack: () => {
      header?.classList.add('is-top');
      line?.classList.add('is-top');
    },
  });
}

export function initTransitionFlow() {
  heroFlow();
  benefitsIntroFlow();
  locationInfoFlow();
  locationHorizontalFlow();
  locationPathFlow();
  locationMapFlow();
  amenitiesFlow();
  architectureFlow();
  footerFlow();
  lotFlow();
}
