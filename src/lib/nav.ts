/** Webflow marks links to the current page with `aria-current="page"` and `.w--current`. */
const normalize = (path: string) => path.replace(/\/+$/, '') || '/';

export function isCurrent(href: string, pathname: string) {
  if (!href.startsWith('/')) return false;
  return normalize(href.split(/[?#]/)[0] ?? href) === normalize(pathname);
}

/** Spread onto an <a>: `<a {...currentAttrs('/x', Astro.url.pathname)} class:list={[…, currentClass(…)]}>` */
export function currentAttrs(href: string, pathname: string) {
  return isCurrent(href, pathname) ? { 'aria-current': 'page' as const } : {};
}

export function currentClass(href: string, pathname: string) {
  return isCurrent(href, pathname) ? 'w--current' : undefined;
}
