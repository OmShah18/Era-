/**
 * Intro preloader. First visit in a session plays the full sequence (titles, progress line,
 * then the arch-shaped mask "dives" open onto the hero). Later visits play the short version.
 * The arch is a CSS mask driven by `--arch-w` / `--arch-y` (see styles/embed.css).
 */
import { gsap, DUR_L, DUR_S, isDesktop } from './core/config';
import { animateCtn, animateLine, animateTextA, animateTextH, animateTextP } from './core/reveal';
import { lockScroll, scrollToTop, unlockScroll } from './core/scroll';

type Ready = () => void;

function removeMasterPreloader() {
  document.querySelector('[data-master-preloader]')?.remove();
}

function archTimeline(preloader: HTMLElement, heroImg: Element | null, onReady: Ready) {
  const startW = isDesktop() ? '24vw' : '40vw';
  const midW = isDesktop() ? '36vw' : '50vw';
  const heroScale = isDesktop() ? 0.75 : 1.15;

  setTimeout(scrollToTop, 100);
  lockScroll();
  if (heroImg) gsap.set(heroImg, { scale: heroScale, transformOrigin: 'center top' });

  const tl = gsap.timeline().set(preloader, { '--arch-w': startW, '--arch-y': '104vh' });

  const dive = (position: gsap.Position) =>
    tl
      .fromTo(
        preloader,
        { '--arch-w': startW, '--arch-y': '104vh' },
        { '--arch-w': midW, '--arch-y': '15vh', duration: DUR_L * 1.25, ease: 'InOut' },
        position,
      )
      .to(preloader, { '--arch-w': '125', '--arch-y': '-100vh', duration: DUR_L * 2, ease: 'diveIn' }, '<90%')
      .add(() => {
        if (heroImg) gsap.fromTo(heroImg, { scale: heroScale }, { scale: 1, duration: DUR_L * 1.25, ease: 'InOut' });
      }, '<')
      .add(onReady, '<25%')
      .add(() => {
        unlockScroll();
        gsap.set(preloader, { display: 'none' });
      });

  return { tl, dive };
}

function playIntro(preloader: HTMLElement, onReady: Ready) {
  const bgA = preloader.querySelector('.preloader_bg_a');
  const decor = preloader.querySelector('.preloader_bg_decor');
  const progress = preloader.querySelectorAll('.preloader_progress_track');
  const heroImg = document.querySelector('.hero-w_bg_master_img');
  const { tl, dive } = archTimeline(preloader, heroImg, onReady);

  tl.add(() => {
    animateTextA(preloader.querySelectorAll('[data-part="a"]'), 'reveal');
    animateTextH(preloader.querySelectorAll('[data-part="h"]'), 'reveal');
    animateTextP(preloader.querySelectorAll('[data-part="p"]'), 'reveal');
    animateCtn(preloader.querySelectorAll('[data-part="ctn"]'), 'reveal', DUR_S);
    animateLine(preloader.querySelectorAll('[data-part="line"]'), 'reveal');
  })
    .to({}, { duration: DUR_L })
    .fromTo(bgA, { opacity: 0 }, { opacity: 0.05, duration: DUR_L, ease: 'Out' })
    .fromTo(decor, { opacity: 0 }, { opacity: 1, duration: DUR_L, ease: 'Out' }, '<')
    .fromTo(progress, { yPercent: -100 }, { yPercent: 0, duration: 4, ease: 'loaderEase' });
  dive('>');
}

function playShort(preloader: HTMLElement, onReady: Ready) {
  const heroImg = document.querySelector('.hero-w_bg_master_img');
  const { tl, dive } = archTimeline(preloader, heroImg, onReady);
  tl.set(preloader.querySelector('.preloader_ctn'), { display: 'none' })
    .fromTo(preloader.querySelector('.preloader_bg_a'), { opacity: 0 }, { opacity: 0.05, duration: DUR_L, ease: 'Out' })
    .fromTo(preloader.querySelector('.preloader_bg_decor'), { opacity: 0 }, { opacity: 1, duration: DUR_L, ease: 'Out' }, '<');
  dive('<');
}

/** Plays the preloader and calls `onReady` once the page should start its own animations. */
export function runPreloader(onReady: Ready) {
  let visited = false;
  try {
    visited = sessionStorage.getItem('hasVisited') !== null;
  } catch {}

  const preloader = document.querySelector<HTMLElement>('[data-preloader]');
  if (!preloader) {
    onReady();
  } else if (visited) {
    playShort(preloader, onReady);
  } else {
    playIntro(preloader, onReady);
  }
  removeMasterPreloader();

  try {
    sessionStorage.setItem('hasVisited', 'true');
  } catch {}
}
