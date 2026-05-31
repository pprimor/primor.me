interface Env {
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
const ALLOWED_ORIGINS = new Set([
  "https://primor.me",
  "http://localhost:5173",
  "http://localhost:8788",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8788",
]);

function jsonResponse(body: object, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("Origin");
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    return true;
  }

  const referer = request.headers.get("Referer");
  if (!referer) {
    return false;
  }

  try {
    const url = new URL(referer);
    return ALLOWED_ORIGINS.has(url.origin);
  } catch {
    return false;
  }
}

function getClientIp(request: Request): string {
  const cfConnectingIp = request.headers.get("CF-Connecting-IP");
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  const forwardedFor = request.headers.get("X-Forwarded-For");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return "unknown";
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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

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
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

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
      html: `
        <h2>New message from your website</h2>
        <p><strong>From:</strong> ${escapeHtml(senderEmail)}</p>
        <hr />
        <p>${safeMessage}</p>
      `,
    }),
  });

  if (!resendResponse.ok) {
    console.error("Resend error:", await resendResponse.text());
    return jsonResponse({ error: "Failed to send message" }, 502);
  }

  return jsonResponse({ success: true }, 200);
};
