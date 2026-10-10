export type Rect = { x: number; y: number; width: number; height: number };
export type Size = { width: number; height: number };

export const TITLE_BAR_HEIGHT = 24;
/** How much of a window must stay on screen horizontally so it can be grabbed again. */
export const VISIBLE_EDGE = 80;
const MARGIN = 16;
const PREFERRED: Size = { width: 760, height: 520 };

function clamp(value: number, lo: number, hi: number): number {
  return Math.min(Math.max(value, lo), hi);
}

/** A window centred on the desktop, shrunk to leave a margin on small screens. */
export function initialRect(desktop: Rect): Rect {
  const width = Math.min(PREFERRED.width, desktop.width - MARGIN * 2);
  const height = Math.min(PREFERRED.height, desktop.height - MARGIN * 2);
  return {
    x: desktop.x + (desktop.width - width) / 2,
    y: desktop.y + (desktop.height - height) / 2,
    width,
    height,
  };
}

/** Fits a window to the desktop so its title bar can always be reached. */
export function clampRect(rect: Rect, desktop: Rect): Rect {
  const width = Math.min(rect.width, desktop.width);
  const height = Math.min(rect.height, desktop.height);
  return {
    x: clamp(rect.x, desktop.x + VISIBLE_EDGE - width, desktop.x + desktop.width - VISIBLE_EDGE),
    y: clamp(rect.y, desktop.y, desktop.y + desktop.height - TITLE_BAR_HEIGHT),
    width,
    height,
  };
}

export function moveBy(rect: Rect, dx: number, dy: number, desktop: Rect): Rect {
  return clampRect({ ...rect, x: rect.x + dx, y: rect.y + dy }, desktop);
}

/** Resizes from the bottom-right corner, between `min` and the desktop's far edges. */
export function resizeBy(rect: Rect, dx: number, dy: number, desktop: Rect, min: Size): Rect {
  const maxWidth = Math.max(min.width, desktop.x + desktop.width - rect.x);
  const maxHeight = Math.max(min.height, desktop.y + desktop.height - rect.y);
  return {
    ...rect,
    width: clamp(rect.width + dx, min.width, maxWidth),
    height: clamp(rect.height + dy, min.height, maxHeight),
  };
}

export function formatClock(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
