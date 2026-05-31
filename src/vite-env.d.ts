/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CF_WEB_ANALYTICS_TOKEN?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
}
