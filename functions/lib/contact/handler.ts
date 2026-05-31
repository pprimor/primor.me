import {
  getClientIp,
  isAllowedOrigin,
  isValidEmail,
} from "./helpers";
import { renderContactEmailHtml } from "./render-email";

export interface ContactEnv {
  RESEND_API_KEY: string;
  CONTACT_TO_EMAIL?: string;
  RESEND_FROM_EMAIL?: string;
  TURNSTILE_SECRET_KEY: string;
  CONTACT_RATE_LIMIT: KVNamespace;
}

type ContactBody = {
  senderEmail?: string;
  message?: string;
  company?: string;
  turnstileToken?: string;
};

const MAX_MESSAGE_LENGTH = 5000;
const MAX_SUBMISSIONS_PER_HOUR = 5;
const HOUR_MS = 3_600_000;
const RATE_LIMIT_TTL_SECONDS = 3600;
const DEFAULT_TO_EMAIL = "hello@primor.me";
const DEFAULT_FROM_EMAIL = "Portfolio <hello@primor.me>";

function jsonResponse(body: object, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function verifyTurnstile(
  secret: string,
  token: string,
  remoteIp: string | undefined
): Promise<boolean> {
  const params = new URLSearchParams({
    secret,
    response: token,
  });

  if (remoteIp) {
    params.set("remoteip", remoteIp);
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    }
  );

  if (!response.ok) {
    return false;
  }

  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
}

async function checkRateLimit(
  kv: KVNamespace,
  ip: string
): Promise<{ allowed: boolean }> {
  const hourBucket = Math.floor(Date.now() / HOUR_MS);
  const key = `contact:${ip}:${hourBucket}`;
  const current = await kv.get(key);
  const count = current ? Number.parseInt(current, 10) : 0;

  if (count >= MAX_SUBMISSIONS_PER_HOUR) {
    return { allowed: false };
  }

  await kv.put(key, String(count + 1), {
    expirationTtl: RATE_LIMIT_TTL_SECONDS,
  });

  return { allowed: true };
}

export async function handleContactPost(
  request: Request,
  env: ContactEnv
): Promise<Response> {
  if (!isAllowedOrigin(request)) {
    return jsonResponse({ error: "Forbidden" }, 403);
  }

  if (!env.RESEND_API_KEY) {
    return jsonResponse({ error: "Email service is not configured" }, 503);
  }

  if (!env.TURNSTILE_SECRET_KEY) {
    return jsonResponse({ error: "Email service is not configured" }, 503);
  }

  if (!env.CONTACT_RATE_LIMIT) {
    return jsonResponse({ error: "Email service is not configured" }, 503);
  }

  let body: ContactBody;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (body.company) {
    return jsonResponse({ error: "Invalid submission" }, 400);
  }

  const turnstileToken = body.turnstileToken?.trim() ?? "";
  if (!turnstileToken) {
    return jsonResponse({ error: "Verification required" }, 400);
  }

  const clientIp = getClientIp(request);
  const turnstileOk = await verifyTurnstile(
    env.TURNSTILE_SECRET_KEY,
    turnstileToken,
    clientIp !== "unknown" ? clientIp : undefined
  );

  if (!turnstileOk) {
    return jsonResponse(
      { error: "Verification failed. Please try again." },
      400
    );
  }

  const rateLimit = await checkRateLimit(env.CONTACT_RATE_LIMIT, clientIp);
  if (!rateLimit.allowed) {
    return jsonResponse(
      { error: "Too many requests. Please try again later." },
      429
    );
  }

  const senderEmail = body.senderEmail?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!senderEmail || !isValidEmail(senderEmail)) {
    return jsonResponse({ error: "A valid email address is required" }, 400);
  }

  if (!message) {
    return jsonResponse({ error: "Message is required" }, 400);
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return jsonResponse(
      { error: `Message must be at most ${MAX_MESSAGE_LENGTH} characters` },
      400
    );
  }

  const toEmail = env.CONTACT_TO_EMAIL ?? DEFAULT_TO_EMAIL;
  const fromEmail = env.RESEND_FROM_EMAIL ?? DEFAULT_FROM_EMAIL;
  const html = await renderContactEmailHtml(senderEmail, message);

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: senderEmail,
      subject: "Contact from primor.me",
      html,
    }),
  });

  if (!resendResponse.ok) {
    console.error("Resend error:", await resendResponse.text());
    return jsonResponse({ error: "Failed to send message" }, 502);
  }

  return jsonResponse({ success: true }, 200);
}
