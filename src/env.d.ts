/// <reference types="astro/client" />

declare module "cloudflare:workers" {
  export const env: Env;
}

type ContactRateLimiter = {
  limit: (options: { key: string }) => Promise<{ success: boolean }>;
};

// `wrangler types --include-runtime=false` still names binding types; keep the
// local structural declaration small because this project only calls `limit`.
type RateLimit = ContactRateLimiter;

type ContactEnvironment = Omit<Env, "CONTACT_RATE_LIMITER"> & {
  CONTACT_RATE_LIMITER: ContactRateLimiter;
  RESEND_API_KEY: string;
  RESEND_FROM: string;
  RESEND_TO: string;
  TURNSTILE_SECRET: string;
};

interface Turnstile {
  reset: () => void;
}

interface Window {
  turnstile?: Turnstile;
}
