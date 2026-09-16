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

interface SendEmail {
  send: (message: { from: string; to: string; replyTo?: string; subject: string; text: string }) => Promise<{ messageId: string }>;
}

type ContactEnvironment = Omit<Env, "CONTACT_RATE_LIMITER" | "EMAIL"> & {
  CONTACT_RATE_LIMITER: ContactRateLimiter;
  EMAIL: SendEmail;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET: string;
  TURNSTILE_SECRET_KEY?: string;
  CONTACT_FROM: string;
  CONTACT_TO: string;
};

interface Turnstile {
  reset: () => void;
}

interface Window {
  turnstile?: Turnstile;
}
