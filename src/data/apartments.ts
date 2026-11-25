/**
 * Apartment inventory (Webflow CMS export). Drives the /apartments listing (and later the
 * detail pages). Values are kept verbatim from the CMS, including the display strings the
 * filter/sort runtime reads (`type`, `bed`, `area`).
 */
import type { ImageMetadata } from 'astro';

import plan011 from '~/assets/images/apartments/plan-011.webp';
import plan012 from '~/assets/images/apartments/plan-012.webp';
import plan031 from '~/assets/images/apartments/plan-031.webp';
import plan032 from '~/assets/images/apartments/plan-032.webp';
import plan033 from '~/assets/images/apartments/plan-033.webp';
import plan034 from '~/assets/images/apartments/plan-034.webp';
import plan111 from '~/assets/images/apartments/plan-111.webp';
import plan112 from '~/assets/images/apartments/plan-112.webp';
import plan113 from '~/assets/images/apartments/plan-113.webp';
import plan114 from '~/assets/images/apartments/plan-114.webp';
import plan121 from '~/assets/images/apartments/plan-121.webp';
import plan122 from '~/assets/images/apartments/plan-122.webp';
import plan123 from '~/assets/images/apartments/plan-123.webp';
import plan124 from '~/assets/images/apartments/plan-124.webp';
import plan131 from '~/assets/images/apartments/plan-131.webp';
import plan132 from '~/assets/images/apartments/plan-132.webp';
import plan133 from '~/assets/images/apartments/plan-133.webp';
import plan134 from '~/assets/images/apartments/plan-134.webp';
import plan211 from '~/assets/images/apartments/plan-211.webp';
import plan212 from '~/assets/images/apartments/plan-212.webp';
import plan213 from '~/assets/images/apartments/plan-213.webp';
import plan221 from '~/assets/images/apartments/plan-221.webp';
import plan222 from '~/assets/images/apartments/plan-222.webp';
import plan223 from '~/assets/images/apartments/plan-223.webp';
import plan224 from '~/assets/images/apartments/plan-224.webp';
import benefit1 from '~/assets/images/apartments/benefit-1.jpg';
import benefit2 from '~/assets/images/apartments/benefit-2.jpg';
import benefit3 from '~/assets/images/apartments/benefit-3.webp';

export type ApartmentType = 'ground-floor-basement' | 'ground-floor' | 'penthouse-duplex';

export interface Apartment {
  /** Unit number, also the URL slug: /apartments/<number>. */
  number: string;
  /** Default ("Relevant") sort position. */
  relevant: number;
  type: ApartmentType;
  typeLabel: string;
  completion: string;
  block: string;
  floor: string;
  bedrooms: string;
  /** Interior area as displayed, e.g. "132 m²" (sorted numerically by the runtime). */
  area: string;
  /** Outdoor extra as displayed, e.g. { size: "29 M²", label: "Terrace" }. */
  extra: { size: string; label: string };
  plan: ImageMetadata;
  /** Widths of the original Webflow srcset. */
  planWidths: number[];
}

export interface Benefit {
  title: string;
  text: string;
  image: ImageMetadata;
}

export const apartments: Apartment[] = [
  {
    number: '011',
    relevant: 1,
    type: 'ground-floor-basement',
    typeLabel: 'Ground floor + basement',
    completion: '4Q 2026',
    block: 'B1',
    floor: '0',
    bedrooms: '3',
    area: '132 m²',
    extra: { size: '29 M²', label: 'Terrace' },
    plan: plan011,
    planWidths: [500, 800, 1080, 1600, 2000, 2350],
  },
  {
    number: '012',
    relevant: 2,
    type: 'ground-floor-basement',
    typeLabel: 'Ground floor + basement',
    completion: '4Q 2026',
    block: 'B1',
    floor: '0',
    bedrooms: '3',
    area: '132 m²',
    extra: { size: '29 M²', label: 'Terrace' },
    plan: plan012,
    planWidths: [500, 800, 1080, 1600, 2000, 2350],
  },
  {
    number: '031',
    relevant: 3,
    type: 'ground-floor-basement',
    typeLabel: 'Ground floor + basement',
    completion: '4Q 2026',
    block: 'B3',
    floor: '0',
    bedrooms: '3',
    area: '134 m²',
    extra: { size: '44 M²', label: 'Terrace' },
    plan: plan031,
    planWidths: [500, 800, 1080, 1600, 2000, 2350],
  },
  {
    number: '032',
    relevant: 4,
    type: 'ground-floor-basement',
    typeLabel: 'Ground floor + basement',
    completion: '4Q 2026',
    block: 'B3',
    floor: '0',
    bedrooms: '3',
    area: '134 m²',
    extra: { size: '44 M²', label: 'Terrace' },
    plan: plan032,
    planWidths: [500, 800, 1080, 1600, 2000, 2350],
  },
  {
    number: '033',
    relevant: 5,
    type: 'ground-floor-basement',
    typeLabel: 'Ground floor + basement',
    completion: '4Q 2026',
    block: 'B3',
    floor: '0',
    bedrooms: '3',
    area: '134 m²',
    extra: { size: '44 M²', label: 'Terrace' },
    plan: plan033,
    planWidths: [500, 800, 1080, 1600, 2000, 2350],
  },
  {
    number: '034',
    relevant: 6,
    type: 'ground-floor-basement',
    typeLabel: 'Ground floor + basement',
    completion: '4Q 2026',
    block: 'B3',
    floor: '0',
    bedrooms: '3',
    area: '134 m²',
    extra: { size: '45 M²', label: 'Terrace' },
    plan: plan034,
    planWidths: [500, 800, 1080, 1600, 2000, 2350],
  },
  {
    number: '111',
    relevant: 7,
    type: 'ground-floor',
    typeLabel: 'Ground Floor',
    completion: '4Q 2026',
    block: 'B1',
    floor: '1',
    bedrooms: '2',
    area: '75 m²',
    extra: { size: '29 M²', label: 'Terrace' },
    plan: plan111,
    planWidths: [500, 800, 1080, 1600, 2000, 2350],
  },
  {
    number: '112',
    relevant: 8,
    type: 'ground-floor',
    typeLabel: 'Ground Floor',
    completion: '4Q 2026',
    block: 'B1',
    floor: '1',
    bedrooms: '2',
    area: '75 m²',
    extra: { size: '29 M²', label: 'Terrace' },
    plan: plan112,
    planWidths: [500, 800, 1080, 1600, 2000, 2350],
  },
  {
    number: '113',
    relevant: 9,
    type: 'ground-floor',
    typeLabel: 'Ground Floor',
    completion: '4Q 2026',
    block: 'B1',
    floor: '1',
    bedrooms: '2',
    area: '75 m²',
    extra: { size: '29 M²', label: 'Terrace' },
    plan: plan113,
    planWidths: [500, 800, 1080, 1600, 2000, 2350],
  },
  {
    number: '114',
    relevant: 10,
    type: 'penthouse-duplex',
    typeLabel: 'Penthouse duplex',
    completion: '4Q 2026',
    block: 'B1',
    floor: '1',
    bedrooms: '3',
    area: '89 m²',
    extra: { size: '151 M²', label: 'Terrace' },
    plan: plan114,
    planWidths: [500, 800, 1080, 1600, 2000, 2350],
  },
  {
    number: '121',
    relevant: 11,
    type: 'ground-floor',
    typeLabel: 'Ground Floor',
    completion: '4Q 2026',
    block: 'B2',
    floor: '0',
    bedrooms: '2',
    area: '75 m²',
    extra: { size: '29 M²', label: 'Terrace' },
    plan: plan121,
    planWidths: [500, 800, 1080, 1600, 2000, 2350],
  },
  {
    number: '122',
    relevant: 12,
    type: 'ground-floor',
    typeLabel: 'Ground Floor',
    completion: '4Q 2026',
    block: 'B2',
    floor: '0',
    bedrooms: '2',
    area: '75 m²',
    extra: { size: '29 M²', label: 'Terrace' },
    plan: plan122,
    planWidths: [500, 800, 1080, 1600, 2000, 2350],
  },
  {
    number: '123',
    relevant: 13,
    type: 'ground-floor',
    typeLabel: 'Ground Floor',
    completion: '4Q 2026',
    block: 'B2',
    floor: '0',
    bedrooms: '2',
    area: '75 m²',
    extra: { size: '29 M²', label: 'Terrace' },
    plan: plan123,
    planWidths: [500, 800, 1080, 1600, 2000, 2350],
  },
  {
    number: '124',
    relevant: 14,
    type: 'ground-floor',
    typeLabel: 'Ground Floor',
    completion: '4Q 2026',
    block: 'B2',
    floor: '0',
    bedrooms: '2',
    area: '75 m²',
    extra: { size: '29 M²', label: 'Terrace' },
    plan: plan124,
    planWidths: [500, 800, 1080, 1600, 2000, 2350],
  },
  {
    number: '131',
    relevant: 15,
    type: 'penthouse-duplex',
    typeLabel: 'Penthouse duplex',
    completion: '4Q 2026',
    block: 'B3',
    floor: '1',
    bedrooms: '2',
    area: '60 m²',
    extra: { size: '64 M²', label: 'Terrace' },
    plan: plan131,
    planWidths: [500, 800, 1080, 1600, 2000, 2350],
  },
  {
    number: '132',
    relevant: 16,
    type: 'penthouse-duplex',
    typeLabel: 'Penthouse duplex',
    completion: '4Q 2026',
    block: 'B3',
    floor: '1',
    bedrooms: '2',
    area: '60 m²',
    extra: { size: '64 M²', label: 'Terrace' },
    plan: plan132,
    planWidths: [500, 800, 1080, 1600, 2000, 2350],
  },
  {
    number: '133',
    relevant: 17,
    type: 'penthouse-duplex',
    typeLabel: 'Penthouse duplex',
    completion: '4Q 2026',
    block: 'B3',
    floor: '1',
    bedrooms: '2',
    area: '60 m²',
    extra: { size: '64 M²', label: 'Terrace' },
    plan: plan133,
    planWidths: [500, 800, 1080, 1600, 2000, 2350],
  },
  {
    number: '134',
    relevant: 18,
    type: 'penthouse-duplex',
    typeLabel: 'Penthouse duplex',
    completion: '4Q 2026',
    block: 'B3',
    floor: '1',
    bedrooms: '2',
    area: '67 m²',
    extra: { size: '71 M²', label: 'Terrace' },
    plan: plan134,
    planWidths: [500, 800, 1080, 1600, 2000, 2350],
  },
  {
    number: '211',
    relevant: 19,
    type: 'penthouse-duplex',
    typeLabel: 'Penthouse duplex',
    completion: '4Q 2026',
    block: 'B1',
    floor: '2',
    bedrooms: '2',
    area: '60 m²',
    extra: { size: '61 M²', label: 'Terrace' },
    plan: plan211,
    planWidths: [500, 800, 1080, 1600, 2000, 2350],
  },
  {
    number: '212',
    relevant: 20,
    type: 'penthouse-duplex',
    typeLabel: 'Penthouse duplex',
    completion: '4Q 2026',
    block: 'B1',
    floor: '2',
    bedrooms: '2',
    area: '60 m²',
    extra: { size: '61 M²', label: 'Terrace' },
    plan: plan212,
    planWidths: [500, 800, 1080, 1600, 2000, 2350],
  },
  {
    number: '213',
    relevant: 21,
    type: 'penthouse-duplex',
    typeLabel: 'Penthouse duplex',
    completion: '4Q 2026',
    block: 'B1',
    floor: '2',
    bedrooms: '2',
    area: '60 m²',
    extra: { size: '62 M²', label: 'Terrace' },
    plan: plan213,
    planWidths: [500, 800, 1080, 1600, 2000, 2350],
  },
  {
    number: '221',
    relevant: 22,
    type: 'penthouse-duplex',
    typeLabel: 'Penthouse duplex',
    completion: '4Q 2026',
    block: 'B2',
    floor: '1',
    bedrooms: '2',
    area: '60 m²',
    extra: { size: '61 M²', label: 'Terrace' },
    plan: plan221,
    planWidths: [500, 800, 1080, 1600, 2000, 2350],
  },
  {
    number: '222',
    relevant: 23,
    type: 'penthouse-duplex',
    typeLabel: 'Penthouse duplex',
    completion: '4Q 2026',
    block: 'B2',
    floor: '1',
    bedrooms: '2',
    area: '60 m²',
    extra: { size: '61 M²', label: 'Terrace' },
    plan: plan222,
    planWidths: [500, 800, 1080, 1600, 2000, 2350],
  },
  {
    number: '223',
    relevant: 24,
    type: 'penthouse-duplex',
    typeLabel: 'Penthouse duplex',
    completion: '4Q 2026',
    block: 'B2',
    floor: '1',
    bedrooms: '2',
    area: '60 m²',
    extra: { size: '61 M²', label: 'Terrace' },
    plan: plan223,
    planWidths: [500, 800, 1080, 1600, 2000, 2350],
  },
  {
    number: '224',
    relevant: 25,
    type: 'penthouse-duplex',
    typeLabel: 'Penthouse duplex',
    completion: '4Q 2026',
    block: 'B2',
    floor: '1',
    bedrooms: '2',
    area: '60 m²',
    extra: { size: '62 M²', label: 'Terrace' },
    plan: plan224,
    planWidths: [500, 800, 1080, 1600, 2000, 2350],
  },
];

/** Editorial cards interleaved into the grid (see `initBenefitCards`). */
export const benefits: Benefit[] = [
  {
    title: "Boutique concept",
    text: "A boutique gated community of 25 residences on Costa del Sol, designed around privacy,wellbeing and timeless Mediterranean living.",
    image: benefit1,
  },
  {
    title: "Built to stay",
    text: "Drawing on the spirit of Marbella's golden age, the design blends modern architecture withnatural materials, lush landscaping and thoughtfully crafted spaces.",
    image: benefit2,
  },
  {
    title: "Industrial finishing",
    text: "Instead of corridors, walking paths connect the apartments — making Era Residence feel closer to a group of private homes than a standard apartment building.",
    image: benefit3,
  },
];
