/**
 * Runtime entry. Same boot order as the original site script:
 *   Lenis + cookies + parallax -> preloader -> (during the preloader's final dive)
 *   Barba init -> every page feature.
 */
import { ScrollTrigger, registerEases } from './core/config';
import { initLenis, initLocalLenis } from './core/scroll';
import { runPreloader } from './preloader';
import { initPageTransitions } from './transitions';

import { initTransitionFlow } from './features/flows';
import { initAllParallax } from './features/parallax';
import { initScrollElementsReveal } from './features/scroll-reveal';
import {
  fitText,
  initBenefitCards,
  initIndexCounter,
  initOther,
  initPlayPauseVideoScroll,
  initScrollRevealFirst,
  initSnapSections,
  initThemeChange,
} from './features/layout';
import {
  initBtnCircleHover,
  initCardParts,
  initLinkHover,
  initMagneticEffect,
  initNavItemHover,
  initPins,
} from './features/hover';
import { initCookies, initCredits, initLogo, initScrollBar } from './features/chrome';
import { initForm, initFormSubmission, initSelect, initUtmFields } from './features/forms';
import { initAccordion, initSlider, initTabs, initTabsHero, initTabsHilight } from './features/components';
import { initFloatingTips, initModalCta, initModalMenu, initModalTip } from './features/modals';
import { initFilter, initReset, initSort } from './features/listing';
import { initImageZoom, initLightbox } from './features/lightbox';
import { initWebflowLinks } from './features/webflow';

/** Everything that binds to the current Barba container. Order matters (see comments). */
function initScripts() {
  initTransitionFlow(); // creates the horizontal tween that reveal triggers attach to
  initLocalLenis();
  initThemeChange();
  initSnapSections();
  initForm();
  initFormSubmission();
  initUtmFields();
  initPlayPauseVideoScroll();
  initOther();
  initIndexCounter();
  fitText();
  initBenefitCards();
  initScrollRevealFirst(); // must run before reveal triggers are created
  initScrollElementsReveal();
  initMagneticEffect();
  initNavItemHover();
  initLinkHover();
  initBtnCircleHover();
  initSelect();
  initPins();
  initLogo();
  initScrollBar();
  initCredits();
  initCardParts();
  initAccordion();
  initSlider();
  // Carousel (Swiper) from the original runtime is omitted: no page in this build uses it.
  initLightbox();
  initImageZoom();
  initTabs();
  initTabsHilight();
  initTabsHero();
  initModalCta();
  initModalMenu();
  initModalTip();
  initFloatingTips();
  initFilter();
  initSort();
  initReset();
}

function boot() {
  initLenis();
  initWebflowLinks();
  initCookies();
  initAllParallax();
  runPreloader(() => initPageTransitions(initScripts));
}

registerEases();
document.documentElement.style.setProperty('--_100svh', `${window.innerHeight}px`);

let resizeTimer: ReturnType<typeof setTimeout> | undefined;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => ScrollTrigger.refresh(true), 40);
});
history.scrollRestoration = 'manual';

// SplitText measures lines, so wait for the web fonts (bounded, in case one never loads).
Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]).then(boot);
