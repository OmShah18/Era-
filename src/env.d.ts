/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Endpoint the "Book a call" form POSTs JSON to. See README. */
  readonly PUBLIC_FORM_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// The Webflow markup uses a bare `hover="text|bg|ico|…"` attribute as an animation hook.
declare namespace astroHTML.JSX {
  interface HTMLAttributes {
    hover?: string;
  }
}

// @barba/core@2.10 points "types" at a folder that is not published; re-export the real typings.
declare module '@barba/core' {
  export { default } from '@barba/core/dist/core/src/src/index';
}
