import type { ReactNode } from "react";

export const linkClass =
  "text-term-link underline decoration-term-muted underline-offset-4 hover:decoration-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-term-fg";

export function H1({ children }: { children: ReactNode }) {
  return (
    <h1 className="font-mono text-2xl font-bold leading-tight text-term-heading sm:text-3xl">
      <span aria-hidden="true" className="text-term-muted"># </span>
      {children}
    </h1>
  );
}

export function H2({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2 id={id} className="mt-12 font-mono text-lg font-bold text-term-accent">
      <span aria-hidden="true" className="text-term-muted">## </span>
      {children}
    </h2>
  );
}
