import { PANEL_IDS, type PanelId } from "../hosts/ids";
import { clampRect, initialRect, type Rect, type Size } from "./geometry";
import { windowState, type Desk, type WindowState } from "./windows";

export type Band = "compact" | "medium" | "wide";

export const COMPACT_MAX = 640;
export const WIDE_MIN = 1280;
/** Room kept clear on the left for the desktop icon column. */
export const ICON_COLUMN = 96;
const MARGIN = 16;

export function bandFor(width: number): Band {
  return width < COMPACT_MAX ? "compact" : width < WIDE_MIN ? "medium" : "wide";
}

type Column = { x: number; w: number };

/** Wide-band columns, as fractions of the desktop width. */
const LEFT: Column = { x: 0.1, w: 0.31 };
const LEFT_LOWER: Column = { x: 0.1, w: 0.23 };
const MIDDLE: Column = { x: 0.44, w: 0.22 };
const RIGHT: Column = { x: 0.69, w: 0.3 };

/** Height each window needs to show its content without clipping. */
export const MIN_HEIGHT: Record<"readme" | PanelId, number> = {
  readme: 280,
  photoshop: 430,
  jira: 330,
  canva: 340,
  word: 290,
};
const GAP = 12;

const README_SIZE: Size = { width: 560, height: 340 };
const HIRE_SIZE: Size = { width: 480, height: 480 };
const PANEL_SIZE: Record<PanelId, Size> = {
  photoshop: { width: 320, height: 520 },
  jira: { width: 460, height: 380 },
  canva: { width: 340, height: 460 },
  word: { width: 480, height: 360 },
};

/** Three columns; each column's lower window starts below its upper one. */
function wideRects(desktop: Rect): Record<"readme" | PanelId, Rect> {
  const top = desktop.y + Math.round(desktop.height * 0.03);
  const bottom = desktop.y + Math.round(desktop.height * 0.97);
  const tall = (id: "readme" | PanelId, share: number) =>
    Math.max(Math.round(desktop.height * share), MIN_HEIGHT[id]);
  const place = (c: Column, y: number, height: number): Rect => ({
    x: desktop.x + Math.round(desktop.width * c.x),
    y,
    width: Math.round(desktop.width * c.w),
    height,
  });
  // Below its upper window when there's room; otherwise overlap it upward rather than run off screen.
  const under = (above: Rect, c: Column, id: PanelId) => {
    const y = Math.max(top, Math.min(above.y + above.height + GAP, bottom - MIN_HEIGHT[id]));
    return place(c, y, bottom - y);
  };
  const readme = place(LEFT, top, tall("readme", 0.33));
  const jira = place(RIGHT, top, tall("jira", 0.42));
  const rects = {
    readme,
    photoshop: place(MIDDLE, top, tall("photoshop", 0.56)),
    jira,
    canva: under(readme, LEFT_LOWER, "canva"),
    word: under(jira, RIGHT, "word"),
  };
  return Object.fromEntries(
    Object.entries(rects).map(([id, r]) => [id, clampRect(r, desktop)]),
  ) as Record<"readme" | PanelId, Rect>;
}

/** Icons one column holds; mirrors DesktopIcons' 5rem rows, 0.5rem gaps and 0.75rem margins. */
export function iconRows(desktop: Rect): number {
  return Math.floor((desktop.height - 24 + 8) / 88);
}

function besideIcons(rect: Rect, desktop: Rect): Rect {
  const left = desktop.x + ICON_COLUMN;
  if (rect.x >= left) return rect;
  return { ...rect, x: left, width: Math.min(rect.width, desktop.x + desktop.width - left - MARGIN) };
}

/** Where every window starts: tiled on wide screens, README alone below that. */
export function initialDesk(desktop: Rect): Desk {
  const wide = bandFor(desktop.width) === "wide";
  const tiles = wideRects(desktop);
  const panels = Object.fromEntries(
    PANEL_IDS.map((id, i) => [
      id,
      wide
        ? windowState(tiles[id])
        : windowState(besideIcons(initialRect(desktop, PANEL_SIZE[id], 32 * (i + 1)), desktop), "minimized"),
    ]),
  ) as Record<PanelId, WindowState>;
  const readme = windowState(
    wide ? tiles.readme : besideIcons(initialRect(desktop, README_SIZE), desktop),
  );
  return {
    windows: {
      readme,
      ...panels,
      term: windowState(besideIcons(initialRect(desktop), desktop), "minimized"),
      hire: windowState(besideIcons(initialRect(desktop, HIRE_SIZE, 40), desktop), "closed"),
    },
    // Lower windows first, so an upper window that overlaps one draws above it.
    stack: wide ? ["canva", "word", "photoshop", "jira", "readme"] : ["readme"],
    focused: "readme",
  };
}
