import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ContactForm, { type ContactFormProps } from "./ContactForm";

const props: ContactFormProps = {
  services: ["Adobe UXP plugins", "Canva Apps"],
  selected: "Canva Apps",
  turnstileSiteKey: "site-key",
  contactEmail: "hello@primor.me",
};

const render = (p: ContactFormProps) => renderToString(createElement(ContactForm, p));

describe("ContactForm (server render)", () => {
  const html = render(props);

  it("labels every visible field", () => {
    expect(html).toMatch(/<label[^>]*for="contact-email"/);
    expect(html).toMatch(/<input[^>]*id="contact-email"[^>]*name="senderEmail"/);
    expect(html).toMatch(/<label[^>]*for="contact-service"/);
    expect(html).toMatch(/<label[^>]*for="contact-message"/);
  });

  it("pre-selects the page's service and offers 'Something else'", () => {
    expect(html).toMatch(/<option value="Canva Apps" selected="">/);
    expect(html).toContain('<option value="Something else">');
  });

  it("hides the company honeypot from people and assistive tech", () => {
    expect(html).toMatch(/<div aria-hidden="true"[^>]*>.*name="company"/s);
    expect(html).toMatch(/name="company"[^>]*tabindex="-1"|tabindex="-1"[^>]*name="company"/);
  });

  it("keeps submit disabled until hydrated and offers email without JS", () => {
    expect(html).toMatch(/<button[^>]*type="submit"[^>]*disabled=""/);
    expect(html).toMatch(/<noscript>.*mailto:hello@primor.me.*<\/noscript>/s);
  });

  it("falls back to email when no Turnstile key is configured", () => {
    const fallback = render({ ...props, turnstileSiteKey: null });
    expect(fallback).toContain("The form is unavailable right now");
    expect(fallback).toContain("mailto:hello@primor.me");
  });
});
