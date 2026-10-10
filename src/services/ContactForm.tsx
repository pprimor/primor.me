import { useEffect, useRef, useState, type FormEvent } from "react";
import { submitContact, validateContact } from "../desktop/contact";
import { useTurnstile } from "../desktop/useTurnstile";

export const FORM_ROOT_ID = "contact-form";
export const FORM_PROPS_ID = "contact-form-props";
export const OTHER_SERVICE = "Something else";

export type ContactFormProps = {
  services: readonly string[];
  selected?: string;
  turnstileSiteKey: string | null;
  contactEmail: string;
};

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

const labelClass = "block font-mono text-sm text-term-heading";
const fieldClass =
  "mt-1 w-full border border-term-muted bg-term-bg px-2 py-1.5 text-base text-term-fg focus-visible:border-term-link focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-term-fg";
const mailLinkClass =
  "text-term-link underline decoration-term-muted underline-offset-4 hover:decoration-current";

export default function ContactForm({ services, selected, turnstileSiteKey, contactEmail }: ContactFormProps) {
  const [ready, setReady] = useState(false);
  const [nearView, setNearView] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const formRef = useRef<HTMLFormElement>(null);
  const turnstile = useTurnstile({ siteKey: turnstileSiteKey, theme: "dark", load: nearView });

  useEffect(() => setReady(true), []);

  // Load Turnstile only when the form is about to be seen.
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        setNearView(true);
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fields = {
      senderEmail: String(data.get("senderEmail") ?? ""),
      message: String(data.get("message") ?? ""),
      service: String(data.get("service") ?? ""),
      company: String(data.get("company") ?? ""),
    };
    const errors = validateContact(fields);
    const firstError = errors.senderEmail ?? errors.message;
    if (firstError) {
      setStatus({ kind: "error", message: firstError });
      return;
    }
    setStatus({ kind: "sending" });
    const result = await submitContact(fields, turnstile.token);
    if (result.ok) {
      setStatus({ kind: "sent" });
      return;
    }
    setStatus({ kind: "error", message: result.error });
    // A Turnstile token is single-use; get a fresh one for the retry.
    turnstile.reset();
  }

  const unavailable = turnstile.status === "disabled" || turnstile.status === "failed";
  const emailLink = (
    <a href={`mailto:${contactEmail}`} className={mailLinkClass}>
      {contactEmail}
    </a>
  );

  return (
    <div>
      {status.kind === "sent" ? (
        <p className="border border-term-accent p-4 text-term-accent">
          Thanks, your message is on its way. I&apos;ll reply by email.
        </p>
      ) : (
        <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="contact-email" className={labelClass}>
              Your email
            </label>
            <input
              id="contact-email"
              name="senderEmail"
              type="email"
              required
              autoComplete="email"
              maxLength={254}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="contact-service" className={labelClass}>
              What do you need?
            </label>
            <select id="contact-service" name="service" defaultValue={selected ?? OTHER_SERVICE} className={fieldClass}>
              {[...services, OTHER_SERVICE].map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="contact-message" className={labelClass}>
              About the project
            </label>
            <textarea id="contact-message" name="message" required rows={6} maxLength={5000} className={fieldClass} />
          </div>
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="contact-company">Company</label>
            <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          {unavailable ? (
            <p>The form is unavailable right now. Email me at {emailLink}.</p>
          ) : (
            <div ref={turnstile.container} className="min-h-[65px]" />
          )}
          <noscript>
            <p>This form needs JavaScript. Email me at {emailLink}.</p>
          </noscript>
          <button
            type="submit"
            disabled={!ready || unavailable || status.kind === "sending"}
            className="x11-button h-8 px-4 disabled:cursor-not-allowed disabled:text-x11-shadow"
          >
            {status.kind === "sending" ? "Sending…" : "Send"}
          </button>
        </form>
      )}
      <p
        role="status"
        aria-live="polite"
        className={`mt-3 min-h-6 ${status.kind === "error" ? "text-term-error" : "text-term-muted"}`}
      >
        {status.kind === "sending" && "Sending…"}
        {status.kind === "sent" && "Message sent."}
        {status.kind === "error" && status.message}
      </p>
    </div>
  );
}
