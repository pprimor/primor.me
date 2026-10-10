import { siteMetadata } from "../lib/site-metadata";

export type ContactFields = { senderEmail: string; message: string; company?: string; service?: string };
export type ContactErrors = Partial<Record<"senderEmail" | "message", string>>;
export type SubmitResult = { ok: true } | { ok: false; error: string };

const MAX_MESSAGE_LENGTH = 5000;

export const GENERIC_ERROR = `Couldn't send your message. Please try again or email ${siteMetadata.contactEmail} directly.`;

// Keyed by the exact error strings in functions/lib/contact/handler.ts.
const API_ERROR_MESSAGES: Record<string, string> = {
  "A valid email address is required": "Please enter a valid email address.",
  "Message is required": "Please enter a message.",
  "Message must be at most 5000 characters": "Message is too long (max 5000 characters).",
  "Verification required": "Please complete the verification check.",
  "Verification failed. Please try again.": "Verification failed. Please try again.",
  "Too many requests. Please try again later.": "Too many requests. Please wait a while and try again.",
};

export function validateContact({ senderEmail, message }: ContactFields): ContactErrors {
  const errors: ContactErrors = {};
  const email = senderEmail.trim();
  if (!email) errors.senderEmail = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.senderEmail = "Enter a valid email address.";
  if (!message.trim()) errors.message = "A message is required.";
  else if (message.length > MAX_MESSAGE_LENGTH) errors.message = `Keep it under ${MAX_MESSAGE_LENGTH} characters.`;
  return errors;
}

async function readError(response: Response): Promise<string | undefined> {
  try {
    return ((await response.json()) as { error?: string }).error;
  } catch {
    return undefined;
  }
}

export async function submitContact(
  fields: ContactFields,
  turnstileToken: string | null,
  fetchFn: typeof fetch = fetch,
): Promise<SubmitResult> {
  if (!turnstileToken) {
    return { ok: false, error: API_ERROR_MESSAGES["Verification required"] };
  }
  try {
    const response = await fetchFn("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fields, turnstileToken }),
    });
    if (response.ok) return { ok: true };
    const error = await readError(response);
    return { ok: false, error: (error && API_ERROR_MESSAGES[error]) || GENERIC_ERROR };
  } catch {
    return { ok: false, error: GENERIC_ERROR };
  }
}

/** A prefilled email, for when the form can't post (e.g. verification is blocked). */
export function mailtoLink({ senderEmail, message }: ContactFields): string {
  const email = senderEmail.trim();
  const body = email ? `${message}\n\nReply to: ${email}` : message;
  const query = [
    `subject=${encodeURIComponent("Project enquiry from primor.me")}`,
    `body=${encodeURIComponent(body)}`,
  ].join("&");
  return `mailto:${siteMetadata.contactEmail}?${query}`;
}
