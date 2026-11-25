# ERA Residence — site rebuild

A 1:1 rebuild of https://www.era-residence.com (originally Webflow + a custom GSAP runtime), as
a static **Astro** site with a typed **TypeScript** animation layer.

| Page          | Source                       |
| ------------- | ---------------------------- |
| `/`           | `src/pages/index.astro`      |
| `/apartments` | `src/pages/apartments/index.astro`: 25 units from `src/data/apartments.ts` |

| Layer          | Choice                                                                 |
| -------------- | ---------------------------------------------------------------------- |
| Framework      | Astro 7 (static output, zero framework JS shipped)                      |
| Motion         | GSAP 3.15 — ScrollTrigger, SplitText, CustomEase                       |
| Smooth scroll  | Lenis 1.3.21                                                           |
| Page transitions | Barba 2.10                                                           |
| Lottie         | lottie-web 5.12.2 (footer credit, lazy-loaded)                         |
| Images         | `astro:assets` — responsive `srcset` generated at build time           |

Library versions are pinned to exactly what the original site loaded.

## Commands

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # -> dist/
npm run preview
npm run check      # astro check (types + templates)
```

## Structure

```
src/
  layouts/Layout.astro        <head>, Barba wrapper/container, CSS order, runtime entry
  pages/
    index.astro               the homepage, composed from sections
    apartments/index.astro    the apartments listing
  data/apartments.ts          apartment inventory + benefit cards (former Webflow CMS)
  lib/nav.ts                  current-page link marking (aria-current + .w--current)
  components/
    Header.astro              variant "home" (scrollbar, scroll hint) | "inner" (breadcrumbs)
    header/                   HeaderLogo, HeaderNav, ScrollIndicators, Breadcrumbs
    Preloader, Cookies, LandscapeCover, BookCallModal, MenuModal, FloatingTips
    WfImage.astro             optimised <img> that renders like Webflow (see below)
    apartments/               ApartmentsListing (filters, sort, grid), ApartmentCard
    sections/                 Hero, BenefitsIntro, Benefits, Quote, LocationJourney, LocationMap,
                              ApartmentTypes, ApartmentInfo, Amenities, Interior, Architecture,
                              Features, Cta (image prop), Footer (toTop prop)
  styles/
    fonts.css                 Adobe Fonts faces (self-hosted primer subsets)
    webflow.css               Webflow's generated stylesheet (classes, tokens, breakpoints)
    head.css / embed.css      the custom CSS Webflow embedded in <head> and <body>
  scripts/
    main.ts                   boot order + per-page init list
    preloader.ts              intro / short preloader (arch mask)
    transitions.ts            Barba hooks
    core/                     config + eases, Lenis/scroll lock, shared reveal animations
    features/                 flows (section choreography), parallax, scroll reveals, hovers,
                              modals, sliders/tabs, forms, chrome (logo, scrollbar, cookies)…
public/                       fonts, SVGs, video posters, flower videos, Lottie JSON, favicons
```

### How the markup works

The markup is Webflow's, unchanged: class names, `data-*` attributes and inline per-item styles.
Behaviour is attached through attributes, so editing content is safe as long as those stay:

- `data-scroll-reveal="a|h|p|ctn|line|slide"`: reveal on scroll (see `core/reveal.ts`)
- `data-part="…"`: same animations, driven by the preloader and modals
- `data-parallax="w|img|img-in|img-out|ctn-up|ctn-down"`: parallax (`features/parallax.ts`)
- `data-bg="light|dark|color"` on sections plus `data-theme` on the fixed UI: theme switching
- `hover`, `hover-link`, `hover-nav-item`, `hover-btn-circle`, `data-magnetic-btn`: hovers
- `data-slider`, `data-tabs`, `data-tabs-hero`, `data-modal-*`, `floating-tip*`: components

**Whitespace matters** inside elements with the `.inline` utility class (the form's legal line).
Keep those on one line. Card labels use non-breaking spaces (`3 bed`, `0 floor`) on purpose.

### Editing apartments

Add, remove or update units in `src/data/apartments.ts`; the listing, the count, the filters and
the sorting all follow from it. The runtime filters on the rendered `data-type` / `data-bed` values
and sorts on `data-sort-area` (parsed as a number) and `data-sort-relevant`. Filter state is
mirrored to the URL (`/apartments?type=penthouse-duplex&bed=3`), so those links can be shared.
The type and bedroom dropdown options live in `ApartmentsListing.astro`; add an option there
when you introduce a new type.

**Use `WfImage`, not `<Image>`.** Some Webflow classes size images on one axis only (e.g. the
clouds set `height` only). Astro's `<Image>` adds `width`/`height` attributes, and those would
override the aspect-ratio-derived width.

## Differences from the live site

- **Analytics are not included** (Google Tag Manager, GA4 and the Meta pixel IDs belong to the
  client). Add your own in `Layout.astro`.
- **Form backend**: Webflow's form service is replaced by `features/forms.ts`, which keeps the
  same success and error UI and POSTs JSON to `PUBLIC_FORM_ENDPOINT` (see `.env.example`).
- **Not built yet: the apartment detail pages (`/apartments/011` and 24 others) and `/contact`.**
  The cards link to them, and Barba prefetches them on hover, so you will see 404s in the
  console until they exist. The runtime they need (lightbox, image zoom) is already ported,
  and `src/data/apartments.ts` is ready to drive an `apartments/[number].astro` route. The
  Swiper carousel was left out because no page here uses it.
- **og:image**: the original `open-graph.webp` / `.mp4` were not in the mirror;
  `public/images/og-image.webp` is the hero image as a stand-in.
- jQuery and webflow.js are not shipped. The only webflow.js behaviours the page used
  (`href="#"` clicks cancelled, smooth `#anchor` scrolling with Webflow's timing) are in
  `features/webflow.ts`.
- The runtime waits for web fonts (max 2.5s) before starting, so SplitText measures lines with
  the final fonts. The original raced this.

## Licensing — read before deploying

The fonts (Ambroise François and Sloop Script via Adobe Fonts, and Maison Neue Extended), the
photography, renders, videos, copy and the ERA Residence brand are third-party property. This
repo self-hosts them so the rebuild can be checked locally. Deploying publicly requires the
rights holders' permission and your own font licences or Adobe Fonts kit.

## Verification

The build was compared against the live site in headless Chromium, at 1440×900 and at
390×844 (touch). Both sites gave the same document height and the same scroll positions at
every step, and the same SplitText output (882 characters, 82 lines). Static frames differ by
0.05–0.2%. The only larger differences come from always-running animations (cloud marquee,
looping flower videos, rotating logo) being at different points in time.

`/apartments` was checked the same way: same document height (8,572px), every frame within
0.65%. Behaviour matched the live site in every scenario: counts, visible units, sort order,
benefit-card interleaving, dropdown labels, URL query state, `?type=` deep links, mobile, and
the Barba transition from the homepage.
