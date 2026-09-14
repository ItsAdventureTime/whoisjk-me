#!/usr/bin/env bash
set -Eeuo pipefail

printf '%s\n' 'VPS deployment is retired: this project now deploys to Cloudflare Workers.' >&2
printf '%s\n' 'Use the Cloudflare Workers commands in CLOUDFLARE_WORKERS_DEPLOYMENT.md.' >&2
exit 1
