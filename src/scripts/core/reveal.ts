/**
 * The site's shared reveal / hide vocabulary. Every animated text or block goes through one of
 * these, driven by `data-scroll-reveal`, `data-part`, `data-tab`, `data-slider` or `hover` attrs.
 *
 *   a     accent script text, per-character 3D flip from the right
 *   h     display headings, per-character flip up
 *   p     body copy, masked line slide
 *   ctn   generic container fade + rise
 *   line  vertical clip wipe
 *   slide image panel diagonal wipe with inner zoom
 */
import { gsap, SplitText, DELAY_REVEAL, DUR_L, DUR_S, STAGGER, isDesktop } from './config';

export type RevealMode = 'reveal' | 'hide' | 'initial';
export type Targets = Element | Element[] | NodeListOf<Element> | null | undefined;
export type RevealFn = (targets: Targets, mode: RevealMode, delay?: number) => void;

const splits = new WeakMap<Element, SplitText>();

const toArray = (targets: Targets): HTMLElement[] =>
  targets ? (gsap.utils.toArray(targets) as HTMLElement[]) : [];

function splitOnce(el: Element, create: () => SplitText) {
  let split = splits.get(el);
  if (!split) {
    split = create();
    splits.set(el, split);
  }
  return split;
}

export const animateTextA: RevealFn = (targets, mode, delay) => {
  toArray(targets).forEach((el, i) => {
    if (!el.textContent?.trim()) return;
    const split = splitOnce(
      el,
      () => new SplitText(el, { type: 'chars', tag: 'span', charsClass: 'split-char', smartWrap: true }),
    );
    const offset = i * STAGGER;
    switch (mode) {
      case 'reveal':
        gsap.fromTo(
          split.chars,
          { opacity: 0, rotateX: 90, x: '10rem', transformOrigin: 'center bottom' },
          {
            opacity: 1,
            rotateX: 0,
            x: '0rem',
            duration: DUR_L,
            delay: (delay ?? DELAY_REVEAL) + offset,
            stagger: STAGGER,
            ease: 'Out',
            overwrite: true,
          },
        );
        break;
      case 'hide':
        gsap.to(split.chars, {
          opacity: 0,
          rotateX: -90,
          x: '-10rem',
          transformOrigin: 'center top',
          duration: DUR_S,
          delay: delay ?? 0,
          stagger: STAGGER * 0.5,
          ease: 'In',
          overwrite: true,
        });
        break;
      case 'initial':
        gsap.set(split.chars, { opacity: 0, rotateX: -90, x: '-10rem', transformOrigin: 'center top' });
    }
  });
};

export const animateTextH: RevealFn = (targets, mode, delay) => {
  toArray(targets).forEach((el, i) => {
    if (!el.textContent?.trim()) return;
    const split = splitOnce(
      el,
      () =>
        new SplitText(el, {
          type: 'words,chars',
          tag: 'span',
          wordsClass: 'split-word',
          charsClass: 'split-char',
          smartWrap: true,
        }),
    );
    const offset = i * STAGGER;
    switch (mode) {
      case 'reveal':
        gsap.fromTo(
          split.chars,
          { opacity: 0, yPercent: 50, rotateY: 90 },
          {
            opacity: 1,
            yPercent: 0,
            rotateY: 0,
            duration: DUR_L,
            delay: (delay ?? DELAY_REVEAL) + offset,
            stagger: STAGGER * 0.5,
            ease: 'Out',
            overwrite: true,
          },
        );
        break;
      case 'hide':
        gsap.to(split.chars, {
          opacity: 0,
          yPercent: -50,
          rotateY: -90,
          duration: DUR_S,
          delay: delay ?? 0,
          stagger: STAGGER * 0.25,
          ease: 'In',
          overwrite: true,
        });
        break;
      case 'initial':
        gsap.set(split.chars, { opacity: 0, yPercent: 50, rotateY: 90 });
    }
  });
};

export const animateTextP: RevealFn = (targets, mode, delay) => {
  toArray(targets).forEach((el, i) => {
    if (!el.textContent?.trim()) return;
    const split = splitOnce(el, () => {
      const s = new SplitText(el, {
        type: 'lines,words',
        tag: 'span',
        linesClass: 'split-line',
        wordsClass: 'split-word',
        mask: 'lines',
      });
      // A single <br> collapses once lines are wrapped; double it so blank lines survive.
      el.querySelectorAll('br').forEach((br) => {
        if (br.nextSibling?.nodeName !== 'BR') br.after(document.createElement('br'));
      });
      return s;
    });
    const offset = i * STAGGER;
    switch (mode) {
      case 'reveal':
        gsap.fromTo(
          split.lines,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: DUR_L,
            delay: (delay ?? DELAY_REVEAL) + offset,
            stagger: STAGGER,
            ease: 'Out',
            overwrite: true,
          },
        );
        break;
      case 'hide':
        gsap.to(split.lines, {
          yPercent: -110,
          duration: DUR_S,
          delay: delay ?? 0,
          stagger: STAGGER * 0.5,
          ease: 'In',
          overwrite: true,
        });
        break;
      case 'initial':
        gsap.set(split.lines, { yPercent: 110 });
    }
  });
};

export const animateCtn: RevealFn = (targets, mode, delay) => {
  const els = toArray(targets);
  if (!els.length) return;
  const rise = isDesktop() ? '3.333rem' : '11.54rem';
  switch (mode) {
    case 'reveal':
      gsap.fromTo(
        els,
        { opacity: 0, y: rise },
        {
          opacity: 1,
          y: '0rem',
          duration: DUR_L,
          delay: delay ?? DELAY_REVEAL,
          stagger: STAGGER,
          ease: 'Out',
          overwrite: true,
        },
      );
      break;
    case 'hide':
      gsap.to(els, {
        opacity: 0,
        y: '0rem',
        duration: DUR_S,
        delay: delay ?? 0,
        stagger: STAGGER * 0.5,
        ease: 'In',
        overwrite: true,
      });
      break;
    case 'initial':
      gsap.set(els, { opacity: 0, y: rise });
  }
};

export const animateLine: RevealFn = (targets, mode, delay) => {
  const els = toArray(targets);
  if (!els.length) return;
  switch (mode) {
    case 'reveal':
      gsap.fromTo(
        els,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: DUR_L,
          delay: delay ?? DELAY_REVEAL,
          stagger: STAGGER,
          ease: 'Out',
          overwrite: true,
        },
      );
      break;
    case 'hide':
      gsap.to(els, {
        clipPath: 'inset(100% 0% 0% 0%)',
        duration: DUR_S,
        delay: delay ?? 0,
        stagger: STAGGER * 0.5,
        ease: 'In',
        overwrite: true,
      });
      break;
    case 'initial':
      gsap.set(els, { clipPath: 'inset(0% 0% 100% 0%)' });
  }
};

export const animateSlide: RevealFn = (targets, mode, delay) => {
  const els = toArray(targets);
  if (!els.length) return;
  const inner = els.map((el) => el.firstElementChild).filter(Boolean) as Element[];
  switch (mode) {
    case 'reveal':
      gsap.fromTo(
        els,
        { clipPath: 'polygon(100% 0%, 100% 0%, 101% 100%, 125% 100%)' },
        {
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          duration: DUR_L,
          delay: delay ?? DELAY_REVEAL,
          ease: 'InOut',
          overwrite: true,
        },
      );
      gsap.fromTo(
        inner,
        { scale: 1.5, xPercent: 25 },
        { scale: 1, xPercent: 0, duration: DUR_L, delay: delay ?? DELAY_REVEAL, ease: 'InOut', overwrite: true },
      );
      break;
    case 'hide':
      gsap.fromTo(
        els,
        { clipPath: 'polygon(0% 0%, 100% 0%, 125% 100%, 0% 100%)' },
        {
          clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
          duration: DUR_L,
          delay: delay ?? 0,
          ease: 'InOut',
          overwrite: true,
        },
      );
      gsap.to(inner, { scale: 1.5, xPercent: -25, duration: DUR_L, delay: delay ?? 0, ease: 'InOut', overwrite: true });
      break;
    case 'initial':
      gsap.set(els, { clipPath: 'inset(100% 0% 0% 0%)' });
      gsap.set(inner, { scale: 1.5, xPercent: 25 });
  }
};

export const REVEALS: Record<string, RevealFn> = {
  a: animateTextA,
  h: animateTextH,
  p: animateTextP,
  ctn: animateCtn,
  line: animateLine,
  slide: animateSlide,
};

/** Runs a reveal/hide on every animated element currently inside the viewport. */
export function animateVisibleElements(scope: ParentNode = document, mode: RevealMode) {
  Object.entries(REVEALS).forEach(([key, fn]) => {
    scope.querySelectorAll(`[data-scroll-reveal="${key}"], [data-part="${key}"]`).forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) fn(el, mode, 0);
    });
  });
}
