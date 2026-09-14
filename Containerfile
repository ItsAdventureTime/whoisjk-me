# Retired: the application now targets Cloudflare Workers and has no Node
# runtime image. Keep this sentinel so an old VPS workflow fails safely rather
# than publishing a misleading or broken container.
FROM docker.io/library/alpine:latest
RUN echo 'Containerfile retired: deploy this project with Wrangler to Cloudflare Workers.' >&2 && exit 1
