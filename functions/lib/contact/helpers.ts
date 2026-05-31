export const ALLOWED_ORIGINS = new Set([
  "https://primor.me",
  "http://localhost:5173",
  "http://localhost:8788",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8788",
]);

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isAllowedOrigin(request: Request): boolean {
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

export function getClientIp(request: Request): string {
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
