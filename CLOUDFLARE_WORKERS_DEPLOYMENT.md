# Cloudflare Workers deployment

Production deploys use Cloudflare Workers Builds, the native GitHub
integration for this Astro SSR Worker. A push to `main` in
`ItsAdventureTime/whoisjk-me` runs the managed build and deploy process; no
local Wrangler login, Docker image build, or VPS deployment is required.

## Repository configuration

The checked-in configuration is the source of truth for the Workers build:

- Worker name: `whoisjk-me`
- Wrangler entrypoint: `@astrojs/cloudflare/entrypoints/server`
- Build command: `pnpm run build` (`astro build`)
- Node engine: `>=24.18.0`
- Package manager: `pnpm@11.15.1`
- Production branch: `main`
- Contact bindings: `CONTACT_RATE_LIMITER`, `EMAIL` (Cloudflare Email Service)

When Workers Builds runs, it uses the Wrangler version declared in
`package.json` and the Worker name in `wrangler.jsonc`. Keep those names
identical or the build will fail.

## One-time Cloudflare setup

1. Open Cloudflare Dashboard → **Workers & Pages** → **Create an app** →
   **Continue with GitHub**. Cloudflare may label this flow **Create
   application** → **Get started** next to **Import a repository**.
2. Authorize the Cloudflare Workers and Pages GitHub app for the account or
   organization that owns `ItsAdventureTime/whoisjk-me`.
3. Select `ItsAdventureTime/whoisjk-me`, then configure the project with:

   | Setting | Value |
   | --- | --- |
   | Production branch | `main` |
   | Root directory | `/` |
   | Build command | `pnpm run build` |
   | Deploy command | `npx wrangler deploy` (default) |

   Workers Builds uses the Wrangler version from `package.json`; do not add a
   second CI workflow or commit Cloudflare API credentials.
4. Save and deploy once. Confirm the Worker is named `whoisjk-me` and that the
   first build completes successfully.

For an existing Worker, use Workers & Pages → `whoisjk-me` → **Settings** →
**Builds** → **Connect**, then select the same repository and settings.

## Contact delivery and dashboard configuration

In Workers & Pages → `whoisjk-me` → **Settings** → **Variables and Secrets**,
add these plaintext environment variables:

- `TURNSTILE_SITE_KEY`
- `CONTACT_FROM` (for example, `contact@notify.whoisjk.me`)

Add these encrypted production secrets:

- `TURNSTILE_SECRET` (or the fallback alias `TURNSTILE_SECRET_KEY`)
- `CONTACT_TO`

Verify that the Turnstile secret is saved and deployed to the active Worker under
**Variables and Secrets**, not **Builds**. The endpoint checks `TURNSTILE_SECRET`
in the Worker binding and then `process.env` before trying `TURNSTILE_SECRET_KEY`
in the same order. Empty or whitespace-only values are treated as missing.

Also add `TURNSTILE_SITE_KEY` under **Settings** → **Builds** → **Build variables
and secrets**. The homepage is prerendered, so it reads this public key during
`astro build`; setting only the runtime variable does not populate the generated
HTML. Rebuild after changing the site key. Keep `TURNSTILE_SECRET` (or its alias) and
`CONTACT_TO` in runtime secrets only. Cloudflare documents the separate scopes in
[Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

Enter values in the Cloudflare Dashboard only. Never commit them, place them
in `wrangler.jsonc`, or expose them in build logs. Delete obsolete `RESEND_*`
variables or secrets. The `EMAIL` binding in `wrangler.jsonc` sends mail through
Cloudflare Email Service; confirm `notify.whoisjk.me` is active under **Compute**
→ **Email Service** → **Email Sending** before testing delivery.

## Custom domain

After the Worker exists, attach the production domain in Workers & Pages →
`whoisjk-me` → **Settings** → **Domains & Routes** → **Add** → **Custom
Domain**. Enter `whoisjk.me` and confirm the DNS record and certificate are
created by Cloudflare. Remove any obsolete Pages custom-domain attachment
before adding the Worker custom domain if Cloudflare reports a conflict.

## Normal release

Run the deterministic local gate before publishing a release:

```bash
jk-sbx-project exec ./scripts/sandbox-node.sh --with-pnpm pnpm run check
jk-sbx-project exec ./scripts/sandbox-node.sh --with-pnpm pnpm test
```

Then review and publish the commit:

```bash
git diff --check
git remote -v
git add <reviewed-files>
git commit -S -m "Describe the change"
git verify-commit HEAD
git push origin main
```

The push triggers Workers Builds. Follow the build in the Cloudflare Dashboard
or the GitHub check run, then verify `https://whoisjk.me/` and the contact-form
success/error behavior after a successful production deployment.

Do not run `wrangler deploy` locally as part of the normal release path. The
`cf:deploy` script remains available for intentional manual diagnostics, but
Workers Builds is the supported production deployment mechanism.

## Troubleshooting and rollback

- If a build fails, open the Worker’s **Settings** → **Builds** logs and the
  GitHub check run; confirm the root directory is `/`, the build command is
  `pnpm run build`, and the Worker name is `whoisjk-me`.
- If a secret is missing, add or rotate it under **Variables and Secrets** and
  retry the build. Do not put the value in GitHub or the repository.
- If a deployment is unhealthy, stop publishing new commits and roll back to
  the last known-good Worker deployment from the Cloudflare Dashboard. Verify
  the homepage and `/api/contact` after the rollback.

## Official references

- [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/)
- [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Workers GitHub integration](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/)
- [Workers Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
