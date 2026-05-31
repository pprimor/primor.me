import { describe, expect, it } from "vitest";
import {
  escapeHtml,
  getClientIp,
  isAllowedOrigin,
  isValidEmail,
} from "./helpers";

describe("escapeHtml", () => {
  it("escapes script tags, ampersands, and quotes", () => {
    expect(escapeHtml('<script>alert("x")</script> & \'test\'')).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;test&#39;"
    );
  });
});

describe("isValidEmail", () => {
  it("accepts valid addresses", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
  });

  it("rejects invalid and empty addresses", () => {
    expect(isValidEmail("bad")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

describe("isAllowedOrigin", () => {
  it("allows listed Origin header", () => {
    const request = new Request("https://primor.me/api/contact", {
      headers: { Origin: "https://primor.me" },
    });
    expect(isAllowedOrigin(request)).toBe(true);
  });

  it("rejects unknown Origin", () => {
    const request = new Request("https://primor.me/api/contact", {
      headers: { Origin: "https://evil.example" },
    });
    expect(isAllowedOrigin(request)).toBe(false);
  });

  it("falls back to Referer when Origin is absent", () => {
    const request = new Request("https://primor.me/api/contact", {
      headers: { Referer: "http://localhost:8788/contact" },
    });
    expect(isAllowedOrigin(request)).toBe(true);
  });
});

describe("getClientIp", () => {
  it("prefers CF-Connecting-IP", () => {
    const request = new Request("https://example.com", {
      headers: {
        "CF-Connecting-IP": "203.0.113.1",
        "X-Forwarded-For": "198.51.100.1",
      },
    });
    expect(getClientIp(request)).toBe("203.0.113.1");
  });

  it("uses first X-Forwarded-For when CF-Connecting-IP is missing", () => {
    const request = new Request("https://example.com", {
      headers: { "X-Forwarded-For": "198.51.100.1, 10.0.0.1" },
    });
    expect(getClientIp(request)).toBe("198.51.100.1");
  });

  it('returns "unknown" when no IP headers are present', () => {
    expect(getClientIp(new Request("https://example.com"))).toBe("unknown");
  });
});
