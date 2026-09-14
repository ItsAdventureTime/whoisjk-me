# whoisjk.me

Personal website for Juan Karlo “JK” de Guzman. The site is intentionally
personal rather than professional: it covers his interests, faith, teaching,
technology, reading, ideas, and the questions he keeps returning to.

The project is an Astro application. The public page is prerendered, while the
contact endpoint runs in the Cloudflare Workers adapter so Turnstile and Resend
secrets stay server-side. The page combines a shared Canvas 2D field,
CSS-rendered section motifs, a small GSAP interaction layer, pointer/scroll
response, and IntersectionObserver reveals.

> **Deployment:** Cloudflare Workers is the only supported production target.
> A push to `main` in `ItsAdventureTime/whoisjk-me` triggers Cloudflare Workers
> Builds automatically. The former VPS, Podman, Caddy, Docker image, and Bunny
> material is historical and must not be used for releases.

## Current stack

- Astro `7.2.9` with the `@astrojs/cloudflare` Workers adapter.
- Node.js `>=24.18.0`.
- pnpm `11.15.1`, recorded in `package.json`.
- TypeScript `6.0.3`.
- GSAP `3.15.0`.
- Wrangler `4.127.1`.
- Cloudflare Turnstile and Resend.
- No database, remote font, or public email address.

## Repository map

- `src/pages/index.astro` — page structure, copy, metadata, Canvas 2D script,
  and section state.
- `app/globals.css` — design tokens, responsive layout, motifs, surfaces,
  motion, and browser fallbacks.
- `astro.config.mjs` — Workers adapter configuration and canonical site URL.
- `src/pages/api/contact.ts` — same-origin JSON contact endpoint, Turnstile
  verification, validation, throttling, and Resend delivery.
- `wrangler.jsonc` — Worker name, entrypoint, compatibility, rate limiter, and
  observability configuration.
- `tests/rendered-html.test.mjs` — build-output and design-invariant checks.
- `CLOUDFLARE_WORKERS_DEPLOYMENT.md` — Workers Builds setup and rollback runbook.
- `RELEASE_WORKFLOW.md` — local gate, commit, push, and automatic deployment
  workflow.
- `scripts/sandbox-node.sh` — pinned Node 24.18.0 runtime wrapper for local
  project checks inside Docker Sandbox.

## Local development

Use the versions recorded in `package.json` and the lockfile. Run project
commands through the Docker Sandbox:

```bash
jk-sbx-project ensure
jk-sbx-project exec ./scripts/sandbox-node.sh node --version
jk-sbx-project exec ./scripts/sandbox-node.sh --with-pnpm pnpm --version
jk-sbx-project exec ./scripts/sandbox-node.sh --with-pnpm pnpm install --frozen-lockfile
jk-sbx-project exec ./scripts/sandbox-node.sh --with-pnpm pnpm dev
```

## Validation

Run the source checks and rendered-output test before committing:

```bash
jk-sbx-project exec ./scripts/sandbox-node.sh --with-pnpm pnpm run check
jk-sbx-project exec ./scripts/sandbox-node.sh --with-pnpm pnpm test
```

`pnpm run check` validates generated Worker types and Astro diagnostics.
`pnpm test` runs `astro build` and checks `dist/client/index.html`, important
copy, section motifs, the same-origin contact module, accessibility markers,
sensitive-content exclusions, email-address exclusions, and security headers.

For UI or interaction changes, also check desktop and narrow mobile widths,
keyboard focus, active navigation, reduced motion, page overflow, and contact
form pending/success/error feedback in a real browser.

## Contact form secrets and Turnstile

The browser receives only the public Turnstile Site Key. The endpoint validates
single-use tokens at Cloudflare before calling Resend, enforces field limits,
rejects the honeypot and fast submissions, checks same-origin requests, and
throttles forwarded client addresses. Message content and credentials are not
logged.

Provision these encrypted production secrets in Cloudflare Dashboard → Workers
& Pages → `whoisjk-me` → **Settings** → **Variables and Secrets**:

- `TURNSTILE_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM`
- `RESEND_TO`

Never commit their values or put them in `wrangler.jsonc`. The public Site Key
belongs in `src/pages/index.astro`; the secret key belongs only in Worker
secrets. See [`CLOUDFLARE_WORKERS_DEPLOYMENT.md`](CLOUDFLARE_WORKERS_DEPLOYMENT.md)
for the complete setup.

## Standards baseline

The UI follows WCAG 2.2 as its accessibility reference and preserves zoom,
reflow, source-order reading, visible focus, touch-safe targets, and reduced
motion. The page does not need Astro View Transitions or a client-side routing
layer. GSAP pointer motion and entrance transitions are scoped with
`gsap.matchMedia()`; `ScrollTrigger` is limited to the non-essential progress
indicator.

See [`DESIGN.md`](DESIGN.md) for the visual, content, responsive, motion, and
accessibility guide and [`SECURITY.md`](SECURITY.md) for the privacy and
release-scan policy.

## Public personal context

The public copy reflects the latest personal-context review dated 2026-08-08.
It adds JK’s early Windows 95-era curiosity, online English teaching since 2019,
interdisciplinary interests, reading habits, social need for quiet, and the
ongoing balance between open systems and practical convenience.

The site intentionally leaves out sensitive health and family-care details,
exact city, birth year, age, unverified degree completion, credentials that are
not needed for the personal introduction, and volatile device configuration.
The source context file remains outside this public repository.

## GitHub release gate

After every source, style, content, dependency, configuration, or documentation
change, follow [`RELEASE_WORKFLOW.md`](RELEASE_WORKFLOW.md): run `pnpm run check`
and `pnpm test` in Docker Sandbox, review the diff, commit, and push to the
HTTPS `origin` on `main`. Cloudflare Workers Builds then builds and deploys the
connected Worker automatically.

The normal production domain is `https://whoisjk.me/`. The custom domain and
Worker secrets are managed in the Cloudflare Dashboard, never in Git.

## Content and design rules

- Use American English (`en-US`) and a natural, conversational voice.
- Keep sentences short, clear, and easy to scan.
- Keep the site personal; do not turn it into a résumé or generic portfolio.
- Do not publish JK’s age, year of birth, or personal email address.
- Use “Philippines,” not a more precise city.
- Preserve reduced-motion support, visible keyboard focus, and no-script access
  to the content.
- Keep the dark charcoal surfaces semi-transparent enough for the field to
  remain visible, but opaque enough for reading.
- No blur, backdrop blur, glow, or decorative shadow.

## Official references

- [Cloudflare Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/)
- [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Workers GitHub integration](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/)
- [Workers Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Astro deployment guide](https://docs.astro.build/en/guides/deploy/)
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [GitHub push protection](https://docs.github.com/en/code-security/concepts/secret-security/push-protection)
