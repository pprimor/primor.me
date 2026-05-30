interface Env {
  RESEND_API_KEY: string;
  CONTACT_TO_EMAIL?: string;
  RESEND_FROM_EMAIL?: string;
}

type ContactBody = {
  senderEmail?: string;
  message?: string;
  company?: string;
};

const MAX_MESSAGE_LENGTH = 5000;
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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (!isAllowedOrigin(request)) {
    return jsonResponse({ error: "Forbidden" }, 403);
  }

  if (!env.RESEND_API_KEY) {
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
