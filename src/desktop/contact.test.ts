import { describe, expect, it, vi } from "vitest";
import { GENERIC_ERROR, mailtoLink, submitContact, validateContact } from "./contact";

const valid = { senderEmail: "ana@example.com", message: "We need a Canva app." };

function respond(status: number, body: unknown) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status }));
}

describe("validateContact", () => {
  it("accepts a valid email and message", () => {
    expect(validateContact(valid)).toEqual({});
  });

  it("requires a well-formed email", () => {
    expect(validateContact({ ...valid, senderEmail: "ana@" }).senderEmail).toMatch(/valid email/);
    expect(validateContact({ ...valid, senderEmail: "  " }).senderEmail).toMatch(/required/);
  });

  it("requires a message of at most 5000 characters", () => {
    expect(validateContact({ ...valid, message: " " }).message).toMatch(/required/);
    expect(validateContact({ ...valid, message: "x".repeat(5001) }).message).toMatch(/5000/);
  });
});

describe("submitContact", () => {
  it("posts the fields and token to /api/contact", async () => {
    const fetchFn = respond(200, { success: true });
    const result = await submitContact({ ...valid, company: "" }, "tok", fetchFn);
    expect(result).toEqual({ ok: true });
    expect(fetchFn).toHaveBeenCalledWith("/api/contact", expect.objectContaining({ method: "POST" }));
    const [, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({ ...valid, company: "", turnstileToken: "tok" });
  });

  it("maps a known API error to a friendly message", async () => {
    const result = await submitContact(valid, "tok", respond(429, { error: "Too many requests. Please try again later." }));
    expect(result).toEqual({ ok: false, error: "Too many requests. Please wait a while and try again." });
  });

  it("falls back to the generic error for unknown errors, bad JSON and network failures", async () => {
    expect(await submitContact(valid, "tok", respond(500, { error: "boom" }))).toEqual({ ok: false, error: GENERIC_ERROR });
    expect(await submitContact(valid, "tok", vi.fn(async () => new Response("<html>", { status: 502 })))).toEqual({ ok: false, error: GENERIC_ERROR });
    expect(await submitContact(valid, "tok", vi.fn(async () => { throw new TypeError("offline"); }))).toEqual({ ok: false, error: GENERIC_ERROR });
  });

  it("refuses to post without a verification token when one is required", async () => {
    const fetchFn = respond(200, {});
    const result = await submitContact(valid, null, fetchFn);
    expect(result).toEqual({ ok: false, error: "Please complete the verification check." });
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("passes the service through to /api/contact", async () => {
    const fetchFn = respond(200, { success: true });
    await submitContact({ ...valid, service: "Canva Apps" }, "tok", fetchFn);
    const [, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toMatchObject({ service: "Canva Apps" });
  });
});

describe("mailtoLink", () => {
  it("prefills the message and reply-to for when the form can't post", () => {
    const href = mailtoLink({ senderEmail: "ana@example.com", message: "A Canva app & more\nThanks" });
    const url = new URL(href);
    expect(url.protocol).toBe("mailto:");
    expect(url.pathname).toBe("hello@primor.me");
    expect(url.searchParams.get("subject")).toBe("Project enquiry from primor.me");
    expect(url.searchParams.get("body")).toBe("A Canva app & more\nThanks\n\nReply to: ana@example.com");
    expect(href).not.toContain("+");
  });

  it("leaves out the reply-to line when no email was given", () => {
    const body = new URL(mailtoLink({ senderEmail: " ", message: "hi" })).searchParams.get("body");
    expect(body).toBe("hi");
  });
});
