import { clampRect, type Rect } from "./geometry";
import type { WindowId } from "./ids";
import { raise, type Stack } from "./stacking";

export type WindowMode = "normal" | "maximized" | "minimized" | "closed";

export type WindowState = {
  rect: Rect;
  /** Where the window reopens after being closed. */
  home: Rect;
  mode: WindowMode;
  lastShown: "normal" | "maximized";
  /** Bumped on close so the next open starts fresh (terminal session, form). */
  session: number;
};

export type Desk = {
  windows: Record<WindowId, WindowState>;
  stack: Stack<WindowId>;
  focused: WindowId | null;
};

export type DeskAction =
  | { type: "show" | "focus" | "toggle" | "minimize" | "close" | "toggleMaximize"; id: WindowId }
  | { type: "move"; id: WindowId; rect: Rect }
  | { type: "blur" }
  | { type: "fit"; desktop: Rect };

export function windowState(rect: Rect, mode: WindowMode = "normal"): WindowState {
  return { rect, home: rect, mode, lastShown: "normal", session: 0 };
}

export function isVisible(w: WindowState): boolean {
  return w.mode === "normal" || w.mode === "maximized";
}

function update(desk: Desk, id: WindowId, patch: Partial<WindowState>): Desk {
  return { ...desk, windows: { ...desk.windows, [id]: { ...desk.windows[id], ...patch } } };
}

function focus(desk: Desk, id: WindowId): Desk {
  return { ...desk, focused: id, stack: raise(desk.stack, id) };
}

function show(desk: Desk, id: WindowId): Desk {
  const w = desk.windows[id];
  return focus(update(desk, id, { mode: isVisible(w) ? w.mode : w.lastShown }), id);
}

function hide(desk: Desk, id: WindowId, patch: Partial<WindowState>): Desk {
  const next = update(desk, id, patch);
  return desk.focused === id ? { ...next, focused: null } : next;
}

/** Shrinks a rect to the desktop and moves it fully inside, so a window reopens on screen. */
function fitInside(rect: Rect, desktop: Rect): Rect {
  const width = Math.min(rect.width, desktop.width);
  const height = Math.min(rect.height, desktop.height);
  return {
    x: Math.min(Math.max(rect.x, desktop.x), desktop.x + desktop.width - width),
    y: Math.min(Math.max(rect.y, desktop.y), desktop.y + desktop.height - height),
    width,
    height,
  };
}

export function deskReducer(desk: Desk, action: DeskAction): Desk {
  switch (action.type) {
    case "show":
      return show(desk, action.id);
    case "focus":
      return desk.focused === action.id && desk.stack.at(-1) === action.id
        ? desk
        : focus(desk, action.id);
    case "toggle":
      return isVisible(desk.windows[action.id]) && desk.focused === action.id
        ? hide(desk, action.id, { mode: "minimized" })
        : show(desk, action.id);
    case "minimize":
      return hide(desk, action.id, { mode: "minimized" });
    case "close": {
      const w = desk.windows[action.id];
      return hide(desk, action.id, { mode: "closed", lastShown: "normal", session: w.session + 1, rect: w.home });
    }
    case "toggleMaximize": {
      const next = desk.windows[action.id].mode === "maximized" ? "normal" : "maximized";
      return focus(update(desk, action.id, { mode: next, lastShown: next }), action.id);
    }
    case "move":
      return update(desk, action.id, { rect: action.rect });
    case "blur":
      return desk.focused === null ? desk : { ...desk, focused: null };
    case "fit": {
      const windows = Object.fromEntries(
        Object.entries(desk.windows).map(([id, w]) => [
          id,
          { ...w, rect: clampRect(w.rect, action.desktop), home: fitInside(w.home, action.desktop) },
        ]),
      ) as Record<WindowId, WindowState>;
      return { ...desk, windows };
    }
  }
}
