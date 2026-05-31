import { env } from "cloudflare:workers";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ContactEnv } from "../lib/contact/handler";
import { onRequestPost } from "./contact";

const TURNSTILE_TEST_TOKEN = "1x000000000000000000000000AA";
const DEFAULT_ORIGIN = "http://localhost:8788";
const TURNSTILE_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const RESEND_URL = "https://api.resend.com/emails";

let ipCounter = 0;

function nextTestIp(): string {
  ipCounter += 1;
  return `203.0.113.${ipCounter}`;
}

type FetchMockOptions = {
  turnstileSuccess?: boolean;
  resendOk?: boolean;
};

function mockFetch(options: FetchMockOptions = {}) {
  const { turnstileSuccess = true, resendOk = true } = options;

  const fetchMock = vi.fn<
    (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
  >(async (input) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;

      if (url === TURNSTILE_URL) {
        return new Response(
          JSON.stringify({ success: turnstileSuccess }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (url === RESEND_URL) {
        if (!resendOk) {
          return new Response("error", { status: 500 });
        }
        return new Response("{}", {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response("not found", { status: 404 });
    }
  );

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function createContactContext(
  request: Request,
  envOverrides?: Partial<ContactEnv>
) {
  return {
    request,
    env: { ...env, ...envOverrides } as ContactEnv,
    params: {},
    waitUntil: vi.fn(),
    next: vi.fn(),
    data: {},
    functionPath: "/api/contact",
    passThroughOnException: vi.fn(),
  } as unknown as EventContext<ContactEnv, string, Record<string, unknown>>;
}

async function postContact(
  body: Record<string, unknown>,
  headers: Record<string, string> = {}
) {
  const request = new Request("http://localhost:8788/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: DEFAULT_ORIGIN,
      "CF-Connecting-IP": nextTestIp(),
      ...headers,
    },
    body: JSON.stringify(body),
  });

  return onRequestPost(createContactContext(request));
}

describe("onRequestPost", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns 403 when Origin and Referer are missing or invalid", async () => {
    mockFetch();
    const request = new Request("http://localhost:8788/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await onRequestPost(createContactContext(request));
    expect(response.status).toBe(403);
  });

  it("returns 503 when required env bindings are missing", async () => {
    mockFetch();
    const request = new Request("http://localhost:8788/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: DEFAULT_ORIGIN,
      },
      body: JSON.stringify({}),
    });

    const response = await onRequestPost(
      createContactContext(request, {
        RESEND_API_KEY: "",
      })
    );
    expect(response.status).toBe(503);
  });

  it("returns 400 for invalid JSON body", async () => {
    mockFetch();
    const request = new Request("http://localhost:8788/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: DEFAULT_ORIGIN,
      },
      body: "not-json",
    });

    const response = await onRequestPost(createContactContext(request));
    expect(response.status).toBe(400);
  });

  it("returns 400 when honeypot company field is set", async () => {
    mockFetch();
    const response = await postContact({
      company: "Acme Inc",
      turnstileToken: TURNSTILE_TEST_TOKEN,
    });
    expect(response.status).toBe(400);
  });

  it("returns 400 when turnstileToken is missing", async () => {
    mockFetch();
    const response = await postContact({
      senderEmail: "user@example.com",
      message: "Hello",
    });
    expect(response.status).toBe(400);
  });

  it("returns 400 when Turnstile verification fails", async () => {
    mockFetch({ turnstileSuccess: false });
    const response = await postContact({
      senderEmail: "user@example.com",
      message: "Hello",
      turnstileToken: TURNSTILE_TEST_TOKEN,
    });
    expect(response.status).toBe(400);
  });

  it("returns 429 after five submissions from the same IP in one hour", async () => {
    mockFetch();
    const sharedIp = nextTestIp();
    const baseHeaders = {
      Origin: DEFAULT_ORIGIN,
      "CF-Connecting-IP": sharedIp,
    };

    for (let i = 0; i < 5; i++) {
      const response = await postContact(
        {
          turnstileToken: TURNSTILE_TEST_TOKEN,
          senderEmail: "user@example.com",
          message: "Hello",
        },
        baseHeaders
      );
      expect(response.status).toBe(200);
    }

    const sixth = await postContact(
      {
        turnstileToken: TURNSTILE_TEST_TOKEN,
        senderEmail: "user@example.com",
        message: "Hello again",
      },
      baseHeaders
    );
    expect(sixth.status).toBe(429);
  });

  it("returns 400 for invalid or missing email", async () => {
    mockFetch();
    const missing = await postContact({
      turnstileToken: TURNSTILE_TEST_TOKEN,
      message: "Hello",
    });
    expect(missing.status).toBe(400);

    const invalid = await postContact({
      turnstileToken: TURNSTILE_TEST_TOKEN,
      senderEmail: "not-an-email",
      message: "Hello",
    });
    expect(invalid.status).toBe(400);
  });

  it("returns 400 for missing or overlong message", async () => {
    mockFetch();
    const missing = await postContact({
      turnstileToken: TURNSTILE_TEST_TOKEN,
      senderEmail: "user@example.com",
    });
    expect(missing.status).toBe(400);

    const overlong = await postContact({
      turnstileToken: TURNSTILE_TEST_TOKEN,
      senderEmail: "user@example.com",
      message: "x".repeat(5001),
    });
    expect(overlong.status).toBe(400);
  });

  it("returns 502 when Resend returns a non-OK response", async () => {
    mockFetch({ resendOk: false });
    const userMessage = "Hello";
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(vi.fn());

    const response = await postContact({
      turnstileToken: TURNSTILE_TEST_TOKEN,
      senderEmail: "user@example.com",
      message: userMessage,
    });

    expect(response.status).toBe(502);

    expect(consoleError).toHaveBeenCalled();
    const loggedLine = String(consoleError.mock.calls[0]?.[0]);
    const log = JSON.parse(loggedLine) as {
      service: string;
      event: string;
      status: number;
      resendStatus: number;
    };

    expect(log.service).toBe("contact-api");
    expect(log.event).toBe("resend_failed");
    expect(log.status).toBe(502);
    expect(log.resendStatus).toBe(500);
    expect(loggedLine).not.toContain(userMessage);

    consoleError.mockRestore();
  });

  it("returns 200 and sends escaped HTML to Resend on valid payload", async () => {
    const fetchMock = mockFetch();
    const response = await postContact({
      turnstileToken: TURNSTILE_TEST_TOKEN,
      senderEmail: "user@example.com",
      message: '<script>alert("x")</script>',
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });

    const resendCall = fetchMock.mock.calls.find(([url]) => url === RESEND_URL);
    expect(resendCall).toBeDefined();

    const init = resendCall?.[1];
    expect(init?.body).toBeDefined();

    const payload = JSON.parse(String(init?.body)) as {
      reply_to: string;
      html: string;
    };

    expect(payload.reply_to).toBe("user@example.com");
    expect(payload.html).toContain("user@example.com");
    expect(payload.html).toContain(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;"
    );
    expect(payload.html).not.toContain("<script>");
  });
});
