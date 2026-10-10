import { useCallback, useEffect, useRef, useState } from "react";

const SCRIPT_ID = "cf-turnstile-script";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";
const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/** Renders a Cloudflare Turnstile widget into `container` and tracks its token. */
export function useTurnstile() {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!siteKey) return;

    const render = () => {
      if (!window.turnstile || !container.current || widgetId.current) return;
      widgetId.current = window.turnstile.render(container.current, {
        sitekey: siteKey,
        theme: "light",
        callback: setToken,
        "expired-callback": () => setToken(null),
        "error-callback": () => setToken(null),
      });
    };

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (window.turnstile) {
      render();
    } else {
      if (!script) {
        script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.src = SCRIPT_SRC;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", render);
    }

    return () => {
      script?.removeEventListener("load", render);
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, []);

  const reset = useCallback(() => {
    if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    setToken(null);
  }, []);

  return { container, token, reset, enabled: Boolean(siteKey) };
}
