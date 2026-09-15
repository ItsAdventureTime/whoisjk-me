import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { countryCodes } from "../../lib/countries";

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const MAX_BODY_BYTES = 16_384;
const MAX_MESSAGE_LENGTH = 5_000;
const MAX_NAME_LENGTH = 80;
const MAX_MOBILE_LENGTH = 32;
const MAX_EMAIL_LENGTH = 254;
const MIN_COMPLETION_MS = 1_200;
const validCountryCodes = new Set(countryCodes);

function secret(name: keyof Pick<ContactEnvironment, "TURNSTILE_SECRET" | "CONTACT_FROM" | "CONTACT_TO">, env: ContactEnvironment): string {
  const value = env[name]?.trim() || (typeof process !== "undefined" ? process.env?.[name]?.trim() : undefined);
  if (value) return value;
  throw new Error(`Missing runtime secret: ${name}`);
}

function textValue(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.normalize("NFKC").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, maxLength);
}

function validEmail(value: string): boolean {
  return value.length <= MAX_EMAIL_LENGTH && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function requestIp(request: Request): string {
  return request.headers.get("cf-connecting-ip")?.trim() || "unknown";
}

async function verifyTurnstile(token: string, request: Request, secretKey: string): Promise<boolean> {
  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ secret: secretKey, response: token, remoteip: requestIp(request) }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) return false;
  const result = await response.json() as { success?: boolean; hostname?: string; action?: string };
  return result.success === true && (!result.hostname || result.hostname === "whoisjk.me") && (!result.action || result.action === "turnstile-spin-v2");
}

export const POST: APIRoute = async ({ request }) => {
  const runtimeEnv = env as unknown as ContactEnvironment;
  const requestId = crypto.randomUUID();
  const origin = request.headers.get("origin");
  if (origin !== "https://whoisjk.me") {
    return Response.json({ message: "Please submit your message through the form." }, { status: 403 });
  }
  const { success } = await runtimeEnv.CONTACT_RATE_LIMITER.limit({ key: requestIp(request) });
  if (!success) {
    return Response.json({ message: "Please wait a moment before trying again." }, { status: 429, headers: { "retry-after": "60" } });
  }
  const contentType = request.headers.get("content-type") || "";
  const mediaType = contentType.split(";")[0].trim().toLowerCase();
  const isJson = mediaType === "application/json";
  const isForm = mediaType === "application/x-www-form-urlencoded" || mediaType === "multipart/form-data";
  if (!isJson && !isForm) {
    return Response.json({ message: "Please submit your message through the form." }, { status: 415 });
  }
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) return Response.json({ message: "Your message is too large." }, { status: 413 });

  try {
    const rawBody = await request.arrayBuffer();
    if (rawBody.byteLength > MAX_BODY_BYTES) return Response.json({ message: "Your message is too large." }, { status: 413 });
    let fields: Record<string, unknown>;
    if (isJson) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(new TextDecoder().decode(rawBody)) as unknown;
      } catch {
        return Response.json({ message: "Check the highlighted fields and try again." }, { status: 400 });
      }
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return Response.json({ message: "Check the highlighted fields and try again." }, { status: 400 });
      fields = parsed as Record<string, unknown>;
    } else {
      const form = await new Response(rawBody, { headers: { "content-type": contentType } }).formData();
      fields = Object.fromEntries(form.entries());
    }
    const startedAt = Number(textValue(fields.startedAt, 20));
    const name = textValue(fields.name, MAX_NAME_LENGTH);
    const country = textValue(fields.country, 2).toUpperCase();
    const email = textValue(fields.email, MAX_EMAIL_LENGTH).toLowerCase();
    const mobile = textValue(fields.mobile, MAX_MOBILE_LENGTH);
    const message = textValue(fields.message, MAX_MESSAGE_LENGTH);
    const website = textValue(fields.website, 100);
    const token = textValue(fields["cf-turnstile-response"], 2_048);
    if (website || (startedAt > 0 && Date.now() - startedAt < MIN_COMPLETION_MS)) return Response.json({ message: "Please try again." }, { status: 400 });
    if (!name || !validCountryCodes.has(country) || !message || (email && !validEmail(email)) || !token) return Response.json({ message: "Check the highlighted fields and try again." }, { status: 400 });
    if (!(await verifyTurnstile(token, request, secret("TURNSTILE_SECRET", runtimeEnv)))) return Response.json({ message: "We could not verify your submission. Please try again." }, { status: 403 });

    const from = secret("CONTACT_FROM", runtimeEnv);
    const to = secret("CONTACT_TO", runtimeEnv);
    if (!validEmail(from) || !validEmail(to)) {
      console.error("[contact] invalid Cloudflare Email Service sender configuration", { requestId });
      return Response.json({ message: `I couldn’t send your message. Reference ${requestId.slice(0, 8)}.` }, { status: 503 });
    }
    if (!from.toLowerCase().endsWith("@notify.whoisjk.me")) {
      console.error("[contact] invalid sender domain: CONTACT_FROM must end with @notify.whoisjk.me", { requestId });
      return Response.json({ message: `I couldn’t send your message. Reference ${requestId.slice(0, 8)}.` }, { status: 503 });
    }
    if (!runtimeEnv.EMAIL || typeof runtimeEnv.EMAIL.send !== "function") {
      console.error("[contact] missing or unconfigured EMAIL binding", { requestId });
      return Response.json({ message: `I couldn’t send your message. Reference ${requestId.slice(0, 8)}.` }, { status: 503 });
    }
    const emailBody = [`New message from whoisjk.me`, ``, `Name: ${name}`, `Country: ${country}`, `Email: ${email || "Not provided"}`, `Mobile: ${mobile || "Not provided"}`, ``, message].join("\n");
    try {
      await runtimeEnv.EMAIL.send({ from, to, ...(email ? { replyTo: email } : {}), subject: `New message from ${name} via whoisjk.me`, text: emailBody });
    } catch (error) {
      const details = error as { code?: unknown; message?: unknown };
      console.error("[contact] Cloudflare Email Service rejected message", {
        requestId,
        code: typeof details?.code === "string" ? details.code : "unknown",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        details: error,
      });
      return Response.json({ message: `I couldn’t send your message. Reference ${requestId.slice(0, 8)}.` }, { status: 502 });
    }
    console.info("[contact] message accepted by Cloudflare Email Service", { requestId });
    return Response.json({ message: "Thanks for writing. Your message was sent privately." }, { status: 200 });
  } catch (error) {
    console.error("[contact] submission failed", {
      requestId,
      errorType: error instanceof Error ? error.name : "unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      details: error,
    });
    return Response.json({ message: `I couldn’t send your message. Reference ${requestId.slice(0, 8)}.` }, { status: 503 });
  }
};

export const GET: APIRoute = async () => new Response(null, { status: 405, headers: { Allow: "POST", "X-Robots-Tag": "noindex, nofollow, noarchive" } });
