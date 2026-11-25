/**
 * Gallery lightbox + zoom (apartment detail pages). Not used on the homepage; kept so those
 * pages only need markup.
 */
import { gsap, BREAKPOINT, DUR_M, DUR_S } from '../core/config';
import { lockScroll, unlockScroll } from '../core/scroll';

export function initLightbox() {
  const sources = [...document.querySelectorAll<HTMLImageElement>('[data-lightbox]')].filter(
    (el) => el.offsetParent !== null,
  );
  if (!sources.length) return;
  const modal = document.querySelector<HTMLElement>('[data-lightbox-modal]');
  const img = modal?.querySelector<HTMLImageElement>('[data-lightbox-img]');
  if (!modal || !img) return;
  const closeBtn = modal.querySelector('[data-slider="close"]');
  const prevBtn = modal.querySelector('[data-slider="prev"]');
  const nextBtn = modal.querySelector('[data-slider="next"]');
  const currentEl = modal.querySelector('[data-slider="current"]');
  const totalEl = modal.querySelector('[data-slider="total"]');
  const progress = modal.querySelector('[data-slider="progress"]');
  const urls = sources.map((el) => el.src || el.dataset.src || '');
  let index = 0;

  const updatePag = () => {
    if (currentEl) currentEl.textContent = String(index + 1).padStart(2, '0');
    if (totalEl) totalEl.textContent = String(urls.length).padStart(2, '0');
    if (progress) gsap.to(progress, { width: `${((index + 1) / urls.length) * 100}%`, duration: DUR_S, ease: 'Out' });
  };
  const open = (i: number) => {
    index = i;
    img.src = urls[index]!;
    updatePag();
    gsap.set(modal, { display: 'block' });
    gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: DUR_M, ease: 'Out' });
    gsap.fromTo(img, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: DUR_M, ease: 'Out' });
    lockScroll();
  };
  const close = () => {
    gsap.to(modal, {
      opacity: 0,
      duration: DUR_S,
      ease: 'In',
      onComplete: () => gsap.set(modal, { display: 'none' }),
    });
    unlockScroll();
  };
  const step = (dir: 1 | -1) => {
    const out = dir === 1 ? -125 : 125;
    const inFrom = dir === 1 ? 125 : -125;
    gsap.to(img, {
      xPercent: out,
      duration: DUR_S,
      ease: 'In',
      onComplete: () => {
        index = (index + dir + urls.length) % urls.length;
        img.src = urls[index]!;
        updatePag();
        gsap.fromTo(img, { xPercent: inFrom }, { xPercent: 0, duration: DUR_M, ease: 'Out' });
      },
    });
  };

  gsap.set(modal, { display: 'none' });
  document
    .querySelectorAll<HTMLElement>('[data-lightbox-btn]')
    .forEach((b) => b.addEventListener('click', () => open(Number(b.dataset.lightboxBtn))));
  sources.forEach((el, i) => el.addEventListener('click', () => open(i)));
  closeBtn?.addEventListener('click', close);
  prevBtn?.addEventListener('click', () => step(-1));
  nextBtn?.addEventListener('click', () => step(1));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
}

/** Desktop: click to fit-width zoom with mouse-driven pan. Mobile: pinch / double-tap zoom. */
export function initImageZoom() {
  const content = document.querySelector<HTMLElement>('[data-lightbox-content]');
  const img = content?.querySelector<HTMLElement>('[data-lightbox-img]');
  if (!content || !img) return;
  const pag = content.parentElement?.querySelector('.modal_lightbox_pag');
  const closeBtn = content.parentElement?.querySelector('.modal_close');
  const decor = document.querySelector('.modal_decor');

  const chromeOut = () => {
    if (pag) gsap.to(pag, { yPercent: 100, duration: DUR_M, ease: 'Out' });
    if (closeBtn) gsap.to(closeBtn, { xPercent: 250, duration: DUR_M, ease: 'Out' });
    if (decor) gsap.to(decor, { scale: 1.1, duration: DUR_M, ease: 'Out' });
  };
  const chromeIn = () => {
    if (pag) gsap.to(pag, { yPercent: 0, duration: DUR_M, ease: 'Out' });
    if (closeBtn) gsap.to(closeBtn, { xPercent: 0, duration: DUR_M, ease: 'Out' });
    if (decor) gsap.to(decor, { scale: 1, duration: DUR_M, ease: 'Out' });
  };

  if (window.innerWidth > BREAKPOINT) {
    let zoomed = false;
    let maxPan = 0;
    let target = 0;
    let y = 0;
    const tick = () => {
      y += 0.08 * (target - y);
      gsap.set(img, { y });
    };
    const onMove = (e: MouseEvent) => {
      if (!zoomed || maxPan <= 0) return;
      target = maxPan * (1 - 2 * (e.clientY / window.innerHeight));
    };
    const zoomIn = () => {
      zoomed = true;
      const scale = window.innerWidth / img.offsetWidth;
      maxPan = Math.max(0, (img.offsetHeight * scale - window.innerHeight) / 2);
      y = 0;
      target = 0;
      gsap.to(img, { scale, duration: DUR_M, ease: 'Out' });
      gsap.ticker.add(tick);
      document.addEventListener('mousemove', onMove);
      chromeOut();
      img.style.cursor = 'zoom-out';
    };
    const zoomOut = () => {
      zoomed = false;
      gsap.ticker.remove(tick);
      document.removeEventListener('mousemove', onMove);
      target = 0;
      gsap.to(img, { scale: 1, y: 0, duration: DUR_M, ease: 'Out' });
      chromeIn();
      img.style.cursor = 'zoom-in';
    };
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => (zoomed ? zoomOut() : zoomIn()));
    document.addEventListener('keydown', (e) => {
      if (['Escape', 'ArrowLeft', 'ArrowRight'].includes(e.key)) zoomOut();
    });
    return;
  }

  let scale = 1;
  let startScale = 1;
  let startDist = 0;
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  let originX = 0;
  let originY = 0;
  let lastTap = 0;
  const dist = (a: Touch, b: Touch) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  const mid = (a: Touch, b: Touch) => ({ x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 });
  const apply = () => gsap.set(img, { scale, x, y });
  const clamp = () => {
    const ir = img.getBoundingClientRect();
    const cr = content.getBoundingClientRect();
    const mx = Math.max(0, (ir.width - cr.width) / 2);
    const my = Math.max(0, (ir.height - cr.height) / 2);
    const cx = Math.max(-mx, Math.min(mx, x));
    const cy = Math.max(-my, Math.min(my, y));
    if (cx === x && cy === y) return;
    x = cx;
    y = cy;
    gsap.to(img, { x, y, duration: DUR_S, ease: 'Out' });
  };
  const reset = () => {
    scale = 1;
    x = 0;
    y = 0;
    gsap.to(img, { scale: 1, x: 0, y: 0, duration: DUR_M, ease: 'Out' });
    chromeIn();
  };
  const zoomTo = () => {
    scale = 2.5;
    x = 0;
    y = 0;
    gsap.to(img, { scale, x: 0, y: 0, duration: DUR_M, ease: 'Out' });
    chromeOut();
  };

  img.style.touchAction = 'none';
  img.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        startDist = dist(e.touches[0]!, e.touches[1]!);
        startScale = scale;
        const m = mid(e.touches[0]!, e.touches[1]!);
        originX = m.x;
        originY = m.y;
        startX = x;
        startY = y;
        if (startScale <= 1) chromeOut();
      } else if (e.touches.length === 1) {
        const now = Date.now();
        if (now - lastTap < 300) {
          e.preventDefault();
          if (scale > 1) reset();
          else zoomTo();
          lastTap = 0;
          return;
        }
        lastTap = now;
        if (scale > 1) {
          e.preventDefault();
          originX = e.touches[0]!.clientX;
          originY = e.touches[0]!.clientY;
          startX = x;
          startY = y;
        }
      }
    },
    { passive: false },
  );
  img.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const m = mid(e.touches[0]!, e.touches[1]!);
        scale = Math.max(1, Math.min(startScale * (dist(e.touches[0]!, e.touches[1]!) / startDist), 5));
        x = startX + (m.x - originX);
        y = startY + (m.y - originY);
        apply();
      } else if (e.touches.length === 1 && scale > 1) {
        e.preventDefault();
        x = startX + (e.touches[0]!.clientX - originX);
        y = startY + (e.touches[0]!.clientY - originY);
        apply();
      }
    },
    { passive: false },
  );
  img.addEventListener('touchend', (e) => {
    if (e.touches.length === 0) {
      if (scale <= 1.05) reset();
      else clamp();
    }
  });
}
