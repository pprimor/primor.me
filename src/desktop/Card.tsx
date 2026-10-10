import type { ReactNode } from "react";
import { TITLE_ACTIVE, TITLE_INACTIVE } from "./chrome";

type CardProps = {
  id: string;
  title: string;
  glyph?: string;
  active?: boolean;
  className?: string;
  /** Fixed body height in px; content-sized when omitted. */
  height?: number;
  children: ReactNode;
};

/** A window frame that sits in the page flow: no dragging, resizing or title buttons. */
export default function Card({ id, title, glyph, active = false, className = "", height, children }: CardProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="bevel-out scroll-mt-4 bg-x11-face p-[3px]">
      <div
        className="flex h-[22px] items-center gap-1 px-1.5 font-ui text-xs font-bold text-white"
        style={{ background: active ? TITLE_ACTIVE : TITLE_INACTIVE }}
      >
        {glyph && (
          <span aria-hidden="true" className="font-mono text-[11px]">
            {glyph}
          </span>
        )}
        <h2 id={`${id}-title`} className="m-0 truncate text-xs">
          {title}
        </h2>
      </div>
      <div className={`bevel-in mt-[3px] p-[2px] ${className}`} style={{ height }}>
        {children}
      </div>
    </section>
  );
}
