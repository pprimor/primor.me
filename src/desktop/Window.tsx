import { useRef, type PointerEvent, type ReactNode } from "react";
import { TITLE_BAR_HEIGHT, moveBy, resizeBy, type Rect } from "./geometry";

const MIN_SIZE = { width: 320, height: 200 };

type Drag = { kind: "move" | "resize"; startX: number; startY: number; start: Rect };

type WindowProps = {
  id: string;
  title: string;
  rect: Rect;
  desktop: Rect;
  maximized: boolean;
  /** Phones: pinned to the desktop area, no dragging, resizing or maximising. */
  compact: boolean;
  hidden: boolean;
  focused: boolean;
  onRectChange: (rect: Rect) => void;
  onFocus: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onClose: () => void;
  children: ReactNode;
};

function TitleButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      className="x11-button grid h-[18px] w-5 place-items-center leading-none"
    >
      {children}
    </button>
  );
}

export default function Window({
  id,
  title,
  rect,
  desktop,
  maximized,
  compact,
  hidden,
  focused,
  onRectChange,
  onFocus,
  onMinimize,
  onToggleMaximize,
  onClose,
  children,
}: WindowProps) {
  const drag = useRef<Drag | null>(null);
  const fixed = compact || maximized;
  const box = fixed ? desktop : rect;

  function begin(kind: Drag["kind"], event: PointerEvent<HTMLElement>) {
    if (fixed || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { kind, startX: event.clientX, startY: event.clientY, start: rect };
  }

  function update(event: PointerEvent<HTMLElement>) {
    const d = drag.current;
    if (!d) return;
    const dx = event.clientX - d.startX;
    const dy = event.clientY - d.startY;
    onRectChange(
      d.kind === "move"
        ? moveBy(d.start, dx, dy, desktop)
        : resizeBy(d.start, dx, dy, desktop, MIN_SIZE),
    );
  }

  function end() {
    drag.current = null;
  }

  return (
    <section
      role="dialog"
      aria-labelledby={`${id}-title`}
      onPointerDownCapture={onFocus}
      onFocusCapture={onFocus}
      className={`bevel-out absolute flex-col bg-x11-face p-[3px] ${hidden ? "hidden" : "flex"}`}
      style={{ left: box.x, top: box.y, width: box.width, height: box.height }}
    >
      <div
        onPointerDown={(e) => begin("move", e)}
        onPointerMove={update}
        onPointerUp={end}
        onPointerCancel={end}
        onDoubleClick={() => !compact && onToggleMaximize()}
        className={`flex shrink-0 select-none items-center gap-1 px-1 font-ui text-xs font-bold text-white ${
          fixed ? "" : "cursor-grab active:cursor-grabbing"
        }`}
        style={{
          height: TITLE_BAR_HEIGHT - 2,
          background: focused ? "linear-gradient(90deg, #000080, #1084d0)" : "#7b7b7b",
        }}
      >
        <span aria-hidden="true" className="font-mono text-[11px]">
          {">_"}
        </span>
        <h2 id={`${id}-title`} className="min-w-0 flex-1 truncate">
          {title}
        </h2>
        <TitleButton label="Minimise" onClick={onMinimize}>
          <span aria-hidden="true" className="mt-2 block h-[2px] w-2 bg-black" />
        </TitleButton>
        {!compact && (
          <TitleButton label={maximized ? "Restore" : "Maximise"} onClick={onToggleMaximize}>
            <span aria-hidden="true" className="block h-2 w-[9px] border border-t-2 border-black" />
          </TitleButton>
        )}
        <TitleButton label="Close" onClick={onClose}>
          <span aria-hidden="true" className="text-[11px]">✕</span>
        </TitleButton>
      </div>
      <div className="bevel-in mt-[3px] min-h-0 flex-1 p-[2px]">{children}</div>
      {!fixed && (
        <div
          aria-hidden="true"
          onPointerDown={(e) => begin("resize", e)}
          onPointerMove={update}
          onPointerUp={end}
          onPointerCancel={end}
          className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize"
          style={{
            background:
              "linear-gradient(135deg, transparent 45%, #808080 45%, #808080 55%, transparent 55%, transparent 65%, #808080 65%, #808080 75%, transparent 75%)",
          }}
        />
      )}
    </section>
  );
}
