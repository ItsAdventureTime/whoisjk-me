import { defineMiddleware } from "astro:middleware";

const securityHeaders = {
  "Content-Security-Policy": "default-src 'none'; script-src 'self' https://challenges.cloudflare.com; script-src-attr 'none'; style-src 'self'; style-src-attr 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://challenges.cloudflare.com; media-src 'none'; object-src 'none'; frame-src https://challenges.cloudflare.com; frame-ancestors 'none'; worker-src 'none'; manifest-src 'none'; base-uri 'none'; form-action 'self'; upgrade-insecure-requests",
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

export const onRequest = defineMiddleware(async ({ url }, next) => {
  const response = await next();
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(securityHeaders)) headers.set(name, value);
  if (url.pathname.startsWith("/api/")) {
    headers.set("Cache-Control", "private, no-store");
    headers.set("CDN-Cache-Control", "no-store");
    headers.set("Pragma", "no-cache");
  }
  return new Response(response.body, { headers, status: response.status, statusText: response.statusText });
});
