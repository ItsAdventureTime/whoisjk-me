# Normal update and release workflow

**Reviewed:** 2026-09-14
**Production target:** Cloudflare Workers via Workers Builds
**Repository:** `ItsAdventureTime/whoisjk-me`
**Production branch:** `main`

Workers Builds is the supported release path. After the one-time Cloudflare
Dashboard GitHub connection, a push to `main` runs `pnpm run build` and deploys
the Worker automatically. Local Docker Sandbox checks provide confidence before
the push; they do not deploy production.

## 1. Make and review the change

1. Inspect the current Git status and diff before editing.
2. Make the smallest coherent source, configuration, test, or documentation
   change.
3. Preserve the existing Cloudflare adapter, rate limiter, validation,
   security headers, and accessibility behavior unless the change explicitly
   targets them.
4. Keep secrets, `.env*` files, generated output, dependencies, and agent
   metadata out of Git.

## 2. Run the local release gate

Run project commands through the Docker Sandbox and the pinned Node runtime:

```bash
jk-sbx-project ensure
jk-sbx-project exec ./scripts/sandbox-node.sh --with-pnpm pnpm run check
jk-sbx-project exec ./scripts/sandbox-node.sh --with-pnpm pnpm test
git diff --check
```

`pnpm run check` validates the generated Worker types and Astro project.
`pnpm test` builds the site and checks the rendered output and security/design
invariants. Do not use a local macOS or Podman runtime as a substitute for this
gate.

## 3. Confirm the GitHub remote

The remote must remain HTTPS and point to the production repository:

```bash
git remote -v
```

Expected URL:

```text
https://github.com/ItsAdventureTime/whoisjk-me.git
```

Use GitHub CLI for authenticated GitHub operations when required by the local
repository policy:

```bash
gh auth status --hostname github.com
gh auth setup-git --hostname github.com
```

Never print or commit credentials, and never switch the repository remote to an
SSH URL for this workflow.

## 4. Commit and push

Stage only reviewed files, verify the staged diff, and use the approved signing
policy:

```bash
git add <reviewed-files>
git diff --cached --check
git commit -S -m "Describe the change"
git verify-commit HEAD
git push origin main
```

If the approved signer is unavailable, stop rather than creating an unsigned
release or bypassing the repository policy.

## 5. Let Workers Builds deploy

The push to `main` triggers the connected Cloudflare Worker. Workers Builds
uses these project settings:

| Setting | Value |
| --- | --- |
| Repository | `ItsAdventureTime/whoisjk-me` |
| Root directory | `/` |
| Build command | `pnpm run build` |
| Deploy command | `npx wrangler deploy` |

Monitor the result in Cloudflare Dashboard → Workers & Pages → `whoisjk-me` →
**Builds**, or in the GitHub check run for the commit. Do not run a local
`wrangler deploy` as part of the normal release.

## 6. Verify production configuration

The one-time Dashboard setup must include these encrypted Worker secrets:

- `TURNSTILE_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM`
- `RESEND_TO`

The custom domain is configured at Workers & Pages → `whoisjk-me` →
**Settings** → **Domains & Routes** → **Add** → **Custom Domain** with
`whoisjk.me`.

After a successful build, the HUMAN should verify the live homepage, responsive
layout, navigation and focus behavior, reduced-motion behavior, and contact-form
success/error handling at `https://whoisjk.me/`.

For the complete one-time setup and rollback runbook, see
[`CLOUDFLARE_WORKERS_DEPLOYMENT.md`](CLOUDFLARE_WORKERS_DEPLOYMENT.md).

## Official references

- [Cloudflare Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/)
- [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Workers GitHub integration](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/)
- [Workers Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [GitHub commit signing](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits)
