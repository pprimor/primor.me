import { useState, type FormEvent } from "react";
import { siteMetadata } from "../lib/site-metadata";
import { submitContact, validateContact, type ContactErrors } from "./contact";
import { useTurnstile } from "./useTurnstile";

type Status = { kind: "idle" | "sending" | "sent" } | { kind: "error"; message: string };

const labelClass = "block font-ui text-xs font-bold text-black";
const fieldClass =
  "bevel-in mt-1 w-full bg-white px-2 py-1 font-mono text-base text-black outline-none focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-4 focus-visible:outline-black sm:text-[13px]";
const errorClass = "mt-1 font-ui text-xs text-[#a00000]";

export default function HireForm() {
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const turnstile = useTurnstile();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const fields = { senderEmail: senderEmail.trim(), message, company };
    const found = validateContact(fields);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus({ kind: "sending" });
    const result = await submitContact(fields, turnstile.token);
    if (result.ok) {
      setStatus({ kind: "sent" });
      setSenderEmail("");
      setMessage("");
    } else {
      setStatus({ kind: "error", message: result.error });
    }
    turnstile.reset();
  }

  if (status.kind === "sent") {
    return (
      <div className="h-full overflow-y-auto bg-x11-face p-4 font-ui text-sm text-black" role="status">
        <p className="font-bold">Message sent.</p>
        <p className="mt-2">Thanks. I'll reply from {siteMetadata.contactEmail} within a few days.</p>
        <button type="button" className="x11-button mt-4 h-7 px-3" onClick={() => setStatus({ kind: "idle" })}>
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex h-full flex-col gap-3 overflow-y-auto bg-x11-face p-3 font-ui text-sm text-black"
    >
      <p>
        Building a plugin, integration or internal tool? Tell me what it should do and I'll get
        back to you within a few days.
      </p>

      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="hire-company">Company</label>
        <input
          id="hire-company"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="hire-email" className={labelClass}>
          Your email
        </label>
        <input
          id="hire-email"
          type="email"
          autoComplete="email"
          value={senderEmail}
          onChange={(e) => setSenderEmail(e.target.value)}
          aria-invalid={Boolean(errors.senderEmail)}
          aria-describedby={errors.senderEmail ? "hire-email-error" : undefined}
          className={fieldClass}
        />
        {errors.senderEmail && (
          <p id="hire-email-error" className={errorClass}>
            {errors.senderEmail}
          </p>
        )}
      </div>

      <div className="flex min-h-32 flex-1 flex-col">
        <label htmlFor="hire-message" className={labelClass}>
          About the project
        </label>
        <textarea
          id="hire-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "hire-message-error" : undefined}
          className={`${fieldClass} min-h-24 flex-1 resize-none`}
        />
        {errors.message && (
          <p id="hire-message-error" className={errorClass}>
            {errors.message}
          </p>
        )}
      </div>

      {turnstile.enabled && <div ref={turnstile.container} className="min-h-[65px]" />}

      {status.kind === "error" && (
        <p role="alert" className={errorClass}>
          {status.message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={status.kind === "sending"} className="x11-button h-7 px-4 disabled:text-x11-shadow">
          {status.kind === "sending" ? "Sending…" : "Send"}
        </button>
        <span className="text-xs">
          or email{" "}
          <a href={`mailto:${siteMetadata.contactEmail}`} className="text-[#000080] underline">
            {siteMetadata.contactEmail}
          </a>
        </span>
      </div>
    </form>
  );
}
