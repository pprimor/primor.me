import { describe, expect, it } from "vitest";
import { PANEL_IDS } from "../hosts/ids";
import type { Rect } from "./geometry";
import { ICON_COLUMN, bandFor, initialDesk } from "./layout";
import { isVisible } from "./windows";

const screen = (width: number, height: number): Rect => ({ x: 0, y: 28, width, height: height - 28 });

function inside(rect: Rect, desktop: Rect) {
  expect(rect.x).toBeGreaterThanOrEqual(desktop.x + ICON_COLUMN);
  expect(rect.x + rect.width).toBeLessThanOrEqual(desktop.x + desktop.width);
  expect(rect.y).toBeGreaterThanOrEqual(desktop.y);
  expect(rect.y + rect.height).toBeLessThanOrEqual(desktop.y + desktop.height);
}

describe("bandFor", () => {
  it("splits at 640 and 1280", () => {
    expect(bandFor(639)).toBe("compact");
    expect(bandFor(640)).toBe("medium");
    expect(bandFor(1279)).toBe("medium");
    expect(bandFor(1280)).toBe("wide");
  });
});

describe("initialDesk", () => {
  it("wide: README focused on top, host windows open, terminal minimised, hire closed", () => {
    const d = initialDesk(screen(1440, 900));
    expect(d.focused).toBe("readme");
    expect(d.stack.at(-1)).toBe("readme");
    for (const id of PANEL_IDS) expect(d.windows[id].mode).toBe("normal");
    expect(d.windows.term.mode).toBe("minimized");
    expect(d.windows.hire.mode).toBe("closed");
  });

  for (const [w, h] of [[1280, 720], [1440, 900], [2560, 1440]] as const) {
    it(`wide ${w}×${h}: open windows fit the desktop, clear of the icon column`, () => {
      const desktop = screen(w, h);
      const d = initialDesk(desktop);
      for (const id of ["readme", ...PANEL_IDS] as const) inside(d.windows[id].rect, desktop);
    });
  }

  it("medium: only README is open; host windows wait in the taskbar", () => {
    const d = initialDesk(screen(1024, 768));
    expect(isVisible(d.windows.readme)).toBe(true);
    expect(d.focused).toBe("readme");
    for (const id of PANEL_IDS) expect(d.windows[id].mode).toBe("minimized");
  });

  it("medium: README stays clear of the icons on a narrow desktop", () => {
    const desktop = screen(700, 800);
    inside(initialDesk(desktop).windows.readme.rect, desktop);
  });

  it("every window starts at its home with session 0", () => {
    for (const w of Object.values(initialDesk(screen(1440, 900)).windows)) {
      expect(w.home).toEqual(w.rect);
      expect(w.session).toBe(0);
    }
  });
});
