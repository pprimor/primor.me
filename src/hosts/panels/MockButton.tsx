import type { ReactNode } from "react";

type MockButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
  block?: boolean;
};

/** Looks like the host's button; a span, so it never takes focus. */
export default function MockButton({ children, variant = "primary", block = false }: MockButtonProps) {
  const colours =
    variant === "primary"
      ? "bg-[var(--host-accent)] text-[var(--host-on-accent)]"
      : "bg-[var(--host-raised)] text-[var(--host-text)]";
  return (
    <span
      className={`inline-flex h-8 items-center justify-center rounded-[var(--host-radius)] px-3 text-xs font-semibold ${colours} ${block ? "w-full" : ""}`}
    >
      {children}
    </span>
  );
}
