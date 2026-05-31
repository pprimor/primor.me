/// <reference types="@cloudflare/vitest-pool-workers" />

declare module "cloudflare:workers" {
  interface ProvidedEnv {
    RESEND_API_KEY: string;
    TURNSTILE_SECRET_KEY: string;
    CONTACT_RATE_LIMIT: KVNamespace;
    CONTACT_TO_EMAIL?: string;
    RESEND_FROM_EMAIL?: string;
  }
}
