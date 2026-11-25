import { gsap, DUR_L, DUR_M, MQ_DESKTOP, MQ_MOBILE } from '../core/config';
import { animateCtn, animateTextA, animateTextH, animateTextP } from '../core/reveal';
import { lockScroll, unlockScroll } from '../core/scroll';

/** "Book a call" modal: the card flips and drops in. */
export function initModalCta() {
  document.querySelectorAll<HTMLElement>('[data-modal-cta-btn]').forEach((btn) => {
    const id = btn.getAttribute('data-modal-cta-btn');
    const modal = document.querySelector<HTMLElement>(`[data-modal-cta="${id}"]`);
    if (!modal) return;
    const container = modal.querySelector('[data-modal-container]');
    const overlay = modal.querySelector('[data-modal-over]');
    const closers = modal.querySelectorAll('[data-modal-close]');
    let isOpen = false;

    const open = () => {
      gsap.set([modal, overlay], { display: 'block' });
      gsap.fromTo(
        container,
        { scale: 0, rotateX: -90, yPercent: -100, rotate: -25 },
        { scale: 1, rotateX: 0, yPercent: 0, rotate: 0, duration: DUR_L, ease: 'Out', overwrite: true },
      );
      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: DUR_L, ease: 'Out', overwrite: true });
      lockScroll();
    };
    const close = () => {
      gsap.to(container, {
        scale: 1,
        rotateX: 90,
        yPercent: 200,
        rotate: 25,
        duration: DUR_M,
        ease: 'In',
        onComplete: () => gsap.set([modal, overlay], { display: 'none' }),
        overwrite: true,
      });
      gsap.to(overlay, { opacity: 0, duration: DUR_M, ease: 'In', overwrite: true });
      unlockScroll();
    };

    gsap.set(modal, { display: 'none' });
    gsap.set(container, { transformPerspective: 1000 });
    btn.addEventListener('click', () => {
      if (isOpen) return;
      open();
      isOpen = true;
    });
    closers.forEach((c) =>
      c.addEventListener('click', () => {
        if (!isOpen) return;
        close();
        isOpen = false;
      }),
    );
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        close();
        isOpen = false;
      }
    });
  });
}

/** Mobile menu: forces the fixed UI to the dark theme while open and morphs the burger icon. */
export function initModalMenu() {
  document.querySelectorAll<HTMLElement>('[data-modal-menu-btn]').forEach((btn) => {
    const id = btn.getAttribute('data-modal-menu-btn');
    const modal = document.querySelector<HTMLElement>(`[data-modal-menu="${id}"]`);
    if (!modal) return;
    const container = modal.querySelector('[data-modal-container]');
    const overlay = modal.querySelector('[data-modal-over]');
    const closers = document.querySelectorAll(`[data-modal-close="${id}"]`);
    const parts = {
      a: modal.querySelectorAll('[data-part="a"]'),
      h: modal.querySelectorAll('[data-part="h"]'),
      p: modal.querySelectorAll('[data-part="p"]'),
      ctn: modal.querySelectorAll('[data-part="ctn"]'),
    };
    const labels = btn.querySelectorAll('.btn-menu_label');
    const bar1 = btn.querySelector('[data-ico-menu="is-1"]');
    const bar2 = btn.querySelector('[data-ico-menu="is-2"]');
    const themed = document.querySelectorAll('[data-theme]');
    let isOpen = false;

    const open = () => {
      gsap.set([modal, overlay], { display: 'block' });
      themed.forEach((el) => {
        if (el.classList.contains('theme_on-dark')) return;
        el.classList.add('theme_on-dark');
        el.setAttribute('data-modal-themed', '');
      });
      labels.forEach((l) => l.classList.toggle('is-active'));
      gsap.fromTo(container, { yPercent: 0 }, { yPercent: 0, duration: DUR_L, ease: 'Out', overwrite: true });
      gsap.to(bar1, { rotate: -45, duration: DUR_M, ease: 'InOut', overwrite: true });
      gsap.to(bar2, { rotate: 45, duration: DUR_M, ease: 'InOut', overwrite: true });
      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: DUR_M, ease: 'Out', overwrite: true });
      animateTextA(parts.a, 'reveal');
      animateTextH(parts.h, 'reveal');
      animateTextP(parts.p, 'reveal');
      animateCtn(parts.ctn, 'reveal');
      lockScroll();
    };
    const close = () => {
      themed.forEach((el) => {
        if (!el.hasAttribute('data-modal-themed')) return;
        el.classList.remove('theme_on-dark');
        el.removeAttribute('data-modal-themed');
      });
      labels.forEach((l) => l.classList.toggle('is-active'));
      gsap.to(container, {
        yPercent: 0,
        duration: DUR_M,
        ease: 'In',
        onComplete: () => gsap.set([modal, overlay], { display: 'none' }),
        overwrite: true,
      });
      gsap.to(bar1, { rotate: 180, duration: DUR_M, ease: 'InOut', overwrite: true });
      gsap.to(bar2, { rotate: 180, duration: DUR_M, ease: 'InOut', overwrite: true });
      gsap.to(overlay, { opacity: 0, duration: DUR_M, ease: 'In', overwrite: true });
      animateTextA(parts.a, 'hide');
      animateTextH(parts.h, 'hide');
      animateTextP(parts.p, 'hide');
      animateCtn(parts.ctn, 'hide');
      unlockScroll();
    };

    gsap.set(modal, { display: 'none' });
    gsap.set([bar1, bar2], { rotate: 180 });
    btn.addEventListener('click', () => {
      if (isOpen) close();
      else open();
      isOpen = !isOpen;
    });
    closers.forEach((c) =>
      c.addEventListener('click', () => {
        if (!isOpen) return;
        close();
        isOpen = false;
      }),
    );
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        close();
        isOpen = false;
      }
    });
  });
}

/** Mobile: hero hotspots open their tip as a bottom sheet. */
export function initModalTip() {
  gsap.matchMedia().add(MQ_MOBILE, () => {
    document.querySelectorAll<HTMLElement>('[data-modal-tip-btn]').forEach((btn) => {
      const id = btn.getAttribute('data-modal-tip-btn');
      const modal = document.querySelector<HTMLElement>(`[data-modal-tip="${id}"]`);
      if (!modal) return;
      const container = modal.querySelector('[data-modal-container]');
      const overlay = modal.querySelector('[data-modal-over]');
      const closers = modal.querySelectorAll('[data-modal-close]');
      let isOpen = false;

      gsap.set(modal, { display: 'none' });
      btn.addEventListener('click', () => {
        if (isOpen) return;
        gsap.set([modal, overlay], { display: 'block' });
        gsap.fromTo(container, { yPercent: 125 }, { yPercent: 0, duration: DUR_L, ease: 'Out', overwrite: true });
        gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: DUR_L, ease: 'Out', overwrite: true });
        lockScroll();
        isOpen = true;
      });
      closers.forEach((c) =>
        c.addEventListener('click', () => {
          if (!isOpen) return;
          gsap.to(container, {
            yPercent: 125,
            duration: DUR_M,
            ease: 'In',
            onComplete: () => gsap.set([modal, overlay], { display: 'none' }),
            overwrite: true,
          });
          gsap.to(overlay, { opacity: 0, duration: DUR_M, ease: 'In', overwrite: true });
          unlockScroll();
          isOpen = false;
        }),
      );
    });
  });
}

/** Desktop: hovering a `[floating-tip-trigger]` shows its card, which trails the cursor. */
export function initFloatingTips() {
  gsap.matchMedia().add(MQ_DESKTOP, () => {
    const tips = new Map(
      [...document.querySelectorAll<HTMLElement>('[floating-tip]')].map((el) => [el.getAttribute('floating-tip'), el]),
    );
    const active = new Set<HTMLElement>();

    const flip = (tip: HTMLElement, x: number, y: number) => {
      const r = tip.getBoundingClientRect();
      tip.classList.toggle('is-left', x + r.width > window.innerWidth);
      tip.classList.toggle('is-top', y + r.height > window.innerHeight);
    };
    const show = (tip: HTMLElement, x: number, y: number) => {
      gsap.set(tip, { x, y });
      flip(tip, x, y);
      tip.classList.add('is-active');
      active.add(tip);
    };
    const hide = (tip: HTMLElement) => {
      tip.classList.remove('is-active', 'is-left', 'is-top');
      active.delete(tip);
    };

    document.addEventListener('mousemove', (e) => {
      active.forEach((tip) => {
        flip(tip, e.clientX, e.clientY);
        gsap.to(tip, { x: e.clientX, y: e.clientY, duration: DUR_L * 2, ease: 'power3' });
      });
    });
    document.querySelectorAll<HTMLElement>('[floating-tip-trigger]').forEach((trigger) => {
      const tip = tips.get(trigger.getAttribute('floating-tip-trigger'));
      if (!tip) return;
      trigger.addEventListener('mouseenter', (e) => show(tip, e.clientX, e.clientY));
      trigger.addEventListener('mouseleave', () => hide(tip));
      if (trigger.matches(':hover')) show(tip, 0, 0);
    });
  });
}
