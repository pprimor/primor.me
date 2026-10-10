import { useEffect, useRef, useState, type ReactNode } from "react";
import { formatClock } from "./geometry";
import { PANEL_HEIGHT } from "./useWindowState";

export type MenuItem =
  | { label: string; icon: ReactNode; onSelect: () => void }
  | { label: string; icon: ReactNode; href: string };

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <time
      dateTime={now.toISOString()}
      className="bevel-in px-2 py-[3px] font-ui text-xs tabular-nums text-black"
    >
      {formatClock(now)}
    </time>
  );
}

function ApplicationsMenu({ items }: { items: readonly MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const itemClass =
    "flex w-full items-center gap-2 px-2 py-1 text-left font-ui text-xs text-black hover:bg-[#000080] hover:text-white focus-visible:bg-[#000080] focus-visible:text-white focus-visible:outline-none [&_svg]:h-4 [&_svg]:w-4";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-pressed={open}
        onClick={() => setOpen((o) => !o)}
        className="x11-button h-[22px] px-2"
      >
        Applications
      </button>
      {open && (
        <ul
          role="menu"
          className="bevel-out absolute left-0 top-full z-50 mt-[2px] min-w-44 bg-x11-face p-[3px]"
        >
          {items.map((item) => (
            <li key={item.label} role="none">
              {"href" in item ? (
                <a
                  role="menuitem"
                  href={item.href}
                  className={itemClass}
                  onClick={() => setOpen(false)}
                  {...(!item.href.startsWith("mailto:") && {
                    target: "_blank",
                    rel: "noopener noreferrer",
                  })}
                >
                  {item.icon}
                  {item.label}
                </a>
              ) : (
                <button
                  type="button"
                  role="menuitem"
                  className={itemClass}
                  onClick={() => {
                    setOpen(false);
                    item.onSelect();
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type PanelProps = {
  menu: readonly MenuItem[];
  /** The taskbar entry for the terminal, or null when it's closed. */
  task: { label: string; pressed: boolean; onClick: () => void } | null;
};

export default function Panel({ menu, task }: PanelProps) {
  return (
    <nav
      aria-label="Panel"
      className="bevel-out fixed inset-x-0 top-0 z-40 flex items-center gap-1 bg-x11-face px-1"
      style={{ height: PANEL_HEIGHT }}
    >
      <ApplicationsMenu items={menu} />
      {task && (
        <button
          type="button"
          aria-pressed={task.pressed}
          onClick={task.onClick}
          className="x11-button h-[22px] min-w-0 max-w-48 truncate px-2 font-normal"
        >
          {task.label}
        </button>
      )}
      <div className="ml-auto">
        <Clock />
      </div>
    </nav>
  );
}
