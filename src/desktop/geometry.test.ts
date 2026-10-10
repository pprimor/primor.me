import { describe, expect, it } from "vitest";
import {
  TITLE_BAR_HEIGHT,
  VISIBLE_EDGE,
  clampRect,
  formatClock,
  initialRect,
  moveBy,
  resizeBy,
  type Rect,
} from "./geometry";

const desktop: Rect = { x: 0, y: 28, width: 1280, height: 772 };
const min = { width: 320, height: 200 };

describe("initialRect", () => {
  it("centres a 760×520 window on a large desktop", () => {
    expect(initialRect(desktop)).toEqual({
      x: (1280 - 760) / 2,
      y: 28 + (772 - 520) / 2,
      width: 760,
      height: 520,
    });
  });

  it("shrinks to fit a small desktop with a margin", () => {
    const small: Rect = { x: 0, y: 28, width: 600, height: 400 };
    const rect = initialRect(small);
    expect(rect.width).toBe(600 - 32);
    expect(rect.height).toBe(400 - 32);
    expect(rect.x).toBe(16);
    expect(rect.y).toBe(28 + 16);
  });
});

describe("clampRect", () => {
  it("leaves a window that fits untouched", () => {
    const rect = { x: 100, y: 100, width: 400, height: 300 };
    expect(clampRect(rect, desktop)).toEqual(rect);
  });

  it("never lets the title bar go above the desktop", () => {
    expect(clampRect({ x: 100, y: -50, width: 400, height: 300 }, desktop).y).toBe(28);
  });

  it("keeps the title bar reachable at the bottom", () => {
    const rect = clampRect({ x: 100, y: 5000, width: 400, height: 300 }, desktop);
    expect(rect.y).toBe(28 + 772 - TITLE_BAR_HEIGHT);
  });

  it("keeps part of the window visible horizontally", () => {
    expect(clampRect({ x: -5000, y: 100, width: 400, height: 300 }, desktop).x).toBe(
      VISIBLE_EDGE - 400,
    );
    expect(clampRect({ x: 5000, y: 100, width: 400, height: 300 }, desktop).x).toBe(
      1280 - VISIBLE_EDGE,
    );
  });

  it("shrinks a window bigger than the desktop", () => {
    const rect = clampRect({ x: 0, y: 28, width: 2000, height: 2000 }, desktop);
    expect(rect.width).toBe(1280);
    expect(rect.height).toBe(772);
  });
});

describe("moveBy", () => {
  it("moves and clamps", () => {
    const start = { x: 100, y: 100, width: 400, height: 300 };
    expect(moveBy(start, 50, 20, desktop)).toEqual({ ...start, x: 150, y: 120 });
    expect(moveBy(start, 0, -500, desktop).y).toBe(28);
  });
});

describe("resizeBy", () => {
  const start = { x: 100, y: 100, width: 400, height: 300 };

  it("grows from the bottom-right corner", () => {
    expect(resizeBy(start, 40, 60, desktop, min)).toEqual({
      ...start,
      width: 440,
      height: 360,
    });
  });

  it("respects the minimum size", () => {
    const rect = resizeBy(start, -1000, -1000, desktop, min);
    expect(rect.width).toBe(320);
    expect(rect.height).toBe(200);
  });

  it("stops at the desktop's right and bottom edges", () => {
    const rect = resizeBy(start, 5000, 5000, desktop, min);
    expect(rect.x + rect.width).toBe(1280);
    expect(rect.y + rect.height).toBe(28 + 772);
  });
});

describe("formatClock", () => {
  it("zero-pads hours and minutes", () => {
    expect(formatClock(new Date(2026, 9, 11, 6, 5))).toBe("06:05");
    expect(formatClock(new Date(2026, 9, 11, 23, 59))).toBe("23:59");
  });
});
