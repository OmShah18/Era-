import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);

/** Desktop breakpoint (px). Mirrors Webflow's 992px tablet/desktop switch. */
export const BREAKPOINT = 992;

export const DUR_S = 0.4;
export const DUR_M = 0.8;
export const DUR_L = 1.2;
export const STAGGER = 0.1;
export const DELAY_REVEAL = 0.3;

export const isDesktop = () => window.innerWidth >= BREAKPOINT;
export const MQ_DESKTOP = `(min-width: ${BREAKPOINT}px)`;
export const MQ_MOBILE = `(max-width: ${BREAKPOINT - 1}px)`;

let easesRegistered = false;

/** Named eases used throughout the site (same curves as the CSS custom properties). */
export function registerEases() {
  if (easesRegistered) return;
  easesRegistered = true;
  CustomEase.create('InOut', '0.75,0,0.25,1');
  CustomEase.create('Out', '0.25,1,0.5,1');
  CustomEase.create('In', '0.5,0,0.75,0');
  CustomEase.create('Ease', '0.25,0.1,0.25,1');
  CustomEase.create('Write', '0.333,0,0.667,1');
  CustomEase.create('diveIn', '0.6,0,0,1');
  CustomEase.create('horScroll', '0.25,0,0.75,1');
  CustomEase.create(
    'loaderEase',
    'M0,0,C0,0,0.13,0.34,0.238,0.442,0.305,0.506,0.322,0.514,0.396,0.54,0.478,0.568,0.468,0.56,0.522,0.584,0.572,0.606,0.61,0.719,0.714,0.826,0.798,0.912,1,1,1,1',
  );
}

export { gsap, ScrollTrigger, SplitText, CustomEase };
