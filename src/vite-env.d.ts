/// <reference types="vite/client" />

import "react";

declare module "react" {
  interface ImgHTMLAttributes<T> {
    fetchPriority?: "high" | "low" | "auto";
  }
}

interface ImportMetaEnv {
  readonly VITE_CF_WEB_ANALYTICS_TOKEN?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
}
