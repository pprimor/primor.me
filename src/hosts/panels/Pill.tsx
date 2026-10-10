import type { ReactNode } from "react";

export type PillTone = "positive" | "notice" | "info";

/** A status badge: coloured text and outline on the panel's own background. */
export default function Pill({ tone, children }: { tone: PillTone; children: ReactNode }) {
  return (
    <span
      className="rounded-full border border-current px-2 text-[10px] leading-4"
      style={{ color: `var(--host-${tone})` }}
    >
      {children}
    </span>
  );
}
