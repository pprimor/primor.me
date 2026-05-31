export type ContactLogEvent =
  | "forbidden_origin"
  | "misconfigured"
  | "rate_limited"
  | "turnstile_failed"
  | "resend_failed"
  | "email_sent";

export type ContactLogPayload = {
  event: ContactLogEvent;
  status: number;
  reason?: string;
  resendStatus?: number;
  resendError?: string;
  clientIp?: string;
};

const MAX_RESEND_ERROR_LENGTH = 500;

export function sanitizeResendError(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) {
    return "";
  }

  try {
    const parsed = JSON.parse(trimmed) as { message?: unknown };
    if (typeof parsed.message === "string" && parsed.message.length > 0) {
      return truncate(parsed.message);
    }
  } catch {
    // fall through to raw body
  }

  return truncate(trimmed);
}

function truncate(value: string): string {
  if (value.length <= MAX_RESEND_ERROR_LENGTH) {
    return value;
  }
  return `${value.slice(0, MAX_RESEND_ERROR_LENGTH)}…`;
}

export function logContactEvent(
  payload: ContactLogPayload,
  level: "info" | "warn" | "error" = "info"
): void {
  const line = JSON.stringify({
    service: "contact-api",
    ...payload,
    ts: new Date().toISOString(),
  });

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}
