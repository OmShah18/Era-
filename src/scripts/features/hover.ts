import { gsap, SplitText, DUR_L, DUR_M, MQ_DESKTOP, STAGGER } from '../core/config';
import { animateLine, animateTextH, animateTextP } from '../core/reveal';

/** Buttons drift toward the cursor (`data-magnetic-strength`, `data-magnetic-strength-inner`). */
export function initMagneticEffect() {
  gsap.matchMedia().add(MQ_DESKTOP, () => {
    const reset = (el: Element, instant: boolean) => {
      gsap.killTweensOf(el);
      const vars: gsap.TweenVars = { x: 0, y: 0, force3D: true, clearProps: 'all' };
      if (instant) gsap.set(el, vars);
      else gsap.to(el, { ...vars, ease: 'elastic.out(1, 0.3)', duration: 1.6 });
    };
    const inners = (el: Element) => el.querySelectorAll('[data-magnetic-inner]');

    const onEnter = (e: MouseEvent) => {
      const el = e.currentTarget as HTMLElement;
      reset(el, true);
      inners(el).forEach((i) => reset(i, true));
    };
    const onMove = (e: MouseEvent) => {
      const el = e.currentTarget as HTMLElement;
      const rect = el.getBoundingClientRect();
      const strength = parseFloat(el.dataset.magneticStrength ?? '') || 25;
      const innerStrength = parseFloat(el.dataset.magneticStrengthInner ?? '') || strength;
      const relX = (e.clientX - rect.left) / el.offsetWidth - 0.5;
      const relY = (e.clientY - rect.top) / el.offsetHeight - 0.5;
      gsap.to(el, {
        x: `${relX * (strength / 16)}em`,
        y: `${relY * (strength / 16)}em`,
        force3D: true,
        ease: 'power4.out',
        duration: 1.6,
      });
      inners(el).forEach((inner) => {
        gsap.to(inner, {
          x: `${relX * (innerStrength / 16)}em`,
          y: `${relY * (innerStrength / 16)}em`,
          force3D: true,
          ease: 'power4.out',
          duration: 2,
        });
      });
    };
    const onLeave = (e: MouseEvent) => {
      const el = e.currentTarget as HTMLElement;
      reset(el, false);
      inners(el).forEach((i) => reset(i, false));
    };

    document.querySelectorAll<HTMLElement>('[data-magnetic-btn]').forEach((el) => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
    });
  });
}

/** Stagger by horizontal position, so multi-line labels wave left to right. */
const staggerByX =
  (total: number) =>
  (index: number, _target: Element, list: Element[]): number => {
    const lefts = list.map((el) => el.getBoundingClientRect().left);
    const min = Math.min(...lefts);
    const range = Math.max(...lefts) - min || 1;
    return ((lefts[index]! - min) / range) * total;
  };

/** `[hover-nav-item]`: label rolls up, duplicate rolls in from below, character by character. */
export function initNavItemHover() {
  document.querySelectorAll<HTMLElement>('[hover-nav-item]').forEach((item) => {
    const labels = item.querySelectorAll<HTMLElement>("[hover='text']");
    if (labels.length < 2) return;
    const opts: SplitText.Vars = {
      type: 'words,chars',
      tag: 'span',
      smartWrap: true,
      wordsClass: 'split-word',
      charsClass: 'split-char',
      mask: 'words',
    };
    const first = new SplitText(labels[0]!, opts);
    const second = new SplitText(labels[1]!, opts);
    gsap.set(second.chars, { yPercent: 100, opacity: 0 });

    const common = { duration: DUR_M, ease: 'Ease', stagger: staggerByX(STAGGER * 2), overwrite: true, force3D: true };
    const enter = () => {
      gsap.fromTo(first.chars, { opacity: 1, yPercent: 0 }, { opacity: 0, yPercent: -100, ...common });
      gsap.fromTo(second.chars, { yPercent: 100, opacity: 0 }, { opacity: 1, yPercent: 0, ...common });
    };
    const leave = () => {
      gsap.to(first.chars, { opacity: 1, yPercent: 0, ...common });
      gsap.to(second.chars, { opacity: 0, yPercent: 100, ...common });
    };
    const trigger = item.closest('[hover-nav-item-trigger]') ?? item;
    trigger.addEventListener('mouseenter', enter);
    trigger.addEventListener('mouseleave', leave);
  });
}

/** `[hover-link]`: underlined text link; characters flip out/in and the underline retracts. */
export function initLinkHover() {
  document.querySelectorAll<HTMLElement>('[hover-link]').forEach((link) => {
    const labels = link.querySelectorAll<HTMLElement>("[hover='text']");
    if (labels.length < 2) return;
    const first = new SplitText(labels[0]!, {
      type: 'lines,words,chars',
      tag: 'span',
      linesClass: 'split-line',
      wordsClass: 'split-word',
      charsClass: 'split-char',
      smartWrap: true,
    });
    const second = new SplitText(labels[1]!, {
      type: 'words,chars',
      tag: 'span',
      wordsClass: 'split-word',
      charsClass: 'split-char',
      smartWrap: true,
    });
    const underlines = first.lines.map((line) => {
      const u = document.createElement('span');
      u.classList.add('link_line');
      line.appendChild(u);
      return u;
    });
    gsap.set(underlines, { scaleX: 1, transformOrigin: 'right center' });
    gsap.set(second.chars, { opacity: 0, x: '-0.4em', yPercent: 25, rotateY: 90 });

    const charOpts = { duration: DUR_M, ease: 'Out', stagger: STAGGER / 4, overwrite: true, force3D: true };
    const enter = () => {
      gsap.fromTo(
        first.chars,
        { opacity: 1, x: '0em', yPercent: 0, rotateY: 0 },
        { opacity: 0, x: '0.4em', yPercent: -25, rotateY: -90, ...charOpts },
      );
      gsap.fromTo(
        second.chars,
        { opacity: 0, x: '-0.4em', yPercent: 25, rotateY: 90 },
        { opacity: 1, x: '0em', yPercent: 0, rotateY: 0, delay: 0.2, ...charOpts },
      );
      gsap.fromTo(
        underlines,
        { scaleX: 1, transformOrigin: 'right center' },
        { scaleX: 0, duration: DUR_M, ease: 'Out', stagger: STAGGER, overwrite: true },
      );
    };
    const leave = () => {
      gsap.to(first.chars, { opacity: 1, x: '0em', yPercent: 0, rotateY: 0, delay: 0.2, ...charOpts });
      gsap.to(second.chars, { opacity: 0, x: '-0.4em', yPercent: 25, rotateY: 90, ...charOpts });
      gsap.to(underlines, {
        scaleX: 1,
        transformOrigin: 'left center',
        duration: DUR_M,
        ease: 'Out',
        stagger: STAGGER,
        overwrite: true,
      });
    };
    const trigger = link.closest('[hover-link-trigger]') ?? link;
    trigger.addEventListener('mouseenter', enter);
    trigger.addEventListener('mouseleave', leave);
  });
}

/** `[hover-btn-circle]`: the ring's arc segments grow to half the circumference on hover. */
export function initBtnCircleHover() {
  document.querySelectorAll<HTMLElement>('[hover-btn-circle]').forEach((btn) => {
    const arcs = btn.querySelectorAll('[data-arc]');
    if (!arcs.length) return;
    const circumference = 2 * Math.PI * 103.5;
    const dash = 0.0417 * circumference;
    gsap.set(arcs, { strokeDasharray: `${dash} ${circumference}` });
    const tl = gsap
      .timeline({ paused: true })
      .to(arcs, { strokeDasharray: `${circumference / 2} ${circumference}`, duration: DUR_M, ease: 'InOut' });
    btn.addEventListener('mouseenter', () => tl.play());
    btn.addEventListener('mouseleave', () => tl.reverse());
  });
}

/** `[hover-card]`: hidden card info (heading, copy, rule) reveals on hover. */
export function initCardParts() {
  document.querySelectorAll<HTMLElement>('[hover-card]').forEach((card) => {
    const h = card.querySelectorAll('[hover="h"]');
    const p = card.querySelectorAll('[hover="p"]');
    const line = card.querySelectorAll('[hover="line"]');
    animateTextH(h, 'initial');
    animateTextP(p, 'initial');
    animateLine(line, 'initial');
    card.addEventListener('mouseenter', () => {
      animateTextH(h, 'reveal', 0);
      animateTextP(p, 'reveal', 0);
      animateLine(line, 'reveal', 0);
    });
    card.addEventListener('mouseleave', () => {
      animateTextH(h, 'hide', 0);
      animateTextP(p, 'hide', 0);
      animateLine(line, 'hide', 0);
    });
  });
}

/** Hero hotspots: pulsing rings, plus icon rotation on hover. */
export function initPins() {
  document.querySelectorAll<HTMLElement>('[data-pin]').forEach((pin) => {
    const plus = pin.querySelector('[data-ico-plus="v"]');
    const pulses = pin.querySelectorAll('[data-pin-pulse]');
    const size = pin.offsetWidth;
    if (pulses.length) {
      gsap.fromTo(
        pulses,
        { opacity: 1, width: size, height: size },
        { opacity: 0, width: size * 1.6, height: size * 1.6, duration: DUR_L, ease: 'In', stagger: 0.2, repeat: -1 },
      );
    }
    if (plus) {
      pin.addEventListener('mouseenter', () =>
        gsap.fromTo(plus, { rotate: 0 }, { rotate: -90, duration: DUR_M, ease: 'Out', overwrite: true }),
      );
      pin.addEventListener('mouseleave', () =>
        gsap.to(plus, { rotate: -180, duration: DUR_M, ease: 'Out', overwrite: true }),
      );
    }
  });
}
