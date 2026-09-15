import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { stripTypeScriptTypes } from "node:module";

test("contact delivery handles configuration, optional reply addresses, and diagnostics", async () => {
  const source = await readFile(new URL("../src/pages/api/contact.ts", import.meta.url), "utf8");
  const outputText = stripTypeScriptTypes(source)
    .replace(/^import .*;$/gm, "")
    .replace(/export const /g, "const ");
  const sent = [];
  const logs = [];
  const env = {
    CONTACT_RATE_LIMITER: { limit: async () => ({ success: true }) },
    EMAIL: { send: async (payload) => sent.push(payload) },
  };
  const exports = {};
  const processEnv = { TURNSTILE_SECRET: "test-secret", CONTACT_FROM: "sender@notify.whoisjk.me", CONTACT_TO: "inbox@example.com" };
  runInNewContext(`${outputText}\nexports.POST = POST;`, {
    exports, env, countryCodes: ["PH"], Response, TextDecoder, AbortSignal, crypto,
    process: { env: processEnv },
    console: { error: (...args) => logs.push(args), info: () => {} },
    fetch: async (_url, options) => {
      assert.equal(JSON.parse(options.body).secret, env.TURNSTILE_SECRET || processEnv.TURNSTILE_SECRET);
      return Response.json({ success: true });
    },
  });
  const submit = (email = "") => exports.POST({ request: new Request("https://whoisjk.me/api/contact", {
    method: "POST", headers: { origin: "https://whoisjk.me", "content-type": "application/json" },
    body: JSON.stringify({ name: "Visitor", country: "PH", message: "Hello", email, "cf-turnstile-response": "test-token" }),
  }) });
  assert.equal((await submit()).status, 200);
  assert.equal(Object.hasOwn(sent[0], "replyTo"), false);
  assert.equal(sent[0].from, processEnv.CONTACT_FROM);
  env.TURNSTILE_SECRET = "binding-secret";
  env.CONTACT_FROM = "binding@NOTIFY.WHOISJK.ME";
  assert.equal((await submit("reply@example.com")).status, 200);
  assert.equal(sent[1].replyTo, "reply@example.com");
  assert.equal(sent[1].from, env.CONTACT_FROM);
  for (const from of ["sender@example.com", "sender@sub.notify.whoisjk.me", "sender@notify.whoisjk.me.example.com"]) {
    env.CONTACT_FROM = from;
    const response = await submit();
    assert.equal(response.status, 503);
    assert.equal(sent.length, 2);
    assert.equal(logs.at(-1)[0], "[contact] invalid sender domain: CONTACT_FROM must end with @notify.whoisjk.me");
    assert.ok(logs.at(-1)[1].requestId);
    assert.doesNotMatch(await response.text(), /CONTACT_FROM|notify\.whoisjk\.me/);
  }
  env.CONTACT_FROM = "binding@notify.whoisjk.me";
  for (const binding of [undefined, {}]) {
    env.EMAIL = binding;
    assert.equal((await submit()).status, 503);
    assert.equal(logs.at(-1)[0], "[contact] missing or unconfigured EMAIL binding");
    assert.ok(logs.at(-1)[1].requestId);
  }
  env.EMAIL = { send: async () => { throw "delivery rejected"; } };
  assert.equal((await submit()).status, 502);
  assert.equal(logs.at(-1)[1].message, "delivery rejected");
  assert.equal(logs.at(-1)[1].details, "delivery rejected");
  delete processEnv.CONTACT_TO;
  const response = await submit();
  assert.equal(response.status, 503);
  const diagnostic = logs.at(-1)[1];
  assert.equal(diagnostic.message, "Missing runtime secret: CONTACT_TO");
  assert.match(diagnostic.stack, /Missing runtime secret/);
  assert.equal(diagnostic.details.message, diagnostic.message);
  assert.ok(diagnostic.requestId);
  assert.doesNotMatch(await response.text(), /CONTACT_TO|test-secret/);
});

test("Turnstile ready clears pending status and preserves submission outcomes", async () => {
  const source = await readFile(new URL("../src/pages/index.astro", import.meta.url), "utf8");
  const listener = source.match(/document\.addEventListener\("iamjk:turnstile-ready", \(\) => \{[\s\S]*?\n\s*\}\);/);
  assert.ok(listener);
  for (const [status, message] of [
    ["is-pending", "Loading secure check…"],
    ["is-pending", "Secure check is still loading. Please wait a moment."],
    ["is-pending", "Complete the secure check before sending."],
    ["is-success", "Thanks. Your message is on its way."],
    ["is-error", "I couldn’t send your message. Reference 263c5a7c."],
    ["is-error", "We could not verify your submission. Please try again."],
  ]) {
    const contactStatus = { textContent: message, className: `contact-status ${status}` };
    contactStatus.classList = { contains: (name) => contactStatus.className.split(/\s+/).includes(name) };
    let state = "loading";
    const document = new EventTarget();
    runInNewContext(listener[0], {
      document, contactStatus,
      setTurnstileState: (value) => { state = value; },
      announceContactStatus: (className, text) => {
        contactStatus.className = `contact-status ${className}`;
        contactStatus.textContent = text;
      },
    });
    document.dispatchEvent(new Event("iamjk:turnstile-ready"));
    assert.equal(state, "ready");
    assert.equal(contactStatus.textContent, status === "is-pending" ? "" : message);
    assert.equal(contactStatus.className.trim(), status === "is-pending" ? "contact-status" : `contact-status ${status}`);
  }
});

test("builds the personal site as a complete static document", async () => {
  const html = await readFile(new URL("../dist/client/index.html", import.meta.url), "utf8");
  assert.match(html, /<title>JK de Guzman \| A personal field guide<\/title>/i);
  assert.match(html, /A person is a <em>collection<\/em> of connections\./i);
  assert.match(html, /Language/i);
  assert.match(html, /Systems/i);
  assert.match(html, /CliftonStrengths/i);
  assert.match(html, /November 21 · Scorpio/i);
  assert.match(html, /world-canvas/i);
  assert.match(html, /signal-visual/i);
  assert.match(html, /readable-zone/i);
  assert.match(html, /<script type="module" src="\/_astro\/[^\"]+\.js"><\/script>/i);
  assert.doesNotMatch(html, / style=/i);
  assert.match(html, /Nothing Phone \(3\)/i);
  assert.match(html, /CMF Buds Pro 2/i);
  assert.match(html, /Fedora Kinoite/i);
  assert.match(html, /Windows 95/i);
  assert.match(html, /taught English online since 2019/i);
  assert.match(html, /Podman/i);
  assert.match(html, /contact-form/i);
  assert.match(html, /data-action="turnstile-spin-v2"/i);
  assert.match(html, /challenges\.cloudflare\.com\/turnstile\/v0\/api\.js/i);
  assert.match(html, /Country or territory/i);
  assert.match(html, /Want a reply\? Leave an email or mobile number/i);
  assert.match(html, /stack-trace-step/i);
  assert.match(html, /Philippines/i);
  assert.doesNotMatch(html, /Marikina|1988|depression|stroke survivor|Losartan|amlodipine/i);
  const emailPattern = /\b[\w.%+-]+@[\w.-]+\.[A-Z]{2,}\b/i;
  assert.doesNotMatch(html, emailPattern);
  assert.doesNotMatch(html, /mailto:/i);
  assert.match(html, /Skip to content/i);
  assert.match(html, /<html lang="en-US">/i);
  assert.match(html, /aria-label="Primary navigation"/i);
  assert.match(html, /href="#strengths"/i);
  assert.match(html, /href="#details"/i);
  assert.match(html, /001 \/ 008/i);
  assert.match(html, /data-callback="iamjkTurnstileReady"/i);
  assert.match(html, /data-expired-callback="iamjkTurnstileExpired"/i);
  assert.match(html, /data-error-callback="iamjkTurnstileError"/i);
  assert.doesNotMatch(html, /No funnel|No pitch deck|Build a life with enough substance|No single <span>lane/i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|SkeletonPreview/i);

  const source = await readFile(new URL("../src/pages/index.astro", import.meta.url), "utf8");
  assert.match(source, /requestAnimationFrame/i);
  assert.match(source, /import \{ gsap \} from "gsap"/i);
  assert.match(source, /import \{ ScrollTrigger \} from "gsap\/ScrollTrigger"/i);
  assert.match(source, /gsap\.matchMedia\(\)/i);
  assert.match(source, /gsap\.registerPlugin\(ScrollTrigger\)/i);
  assert.match(source, /iamjkTurnstileExpired/i);
  assert.match(source, /__iamjkTurnstileState/i);
  assert.match(source, /prefers-reduced-motion/i);
  assert.match(source, /DETAIL/);
  assert.match(source, /const focusY = height \* 0\.46/);
  assert.match(source, /bounds\.top <= focusY && bounds\.bottom >= focusY/);
  assert.match(source, /const nearestIndex = focusIndex >= 0 \? focusIndex : visibleIndex/);
  assert.match(source, /let sectionStateDirty = true/);
  assert.match(source, /if \(sections\.length === 0 \|\| !sectionStateDirty\) return/);
  assert.match(source, /sectionStateDirty = true/);
  assert.match(source, /const maxPixelRatio = width < 700 \? 1\.5 : 2/);
  assert.match(source, /let pageVisible = !document\.hidden/);
  assert.match(source, /if \(!pageVisible \|\| animationFrameId !== 0 \|\| motionQuery\.matches\) return/);
  assert.match(source, /if \(motionQuery\.matches\) return/);
  assert.match(source, /motionQuery\.addEventListener\("change"/);
  assert.match(source, /document\.addEventListener\("visibilitychange"/);
  assert.match(source, /data-world-readout="ABOUT"/);
  assert.match(source, /data-world-detail="A LITTLE CONTEXT"/);
  assert.match(source, /const readoutNumber = section\?\.dataset\.worldIndex/);
  assert.match(source, /const readoutTitle = section\?\.dataset\.worldReadout/);
  assert.match(source, /turnstileSiteKey/);
  assert.match(source, /TURNSTILE_SITE_KEY/);
  assert.doesNotMatch(source, /0x4AAAAAAEzVojpAMktzsIsI/);
  assert.match(html, /whoisjk\.me \/ a personal field guide/i);
  assert.match(source, /\/api\/contact/);
  assert.match(source, /Content-Type.*application.json/);
  assert.doesNotMatch(source, /TURNSTILE_SECRET_VALUE/);

  const endpoint = await readFile(new URL("../src/pages/api/contact.ts", import.meta.url), "utf8");
  assert.match(endpoint, /siteverify/);
  assert.match(endpoint, /result\.success === true/);
  assert.match(endpoint, /EMAIL\.send/);
  assert.match(endpoint, /!runtimeEnv\.EMAIL \|\| typeof runtimeEnv\.EMAIL\.send !== "function"/);
  assert.doesNotMatch(endpoint, /replyTo:\s*undefined|const replyTo = email \|\| undefined/);
  assert.equal((endpoint.match(/details: error/g) || []).length, 2);
  assert.equal((endpoint.match(/stack: error instanceof Error \? error.stack/g) || []).length, 2);
  assert.match(endpoint, /requestId/);
  assert.match(endpoint, /CONTACT_RATE_LIMITER\.limit/);
  assert.match(endpoint, /cf-connecting-ip/);
  assert.match(endpoint, /origin !==/);
  assert.match(endpoint, /https:\/\/whoisjk\.me/);
  assert.match(endpoint, /result\.hostname === "whoisjk\.me"/);
  assert.match(endpoint, /subject: .*whoisjk\.me/);
  assert.match(endpoint, /application/);
  assert.doesNotMatch(endpoint, /api\.resend\.com|RESEND_/);
  assert.doesNotMatch(endpoint, /website@iamjk\.site|hello@iamjk\.site/);

  const middleware = await readFile(new URL("../src/middleware.ts", import.meta.url), "utf8");
  assert.match(middleware, /Content-Security-Policy/);
  assert.match(middleware, /private, no-store/);
  assert.match(middleware, /Strict-Transport-Security/);

  const staticHeaders = await readFile(new URL("../public/_headers", import.meta.url), "utf8");
  assert.match(staticHeaders, /Content-Security-Policy/);
  assert.match(staticHeaders, /X-Frame-Options: DENY/);

  const astroConfig = await readFile(new URL("../astro.config.mjs", import.meta.url), "utf8");
  assert.match(astroConfig, /checkOrigin:\s*true/);

  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /--accent:\s*#c8844a/i);
  assert.match(css, /fallback-orbit/i);
  assert.match(css, /trace-flow/i);
  assert.match(css, /\.contact-form/);
  assert.match(css, /\.cf-turnstile/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /\.scroll-progress/);
  assert.match(css, /min-height:\s*48px/);
  assert.doesNotMatch(css, /@keyframes scene-wave[^}]*margin-left:/i);
  assert.match(css, /\.process-list li:last-child\s*\{\s*border-bottom:\s*0/i);
  assert.doesNotMatch(css, /\.card-number\s*\{[^}]*margin-bottom:\s*auto/i);
  assert.match(css, /\.card-arrow\s*\{[^}]*margin-top:\s*auto/i);
  assert.doesNotMatch(css, /box-shadow|backdrop-filter|shadowBlur|filter:\s*blur/i);
  assert.doesNotMatch(css, /@keyframes scene-device-float[^}]*translate:\s/i);
  assert.match(css, /\.world-readout\s*\{\s*display:\s*none/i);
  assert.doesNotMatch(css, /violet|purple|8052ff|7543ff|9b68ff/i);

  const caddy = await readFile(new URL("../deploy/Caddyfile.example", import.meta.url), "utf8");
  assert.match(caddy, /header_up Host \{host\}/i);
  assert.match(caddy, /Strict-Transport-Security/i);
  assert.match(caddy, /Cross-Origin-Resource-Policy/i);
  assert.match(caddy, /path \/api\/\*/i);
  assert.match(caddy, /CDN-Cache-Control "no-store"/i);
  assert.match(caddy, /Cache-Control "private, no-store"/i);
  assert.match(caddy, /request_body @whoisjk_api/i);
  assert.match(caddy, /max_size 16KB/i);
  assert.doesNotMatch(caddy, /Cache-Control "public, max-age=/i);
  assert.doesNotMatch(caddy, /root \* \/srv\/|file_server/i);
  assert.match(caddy, /^whoisjk\.me \{/);
  assert.match(caddy, /reverse_proxy whoisjk-me:4321/);

  const quadlet = await readFile(new URL("../deploy/iamjk-site.container.example", import.meta.url), "utf8");
  assert.match(quadlet, /DropCapability=all/);
  assert.doesNotMatch(quadlet, /RESEND_/);
  assert.match(quadlet, /Cloudflare Workers Builds/);
  assert.match(quadlet, /ContainerName=whoisjk-me/);

  const deployConfig = await readFile(new URL("../deploy/iamjk-site.local.conf.example", import.meta.url), "utf8");
  assert.doesNotMatch(`${caddy}\n${quadlet}\n${deployConfig}`, /iamjk[.-]site|@iamjk_api/);

  const deployment = await readFile(new URL("../scripts/deploy-vps.sh", import.meta.url), "utf8");
  assert.match(deployment, /VPS deployment is retired: this project now deploys to Cloudflare Workers/);
  assert.match(deployment, /CLOUDFLARE_WORKERS_DEPLOYMENT\.md/);
  assert.doesNotMatch(deployment, /rsync|podman|systemctl|ssh/);

  const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
  const security = await readFile(new URL("../SECURITY.md", import.meta.url), "utf8");
  assert.doesNotMatch(`${readme}\n${security}`, /website@iamjk\.site|hello@iamjk\.site/);

  const favicon = await readFile(new URL("../public/favicon.svg", import.meta.url), "utf8");
  assert.match(favicon, /#050505/i);
  assert.match(favicon, /#F4F2EF/i);
  assert.doesNotMatch(favicon, /68C4FF|0C79D8|2E9EFF/i);
});
