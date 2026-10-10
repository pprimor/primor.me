import { describe, expect, it } from "vitest";
import { PANEL_IDS } from "./ids";
import { contrastRatio, themes, themeStyle } from "./themes";

describe("contrastRatio", () => {
  it("is 21 for black on white and 1 for a colour on itself", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 5);
    expect(contrastRatio("#777777", "#777777")).toBe(1);
  });
});

describe("themes", () => {
  for (const id of PANEL_IDS) {
    const t = themes[id];
    for (const fg of ["text", "muted", "positive", "notice", "info"] as const) {
      for (const bg of ["surface", "raised"] as const) {
        it(`${id}: ${fg} on ${bg} meets AA`, () => {
          expect(contrastRatio(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
        });
      }
    }
    it(`${id}: onAccent on accent meets AA`, () => {
      expect(contrastRatio(t.onAccent, t.accent)).toBeGreaterThanOrEqual(4.5);
    });
  }

  it("exposes theme values as CSS custom properties", () => {
    const style = themeStyle(themes.jira) as Record<string, string>;
    expect(style["--host-accent"]).toBe(themes.jira.accent);
    expect(style["--host-radius"]).toBe(`${themes.jira.radius}px`);
    expect(style.fontFamily).toBe(themes.jira.font);
  });
});
