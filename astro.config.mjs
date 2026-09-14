import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "server",
  adapter: cloudflare({
    prerenderEnvironment: "node",
    imageService: "compile",
  }),
  session: false,
  security: {
    checkOrigin: true,
  },
  site: "https://whoisjk.me",
});
