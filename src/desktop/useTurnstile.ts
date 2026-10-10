import { useCallback, useEffect, useRef, useState } from "react";

const SCRIPT_ID = "cf-turnstile-script";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";
const envSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

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

/**
 * `disabled`: no site key in this build. `failed`: the script or widget couldn't load
 * (blocked, offline). Either way the form can't post and should fall back to email.
 */
export type TurnstileStatus = "disabled" | "loading" | "ready" | "failed";

type TurnstileOptions = {
  /** Defaults to VITE_TURNSTILE_SITE_KEY; null disables the widget. */
  siteKey?: string | null;
  theme?: "light" | "dark";
  /** False defers loading the script until it becomes true. */
  load?: boolean;
};

/** Renders a Cloudflare Turnstile widget into `container` and tracks its token. */
export function useTurnstile({ siteKey = envSiteKey ?? null, theme = "light", load = true }: TurnstileOptions = {}) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<TurnstileStatus>(siteKey ? "loading" : "disabled");

  useEffect(() => {
    if (!siteKey || !load) return;

    const fail = () => setStatus("failed");
    const render = () => {
      if (!window.turnstile || !container.current || widgetId.current) return;
      widgetId.current = window.turnstile.render(container.current, {
        sitekey: siteKey,
        theme,
        callback: setToken,
        "expired-callback": () => setToken(null),
        "error-callback": () => {
          setToken(null);
          fail();
        },
      });
      setStatus("ready");
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
      script.addEventListener("error", fail);
    }

    return () => {
      script?.removeEventListener("load", render);
      script?.removeEventListener("error", fail);
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [siteKey, theme, load]);

  const reset = useCallback(() => {
    if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    setToken(null);
  }, []);

  return { container, token, reset, status };
}
