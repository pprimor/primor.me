import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useInView } from "react-intersection-observer";
import SectionHeading from "./SectionHeading";
import SubmitButton from "./contact/SubmitButton";
import ThemedToaster from "./ThemedToaster";
import { useTheme } from "@/src/context/theme-context";
import { useSectionInView } from "@/src/lib/hooks";

type ContactFormData = {
  senderEmail: string;
  message: string;
  company?: string;
};

const TURNSTILE_SCRIPT_ID = "cf-turnstile-script";
const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

const GENERIC_ERROR =
  "Couldn't send your message. Please try again or email hello@primor.me directly.";

const API_ERROR_MESSAGES: Record<string, string> = {
  "A valid email address is required": "Please enter a valid email address.",
  "Message is required": "Please enter a message.",
  "Message must be at most 5000 characters":
    "Message is too long (max 5000 characters).",
  "Verification required": "Please complete the verification check.",
  "Verification failed. Please try again.":
    "Verification failed. Please try again.",
  "Too many requests. Please try again later.":
    "Too many requests. Please wait a while and try again.",
};

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    }
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

async function parseJsonResponse(
  response: Response
): Promise<{ error?: string; success?: boolean }> {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as { error?: string; success?: boolean };
  } catch {
    return {};
  }
}

function getUserFacingError(apiError?: string): string {
  if (apiError && API_ERROR_MESSAGES[apiError]) {
    return API_ERROR_MESSAGES[apiError];
  }

  return GENERIC_ERROR;
}

export default function Contact() {
  const { ref } = useSectionInView("#contact");
  const { ref: turnstileInViewRef, inView: turnstileInView } = useInView({
    triggerOnce: true,
    rootMargin: "200px 0px",
  });
  const shouldReduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>();

  const resetTurnstileWidget = () => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      setTurnstileToken(null);
    }
  };

  useEffect(() => {
    if (!turnstileSiteKey || !turnstileContainerRef.current || !turnstileInView) {
      return;
    }

    const renderWidget = () => {
      const container = turnstileContainerRef.current;
      if (!window.turnstile || !container) {
        return;
      }

      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }

      widgetIdRef.current = window.turnstile.render(container, {
        sitekey: turnstileSiteKey,
        theme: theme === "dark" ? "dark" : "light",
        callback: (token) => setTurnstileToken(token),
        "expired-callback": () => setTurnstileToken(null),
        "error-callback": () => setTurnstileToken(null),
      });
    };

    if (window.turnstile) {
      renderWidget();
      return () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }
      };
    }

    let script = document.getElementById(
      TURNSTILE_SCRIPT_ID
    ) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = TURNSTILE_SCRIPT_ID;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    script.addEventListener("load", renderWidget);

    return () => {
      script?.removeEventListener("load", renderWidget);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [theme, turnstileInView]);

  const onSubmit = async (data: ContactFormData) => {
    if (turnstileSiteKey && !turnstileToken) {
      toast.error(getUserFacingError("Verification required"));
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          ...(turnstileToken ? { turnstileToken } : {}),
        }),
      });

      const result = await parseJsonResponse(response);

      if (!response.ok) {
        toast.error(getUserFacingError(result.error));
        resetTurnstileWidget();
        return;
      }

      toast.success("Message sent! I'll get back to you soon.");
      reset();
      resetTurnstileWidget();
    } catch {
      toast.error(GENERIC_ERROR);
      resetTurnstileWidget();
    }
  };

  const inputClassName = (hasError: boolean) =>
    clsx(
      "mt-2 w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus-ring dark:bg-white/10 dark:text-gray-50 dark:placeholder:text-gray-400",
      hasError
        ? "input-error"
        : "border-black/10 dark:border-white/10"
    );

  return (
    <>
      <ThemedToaster />
      <motion.section
      id="contact"
      ref={ref}
      className="mb-28 max-w-[40rem] w-full scroll-mt-28 sm:mb-40"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <SectionHeading>Contact me</SectionHeading>
      <p className="mb-8 text-center text-gray-700 dark:text-white/70">
        Have a question or want to work together? Send me a message.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
        noValidate
      >
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <label htmlFor="company">Company</label>
          <input
            id="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register("company")}
          />
        </div>

        <div>
          <label htmlFor="senderEmail" className="block text-sm font-medium">
            Your email
          </label>
          <input
            id="senderEmail"
            type="email"
            autoComplete="email"
            className={inputClassName(!!errors.senderEmail)}
            aria-invalid={errors.senderEmail ? "true" : "false"}
            aria-describedby={errors.senderEmail ? "senderEmail-error" : undefined}
            {...register("senderEmail", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address",
              },
            })}
          />
          {errors.senderEmail && (
            <p id="senderEmail-error" className="field-error" role="alert">
              {errors.senderEmail.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium">
            Message
          </label>
          <textarea
            id="message"
            rows={5}
            className={inputClassName(!!errors.message)}
            aria-invalid={errors.message ? "true" : "false"}
            aria-describedby={errors.message ? "message-error" : undefined}
            {...register("message", {
              required: "Message is required",
              maxLength: {
                value: 5000,
                message: "Message must be at most 5000 characters",
              },
            })}
          />
          {errors.message && (
            <p id="message-error" className="field-error" role="alert">
              {errors.message.message}
            </p>
          )}
        </div>

        <div ref={turnstileInViewRef} className="flex flex-col items-center gap-3">
          {turnstileSiteKey ? (
            <div ref={turnstileContainerRef} className="min-h-[65px]" />
          ) : null}
          <SubmitButton isSubmitting={isSubmitting} />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Or email me directly at{" "}
            <a
              href="mailto:hello@primor.me"
              className="underline hover:text-gray-900 dark:hover:text-gray-200"
            >
              hello@primor.me
            </a>
          </p>
        </div>
      </form>
    </motion.section>
    </>
  );
}
