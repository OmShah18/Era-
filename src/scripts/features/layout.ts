import { gsap, ScrollTrigger, BREAKPOINT, DUR_L, MQ_DESKTOP, MQ_MOBILE } from '../core/config';
import { getLenis, hasLenis } from '../core/scroll';

/**
 * Fixed UI (`[data-theme]`: logo, nav, scrollbar…) switches its colour theme depending on which
 * `[data-bg]` section is currently underneath its vertical centre.
 */
export function initThemeChange() {
  const themed = document.querySelectorAll<HTMLElement>('[data-theme]');
  if (!themed.length) return;

  const bind = (section: HTMLElement, add: string, remove: string[]) => {
    if (getComputedStyle(section).display === 'none') return;
    const sectionRect = section.getBoundingClientRect();
    themed.forEach((el) => {
      const r = el.getBoundingClientRect();
      const centerX = r.left + r.width / 2;
      if (centerX < sectionRect.left || centerX > sectionRect.right) return;
      const apply = () => {
        el.classList.add(add);
        el.classList.remove(...remove);
      };
      ScrollTrigger.create({
        trigger: section,
        start: () => `top top+=${r.top + r.height / 2}`,
        end: () => `bottom top+=${r.top + r.height / 2}`,
        onEnter: apply,
        onEnterBack: apply,
      });
    });
  };

  document
    .querySelectorAll<HTMLElement>('[data-bg="color"]')
    .forEach((s) => bind(s, 'theme_on-color', ['theme_on-light', 'theme_on-dark']));
  document
    .querySelectorAll<HTMLElement>('[data-bg="light"]')
    .forEach((s) => bind(s, 'theme_on-light', ['theme_on-dark', 'theme_on-color']));
  document
    .querySelectorAll<HTMLElement>('[data-bg="dark"]')
    .forEach((s) => bind(s, 'theme_on-dark', ['theme_on-light', 'theme_on-color']));
}

/** Desktop: after scrolling stops, settle onto the `[data-snap]` section that fills most of the screen. */
export function initSnapSections() {
  gsap.matchMedia().add(MQ_DESKTOP, () => {
    const sections = gsap.utils.toArray<HTMLElement>('[data-snap]');
    if (!sections.length || !hasLenis()) return;
    const lenis = getLenis();
    let timer: ReturnType<typeof setTimeout> | undefined;
    lenis.on('scroll', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const vh = window.innerHeight;
        let best: HTMLElement | null = null;
        let bestRatio = 0;
        sections.forEach((s) => {
          const r = s.getBoundingClientRect();
          const ratio = (Math.min(r.bottom, vh) - Math.max(r.top, 0)) / Math.min(s.offsetHeight, vh);
          if (ratio > 0.5 && ratio > bestRatio) {
            bestRatio = ratio;
            best = s;
          }
        });
        if (best) lenis.scrollTo(best, { duration: DUR_L, easing: gsap.parseEase('Ease') });
      }, 40);
    });
  });
}

/** Background flower videos only play while their section is on screen. */
export function initPlayPauseVideoScroll() {
  gsap.utils.toArray<HTMLElement>('[data-video-playpause]').forEach((section) => {
    const videos = section.querySelectorAll<HTMLVideoElement>('.video');
    if (!videos.length) return;
    videos.forEach((v) => {
      v.load();
      v.currentTime = 0;
    });
    const play = () => videos.forEach((v) => v.play().catch(() => {}));
    const pause = () => videos.forEach((v) => v.pause());
    ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: play,
      onEnterBack: play,
      onLeave: pause,
      onLeaveBack: pause,
    });
  });
}

export function initOther() {
  const year = String(new Date().getFullYear());
  document.querySelectorAll('.year').forEach((el) => (el.textContent = year));

  document.querySelector('[data-btn-back]')?.addEventListener('click', () => history.back());

  const refresher = document.querySelector('[data-scroll-trigger="refresh"]');
  if (refresher) {
    new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) ScrollTrigger.refresh();
    }).observe(refresher);
  }

  document.querySelectorAll('[data-comma-list]').forEach((list) => {
    const commas = list.querySelectorAll('[data-comma]');
    commas[commas.length - 1]?.remove();
  });

  gsap.matchMedia().add(MQ_MOBILE, () => {
    const path = document.querySelector<HTMLElement>('.loc-path-s_path');
    if (path) path.scrollLeft = (path.scrollWidth - path.clientWidth) / 2;
  });

  document.querySelectorAll('[data-crumb-item]').forEach((el) => {
    if (el.getAttribute('href') === '#') el.classList.add('is-active');
  });

  // Safari: drop WebM sources (alpha HEVC .mov is used instead) and kick off autoplay.
  if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
    document.querySelectorAll('source[src$=".webm"]').forEach((s) => s.remove());
    document.querySelectorAll('video').forEach((v) => {
      if (v.closest('.hero-w') || v.closest('.cta-w')) return;
      v.load();
      v.play().catch(() => {});
    });
  }
}

export function initIndexCounter() {
  document.querySelectorAll('[data-index]').forEach((group) => {
    group.querySelectorAll('[data-index="text"]').forEach((el, i) => (el.textContent = `${i + 1}.0`));
  });
}

/** Scales `[data-fit-text]` so a single line exactly fills its parent's width. */
export function fitText() {
  document.querySelectorAll<HTMLElement>('[data-fit-text]').forEach((el) => {
    el.style.whiteSpace = 'nowrap';
    el.style.fontSize = '';
    el.style.width = 'max-content';
    const available = el.parentElement?.clientWidth ?? 0;
    const natural = el.offsetWidth;
    const size = parseFloat(getComputedStyle(el).fontSize);
    el.style.width = '';
    el.style.fontSize = `${size * (available / natural)}px`;
  });
  window.addEventListener('resize', fitText, { once: true });
}

/** Apartments listing: interleaves benefit cards into the CMS grid at fixed row positions. */
export function initBenefitCards() {
  const list = document.querySelector<HTMLElement>('.apart-cms_list');
  if (!list) return;
  const cards = [...document.querySelectorAll<HTMLElement>('.benefit-card')].filter((c) => !list.contains(c));
  if (!cards.length) return;

  const layout = () => {
    const cols = getComputedStyle(list).gridTemplateColumns.split(' ').length;
    const mobile = window.innerWidth < BREAKPOINT;
    const every = mobile ? 8 : 2;
    const colFor = (n: number) => (mobile ? 1 : n % 2 === 1 ? cols : 1);
    cards.forEach((card, i) => {
      const n = i + 1;
      card.style.gridRow = String(every * n);
      card.style.gridColumn = String(colFor(n));
    });
    const visible = [...list.querySelectorAll<HTMLElement>('[data-filter-item]')].filter(
      (el) => el.style.display !== 'none',
    ).length;
    let placed = 0;
    let shown = 0;
    let row = 1;
    while (placed < visible) {
      for (let c = 1; c <= cols && placed < visible; c++) {
        if (row % every === 0 && c === colFor(row / every)) shown++;
        else placed++;
      }
      row++;
    }
    cards.forEach((card, i) => gsap.set(card, { display: i < shown ? '' : 'none' }));
  };

  cards.forEach((c) => list.appendChild(c));
  layout();
  const observer = new MutationObserver(layout);
  list
    .querySelectorAll('[data-filter-item]')
    .forEach((el) => observer.observe(el, { attributes: true, attributeFilter: ['style'] }));
  let timer: ReturnType<typeof setTimeout> | undefined;
  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(layout, 40);
  });
}

/**
 * For stacked CMS slides/tabs only the first item reveals on scroll; the rest are animated
 * by their slider/tab controller instead.
 */
export function initScrollRevealFirst() {
  const items = document.querySelectorAll<HTMLElement>('[data-reveal-first]');
  if (!items.length) return;
  const groups = new Map<Element | null, HTMLElement[]>();
  items.forEach((el) => {
    const parent = el.parentElement;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent)!.push(el);
  });
  groups.forEach((group) => {
    group.slice(1).forEach((el) => {
      el.querySelectorAll('[data-scroll-reveal]').forEach((n) => n.removeAttribute('data-scroll-reveal'));
    });
  });
}
