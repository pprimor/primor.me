import { motion, useReducedMotion } from "framer-motion";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import SectionHeading from "./SectionHeading";
import SubmitButton from "./contact/SubmitButton";
import { useSectionInView } from "@/src/lib/hooks";

type ContactFormData = {
  senderEmail: string;
  message: string;
  company?: string;
};

export default function Contact() {
  const { ref } = useSectionInView("#contact");
  const shouldReduceMotion = useReducedMotion();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to send message");
      }

      toast.success("Message sent! I'll get back to you soon.");
      reset();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send message";
      toast.error(message);
    }
  };

  const inputClassName =
    "mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus-ring dark:border-white/10 dark:bg-white/10 dark:text-gray-50 dark:placeholder:text-gray-400";

  return (
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
            className={inputClassName}
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
            <p id="senderEmail-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
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
            className={inputClassName}
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
            <p id="message-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.message.message}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-3">
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
  );
}
