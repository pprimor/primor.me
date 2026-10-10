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

type Fraction = { x: number; y: number; w: number; h: number };

/** Wide-band tiling, as fractions of the desktop area. */
const WIDE: Record<"readme" | PanelId, Fraction> = {
  readme: { x: 0.1, y: 0.03, w: 0.31, h: 0.33 },
  photoshop: { x: 0.44, y: 0.03, w: 0.22, h: 0.56 },
  jira: { x: 0.69, y: 0.07, w: 0.3, h: 0.42 },
  canva: { x: 0.1, y: 0.39, w: 0.23, h: 0.52 },
  word: { x: 0.69, y: 0.53, w: 0.3, h: 0.4 },
};

const README_SIZE: Size = { width: 560, height: 340 };
const HIRE_SIZE: Size = { width: 480, height: 480 };
const PANEL_SIZE: Record<PanelId, Size> = {
  photoshop: { width: 320, height: 520 },
  jira: { width: 460, height: 380 },
  canva: { width: 340, height: 460 },
  word: { width: 480, height: 360 },
};

function fromFraction(desktop: Rect, f: Fraction): Rect {
  return clampRect(
    {
      x: desktop.x + Math.round(desktop.width * f.x),
      y: desktop.y + Math.round(desktop.height * f.y),
      width: Math.round(desktop.width * f.w),
      height: Math.round(desktop.height * f.h),
    },
    desktop,
  );
}

function besideIcons(rect: Rect, desktop: Rect): Rect {
  const left = desktop.x + ICON_COLUMN;
  if (rect.x >= left) return rect;
  return { ...rect, x: left, width: Math.min(rect.width, desktop.x + desktop.width - left - MARGIN) };
}

/** Where every window starts: tiled on wide screens, README alone below that. */
export function initialDesk(desktop: Rect): Desk {
  const wide = bandFor(desktop.width) === "wide";
  const panels = Object.fromEntries(
    PANEL_IDS.map((id, i) => [
      id,
      wide
        ? windowState(fromFraction(desktop, WIDE[id]))
        : windowState(besideIcons(initialRect(desktop, PANEL_SIZE[id], 32 * (i + 1)), desktop), "minimized"),
    ]),
  ) as Record<PanelId, WindowState>;
  const readme = windowState(
    wide ? fromFraction(desktop, WIDE.readme) : besideIcons(initialRect(desktop, README_SIZE), desktop),
  );
  return {
    windows: {
      readme,
      ...panels,
      term: windowState(besideIcons(initialRect(desktop), desktop), "minimized"),
      hire: windowState(besideIcons(initialRect(desktop, HIRE_SIZE, 40), desktop), "closed"),
    },
    stack: wide ? [...PANEL_IDS, "readme"] : ["readme"],
    focused: "readme",
  };
}
